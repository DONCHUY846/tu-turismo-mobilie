import { Image } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Camera, Images } from "lucide-react-native";
import * as React from "react";
import { Alert, Pressable, View } from "react-native";

import { BrandGradient } from "@/components/BrandGradient";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { GRADIENTS } from "@/lib/theme";
import { cn } from "@/lib/utils";

/** Archivo local listo para subir: lo produce el selector de imagen. */
export type PickedImage = {
  uri: string;
  name: string;
  type: string;
};

export type AvatarInputProps = {
  /** URL de la foto ya guardada en el backend */
  avatarUrl?: string;
  /** nombre completo, para las iniciales cuando no hay foto */
  name: string;
  /** se llama con el archivo local nuevo (aún sin subir) */
  onChange: (image: PickedImage) => void;
  disabled?: boolean;
  className?: string;
};

/** Lado del avatar en px. */
const SIZE = 112;
/** La foto se reduce antes de subirla: un avatar no necesita más. */
const UPLOAD_SIZE = 512;

/**
 * Selector de foto de perfil: muestra la foto (o las iniciales) y permite
 * elegir una nueva de la galería o con la cámara.
 *
 * La imagen se deja reducida en el disco (512×512, JPEG): el archivo original
 * puede pesar varios MB y no aporta nada a un avatar.
 */
export function AvatarInput({
  avatarUrl,
  name,
  onChange,
  disabled = false,
  className,
}: AvatarInputProps) {
  const [picked, setPicked] = React.useState<PickedImage | null>(null);

  const preview = picked?.uri ?? avatarUrl;

  const handlePick = async (source: "library" | "camera") => {
    try {
      const asset = await pickFrom(source);
      if (!asset) return;

      const image = await resize(asset);
      setPicked(image);
      onChange(image);
    } catch (error) {
      Alert.alert(
        "No pudimos elegir la foto",
        error instanceof Error ? error.message : "Inténtalo de nuevo."
      );
    }
  };

  const showOptions = () => {
    Alert.alert("Foto de perfil", "¿De dónde quieres tomarla?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Galería", onPress: () => void handlePick("library") },
      { text: "Cámara", onPress: () => void handlePick("camera") },
    ]);
  };

  return (
    <View className={cn("items-center gap-3", className)}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cambiar foto de perfil"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={showOptions}
        className="relative active:opacity-80"
      >
        <View
          className="overflow-hidden rounded-full border-[3px] border-brand-cyan bg-card"
          style={{ width: SIZE, height: SIZE }}
        >
          {preview ? (
            <Image
              source={{ uri: preview }}
              contentFit="cover"
              // `expo-image` no tiene interop de NativeWind: las dimensiones van por `style`.
              style={{ width: "100%", height: "100%" }}
              accessibilityLabel="Foto de perfil"
              transition={200}
            />
          ) : (
            <BrandGradient
              colors={GRADIENTS.brandSoft}
              direction="diagonal"
              className="h-full w-full items-center justify-center"
            >
              <Text className="select-none text-3xl font-bold tracking-wide text-white">
                {getInitials(name)}
              </Text>
            </BrandGradient>
          )}
        </View>

        {/* Botón de cámara sobre la foto */}
        <View className="absolute -bottom-1 -right-1 h-9 w-9 items-center justify-center rounded-full border-2 border-card bg-brand-cyanHover shadow-md">
          <Icon as={Camera} className="text-white" size={16} />
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Elegir foto de perfil"
        disabled={disabled}
        onPress={showOptions}
        className="flex-row items-center gap-1.5 active:opacity-70"
      >
        <Icon as={Images} className="text-brand-cyan" size={16} />
        <Text className="text-sm font-semibold text-brand-cyanHover">
          {preview ? "Cambiar foto" : "Elegir foto"}
        </Text>
      </Pressable>
    </View>
  );
}

/** Abre el picker y devuelve el asset elegido, o `null` si se canceló. */
async function pickFrom(source: "library" | "camera") {
  if (source === "camera") {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      throw new Error("Necesitamos la cámara para tomar tu foto.");
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    return result.canceled ? null : (result.assets[0] ?? null);
  }

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error("Necesitamos acceso a tus fotos para elegir una.");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.9,
  });
  return result.canceled ? null : (result.assets[0] ?? null);
}

/** Reduce la imagen a un cuadrado de 512 px y la guarda como JPEG. */
async function resize(asset: ImagePicker.ImagePickerAsset): Promise<PickedImage> {
  const result = await ImageManipulator.manipulateAsync(
    asset.uri,
    [{ resize: { width: UPLOAD_SIZE, height: UPLOAD_SIZE } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );

  return { uri: result.uri, name: "avatar.jpg", type: "image/jpeg" };
}

/** Iniciales para el avatar: primera letra del nombre y del apellido. */
function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "TU";
  const first = words[0][0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1][0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}
