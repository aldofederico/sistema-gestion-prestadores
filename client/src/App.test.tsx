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
  phone: "02215550101",
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

const openCuitReadyForEditing = async () => {
  const dialog = await openCreateDialog();
  const cuit = within(dialog).getByLabelText("CUIT") as HTMLInputElement;
  fireEvent.change(cuit, { target: { value: "20-12345678-9" } });
  await waitFor(() => expect(cuit).toHaveValue("20-12345678-9"));
  return cuit;
};

const expectCuitValueAndCaret = async (
  input: HTMLInputElement,
  value: string,
  caret: number
) => {
  await waitFor(() => {
    expect(input).toHaveValue(value);
    expect(input.selectionStart).toBe(caret);
    expect(input.selectionEnd).toBe(caret);
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

  it("sanea y formatea progresivamente el CUIT con un máximo de 11 dígitos", async () => {
    render(<App />);
    const dialog = await openCreateDialog();
    const cuit = within(dialog).getByLabelText("CUIT");

    expect(cuit).toHaveAttribute("inputmode", "numeric");
    fireEvent.change(cuit, { target: { value: "2" } });
    expect(cuit).toHaveValue("2");
    fireEvent.change(cuit, { target: { value: "20" } });
    expect(cuit).toHaveValue("20");
    fireEvent.change(cuit, { target: { value: "20 a-1" } });
    expect(cuit).toHaveValue("20-1");
    fireEvent.change(cuit, { target: { value: "20 # 1234.5678 / 9 extra 999" } });
    expect(cuit).toHaveValue("20-12345678-9");
  });

  it("Delete antes del primer guion elimina el siguiente dígito lógico", async () => {
    render(<App />);
    const cuit = await openCuitReadyForEditing();
    cuit.focus();
    cuit.setSelectionRange(2, 2);

    fireEvent.keyDown(cuit, { key: "Delete" });

    await expectCuitValueAndCaret(cuit, "20-23456789", 2);
  });

  it("Delete antes del segundo guion elimina el siguiente dígito lógico", async () => {
    render(<App />);
    const cuit = await openCuitReadyForEditing();
    cuit.focus();
    cuit.setSelectionRange(11, 11);

    fireEvent.keyDown(cuit, { key: "Delete" });

    await expectCuitValueAndCaret(cuit, "20-12345678", 11);
  });

  it("Backspace después del primer guion elimina el dígito lógico anterior", async () => {
    render(<App />);
    const cuit = await openCuitReadyForEditing();
    cuit.focus();
    cuit.setSelectionRange(3, 3);

    fireEvent.keyDown(cuit, { key: "Backspace" });

    await expectCuitValueAndCaret(cuit, "21-23456789", 1);
  });

  it("Backspace después del segundo guion elimina el dígito lógico anterior", async () => {
    render(<App />);
    const cuit = await openCuitReadyForEditing();
    cuit.focus();
    cuit.setSelectionRange(12, 12);

    fireEvent.keyDown(cuit, { key: "Backspace" });

    await expectCuitValueAndCaret(cuit, "20-12345679", 10);
  });

  it("permite repetir Delete junto al separador sin atrapar el caret", async () => {
    render(<App />);
    const cuit = await openCuitReadyForEditing();
    cuit.focus();
    cuit.setSelectionRange(2, 2);

    fireEvent.keyDown(cuit, { key: "Delete" });
    await expectCuitValueAndCaret(cuit, "20-23456789", 2);
    fireEvent.keyDown(cuit, { key: "Delete" });

    await expectCuitValueAndCaret(cuit, "20-3456789", 2);
  });

  it("mantiene la semántica normal al reemplazar una selección del CUIT", async () => {
    render(<App />);
    const cuit = await openCuitReadyForEditing();
    cuit.focus();
    cuit.setSelectionRange(3, 5);

    expect(fireEvent.keyDown(cuit, { key: "Delete" })).toBe(true);
    expect(cuit).toHaveValue("20-12345678-9");

    fireEvent.change(cuit, {
      target: {
        value: "20-9345678-9",
        selectionStart: 4,
        selectionEnd: 4
      }
    });

    await expectCuitValueAndCaret(cuit, "20-93456789", 4);
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
      expect(payload.phone).toBeNull();
      expect(payload).not.toHaveProperty("status");
    });
  });

  it("sanea teléfono formateado y envía solo dígitos preservando ceros", async () => {
    fetchMock.mockImplementation(async (_input, init) =>
      jsonResponse(init?.method === "POST" ? provider : emptyList)
    );
    render(<App />);
    const dialog = await openCreateDialog();
    fillRequiredFields(dialog);
    const phone = within(dialog).getByLabelText("Teléfono");

    expect(phone).toHaveAttribute("inputmode", "numeric");
    fireEvent.change(phone, { target: { value: "(011) 4567-8901 ext.+" } });
    expect(phone).toHaveValue("01145678901");
    fireEvent.click(within(dialog).getByRole("button", { name: "Guardar" }));

    await waitFor(() => {
      const postCall = fetchMock.mock.calls.find((call) => call[1]?.method === "POST");
      const payload = JSON.parse(String(postCall?.[1]?.body)) as Record<string, unknown>;
      expect(payload.phone).toBe("01145678901");
    });
  });

  it("acepta exactamente 30 dígitos de teléfono sin truncar", async () => {
    fetchMock.mockImplementation(async (_input, init) =>
      jsonResponse(init?.method === "POST" ? provider : emptyList)
    );
    render(<App />);
    const dialog = await openCreateDialog();
    fillRequiredFields(dialog);
    const phone = within(dialog).getByLabelText("Teléfono");
    const thirtyDigits = "012345678901234567890123456789";

    fireEvent.change(phone, { target: { value: thirtyDigits } });
    expect(phone).toHaveValue(thirtyDigits);
    fireEvent.click(within(dialog).getByRole("button", { name: "Guardar" }));

    await waitFor(() => {
      const postCall = fetchMock.mock.calls.find((call) => call[1]?.method === "POST");
      const payload = JSON.parse(String(postCall?.[1]?.body)) as Record<string, unknown>;
      expect(payload.phone).toBe(thirtyDigits);
    });
  });

  it("rechaza 31 dígitos de teléfono sin truncar ni enviar", async () => {
    render(<App />);
    const dialog = await openCreateDialog();
    fillRequiredFields(dialog);
    const phone = within(dialog).getByLabelText("Teléfono");
    const thirtyOneDigits = "0123456789012345678901234567890";

    fireEvent.change(phone, { target: { value: thirtyOneDigits } });
    expect(phone).toHaveValue(thirtyOneDigits);
    fireEvent.click(within(dialog).getByRole("button", { name: "Guardar" }));

    expect(
      await within(dialog).findByText("Teléfono no puede superar 30 dígitos")
    ).toBeInTheDocument();
    expect(fetchMock.mock.calls.some((call) => call[1]?.method === "POST")).toBe(false);
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
    expect(within(dialog).getByLabelText("CUIT")).toHaveValue("20-12345678-9");
    expect(within(dialog).getByLabelText("Razón social")).toHaveValue("Prestador Uno");
    expect(within(dialog).getByLabelText("Teléfono")).toHaveValue("02215550101");
  });

  it("restaura el foco al trigger de alta al cancelar", async () => {
    render(<App />);
    const trigger = screen.getByRole("button", { name: "Nuevo prestador" });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Nuevo prestador" });

    fireEvent.click(within(dialog).getByRole("button", { name: "Cancelar" }));

    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("restaura el foco al trigger de alta al cerrar con Escape", async () => {
    render(<App />);
    const trigger = screen.getByRole("button", { name: "Nuevo prestador" });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Nuevo prestador" });

    fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });

    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("restaura el foco al trigger de edición desktop al cancelar", async () => {
    fetchMock.mockResolvedValue(jsonResponse(listWithProvider()));
    render(<App />);
    await screen.findByText("1 prestador encontrado");
    const tableView = screen.getByRole("region", {
      name: "Vista de tabla de prestadores"
    });
    const trigger = within(tableView).getByRole("button", {
      name: "Editar Prestador Uno"
    });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Editar prestador" });

    fireEvent.click(within(dialog).getByRole("button", { name: "Cancelar" }));

    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("restaura el foco al trigger de edición desktop con Escape", async () => {
    fetchMock.mockResolvedValue(jsonResponse(listWithProvider()));
    render(<App />);
    await screen.findByText("1 prestador encontrado");
    const tableView = screen.getByRole("region", {
      name: "Vista de tabla de prestadores"
    });
    const trigger = within(tableView).getByRole("button", {
      name: "Editar Prestador Uno"
    });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Editar prestador" });

    fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });

    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("restaura el foco al trigger de edición tras guardar correctamente", async () => {
    fetchMock.mockImplementation(async (_input, init) =>
      jsonResponse(init?.method === "PUT" ? provider : listWithProvider())
    );
    render(<App />);
    await screen.findByText("1 prestador encontrado");
    const tableView = screen.getByRole("region", {
      name: "Vista de tabla de prestadores"
    });
    const trigger = within(tableView).getByRole("button", {
      name: "Editar Prestador Uno"
    });
    const main = screen.getByRole("main");
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Editar prestador" });
    fireEvent.change(within(dialog).getByLabelText("Razón social"), {
      target: { value: "Prestador Uno Actualizado" }
    });

    fireEvent.click(within(dialog).getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => {
      expect(fetchMock.mock.calls.some((call) => call[1]?.method === "PUT")).toBe(true);
      expect(trigger).not.toBeInTheDocument();
      expect(document.activeElement).toBe(main);
    });
  });

  it("restaura el foco al trigger de edición de la tarjeta mobile", async () => {
    fetchMock.mockResolvedValue(jsonResponse(listWithProvider()));
    render(<App />);
    await screen.findByText("1 prestador encontrado");
    const cardView = screen.getByRole("region", {
      name: "Vista de tarjetas de prestadores"
    });
    const trigger = within(cardView).getByRole("button", {
      name: "Editar Prestador Uno"
    });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Editar prestador" });

    fireEvent.click(within(dialog).getByRole("button", { name: "Cancelar" }));

    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("edición ejecuta PUT sin status", async () => {
    fetchMock.mockImplementation(async (_input, init) =>
      jsonResponse(init?.method === "PUT" ? provider : listWithProvider())
    );
    render(<App />);
    await screen.findByText("1 prestador encontrado");
    fireEvent.click(screen.getAllByRole("button", { name: "Editar Prestador Uno" })[0]!);
    const dialog = await screen.findByRole("dialog", { name: "Editar prestador" });
    const phone = within(dialog).getByLabelText("Teléfono");
    fireEvent.change(phone, {
      target: { value: "+54 (0221) 555-9999 ext." }
    });
    expect(phone).toHaveValue("5402215559999");
    fireEvent.click(within(dialog).getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => {
      const putCall = fetchMock.mock.calls.find((call) => call[1]?.method === "PUT");
      expect(String(putCall?.[0])).toContain(provider.id);
      const payload = JSON.parse(String(putCall?.[1]?.body)) as Record<string, unknown>;
      expect(payload.cuit).toBe("20123456789");
      expect(payload.phone).toBe("5402215559999");
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
    expect(within(tableView).getByText("20-12345678-9")).toBeInTheDocument();
    expect(within(cardView).getByText("CUIT: 20-12345678-9")).toBeInTheDocument();
    expect(within(tableView).getByRole("button", { name: "Editar Prestador Uno" })).toBeInTheDocument();
    expect(within(cardView).getByRole("button", { name: "Editar Prestador Uno" })).toBeInTheDocument();
  });
});