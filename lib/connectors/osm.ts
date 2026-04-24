import type { RawService } from '../normalizers'
import type { Category } from '../db/schema'

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

// OSM tags → our categories
const TAG_MAP: Array<{ match: (tags: Record<string, string>) => boolean; category: Category; subcategory?: string }> = [
  {
    category: 'housing',
    match: (t) =>
      t.social_facility === 'shelter' ||
      t.social_facility === 'housing' ||
      t.amenity === 'shelter' ||
      (t.social_facility_for?.includes('refugee') ?? false),
  },
  {
    category: 'health',
    match: (t) =>
      t.social_facility === 'healthcare' ||
      t.healthcare === 'centre' ||
      t.amenity === 'clinic' ||
      t.amenity === 'doctors',
  },
  {
    category: 'food',
    match: (t) =>
      t.social_facility === 'food_bank' ||
      t.amenity === 'food_bank' ||
      t.social_facility === 'soup_kitchen',
  },
  {
    category: 'hygiene',
    match: (t) =>
      t.amenity === 'shower' ||
      t.amenity === 'public_bath' ||
      t.social_facility === 'hygiene',
  },
  {
    category: 'legal',
    match: (t) =>
      t.social_facility === 'advice' ||
      t.office === 'lawyer' ||
      (t.social_facility_for?.includes('asylum') ?? false),
  },
  {
    category: 'material',
    match: (t) =>
      t.social_facility === 'clothing' ||
      t.social_facility === 'goods',
  },
  {
    category: 'language',
    match: (t) =>
      t.amenity === 'language_school' ||
      (t.social_facility === 'education' && (t.subject ?? '').toLowerCase().includes('french')),
  },
]

function detectCategory(tags: Record<string, string>): Category | null {
  for (const rule of TAG_MAP) {
    if (rule.match(tags)) return rule.category
  }
  // fallback: any social_facility
  if (tags.social_facility || tags.amenity === 'social_facility') return 'housing'
  return null
}

function buildAddress(tags: Record<string, string>): string {
  const parts = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean)
  return parts.join(' ') || tags['addr:full'] || ''
}

function parsePhone(tags: Record<string, string>): string | undefined {
  return tags.phone || tags['contact:phone'] || tags.telephone
}

function parseName(tags: Record<string, string>, id: number): string {
  return tags.name || tags['name:fr'] || tags['operator'] || `Service OSM #${id}`
}

export async function fetchOsmServices(bbox?: string): Promise<RawService[]> {
  // Default: France bounding box
  const box = bbox ?? '41.3,-5.2,51.1,9.6'

  const query = `
    [out:json][timeout:60];
    (
      node[social_facility](${box});
      node[amenity=shower](${box});
      node[amenity=public_bath](${box});
      node[amenity=food_bank](${box});
      node[amenity=shelter](${box});
    );
    out body;
  `

  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    signal: AbortSignal.timeout(90_000),
  })

  if (!res.ok) throw new Error(`Overpass API error: ${res.status}`)

  const json = await res.json()
  const elements: any[] = json.elements ?? []

  const results: RawService[] = []

  for (const el of elements) {
    if (el.type !== 'node' || !el.lat || !el.lon) continue
    const tags: Record<string, string> = el.tags ?? {}

    const category = detectCategory(tags)
    if (!category) continue

    const name = parseName(tags, el.id)
    const address = buildAddress(tags)
    const city = tags['addr:city'] || tags['is_in:city'] || ''

    results.push({
      externalId: `osm-node-${el.id}`,
      source: 'osm',
      name,
      category,
      lat: el.lat,
      lng: el.lon,
      address,
      city,
      postalCode: tags['addr:postcode'],
      phone: parsePhone(tags),
      website: tags.website || tags['contact:website'],
      hours: tags.opening_hours
        ? [{ day: 'cf. horaires', time: tags.opening_hours }]
        : undefined,
      description: tags.description || tags['description:fr'],
      sourceUrl: `https://www.openstreetmap.org/node/${el.id}`,
    })
  }

  return results
}
