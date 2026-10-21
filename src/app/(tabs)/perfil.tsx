import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarDays, Star, UtensilsCrossed } from "lucide-react-native";
import * as React from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";

import { AppHeader } from "@/components/AppHeader";
import { AIRecommendationBanner } from "@/components/profile/AIRecommendationBanner";
import { FavoriteRow } from "@/components/profile/FavoriteRow";
import { ProfileActions } from "@/components/profile/ProfileActions";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { ProfileGuestCard } from "@/components/profile/ProfileGuestCard";
import { SavedFavoritesSection } from "@/components/profile/SavedFavoritesSection";
import { SavedListEmptyState } from "@/components/profile/SavedListSection";
import { useFavorites } from "@/hooks/useFavorites";
import { formatDateRange } from "@/lib/format";
import { fetchProfile } from "@/services/auth";
import { sendRecommendations } from "@/services/recommendations";
import { useAuthStore } from "@/stores/auth-store";

/** TODO: sustituir por la ubicación real del usuario cuando exista. */
const USER_LOCATION = "Guadalajara, Jalisco • México";

/**
 * Pantalla "Perfil" (pestaña 3). Es el único punto de entrada al login.
 *
 * Bloques (diseño de Stitch "Tu Turismo - Perfil de Usuario (Móvil)"):
 *  1. AppHeader                — cabecera estándar de la app.
 *  2. ProfileActions           — ajustes y cerrar sesión.
 *  3. ProfileCard              — avatar, nombre, correo, teléfono y ubicación.
 *  4. AIRecommendationBanner   — promo del motor de recomendaciones IA.
 *  5. SavedFavoritesSection    — Lugares Favoritos.
 *  6. SavedFavoritesSection    — Eventos Guardados.
 *  7. SavedFavoritesSection    — Restaurantes Favoritos (no está en el diseño).
 *
 * Los favoritos salen de `/core/favorites/`, que solo guarda la referencia, así
 * que `useFavorites` trae el detalle de cada una. Sin sesión se muestra
 * `ProfileGuestCard` con el acceso al login, que no está en el diseño original.
 */
export default function Perfil() {
  const status = useAuthStore((state) => state.status);
  const storeUser = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  const isAuthenticated = status === "authenticated";

  // El login solo trae id/email/rol/nombre; `auth/me/` completa el perfil.
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchProfile(),
    enabled: isAuthenticated,
  });

  const handleSignOut = () => {
    // El backend no tiene logout: solo se borra la sesión local.
    signOut();
    router.replace("/login");
  };

  const favorites = useFavorites({
    userId: storeUser.id,
    enabled: isAuthenticated,
  });

  // Recomendaciones de IA: es una acción del usuario (POST), no una carga de
  // pantalla, así que va como mutación y no como query.
  const recommendations = useMutation({
    mutationFn: () => sendRecommendations(),
  });

  const fullName = [profile?.nombre ?? storeUser.nombre, profile?.apellido]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader />

        {isAuthenticated ? <ProfileActions onSignOut={handleSignOut} /> : null}

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
                recommendations={recommendations.data?.data}
                successMessage={recommendations.data?.message}
                isLoading={recommendations.isPending}
                errorMessage={
                  recommendations.isError ? recommendations.error.message : null
                }
                onPressAction={() => recommendations.mutate()}
                onRetry={() => recommendations.mutate()}
              />

              <SavedFavoritesSection
                icon={Star}
                iconClassName="bg-amber-50 text-amber-500"
                title="Lugares Favoritos"
                subtitle="Atractivos y museos guardados en tu lista"
                count={favorites.places.length}
                countLabels={["lugar", "lugares"]}
                isPending={favorites.isPending}
                isError={favorites.isError}
                error={favorites.error}
                onRetry={favorites.refetch}
                emptyState={
                  <SavedListEmptyState
                    icon={Star}
                    title="Todavía no tienes lugares favoritos."
                    description="Guárdalos desde cualquier lugar y aparecerán aquí para planear tu próxima ruta."
                  />
                }
              >
                {favorites.places.map((place) => (
                  <FavoriteRow
                    key={place.id}
                    title={place.nombre}
                    subtitle={place.municipio || place.direccion}
                    imageUrl={place.imagen_url}
                    value={place.rating_promedio ?? place.calificacion}
                  />
                ))}
              </SavedFavoritesSection>

              <SavedFavoritesSection
                icon={CalendarDays}
                iconClassName="bg-cyan-50 text-cyan-600"
                title="Eventos Guardados"
                subtitle="Tu agenda cultural y festivales de Jalisco"
                count={favorites.events.length}
                countLabels={["evento", "eventos"]}
                isPending={favorites.isPending}
                isError={favorites.isError}
                error={favorites.error}
                onRetry={favorites.refetch}
                emptyState={
                  <SavedListEmptyState
                    icon={CalendarDays}
                    title="No tienes eventos guardados aún."
                    description="Encuentra los próximos eventos y festivales de Jalisco en el mapa para sumarlos a tu agenda."
                  />
                }
              >
                {favorites.events.map((event) => (
                  <FavoriteRow
                    key={event.id}
                    title={event.nombre}
                    subtitle={
                      formatDateRange(event.fecha_inicio, event.fecha_fin || undefined) ||
                      event.municipio
                    }
                    imageUrl={event.imagen_url}
                  />
                ))}
              </SavedFavoritesSection>

              <SavedFavoritesSection
                icon={UtensilsCrossed}
                iconClassName="bg-orange-50 text-orange-500"
                title="Restaurantes Favoritos"
                subtitle="Tu selección gastronómica de Jalisco"
                count={favorites.restaurants.length}
                countLabels={["restaurante", "restaurantes"]}
                isPending={favorites.isPending}
                isError={favorites.isError}
                error={favorites.error}
                onRetry={favorites.refetch}
                emptyState={
                  <SavedListEmptyState
                    icon={UtensilsCrossed}
                    title="No tienes restaurantes guardados."
                    description="Guarda lugares gastronómicos y aparecerán aquí con su horario y contacto."
                  />
                }
              >
                {favorites.restaurants.map((restaurant) => (
                  <FavoriteRow
                    key={restaurant.id}
                    title={restaurant.nombre}
                    subtitle={restaurant.municipio || restaurant.direccion}
                    imageUrl={restaurant.imagen_url}
                    value={restaurant.calificacion}
                  />
                ))}
              </SavedFavoritesSection>
            </>
          ) : (
            <ProfileGuestCard onPressSignIn={() => router.push("/login")} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}