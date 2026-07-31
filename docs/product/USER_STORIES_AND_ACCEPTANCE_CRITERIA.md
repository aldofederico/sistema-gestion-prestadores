# Historias de usuario y criterios de aceptación V2

## Alcance

Este documento contiene únicamente historias funcionales observables por el
operador. Su estado inicial fue `PLANNED`; los estados finales se actualizaron
después de ejecutar TP-006.

## US-V2-001 — CUIT

Estado final: `ACCEPTED`

Como operador administrativo, quiero ingresar y visualizar el CUIT con su formato convencional, para reducir errores de carga y reconocer el dato con mayor facilidad.

### Criterios de aceptación

1. Al escribir números, el campo aplica progresivamente el patrón `XX-XXXXXXXX-X`.
2. Letras y símbolos se eliminan inmediatamente sin alterar el orden de los dígitos.
3. Pegar un CUIT con guiones produce la misma presentación convencional.
4. Uno o dos dígitos se muestran sin separador; desde el tercero aparece el primer guion; el último guion aparece al completar 11 dígitos.
5. Con 11 dígitos se muestra exactamente `XX-XXXXXXXX-X`.
6. No se conservan más de 11 dígitos en el campo.
7. Un CUIT incompleto impide guardar y muestra un error asociado al campo.
8. Un CUIT ya existente conserva la respuesta de conflicto y el error asociado al campo.
9. La tabla desktop muestra el CUIT con formato convencional.
10. Las tarjetas mobile muestran el mismo formato.
11. El payload de alta y edición contiene exactamente 11 dígitos sin separadores.
12. La API y PostgreSQL conservan exactamente 11 dígitos.
13. La búsqueda acepta texto de CUIT con o sin separadores y conserva sus coincidencias.
14. Al editar, el valor canónico recibido se precarga formateado.
15. Editar en medio del valor o reemplazar una selección mantiene un caret utilizable.
16. El campo conserva label, error, ayuda y navegación por teclado accesibles.
17. No se valida matemáticamente el dígito verificador.

## US-V2-002 — Teléfono

Estado final: `ACCEPTED`

Como operador administrativo, quiero que el teléfono conserve exclusivamente dígitos, para registrar el dato de forma homogénea sin imponer una máscara regional.

### Criterios de aceptación

1. La escritura numérica conserva orden y contenido.
2. Al pegar un teléfono formateado se eliminan espacios y separadores.
3. Letras y símbolos se eliminan inmediatamente.
4. Los ceros iniciales se preservan.
5. El campo no aplica máscara regional.
6. Un campo vacío se envía y persiste como `null`.
7. Exactamente 30 dígitos son válidos.
8. Con 31 o más dígitos el guardado se rechaza con un mensaje claro.
9. El exceso no se trunca silenciosamente.
10. El payload contiene solo dígitos o `null`.
11. Al editar se precarga la cadena almacenada sin perder ceros.
12. Una solicitud directa a la API también elimina caracteres no numéricos.
13. La API rechaza más de 30 dígitos después de normalizar.
14. Una entrada compuesta solo por caracteres no numéricos se representa como `null`.

## V2-REQ-003

`V2-REQ-003` es un habilitador técnico y no una historia de usuario. El dataset permite verificar paginación, filtros, Docker e idempotencia, pero no describe una interacción funcional nueva del operador.

## Evidencia de aceptación

- `US-V2-001`: C-01 a C-18 PASS; incluye corrección y reauditoría de C-16 y
  C-17 en `6eae92ef47a3c68fb9e1a396630b398a35efdc03`.
- `US-V2-002`: T-01 a T-17 PASS; teléfono limitado a 30 dígitos, exceso
  rechazado, `null` y ceros iniciales preservados.
- Informe: `docs/testing/TP-006_TEST_EXECUTION_REPORT.md`.
- Estado global: `TP-006: PASS_WITH_OBSERVATIONS`.

No se creó una historia para el dataset.
