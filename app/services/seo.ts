import type { Metadata } from 'next';
import { getStrapiMedia } from './strapi';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  '';

function toAbsoluteUrl(path?: string | null) {
  if (!path) return undefined;
  if (!SITE_URL) return path;

  try {
    return new URL(path, SITE_URL).toString();
  } catch {
    return path;
  }
}

export type SeoInput = {
  title?: string | null;
  description?: string | null;
  canonicalPath?: string | null;
  image?: string | null;
  indexable?: boolean;
};

export function buildMetadata(input: SeoInput): Metadata {
  const title = input.title ?? 'IND NO1';
  const description = input.description ?? undefined;
  const canonicalUrl = toAbsoluteUrl(input.canonicalPath ?? undefined);
  const imageUrl = input.image ? getStrapiMedia(input.image) : null;
  const ogImages = imageUrl ? [{ url: imageUrl }] : undefined;

  return {
    title,
    description,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    robots:
      input.indexable === false
        ? { index: false, follow: false }
        : undefined,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      images: ogImages,
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export function buildMetadataFromSeo(
  seo: any,
  fallback: SeoInput
): Metadata {
  const image =
    seo?.metaImage?.url ||
    seo?.metaImage?.data?.attributes?.url ||
    fallback.image;

  return buildMetadata({
    title: seo?.metaTitle || fallback.title,
    description: seo?.metaDescription || fallback.description,
    canonicalPath: seo?.canonicalURL || fallback.canonicalPath,
    image,
    indexable: seo?.metaRobots
      ? !String(seo.metaRobots).includes('noindex')
      : fallback.indexable,
  });
}
