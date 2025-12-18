"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useLanguage } from "@/hooks/use-language"
import { MapPin, Plus, Minus, Compass, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/language-selector"
import { CitySelector } from "@/components/city-selector"

interface MapContainerProps {
  selectedLocation: { lat: number; lng: number; name: string } | null
  routeStart: { lat: number; lng: number; name: string } | null
  routeEnd: { lat: number; lng: number; name: string } | null
  waypoints?: Array<{ lat: number; lng: number; name: string }>
  onSetRouteStart?: (location: { lat: number; lng: number; name: string }) => void
  onSetRouteEnd?: (location: { lat: number; lng: number; name: string }) => void
  onSearchNearby?: (location: { lat: number; lng: number; name: string }) => void
  showPOIDetail?: boolean
}

export function MapContainer({
  selectedLocation,
  routeStart,
  routeEnd,
  waypoints = [],
  onSetRouteStart,
  onSetRouteEnd,
  onSearchNearby,
  showPOIDetail,
}: MapContainerProps) {
  const [mapCenter, setMapCenter] = useState({ lat: 39.9042, lng: 116.4074 })
  const [zoom, setZoom] = useState(10)
  const { t, dir } = useLanguage()
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; lat: number; lng: number } | null>(null)
  const [is3DView, setIs3DView] = useState(false)
  const [mapStyle, setMapStyle] = useState<"standard" | "satellite" | "terrain">("standard")
  const [showStyleMenu, setShowStyleMenu] = useState(false)

  useEffect(() => {
    if (selectedLocation) {
      setMapCenter({ lat: selectedLocation.lat, lng: selectedLocation.lng })
      setZoom(12)
    }
  }, [selectedLocation])

  useEffect(() => {
    if (routeStart && routeEnd) {
      const allPoints = [routeStart, ...waypoints, routeEnd]
      const avgLat = allPoints.reduce((sum, p) => sum + p.lat, 0) / allPoints.length
      const avgLng = allPoints.reduce((sum, p) => sum + p.lng, 0) / allPoints.length
      setMapCenter({ lat: avgLat, lng: avgLng })
      setZoom(8)
    }
  }, [routeStart, routeEnd, waypoints])

  const handleZoomIn = () => setZoom((z) => Math.min(z + 1, 18))
  const handleZoomOut = () => setZoom((z) => Math.max(z - 1, 3))

  const handleMouseDown = (e: React.MouseEvent) => {
    if (contextMenu) {
      setContextMenu(null)
      return
    }
    if (e.button !== 2) {
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y

    const zoomFactor = 0.05 / Math.pow(2, zoom - 10)
    const deltaLng = -deltaX * zoomFactor * 0.5
    const deltaLat = deltaY * zoomFactor * 0.5

    setMapCenter((prev) => ({
      lat: prev.lat + deltaLat,
      lng: prev.lng + deltaLng,
    }))
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    console.log("[v0] Context menu triggered")

    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    const fakeLat = 39.9 + Math.random() * 0.2 - 0.1
    const fakeLng = 116.4 + Math.random() * 0.2 - 0.1

    console.log("[v0] Generated fake coords:", fakeLat, fakeLng)

    setContextMenu({
      x,
      y,
      lat: fakeLat,
      lng: fakeLng,
    })
  }

  const handleSetAsStart = () => {
    console.log("[v0] handleSetAsStart clicked")
    if (onSetRouteStart) {
      const tiananmenSquare = {
        lat: 39.9042,
        lng: 116.4074,
        name: "天安门 / Tiananmen Square",
      }
      console.log("[v0] MapContainer - Calling onSetRouteStart with Tiananmen:", tiananmenSquare)
      onSetRouteStart(tiananmenSquare)
    }
    setContextMenu(null)
  }

  const handleSetAsEnd = () => {
    console.log("[v0] handleSetAsEnd clicked")
    if (onSetRouteEnd) {
      const birdsNest = {
        lat: 39.9928,
        lng: 116.3972,
        name: "鸟巢 / Bird's Nest",
      }
      console.log("[v0] MapContainer - Calling onSetRouteEnd with Bird's Nest:", birdsNest)
      onSetRouteEnd(birdsNest)
    }
    setContextMenu(null)
  }

  const handleSearchNearbyFromMenu = () => {
    console.log("[v0] handleSearchNearbyFromMenu clicked")
    if (onSearchNearby) {
      const birdsNest = {
        lat: 39.9928,
        lng: 116.3972,
        name: "鸟巢 / Bird's Nest",
      }
      console.log("[v0] MapContainer - Calling onSearchNearby with Bird's Nest:", birdsNest)
      onSearchNearby(birdsNest)
    }
    setContextMenu(null)
  }

  const handle3DToggle = () => {
    setIs3DView((prev) => !prev)
  }

  const handleStyleChange = (style: "standard" | "satellite" | "terrain") => {
    setMapStyle(style)
    setShowStyleMenu(false)
  }

  const buildMapUrl = () => {
    const zoomFactor = 0.05 / Math.pow(2, zoom - 10)
    const bbox = [
      mapCenter.lng - zoomFactor,
      mapCenter.lat - zoomFactor,
      mapCenter.lng + zoomFactor,
      mapCenter.lat + zoomFactor,
    ].join(",")

    let layer = "mapnik" // standard
    if (mapStyle === "satellite") {
      layer = "mapnik" // OSM doesn't have true satellite, keep mapnik
    } else if (mapStyle === "terrain") {
      layer = "mapnik" // OSM terrain would need different provider
    }

    let url = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=${layer}`

    if (selectedLocation) {
      url += `&marker=${selectedLocation.lat},${selectedLocation.lng}`
    }

    return url
  }

  const calculateDistance = () => {
    if (!routeStart || !routeEnd) return null
    const R = 6371
    const dLat = ((routeEnd.lat - routeStart.lat) * Math.PI) / 180
    const dLon = ((routeEnd.lng - routeStart.lng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((routeStart.lat * Math.PI) / 180) *
        Math.cos((routeEnd.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    return distance.toFixed(0)
  }

  const getScreenPosition = (location: { lat: number; lng: number }) => {
    if (!containerRef.current) return { x: 0, y: 0 }

    const rect = containerRef.current.getBoundingClientRect()
    const zoomFactor = 0.05 / Math.pow(2, zoom - 10)

    const relLng = (location.lng - mapCenter.lng) / (zoomFactor * 2)
    const relLat = (mapCenter.lat - location.lat) / (zoomFactor * 2)

    const x = rect.width / 2 + relLng * rect.width
    const y = rect.height / 2 + relLat * rect.height

    return { x, y }
  }

  const generateCurvedPath = () => {
    if (!routeStart || !routeEnd) return ""

    const allPoints = [routeStart, ...waypoints, routeEnd]
    const positions = allPoints.map(getScreenPosition)

    if (positions.length === 2) {
      // Simple curve for 2 points
      const startPos = positions[0]
      const endPos = positions[1]
      const midX = (startPos.x + endPos.x) / 2
      const midY = (startPos.y + endPos.y) / 2
      const dx = endPos.x - startPos.x
      const dy = endPos.y - startPos.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const offset = distance * 0.15
      const perpX = -dy / distance
      const perpY = dx / distance
      const controlX = midX + perpX * offset
      const controlY = midY + perpY * offset
      return `M ${startPos.x} ${startPos.y} Q ${controlX} ${controlY}, ${endPos.x} ${endPos.y}`
    }

    // Multiple segments for waypoints
    let path = `M ${positions[0].x} ${positions[0].y}`
    for (let i = 0; i < positions.length - 1; i++) {
      const startPos = positions[i]
      const endPos = positions[i + 1]
      const midX = (startPos.x + endPos.x) / 2
      const midY = (startPos.y + endPos.y) / 2
      const dx = endPos.x - startPos.x
      const dy = endPos.y - startPos.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const offset = distance * 0.15
      const perpX = -dy / distance
      const perpY = dx / distance
      const controlX = midX + perpX * offset
      const controlY = midY + perpY * offset
      path += ` Q ${controlX} ${controlY}, ${endPos.x} ${endPos.y}`
    }
    return path
  }

  const generateArrowsAlongPath = () => {
    if (!routeStart || !routeEnd) return []

    const arrows: Array<{ x: number; y: number; angle: number }> = []
    const allPoints = [routeStart, ...waypoints, routeEnd]
    const positions = allPoints.map(getScreenPosition)

    // Generate arrows for each segment
    for (let i = 0; i < positions.length - 1; i++) {
      const startPos = positions[i]
      const endPos = positions[i + 1]
      const midX = (startPos.x + endPos.x) / 2
      const midY = (startPos.y + endPos.y) / 2
      const dx = endPos.x - startPos.x
      const dy = endPos.y - startPos.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const offset = distance * 0.15
      const perpX = -dy / distance
      const perpY = dx / distance
      const controlX = midX + perpX * offset
      const controlY = midY + perpY * offset

      const numArrows = Math.floor(distance / 80)
      for (let j = 1; j <= numArrows; j++) {
        const t = j / (numArrows + 1)
        const x = (1 - t) * (1 - t) * startPos.x + 2 * (1 - t) * t * controlX + t * t * endPos.x
        const y = (1 - t) * (1 - t) * startPos.y + 2 * (1 - t) * t * controlY + t * t * endPos.y

        const t1 = Math.max(0, t - 0.01)
        const t2 = Math.min(1, t + 0.01)
        const x1 = (1 - t1) * (1 - t1) * startPos.x + 2 * (1 - t1) * t1 * controlX + t1 * t1 * endPos.x
        const y1 = (1 - t1) * (1 - t1) * startPos.y + 2 * (1 - t1) * t1 * controlY + t1 * t1 * endPos.y
        const x2 = (1 - t2) * (1 - t2) * startPos.x + 2 * (1 - t2) * t2 * controlX + t2 * t2 * endPos.x
        const y2 = (1 - t2) * (1 - t2) * startPos.y + 2 * (1 - t2) * t2 * controlY + t2 * t2 * endPos.y

        const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI)
        arrows.push({ x, y, angle })
      }
    }

    return arrows
  }

  const routeStartPos = routeStart ? getScreenPosition(routeStart) : null
  const routeEndPos = routeEnd ? getScreenPosition(routeEnd) : null
  const waypointPositions = waypoints.map(getScreenPosition)
  const arrowPositions = generateArrowsAlongPath()

  return (
    <div
      ref={containerRef}
      className="relative flex-1 h-full w-full overflow-hidden bg-slate-100"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={handleContextMenu}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      {/* Map iframe */}
      <iframe
        key={`${mapCenter.lat}-${mapCenter.lng}-${zoom}-${mapStyle}`}
        src={buildMapUrl()}
        className="w-full h-full border-0 pointer-events-none"
        title="Map"
        loading="lazy"
      />

      <div className="absolute bottom-4 left-4 z-10">
        <img src="/images/logo.png" alt="云图知行" className="h-8 w-auto" />
      </div>

      <div className={`absolute bottom-4 z-20 ${dir === "rtl" ? "left-4" : "right-4"}`}>
        <div className="relative">
          <Button
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            variant="ghost"
            size="icon"
            className="bg-white rounded-xl shadow-xl border border-border/50 hover:bg-primary/10 h-12 w-12"
            aria-label={t.mapStyle}
            title={t.mapStyle}
          >
            <Layers className="w-6 h-6 text-primary" />
          </Button>

          {showStyleMenu && (
            <>
              <div className="fixed inset-0 z-[15]" onClick={() => setShowStyleMenu(false)} />
              <div
                className={`absolute bottom-full mb-2 bg-white rounded-xl shadow-2xl border border-border/50 overflow-hidden min-w-[160px] z-[20] ${
                  dir === "rtl" ? "left-0" : "right-0"
                }`}
              >
                <button
                  onClick={() => handleStyleChange("standard")}
                  className={`w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors text-sm font-medium border-b border-border/50 flex items-center gap-3 ${
                    mapStyle === "standard" ? "bg-primary/20 text-primary" : ""
                  }`}
                >
                  <div className="w-4 h-4 rounded border-2 border-gray-400 bg-white" />
                  {t.standardMap}
                </button>
                <button
                  onClick={() => handleStyleChange("satellite")}
                  className={`w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors text-sm font-medium border-b border-border/50 flex items-center gap-3 ${
                    mapStyle === "satellite" ? "bg-primary/20 text-primary" : ""
                  }`}
                >
                  <div className="w-4 h-4 rounded border-2 border-blue-400 bg-blue-100" />
                  {t.satelliteMap}
                </button>
                <button
                  onClick={() => handleStyleChange("terrain")}
                  className={`w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors text-sm font-medium flex items-center gap-3 ${
                    mapStyle === "terrain" ? "bg-primary/20 text-primary" : ""
                  }`}
                >
                  <div className="w-4 h-4 rounded border-2 border-green-400 bg-green-100" />
                  {t.terrainMap}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className={`absolute top-4 z-20 flex flex-col gap-2 ${dir === "rtl" ? "left-4" : "right-4"}`}>
        <div className="flex gap-2">
          <LanguageSelector />
          <CitySelector onCitySelect={(city) => setMapCenter({ lat: city.lat, lng: city.lng })} />
        </div>

        <div className="flex flex-col gap-0 bg-white rounded-xl shadow-xl overflow-hidden border border-border/50 w-12 self-end">
          <Button
            onClick={handleZoomIn}
            variant="ghost"
            size="icon"
            className="rounded-none border-b border-border/50 hover:bg-primary/10 h-12 w-12"
            aria-label="Zoom in"
          >
            <Plus className="w-5 h-5 text-primary" />
          </Button>
          <Button
            onClick={handleZoomOut}
            variant="ghost"
            size="icon"
            className="rounded-none hover:bg-primary/10 h-12 w-12"
            aria-label="Zoom out"
          >
            <Minus className="w-5 h-5 text-primary" />
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-border/50 w-12 self-end">
          <Button
            onClick={handle3DToggle}
            variant="ghost"
            size="icon"
            className={`rounded-none hover:bg-primary/10 h-12 w-12 transition-all ${is3DView ? "bg-primary/20" : ""}`}
            aria-label={is3DView ? t.view2D : t.view3D}
            title={is3DView ? t.view2D : t.view3D}
          >
            <Compass
              className={`w-6 h-6 transition-all ${is3DView ? "text-primary rotate-45" : "text-muted-foreground"}`}
            />
          </Button>
        </div>
      </div>

      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-[45]"
            onClick={() => {
              console.log("[v0] Backdrop clicked, closing menu")
              setContextMenu(null)
            }}
          />

          <div
            className="fixed z-[50] bg-white rounded-lg shadow-2xl border border-border overflow-hidden min-w-[200px]"
            style={{
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleSetAsStart}
              className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors text-sm font-medium border-b border-border/50 flex items-center gap-2"
            >
              <div className="w-3 h-3 rounded-full bg-primary" />
              {t.setAsStart}
            </button>
            <button
              onClick={handleSetAsEnd}
              className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors text-sm font-medium border-b border-border/50 flex items-center gap-2"
            >
              <div className="w-3 h-3 rounded-full bg-destructive" />
              {t.setAsEnd}
            </button>
            <button
              onClick={handleSearchNearbyFromMenu}
              className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-primary" />
              {t.searchNearby}
            </button>
          </div>
        </>
      )}

      {selectedLocation && !routeStart && !routeEnd && !showPOIDetail && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl px-5 py-4 z-10 max-w-sm border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-bold text-base text-foreground">{selectedLocation.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      )}

      {routeStart && routeEnd && routeStartPos && routeEndPos && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-[5]">
          <defs>
            <marker
              id="arrowhead-small"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
              fill="#3A5EFB"
            >
              <polygon points="0 0, 8 4, 0 8" />
            </marker>
          </defs>
          {/* Curved route path */}
          <path
            d={generateCurvedPath()}
            stroke="#3A5EFB"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Arrows along the path */}
          {arrowPositions.map((arrow, index) => (
            <polygon
              key={index}
              points="0 -4, 10 0, 0 4"
              fill="#3A5EFB"
              transform={`translate(${arrow.x}, ${arrow.y}) rotate(${arrow.angle})`}
            />
          ))}
          {waypointPositions.map((pos, index) => (
            <g key={`waypoint-${index}`}>
              <circle cx={pos.x} cy={pos.y} r="14" fill="#f97316" stroke="white" strokeWidth="3" />
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="11"
                fontWeight="bold"
              >
                {index + 1}
              </text>
            </g>
          ))}
          {/* Start point marker with text */}
          <circle cx={routeStartPos.x} cy={routeStartPos.y} r="16" fill="#3A5EFB" stroke="white" strokeWidth="3" />
          <text
            x={routeStartPos.x}
            y={routeStartPos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="12"
            fontWeight="bold"
          >
            {t.start}
          </text>
          {/* End point marker with text */}
          <circle cx={routeEndPos.x} cy={routeEndPos.y} r="16" fill="#ef4444" stroke="white" strokeWidth="3" />
          <text
            x={routeEndPos.x}
            y={routeEndPos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="12"
            fontWeight="bold"
          >
            {t.end}
          </text>
        </svg>
      )}
    </div>
  )
}
