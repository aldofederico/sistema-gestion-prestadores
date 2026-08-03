# Arquitectura del sistema

Estado: `VIGENTE` para `main` en V2.2. Esta descripción representa la
implementación existente; no es una arquitectura objetivo.

## Vista general

El producto es un **monolito modular full stack**. React compila una SPA y
Express sirve tanto la interfaz como la API REST desde el mismo origen. Prisma
accede a PostgreSQL. Docker Compose reproduce el entorno local con exactamente
dos servicios, mientras Render aloja una instancia de demostración equivalente.

- [Fuente Mermaid](diagrams/system-architecture.mmd)
- [Diagrama SVG](diagrams/system-architecture.svg)

## Componentes y límites

| Componente | Responsabilidad | Dependencias directas |
|---|---|---|
| `client/` | Listado, búsqueda, filtros, paginación, formularios, baja lógica, reactivación y presentación responsive | React, Material UI, React Hook Form, Zod y `fetch` |
| `server/src/providers/` | Validación de entrada, normalización, casos de uso y persistencia de prestadores | Express, Zod, Prisma |
| `server/src/health/` | Verificar proceso y conectividad real con PostgreSQL | Prisma |
| `server/src/openapi/` | Publicar OpenAPI JSON y Swagger UI desde el mismo proceso | Swagger UI Express |
| `server/src/middleware/` | Validación de requests y contrato uniforme de errores | Express, Zod |
| `prisma/` | Modelo, migración inicial y seed determinista/idempotente | PostgreSQL |
| `scripts/` | Arranque del contenedor, limpieza y suite con base aislada | Node.js, Docker Compose |

No hay servicios de dominio separados, bus de eventos, cache, almacenamiento de
archivos ni procesos en segundo plano.

## Flujos principales

### Consulta

1. La SPA solicita `GET /api/providers` con búsqueda, estado y paginación.
2. Zod valida y aplica valores por defecto.
3. El servicio construye un filtro Prisma y ejecuta listado y conteo dentro de
   una transacción `RepeatableRead`.
4. La API devuelve `items` y metadatos de paginación; la SPA descarta respuestas
   obsoletas y presenta tabla o tarjetas según el viewport.

### Mutación

1. La SPA valida para feedback inmediato y envía `POST`, `PUT` o `PATCH`.
2. El backend vuelve a validar como límite de confianza y normaliza CUIT,
   correo, opcionales y teléfono.
3. Prisma persiste la operación. Los errores conocidos se traducen al contrato
   estable de la API.
4. La interfaz invalida la consulta visible, informa el resultado y restaura el
   foco. No existe `DELETE`: la baja cambia el estado a `INACTIVE`.

### Arranque

El contenedor espera a PostgreSQL, aplica `prisma migrate deploy`, ejecuta el
seed idempotente e inicia Express. Esta secuencia favorece la demo reproducible,
pero acopla migración y seed al startup; es una limitación aceptada para este
alcance, no un patrón recomendado para producción crítica.

## API y datos

Los endpoints vigentes son:

| Método | Ruta | Efecto |
|---|---|---|
| `GET` | `/api/health` | Salud del proceso y la base |
| `GET` | `/api/providers` | Listado, búsqueda, filtro y paginación |
| `POST` | `/api/providers` | Alta con estado inicial `ACTIVE` |
| `PUT` | `/api/providers/:id` | Reemplazo de campos editables; conserva estado |
| `PATCH` | `/api/providers/:id/status` | Baja lógica o reactivación |

`Provider` usa UUID, CUIT único de 11 dígitos, razón social, ubicación y
contacto opcionales, correo obligatorio, estado y timestamps. Los índices por
estado y razón social apoyan los filtros principales. El contrato detallado se
sirve en `/api/openapi.json`; el esquema Prisma es la fuente de verdad del
modelo persistido.

## Ambientes

| Ambiente | Topología | Aislamiento y uso |
|---|---|---|
| Desarrollo Node | Vite y Express en procesos locales | Iteración rápida; requiere `DATABASE_URL` |
| Docker local | `app` + `db`, puerto público `3000` | Camino reproducible de evaluación; PostgreSQL no publica puerto |
| Pruebas | Compose `sistema-gestion-prestadores-test`, DB lógica `providers_test`, puerto loopback `5433` | No usa la base de desarrollo; el script retira sus recursos |
| Render | Web Service Docker + Render Postgres | Demo temporal con datos ficticios; no productiva |

## Decisiones y patrones

- **Mismo origen:** evita CORS y reduce configuración para una entrega pequeña.
- **Monolito modular:** separa interfaz, API, persistencia y documentación sin
  costo operativo de servicios distribuidos.
- **Validación en dos límites:** frontend mejora UX; backend conserva autoridad.
- **Valor canónico:** CUIT y teléfono se normalizan antes de persistir; la
  presentación formateada pertenece a la interfaz.
- **Baja lógica reversible:** preserva el registro y permite reactivación.
- **Seed administrado:** `upsert` por CUIT crea 30 datos ficticios, no duplica y
  no elimina registros ajenos.
- **Health significativo:** consulta PostgreSQL y no sólo el proceso Node.

## Seguridad y operación

Controles implementados: validación estricta de requests, errores sin stack,
`x-powered-by` deshabilitado, secretos por variables, PostgreSQL sin puerto en
el Compose principal y datos de demo ficticios.

La API de demo permite mutaciones sin autenticación ni autorización. Tampoco
incluye rate limiting, request ID, logging estructurado, observabilidad
avanzada, backups productivos o hardening integral. Estas brechas son riesgos
aceptados de una demo y deben resolverse antes de usar datos reales o exponer un
entorno productivo.

## Escalabilidad, deuda y límites

La aplicación puede replicar el proceso web si comparte PostgreSQL, pero no se
ha configurado escalado horizontal. La búsqueda parcial, el build del frontend
por encima de 500 KB, el migrate/seed en startup y la falta de telemetría son
hotspots conocidos. La paginación limita el volumen por request, pero no prueba
capacidad a gran escala.

Si el producto deja de ser una demo, las prioridades son autenticación y
autorización, separación de migraciones del startup, observabilidad mínima,
política de backup/restore y validación de rendimiento. Microservicios o
infraestructura distribuida no están justificados por el alcance actual.

## Fuentes relacionadas

- [README](../../README.md)
- [Estrategia de calidad](../quality/QUALITY_STRATEGY.md)
- [Despliegue Render](../deployment/RENDER_DEPLOYMENT.md)
- [Requisitos y trazabilidad](../product/REQUIREMENTS_TRACEABILITY.md)
- [Índice documental](../INDEX.md)
