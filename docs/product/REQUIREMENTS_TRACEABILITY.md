# Matriz de trazabilidad V2

## Reglas de negocio

- `BR-V2-001 — CUIT canónico`: el CUIT se presenta como `XX-XXXXXXXX-X`, pero API y persistencia reciben exactamente 11 dígitos; sigue siendo obligatorio, único y sin validación matemática.
- `BR-V2-002 — Teléfono canónico`: el teléfono es `string | null`, conserva solo dígitos y ceros iniciales, admite hasta 30 dígitos y rechaza el exceso sin truncarlo.
- `BR-V2-003 — Dataset inicial administrado`: el seed administra 30 CUIT fijos, con distribución 20/10, usando idempotencia y sin borrar registros ajenos.

## Trazabilidad final

El estado inicial `PLANNED` quedó formalizado en C1 antes de implementar. La
matriz siguiente registra el estado posterior a TP-006.

| Requisito | Historia o habilitador | Regla | Archivos principales | Commits | Pruebas | TP-006 | Estado |
|---|---|---|---|---|---|---|---|
| V2-REQ-001 | US-V2-001; EN-V2-001 y EN-V2-002 | BR-V2-001 | `client/src/utils/provider-normalization.ts`; `client/src/components/ProviderFormDialog.tsx`; `client/src/components/ProviderTable.tsx`; `client/src/components/ProviderCards.tsx`; `client/src/schemas/provider.ts`; `server/src/providers/provider.schemas.ts`; `server/src/providers/provider.service.ts` | C2 `09f6313e`; C2A `979ec3c`; C3A `6eae92e` | C-01 a C-18; suite final 99/99 | PASS_WITH_OBSERVATIONS | ACCEPTED |
| V2-REQ-002 | US-V2-002; EN-V2-001 y EN-V2-002 | BR-V2-002 | `client/src/components/ProviderFormDialog.tsx`; `client/src/schemas/provider.ts`; `client/src/utils/provider-normalization.ts`; `server/src/providers/provider.normalization.ts`; `server/src/providers/provider.schemas.ts` | C2 `09f6313e`; C2A `979ec3c` | T-01 a T-17; suite final 99/99 | PASS_WITH_OBSERVATIONS | ACCEPTED |
| V2-REQ-003 | EN-V2-003; no aplica historia | BR-V2-003 | `prisma/provider-seed.ts`; `prisma/seed.ts`; `server/test/providers.integration.test.ts` | C3 `d3e019c` | D-01 a D-17; 30/20/10; páginas 10/10/10/0 | PASS_WITH_OBSERVATIONS | ACCEPTED |
| V2 transversal | EN-V2-004 y EN-V2-005 | Gobierno documental | `docs/testing/TP-006_TEST_PROTOCOL.md`; `docs/testing/TP-006_TEST_EXECUTION_REPORT.md`; `docs/process/V2_EXECUTION_LOG.md`; `docs/process/V2_RETROSPECTIVE.md` | C1 `0e61d35`; cierre documental V2-08 | Q-01 a Q-10 | PASS_WITH_OBSERVATIONS | COMPLETED |

## Correcciones trazables

| Defecto o incidencia | Commit | Caso | Resultado |
|---|---|---|---|
| V2-TST-001 — pruebas `*.test.ts` fuera de `npm test` | `979ec3c` | Q-04 | PASS; 80/80 en V2-04A |
| V2-07-01 — Delete atrapado junto al guion | `6eae92e` | C-16 | PASS en V2-07B-R; `CLOSED_VERIFIED` |
| V2-07-02 — foco restaurado a `BODY` | `6eae92e` | C-17 | PASS en V2-07B-R; `CLOSED_VERIFIED` |

## Evidencia de aceptación

- C-01 a C-18: PASS.
- T-01 a T-17: PASS.
- D-01 a D-17: PASS.
- Q-01 a Q-10: PASS.
- Pruebas únicas finales: 99.
- Defectos funcionales abiertos: ninguno.
- Informe autoritativo:
  `docs/testing/TP-006_TEST_EXECUTION_REPORT.md`.

Los estados `BLOCKED` de V2-07 y del primer V2-07B se conservan en el historial
de ejecución. Después de corregir y reauditar, los tres requisitos terminan
`ACCEPTED`.
