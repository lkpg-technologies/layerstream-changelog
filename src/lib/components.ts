// The services that publish to this changelog. The key is the folder name under
// releases/ and the `component` value in each entry's frontmatter.
export const COMPONENTS = {
  core: {
    name: 'Layerstream Core',
    description: 'The platform API and data pipeline.',
    color: 'var(--c-core)',
  },
  machine: {
    name: 'Layerstream Machine',
    description: 'The agent running on your machines.',
    color: 'var(--c-machine)',
  },
  manage: {
    name: 'Layerstream Manage',
    description: 'The management web interface.',
    color: 'var(--c-manage)',
  },
} as const;

export type ComponentKey = keyof typeof COMPONENTS;
export const COMPONENT_KEYS = Object.keys(COMPONENTS) as [ComponentKey, ...ComponentKey[]];
