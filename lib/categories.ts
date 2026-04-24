import type { Category } from './types'

export interface CategoryConfig {
  key: Category
  icon: string
  color: string
  cssVar: string
}

export const CATEGORY_CONFIG: Record<Category, CategoryConfig> = {
  housing:  { key: 'housing',  icon: 'home',        color: 'oklch(48% 0.13 245)', cssVar: 'var(--cat-hebergement)' },
  health:   { key: 'health',   icon: 'heart-pulse',  color: 'oklch(46% 0.13 175)', cssVar: 'var(--cat-sante)' },
  food:     { key: 'food',     icon: 'utensils',     color: 'oklch(46% 0.13 145)', cssVar: 'var(--cat-alimentation)' },
  hygiene:  { key: 'hygiene',  icon: 'droplets',     color: 'oklch(50% 0.13 215)', cssVar: 'var(--cat-hygiene)' },
  language: { key: 'language', icon: 'book-open',    color: 'oklch(46% 0.13 295)', cssVar: 'var(--cat-langue)' },
  legal:    { key: 'legal',    icon: 'scale',        color: 'oklch(44% 0.13 265)', cssVar: 'var(--cat-juridique)' },
  material: { key: 'material', icon: 'package',      color: 'oklch(52% 0.13 55)',  cssVar: 'var(--cat-materiel)' },
}

export const ALL_CATEGORIES = Object.values(CATEGORY_CONFIG)
