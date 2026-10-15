import * as React from "react";
import { View } from "react-native";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type PlaceCardSkeletonProps = {
  imageHeight?: number;
  className?: string;
};

/** Placeholder de `PlaceCard` mientras carga la lista. */
export function PlaceCardSkeleton({ imageHeight = 176, className }: PlaceCardSkeletonProps) {
  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel="Cargando lugar"
      className={cn(
        "gap-y-3 overflow-hidden rounded-2xl border border-border bg-card p-4",
        className
      )}
    >
      <Skeleton className="w-full rounded-xl" style={{ height: imageHeight }} />
      <View className="flex-row items-center justify-between gap-3">
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-3 w-12" />
      </View>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/5" />
      <View className="flex-row justify-end">
        <Skeleton className="h-7 w-20 rounded-lg" />
      </View>
    </View>
  );
}