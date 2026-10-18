import { Mail, MapPin, Phone, Star } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";

import { BrandGradient } from "@/components/BrandGradient";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { GRADIENTS } from "@/lib/theme";
import { cn } from "@/lib/utils";

export type ProfileCardProps = {
  name: string;
  email: string;
  phone?: string;
  /** pill de ubicación; TODO: sustituir por la ubicación real del usuario */
  location?: string;
  /** broche de verificación del avatar */
  verified?: boolean;
  className?: string;
};

/**
 * Tarjeta de usuario: avatar con iniciales, nombre, contacto y ubicación.
 * Se apoya sobre el header con margen negativo.
 */
export function ProfileCard({
  name,
  email,
  phone,
  location,
  verified = false,
  className,
}: ProfileCardProps) {
  return (
    <View
      className={cn(
        "items-center gap-2 rounded-2xl border border-border bg-card px-4 py-5 shadow-sm shadow-black/5",
        className
      )}
    >
      {/* Avatar con iniciales y broche de verificación */}
      <View className="mb-3">
        <View className="rounded-full bg-card p-1 shadow-lg">
          <BrandGradient
            colors={GRADIENTS.brandSoft}
            direction="diagonal"
            className="h-28 w-28 items-center justify-center rounded-full border-[3px] border-brand-cyan"
          >
            <Text className="select-none text-3xl font-bold tracking-wide text-white">
              {getInitials(name)}
            </Text>
          </BrandGradient>
        </View>

        {verified ? (
          <View className="absolute bottom-1 right-2 rounded-full border-2 border-card bg-brand-cyanHover p-1.5 shadow-md">
            <Icon as={Star} className="text-white" size={16} fill="currentColor" />
          </View>
        ) : null}
      </View>

      {/* Nombre */}
      <Text className="text-center text-3xl font-extrabold tracking-tight text-slate-900">
        {name}
      </Text>
      <View className="mb-2 h-1.5 w-9 rounded-full bg-brand-cyan" />

      {/* Contacto */}
      <View className="w-full items-center gap-2.5">
        {email ? (
          <View className="flex-row items-center gap-2">
            <Icon as={Mail} className="text-brand-cyan" size={16} />
            <Text className="text-sm font-medium text-slate-600">{email}</Text>
          </View>
        ) : null}

        {phone ? (
          <View className="flex-row items-center gap-2">
            <Icon as={Phone} className="text-brand-purple" size={16} />
            <Text className="text-sm font-medium text-slate-600">{phone}</Text>
          </View>
        ) : null}

        {location ? (
          <View className="mt-1 flex-row items-center justify-center">
            <View className="flex-row items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2">
              <Icon as={MapPin} className="text-brand-cyan" size={16} />
              <Text className="text-xs font-semibold text-slate-700">{location}</Text>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

/** Iniciales para el avatar: primera letra del nombre y del apellido. */
function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "TU";
  const first = words[0][0] ?? "";
  const last = words.length > 1 ? words[words.length - 1][0] ?? "" : "";
  return `${first}${last}`.toUpperCase();
}