import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("muestra el título principal", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: "Sistema de Gestión de Prestadores"
      })
    ).toBeInTheDocument();
  });
});
