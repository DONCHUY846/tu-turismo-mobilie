import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Star } from "lucide-react-native";
import * as React from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";

import { AIRecommendationBanner } from "@/components/profile/AIRecommendationBanner";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { ProfileGuestCard } from "@/components/profile/ProfileGuestCard";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import {
  SavedListEmptyState,
  SavedListSection,
} from "@/components/profile/SavedListSection";
import { fetchProfile } from "@/services/auth";
import { useAuthStore } from "@/stores/auth-store";

/** TODO: sustituir por la ubicación real del usuario cuando exista. */
const USER_LOCATION = "Guadalajara, Jalisco • México";

/**
 * Pantalla "Perfil" (pestaña 3). Es el único punto de entrada al login.
 *
 * Bloques (diseño de Stitch "Tu Turismo - Perfil de Usuario (Móvil)"):
 *  1. ProfileHeader            — degradado con ajustes y cerrar sesión.
 *  2. ProfileCard              — avatar, nombre, correo, teléfono y ubicación.
 *  3. AIRecommendationBanner   — promo del motor de itinerarios.
 *  4. SavedListSection         — Lugares Favoritos.
 *  5. SavedListSection         — Eventos Guardados.
 *
 * Sin sesión se muestra `ProfileGuestCard` con el acceso al login, que no está
 * en el diseño original.
 */
export default function Perfil() {
  const status = useAuthStore((state) => state.status);
  const accessToken = useAuthStore((state) => state.accessToken);
  const storeUser = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  const isAuthenticated = status === "authenticated";

  // El login solo trae id/email/rol/nombre; `auth/me/` completa el perfil.
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchProfile(accessToken),
    enabled: isAuthenticated && Boolean(accessToken),
  });

  const handleSignOut = () => {
    // El backend no tiene logout: solo se borra la sesión local.
    signOut();
    router.replace("/login");
  };

  const fullName = [profile?.nombre ?? storeUser.nombre, profile?.apellido]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    <View className="flex-1 bg-[#eef2f6]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          // TODO: pantalla de configuración cuando exista.
          onPressSettings={() => {}}
          onSignOut={isAuthenticated ? handleSignOut : undefined}
        />

        <View className="gap-5 px-4">
          {isAuthenticated ? (
            <>
              <ProfileCard
                name={fullName || "Viajero"}
                email={profile?.email ?? storeUser.email}
                phone={profile?.telefono || undefined}
                location={USER_LOCATION}
                verified={profile?.activo ?? false}
              />

              <AIRecommendationBanner
                title="¿Listo para tu próximo itinerario turístico en Jalisco?"
                description="Nuestro motor de IA analiza tus lugares favoritos y eventos para recomendarte experiencias gastronómicas y culturales a tu medida."
                // TODO: navegar al generador de itinerarios cuando exista.
                onPressAction={() => {}}
              />

              {/* TODO: conectar con el store de favoritos cuando exista. */}
              <SavedListSection
                icon={Star}
                iconClassName="bg-amber-50 text-amber-500"
                title="Lugares Favoritos"
                subtitle="Atractivos y museos guardados en tu lista"
                count={0}
                emptyState={
                  <SavedListEmptyState
                    icon={Star}
                    title="Todavía no tienes lugares favoritos."
                    description="Guárdalos desde cualquier lugar y aparecerán aquí para planear tu próxima ruta."
                  />
                }
              />

              {/* TODO: conectar con el store de eventos guardados cuando exista. */}
              <SavedListSection
                icon={CalendarDays}
                iconClassName="bg-cyan-50 text-cyan-600"
                title="Eventos Guardados"
                subtitle="Tu agenda cultural y festivales de Jalisco"
                count={0}
                countLabels={["evento", "eventos"]}
                emptyState={
                  <SavedListEmptyState
                    icon={CalendarDays}
                    title="No tienes eventos guardados aún."
                    description="Encuentra los próximos eventos y festivales de Jalisco en el mapa para sumarlos a tu agenda."
                  />
                }
              />
            </>
          ) : (
            <ProfileGuestCard onPressSignIn={() => router.push("/login")} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}