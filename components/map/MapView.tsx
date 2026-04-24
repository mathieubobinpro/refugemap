'use client'
import { useEffect, useRef, useCallback } from 'react'
import type { Map as MapLibreMap, Marker } from 'maplibre-gl'
import type { ServiceDTO, GeoPosition } from '@/lib/types'
import { CATEGORY_CONFIG } from '@/lib/categories'

interface Props {
  services: ServiceDTO[]
  position: GeoPosition
  positionGranted: boolean
  activeServiceId: string | null
  onSelectService: (id: string | null) => void
}

export function MapView({ services, position, positionGranted, activeServiceId, onSelectService }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markersRef = useRef<Map<string, Marker>>(new Map())
  const userMarkerRef = useRef<Marker | null>(null)
  const initializedRef = useRef(false)

  // Init map once (avec position par défaut)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    import('maplibre-gl').then(({ Map, NavigationControl }) => {
      const map = new Map({
        container: containerRef.current!,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: [position.lng, position.lat],
        zoom: 14,
        attributionControl: false,
      })
      mapRef.current = map
      initializedRef.current = true
      map.addControl(new NavigationControl({ showCompass: false }), 'bottom-right')
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      initializedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Recentrer la carte + déplacer le marker utilisateur quand la position change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const move = () => {
      // Recentrer la carte sur la nouvelle position
      map.flyTo({ center: [position.lng, position.lat], zoom: 14, duration: 1200 })

      // Créer ou déplacer le marker de position utilisateur
      import('maplibre-gl').then(({ Marker }) => {
        if (userMarkerRef.current) {
          userMarkerRef.current.setLngLat([position.lng, position.lat])
        } else {
          const el = document.createElement('div')
          el.style.cssText = `
            width: 20px; height: 20px;
            border-radius: 50%;
            background: var(--color-primary, #2B3D5C);
            border: 3px solid #fff;
            box-shadow: 0 0 0 8px rgba(43,61,92,0.18);
            pointer-events: none;
          `
          userMarkerRef.current = new Marker({ element: el, anchor: 'center' })
            .setLngLat([position.lng, position.lat])
            .addTo(map)
        }
      })
    }

    if (map.loaded()) {
      move()
    } else {
      map.once('load', move)
    }
  }, [position])

  // Mise à jour des markers de services
  const updateMarkers = useCallback(() => {
    const map = mapRef.current
    if (!map) return

    import('maplibre-gl').then(({ Marker }) => {
      const currentIds = new Set(services.map((s) => s.id))

      markersRef.current.forEach((marker, id) => {
        if (!currentIds.has(id)) {
          marker.remove()
          markersRef.current.delete(id)
        }
      })

      services.forEach((service) => {
        if (markersRef.current.has(service.id)) return
        const cat = CATEGORY_CONFIG[service.category]

        const el = document.createElement('div')
        el.style.cssText = `
          width: 34px; height: 44px;
          display: flex; flex-direction: column; align-items: center;
          cursor: pointer; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
          transition: transform 0.2s, filter 0.2s;
        `
        el.innerHTML = `
          <div style="
            width:34px; height:34px; border-radius:50% 50% 50% 0;
            transform:rotate(-45deg); background:${cat.cssVar};
            border:2.5px solid #fff; display:flex; align-items:center; justify-content:center;
          "></div>
          <div style="width:2px; height:10px; background:${cat.cssVar}; margin-top:-1px;"></div>
        `
        el.addEventListener('click', () => {
          onSelectService(service.id === activeServiceId ? null : service.id)
        })

        const marker = new Marker({ element: el, anchor: 'bottom' })
          .setLngLat([service.lng, service.lat])
          .addTo(map)

        markersRef.current.set(service.id, marker)
      })
    })
  }, [services, activeServiceId, onSelectService])

  useEffect(() => {
    const map = mapRef.current
    if (!map) {
      const timer = setTimeout(updateMarkers, 500)
      return () => clearTimeout(timer)
    }
    if (map.loaded()) {
      updateMarkers()
    } else {
      map.once('load', updateMarkers)
    }
  }, [updateMarkers])

  // Marker actif : agrandir
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const el = marker.getElement()
      el.style.transform = id === activeServiceId ? 'scale(1.25)' : 'scale(1)'
      el.style.filter = id === activeServiceId
        ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))'
        : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
      el.style.zIndex = id === activeServiceId ? '10' : '1'
    })
  }, [activeServiceId])

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/maplibre-gl/dist/maplibre-gl.css" />
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </>
  )
}
