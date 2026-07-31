# TP-006 — Mejoras de calidad de datos y dataset V2

Estado: `APPROVED_NOT_EXECUTED`

## Objetivo

Verificar que V2 normalice y presente CUIT y teléfono correctamente, amplíe el dataset inicial de forma idempotente y preserve todos los contratos V1.

Este documento define pruebas futuras. No contiene resultados observados y ninguna prueba de TP-006 ha sido ejecutada en esta etapa.

## Alcance

- `V2-REQ-001`: CUIT en formulario, vistas, payload, API, búsqueda y unicidad.
- `V2-REQ-002`: teléfono en formulario, payload, API y persistencia.
- `V2-REQ-003`: seed, distribución, paginación, filtros, Docker e idempotencia.
- Gates técnicos, manuales, visuales y documentales.

## Exclusiones

No se prueban dígito verificador de CUIT, formato regional de teléfono, autenticación, Swagger, CI/CD, despliegue, cambios de esquema ni endpoints nuevos.

## Commit futuro a probar

Los commits funcionales previstos `C2` y `C3`, descendientes de `C1`. Los hashes se registrarán en `TP-006_TEST_EXECUTION_REPORT.md` antes de ejecutar.

## Ambiente

- Node.js 24.x y dependencias fijadas por `package-lock.json`.
- Vitest, React Testing Library y Supertest.
- PostgreSQL de pruebas lógica `providers_test`.
- Docker Compose con servicios `app` y `db` para aceptación integral.
- Navegador desktop y viewport mobile para auditoría visual.

## Precondiciones

- Rama V2 y Git limpio en el commit candidato.
- Dependencias instaladas con `npm.cmd ci`.
- Prisma Client generado.
- Docker disponible para casos D/Q que lo requieren.
- Dataset de prueba aislado; ausencia de información personal.
- Protocolo y matriz de trazabilidad versionados.

## Datos

- CUIT válidos ficticios de 11 dígitos y variantes con letras, símbolos y separadores.
- Teléfonos ficticios con ceros iniciales y longitudes límite.
- Los tres seeds V1 y los 27 seeds V2.
- Un registro ajeno controlado para verificar no eliminación.

## Herramientas y responsables

- Codex: implementación y ejecución automatizada/manual autorizada.
- Cursor: auditoría e integración, sin edición simultánea.
- Operador: aprobaciones, autenticación externa y aceptación final.
- Herramientas: npm, Vitest, Supertest, Docker Compose, PostgreSQL y navegador.

## Criterios de resultado

- `PASS`: resultado observado coincide íntegramente con el esperado.
- `FAIL`: existe una diferencia reproducible atribuible al candidato.
- `BLOCKED`: una precondición o dependencia externa impide obtener evidencia válida.

Un caso no ejecutado no puede marcarse `PASS`.

## Evidencia

Registrar por caso: commit, fecha/hora, ambiente, entrada, resultado observado, estado y referencia de log o captura cuando corresponda. No versionar secretos, dumps, datos personales ni capturas salvo autorización específica. Consolidar la evidencia en el informe de ejecución, no en este protocolo.

## Limpieza

- Usar exclusivamente datos ficticios y bases de prueba.
- Eliminar registros temporales identificados sin implementar `DELETE` público.
- Detener Docker al cierre conservando o eliminando el volumen según el caso documentado.
- Confirmar Git limpio y que los seeds administrados permanezcan en el estado esperado.

## Riesgos

Caret inestable, máscara filtrada al payload, pérdida de ceros, truncamiento silencioso, carreras entre suites que comparten DB, seed no idempotente, alteración de registros ajenos y diferencias entre volumen vacío y V1.

## Casos CUIT

| ID | Objetivo | Precondición | Pasos | Resultado esperado | Tipo |
|---|---|---|---|---|---|
| C-01 | Validar escritura numérica | Alta abierta | Escribir 11 dígitos | Campo presenta `XX-XXXXXXXX-X` | UI automática |
| C-02 | Eliminar letras | Alta abierta | Intercalar letras y dígitos | Solo se conservan dígitos, formateados | UI automática |
| C-03 | Sanear pegado con guiones | Alta abierta | Pegar CUIT convencional | Valor visual correcto, 11 dígitos canónicos | UI automática |
| C-04 | Sanear espacios y símbolos | Alta abierta | Pegar variante con símbolos | Símbolos eliminados y orden preservado | UI automática |
| C-05 | Formato de 1–2 dígitos | Alta abierta | Escribir uno y luego dos dígitos | Sin separador anticipado | Unitaria |
| C-06 | Formato de 3–10 dígitos | Alta abierta | Escribir progresivamente | Primer guion y grupo central correctos | Unitaria |
| C-07 | Formato completo | Alta abierta | Completar 11 dígitos | Patrón exacto `XX-XXXXXXXX-X` | Unitaria |
| C-08 | Limitar a 11 dígitos | Alta abierta | Escribir o pegar más de 11 | No se conservan dígitos adicionales | UI automática |
| C-09 | Canonizar POST | Formulario válido | Crear con CUIT formateado | Payload contiene exactamente 11 dígitos | Integración UI |
| C-10 | Canonizar PUT | Prestador existente | Editar y guardar CUIT formateado | Payload PUT contiene 11 dígitos | Integración UI |
| C-11 | Precargar edición | API devuelve CUIT canónico | Abrir edición | Input muestra CUIT completo formateado | UI automática |
| C-12 | Formatear tabla | Listado con prestador | Renderizar vista desktop | Celda CUIT usa formato convencional | UI automática |
| C-13 | Formatear tarjetas | Listado con prestador | Renderizar vista mobile | Tarjeta usa el mismo formato | UI automática |
| C-14 | Preservar búsqueda | Dataset con coincidencia | Buscar CUIT con separadores | Se obtiene el mismo prestador | API integración |
| C-15 | Preservar unicidad | CUIT ya almacenado | Repetir alta formateada | HTTP 409 `PROVIDER_CUIT_CONFLICT` | API integración |
| C-16 | Preservar caret | CUIT parcial/completo | Insertar, borrar y reemplazar selección en medio | Caret permanece junto al dígito editado | Manual visual |
| C-17 | Verificar accesibilidad | Formulario abierto | Navegar por teclado y provocar error | Label, foco, ayuda y error son perceptibles | Manual accesibilidad |
| C-18 | Defender API | API disponible | Enviar CUIT con longitud canónica distinta de 11 | HTTP 400 `VALIDATION_ERROR` | API integración |

## Casos teléfono

| ID | Objetivo | Precondición | Pasos | Resultado esperado | Tipo |
|---|---|---|---|---|---|
| T-01 | Conservar números | Alta abierta | Escribir teléfono numérico | Misma cadena | UI automática |
| T-02 | Sanear pegado formateado | Alta abierta | Pegar espacios, paréntesis y guiones | Solo quedan dígitos | UI automática |
| T-03 | Eliminar letras | Alta abierta | Intercalar letras | Letras eliminadas inmediatamente | UI automática |
| T-04 | Eliminar símbolos | Alta abierta | Intercalar símbolos | Símbolos eliminados inmediatamente | UI automática |
| T-05 | Preservar orden | Alta abierta | Ingresar secuencia conocida | Orden de dígitos intacto | Unitaria |
| T-06 | Preservar ceros | Alta abierta | Ingresar teléfono con ceros iniciales | Ceros iniciales visibles | UI automática |
| T-07 | Representar vacío | Formulario válido sin teléfono | Guardar | Payload y persistencia usan `null` | Integración UI/API |
| T-08 | Admitir 30 dígitos | Alta abierta | Ingresar exactamente 30 dígitos | Validación exitosa | UI/API integración |
| T-09 | Rechazar 31 dígitos | Alta abierta | Ingresar 31 dígitos y guardar | Error claro; valor no truncado ni enviado | UI automática |
| T-10 | Normalizar POST | Formulario válido | Crear con teléfono formateado | Payload contiene solo dígitos | Integración UI |
| T-11 | Normalizar PUT | Prestador existente | Editar con teléfono formateado | Payload PUT contiene solo dígitos | Integración UI |
| T-12 | Precargar edición | Teléfono con cero inicial almacenado | Abrir edición | Cadena completa y ceros preservados | UI automática |
| T-13 | Defender API | API disponible | POST/PUT con caracteres no numéricos | Respuesta y DB contienen solo dígitos | API integración |
| T-14 | Preservar ceros en API | API disponible | Enviar teléfono con ceros iniciales | Respuesta y DB preservan ceros | API integración |
| T-15 | Rechazar exceso en API | API disponible | Enviar más de 30 dígitos normalizados | HTTP 400 `VALIDATION_ERROR` | API integración |
| T-16 | Normalizar solo símbolos | API disponible | Enviar teléfono sin ningún dígito | Valor resultante `null` | API integración |
| T-17 | Verificar persistencia | Mutación exitosa | Consultar registro en PostgreSQL | `phone` es `null` o solo dígitos | DB integración |

## Casos dataset

| ID | Objetivo | Precondición | Pasos | Resultado esperado | Tipo |
|---|---|---|---|---|---|
| D-01 | Sembrar base vacía | Esquema vacío migrado | Ejecutar seed | 30 miembros creados | Seed integración |
| D-02 | Ampliar volumen V1 | Solo tres seeds V1 | Ejecutar seed V2 | Total físico 30; V1 conservados | Seed integración |
| D-03 | Verificar idempotencia | Seed V2 ejecutado | Ejecutarlo nuevamente | Mismos 30 miembros, sin duplicados | Seed integración |
| D-04 | Verificar conteo | Dataset sembrado | Contar CUIT administrados | Exactamente 30 | DB integración |
| D-05 | Verificar estados | Dataset sembrado | Agrupar por estado | 20 ACTIVE y 10 INACTIVE | DB integración |
| D-06 | Verificar CUIT | Dataset definido | Contar únicos y longitudes | 30 únicos de 11 dígitos | Unitaria/DB |
| D-07 | Verificar correos | Dataset definido | Validar todos los emails | 30 correos válidos | Unitaria |
| D-08 | Verificar determinismo | Dataset definido | Comparar dos ejecuciones | Valores administrados idénticos | Seed integración |
| D-09 | Verificar página 1 | Dataset sembrado | GET page=1&pageSize=10 | 10 items; totalItems 30; totalPages 3 | API integración |
| D-10 | Verificar página 2 | Dataset sembrado | GET page=2&pageSize=10 | 10 items; metadata correcta | API integración |
| D-11 | Verificar página 3 | Dataset sembrado | GET page=3&pageSize=10 | 10 items; metadata correcta | API integración |
| D-12 | Verificar página 4 | Dataset sembrado | GET page=4&pageSize=10 | 0 items; totalPages 3 | API integración |
| D-13 | Verificar filtro activo | Dataset sembrado | GET status=ACTIVE | totalItems 20 y solo ACTIVE | API integración |
| D-14 | Verificar filtro inactivo | Dataset sembrado | GET status=INACTIVE | totalItems 10 y solo INACTIVE | API integración |
| D-15 | Preservar datos ajenos | Registro controlado fuera del dataset | Ejecutar seed dos veces | Registro ajeno permanece intacto | Seed integración |
| D-16 | Verificar Docker limpio | Volumen del proyecto eliminado | Build y up autorizados | Migración y seed automáticos; servicios healthy | Docker manual |
| D-17 | Verificar reinicio | Docker healthy con 30 seeds | Reiniciar app y consultar | Conteo y distribución permanecen | Docker manual |

## Gates

| ID | Objetivo | Precondición | Pasos | Resultado esperado | Tipo |
|---|---|---|---|---|---|
| Q-01 | Validar lint | Dependencias instaladas | Ejecutar `npm.cmd run lint` | Cero errores | Gate automático |
| Q-02 | Validar tipos | Dependencias instaladas | Ejecutar `npm.cmd run typecheck` | Cero errores | Gate automático |
| Q-03 | Validar unitarias | Candidato listo | Ejecutar `npm.cmd run test:unit` | Todas verdes | Gate automático |
| Q-04 | Validar regresión | DB de test disponible | Ejecutar `npm.cmd test` | Suite completa verde | Gate automático |
| Q-05 | Validar build | Gates previos verdes | Ejecutar `npm.cmd run build` | Build exitoso | Gate automático |
| Q-06 | Validar Docker | Build local aprobado | Reconstruir desde volumen vacío | `app` y `db` healthy | Gate Docker |
| Q-07 | Auditar desktop | App healthy | Probar formulario, tabla, caret y consola | Presentación usable y sin errores | Visual manual |
| Q-08 | Auditar mobile | App healthy | Probar tarjetas, formulario y overflow | Presentación usable y sin overflow | Visual manual |
| Q-09 | Validar documentación | Evidencia disponible | Revisar estados y contratos | Sin contradicciones ni resultados anticipados | Gate documental |
| Q-10 | Cerrar TP-006 | Casos ejecutados | Completar informe y trazabilidad | Evidencia íntegra, Git limpio | Gate documental |

## Gates de aceptación

Todos los casos críticos de contratos, persistencia y seguridad de datos deben estar `PASS`. Un `FAIL` impide aceptación. Un `BLOCKED` debe resolverse o aceptarse expresamente antes de publicación.
