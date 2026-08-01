# Validación del despliegue público en Render

## 1. Identificación

- Proyecto: Challenge Best Practice IT — Sistema de Gestión de Prestadores
- Fecha local: 2026-07-31
- URL: <https://sistema-gestion-prestadores.onrender.com>
- Blueprint: `sistema-gestion-prestadores-demo`
- Web Service: `sistema-gestion-prestadores`
- Base: `sistema-gestion-prestadores-db`
- Commit inicial desplegado: `ab400ad4b5a8e4d8733894682f58454f9225aa17`

## 2. Infraestructura observada

- Runtime Docker sobre Render Free.
- Render Postgres Free con PostgreSQL 18.
- Región Virginia (US East).
- Base en estado `Available`.
- Acceso público mediante HTTPS.

## 3. Controles ejecutados

| Control | Resultado |
|---|---|
| Aplicación pública | PASS — HTTPS accesible |
| Health | PASS — HTTP 200 |
| Conexión con PostgreSQL | PASS — `database: up` |
| Swagger | PASS — interfaz pública accesible |
| Redirección Swagger | PASS — `/api/docs` redirige a `/api/docs/` |
| OpenAPI | PASS — versión 3.0.4 accesible como JSON |
| Dataset | PASS — 30 total, 20 ACTIVE y 10 INACTIVE |
| Búsqueda por razón social | PASS |
| Búsqueda por CUIT formateado | PASS |
| Filtro ACTIVE | PASS — 20 resultados |
| Filtro INACTIVE | PASS — 10 resultados |
| Responsive mobile | PASS — presentación mediante tarjetas |
| Ausencia de escrituras durante el smoke test | PASS |

## 4. Evidencia funcional

- La búsqueda `Clínica Río Claro` devuelve un único resultado.
- El CUIT `30-70000001-9` devuelve `Clínica Río Claro SA`.
- El filtro `ACTIVE` devuelve 20 registros.
- El filtro `INACTIVE` devuelve 10 registros.
- La vista mobile utiliza tarjetas.
- Swagger UI y OpenAPI son accesibles públicamente.

## 5. Observaciones

1. No se ejecutaron escrituras públicas para preservar el dataset.
2. La paginación pública se apoya en pruebas automáticas y QA local, además del dataset publicado de 30 registros.
3. El servicio puede experimentar *cold start*.
4. La base gratuita expira el 2026-08-30.
5. La API pública no tiene autenticación.
6. La demo no es productiva.

## 6. Resultado

RESULTADO: `PASS_WITH_OBSERVATIONS`

Estado: `DEPLOYED_AND_VALIDATED`

Defectos abiertos: 0

Entrega: `READY_FOR_FINAL_DOCUMENTATION`
