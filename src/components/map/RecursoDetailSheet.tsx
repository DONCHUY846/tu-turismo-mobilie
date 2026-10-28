import { Image } from "expo-image";
import {
  Building2,
  Clock,
  Heart,
  Image as ImageIcon,
  MapPin,
  Phone,
  Star,
  X,
  type LucideIcon,
} from "lucide-react-native";
import * as React from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";

import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Text as UIText } from "@/components/ui/text";
import { formatDateRange } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MapPoint } from "./types";

export type RecursoDetailSheetProps = {
  /**
   * Contenido del modal. Vive separado de `visible` para que el texto no
   * parpadee durante el deslizamiento de salida: la pantalla mantiene el
   * punto un instante después de cerrar (ver MapExplorer).
   */
  point: MapPoint | null;
  /** controla la animación del Modal (entrada/salida) */
  visible: boolean;
  onClose: () => void;
  /** solo con sesión activa: los favoritos son del usuario */
  canFavorite: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isToggling: boolean;
  /** mensaje del último error del toggle (null si no hay); se limpia al reintentar */
  toggleError?: string | null;
};

/**
 * Modal de detalle del recurso (bottom sheet): foto, estrellas, descripción,
 * información y botón de favorito.
 *
 * Es un componente propio (el registry de reusables no trae `sheet`): usa
 * `Modal` de RN con `animationType="slide"` — todo el contenido (fondo
 * atenuado + panel) entra deslizando y sale igual; es el compromiso más
 * robusto sin animaciones de salida custom.
 */
export function RecursoDetailSheet({
  point,
  visible,
  onClose,
  canFavorite,
  isFavorite,
  onToggleFavorite,
  isToggling,
  toggleError,
}: RecursoDetailSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1">
        <Pressable
          accessibilityLabel="Cerrar detalle"
          className="absolute inset-0 bg-black/50"
          onPress={onClose}
        />
        <View className="absolute inset-x-0 bottom-0 max-h-[85%] overflow-hidden rounded-t-3xl bg-background">
          {point ? (
            <SheetContent
              point={point}
              onClose={onClose}
              canFavorite={canFavorite}
              isFavorite={isFavorite}
              onToggleFavorite={onToggleFavorite}
              isToggling={isToggling}
              toggleError={toggleError}
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

type SheetContentProps = Omit<RecursoDetailSheetProps, "point" | "visible"> & { point: MapPoint };

function SheetContent({
  point,
  onClose,
  canFavorite,
  isFavorite,
  onToggleFavorite,
  isToggling,
  toggleError,
}: SheetContentProps) {
  const { kind, item } = point;
  const tipoLabel = kind === "place" ? "Lugar" : kind === "restaurant" ? "Restaurante" : "Evento";

  return (
    <ScrollView bounces={false}>
      {/* Foto con los dos botones flotantes encima */}
      <View className="relative">
        {item.imagen_url ? (
          <View className="h-[185px] w-full bg-muted">
            {/* expo-image no acepta `className`: View con clases + dimensions por style */}
            <Image
              source={{ uri: item.imagen_url }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              transition={150}
            />
          </View>
        ) : (
          <View className="h-[185px] w-full items-center justify-center bg-muted">
            <Icon as={ImageIcon} size={36} className="text-muted-foreground" />
          </View>
        )}

        <SheetIconButton icon={X} label="Cerrar" onPress={onClose} className="left-3 top-3" />

        {canFavorite ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
            accessibilityState={{ selected: isFavorite }}
            onPress={onToggleFavorite}
            disabled={isToggling}
            className={cn(
              "absolute right-3 top-3 h-10 w-10 items-center justify-center rounded-full bg-white shadow-md",
              isToggling && "opacity-60"
            )}
          >
            <Icon
              as={Heart}
              size={18}
              className={isFavorite ? "text-red-500" : "text-foreground"}
              fill={isFavorite ? "#ef4444" : "none"}
            />
          </Pressable>
        ) : null}
      </View>

      <View className="gap-y-3 px-4 pb-8 pt-4">
        <View className="gap-y-1">
          <UIText className="text-xs font-semibold uppercase tracking-wide text-brand-cyan">
            {tipoLabel}
          </UIText>
          <UIText className="text-xl font-bold text-foreground">{item.nombre}</UIText>
        </View>

        {/*
          Las estrellas van por recurso ("in" discrimina la unión: rating_promedio
          solo está en Place, telefono solo en Restaurant). Los eventos no traen
          calificación en el backend: muestran fechas.
        */}
        {"rating_promedio" in item ? (
          <StarsRow rating={item.rating_promedio} reviews={item.reviews_count} />
        ) : "telefono" in item ? (
          <StarsRow rating={item.calificacion} />
        ) : (
          <View className="flex-row items-center gap-2">
            <Badge variant="secondary">
              <UIText>{tipoLabel}</UIText>
            </Badge>
            <UIText className="text-xs text-muted-foreground">
              {formatDateRange(item.fecha_inicio, item.fecha_fin || undefined)}
            </UIText>
          </View>
        )}

        {toggleError ? (
          <UIText className="text-xs font-medium text-destructive">{toggleError}</UIText>
        ) : null}

        <UIText className="text-sm leading-5 text-foreground">
          {item.descripcion || "Sin descripción todavía."}
        </UIText>

        <View className="gap-y-2 pt-1">
          <UIText className="text-sm font-semibold text-foreground">Información</UIText>
          {/* dirección: places y restaurantes la traen; los eventos no */}
          {"fecha_inicio" in item ? null : item.direccion ? (
            <InfoRow icon={MapPin} label={item.direccion} />
          ) : null}
          <InfoRow icon={Building2} label={item.municipio} />
          {"telefono" in item && item.telefono ? <InfoRow icon={Phone} label={item.telefono} /> : null}
          {"telefono" in item && item.horario ? <InfoRow icon={Clock} label={item.horario} /> : null}
          {item.tags.length > 0 ? (
            <View className="flex-row flex-wrap gap-1 pt-1">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  <UIText>{tag}</UIText>
                </Badge>
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}

/**
 * Fila de estrellas. El relleno va con hex directo: el SVG de lucide no
 * resuelve clases NativeWind en `fill` (amber-500 = #f59e0b).
 */
function StarsRow({ rating, reviews }: { rating: number | null; reviews?: number }) {
  if (rating == null || rating <= 0) {
    return <UIText className="text-xs text-muted-foreground">Sin calificaciones aún</UIText>;
  }

  const llenas = Math.round(rating);

  return (
    <View className="flex-row items-center gap-1">
      {[1, 2, 3, 4, 5].map((index) => (
        <Icon
          key={index}
          as={Star}
          size={14}
          className="text-amber-500"
          fill={index <= llenas ? "#f59e0b" : "none"}
        />
      ))}
      <UIText className="text-xs text-muted-foreground">
        {rating.toFixed(1)}
        {reviews && reviews > 0 ? ` · ${reviews} ${reviews === 1 ? "reseña" : "reseñas"}` : ""}
      </UIText>
    </View>
  );
}

function InfoRow({ icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <Icon as={icon} size={14} className="text-muted-foreground" />
      <UIText className="flex-1 text-xs text-foreground">{label}</UIText>
    </View>
  );
}

function SheetIconButton({
  icon,
  label,
  onPress,
  className,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  className?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={cn("absolute h-10 w-10 items-center justify-center rounded-full bg-white shadow-md", className)}
    >
      <Icon as={icon} size={18} className="text-foreground" />
    </Pressable>
  );
}
