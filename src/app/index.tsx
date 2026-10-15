import * as React from "react";
import { ScrollView, View } from "react-native";

import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { BottomTabBar } from "@/components/BottomTabBar";
import { CategoryCard, CategoryGrid } from "@/components/CategoryCard";
import { FeaturedPlaces } from "@/components/FeaturedPlaces";
import { HeroBanner } from "@/components/HeroBanner";
import { OfflineBanner } from "@/components/OfflineBanner";
import { RecommendedRestaurants } from "@/components/RecommendedRestaurants";
import { SectionHeader } from "@/components/SectionHeader";
import { UpcomingEvents } from "@/components/UpcomingEvents";
import {
  BOTTOM_TABS,
  FOOTER_CONTACT,
  FOOTER_INFO_LINKS,
  FOOTER_QUICK_LINKS,
  HERO,
  HOME_CATEGORIES,
} from "@/data/home";

/**
 * Home de Tu Turismo.
 *
 * Bloques, en el mismo orden que el diseño de Stitch
 * ("Tu Turismo - Página de Inicio (Móvil)"):
 *  1. AppHeader          — logotipo de marca + botón de menú (fijo arriba).
 *  2. HeroBanner         — portada con imagen, titular y dos CTAs.
 *  3. SectionHeader      — "Explora por Categoría".
 *  4. CategoryGrid       — 2 columnas con las 6 categorías de entrada.
 *  5. FeaturedPlaces         — "Lugares Destacados" desde la API.
 *  6. UpcomingEvents          — "Próximos Eventos" desde la API.
 *  7. RecommendedRestaurants  — "Restaurantes Recomendados" desde la API.
 *  8. OfflineBanner           — aviso de sin conexión (fijo bajo el header).
 *  9. AppFooter               — enlaces, contacto y copyright.
 * 10. BottomTabBar            — navegación inferior (fija abajo).
 */
export default function Index() {
  const scrollRef = React.useRef<ScrollView>(null);

  return (
    <View className="flex-1 bg-background">
      {/* 1. Barra superior fija con el logotipo de la marca y el acceso al menú. */}
      <AppHeader
        // TODO: abrir el menú lateral cuando exista.
        onPressMenu={() => {}}
      />

      {/* 8. Aviso de falta de conexión: aparece y desaparece según el estado real de red. */}
      <OfflineBanner />

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Portada: imagen a sangre con overlay y los llamados a la acción. */}
        <HeroBanner
          image={HERO.image}
          title={HERO.title}
          highlight={HERO.highlight}
          subtitle={HERO.subtitle}
          primaryLabel={HERO.primaryLabel}
          // TODO: navegar a la sección de lugares al completar la lista.
          onPrimaryPress={() => {}}
          secondaryLabel={HERO.secondaryLabel}
          // TODO: navegar a la sección de eventos al completar la lista.
          onSecondaryPress={() => {}}
        />

        <View className="mt-8 gap-y-12 px-4 pb-8">
          {/* 3 + 4. Categorías: acceso rápido a cada tipo de contenido. */}
          <View>
            <SectionHeader
              align="center"
              title="Explora por Categoría"
              subtitle="Encuentra exactamente lo que buscas navegando por nuestras secciones populares."
            />
            <CategoryGrid>
              {HOME_CATEGORIES.map((category) => (
                <CategoryCard
                  key={category.key}
                  label={category.label}
                  icon={category.icon}
                  tone={category.tone}
                  // TODO: navegar a la ruta de la categoría cuando exista.
                  onPress={() => {}}
                />
              ))}
            </CategoryGrid>
          </View>

          {/* 5. Lugares destacados: listado real desde la API
              (GET /api/v1/core/places/), con skeletons de carga y estado de error. */}
          <FeaturedPlaces />

          {/* 6. Próximos eventos: listado real desde la API
              (GET /api/v1/core/events/), ordenado por fecha en el cliente. */}
          <UpcomingEvents />

          {/* 7. Restaurantes recomendados: listado real desde la API
              (GET /api/v1/core/restaurants/). */}
          <RecommendedRestaurants />
        </View>

        {/* 9. Pie de página con enlaces, contacto y copyright. */}
        <AppFooter
          description="Descubre los mejores lugares, eventos y restaurantes en la ciudad. Tu experiencia perfecta comienza aquí."
          quickLinks={FOOTER_QUICK_LINKS}
          infoLinks={FOOTER_INFO_LINKS}
          contact={FOOTER_CONTACT}
          copyright={FOOTER_CONTACT.copyright}
          onScrollToTop={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
        />
      </ScrollView>

      {/* 10. Barra de navegación inferior fija.
          TODO: migrar a un layout (tabs) de Expo Router. */}
      <BottomTabBar
        tabs={BOTTOM_TABS}
        activeHref="/"
        // TODO: navegar con router.push(tab.href) cuando existan las rutas.
        onPressTab={() => {}}
      />
    </View>
  );
}