'use client';

import Image from 'next/image';

import { useKiraPreferences } from '@/components/ui/preferences';
import type { TutorialMediaSlot } from '@/lib/tutorial-api';

export function TutorialMediaImage({ media, priority = false }: { media: TutorialMediaSlot; priority?: boolean }) {
  const { preferences } = useKiraPreferences();
  const key = `${preferences.language}${preferences.theme === 'light' ? 'Light' : 'Dark'}` as const;
  const asset = media.variants[key] ?? media.default;

  return (
    <Image
      src={asset.url}
      alt={media.alt[preferences.language]}
      width={asset.width}
      height={asset.height}
      priority={priority}
      unoptimized
    />
  );
}
