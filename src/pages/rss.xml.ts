import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { COMPONENTS } from '../lib/components';
import { getReleases, releaseUrl } from '../lib/releases';

export async function GET(context: APIContext) {
  const releases = await getReleases();
  return rss({
    title: 'Layerstream Changelog',
    description: 'Every change to Layerstream, across all components.',
    site: context.site!,
    items: releases.slice(0, 50).map((r) => ({
      title: `${COMPONENTS[r.data.component].name} ${r.data.version}${r.data.title ? ` – ${r.data.title}` : ''}`,
      link: releaseUrl(r),
      pubDate: r.data.date,
      categories: [r.data.component],
      content: r.rendered?.html,
    })),
  });
}
