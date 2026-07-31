# Retrospectiva V2

## Objetivo

Evaluar el sistema de trabajo empleado en V2, no solo el resultado del
producto, para conservar prácticas útiles, reconocer retrabajo y definir
mejoras posteriores sin ampliar esta versión.

## Qué funcionó

- La división por fases separó alcance, implementación, validación técnica,
  auditoría manual, corrección y cierre.
- La línea base V1 quedó congelada y la rama V2 permaneció local.
- Los commits pequeños facilitaron trazabilidad y rollback.
- TP-006 fue protocolizado antes de implementar y su informe se produjo después.
- Las pruebas crecieron de manera incremental junto con los cambios.
- La reauditoría independiente verificó los defectos donde fueron observados.
- El seed determinista e idempotente preservó datos ajenos.
- Cada intervención comenzó y terminó con controles de Git.
- No hubo publicación prematura, amend, force push ni reescritura de V1.
- Las correcciones se basaron en defectos reproducibles y evidencia concreta.

## Qué produjo retrabajo

- Docker activo fue tratado inicialmente como bloqueo aunque el análisis era de
  solo lectura.
- Las pruebas `*.test.ts` quedaron fuera del pipeline estándar por el patrón de
  discovery de Vitest.
- Fallaron helpers de parches en Windows.
- El quoting de PowerShell y la expansión anticipada de variables CMD afectaron
  scripts operativos.
- Algunos scripts se distribuyeron antes de validar completamente su sintaxis.
- El runner de pruebas afectó el Compose principal.
- Un registro ajeno contaminó el dataset local antes de una campaña.
- Browser/CDP falló en Codex durante el primer V2-07B.
- Fue necesario usar Cursor Browser como fallback para obtener evidencia manual.

## Defectos de producto

### V2-07-01 — Caret del CUIT

- Origen: la máscara recomponía el guion después de Delete y dejaba el caret
  atrapado junto al separador.
- Detección: auditoría V2-07, caso C-16, severidad MEDIUM, categoría
  FUNCTIONAL / USABILITY, reproducibilidad 2/2.
- Corrección: C3A hizo que Delete y Backspace operaran sobre dígitos lógicos y
  reposicionó el caret.
- Pruebas: doce pruebas agregadas en C3A junto con la cobertura de foco.
- Reauditoría: V2-07B-R validó ambos guiones, Delete consecutivo y Backspace.
- Cierre: `CLOSED_VERIFIED`.

### V2-07-02 — Restauración del foco

- Origen: el cierre del diálogo dejaba el foco en `BODY`.
- Detección: auditoría V2-07, caso C-17, severidad MEDIUM, categoría
  ACCESSIBILITY, reproducibilidad 3/3.
- Corrección: C3A restauró el trigger conectado y agregó fallback estable a
  `<main tabindex="-1">`.
- Pruebas: cobertura de alta, edición, Cancelar, Escape y fallback.
- Reauditoría: V2-07B-R validó desktop, mobile y cierre después de guardar.
- Cierre: `CLOSED_VERIFIED`.

## Errores e incidencias de proceso relevantes

| ID | Tipo | Descripción | Impacto y resolución |
|---|---|---|---|
| V2-PROC-001 | Proceso | Docker activo se trató como bloqueo read-only | Generó una iteración; V2-02R corrigió el criterio |
| V2-TST-001 | Pruebas | `*.test.ts` quedó fuera de `npm test` | C2A amplió discovery; 80/80 en una corrida |
| OPS-SCR-001 | Script | Interpolación inválida de PowerShell | Script no ejecutable; se distribuyó fallback validado |
| OPS-SCR-002 | Script | Expansión anticipada de variable CMD | Resultado operativo incorrecto; se corrigió el momento de expansión |
| V2-PROC-002 | Proceso | Runner de pruebas compartió Compose principal | Interferencia de ambiente; se identificó necesidad de project name específico |
| V2-07B-INF-01 | Infraestructura | Browser/CDP de Codex falló dos veces | Primer V2-07B bloqueado; Cursor Browser ejecutó la reauditoría |
| V2-07B-DAT-01 | Datos | Ambiente local contenía un registro adicional | Total 31; reset controlado antes de reauditar |

`V2-07B-DAT-01` fue contaminación del ambiente, no un defecto del seed. El
registro era ajeno al conjunto administrado y el seed debía preservarlo.

También se observaron fallos de helpers de parche y quoting que quedaron
registrados en el log de ejecución. No fueron defectos del producto.

## Acciones de mejora

| Acción | Prioridad | Momento | Estado |
|---|---|---|---|
| Validar sintaxis de scripts antes de distribuir | Alta | Próximo ciclo | PENDIENTE |
| Aislar Compose de pruebas mediante project name específico | Alta | Antes de nuevas pruebas de integración | PENDIENTE |
| Verificar discovery de tests al crear archivos | Alta | Durante implementación | PENDIENTE |
| Distinguir servicios activos de ambiente mutado | Media | En precondiciones | PENDIENTE |
| Definir fallback Browser al comienzo | Alta | Antes de auditoría manual | PENDIENTE |
| Verificar dataset antes de campañas | Alta | Línea base de cada campaña | PENDIENTE |
| Distinguir casos únicos de ejecuciones acumuladas | Media | En cada informe | PENDIENTE |
| Conservar protocolos inmutables | Alta | Siempre | IMPLEMENTADA |
| Registrar tiempos desde el inicio | Media | Cada tarea | EN CURSO |

Estas mejoras no se implementan dentro de V2.

## Tiempos confirmados

| Fase | Duración |
|---|---|
| V2-01 | Duración no determinable con la evidencia disponible |
| V2-02 | 22,278 s |
| V2-02R | 4 min 21,763 s |
| V2-03 | 11 min 8,669 s |
| V2-04 | 14 min 49,932 s |
| V2-04A | 2 min 56,943 s |
| V2-05 | 10 min 36,752 s |
| V2-06 | 8 min 58,137 s |
| V2-07 | aproximadamente 20 min |
| V2-07A | 18 min 24,606 s |
| Primer V2-07B | 1 min 38,047 s |
| V2-07B-R | 6 min 52 s |
| V2-08 | Aproximadamente 5 min 41 s; inicio con precisión al minuto |

El tiempo medido conocido del ciclo de implementación y validación hasta V2-08
inclusive, excluyendo V2-01, es aproximadamente 1 hora y 46 minutos. Esta cifra
no se presenta como el tiempo total absoluto del proyecto ni se calcula con
precisión al segundo porque V2-07 es aproximado.

La cifra:

- no incluye V2-09 ni fases posteriores de preparación o publicación;
- no incluye intervención humana entre fases;
- no incluye pausas de calendario;
- no incluye preparación manual, descarga o reemplazo de scripts;
- mantiene V2-01 sin duración determinable.

## Conclusión

V2 demuestra mejora incremental, control de cambios, trazabilidad, QA
automatizado y manual, identificación y resolución de defectos, preservación
del alcance, reproducibilidad y gobierno AI-first con supervisión.

El proceso no fue perfecto: hubo errores prevenibles de tooling, scripts,
aislamiento y preparación del ambiente. Su registro explícito y las
correcciones controladas permitieron cerrar el producto sin ocultar los estados
intermedios ni confundir incidencias operativas con defectos funcionales.
