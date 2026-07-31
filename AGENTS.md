# Contrato operativo

## Fuente de verdad y responsabilidades

La conversación activa, las consignas aprobadas y los documentos versionados de cambio constituyen la fuente de verdad. Ante contradicción o decisión no autorizada, detenerse e informar.

- Codex es el implementador principal.
- Cursor se limita a auditoría, integración y diagnóstico.
- Codex y Cursor nunca editan simultáneamente.
- Cada intervención comienza desde Git limpio y registra inicio y fin.

## Arquitectura congelada

El Sistema de Gestión de Prestadores utiliza React, TypeScript, Vite, Material UI, React Hook Form, Zod y `fetch` nativo en frontend; Node.js, Express, TypeScript, Zod y Prisma en backend; PostgreSQL como persistencia.

Docker Compose contiene exactamente `app` y `db`. Express sirve `/api/*`, el frontend compilado y el fallback SPA desde el mismo origen. PostgreSQL no publica su puerto al host en el Compose principal.

No cambiar arquitectura, dependencias, schema, migraciones, servicios Docker ni contratos públicos sin autorización expresa.

## Línea base y Git

- V1 aprobada: `91df3e5b300fba1d050ef9250164849852d3ef9a`.
- V1 contiene cuatro commits y no debe reescribirse.
- Rama de implementación V2: `v2/implementacion`.
- No usar amend, rebase destructivo, squash retrospectivo ni force push.
- No publicar V2 hasta completar implementación, TP-006, aceptación y autorización específicas.
- No versionar secretos, `.env`, dependencias, builds, coverage, logs, datos ni archivos privados de IDE.

## Funcionalidad V1 vigente

`Provider` implementa listado, búsqueda, filtros, paginación, alta, edición, baja lógica y reactivación en API e interfaz responsive. El debounce de búsqueda es 300 ms.

- CUIT obligatorio, único y normalizado a 11 dígitos.
- Razón social y email válido obligatorios.
- Estado `ACTIVE` o `INACTIVE`; el inicial es `ACTIVE`.
- No existe `DELETE`.
- Endpoints: `GET /api/providers`, `POST /api/providers`, `PUT /api/providers/:id` y `PATCH /api/providers/:id/status`.
- `PUT` no cambia estado.
- Búsqueda parcial de razón social, insensible a mayúsculas, y búsqueda por CUIT normalizado.
- Paginación: `page=1`, `pageSize=10`, máximo 100.
- Orden: `businessName ASC`, `id ASC`.
- Base lógica de pruebas: `providers_test`.

Contrato paginado: `{"items":[],"pagination":{"page":1,"pageSize":10,"totalItems":0,"totalPages":0}}`.

Errores: `{"error":{"code":"STABLE_ERROR_CODE","message":"Mensaje legible","details":{}}}`.

El health check verifica proceso y conectividad real con PostgreSQL.

## Requisitos V2 aprobados

### V2-REQ-001 — CUIT

- Formato visual y parcial `XX-XXXXXXXX-X` en alta, edición, tabla y tarjetas.
- Entrada y pegado saneados; máximo 11 dígitos.
- API y PostgreSQL reciben exactamente 11 dígitos.
- Búsqueda y unicidad invariantes.
- Sin validación de dígito verificador ni dependencia nueva.

### V2-REQ-002 — Teléfono

- Solo dígitos, tipo `string`, ceros iniciales preservados.
- Opcional; vacío a `null`.
- Máximo 30 dígitos; el exceso se rechaza sin truncamiento silencioso.
- Normalización defensiva backend.
- Sin máscara, validación regional ni dependencia nueva.

### V2-REQ-003 — Dataset

- Dataset inicial administrado de 30 miembros: 20 `ACTIVE`, 10 `INACTIVE`.
- Conservar los tres seeds V1 y agregar 27.
- CUIT únicos, correos válidos, nombres diferenciables y datos ficticios deterministas.
- Seed idempotente y sin eliminación de datos ajenos.
- Tres páginas completas con `pageSize=10`.
- Sin schema, migración, API ni lógica de paginación nuevos.

## Contratos invariantes V2

- Endpoints, requests, responses y errores públicos no cambian.
- No existe `DELETE`; se conserva baja lógica y reactivación.
- CUIT obligatorio, único y persistido como 11 dígitos; sin validación matemática.
- Teléfono `string | null`, solo dígitos y máximo 30.
- `POST` crea `ACTIVE`; `PUT` no modifica estado.
- Paginación, orden, schema, migraciones, Compose y mismo origen permanecen intactos.
- Cero dependencias nuevas y cero borrados de datos ajenos.

## Alcance y seguridad

No implementar módulos, endpoints o mejoras fuera del cambio autorizado. Validar toda entrada en frontend por experiencia de usuario y nuevamente en backend como límite de confianza. No exponer credenciales ni datos personales. Toda limpieza debe identificar exactamente recursos y registros autorizados.

## Pruebas y Docker

Comandos mínimos: `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run test:unit`, `npm.cmd test`, `npm.cmd run build`, `npm.cmd run db:generate` y los gates Docker autorizados.

TP-006 es obligatorio para V2:

- el protocolo se versiona antes de implementar;
- no se registran resultados anticipados;
- el informe se completa después de ejecutar;
- se prueban volumen vacío, volumen V1, idempotencia, datos ajenos, desktop y mobile;
- Docker debe quedar en el estado final indicado por cada tarea.

## Telemetría y errores

Cada tarea informa inicio, fin, duración total y activa, intentos, bloqueos, errores, ciclos de corrección, comandos, archivos y retrabajo. No inventar métricas ausentes.

Clasificar errores con: `REQ`, `ARC`, `TEC`, `ENV`, `IMP`, `INT`, `TST`, `DAT`, `SEC`, `DOC`, `OPS`, `AIT`, `GIT` o `INF`.

El informe debe incluir resultado, resumen, archivos, dependencias, validaciones, Docker, Git, desviaciones, errores/correcciones, tiempo y continuidad.

## Límite operativo V2

- Objetivo: 8–12 horas activas.
- Revisar alcance y riesgos al alcanzar 14 horas.
- Detenerse a las 16 horas sin nueva autorización.
- Contingencia máxima estimada: 21–23 horas, sujeta a autorización.
