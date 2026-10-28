import * as React from "react";
import {
  ScrollView,
  View,
  type LayoutChangeEvent,
  type ScrollViewInstance,
} from "react-native";

import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { CategoryCard, CategoryGrid } from "@/components/CategoryCard";
import { FeaturedPlaces } from "@/components/FeaturedPlaces";
import { HeroBanner } from "@/components/HeroBanner";
import { OfflineBanner } from "@/components/OfflineBanner";
import { RecommendedRestaurants } from "@/components/RecommendedRestaurants";
import { SectionHeader } from "@/components/SectionHeader";
import { UpcomingEvents } from "@/components/UpcomingEvents";
import {
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
 *  1. AppHeader              — logotipo de marca + botón de menú (fijo arriba).
 *  2. OfflineBanner          — aviso de sin conexión (fijo bajo el header).
 *  3. HeroBanner             — portada con imagen, titular y dos CTAs.
 *  4. SectionHeader          — "Explora por Categoría".
 *  5. CategoryGrid           — 2 columnas con las 6 categorías de entrada.
 *  6. FeaturedPlaces         — "Lugares Destacados" desde la API.
 *  7. UpcomingEvents         — "Próximos Eventos" desde la API.
 *  8. RecommendedRestaurants — "Restaurantes Recomendados" desde la API.
 *  9. AppFooter              — enlaces, contacto y copyright.
 *
 * La barra de navegación inferior la dibuja el layout `(tabs)/_layout.tsx`.
 */
export default function Index() {
  const scrollRef = React.useRef<ScrollViewInstance>(null);
  /**
   * Posición de cada sección dentro del contenido del scroll, para que los
   * anclas del footer (`#lugares`, `#eventos`, `#restaurantes`) bajen justo ahí.
   *
   * Las secciones son hijas directas del `ScrollView`, así que el `y` del
   * `onLayout` ya es la posición en el contenido (sin offsets ni sumas).
   */
  const sectionOffsets = React.useRef<Record<string, number>>({});

  const measureSection = React.useCallback(
    (anchor: string) => (event: LayoutChangeEvent) => {
      sectionOffsets.current[anchor] = event.nativeEvent.layout.y;
    },
    []
  );

  const scrollToAnchor = React.useCallback((anchor: string) => {
    const y = sectionOffsets.current[anchor.replace("#", "")];
    if (y === undefined) return;
    scrollRef.current?.scrollTo({ y, animated: true });
  }, []);

  return (
    <View className="flex-1 bg-background">
      {/* 1. Barra superior fija con el logotipo de la marca y el acceso al menú. */}
      <AppHeader
        // TODO: abrir el menú lateral cuando exista.
        onPressMenu={() => {}}
      />

      {/* 2. Aviso de falta de conexión: aparece y desaparece según el estado real de red. */}
      <OfflineBanner />

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* 3. Portada: imagen a sangre con overlay y los llamados a la acción. */}
        <HeroBanner
          image={HERO.image}
          title={HERO.title}
          highlight={HERO.highlight}
          subtitle={HERO.subtitle}
          primaryLabel={HERO.primaryLabel}
          onPrimaryPress={() => scrollToAnchor("#lugares")}
          secondaryLabel={HERO.secondaryLabel}
          onSecondaryPress={() => scrollToAnchor("#eventos")}
        />

        {/* 4 + 5. Categorías: acceso rápido a cada tipo de contenido. */}
        <View className="mt-8 px-4">
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

        {/* 6. Lugares destacados: listado real desde la API
            (GET /api/v1/core/places/), con skeletons de carga y estado de error. */}
        <View className="mt-12 px-4" onLayout={measureSection("lugares")}>
          <FeaturedPlaces />
        </View>

        {/* 7. Próximos eventos: listado real desde la API
            (GET /api/v1/core/events/), ordenado por fecha en el cliente. */}
        <View className="mt-12 px-4" onLayout={measureSection("eventos")}>
          <UpcomingEvents />
        </View>

        {/* 8. Restaurantes recomendados: listado real desde la API
            (GET /api/v1/core/restaurants/). */}
        <View
          className="mt-12 px-4 pb-8"
          onLayout={measureSection("restaurantes")}
        >
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
          onPressAnchor={scrollToAnchor}
        />
      </ScrollView>
    </View>
  );
}