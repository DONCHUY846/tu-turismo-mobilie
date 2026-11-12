import {
  forgotPasswordCodeSchema,
  forgotPasswordEmailSchema,
  loginSchema,
  profileSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validators";

describe("loginSchema", () => {
  it("normaliza el correo y conserva la contraseña", () => {
    const result = loginSchema.parse({
      email: "  VIAJERO@Ejemplo.COM  ",
      password: "secreto",
    });

    expect(result).toEqual({
      email: "viajero@ejemplo.com",
      password: "secreto",
    });
  });

  it("rechaza un correo inválido", () => {
    const result = loginSchema.safeParse({
      email: "no-es-un-correo",
      password: "secreto",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Escribe un correo válido.");
    }
  });

  it("exige contraseña", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Escribe tu contraseña.");
    }
  });
});

describe("registerSchema", () => {
  const validValues = {
    nombre: "  Jesús  ",
    apellido: "  Aviña  ",
    email: "  JESUS@Ejemplo.COM ",
    telefono: "33 1786 7062",
    password: "password1",
    confirmPassword: "password1",
  };

  it("normaliza nombre, correo y teléfono", () => {
    const result = registerSchema.parse(validValues);

    expect(result).toMatchObject({
      nombre: "Jesús",
      apellido: "Aviña",
      email: "jesus@ejemplo.com",
      telefono: "3317867062",
    });
  });

  it("rechaza un teléfono que no tenga 10 dígitos", () => {
    const result = registerSchema.safeParse({
      ...validValues,
      telefono: "123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("El teléfono debe tener 10 dígitos.");
    }
  });

  it("rechaza contraseñas que no coinciden", () => {
    const result = registerSchema.safeParse({
      ...validValues,
      confirmPassword: "otra-clave",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["confirmPassword"]);
      expect(result.error.issues[0].message).toBe("Las contraseñas no coinciden.");
    }
  });

  it("rechaza contraseñas de menos de 8 caracteres", () => {
    const result = registerSchema.safeParse({
      ...validValues,
      password: "corta",
      confirmPassword: "corta",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "La contraseña necesita al menos 8 caracteres."
      );
    }
  });
});

describe("profileSchema", () => {
  const validValues = {
    nombre: "Jesús",
    apellido: "Aviña",
    email: "JESUS@Ejemplo.COM",
    telefono: "3317867062",
    password: "",
    confirmPassword: "",
  };

  it("permite dejar la contraseña vacía", () => {
    const result = profileSchema.parse(validValues);

    expect(result).toMatchObject({
      email: "jesus@ejemplo.com",
      password: "",
      confirmPassword: "",
    });
  });

  it("rechaza una contraseña nueva demasiado corta", () => {
    const result = profileSchema.safeParse({
      ...validValues,
      password: "corta",
      confirmPassword: "corta",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "La contraseña necesita al menos 8 caracteres."
      );
    }
  });

  it("rechaza una confirmación distinta cuando hay contraseña nueva", () => {
    const result = profileSchema.safeParse({
      ...validValues,
      password: "password1",
      confirmPassword: "password2",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["confirmPassword"]);
    }
  });
});

describe("recuperación de contraseña", () => {
  it("normaliza el correo del primer paso", () => {
    expect(
      forgotPasswordEmailSchema.parse({ email: "  USER@Example.COM " })
    ).toEqual({ email: "user@example.com" });
  });

  it("recorta el código y rechaza uno vacío", () => {
    expect(forgotPasswordCodeSchema.parse({ code: "  ABC123 " })).toEqual({
      code: "ABC123",
    });
    expect(forgotPasswordCodeSchema.safeParse({ code: "   " }).success).toBe(false);
  });

  it("exige que la contraseña nueva y su confirmación coincidan", () => {
    const result = resetPasswordSchema.safeParse({
      password: "password1",
      confirmPassword: "password2",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Las contraseñas no coinciden.");
    }
  });
});
