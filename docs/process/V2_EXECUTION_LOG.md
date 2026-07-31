# Registro de ejecución V2

## Objetivo

Registrar procesos, tiempos confirmados, iteraciones, bloqueos y errores para sostener trazabilidad y mejora continua. La ausencia de una métrica se declara; no se estima retrospectivamente.

## Procesos

| Proceso | Herramienta | Inicio | Fin | Duración | Intentos | Bloqueos | Errores | Estado | Commit |
|---|---|---|---|---|---:|---:|---|---|---|
| V2-01 | No registrado | No registrado | 2026-07-31 12:19 ART | No determinable | 1 | 0 | No registrado | COMPLETE | No aplica |
| V2-02 | No registrado | No registrado | No registrado | 22,278 segundos | 1 | 1 | 1 (`V2-PROC-001`) | BLOCKED | No aplica |
| V2-02R | No registrado | 2026-07-31T12:54:27.992-03:00 | 2026-07-31T12:58:49.755-03:00 | 4 min 21,763 s | 1 | 0 | 0 | COMPLETE | No aplica |
| V2-03 | Codex local | 2026-07-31T14:03:48.471-03:00 | 2026-07-31T14:14:57.140-03:00 | 11 min 8,669 s | 1 | 0 | 3 | COMPLETE | `0e61d35` |
| V2-04 | Codex local | No registrado | No registrado | 14 min 49,932 s | 1 | 0 | 1 (`V2-TST-001`) | COMPLETE | `09f6313` |
| V2-04A | Codex local | No registrado | No registrado | 2 min 56,943 s | 1 | 0 | 0 | COMPLETE | `979ec3c` |
| V2-05 | Codex local | No registrado | No registrado | 10 min 36,752 s | 1 | 0 | 0 | COMPLETE | `d3e019c` |
| V2-06 | Codex local | No registrado | No registrado | 8 min 58,137 s | 1 | 0 | 0 | COMPLETE | No aplica |
| V2-07 | Cursor Browser | No registrado | No registrado | Aproximadamente 20 min | 1 | 1 | 2 (`V2-07-01`, `V2-07-02`) | BLOCKED | No aplica |
| V2-07A | Codex local | No registrado | No registrado | 18 min 24,606 s | 1 | 0 | 0 | COMPLETE | `6eae92e` |
| Primer V2-07B | Codex local / Browser CDP | No registrado | No registrado | 1 min 38,047 s | 2 | 2 | 2 (`V2-07B-INF-01`, `V2-07B-DAT-01`) | BLOCKED | No aplica |
| V2-07B-R | Cursor Browser | 2026-07-31 17:16 ART | 2026-07-31 17:22:52 ART | 6 min 52 s | 1 | 0 | 0 | COMPLETE | No aplica |
| V2-08 | Codex local | 2026-07-31 17:33 ART | 2026-07-31 17:38:41 ART | Aproximadamente 5 min 41 s; inicio con precisión al minuto | 1 | 0 | 1 (`V2-08-INF-01`) | COMPLETE | `docs: finalize v2 validation and retrospective` |
| V2-09 | Codex local | 2026-07-31 17:51:50.661 ART | 2026-07-31 18:01:02.341 ART | 9 min 11,680 s | 5 | 0 | 4 recuperados | COMPLETE | Ninguno |
| V2-09A | Codex local | 2026-07-31 18:06:23.077 ART | 2026-07-31 18:17:02.088 ART | 10 min 39,011 s | 10 | 0 | 9 (`V2-09A-INF-01`, `V2-09A-OPS-01`) | COMPLETE | commit documental de la propia fase; consultar el primer commit posterior a `908aad6c` |

## Registro de errores confirmados

| ID | Categoría | Tipo | Descripción | Impacto | Corrección | Prevención |
|---|---|---|---|---|---|---|
| V2-PROC-001 | REQ / proceso | PREVENIBLE | Docker activo fue tratado como bloqueo en un análisis de solo lectura | Una iteración y 22 segundos | V2-02R corrigió la condición de bloqueo | Los recursos activos solo bloquean si interfieren realmente |
| OPS-SCR-001 | IMP | PREVENIBLE | Interpolación inválida `$LASTEXITCODE:` en scripts PowerShell | Script no ejecutable y una iteración de corrección; duración no registrada | Se distribuyeron scripts BAT | Validar sintaxis antes de distribución |
| ENV-PATCH-001 | ENV | PREVENIBLE | El helper de parches de Windows no pudo leer AGENTS.md y luego un documento intent-to-add | Tres intentos de parche sin aplicación parcial | Escritura UTF-8 exacta y revisión inmediata del diff | Usar parches pequeños, verificar el helper y aplicar fallback controlado solo si falla |
| OPS-AUD-001 | OPS | PREVENIBLE | El código 1 esperado de la búsqueda rg sin coincidencias se propagó como fallo del gate | Una ejecución de auditoría reportada como fallida pese a no detectar secretos | Se repitió el gate tratando 1 como ausencia válida y códigos mayores como error | Manejar explícitamente la semántica de salida de herramientas de búsqueda |
| DOC-FMT-001 | DOC | PREVENIBLE | Un backtick de formato se interpretó como escape al construir el log con PowerShell | La palabra rg quedó dividida en dos líneas | Se reemplazó por texto literal y se revisó el bloque completo | Evitar backticks Markdown dentro de cadenas interpoladas y revisar la salida exacta |
| V2-TST-001 | TST | PREVENIBLE | Vitest solo descubría `client/src/**/*.test.tsx` y dejó 21 pruebas `*.test.ts` fuera de `npm test` | La primera implementación informó 59 pruebas estándar sin incluir toda la cobertura creada | C2A agregó el patrón `client/src/**/*.test.ts`; V2-04A pasó 80/80 | Verificar discovery al crear una extensión de pruebas nueva |
| OPS-SCR-002 | OPS | PREVENIBLE | Una variable CMD se expandió antes del momento operativo esperado | El script usó un valor prematuro | Se corrigió el momento de expansión | Validar scripts en el shell objetivo antes de distribuir |
| V2-PROC-002 | ENV / proceso | PREVENIBLE | El runner de pruebas compartió recursos con el Compose principal | Interferencia potencial sobre servicios de desarrollo | Se restauró el ambiente y se documentó aislamiento pendiente | Usar project name específico para pruebas |
| V2-07-01 | IMP / AIT | DEFECTO PRODUCTO | Delete antes del guion del CUIT quedaba atrapado | C-16 bloqueado, reproducibilidad 2/2 | C3A operó sobre dígitos lógicos | Pruebas automatizadas y V2-07B-R |
| V2-07-02 | IMP / AIT | DEFECTO PRODUCTO | El foco terminaba en `BODY` después de cerrar el diálogo | C-17 bloqueado, reproducibilidad 3/3 | C3A restauró trigger y agregó fallback a `main` | Pruebas automatizadas y V2-07B-R |
| V2-07B-INF-01 | INF | EXTERNO | Browser/CDP de Codex falló dos veces con `windows sandbox: helper_unknown_error` | Sin navegación; primer V2-07B bloqueado | Reauditoría mediante Cursor Browser | Definir fallback Browser antes de comenzar |
| V2-07B-DAT-01 | DAT | AMBIENTE | Existía un registro ajeno y el total físico era 31 | Línea base no válida para la campaña | Reset controlado restauró 30/20/10 | Verificar dataset antes de campañas |
| V2-08-INF-01 | INF | EXTERNO | El sandbox de Windows no pudo lanzar una consulta Git de solo lectura | Una invocación fallida, sin cambios parciales | Se repitió la misma inspección con acceso local | Solicitar acceso local desde el inicio cuando el helper no pueda aislar filesystem |
| V2-09A-INF-01 | INF | EXTERNO | El helper aislado de `apply_patch` y su wrapper externo no pudieron operar en Windows | Tres invocaciones fallidas, sin cambios parciales | Se cambió a generación y validación transaccional de contenido | Verificar disponibilidad del helper antes de iniciar la fase de escritura |
| V2-09A-OPS-01 | OPS | PREVENIBLE | Los primeros fallbacks de diff fueron incompatibles con encoding, hunks o conversión LF/CRLF | Seis invocaciones fallidas, sin cambios parciales | Se validaron todas las sustituciones en memoria y se escribieron juntas en UTF-8 | Usar el fallback transaccional validado cuando el helper no esté disponible |

## Cierre V2-03

- Duración activa aproximada: aproximadamente 11 min.
- Ciclos de corrección: 4.
- Retrabajo: tres reintentos de parche/fallback, una corrección de estados, una repetición del gate y una corrección de formato del log.
- Resultado documental: ocho archivos autorizados, TP-006 no ejecutado y evidencia V1 intacta.

## Cierre V2-08

- Duración total: aproximadamente 5 min 41 s; el inicio se registró con
  precisión al minuto.
- Duración activa aproximada: aproximadamente 5 min de trabajo local continuo.
- Intentos: 1.
- Bloqueos: 0.
- Errores: 1 (`V2-08-INF-01`), resuelto.
- Ciclos de corrección: 1.
- Archivos creados: 2.
- Archivos modificados: 8.
- Retrabajo: una repetición de la inspección Git de solo lectura.
- Resultado: TP-006 cerrado `PASS_WITH_OBSERVATIONS`; publicación pendiente.

## Cierre V2-09

- Finalidad: evaluación de preparación para publicación.
- Resultado: `COMPLETE`.
- Hallazgos: seis documentales.
- Código modificado: no.
- Commit: ninguno.
- Recomendación: ejecutar V2-09A.
- Errores recuperados: cuatro.
- Remoto modificado: no.

## Cierre V2-09A

- Inicio: 2026-07-31 18:06:23.077 ART.
- Fin documental: 2026-07-31 18:17:02.088 ART.
- Duración total: 10 min 39,011 s.
- Herramienta: Codex local.
- Resultado: `COMPLETE`.
- Archivos modificados: 6; ningún archivo creado.
- Errores: 9 invocaciones recuperadas, agrupadas en `V2-09A-INF-01` y
  `V2-09A-OPS-01`.
- Ciclos de corrección: 9.
- Código, pruebas, dependencias, Docker y datos modificados: no.
- Commit: commit documental de la propia fase; consultar el primer commit
  posterior a `908aad6c`.
- Remoto modificado: no.

## Taxonomía

| Código | Categoría |
|---|---|
| REQ | Requisitos |
| ARC | Arquitectura |
| TEC | Técnica |
| ENV | Entorno |
| IMP | Implementación |
| INT | Integración |
| TST | Pruebas |
| DAT | Datos |
| SEC | Seguridad |
| DOC | Documentación |
| OPS | Operación |
| AIT | Auditoría |
| GIT | Control de versiones |
| INF | Infraestructura |

## Reglas de registro

- Registrar inicio antes de la primera acción operativa y cierre antes del commit correspondiente.
- Usar fechas y duraciones observadas; nunca reconstruir una métrica ausente.
- Distinguir error, bloqueo y ciclo de corrección.
- Relacionar errores con requisito, prueba o commit cuando exista.
- El cierre real de V2-03 se registró antes de crear C1.
