import type { ImageSource } from "expo-image";
import {
  CalendarDays,
  Compass,
  Home,
  Landmark,
  type LucideIcon,
  Map,
  ShoppingBag,
  Drama,
  Utensils,
  UserRound,
} from "lucide-react-native";

import type { HomeMenuLink } from "@/components/HomeMenuDrawer";
import type { IconTone } from "@/components/IconTile";

/** Categoría del grid "Explora por Categoría". */
export type HomeCategory = {
  /** clave estable para analítica y navegación futura */
  key: string;
  label: string;
  icon: LucideIcon;
  /** tono del cuadro de icono; ver `ICON_TONES` en `components/IconTile` */
  tone: IconTone;
  /** TODO: apuntar a la ruta de la categoría cuando exista (ej. "/categoria/compras") */
  href?: string;
};

/** Datos hardcodeados del grid de categorías mientras no exista la API. */
export const HOME_CATEGORIES: HomeCategory[] = [
  { key: "compras", label: "Compras", icon: ShoppingBag, tone: "pink" },
  { key: "cultura", label: "Cultura", icon: Drama, tone: "purple" },
  { key: "eventos", label: "Eventos", icon: CalendarDays, tone: "violet" },
  { key: "monumentos", label: "Monumentos", icon: Landmark, tone: "blue" },
  { key: "restaurantes", label: "Restaurantes", icon: Utensils, tone: "amber" },
  { key: "tours", label: "Tours", icon: Map, tone: "emerald" },
];

/**
 * Enlace del footer.
 *
 * `href` puede ser:
 *  - una URL externa (`https://…`): se abre en el navegador del sistema.
 *  - un ancla (`#seccion`): hace scroll a esa sección de la home.
 *  - una ruta interna (`/algo`): se navegará con `router.push` cuando haya rutas.
 * `href` vacío = enlace sin destino definido todavía.
 */
export type FooterLink = {
  label: string;
  href?: string;
};

export const FOOTER_QUICK_LINKS: FooterLink[] = [
  { label: "Lugares Populares", href: "#lugares" },
  { label: "Próximos Eventos", href: "#eventos" },
  { label: "Restaurantes Recomendados", href: "#restaurantes" },
  { label: "Tours Guiados" },
];

/**
 * Botones del menú del header (HomeMenuDrawer): saltan a las secciones de la
 * propia home, igual que los enlaces de ancla del footer. `#top` vuelve arriba.
 */
export const HOME_MENU_LINKS: HomeMenuLink[] = [
  { key: "inicio", label: "Inicio", icon: Home, anchor: "#top" },
  { key: "categorias", label: "Explora por Categoría", icon: Compass, anchor: "#categorias" },
  { key: "lugares", label: "Lugares Destacados", icon: Map, anchor: "#lugares" },
  { key: "eventos", label: "Próximos Eventos", icon: CalendarDays, anchor: "#eventos" },
  {
    key: "restaurantes",
    label: "Restaurantes Recomendados",
    icon: Utensils,
    anchor: "#restaurantes",
  },
];

export const FOOTER_INFO_LINKS: FooterLink[] = [
  { label: "Acerca de nosotros", href: "https://tu-turismo.com.mx/acerca" },
  { label: "Términos y condiciones", href: "https://tu-turismo.com.mx/terminos" },
  { label: "Política de privacidad", href: "https://tu-turismo.com.mx/privacidad" },
  { label: "Preguntas frecuentes", href: "https://tu-turismo.com.mx/faq" },
];

export const FOOTER_CONTACT = {
  address: "Carretera Santa Cruz-San Isidro Km. 4.5, 45644 Santa Cruz de las Flores, Jal.",
  phone: "33 46 72 18 35",
  email: "contacto@tu-turismo.com",
  copyright: "© 2024 AdaptiCode. Todos los derechos reservados.",
};

/** Pestaña de la barra inferior. */
export type BottomTab = {
  label: string;
  icon: LucideIcon;
  href: string;
};

export const BOTTOM_TABS: BottomTab[] = [
  { label: "Inicio", icon: Home, href: "/" },
  { label: "Explorar", icon: Compass, href: "/explorar" },
  { label: "Perfil", icon: UserRound, href: "/perfil" },
];

export const HERO = {
  image: require("../../assets/catedral.jpg") as ImageSource,
  title: "Conoce la tierra del",
  highlight: "tequila y el mariachi",
  subtitle:
    "Explora los mejores lugares turísticos, eventos culturales y sabores tradicionales de Guadalajara.",
  primaryLabel: "Explorar lugares",
  secondaryLabel: "Ver Eventos",
};