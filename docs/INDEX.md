# Índice de documentación

Este índice es la puerta de entrada a la documentación vigente del Sistema de
Gestión de Prestadores. El código, el esquema Prisma y la especificación
OpenAPI prevalecen para el comportamiento ejecutable; los documentos explican
su propósito, operación y evidencia sin duplicarlos.

## Clasificación

| Clase | Uso |
|---|---|
| `VIGENTE` | Guía mantenida junto con el producto actual. |
| `HISTÓRICO` | Fotografía de una decisión o fase cerrada; no define el estado actual. |
| `EVIDENCIA` | Resultado observado de una ejecución o validación fechada. |
| `REFERENCIA` | Detalle de apoyo enlazado desde una fuente vigente. |

## Fuentes vigentes

| Tema | Documento | Clase |
|---|---|---|
| Entrada, instalación y demo | [README](../README.md) | `VIGENTE` |
| Arquitectura implementada | [Arquitectura](architecture/ARCHITECTURE.md) | `VIGENTE` |
| Proceso de desarrollo y entrega | [Proceso](process/DEVELOPMENT_PROCESS.md) | `VIGENTE` |
| Estrategia de calidad | [Calidad](quality/QUALITY_STRATEGY.md) | `VIGENTE` |
| Aceptación manual reutilizable | [Checklist de aceptación](ACCEPTANCE_CHECKLIST.md) | `VIGENTE` |
| Despliegue de demo | [Render](deployment/RENDER_DEPLOYMENT.md) | `VIGENTE` |
| Contrato HTTP | [Swagger UI](http://localhost:3000/api/docs/) / [OpenAPI JSON](http://localhost:3000/api/openapi.json) | `VIGENTE`, generado en runtime |

## Producto y trazabilidad

| Documento | Propósito | Clase |
|---|---|---|
| [Historias y criterios](product/USER_STORIES_AND_ACCEPTANCE_CRITERIA.md) | Comportamiento V2 aceptado | `HISTÓRICO` |
| [Trazabilidad](product/REQUIREMENTS_TRACEABILITY.md) | Requisito → código → prueba → resultado | `HISTÓRICO` |
| [Habilitadores técnicos](product/TECHNICAL_ENABLERS.md) | Decisiones técnicas de V2 | `HISTÓRICO` |
| [CR-V2-001](v2/CR-V2-001.md) | Alcance, exclusiones y resultado del cambio V2 | `HISTÓRICO` |
| [Plan V2](v2/IMPLEMENTATION_PLAN_V2.md) | Plan previo de implementación | `HISTÓRICO` |

## Diagramas

| Vista | Formatos | Clase |
|---|---|---|
| [Contexto](architecture/diagrams/system-context.svg) | [Mermaid](architecture/diagrams/system-context.mmd) · [SVG](architecture/diagrams/system-context.svg) · [PNG](architecture/diagrams/system-context.png) | `VIGENTE` |
| [Contenedores y despliegue](architecture/diagrams/container-deployment.svg) | [Mermaid](architecture/diagrams/container-deployment.mmd) · [SVG](architecture/diagrams/container-deployment.svg) · [PNG](architecture/diagrams/container-deployment.png) | `VIGENTE` |
| [Componentes de aplicación](architecture/diagrams/application-components.svg) | [Mermaid](architecture/diagrams/application-components.mmd) · [SVG](architecture/diagrams/application-components.svg) · [PNG](architecture/diagrams/application-components.png) | `VIGENTE` |
| [Arquitectura integral](architecture/diagrams/system-architecture.svg) | [Mermaid](architecture/diagrams/system-architecture.mmd) · [SVG](architecture/diagrams/system-architecture.svg) · [PNG](architecture/diagrams/system-architecture.png) | `VIGENTE` |
| [Proceso de desarrollo y entrega](process/diagrams/development-delivery-process.svg) | [Mermaid](process/diagrams/development-delivery-process.mmd) · [SVG](process/diagrams/development-delivery-process.svg) · [PNG](process/diagrams/development-delivery-process.png) | `VIGENTE` |

## Calidad y evidencia histórica

| Documento | Propósito | Clase |
|---|---|---|
| [TP-006 — protocolo](testing/TP-006_TEST_PROTOCOL.md) | Intención y casos congelados antes de ejecutar | `HISTÓRICO` |
| [TP-006 — ejecución](testing/TP-006_TEST_EXECUTION_REPORT.md) | Resultado de la campaña V2 | `EVIDENCIA` |
| [Registro V2](process/V2_EXECUTION_LOG.md) | Tareas, errores y telemetría confirmada | `EVIDENCIA` |
| [Retrospectiva V2](process/V2_RETROSPECTIVE.md) | Aprendizajes y acciones del ciclo | `HISTÓRICO` |
| [Validación pública Render](deployment/RENDER_DEPLOYMENT_VALIDATION.md) | Smoke test público fechado | `EVIDENCIA` |

## Reglas de mantenimiento

- Actualizar una única fuente vigente por tema y enlazarla desde el README.
- Conservar protocolos, informes, logs y retrospectivas como historia; no
  reescribirlos para reflejar resultados posteriores.
- Actualizar OpenAPI cuando cambie el contrato runtime y validar sus referencias.
- Añadir un documento sólo cuando reduzca ambigüedad o sea evidencia necesaria.
- Registrar decisiones futuras fuera del alcance como deuda o decisión abierta,
  no como componentes ya implementados.
