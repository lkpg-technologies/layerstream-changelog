import { getCollection, type CollectionEntry } from 'astro:content';
import type { ComponentKey } from './components';

export type Release = CollectionEntry<'releases'>;

function compareVersions(a: string, b: string): number {
  const pa = a.slice(1).split(/[.-]/).map((p) => Number(p) || 0);
  const pb = b.slice(1).split(/[.-]/).map((p) => Number(p) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

/** All releases, newest first. */
export async function getReleases(component?: ComponentKey): Promise<Release[]> {
  const all = await getCollection('releases', (r) => !component || r.data.component === component);
  return all.sort(
    (a, b) =>
      b.data.date.getTime() - a.data.date.getTime() || compareVersions(b.data.version, a.data.version),
  );
}

export function releaseUrl(r: Release): string {
  return `/${r.data.component}/${r.data.version}/`;
}

const dayFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export const formatDate = (d: Date) => dayFmt.format(d);
export const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/** Groups releases (already sorted) by calendar day, preserving order. */
export function groupByDay(releases: Release[]): { day: string; date: Date; releases: Release[] }[] {
  const groups: { day: string; date: Date; releases: Release[] }[] = [];
  for (const r of releases) {
    const day = isoDay(r.data.date);
    const last = groups.at(-1);
    if (last?.day === day) last.releases.push(r);
    else groups.push({ day, date: r.data.date, releases: [r] });
  }
  return groups;
}
