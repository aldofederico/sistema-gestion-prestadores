# TP-006 — Informe de ejecución

## Identificación

- Ciclo: `TP-006`.
- Título: Mejoras de calidad de datos y dataset V2.
- Versión: V2.
- Rama: `v2/implementacion`.
- Línea base V1: `91df3e5b300fba1d050ef9250164849852d3ef9a`.
- Commit funcional probado: `6eae92ef47a3c68fb9e1a396630b398a35efdc03`.
- Estado final: `PASS_WITH_OBSERVATIONS`.
- Período de ejecución: 31 de julio de 2026, desde V2-04 hasta V2-07B-R.
- Responsables por herramienta: Codex local para implementación, correcciones y
  validación técnica; Cursor Browser para auditoría manual y reauditoría;
  operador para autorizaciones y control del ambiente.

El protocolo previo permanece en
[`TP-006_TEST_PROTOCOL.md`](TP-006_TEST_PROTOCOL.md) con estado
`APPROVED_NOT_EXECUTED` porque representa la condición anterior a la ejecución.
Este informe contiene la evidencia posterior y no modifica retrospectivamente
el protocolo.

## Alcance ejecutado

La ejecución cubrió:

- máscara visual, edición, representación canónica, búsqueda y unicidad de CUIT;
- saneamiento, límites, persistencia y representación opcional del teléfono;
- dataset determinista, distribución, paginación, filtros e idempotencia;
- regresión automatizada de frontend, backend e integración;
- migración, seed, persistencia, volumen vacío y reinicio con Docker;
- interfaz desktop y mobile, diálogos, caret, foco y ausencia de overflow;
- accesibilidad manual de los flujos afectados;
- consola JavaScript y tráfico HTTP relevante.

No se amplió el alcance a autenticación, despliegue, validación matemática del
CUIT, máscara regional del teléfono ni cambios de API, schema o arquitectura.

## Ambiente

- Sistema operativo: Windows.
- Docker: Docker 29.6.2 y Docker Compose.
- Servicios: `app` y `db`.
- URL local: `http://localhost:3000`.
- Base principal: `providers`.
- Base lógica de pruebas: `providers_test`.
- Git: rama local `v2/implementacion`, sin upstream ni publicación.
- Datos: ficticios; dataset administrado de 30 miembros.

No se registran otras versiones de herramientas porque no existe evidencia
confirmada suficiente para hacerlo.

## Historial autoritativo de commits

| Hito | Commit | Mensaje | Propósito |
|---|---|---|---|
| C1 | `0e61d35ad210685ba3827dac7d991b4a3fc3cce8` | `docs: define v2 scope and test protocol` | Formalización de alcance, historias, habilitadores, trazabilidad y protocolo TP-006 |
| C2 | `09f6313e8b5744292202ee74752d8ef6f34e2095` | `feat: normalize provider identifiers and phone data` | Máscara CUIT, representación canónica, normalización telefónica y pruebas |
| C2A | `979ec3cc3f0395b30286728491ac3d2f98df1ab2` | `test: include normalization utilities in regression suite` | Corrección controlada para incorporar las pruebas `*.test.ts` a `npm test` |
| C3 | `d3e019c2fbb5864bc800665c4ef9907a1b79ac72` | `feat: expand deterministic provider seed dataset` | Dataset 30/20/10, seed idempotente y pruebas |
| C3A | `6eae92ef47a3c68fb9e1a396630b398a35efdc03` | `fix: preserve form caret and restore dialog focus` | Corrección controlada de C-16 y C-17 y doce pruebas adicionales |

C2A y C3A no fueron commits planificados originalmente; se conservaron como
correcciones pequeñas, separadas y trazables.

## Ejecuciones

| Ejecución | Objetivo | Resultado | Pruebas o casos | Defectos | Evidencia |
|---|---|---|---|---|---|
| V2-04 | Implementar CUIT y teléfono | COMPLETE | 59 pruebas estándar; 21 pruebas `*.test.ts` detectadas fuera del patrón | Incidencia `V2-TST-001` | C2; CUIT visual y canónico; teléfono normalizado; API, schema y dependencias sin cambios |
| V2-04A | Corregir discovery de Vitest | COMPLETE | `npm test` 80/80 en una corrida | `V2-TST-001` resuelta | C2A; inclusión de `client/src/**/*.test.ts` |
| V2-05 | Implementar dataset determinista | COMPLETE | `npm test` 87/87 | Ninguno | C3; 30 miembros, 20/10, 3 V1 conservados, 27 agregados, `upsert` sin `deleteMany` |
| V2-06 | Ejecutar validación técnica integral | COMPLETE | 87 casos únicos; ejecución adicional `test:unit` 46/46; 133 ejecuciones acumuladas informadas | Ninguno | db:generate, lint, typecheck, test, test:unit, build, Docker, migración, seed, health e idempotencia PASS |
| V2-07 | Auditar funcionalidad, UI y accesibilidad | BLOCKED | Campaña desktop/mobile y regresión focal | `V2-07-01`, `V2-07-02` | Funcionalidad general PASS; dos defectos MEDIUM reproducibles |
| V2-07A | Corregir caret y foco | COMPLETE | `npm test` 99/99; 12 pruebas agregadas; lint, typecheck y build PASS | Dos defectos corregidos | C3A; edición por dígitos lógicos, trigger original y fallback a `main` |
| Primer V2-07B | Reauditar C-16 y C-17 con Codex Browser | BLOCKED | Sin navegación; Browser/CDP falló 2 veces | Ningún defecto de producto nuevo | `windows sandbox: helper_unknown_error`; ambiente con 31 registros |
| V2-07B-R | Reauditar C-16 y C-17 con Cursor Browser | COMPLETE | 5 operaciones de caret; 7 flujos de foco/guardado | Ninguno pendiente | Todos los casos PASS; PUT 200; consola limpia; restauración 30/20/10 |

Los 87 casos de V2-06 y los 46 de la ejecución adicional `test:unit` no
constituyen 133 casos únicos. El estado final contiene 99 pruebas únicas.

## Resultados por grupo

| Grupo | Casos | Resultado | Evidencia |
|---|---|---|---|
| CUIT | C-01 a C-18 | PASS | Automatización, integración, V2-07 y V2-07B-R; C-16 y C-17 revalidados |
| Teléfono | T-01 a T-17 | PASS | Frontend, API y DB; 30 válidos, 31 rechazados sin truncamiento; `null` y ceros preservados |
| Dataset | D-01 a D-17 | PASS | Base vacía, volumen V1, 30/20/10, páginas 10/10/10/0, filtros, idempotencia y datos ajenos |
| Gates | Q-01 a Q-10 | PASS | Gates técnicos, Docker, auditoría manual y cierre documental |

## Gates

| Gate | Resultado | Evidencia |
|---|---|---|
| Q-01 — Lint | PASS | V2-06 y V2-07A sin errores |
| Q-02 — Typecheck | PASS | V2-06 y V2-07A sin errores |
| Q-03 — Unitarias | PASS | V2-06: `test:unit` 46/46 |
| Q-04 — Regresión | PASS | V2-07A: `npm test` 99/99 |
| Q-05 — Build | PASS | V2-06 y V2-07A |
| Q-06 — Docker | PASS | Rebuild sin caché, volumen vacío, migración, seed, reinicio y servicios healthy |
| Q-07 — Desktop | PASS | Auditoría V2-07 y reauditoría C-16/C-17 |
| Q-08 — Mobile | PASS | Tarjetas, diálogo, foco y ausencia de overflow |
| Q-09 — Documentación | PASS | Estados, contratos, evidencia e historial revisados durante V2-08 |
| Q-10 — Cierre TP-006 | PASS | Creación y revisión de este informe y actualización de trazabilidad |

## Defectos

| ID | Severidad | Caso | Descripción | Estado | Corrección | Verificación |
|---|---|---|---|---|---|---|
| V2-07-01 | MEDIUM | C-16 | Delete antes del primer guion quedaba atrapado; reproducibilidad 2/2 | CLOSED_VERIFIED | Operación de Delete y Backspace sobre dígitos lógicos en C3A | Cinco variantes PASS en V2-07B-R; caret operativo |
| V2-07-02 | MEDIUM | C-17 | El foco terminaba en `BODY` tras Cancelar o Escape; reproducibilidad 3/3 | CLOSED_VERIFIED | Restauración al trigger y fallback a `<main tabindex="-1">` en C3A | Alta, edición, desktop, mobile y guardado PASS en V2-07B-R |

No existen defectos funcionales abiertos al cierre.

## Incidencias que no fueron defectos del producto

- Browser/CDP de Codex no estuvo disponible en el primer V2-07B y falló dos
  veces con `windows sandbox: helper_unknown_error`; no hubo navegación y no se
  sustituyó la evidencia manual por automatización.
- El ambiente del primer V2-07B contenía un registro ajeno al seed
  (`30899223513`, Centro Médico del Sur SAS, `INACTIVE`). El total 31 fue
  contaminación local, no defecto del seed, que por contrato preserva datos
  ajenos. El ambiente fue restaurado mediante reset controlado.
- El runner de pruebas y Compose compartieron recursos del proyecto principal en
  una incidencia operativa.
- Hubo incidencias de scripts operativos, helpers de parche y quoting de
  PowerShell/CMD. Se corrigieron o rodearon sin alterar el producto.

Los estados `BLOCKED` de V2-07 y del primer V2-07B son históricos y se conservan.
No contradicen el resultado final obtenido después de corregir y reauditar.

## Observaciones no bloqueantes

- La configuración de Prisma en `package.json` está deprecada.
- Existe una versión mayor nueva de Prisma.
- El bundle de Vite supera 500 kB.
- `initdb` usa autenticación `trust` local.
- El proyecto Compose de pruebas requiere mejor aislamiento respecto del
  Compose principal.
- La auditoría manual depende de la disponibilidad del canal Browser.

Estas observaciones no forman parte del alcance correctivo de V2 y no se
recomienda resolverlas dentro de esta versión.

## Métricas

| Métrica | Valor |
|---|---:|
| Pruebas existentes antes de V2 | 50 |
| Pruebas únicas finales V2 | 99 |
| Incremento neto | 49 |
| Defectos MEDIUM detectados | 2 |
| Defectos abiertos finales | 0 |
| Servicios Docker | 2 |
| Dataset administrado | 30 |
| Distribución | 20 ACTIVE / 10 INACTIVE |
| Commits funcionales/correctivos anteriores al cierre | 5 |

Los 50 casos iniciales corresponden al estado V1 y los 99 al estado final V2.

## Cierre

### Estado global

`TP-006: PASS_WITH_OBSERVATIONS`

Todos los casos C-01 a C-18, T-01 a T-17, D-01 a D-17 y Q-01 a Q-10
terminaron en PASS. Los dos defectos MEDIUM detectados durante la auditoría
fueron corregidos y verificados de forma independiente. No quedan defectos
funcionales abiertos.

El alcance V2 queda aceptado y preparado para revisión de publicación. La
publicación, fusión o push todavía no fueron ejecutados y requieren autorización
específica.
