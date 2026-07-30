# Checklist de aceptación

## Preparación

- [ ] Ejecutar `docker compose up --build -d`.
- [ ] Ejecutar `docker compose ps`.
- [ ] Confirmar que `app` y `db` están `healthy`.

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
- [ ] Validar CUIT, razón social y correo obligatorios.
- [ ] Repetir el CUIT y confirmar HTTP `409` con
      `PROVIDER_CUIT_CONFLICT`.
- [ ] Editar los campos y confirmar que `PUT` no cambia el estado.
- [ ] Desactivar con `PATCH /status`.
- [ ] Confirmar que el registro sigue físicamente almacenado.
- [ ] Reactivar con `PATCH /status`.
- [ ] Comprobar el comportamiento responsive: tabla en escritorio y tarjetas en móvil sin overflow horizontal.

## Calidad

- [ ] `npm.cmd run lint` finaliza sin errores.
- [ ] `npm.cmd run typecheck` finaliza sin errores.
- [ ] `npm.cmd test` ejecuta al menos 50 pruebas verdes.
- [ ] `npm.cmd run build` finaliza correctamente.

## Cierre

- [ ] Ejecutar `docker compose down`.
- [ ] Confirmar que no quedan contenedores activos con `docker compose ps`.
- [ ] Ejecutar `git status --short` y confirmar salida vacía.
