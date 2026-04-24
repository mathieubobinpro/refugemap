import type { RawService } from '../normalizers'
import type { Category } from '../db/schema'

// Plusieurs instances pour le fallback
const OVERPASS_INSTANCES = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
]

// social_facility:for → catégorie prioritaire
const FOR_CATEGORY: Record<string, Category> = {
  refugees:            'housing',
  refugee:             'housing',
  migrant:             'housing',
  migrants:            'housing',
  asylum_seeker:       'legal',
  homeless:            'housing',
  underprivileged:     'food',
  unemployed:          'legal',
  mother_and_children: 'health',
  children:            'health',
  elderly:             'health',
  disabled:            'health',
  drug_addicts:        'health',
  women:               'housing',
}

// social_facility type → catégorie
const TYPE_CATEGORY: Record<string, Category> = {
  shelter:       'housing',
  housing:       'housing',
  outreach:      'housing',  // outreach = accompagnement social → housing par défaut
  food_bank:     'food',
  soup_kitchen:  'food',
  meals:         'food',
  healthcare:    'health',
  clothing:      'material',
  goods:         'material',
  hygiene:       'hygiene',
  advice:        'legal',
  education:     'language',
  employment:    'legal',
}

function detectCategory(tags: Record<string, string>): Category | null {
  // Hygiene en premier (tag amenity spécifique)
  if (tags.amenity === 'shower' || tags.amenity === 'public_bath') return 'hygiene'
  if (tags.amenity === 'food_bank') return 'food'
  if (tags.amenity === 'shelter') return 'housing'
  if (tags.amenity === 'language_school') return 'language'

  // social_facility:for est le signal le plus précis
  const forVal = tags['social_facility:for'] ?? tags['social_facility_for'] ?? ''
  for (const keyword of forVal.split(';').map((s) => s.trim().toLowerCase())) {
    if (FOR_CATEGORY[keyword]) return FOR_CATEGORY[keyword]
  }

  // Puis le type de facility
  const type = tags.social_facility?.toLowerCase()
  if (type && TYPE_CATEGORY[type]) return TYPE_CATEGORY[type]

  // Fallback : toute social_facility non identifiée → housing (accompagnement social)
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

// Grandes agglomérations françaises : [min_lat, min_lng, max_lat, max_lng]
const FRANCE_ZONES: Record<string, string> = {
  paris:      '48.75,2.22,48.95,2.55',
  lyon:       '45.69,4.77,45.81,4.90',
  marseille:  '43.22,5.30,43.38,5.42',
  toulouse:   '43.54,1.33,43.67,1.50',
  bordeaux:   '44.80,-0.63,44.90,-0.53',
  nantes:     '47.17,-1.62,47.27,-1.52',
  strasbourg: '48.53,7.70,48.62,7.80',
  lille:      '50.60,3.01,50.68,3.10',
  nice:       '43.67,7.20,43.74,7.30',
  grenoble:   '45.14,5.68,45.22,5.78',
  rennes:     '48.08,-1.72,48.14,-1.66',
  montpellier:'43.57,3.82,43.63,3.90',
}

export async function fetchOsmServices(zones?: Record<string, string>): Promise<RawService[]> {
  const targetZones = zones ?? FRANCE_ZONES
  const allResults: RawService[] = []

  for (const [zoneName, box] of Object.entries(targetZones)) {
    try {
      const zoneResults = await fetchOsmZone(box)
      console.log(`    ${zoneName}: ${zoneResults.length} services`)
      allResults.push(...zoneResults)
    } catch (e: any) {
      console.warn(`    ${zoneName}: erreur — ${e.message}`)
    }
  }

  // Dédoublonnage par externalId
  const seen = new Set<string>()
  return allResults.filter((r) => {
    if (seen.has(r.externalId)) return false
    seen.add(r.externalId)
    return true
  })
}

async function fetchOsmZone(box: string): Promise<RawService[]> {
  const query = `[out:json][timeout:30];(node[social_facility](${box});node[amenity=shower](${box});node[amenity=public_bath](${box});node[amenity=food_bank](${box});node[amenity=shelter](${box}););out body;`

  let res: Response | undefined
  let lastError = ''

  for (const instance of OVERPASS_INSTANCES) {
    try {
      const url = `${instance}?data=${encodeURIComponent(query)}`
      res = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'RefugeMap/1.0 (https://github.com/mathieubobinpro/refugemap)',
        },
        signal: AbortSignal.timeout(45_000),
      })
      if (res.ok) break
      lastError = `${res.status} from ${instance}`
    } catch (e: any) {
      lastError = e.message
    }
  }

  if (!res?.ok) throw new Error(`Overpass API error: ${lastError}`)

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
