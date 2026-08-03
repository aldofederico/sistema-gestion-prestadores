# Estrategia de calidad

Estado: `VIGENTE`. Esta estrategia define cómo validar el producto actual; los
protocolos e informes históricos conservan qué se planificó y qué ocurrió en
campañas específicas.

## Objetivo

Demostrar que las funciones obligatorias, los contratos, los datos y la
operación reproducible cumplen sus criterios sin confundir cantidad de pruebas
con calidad. El riesgo principal de la demo es una mutación incorrecta o una
evidencia contaminada por ambiente/datos; el mayor límite aceptado es la API
pública sin autenticación.

## Capas de verificación

| Capa | Cobertura | Herramienta/comando |
|---|---|---|
| Estática | Estilo, errores TypeScript y contratos compilables | `npm run lint`, `npm run typecheck`, `npm run build` |
| Unitaria | Normalización, UI, formularios, feedback y health aislado | `npm run test:unit` |
| Integración | API, Zod, Prisma, PostgreSQL, errores y OpenAPI/Swagger | `npm test` con Compose de test |
| Datos/operación | Migración, seed, idempotencia, persistencia, health y arranque | Docker Compose y controles dirigidos |
| QA manual | Desktop/mobile, caret, foco, teclado, overflow, consola y flujo real | [Checklist](../ACCEPTANCE_CHECKLIST.md) y protocolo aplicable |
| Demo pública | Health, UI, Swagger y contrato servido | Smoke test de Render cuando cambia el artefacto desplegado |

## Métricas que no deben mezclarse

- **111 casos detectados estáticamente en V2.2:** inventario obtenido por
  análisis del código de pruebas. Describe declaraciones encontradas por ese
  método y puede omitir casos generados o parametrizados.
- **129 pruebas históricamente ejecutadas:** resultado runtime de la suite V2.1,
  documentado como `129/129 PASS` antes del despliegue.

No son la misma métrica ni se restan entre sí. La campaña final debe informar el
conteo que produzca el runner en esa versión y conservar ambos antecedentes con
su método y fecha.

## Ambientes y aislamiento

| Ambiente | Datos | Regla |
|---|---|---|
| Desarrollo local | Base `providers` | No usar para integración automatizada |
| Suite completa | Compose `sistema-gestion-prestadores-test`, base lógica `providers_test` | Project name, puerto y volumen propios; limpieza al finalizar |
| Docker de aceptación | Dataset ficticio administrado | Verificar baseline antes de QA; conservar datos ajenos salvo reset explícito del ambiente descartable |
| Render | Datos ficticios | Demo temporal; no cargar datos reales ni inferir disponibilidad permanente |

Antes de una campaña se verifica Git, Docker, project name, dataset, puertos y
discovery. Un contenedor activo no es por sí solo un bloqueo: debe interferir
con la validez o seguridad de la campaña.

## Determinismo de datos

El seed administra 30 CUIT fijos mediante `upsert`: 20 `ACTIVE` y 10
`INACTIVE`. Conserva los tres registros V1, agrega 27, no duplica y no elimina
registros ajenos. La calidad se demuestra en volumen vacío, reinicio,
idempotencia y preservación de un dato no administrado. Un total físico mayor a
30 puede ser válido; la baseline de aceptación debe distinguir registros
administrados de datos ajenos.

## Trazabilidad

La cadena esperada es:

`requisito → criterio → código/prueba → commit/PR → resultado → release`.

Las fuentes son [historias y criterios](../product/USER_STORIES_AND_ACCEPTANCE_CRITERIA.md),
[matriz de trazabilidad](../product/REQUIREMENTS_TRACEABILITY.md), código de
pruebas, [TP-006](../testing/TP-006_TEST_PROTOCOL.md) y su
[informe](../testing/TP-006_TEST_EXECUTION_REPORT.md). El protocolo conserva la
intención previa; el informe conserva resultados. Ninguno se reescribe para
acomodar el otro.

## Gates de calidad

La campaña final aplica, como mínimo:

1. G0: baseline, herramientas, aislamiento y discovery válidos.
2. G3: lint, typecheck y build en PASS.
3. G4: suite completa, OpenAPI válido, migración/seed y datos aplicables.
4. G5: aceptación manual proporcional cuando cambia conducta observable.
5. G7: diff, documentación, enlaces y contrato consistentes.
6. G8: sólo cuando cambia el artefacto desplegado, smoke y rollback de demo.
7. G9: evidencia y riesgos diferenciados de las fuentes vigentes.

No se repite toda la batería después de una corrección puramente editorial. Un
cambio de código, contrato o comportamiento repite controles afectados y una
regresión proporcional.

## Gestión de defectos

Cada defecto registra ambiente/versión, pasos, esperado/real, evidencia,
severidad, impacto, causa o `UNKNOWN`, corrección y decisión de release.

`FIXED` significa que existe una corrección; `CLOSED_VERIFIED` exige prueba
relacionada, regresión acordada y revalidación en el ambiente apropiado. Los dos
defectos MEDIUM de TP-006 —caret de CUIT y restauración de foco— terminaron
`CLOSED_VERIFIED`; no quedan defectos funcionales abiertos de esa campaña.

## Riesgos y brechas conocidas

| Riesgo/brecha | Tratamiento actual |
|---|---|
| API de demo sin auth ni rate limit | Riesgo aceptado; datos ficticios; no productivo |
| Migración y seed en startup | Reproducibilidad de demo; deuda si aumenta criticidad |
| Logging/observabilidad mínimos | Health de DB y errores uniformes; deuda operativa |
| Bundle de frontend mayor a 500 KB | Observación no bloqueante histórica |
| OpenAPI duplicado manualmente respecto de Zod | Pruebas de referencias y revisión al cambiar esquemas |
| QA unipersonal/asistido | Criterios congelados, separación temporal y evidencia reproducible |
| Demo Render temporal | Runbook, smoke fechado y limitaciones explícitas |

Auth, autorización, request ID, logging estructurado, backups productivos,
hardening completo y CI/CD están fuera del alcance actual. Se convierten en
gates antes de usar datos reales o declarar producción.

## Definición de terminado

Un cambio está terminado cuando:

- cumple criterios obligatorios y no amplía el alcance silenciosamente;
- lint, tipos, build y pruebas aplicables pasan;
- contratos, datos y documentación vigente coinciden con runtime;
- QA observable aplicable está ejecutado, no supuesto;
- defectos bloqueantes están `CLOSED_VERIFIED` o la release está bloqueada;
- Git, secretos y ambientes quedan en el estado acordado;
- riesgo residual, rollback, evidencia y métricas conocidas están registrados;
- el aprobador humano habilita integración/publicación cuando corresponda.

## Revalidación por tipo de cambio

| Cambio | Revalidación mínima |
|---|---|
| Markdown/enlaces | Enlaces, legibilidad, consistencia y `git diff --check` |
| OpenAPI documental | Tests OpenAPI, serialización/referencias, lint, tipos y build |
| Frontend | Unitarias afectadas, regresión, build y QA responsive/accesible según impacto |
| API/validación | Integración, errores, persistencia y contrato OpenAPI |
| Prisma/seed | Migración, volumen vacío, idempotencia, datos ajenos y regresión |
| Docker/startup | Build, health, restart, persistencia y limpieza |
| Deploy | Versión, health, UI/Swagger, logs disponibles y rollback |

## Evidencia vigente e histórica

- Guía vigente: este documento y el [checklist](../ACCEPTANCE_CHECKLIST.md).
- Intención histórica: [TP-006 protocolo](../testing/TP-006_TEST_PROTOCOL.md).
- Resultado histórico: [TP-006 ejecución](../testing/TP-006_TEST_EXECUTION_REPORT.md).
- Operación y errores: [registro V2](../process/V2_EXECUTION_LOG.md).
- Demo pública: [validación Render](../deployment/RENDER_DEPLOYMENT_VALIDATION.md).
- Navegación completa: [índice documental](../INDEX.md).
