# Registro de ejecución V2

## Objetivo

Registrar procesos, tiempos confirmados, iteraciones, bloqueos y errores para sostener trazabilidad y mejora continua. La ausencia de una métrica se declara; no se estima retrospectivamente.

## Procesos

| Proceso | Inicio | Fin | Duración | Intentos | Bloqueos | Errores | Estado |
|---|---|---|---|---:|---:|---|---|
| V2-01 | No registrado | 2026-07-31 12:19 ART | No determinable | 1 | 0 | No registrado | COMPLETE |
| V2-02 | No registrado | No registrado | 22,278 segundos | 1 | 1 | 1 (`V2-PROC-001`) | BLOCKED |
| V2-02R | 2026-07-31T12:54:27.992-03:00 | 2026-07-31T12:58:49.755-03:00 | 4 min 21,763 s | 1 | 0 | 0 | COMPLETE |
| V2-03 | 2026-07-31T14:03:48.471-03:00 | 2026-07-31T14:14:57.140-03:00 | 11 min 8,669 s | 1 | 0 | 3 | COMPLETE |

## Registro de errores confirmados

| ID | Categoría | Tipo | Descripción | Impacto | Corrección | Prevención |
|---|---|---|---|---|---|---|
| V2-PROC-001 | REQ / proceso | PREVENIBLE | Docker activo fue tratado como bloqueo en un análisis de solo lectura | Una iteración y 22 segundos | V2-02R corrigió la condición de bloqueo | Los recursos activos solo bloquean si interfieren realmente |
| OPS-SCR-001 | IMP | PREVENIBLE | Interpolación inválida `$LASTEXITCODE:` en scripts PowerShell | Script no ejecutable y una iteración de corrección; duración no registrada | Se distribuyeron scripts BAT | Validar sintaxis antes de distribución |
| ENV-PATCH-001 | ENV | PREVENIBLE | El helper de parches de Windows no pudo leer AGENTS.md y luego un documento intent-to-add | Tres intentos de parche sin aplicación parcial | Escritura UTF-8 exacta y revisión inmediata del diff | Usar parches pequeños, verificar el helper y aplicar fallback controlado solo si falla |
| OPS-AUD-001 | OPS | PREVENIBLE | El código 1 esperado de la búsqueda rg sin coincidencias se propagó como fallo del gate | Una ejecución de auditoría reportada como fallida pese a no detectar secretos | Se repitió el gate tratando 1 como ausencia válida y códigos mayores como error | Manejar explícitamente la semántica de salida de herramientas de búsqueda |
| DOC-FMT-001 | DOC | PREVENIBLE | Un backtick de formato se interpretó como escape al construir el log con PowerShell | La palabra rg quedó dividida en dos líneas | Se reemplazó por texto literal y se revisó el bloque completo | Evitar backticks Markdown dentro de cadenas interpoladas y revisar la salida exacta |

## Cierre V2-03

- Duración activa aproximada: aproximadamente 11 min.
- Ciclos de corrección: 4.
- Retrabajo: tres reintentos de parche/fallback, una corrección de estados, una repetición del gate y una corrección de formato del log.
- Resultado documental: ocho archivos autorizados, TP-006 no ejecutado y evidencia V1 intacta.

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
