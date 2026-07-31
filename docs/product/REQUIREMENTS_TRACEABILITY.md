# Matriz de trazabilidad V2

## Reglas de negocio

- `BR-V2-001 — CUIT canónico`: el CUIT se presenta como `XX-XXXXXXXX-X`, pero API y persistencia reciben exactamente 11 dígitos; sigue siendo obligatorio, único y sin validación matemática.
- `BR-V2-002 — Teléfono canónico`: el teléfono es `string | null`, conserva solo dígitos y ceros iniciales, admite hasta 30 dígitos y rechaza el exceso sin truncarlo.
- `BR-V2-003 — Dataset inicial administrado`: el seed administra 30 CUIT fijos, con distribución 20/10, usando idempotencia y sin borrar registros ajenos.

## Trazabilidad inicial

| Requisito | Historia | Regla | Habilitador | Código previsto | Prueba TP-006 | Estado |
|---|---|---|---|---|---|---|
| V2-REQ-001 | US-V2-001 | BR-V2-001 | EN-V2-001, EN-V2-002 | Utilidad frontend; formulario; tabla; tarjetas; esquema y búsqueda backend | C-01 a C-18 | PLANNED |
| V2-REQ-002 | US-V2-002 | BR-V2-002 | EN-V2-001, EN-V2-002 | Utilidad frontend; formulario; payload; esquema backend | T-01 a T-17 | PLANNED |
| V2-REQ-003 | No aplica: habilitador técnico | BR-V2-003 | EN-V2-003 | Dataset y función de seed; pruebas de integración | D-01 a D-17 | PLANNED |
| V2 transversal | No aplica | Gobierno documental | EN-V2-004, EN-V2-005 | Protocolo, informe futuro, log y documentación | Q-01 a Q-10 | PLANNED |

## Reglas de actualización

- `PLANNED`: alcance formalizado, todavía no implementado.
- Cualquier cambio de estado requiere evidencia y autorización de la etapa correspondiente.
- Esta planificación no anticipa estados de implementación, prueba o aceptación.

En esta etapa todos los requisitos permanecen `PLANNED`.
