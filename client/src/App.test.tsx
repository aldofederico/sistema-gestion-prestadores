import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import type { Provider, ProviderListResponse } from "./types/provider";

const provider: Provider = {
  id: "00000000-0000-4000-8000-000000000001",
  cuit: "20123456789",
  businessName: "Prestador Uno",
  province: "Buenos Aires",
  locality: "La Plata",
  email: "uno@ejemplo.test",
  phone: "2215550101",
  status: "ACTIVE",
  createdAt: "2026-07-30T18:00:00.000Z",
  updatedAt: "2026-07-30T18:00:00.000Z"
};

const emptyList: ProviderListResponse = {
  items: [],
  pagination: {
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  }
};

const listWithProvider = (
  item: Provider = provider,
  totalPages = 1
): ProviderListResponse => ({
  items: [item],
  pagination: {
    page: 1,
    pageSize: 10,
    totalItems: totalPages > 1 ? 11 : 1,
    totalPages
  }
});

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });

const fetchMock = vi.fn<typeof fetch>();

const openCreateDialog = async () => {
  fireEvent.click(screen.getByRole("button", { name: "Nuevo prestador" }));
  return screen.findByRole("dialog", { name: "Nuevo prestador" });
};

const fillRequiredFields = (dialog: HTMLElement) => {
  fireEvent.change(within(dialog).getByLabelText("CUIT"), {
    target: { value: "20-12345678-9" }
  });
  fireEvent.change(within(dialog).getByLabelText("Razón social"), {
    target: { value: "Prestador Nuevo" }
  });
  fireEvent.change(within(dialog).getByLabelText("Correo electrónico"), {
    target: { value: "nuevo@ejemplo.test" }
  });
};

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(jsonResponse(emptyList));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("Gestión de prestadores", () => {
  it("renderiza el título y los controles principales", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Sistema de Gestión de Prestadores" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Buscar por CUIT o razón social")).toBeInTheDocument();
    expect(screen.getByLabelText("Filtrar por estado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nuevo prestador" })).toBeInTheDocument();
  });

  it("carga y muestra prestadores", async () => {
    fetchMock.mockResolvedValue(jsonResponse(listWithProvider()));
    render(<App />);

    expect(await screen.findByText("1 prestador encontrado")).toBeInTheDocument();
    expect(screen.getAllByText("Prestador Uno").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Activo").length).toBeGreaterThan(0);
  });

  it("muestra estado vacío", async () => {
    render(<App />);

    expect(await screen.findByText("No hay prestadores registrados")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear primer prestador" })).toBeInTheDocument();
  });

  it("muestra error de carga", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("network"));
    render(<App />);

    expect(
      (await screen.findAllByText("No se pudo conectar con el servidor")).length
    ).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });

  it("ejecuta búsqueda después de exactamente 300 ms", async () => {
    vi.useFakeTimers();
    render(<App />);
    await act(async () => Promise.resolve());
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByLabelText("Buscar por CUIT o razón social"), {
      target: { value: "  Prestador Uno  " }
    });
    act(() => vi.advanceTimersByTime(299));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("search=Prestador+Uno");
  });

  it("envía status al cambiar el filtro", async () => {
    render(<App />);
    await screen.findByText("No hay prestadores registrados");

    fireEvent.mouseDown(screen.getByLabelText("Filtrar por estado"));
    fireEvent.click(await screen.findByRole("option", { name: "Activos" }));

    await waitFor(() => {
      expect(String(fetchMock.mock.calls.at(-1)?.[0])).toContain("status=ACTIVE");
    });
  });

  it("envía page al cambiar la paginación", async () => {
    fetchMock.mockResolvedValue(jsonResponse(listWithProvider(provider, 2)));
    render(<App />);
    await screen.findByText("11 prestadores encontrados");

    fireEvent.click(screen.getByRole("button", { name: "Ir a la página 2" }));

    await waitFor(() => {
      expect(String(fetchMock.mock.calls.at(-1)?.[0])).toContain("page=2");
    });
  });

  it("abre el formulario de alta", async () => {
    render(<App />);
    const dialog = await openCreateDialog();

    expect(within(dialog).getByLabelText("CUIT")).toHaveValue("");
    expect(within(dialog).getByRole("button", { name: "Guardar" })).toBeInTheDocument();
  });

  it("muestra errores obligatorios en el alta", async () => {
    render(<App />);
    const dialog = await openCreateDialog();
    fireEvent.click(within(dialog).getByRole("button", { name: "Guardar" }));

    expect(await within(dialog).findByText("CUIT obligatorio")).toBeInTheDocument();
    expect(within(dialog).getByText("Razón social obligatoria")).toBeInTheDocument();
    expect(within(dialog).getByText("Correo electrónico inválido")).toBeInTheDocument();
  });

  it("muestra error para email inválido", async () => {
    render(<App />);
    const dialog = await openCreateDialog();
    fillRequiredFields(dialog);
    fireEvent.change(within(dialog).getByLabelText("Correo electrónico"), {
      target: { value: "correo-invalido" }
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Guardar" }));

    expect(await within(dialog).findByText("Correo electrónico inválido")).toBeInTheDocument();
  });

  it("muestra error para CUIT inválido", async () => {
    render(<App />);
    const dialog = await openCreateDialog();
    fillRequiredFields(dialog);
    fireEvent.change(within(dialog).getByLabelText("CUIT"), {
      target: { value: "20-123" }
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Guardar" }));

    expect(
      await within(dialog).findByText("El CUIT debe contener exactamente 11 dígitos")
    ).toBeInTheDocument();
  });

  it("alta válida ejecuta POST sin propiedades adicionales", async () => {
    fetchMock.mockImplementation(async (_input, init) =>
      jsonResponse(init?.method === "POST" ? provider : emptyList)
    );
    render(<App />);
    const dialog = await openCreateDialog();
    fillRequiredFields(dialog);
    fireEvent.click(within(dialog).getByRole("button", { name: "Guardar" }));

    await waitFor(() => {
      const postCall = fetchMock.mock.calls.find((call) => call[1]?.method === "POST");
      expect(postCall).toBeDefined();
      const payload = JSON.parse(String(postCall?.[1]?.body)) as Record<string, unknown>;
      expect(payload.cuit).toBe("20123456789");
      expect(payload).not.toHaveProperty("status");
    });
  });

  it("alta exitosa muestra feedback", async () => {
    fetchMock.mockImplementation(async (_input, init) =>
      jsonResponse(init?.method === "POST" ? provider : emptyList)
    );
    render(<App />);
    const dialog = await openCreateDialog();
    fillRequiredFields(dialog);
    fireEvent.click(within(dialog).getByRole("button", { name: "Guardar" }));

    expect(await screen.findByText("Prestador creado correctamente")).toBeInTheDocument();
  });

  it("conflicto 409 queda asociado al CUIT", async () => {
    fetchMock.mockImplementation(async (_input, init) => {
      if (init?.method === "POST") {
        return jsonResponse(
          {
            error: {
              code: "PROVIDER_CUIT_CONFLICT",
              message: "Conflicto de CUIT"
            }
          },
          409
        );
      }
      return jsonResponse(emptyList);
    });
    render(<App />);
    const dialog = await openCreateDialog();
    fillRequiredFields(dialog);
    fireEvent.click(within(dialog).getByRole("button", { name: "Guardar" }));

    expect(
      await within(dialog).findByText("Ya existe un prestador con ese CUIT")
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Nuevo prestador" })).toBeInTheDocument();
  });

  it("abre edición con valores precargados", async () => {
    fetchMock.mockResolvedValue(jsonResponse(listWithProvider()));
    render(<App />);
    await screen.findByText("1 prestador encontrado");
    fireEvent.click(screen.getAllByRole("button", { name: "Editar Prestador Uno" })[0]!);

    const dialog = await screen.findByRole("dialog", { name: "Editar prestador" });
    expect(within(dialog).getByLabelText("CUIT")).toHaveValue("20123456789");
    expect(within(dialog).getByLabelText("Razón social")).toHaveValue("Prestador Uno");
    expect(within(dialog).getByLabelText("Teléfono")).toHaveValue("2215550101");
  });

  it("edición ejecuta PUT sin status", async () => {
    fetchMock.mockImplementation(async (_input, init) =>
      jsonResponse(init?.method === "PUT" ? provider : listWithProvider())
    );
    render(<App />);
    await screen.findByText("1 prestador encontrado");
    fireEvent.click(screen.getAllByRole("button", { name: "Editar Prestador Uno" })[0]!);
    const dialog = await screen.findByRole("dialog", { name: "Editar prestador" });
    fireEvent.change(within(dialog).getByLabelText("Teléfono"), {
      target: { value: "2215559999" }
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => {
      const putCall = fetchMock.mock.calls.find((call) => call[1]?.method === "PUT");
      expect(String(putCall?.[0])).toContain(provider.id);
      const payload = JSON.parse(String(putCall?.[1]?.body)) as Record<string, unknown>;
      expect(payload.phone).toBe("2215559999");
      expect(payload).not.toHaveProperty("status");
    });
  });

  it("abre confirmación de desactivación", async () => {
    fetchMock.mockResolvedValue(jsonResponse(listWithProvider()));
    render(<App />);
    await screen.findByText("1 prestador encontrado");
    fireEvent.click(screen.getAllByRole("button", { name: "Desactivar Prestador Uno" })[0]!);

    const dialog = await screen.findByRole("dialog", { name: "Desactivar prestador" });
    expect(
      within(dialog).getByText(
        "El prestador permanecerá registrado, pero pasará a estado inactivo."
      )
    ).toBeInTheDocument();
  });

  it("desactivación ejecuta PATCH con INACTIVE", async () => {
    fetchMock.mockImplementation(async (_input, init) =>
      jsonResponse(init?.method === "PATCH" ? { ...provider, status: "INACTIVE" } : listWithProvider())
    );
    render(<App />);
    await screen.findByText("1 prestador encontrado");
    fireEvent.click(screen.getAllByRole("button", { name: "Desactivar Prestador Uno" })[0]!);
    const dialog = await screen.findByRole("dialog", { name: "Desactivar prestador" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Desactivar" }));

    await waitFor(() => {
      const patchCall = fetchMock.mock.calls.find((call) => call[1]?.method === "PATCH");
      expect(JSON.parse(String(patchCall?.[1]?.body))).toEqual({ status: "INACTIVE" });
    });
  });

  it("reactivación ejecuta PATCH con ACTIVE", async () => {
    const inactive = { ...provider, status: "INACTIVE" as const };
    fetchMock.mockImplementation(async (_input, init) =>
      jsonResponse(init?.method === "PATCH" ? provider : listWithProvider(inactive))
    );
    render(<App />);
    await screen.findByText("1 prestador encontrado");
    fireEvent.click(screen.getAllByRole("button", { name: "Reactivar Prestador Uno" })[0]!);
    const dialog = await screen.findByRole("dialog", { name: "Reactivar prestador" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Reactivar" }));

    await waitFor(() => {
      const patchCall = fetchMock.mock.calls.find((call) => call[1]?.method === "PATCH");
      expect(JSON.parse(String(patchCall?.[1]?.body))).toEqual({ status: "ACTIVE" });
    });
  });

  it("renderiza las variantes desktop y móvil con los mismos datos y acciones", async () => {
    fetchMock.mockResolvedValue(jsonResponse(listWithProvider()));
    render(<App />);
    await screen.findByText("1 prestador encontrado");

    const tableView = screen.getByRole("region", {
      name: "Vista de tabla de prestadores"
    });
    const cardView = screen.getByRole("region", {
      name: "Vista de tarjetas de prestadores"
    });
    expect(within(tableView).getByText("Prestador Uno")).toBeInTheDocument();
    expect(within(cardView).getByText("Prestador Uno")).toBeInTheDocument();
    expect(within(tableView).getByRole("button", { name: "Editar Prestador Uno" })).toBeInTheDocument();
    expect(within(cardView).getByRole("button", { name: "Editar Prestador Uno" })).toBeInTheDocument();
  });
});