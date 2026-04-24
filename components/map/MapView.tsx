'use client'
import { useEffect, useRef, useCallback } from 'react'
import type { Map as MapLibreMap, Marker } from 'maplibre-gl'
import type { ServiceDTO, GeoPosition } from '@/lib/types'
import { CATEGORY_CONFIG } from '@/lib/categories'

interface Props {
  services: ServiceDTO[]
  position: GeoPosition
  activeServiceId: string | null
  onSelectService: (id: string | null) => void
}

export function MapView({ services, position, activeServiceId, onSelectService }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markersRef = useRef<Map<string, Marker>>(new Map())

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    let map: MapLibreMap
    import('maplibre-gl').then(({ Map, NavigationControl }) => {
      map = new Map({
        container: containerRef.current!,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: [position.lng, position.lat],
        zoom: 14,
        attributionControl: false,
      })
      mapRef.current = map
      map.addControl(new NavigationControl({ showCompass: false }), 'bottom-right')
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update markers when services change
  const updateMarkers = useCallback(() => {
    const map = mapRef.current
    if (!map) return

    import('maplibre-gl').then(({ Marker }) => {
      const currentIds = new Set(services.map((s) => s.id))

      // Remove stale markers
      markersRef.current.forEach((marker, id) => {
        if (!currentIds.has(id)) {
          marker.remove()
          markersRef.current.delete(id)
        }
      })

      // Add new markers
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

  // Scale active marker
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
      {/* MapLibre CSS */}
      <link rel="stylesheet" href="https://unpkg.com/maplibre-gl/dist/maplibre-gl.css" />
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {/* User location dot */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)', zIndex: 4, pointerEvents: 'none',
      }}>
        <div style={{
          width: 16, height: 16, borderRadius: '50%',
          background: 'var(--color-primary)', border: '3px solid #fff',
          boxShadow: '0 0 0 8px rgba(43,61,92,0.15)',
        }} />
      </div>
    </>
  )
}
