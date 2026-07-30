# Sistema de Gestión de Prestadores

Aplicación funcional completa para gestionar prestadores. Incluye interfaz React
responsive, API Express, persistencia PostgreSQL, migraciones, seed y pruebas
automatizadas de frontend y backend.

## Stack y arquitectura

- React, TypeScript, Vite y Material UI.
- Node.js, Express, Zod y Prisma.
- PostgreSQL.
- Docker Compose con dos servicios: `app` y `db`.

El contenedor `app` sirve la API y el frontend compilado desde un único origen.
PostgreSQL permanece accesible solo dentro de la red de Compose.

## Requisitos y ejecución principal

- Node.js 24.x y npm.
- Docker Engine con Docker Compose.

```powershell
docker compose up --build
```

La primera construcción puede demorar por la descarga de imágenes y
dependencias. Una vez saludable:

- Frontend: <http://localhost:3000>
- Health: <http://localhost:3000/api/health>

Para detener los servicios y conservar los datos:

```powershell
docker compose down
```

## Comandos npm

| Comando | Propósito |
| --- | --- |
| `npm.cmd run dev` | Frontend y backend en desarrollo |
| `npm.cmd run clean` | Elimina artefactos de compilación |
| `npm.cmd run build` | Compila frontend y backend |
| `npm.cmd start` | Inicia el backend compilado |
| `npm.cmd run lint` | Analiza el repositorio |
| `npm.cmd run typecheck` | Valida TypeScript estricto |
| `npm.cmd run test:unit` | Ejecuta las pruebas rápidas de frontend y health |
| `npm.cmd test` | Ejecuta la suite completa con PostgreSQL aislado |
| `npm.cmd run db:generate` | Genera Prisma Client |
| `npm.cmd run db:migrate:deploy` | Aplica migraciones pendientes |
| `npm.cmd run db:seed` | Ejecuta el seed idempotente |
| `npm.cmd run docker:up` | Construye e inicia Compose |
| `npm.cmd run docker:down` | Detiene Compose |

## Interfaz funcional

En <http://localhost:3000> se puede listar, buscar, filtrar y paginar
prestadores; crear y editar sus datos; y confirmar su desactivación o
reactivación. La búsqueda aplica debounce de 300 ms y la presentación utiliza
una tabla en escritorio y tarjetas en móvil, sin depender de scroll horizontal.
Los formularios muestran validaciones locales y errores uniformes del servidor.
## API de prestadores

La API funcional está disponible bajo `/api/providers`:

| Método | Ruta | Responsabilidad |
| --- | --- | --- |
| `GET` | `/api/providers` | Listado, búsqueda, filtro y paginación |
| `POST` | `/api/providers` | Alta con estado inicial `ACTIVE` |
| `PUT` | `/api/providers/:id` | Reemplazo de campos editables |
| `PATCH` | `/api/providers/:id/status` | Baja lógica o reactivación |

Ejemplos: `/api/providers?search=20-123&page=1&pageSize=10` y
`/api/providers?status=ACTIVE&page=1&pageSize=10`. El listado devuelve
`{"items":[],"pagination":{"page":1,"pageSize":10,"totalItems":0,"totalPages":0}}`.
Los errores usan
`{"error":{"code":"STABLE_ERROR_CODE","message":"Mensaje legible","details":{}}}`.
No existe endpoint `DELETE`.

Las pruebas completas se ejecutan con `npm.cmd test`. El orquestador inicia el
servicio `db`, crea si hace falta la base lógica aislada `providers_test`, aplica
migraciones, ejecuta Vitest y detiene los recursos de test conservando el
volumen. La base `providers` no se utiliza en pruebas de integración.

## Persistencia

Las migraciones versionadas viven en `prisma/migrations`. Al iniciar el
contenedor, primero se ejecuta `prisma migrate deploy`, luego el seed idempotente
y, solo si ambos terminan bien, Express. El seed crea tres prestadores ficticios
mediante `upsert` por CUIT.

## Pruebas

Vitest y React Testing Library cubren carga, búsqueda, filtros, paginación,
formularios, validaciones, mutaciones, feedback y vistas responsive. La suite
completa conserva además las pruebas de integración reales contra PostgreSQL.

## Estructura

- `client/`: aplicación React.
- `server/`: aplicación Express y prueba de health.
- `prisma/`: esquema, migraciones y seed.
- `scripts/`: limpieza multiplataforma e inicio del contenedor.

## Limitaciones actuales

No existe eliminación física ni endpoint `DELETE`. Deliberadamente no se incluyen
routing, autenticación, Swagger, CI/CD ni despliegue.
