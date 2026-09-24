import type { Programme, Theme } from '../schema';

// Key order defines display order everywhere.
export const THEME_LABELS: Record<Theme, string> = {
  economy: "Économie et pouvoir d'achat",
  work: 'Travail et retraites',
  immigration: 'Immigration',
  security: 'Sécurité et justice',
  ecology: 'Écologie et énergie',
  healthEducation: 'Santé et éducation',
  institutions: 'Institutions',
  international: 'International et défense',
};

export const THEMES = Object.keys(THEME_LABELS) as Theme[];

export const PROGRAMME_STATUS_LABELS: Record<Programme['status'], string> = {
  published: 'Programme publié',
  announced: 'Pas encore de programme : propositions annoncées',
};
