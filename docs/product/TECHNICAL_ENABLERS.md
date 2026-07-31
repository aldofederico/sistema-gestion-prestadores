# Habilitadores técnicos V2

Los habilitadores sostienen requisitos funcionales, calidad y trazabilidad. No son historias de usuario y su estado inicial es `PLANNED`.

## EN-V2-001 — Utilidades frontend de normalización y formato

- Propósito: centralizar saneamiento, valor canónico y presentación del CUIT y teléfono.
- Requisitos relacionados: `V2-REQ-001`, `V2-REQ-002`.
- Resultado esperado: formulario, tabla, tarjetas y payload utilizan funciones puras coherentes.
- Exclusiones: dependencias de máscara, validación matemática de CUIT y máscara telefónica.
- Riesgos: caret inestable, presentación distinta entre vistas o máscara filtrada al payload.
- Pruebas asociadas: `C-01` a `C-13`, `C-16`, `C-17`, `T-01` a `T-12`.

## EN-V2-002 — Normalización defensiva backend

- Propósito: proteger persistencia y búsqueda aunque un cliente omita el saneamiento.
- Requisitos relacionados: `V2-REQ-001`, `V2-REQ-002`.
- Resultado esperado: CUIT canónico de 11 dígitos y teléfono de hasta 30 dígitos o `null`.
- Exclusiones: cambios de endpoint, forma de respuesta, schema, migración o validación regional.
- Riesgos: regresión de búsqueda, error de unicidad o aplicación del límite antes de normalizar.
- Pruebas asociadas: `C-14`, `C-15`, `C-18`, `T-13` a `T-17`.

## EN-V2-003 — Dataset determinista y testeable

- Propósito: disponer de 30 miembros iniciales reproducibles para paginación y filtros.
- Requisito relacionado: `V2-REQ-003`.
- Resultado esperado: 20 activos, 10 inactivos, tres páginas completas e idempotencia.
- Exclusiones: borrar datos ajenos, cambiar esquema, migraciones o paginación.
- Riesgos: CUIT duplicados, distribución incorrecta, orden inestable o colisión con datos ajenos.
- Pruebas asociadas: `D-01` a `D-17`.

## EN-V2-004 — Ciclo formal TP-006

- Propósito: definir aceptación antes de implementar y separar protocolo de evidencia observada.
- Requisitos relacionados: los tres requisitos V2.
- Resultado esperado: casos, tipos, precondiciones y expected results aprobados; informe posterior verificable.
- Exclusiones: registrar resultados anticipados o afirmar ejecución durante planificación.
- Riesgos: cobertura incompleta o estados documentales incorrectos.
- Pruebas asociadas: `C-01` a `C-18`, `T-01` a `T-17`, `D-01` a `D-17`, `Q-01` a `Q-10`.

## EN-V2-005 — Trazabilidad y telemetría V2

- Propósito: relacionar requisito, regla, código, prueba, commit, tiempo e incidencia.
- Requisitos relacionados: gobierno transversal de V2.
- Resultado esperado: matriz actualizada por etapa y ejecución registrada sin métricas inventadas.
- Exclusiones: usar telemetría como sustituto de pruebas o modificar retrospectivamente evidencia V1.
- Riesgos: documentación contradictoria, tiempos falsos o pérdida de decisiones.
- Pruebas asociadas: gates documentales `Q-09` y `Q-10`.
