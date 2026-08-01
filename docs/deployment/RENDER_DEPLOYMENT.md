# Despliegue de demostración en Render

## Propósito y estado

Esta guía describe cómo crear y operar una demostración descartable del Sistema de Gestión de Prestadores mediante el Blueprint versionado en `render.yaml`. V2.1-01 preparó la configuración y posteriormente se creó y validó una instancia pública. No representa infraestructura productiva.

## Instancia de demostración creada

- URL pública: <https://sistema-gestion-prestadores.onrender.com>
- Blueprint: `sistema-gestion-prestadores-demo`
- Web Service: `sistema-gestion-prestadores`
- Base: `sistema-gestion-prestadores-db`, estado `Available`
- Proveedor y runtime: Render, Docker
- Región: Virginia (US East)
- Planes: Web Service `Free` y PostgreSQL `Free`
- PostgreSQL: 18
- Health validado: HTTP 200 con `{"status":"ok","database":"up"}`
- Fecha local de validación: 2026-07-31
- Commit del primer deploy validado: `ab400ad4b5a8e4d8733894682f58454f9225aa17`
- Expiración informada por Render para la base: 2026-08-30

La instancia es temporal, puede experimentar *cold start* y no debe tratarse como infraestructura productiva. El detalle de los controles observados se encuentra en [`RENDER_DEPLOYMENT_VALIDATION.md`](RENDER_DEPLOYMENT_VALIDATION.md).

## Arquitectura prevista

El Blueprint declara dos recursos gratuitos en la región `virginia`:

- un Web Service Docker llamado `sistema-gestion-prestadores`;
- una instancia Render Postgres llamada `sistema-gestion-prestadores-db`.

El Web Service construye el `Dockerfile` multietapa del repositorio. El mismo proceso Express sirve la API, Swagger UI y el frontend compilado. La base solo recibe conexiones del servicio mediante la red privada de Render: `DATABASE_URL` toma `connectionString` desde la base declarada y `ipAllowList: []` bloquea conexiones públicas a PostgreSQL.

Virginia es una región soportada y una elección razonable entre las regiones disponibles para una demo operada desde Argentina. Aplicación y base deben permanecer en la misma región para utilizar la red privada; Render no permite cambiar la región de un recurso existente.

## Separación entre local y cloud

El entorno local continúa usando `compose.yaml`, los servicios `app` y `db`, el puerto local `3000` y el volumen Docker del proyecto. Render no usa Docker Compose: construye el `Dockerfile`, proporciona `PORT` y crea una base administrada independiente. Ningún dato ni volumen local se transfiere automáticamente al entorno cloud.

## Prerrequisitos

Antes de crear recursos:

1. fusionar y publicar el cambio aprobado en la rama `main` del repositorio remoto;
2. disponer de una cuenta Render con acceso al repositorio Git;
3. comprobar que el workspace no tenga ya la única base Postgres gratuita permitida;
4. revisar los límites, costos potenciales y región seleccionada;
5. validar el Blueprint con Render CLI 2.7.0 o posterior, o con la validación del flujo de creación;
6. confirmar que el repositorio no contiene archivos `.env`, credenciales ni datos personales.

## Qué configura `render.yaml`

El servicio web usa:

- `type: web`, `runtime: docker` y `plan: free`;
- la rama `main`, el `Dockerfile` raíz y el contexto del repositorio;
- `/api/health` como health check;
- `autoDeployTrigger: off`, por lo que los despliegues posteriores son manuales;
- `NODE_ENV=production`;
- `DATABASE_URL` obtenida de la conexión privada de la base.

No se fija `PORT`: Render lo suministra en tiempo de ejecución y Express escucha ese valor sobre `0.0.0.0`. El valor local continúa siendo `3000` cuando así lo define Compose.

La base usa PostgreSQL 18, igual que el entorno local validado. Prisma 6.19.3, el esquema y la migración existentes son compatibles con esa versión. La especificación actual de Render también identifica 18 como su versión soportada más reciente. El acceso público se deshabilita; esto no impide la conexión privada desde el Web Service de la misma región.

## Variables y secretos

`NODE_ENV` es configuración no sensible. `DATABASE_URL` no contiene un literal versionado: Render la genera desde `sistema-gestion-prestadores-db` y la inyecta como variable de entorno. No se debe copiar su valor al repositorio, a incidencias, capturas o documentación.

El Blueprint no solicita otras variables. Render proporciona `PORT`; no debe agregarse un valor fijo.

## Migraciones y dataset inicial

El comando de inicio del contenedor ejecuta, en orden:

1. `prisma migrate deploy`;
2. `prisma db seed`;
3. el servidor Node compilado.

El seed es idempotente: administra 30 prestadores ficticios mediante `upsert`, conserva registros ajenos y no elimina datos. Un reinicio o redeploy puede volver a ejecutarlo sin duplicar el dataset administrado. No ejecutar el seed manualmente durante la primera verificación.

## Creación controlada

Para crear o recrear una instancia de forma controlada:

1. abrir el Dashboard de Render y elegir **New > Blueprint**;
2. conectar el repositorio que ya contiene el cambio en `main`;
3. seleccionar el archivo raíz `render.yaml`;
4. revisar que el plan de recursos muestre exactamente un Web Service Docker y una base Postgres;
5. verificar nombres, región `virginia`, planes `free`, PostgreSQL 18, auto-deploy desactivado y ninguna variable pendiente;
6. ejecutar la validación del Blueprint;
7. recién con autorización explícita, confirmar la creación;
8. esperar la base disponible, el build Docker, migración, seed y health check.

No iniciar sesión, crear recursos ni confirmar el Blueprint como parte de una validación local.

## Verificación del primer deploy

Copiar del Dashboard la URL real asignada al servicio; no registrar una dirección hipotética. Verificar sobre ese origen:

- `/api/health` responde HTTP 200 con proceso y base disponibles;
- `/` entrega el frontend;
- `/api/openapi.json` entrega OpenAPI 3.0.4 como JSON;
- `/api/docs` redirige a `/api/docs/` y la ruta canónica entrega Swagger UI;
- `/api/providers?page=1&pageSize=100` informa 30 registros;
- los filtros informan 20 `ACTIVE` y 10 `INACTIVE`;
- la paginación con tamaño 10 informa tres páginas;
- no aparecen respuestas 500.

La API carece de autenticación. La verificación debe usar únicamente los datos ficticios incluidos y no debe cargar información personal o sensible.

## Health check y logs

Render consulta `/api/health`. El endpoint ejecuta una consulta real contra PostgreSQL: una respuesta no saludable impide considerar operativo el deploy.

Desde las páginas **Events** y **Logs** del servicio, comprobar:

- construcción Docker sin errores;
- aplicación de la migración existente;
- finalización del seed;
- escucha en el `PORT` proporcionado;
- health checks exitosos;
- ausencia de credenciales impresas.

Los logs de la base se inspeccionan desde el recurso Postgres. No copiarlos a archivos versionados si contienen metadatos sensibles.

## Redeploy manual

Como `autoDeployTrigger` está desactivado, un push a `main` no despliega por sí solo. Después de aprobar una versión, abrir **Events > Manual Deploy** y elegir **Deploy latest commit**. Para reproducir un commit concreto puede usarse la opción correspondiente, registrando su hash y manteniendo el auto-deploy desactivado.

## Rollback

Para revertir código, abrir **Events**, seleccionar uno de los despliegues exitosos retenidos y elegir **Rollback to this deploy**. El plan gratuito conserva solo los dos despliegues exitosos anteriores aptos para rollback. Un rollback del servicio no revierte datos ni migraciones de PostgreSQL; antes de cualquier cambio de datos se necesita un procedimiento específico y una copia recuperable.

Si el artefacto anterior no está disponible, desplegar manualmente un commit aprobado. Verificar luego health, frontend, Swagger, API y dataset.

## Restauración del dataset

El plan gratuito no ofrece backups administrados. Si la base expira o se elimina, crear una base nueva mediante un Blueprint validado y permitir que el arranque aplique migraciones y el seed idempotente. Esto restaura únicamente los 30 datos ficticios administrados; cualquier registro agregado después se pierde si no existe una exportación autorizada.

No intentar reconstruir datos personales: esta demo debe contener exclusivamente información ficticia.

## Eliminación de recursos

La eliminación es destructiva y requiere autorización separada:

1. identificar exactamente el Web Service y la base de esta demo;
2. conservar solo las exportaciones autorizadas que sean necesarias;
3. eliminar primero el servicio web para detener nuevas conexiones;
4. eliminar la base desde su página de configuración;
5. confirmar en el Dashboard que no quedan recursos ni cargos asociados.

La eliminación de la base y su expiración pueden hacer irrecuperables los datos.

## Limitaciones y riesgos del plan gratuito

- el Web Service se suspende después de 15 minutos sin tráfico y su reactivación puede demorar cerca de un minuto;
- el filesystem del servicio es efímero;
- existe un cupo mensual de horas, ancho de banda y minutos de build;
- el Web Service puede reiniciarse y no admite disco persistente ni escalado múltiple;
- solo puede existir una base Postgres gratuita por workspace;
- la base tiene 1 GB, expira a los 30 días y se elimina tras el período de gracia si no se actualiza el plan;
- Postgres gratuito no incluye backups ni connection pooling administrado;
- el entorno es descartable y no tiene garantías productivas.

La API queda públicamente accesible y no implementa autenticación ni autorización. Por ello esta preparación es apta solo para evaluación con datos ficticios; no debe exponerse a información real ni presentarse como producción.

## Validación local y evidencia pública

V2.1-01 realizó validación YAML y control estructural contra el esquema oficial. Ante futuras modificaciones del Blueprint, debe repetirse una validación con Render CLI 2.7.0 o posterior, o mediante el flujo oficial de creación:

```powershell
render blueprints validate render.yaml
```

La validación oficial no sustituye el smoke test. La instancia pública fue verificada y su evidencia está registrada en [`RENDER_DEPLOYMENT_VALIDATION.md`](RENDER_DEPLOYMENT_VALIDATION.md).

## Fuentes oficiales consultadas

- [Blueprint YAML Reference](https://render.com/docs/blueprint-spec)
- [Web Services y port binding](https://render.com/docs/web-services)
- [Docker on Render](https://render.com/docs/docker)
- [Environment Variables and Secrets](https://render.com/docs/configure-environment-variables)
- [Regiones](https://render.com/docs/regions)
- [Limitaciones gratuitas](https://render.com/docs/free)
- [Deploys manuales](https://render.com/docs/deploys)
- [Rollbacks](https://render.com/docs/rollbacks)
- [Health Checks](https://render.com/docs/health-checks)