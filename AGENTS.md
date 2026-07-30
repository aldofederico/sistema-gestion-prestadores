# Contrato operativo

## Propósito y arquitectura

Este repositorio construye el Sistema de Gestión de Prestadores. El stack está
congelado: React, TypeScript, Vite, Material UI, React Hook Form, Zod y `fetch`
nativo en frontend; Node.js, Express, TypeScript, Zod y Prisma en backend;
PostgreSQL como persistencia. Docker Compose contiene exactamente `app` y `db`.
Express sirve `/api/*`, el frontend compilado y el fallback SPA desde el mismo
origen.

## Alcance funcional futuro

La API de `Provider` implementa listado, búsqueda, filtros, paginación, alta,
edición, baja lógica y reactivación. El frontend funcional sigue pendiente. No
implementar módulos futuros sin autorización.

- CUIT obligatorio, único y normalizado a 11 dígitos.
- Razón social y email válido son obligatorios.
- Estado `ACTIVE` o `INACTIVE`; el inicial es `ACTIVE`.
- No usar `DELETE`. La reactivación está permitida.
- Endpoints definitivos: `GET /api/providers`, `POST /api/providers`,
  `PUT /api/providers/:id` y `PATCH /api/providers/:id/status`.
- `PUT` no cambia estado; solo `PATCH /api/providers/:id/status`.
- Búsqueda parcial de razón social, insensible a mayúsculas.
- Paginación: `page=1`, `pageSize=10`, máximo 100.
- Orden estable: `businessName ASC`, `id ASC`.
- Debounce frontend futuro: 300 ms.
- Base lógica de pruebas futura: `providers_test`.

Contrato paginado:
`{"items":[],"pagination":{"page":1,"pageSize":10,"totalItems":0,"totalPages":0}}`.

Errores:
`{"error":{"code":"STABLE_ERROR_CODE","message":"Mensaje legible","details":{}}}`.

El health check verifica proceso y conectividad real con PostgreSQL.

## Operación

Comandos obligatorios: `npm.cmd run lint`, `npm.cmd run typecheck`,
`npm.cmd test`, `npm.cmd run build`, `npm.cmd run db:generate` y
`docker compose up --build`.

No agregar dependencias ni ampliar alcance sin aprobación. Ante una decisión no
aprobada, detenerse e informar. Codex es el ejecutor principal; Cursor se limita
a integración y diagnóstico. Nunca deben editar simultáneamente. Cada
intervención comienza desde Git limpio.

El informe de agentes debe indicar resultado, resumen, archivos, dependencias,
validaciones, Docker, Git, desviaciones, errores/correcciones, tiempo y
continuidad.
