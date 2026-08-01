const errorResponseContent = {
  "application/json": {
    schema: { $ref: "#/components/schemas/ErrorResponse" }
  }
} as const;

const validationErrorResponse = {
  description: "La solicitud no cumple el contrato de entrada.",
  content: errorResponseContent
} as const;

const internalErrorResponse = {
  description: "Ocurrió un error interno inesperado.",
  content: errorResponseContent
} as const;

const editableProviderProperties = {
  cuit: {
    type: "string",
    minLength: 11,
    maxLength: 11,
    pattern: "^\\d{11}$",
    description:
      "CUIT normalizado a exactamente 11 dígitos. La API admite entrada con formato y persiste solo dígitos.",
    example: "20999999991"
  },
  businessName: {
    type: "string",
    minLength: 1,
    maxLength: 160,
    description: "Razón social sin espacios exteriores.",
    example: "Prestador Demo Norte SRL"
  },
  province: {
    type: "string",
    nullable: true,
    maxLength: 100,
    description: "Provincia opcional; vacío se almacena como null.",
    example: "Buenos Aires"
  },
  locality: {
    type: "string",
    nullable: true,
    maxLength: 100,
    description: "Localidad opcional; vacío se almacena como null.",
    example: "Mar del Plata"
  },
  email: {
    type: "string",
    format: "email",
    maxLength: 254,
    description: "Correo válido normalizado a minúsculas.",
    example: "contacto@prestador-demo.test"
  },
  phone: {
    type: "string",
    nullable: true,
    minLength: 1,
    maxLength: 30,
    pattern: "^\\d{1,30}$",
    description:
      "Teléfono opcional. La API conserva únicamente dígitos, incluidos los ceros iniciales; vacío se almacena como null.",
    example: "01155550101"
  }
} as const;

export const openApiDocument = {
  openapi: "3.0.4",
  info: {
    title: "Sistema de Gestión de Prestadores API",
    version: "2.1.0",
    description:
      "API REST para listar, buscar, filtrar, crear, modificar, desactivar y reactivar prestadores."
  },
  servers: [{ url: "/", description: "Mismo origen que la aplicación" }],
  tags: [
    { name: "Health", description: "Salud del proceso y PostgreSQL." },
    { name: "Providers", description: "Gestión de prestadores." }
  ],
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Consultar la salud de la aplicación",
        operationId: "getHealth",
        responses: {
          "200": {
            description: "El proceso y PostgreSQL están disponibles.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" },
                example: { status: "ok", database: "up" }
              }
            }
          },
          "503": {
            description: "PostgreSQL no está disponible.",
            content: errorResponseContent
          }
        }
      }
    },
    "/api/providers": {
      get: {
        tags: ["Providers"],
        summary: "Listar prestadores",
        description:
          "Busca parcialmente por razón social sin distinguir mayúsculas o por los dígitos del CUIT, combina la búsqueda con el filtro de estado y ordena por businessName ASC e id ASC.",
        operationId: "listProviders",
        parameters: [
          {
            name: "search",
            in: "query",
            required: false,
            description: "Texto parcial de razón social o CUIT con o sin formato.",
            schema: { type: "string" },
            example: "20-999"
          },
          {
            name: "status",
            in: "query",
            required: false,
            description: "Estado exacto del prestador.",
            schema: { $ref: "#/components/schemas/ProviderStatus" }
          },
          {
            name: "page",
            in: "query",
            required: false,
            description: "Página solicitada, comenzando en 1.",
            schema: { type: "integer", minimum: 1, default: 1 },
            example: 1
          },
          {
            name: "pageSize",
            in: "query",
            required: false,
            description: "Cantidad de prestadores por página.",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 10
            },
            example: 10
          }
        ],
        responses: {
          "200": {
            description: "Listado paginado de prestadores.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PaginatedProvidersResponse"
                }
              }
            }
          },
          "400": validationErrorResponse,
          "500": internalErrorResponse
        }
      },
      post: {
        tags: ["Providers"],
        summary: "Crear un prestador",
        description:
          "Crea un prestador con estado inicial ACTIVE. Normaliza CUIT, correo, campos opcionales y teléfono.",
        operationId: "createProvider",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateProviderRequest" }
            }
          }
        },
        responses: {
          "201": {
            description: "Prestador creado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Provider" }
              }
            }
          },
          "400": validationErrorResponse,
          "409": {
            description: "Ya existe un prestador con el CUIT normalizado.",
            content: errorResponseContent
          },
          "500": internalErrorResponse
        }
      }
    },
    "/api/providers/{id}": {
      put: {
        tags: ["Providers"],
        summary: "Modificar un prestador",
        description:
          "Reemplaza todos los campos editables sin aceptar ni modificar el estado.",
        operationId: "updateProvider",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Identificador UUID del prestador.",
            schema: { type: "string", format: "uuid" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateProviderRequest" }
            }
          }
        },
        responses: {
          "200": {
            description: "Prestador modificado sin alterar su estado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Provider" }
              }
            }
          },
          "400": validationErrorResponse,
          "404": {
            description: "Prestador no encontrado.",
            content: errorResponseContent
          },
          "409": {
            description: "Ya existe otro prestador con el CUIT normalizado.",
            content: errorResponseContent
          },
          "500": internalErrorResponse
        }
      }
    },
    "/api/providers/{id}/status": {
      patch: {
        tags: ["Providers"],
        summary: "Cambiar el estado de un prestador",
        description:
          "Realiza la baja lógica mediante INACTIVE o reactiva mediante ACTIVE; no elimina registros.",
        operationId: "updateProviderStatus",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Identificador UUID del prestador.",
            schema: { type: "string", format: "uuid" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProviderStatusRequest" }
            }
          }
        },
        responses: {
          "200": {
            description: "Estado actualizado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Provider" }
              }
            }
          },
          "400": validationErrorResponse,
          "404": {
            description: "Prestador no encontrado.",
            content: errorResponseContent
          },
          "500": internalErrorResponse
        }
      }
    }
  },
  components: {
    schemas: {
      ProviderStatus: {
        type: "string",
        enum: ["ACTIVE", "INACTIVE"],
        description: "Estado lógico del prestador.",
        example: "ACTIVE"
      },
      Provider: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "cuit",
          "businessName",
          "province",
          "locality",
          "email",
          "phone",
          "status",
          "createdAt",
          "updatedAt"
        ],
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "11111111-1111-4111-8111-111111111111"
          },
          ...editableProviderProperties,
          status: { $ref: "#/components/schemas/ProviderStatus" },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2026-01-15T12:00:00.000Z"
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2026-01-15T12:00:00.000Z"
          }
        }
      },
      EditableProviderFields: {
        type: "object",
        additionalProperties: false,
        required: ["cuit", "businessName", "email"],
        properties: editableProviderProperties
      },
      CreateProviderRequest: {
        allOf: [{ $ref: "#/components/schemas/EditableProviderFields" }],
        description:
          "Campos de alta. No admite status; el backend crea siempre con ACTIVE."
      },
      UpdateProviderRequest: {
        allOf: [{ $ref: "#/components/schemas/EditableProviderFields" }],
        description:
          "Campos editables. No admite status; PUT conserva el estado existente."
      },
      ProviderStatusRequest: {
        type: "object",
        additionalProperties: false,
        required: ["status"],
        properties: {
          status: { $ref: "#/components/schemas/ProviderStatus" }
        },
        example: { status: "INACTIVE" }
      },
      Pagination: {
        type: "object",
        additionalProperties: false,
        required: ["page", "pageSize", "totalItems", "totalPages"],
        properties: {
          page: { type: "integer", minimum: 1, example: 1 },
          pageSize: {
            type: "integer",
            minimum: 1,
            maximum: 100,
            example: 10
          },
          totalItems: { type: "integer", minimum: 0, example: 30 },
          totalPages: { type: "integer", minimum: 0, example: 3 }
        }
      },
      PaginatedProvidersResponse: {
        type: "object",
        additionalProperties: false,
        required: ["items", "pagination"],
        properties: {
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/Provider" }
          },
          pagination: { $ref: "#/components/schemas/Pagination" }
        }
      },
      HealthResponse: {
        type: "object",
        additionalProperties: false,
        required: ["status", "database"],
        properties: {
          status: { type: "string", enum: ["ok"], example: "ok" },
          database: { type: "string", enum: ["up"], example: "up" }
        }
      },
      ErrorDetail: {
        type: "object",
        additionalProperties: false,
        required: ["path", "message"],
        properties: {
          path: { type: "string", example: "email" },
          message: {
            type: "string",
            example: "Correo electrónico inválido"
          }
        }
      },
      ErrorResponse: {
        type: "object",
        additionalProperties: false,
        required: ["error"],
        properties: {
          error: {
            type: "object",
            additionalProperties: false,
            required: ["code", "message"],
            properties: {
              code: {
                type: "string",
                enum: [
                  "VALIDATION_ERROR",
                  "PROVIDER_NOT_FOUND",
                  "PROVIDER_CUIT_CONFLICT",
                  "DATABASE_UNAVAILABLE",
                  "INTERNAL_ERROR"
                ],
                example: "VALIDATION_ERROR"
              },
              message: { type: "string", example: "Solicitud inválida." },
              details: {
                type: "object",
                additionalProperties: false,
                required: ["fields"],
                properties: {
                  fields: {
                    type: "array",
                    items: { $ref: "#/components/schemas/ErrorDetail" }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
} as const;