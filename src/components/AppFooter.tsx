import { ChevronsUp, Mail, MapPin, Phone, type LucideIcon } from "lucide-react-native";
import * as React from "react";
import { Alert, Linking, Pressable, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

import type { FooterLink } from "@/data/home";

export type AppFooterContact = {
  address: string;
  phone: string;
  email: string;
};

export type AppFooterProps = {
  description: string;
  quickLinks: FooterLink[];
  quickLinksTitle?: string;
  infoLinks: FooterLink[];
  infoLinksTitle?: string;
  contact: AppFooterContact;
  copyright: string;
  /** callback del botón "volver arriba" */
  onScrollToTop?: () => void;
  /**
   * Se llama al presionar un enlace con ancla (`#seccion`), para hacer scroll
   * a esa sección de la pantalla.
   */
  onPressAnchor?: (anchor: string) => void;
  className?: string;
};

/**
 * Pie de página: descripción, listas de enlaces, datos de contacto y copyright.
 *
 * Los enlaces se abren según su `href`:
 *  - `#ancla` → scroll a una sección de la pantalla (`onPressAnchor`).
 *  - `http(s)://` o `mailto:` → navegador del sistema.
 */
export function AppFooter({
  description,
  quickLinks,
  quickLinksTitle = "Enlaces Rápidos",
  infoLinks,
  infoLinksTitle = "Información",
  contact,
  copyright,
  onScrollToTop,
  onPressAnchor,
  className,
}: AppFooterProps) {
  const openLink = (href?: string) => {
    if (!href) return;

    if (href.startsWith("#")) {
      onPressAnchor?.(href);
      return;
    }

    if (href.startsWith("http") || href.startsWith("mailto:")) {
      void Linking.openURL(href).catch(() => {
        Alert.alert(
          "No pudimos abrir el enlace",
          "Revisa tu conexión e inténtalo de nuevo."
        );
      });
    }
  };

  return (
    <View className={cn("bg-brand-footer px-6 pb-12 pt-8", className)}>
      <Text className="text-xs leading-relaxed text-slate-400">{description}</Text>

      <View className="mt-7">
        <Text className="mb-2.5 text-sm font-bold text-white">{quickLinksTitle}</Text>
        <FooterLinkList links={quickLinks} onPress={openLink} />
      </View>

      <View className="mt-7">
        <Text className="mb-2.5 text-sm font-bold text-white">{infoLinksTitle}</Text>
        <FooterLinkList links={infoLinks} onPress={openLink} />
      </View>

      <View className="mt-7">
        <Text className="mb-2.5 text-sm font-bold text-white">Contacto</Text>
        <View className="gap-y-2.5">
          <ContactRow icon={MapPin}>
            <Text className="flex-1 text-xs leading-relaxed text-slate-400">{contact.address}</Text>
          </ContactRow>
          <ContactRow icon={Phone}>
            <Text
              accessibilityRole="link"
              className="text-xs text-slate-400"
              onPress={() => void Linking.openURL(`tel:${contact.phone.replace(/\s/g, "")}`)}
            >
              {contact.phone}
            </Text>
          </ContactRow>
          <ContactRow icon={Mail}>
            <Text
              accessibilityRole="link"
              className="text-xs text-slate-400"
              onPress={() => void Linking.openURL(`mailto:${contact.email}`)}
            >
              {contact.email}
            </Text>
          </ContactRow>
        </View>
      </View>

      <View className="mt-7 items-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver arriba"
          className="p-2 active:opacity-70"
          onPress={onScrollToTop}
        >
          <Icon as={ChevronsUp} className="text-emerald-400" size={24} />
        </Pressable>
      </View>

      <Separator className="my-4 bg-slate-800" />

      <Text className="text-[11px] text-slate-500">{copyright}</Text>
    </View>
  );
}

function FooterLinkList({
  links,
  onPress,
}: {
  links: FooterLink[];
  onPress: (href?: string) => void;
}) {
  return (
    <View className="gap-y-2">
      {links.map((link) => (
        <Pressable
          key={link.label}
          accessibilityRole="link"
          onPress={() => onPress(link.href)}
          className="self-start active:opacity-70"
        >
          <Text className="text-xs text-slate-400">{link.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function ContactRow({
  icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-row items-start gap-2.5">
      <View className="pt-0.5">
        <Icon as={icon} className="text-brand-cyan" size={16} />
      </View>
      {children}
    </View>
  );
}