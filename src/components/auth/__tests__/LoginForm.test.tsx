import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";

import { LoginForm } from "@/components/auth/LoginForm";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("<LoginForm />", () => {
  it("muestra los errores de validación al enviar vacío", async () => {
    const onSubmit = jest.fn();
    const screen = await render(<LoginForm onSubmit={onSubmit} />);

    await fireEvent.press(screen.getByText("Iniciar sesión"));

    expect(await screen.findByText("Escribe tu correo.")).toBeTruthy();
    expect(await screen.findByText("Escribe tu contraseña.")).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("envía los datos normalizados cuando el formulario es válido", async () => {
    const onSubmit = jest.fn();
    const screen = await render(<LoginForm onSubmit={onSubmit} />);

    await fireEvent.changeText(
      screen.getByPlaceholderText("viajero@ejemplo.com"),
      "  VIAJERO@Ejemplo.COM "
    );
    await fireEvent.changeText(screen.getByPlaceholderText("••••••••"), "secreto");
    await fireEvent.press(screen.getByText("Iniciar sesión"));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    // `handleSubmit` de RHF pasa un segundo argumento (el evento), por eso se
    // valida solo el primero: los datos ya validados y normalizados.
    expect(onSubmit.mock.calls[0][0]).toEqual({
      email: "viajero@ejemplo.com",
      password: "secreto",
    });
  });

  it("muestra el error del backend", async () => {
    const screen = await render(
      <LoginForm onSubmit={jest.fn()} error="El email o la contraseña son incorrectos." />
    );

    expect(
      screen.getByText("El email o la contraseña son incorrectos.")
    ).toBeTruthy();
  });

  it("navega a la recuperación de contraseña", async () => {
    const screen = await render(<LoginForm onSubmit={jest.fn()} />);

    await fireEvent.press(screen.getByText("¿Olvidaste tu contraseña?"));

    expect(router.push).toHaveBeenCalledWith("/recuperar-contrasena");
  });

  it("deshabilita el botón mientras hay una petición en curso", async () => {
    const screen = await render(<LoginForm onSubmit={jest.fn()} isPending />);

    expect(screen.getByText("Iniciando sesión…")).toBeTruthy();
  });
});
