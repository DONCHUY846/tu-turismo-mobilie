import { fireEvent, render } from "@testing-library/react-native";

import { SectionErrorState } from "@/components/SectionErrorState";

describe("<SectionErrorState />", () => {
  it("muestra el título por defecto y el detalle", async () => {
    const screen = await render(<SectionErrorState detail="Error de red" />);

    expect(screen.getByText("No pudimos cargar el contenido")).toBeTruthy();
    expect(screen.getByText("Error de red")).toBeTruthy();
  });

  it("ejecuta onRetry al presionar el botón", async () => {
    const onRetry = jest.fn();
    const screen = await render(
      <SectionErrorState title="Falló la sección" onRetry={onRetry} />
    );

    await fireEvent.press(screen.getByText("Reintentar"));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
