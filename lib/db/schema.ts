import { pgTable, uuid, text, timestamp, jsonb, index, customType } from 'drizzle-orm/pg-core'

// PostGIS geometry type (stored as well-known text for simplicity with Drizzle)
const geometry = customType<{ data: string; driverData: string }>({
  dataType() {
    return 'geometry(Point, 4326)'
  },
})

export const CATEGORIES = [
  'housing', 'health', 'food', 'hygiene', 'language', 'legal', 'material',
] as const
export type Category = (typeof CATEGORIES)[number]

export const SOURCES = ['osm', 'datagouv', 'paris', 'lyon', 'soliguide', 'community'] as const
export type Source = (typeof SOURCES)[number]

export interface OpeningHoursEntry {
  day: string
  time: string
}

export interface ServiceLocation {
  lat: number
  lng: number
  address: string
  city: string
  postalCode: string
}

export interface ServiceContact {
  phone?: string
  email?: string
  website?: string
}

export const services = pgTable(
  'services',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    externalId: text('external_id'),
    source: text('source').$type<Source>().notNull(),
    name: text('name').notNull(),
    category: text('category').$type<Category>().notNull(),
    subcategory: text('subcategory'),
    location: geometry('location').notNull(),
    address: text('address').notNull(),
    city: text('city').notNull(),
    postalCode: text('postal_code'),
    phone: text('phone'),
    email: text('email'),
    website: text('website'),
    hours: jsonb('hours').$type<OpeningHoursEntry[]>(),
    conditions: text('conditions'),
    languages: text('languages').array(),
    description: text('description'),
    sourceUrl: text('source_url'),
    lastUpdated: timestamp('last_updated', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('services_source_external_id_idx').on(t.source, t.externalId),
    index('services_category_idx').on(t.category),
    index('services_city_idx').on(t.city),
  ]
)

export type Service = typeof services.$inferSelect
export type NewService = typeof services.$inferInsert
