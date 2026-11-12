import {
  formatDateRange,
  formatLongDate,
  parseApiDate,
  sortByDateAsc,
} from "@/lib/format";

describe("parseApiDate", () => {
  it("acepta fecha sin hora y con hora", () => {
    expect(parseApiDate("2026-09-03")?.getDate()).toBe(3);
    expect(parseApiDate("2026-09-03 00:00:00")?.getMonth()).toBe(8);
    expect(parseApiDate(" 2026-09-03 ")?.getFullYear()).toBe(2026);
  });

  it("rechaza texto que no empieza con una fecha ISO", () => {
    expect(parseApiDate("03/09/2026")).toBeNull();
    expect(parseApiDate("")).toBeNull();
  });
});

describe("formatLongDate", () => {
  it("formatea sin desfase de zona horaria", () => {
    expect(formatLongDate("2026-09-03 00:00:00")).toBe("3 de septiembre de 2026");
    expect(formatLongDate("2026-09-03")).toBe("3 de septiembre de 2026");
  });

  it("devuelve cadena vacía para una fecha inválida", () => {
    expect(formatLongDate("sin fecha")).toBe("");
  });
});

describe("formatDateRange", () => {
  it("usa el formato de rango cuando el mes coincide", () => {
    expect(formatDateRange("2026-04-17", "2026-04-25")).toBe(
      "del 17 al 25 de abril de 2026"
    );
  });

  it("incluye ambos meses cuando el rango cruza de mes", () => {
    expect(formatDateRange("2026-04-28", "2026-05-02")).toBe(
      "28 de abril de 2026 al 2 de mayo de 2026"
    );
  });

  it("muestra solo la fecha de inicio si no hay fin", () => {
    expect(formatDateRange("2026-04-17")).toBe("17 de abril de 2026");
  });

  it("devuelve cadena vacía si la fecha de inicio es inválida", () => {
    expect(formatDateRange("", "2026-04-25")).toBe("");
  });
});

describe("sortByDateAsc", () => {
  it("ordena por fecha y deja las inválidas al final", () => {
    const items = [
      { id: "sin-fecha", fecha: "" },
      { id: "mayo", fecha: "2026-05-01" },
      { id: "abril", fecha: "2026-04-01" },
    ];

    expect(sortByDateAsc(items, (item) => item.fecha).map((item) => item.id)).toEqual([
      "abril",
      "mayo",
      "sin-fecha",
    ]);
  });

  it("no muta el arreglo original", () => {
    const items = [
      { id: "b", fecha: "2026-02-01" },
      { id: "a", fecha: "2026-01-01" },
    ];

    sortByDateAsc(items, (item) => item.fecha);

    expect(items.map((item) => item.id)).toEqual(["b", "a"]);
  });
});
