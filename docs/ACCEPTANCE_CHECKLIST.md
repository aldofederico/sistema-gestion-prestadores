# Checklist de aceptación

Guía `VIGENTE` para una campaña manual reproducible. Registrar versión/commit,
fecha, ambiente, ejecutor y evidencia; no marcar `PASS` un caso no ejecutado.

## Preparación

- [ ] Ejecutar `docker compose up --build -d`.
- [ ] Ejecutar `docker compose ps`.
- [ ] Confirmar que `app` y `db` están `healthy`.
- [ ] Confirmar que el dataset administrado contiene 30 prestadores: 20
      `ACTIVE` y 10 `INACTIVE`.

## Health

- [ ] Consultar `GET http://localhost:3000/api/health`.
- [ ] Confirmar HTTP `200`, `status = ok` y `database = up`.

## Funcionalidad

- [ ] Listar prestadores y verificar el contrato paginado.
- [ ] Buscar por CUIT formateado y obtener la coincidencia esperada.
- [ ] Buscar parcialmente por razón social sin distinguir mayúsculas.
- [ ] Filtrar prestadores `ACTIVE`.
- [ ] Filtrar prestadores `INACTIVE`.
- [ ] Paginar y comprobar página, tamaño y totales.
- [ ] Crear un prestador y confirmar estado inicial `ACTIVE`.
- [ ] Validar CUIT, razón social y correo obligatorios; confirmar CUIT visual
      `XX-XXXXXXXX-X` y payload canónico de 11 dígitos.
- [ ] Enviar un teléfono formateado y confirmar persistencia de sólo dígitos,
      ceros iniciales y máximo de 30; vacío debe persistir como `null`.
- [ ] Repetir el CUIT y confirmar HTTP `409` con
      `PROVIDER_CUIT_CONFLICT`.
- [ ] Editar los campos y confirmar que `PUT` no cambia el estado.
- [ ] Desactivar con `PATCH /status`.
- [ ] Confirmar que el registro sigue físicamente almacenado.
- [ ] Reactivar con `PATCH /status`.
- [ ] Cerrar los diálogos con botón, `Escape` y guardado; comprobar que el foco
      vuelve al trigger o al contenido principal.
- [ ] Comprobar el comportamiento responsive: tabla en escritorio y tarjetas en
      móvil sin overflow horizontal.
- [ ] Abrir `GET /api/docs/` y confirmar Swagger UI funcional.
- [ ] Consultar `GET /api/openapi.json` y comprobar que documenta únicamente los
      endpoints implementados, sin `DELETE`.

## Calidad

- [ ] `npm.cmd run lint` finaliza sin errores.
- [ ] `npm.cmd run typecheck` finaliza sin errores.
- [ ] `npm.cmd test` finaliza sin fallos y se registra el total informado por el
      runner; el antecedente V2.1 es 129/129 PASS.
- [ ] `npm.cmd run build` finaliza correctamente.
- [ ] `git diff --check` no informa errores.

## Cierre

- [ ] Ejecutar `docker compose down`.
- [ ] Confirmar que no quedan contenedores activos con `docker compose ps`.
- [ ] Confirmar que no quedan recursos del Compose de pruebas.
- [ ] Ejecutar `git status --short` y confirmar únicamente los cambios
      intencionales pendientes de commit, o salida vacía después del commit.
