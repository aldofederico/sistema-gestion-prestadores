# Plan de implementación V2

Estado: `EXECUTION_COMPLETE_PENDING_PUBLICATION`

Las secciones de secuencia, impacto y commits previstos conservan el plan
original. El apartado de ejecución al final distingue lo previsto de lo
realmente realizado.

## Objetivo y base

Planificar la implementación controlada de `CR-V2-001` desde la línea base V1 `91df3e5b300fba1d050ef9250164849852d3ef9a`, sin modificar arquitectura, contratos públicos, dependencias, schema ni migraciones.

## Secuencia

1. Versionar documentación previa, trazabilidad y TP-006.
2. Incorporar utilidades puras frontend para dígitos y formato CUIT.
3. Integrar máscara CUIT en alta y edición, incluyendo caret y accesibilidad.
4. Aplicar presentación CUIT en tabla y tarjetas.
5. Sanear teléfono inmediatamente en frontend y normalizar payload.
6. Centralizar normalización defensiva backend para CUIT, teléfono y búsqueda.
7. Ampliar el dataset de seed a 30 miembros con función testeable.
8. Completar pruebas automatizadas junto a cada cambio funcional.
9. Ejecutar lint, typecheck, suite completa y build.
10. Reconstruir Docker desde volumen vacío y validar seed y persistencia.
11. Ejecutar pruebas manuales de TP-006.
12. Auditar visualmente desktop y mobile, incluyendo caret y overflow.
13. Completar el informe TP-006 y la matriz de trazabilidad.
14. Actualizar README, checklist y documentación final.
15. Crear la retrospectiva V2.
16. Publicar únicamente después de aceptación y autorización específicas.

## Mapa de impacto

| Área | Archivo previsto | Responsabilidad |
|---|---|---|
| CUIT frontend | `client/src/utils/provider-normalization.ts` | Dígitos, valor canónico y formato parcial/completo |
| Formulario | `client/src/components/ProviderFormDialog.tsx` | Máscara, pegado, caret, teléfono y accesibilidad |
| Conversión | `client/src/schemas/provider.ts` | Validación, precarga y payload |
| Presentación | `client/src/components/ProviderTable.tsx` | CUIT desktop formateado |
| Presentación | `client/src/components/ProviderCards.tsx` | CUIT mobile formateado |
| Pruebas UI | `client/src/App.test.tsx` | Casos CUIT, teléfono, payload y responsive |
| Backend | `server/src/providers/provider.normalization.ts` | Normalización defensiva común |
| Backend | `server/src/providers/provider.schemas.ts` | CUIT y teléfono canónicos |
| Búsqueda | `server/src/providers/provider.service.ts` | Reutilización sin cambio semántico |
| Seed | `prisma/provider-seed.ts` | Dataset fijo y función de upsert testeable |
| Seed | `prisma/seed.ts` | Ejecución del seed |
| Integración | `server/test/providers.integration.test.ts` | API, persistencia, seed y paginación |
| Documentación | `README.md`, `docs/ACCEPTANCE_CHECKLIST.md`, `AGENTS.md` | Estado final, operación y gobierno |

No se prevén cambios en rutas, controladores, tipos públicos, cliente API, Prisma schema, migraciones, Compose, Dockerfile, `package.json` o lockfiles.

## Decisiones de diseño

- Usar funciones puras y dependencias existentes.
- Unificar normalización dentro de cada capa; mantener defensa independiente entre frontend y backend.
- Representar el CUIT formateado solo en UI y canónico en payload/DB.
- Mantener el teléfono como cadena; nunca convertirlo a número.
- Rechazar más de 30 dígitos telefónicos en lugar de truncarlos.
- Administrar el dataset mediante una lista fija de 30 CUIT y `upsert`; nunca usar borrado masivo en el seed.
- Mantener nombres del seed diferenciables para preservar orden determinista.

## Commits previstos

1. `docs: define v2 scope and test protocol`
2. `feat: normalize provider identifiers and phone data`
3. `feat: expand deterministic provider seed dataset`
4. `docs: finalize v2 validation and retrospective`

Cada commit funcional incluye sus pruebas. No se permite amend, squash retrospectivo, rebase destructivo, force push ni publicación antes de la aceptación final.

## Estimación operativa

- Objetivo: 8–12 horas activas.
- Umbral de revisión: 14 horas.
- Límite sin autorización adicional: 16 horas.
- Contingencia máxima estimada: 21–23 horas.

Al alcanzar el umbral se revisarán riesgos, alcance y trabajo restante. Al alcanzar 16 horas se detendrá la ejecución hasta obtener nueva autorización.

## Gates

| Gate | Criterio de aprobación |
|---|---|
| Git inicial | Rama/base correctas y árbol limpio |
| Alcance | Solo archivos previstos; sin dependencias, schema ni migraciones |
| Lint | Cero errores |
| Typecheck | Cero errores |
| Pruebas unitarias | Todos los casos frontend y health verdes |
| Regresión completa | Suite completa verde, incluido TP-006 automatizado |
| Build | Frontend y backend compilados |
| Docker limpio | Rebuild desde volumen vacío; `app` y `db` healthy |
| Seed | 30 miembros, 20/10, idempotencia y datos ajenos intactos |
| Manual | Todos los casos manuales TP-006 PASS |
| Visual desktop | Máscara, caret, tabla y diálogos verificados |
| Visual mobile | Tarjetas, formulario y ausencia de overflow verificados |
| Documentación | Trazabilidad completa y estados no contradictorios |
| Publicación | Autorización explícita, Git limpio y commits aprobados |

## Detención y rollback

Detener la implementación si se requiere una dependencia, migración, cambio de API/arquitectura, si una prueba permanece fallando tras los ciclos autorizados o si se detecta riesgo sobre datos ajenos. El rollback se limita a commits V2 y nunca reescribe V1.

## Ejecución real

- Implementación: completada.
- Pruebas automatizadas y técnicas: completadas.
- Auditoría desktop, mobile y accesibilidad: completada.
- Documentación final: completada durante V2-08.
- Publicación: todavía pendiente.
- TP-006: `PASS_WITH_OBSERVATIONS`.
- Defectos funcionales abiertos: ninguno.

### Commits ejecutados

| Clasificación | Commit | Relación con el plan |
|---|---|---|
| C1 | `0e61d35ad210685ba3827dac7d991b4a3fc3cce8` | Previsto |
| C2 | `09f6313e8b5744292202ee74752d8ef6f34e2095` | Previsto |
| C2A | `979ec3cc3f0395b30286728491ac3d2f98df1ab2` | Corrección controlada no prevista: discovery de `*.test.ts` |
| C3 | `d3e019c2fbb5864bc800665c4ef9907a1b79ac72` | Previsto |
| C3A | `6eae92ef47a3c68fb9e1a396630b398a35efdc03` | Corrección controlada no prevista: C-16 y C-17 |

El commit documental final corresponde al cuarto mensaje previsto y se crea
solo después de validar los diez documentos autorizados.

### Desviaciones e iteraciones

- C2A corrigió una omisión del patrón de discovery de Vitest.
- V2-07 detectó dos defectos MEDIUM reproducibles y quedó `BLOCKED`.
- C3A corrigió ambos defectos y agregó doce pruebas.
- El primer V2-07B quedó `BLOCKED` porque Browser/CDP de Codex no estuvo
  disponible y el ambiente tenía un registro ajeno.
- V2-07B-R se ejecutó mediante Cursor Browser sobre el ambiente restaurado y
  terminó `COMPLETE`.
- Los estados `BLOCKED` intermedios se preservan como historial; no contradicen
  el cierre final.
- `docs/ACCEPTANCE_CHECKLIST.md` permanece como evidencia V1 y no fue
  reescrito durante el cierre V2.
