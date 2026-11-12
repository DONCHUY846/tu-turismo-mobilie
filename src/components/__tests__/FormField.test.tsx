import { fireEvent, render } from "@testing-library/react-native";
import { Mail } from "lucide-react-native";

import { FormField } from "@/components/FormField";

describe("<FormField />", () => {
  it("muestra etiqueta, valor y error", async () => {
    const screen = await render(
      <FormField
        label="Correo electrónico"
        icon={Mail}
        inputProps={{
          value: "viajero@ejemplo.com",
          onChangeText: jest.fn(),
          placeholder: "viajero@ejemplo.com",
        }}
        error="Escribe un correo válido."
      />
    );

    expect(screen.getByText("Correo electrónico")).toBeTruthy();
    expect(screen.getByDisplayValue("viajero@ejemplo.com")).toBeTruthy();
    expect(screen.getByText("Escribe un correo válido.")).toBeTruthy();
  });

  it("muestra el accesorio cuando se proporciona", async () => {
    const screen = await render(
      <FormField
        label="Contraseña"
        icon={Mail}
        inputProps={{ value: "", onChangeText: jest.fn() }}
        accessory={<></>}
      />
    );

    expect(screen.getByText("Contraseña")).toBeTruthy();
  });

  it("propaga el cambio de texto", async () => {
    const onChangeText = jest.fn();
    const screen = await render(
      <FormField
        label="Correo"
        icon={Mail}
        inputProps={{ value: "", onChangeText }}
      />
    );

    await fireEvent.changeText(screen.getByDisplayValue(""), "nuevo@correo.com");

    expect(onChangeText).toHaveBeenCalledWith("nuevo@correo.com");
  });
});
