# Sistema de Gestión de Prestadores

## Objetivo funcional

Aplicación web para administrar prestadores de salud mediante una interfaz
responsive y una API REST con persistencia PostgreSQL.

## Funcionalidades implementadas

- Listado, búsqueda parcial por CUIT o razón social y filtro por estado.
- Paginación estable de resultados.
- Alta y edición de prestadores.
- Baja lógica y reactivación con confirmación.
- Validaciones de formulario y respuestas de error uniformes.
- Tabla en escritorio y tarjetas en dispositivos móviles.
- Health check con verificación real de la conexión a PostgreSQL.

## Stack

- Frontend: React, TypeScript, Vite, Material UI, React Hook Form y Zod.
- Backend: Node.js, Express, TypeScript, Zod y Prisma.
- Persistencia: PostgreSQL.
- Pruebas: Vitest, React Testing Library y Supertest.
- Infraestructura local: Docker Compose.

## Arquitectura

Docker Compose contiene exactamente dos servicios:

- `app`: construye el frontend, ejecuta Express y publica el puerto `3000`.
- `db`: ejecuta PostgreSQL dentro de la red privada de Compose.

Express sirve `/api/*`, los archivos compilados del frontend y el fallback de la
SPA desde el mismo origen. PostgreSQL no publica el puerto `5432` al host en la
ejecución principal.

## Requisitos previos

- Docker Desktop iniciado, con Docker Compose disponible.
- Node.js 24.x y npm para ejecutar comandos de calidad fuera de Docker.

## Ejecución principal

```powershell
docker compose up --build
```

La primera construcción puede demorar mientras Docker descarga las imágenes e
instala las dependencias. Cuando ambos servicios estén saludables:

- Aplicación: <http://localhost:3000>
- Health: <http://localhost:3000/api/health>

Para detener los servicios y conservar la base:

```powershell
docker compose down
```

Para borrar únicamente los datos Docker de este proyecto y reconstruir desde
cero:

```powershell
docker compose down -v
docker compose up --build
```

## Datos iniciales

El arranque aplica las migraciones y ejecuta un seed idempotente. El seed crea
un dataset administrado de 30 prestadores ficticios mediante `upsert` por CUIT:
20 activos y 10 inactivos. Conserva los tres registros V1, agrega 27 y no
elimina datos ajenos. Con `pageSize=10` produce tres páginas completas y una
cuarta vacía. Ejecutarlo nuevamente no duplica registros.

El estado inicial de un prestador nuevo es `ACTIVE`. Un prestador desactivado
permanece físicamente almacenado y puede reactivarse.

## Comandos de calidad

| Comando | Propósito |
| --- | --- |
| `npm.cmd ci` | Instala exactamente las dependencias del lockfile |
| `npm.cmd run db:generate` | Genera Prisma Client |
| `npm.cmd run lint` | Ejecuta ESLint |
| `npm.cmd run typecheck` | Valida TypeScript estricto |
| `npm.cmd run test:unit` | Ejecuta pruebas rápidas de frontend y health |
| `npm.cmd test` | Ejecuta la suite completa con PostgreSQL aislado |
| `npm.cmd run build` | Compila frontend y backend |
| `npm.cmd audit --audit-level=high` | Audita vulnerabilidades de dependencias |

## Pruebas

`npm.cmd test` levanta PostgreSQL con `compose.test.yaml`, crea la base lógica
aislada `providers_test`, aplica las migraciones y ejecuta Vitest. La base de
desarrollo `providers` no se usa en las pruebas de integración.

Las pruebas cubren health, validaciones, contratos API, persistencia, búsqueda,
filtros, paginación, formularios, mutaciones, feedback y variantes responsive.
El estado final V2 contiene 99 pruebas únicas verdes.

El protocolo V2 previo a la ejecución está en
[`docs/testing/TP-006_TEST_PROTOCOL.md`](docs/testing/TP-006_TEST_PROTOCOL.md);
el resultado observado está en
[`docs/testing/TP-006_TEST_EXECUTION_REPORT.md`](docs/testing/TP-006_TEST_EXECUTION_REPORT.md)
y la retrospectiva en
[`docs/process/V2_RETROSPECTIVE.md`](docs/process/V2_RETROSPECTIVE.md).
El checklist manual reutilizable está en
[`docs/ACCEPTANCE_CHECKLIST.md`](docs/ACCEPTANCE_CHECKLIST.md).

## API

| Método | Ruta | Responsabilidad |
| --- | --- | --- |
| `GET` | `/api/health` | Estado del proceso y conectividad de base |
| `GET` | `/api/providers` | Listado, búsqueda, filtro y paginación |
| `POST` | `/api/providers` | Alta con estado inicial `ACTIVE` |
| `PUT` | `/api/providers/:id` | Reemplazo de los campos editables |
| `PATCH` | `/api/providers/:id/status` | Baja lógica o reactivación |

Ejemplos:

- `/api/providers?search=30-700&page=1&pageSize=10`
- `/api/providers?status=ACTIVE&page=1&pageSize=10`

Contrato paginado:

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 0,
    "totalPages": 0
  }
}
```

Contrato de error:

```json
{
  "error": {
    "code": "STABLE_ERROR_CODE",
    "message": "Mensaje legible",
    "details": {}
  }
}
```

No existe endpoint `DELETE`.

## Validaciones

- CUIT obligatorio, único y normalizado a exactamente 11 dígitos en API y
  PostgreSQL; la interfaz aplica el formato visual `XX-XXXXXXXX-X`.
- No se valida el dígito verificador del CUIT.
- Razón social obligatoria.
- Correo electrónico obligatorio, válido y normalizado a minúsculas.
- Teléfono opcional, conservado como cadena de solo dígitos o `null`, con
  máximo de 30 dígitos y sin truncamiento silencioso.
- Campos opcionales vacíos almacenados como `null`.
- Estado admitido: `ACTIVE` o `INACTIVE`.
- `POST` fuerza el estado inicial `ACTIVE`.
- `PUT` no acepta ni modifica el estado.
- Solo `PATCH /api/providers/:id/status` cambia el estado.
- Paginación por defecto: `page=1`, `pageSize=10`; máximo: `100`.
- Orden estable: razón social ascendente e identificador ascendente.

## Estructura del repositorio

```text
client/             Interfaz React
server/             API Express y pruebas del servidor
prisma/             Esquema, migraciones y seed
scripts/            Arranque, limpieza y orquestación de pruebas
compose.yaml        Ejecución principal
compose.test.yaml   Exposición aislada de PostgreSQL para pruebas
Dockerfile          Build multietapa y runtime de producción
docs/testing/       Protocolos e informes de ejecución
docs/process/       Logs y retrospectivas
docs/product/       Historias, habilitadores y trazabilidad
docs/v2/            Cambio y plan V2
```

## Decisiones técnicas

- Un solo proyecto npm y un único origen HTTP reducen la configuración local.
- El frontend usa `fetch` nativo y cancela búsquedas obsoletas.
- La búsqueda aplica debounce de 300 ms.
- Las migraciones y el seed se ejecutan antes de iniciar Express.
- La baja es lógica para conservar trazabilidad y permitir reactivación.
- La base de pruebas está aislada de los datos de desarrollo.

## Troubleshooting

- Si Docker no responde, iniciar Docker Desktop y repetir el comando principal.
- Si el puerto `3000` está ocupado, liberar ese puerto antes de iniciar Compose.
- Para inspeccionar salud y logs: `docker compose ps` y
  `docker compose logs --no-color`.
- Si una base local descartable quedó inconsistente, ejecutar
  `docker compose down -v` y reconstruir.

## Limitaciones deliberadas

El alcance no incluye autenticación, autorización, Swagger, routing frontend,
CI/CD ni despliegue. No existe eliminación física ni endpoint `DELETE`.
Swagger no forma parte del challenge y la autenticación no fue requerida.

## Estado V2

Estado de esta rama: V2 validada, pendiente de publicación.

TP-006 finalizó `PASS_WITH_OBSERVATIONS`: todos los casos y gates pasaron, los
dos defectos MEDIUM detectados fueron corregidos y verificados, y no quedan
defectos funcionales abiertos. La rama no fue fusionada ni publicada.
