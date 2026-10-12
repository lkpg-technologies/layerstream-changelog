import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { COMPONENT_KEYS } from './lib/components';

const releases = defineCollection({
  loader: glob({
    base: './releases',
    pattern: '*/*.md',
    // Keep ids like "core/v1.4.0"; the default slugifier would drop the dots.
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    component: z.enum(COMPONENT_KEYS),
    version: z.string().regex(/^v\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/),
    date: z.coerce.date(),
    title: z.string().optional(),
  }),
});

export const collections = { releases };
