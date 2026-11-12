import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { RegisterForm } from "@/components/auth/RegisterForm";

async function fillForm(screen: Awaited<ReturnType<typeof render>>) {
  await fireEvent.changeText(screen.getByPlaceholderText("John"), "  Jesús ");
  await fireEvent.changeText(screen.getByPlaceholderText("Doe"), "  Aviña ");
  await fireEvent.changeText(
    screen.getByPlaceholderText("correo@ejemplo.com"),
    "  JESUS@Ejemplo.COM "
  );
  await fireEvent.changeText(screen.getByPlaceholderText("3317867062"), "33 1786 7062");
  await fireEvent.changeText(screen.getByPlaceholderText("Mínimo 8 caracteres"), "password1");
  await fireEvent.changeText(screen.getByPlaceholderText("Repite tu contraseña"), "password1");
}

describe("<RegisterForm />", () => {
  it("rechaza contraseñas que no coinciden", async () => {
    const onSubmit = jest.fn();
    const screen = await render(<RegisterForm onSubmit={onSubmit} />);

    await fillForm(screen);
    await fireEvent.changeText(
      screen.getByPlaceholderText("Repite tu contraseña"),
      "password2"
    );
    await fireEvent.press(screen.getByText("Crear cuenta"));

    expect(await screen.findByText("Las contraseñas no coinciden.")).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("envía los datos normalizados cuando el formulario es válido", async () => {
    const onSubmit = jest.fn();
    const screen = await render(<RegisterForm onSubmit={onSubmit} />);

    await fillForm(screen);
    await fireEvent.press(screen.getByText("Crear cuenta"));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    // `handleSubmit` de RHF pasa un segundo argumento (el evento), por eso se
    // valida solo el primero: los datos ya validados y normalizados.
    expect(onSubmit.mock.calls[0][0]).toEqual({
      nombre: "Jesús",
      apellido: "Aviña",
      email: "jesus@ejemplo.com",
      telefono: "3317867062",
      password: "password1",
      confirmPassword: "password1",
    });
  });

  it("muestra el error del backend", async () => {
    const screen = await render(
      <RegisterForm onSubmit={jest.fn()} error="El email ya está registrado." />
    );

    expect(screen.getByText("El email ya está registrado.")).toBeTruthy();
  });
});
