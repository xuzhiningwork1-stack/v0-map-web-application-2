"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  MapPin,
  Car,
  Truck,
  ChevronRight,
  ArrowUpDown,
  X,
  Clock,
  Plus,
  Minus,
  Zap,
  Ruler,
  Leaf,
  ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/hooks/use-language"
import { locationsDatabase } from "@/lib/locations-data"

interface RoutePanelProps {
  initialStartText: string
  initialEndText: string
  onRouteComplete: (
    start: { lat: number; lng: number; name: string },
    end: { lat: number; lng: number; name: string },
    waypoints?: Array<{ lat: number; lng: number; name: string }>,
  ) => void
  onClose: () => void
  onClearRoute?: () => void
}

type TravelMode = "driving" | "truck"
type RouteType = "fastest" | "shortest" | "eco"

interface Waypoint {
  id: string
  query: string
  selected: { lat: number; lng: number; name: string } | null
  showSuggestions: boolean
}

export function RoutePanel({
  initialStartText,
  initialEndText,
  onRouteComplete,
  onClose,
  onClearRoute,
}: RoutePanelProps) {
  const [startQuery, setStartQuery] = useState(initialStartText)
  const [endQuery, setEndQuery] = useState(initialEndText)
  const [showStartSuggestions, setShowStartSuggestions] = useState(false)
  const [showEndSuggestions, setShowEndSuggestions] = useState(false)
  const [selectedStart, setSelectedStart] = useState<{ lat: number; lng: number; name: string } | null>(null)
  const [selectedEnd, setSelectedEnd] = useState<{ lat: number; lng: number; name: string } | null>(null)
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const { t, language, dir } = useLanguage()
  const [travelMode, setTravelMode] = useState<TravelMode>("driving")
  const [routeType, setRouteType] = useState<RouteType>("fastest")
  const [showRouteDetails, setShowRouteDetails] = useState(false)
  const [routeInstructions, setRouteInstructions] = useState<Array<{ icon: string; text: string; distance: string }>>(
    [],
  )
  const [totalDistance, setTotalDistance] = useState<number>(0)
  const [totalTime, setTotalTime] = useState<number>(0)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    if (initialStartText && initialStartText !== startQuery) {
      console.log("[v0] RoutePanel - Updating start text:", initialStartText)
      setStartQuery(initialStartText)
      const coords = parseCoordinates(initialStartText)
      if (coords) {
        setSelectedStart({ ...coords, name: initialStartText })
      }
    }
  }, [initialStartText])

  useEffect(() => {
    if (initialEndText && initialEndText !== endQuery) {
      console.log("[v0] RoutePanel - Updating end text:", initialEndText)
      setEndQuery(initialEndText)
      const coords = parseCoordinates(initialEndText)
      if (coords) {
        setSelectedEnd({ ...coords, name: initialEndText })
      }
    }
  }, [initialEndText])

  useEffect(() => {
    if (selectedStart && selectedEnd) {
      console.log("[v0] Auto-planning route")
      const waypointsData = waypoints.filter((wp) => wp.selected).map((wp) => wp.selected!)
      onRouteComplete(selectedStart, selectedEnd, waypointsData)
      const instructions = generateRouteInstructions(selectedStart, selectedEnd, t)
      setRouteInstructions(instructions)

      let totalDist = 0
      const points = [selectedStart, ...waypointsData, selectedEnd]
      for (let i = 0; i < points.length - 1; i++) {
        totalDist += calculateDistance(points[i], points[i + 1])
      }

      const distance = adjustDistanceForRouteType(totalDist, routeType)
      const time = estimateTravelTime(distance, travelMode, routeType)
      setTotalDistance(distance)
      setTotalTime(time)

      setShowRouteDetails(true)
    }
  }, [selectedStart, selectedEnd, waypoints, travelMode, routeType])

  const handleStartSelect = (location: (typeof locationsDatabase)[0]) => {
    const locationName =
      language === "zh"
        ? location.name
        : language === "en"
          ? location.nameEn
          : language === "ar"
            ? location.nameAr
            : language === "ms"
              ? location.nameMs || location.nameEn
              : language === "pt"
                ? location.namePt || location.nameEn
                : location.nameEs || location.nameEn
    setSelectedStart({ lat: location.lat, lng: location.lng, name: locationName })
    setStartQuery(locationName)
    setShowStartSuggestions(false)
  }

  const handleEndSelect = (location: (typeof locationsDatabase)[0]) => {
    const locationName =
      language === "zh"
        ? location.name
        : language === "en"
          ? location.nameEn
          : language === "ar"
            ? location.nameAr
            : language === "ms"
              ? location.nameMs || location.nameEn
              : language === "pt"
                ? location.namePt || location.nameEn
                : location.nameEs || location.nameEn
    setSelectedEnd({ lat: location.lat, lng: location.lng, name: locationName })
    setEndQuery(locationName)
    setShowEndSuggestions(false)
  }

  const filteredStartLocations = locationsDatabase
    .filter((location) => {
      const searchLower = startQuery.toLowerCase().trim()
      if (!searchLower) return false
      return (
        location.name.toLowerCase().includes(searchLower) ||
        location.nameEn.toLowerCase().includes(searchLower) ||
        location.nameAr.includes(startQuery)
      )
    })
    .slice(0, 6)

  const filteredEndLocations = locationsDatabase
    .filter((location) => {
      const searchLower = endQuery.toLowerCase().trim()
      if (!searchLower) return false
      return (
        location.name.toLowerCase().includes(searchLower) ||
        location.nameEn.toLowerCase().includes(searchLower) ||
        location.nameAr.includes(endQuery)
      )
    })
    .slice(0, 6)

  const getTypeLabel = (type: string) => {
    const labels: Record<string, { zh: string; en: string; ar: string; ms: string; pt: string; es: string }> = {
      city: { zh: "城市", en: "City", ar: "مدينة", ms: "Bandar", pt: "Cidade", es: "Ciudad" },
      landmark: { zh: "地标", en: "Landmark", ar: "معلم", ms: "Mercu Tanda", pt: "Marco", es: "Punto de Interés" },
      airport: { zh: "机场", en: "Airport", ar: "مطار", ms: "Lapangan Terbang", pt: "Aeroporto", es: "Aeropuerto" },
    }
    return labels[type]?.[language] || type
  }

  const renderInstructionIcon = (icon: string) => {
    switch (icon) {
      case "start":
        return <div className="w-3 h-3 rounded-full bg-primary" />
      case "end":
        return <div className="w-3 h-3 rounded-full bg-destructive" />
      case "left":
        return <ChevronRight className="w-4 h-4 text-primary -rotate-180" />
      case "right":
        return <ChevronRight className="w-4 h-4 text-primary" />
      case "straight":
        return <ChevronRight className="w-4 h-4 text-primary -rotate-90" />
      default:
        return <div className="w-3 h-3 rounded-full bg-muted" />
    }
  }

  const handleSwapLocations = () => {
    const tempQuery = startQuery
    const tempSelected = selectedStart

    setStartQuery(endQuery)
    setSelectedStart(selectedEnd)

    setEndQuery(tempQuery)
    setSelectedEnd(tempSelected)
  }

  const handleAddWaypoint = () => {
    if (waypoints.length < 3) {
      setWaypoints([
        ...waypoints,
        {
          id: Date.now().toString(),
          query: "",
          selected: null,
          showSuggestions: false,
        },
      ])
    }
  }

  const handleRemoveWaypoint = (id: string) => {
    setWaypoints(waypoints.filter((wp) => wp.id !== id))
  }

  const handleWaypointQueryChange = (id: string, query: string) => {
    setWaypoints(waypoints.map((wp) => (wp.id === id ? { ...wp, query, showSuggestions: true, selected: null } : wp)))
  }

  const handleWaypointSelect = (id: string, location: (typeof locationsDatabase)[0]) => {
    const locationName =
      language === "zh"
        ? location.name
        : language === "en"
          ? location.nameEn
          : language === "ar"
            ? location.nameAr
            : language === "ms"
              ? location.nameMs || location.nameEn
              : language === "pt"
                ? location.namePt || location.nameEn
                : location.nameEs || location.nameEn
    setWaypoints(
      waypoints.map((wp) =>
        wp.id === id
          ? {
              ...wp,
              query: locationName,
              selected: { lat: location.lat, lng: location.lng, name: locationName },
              showSuggestions: false,
            }
          : wp,
      ),
    )
  }

  const getFilteredWaypointLocations = (query: string) => {
    return locationsDatabase
      .filter((location) => {
        const searchLower = query.toLowerCase().trim()
        if (!searchLower) return false
        return (
          location.name.toLowerCase().includes(searchLower) ||
          location.nameEn.toLowerCase().includes(searchLower) ||
          location.nameAr.includes(query)
        )
      })
      .slice(0, 6)
  }

  const generateRouteInstructions = (
    start: { name: string },
    end: { name: string },
    t: any,
  ): Array<{ icon: string; text: string; distance: string }> => {
    const streets = [
      "Main Street",
      "Central Avenue",
      "Park Boulevard",
      "River Road",
      "Market Street",
      "King's Highway",
      "Queen's Road",
      "Victory Avenue",
    ]

    const randomStreet1 = streets[Math.floor(Math.random() * streets.length)]
    const randomStreet2 = streets[Math.floor(Math.random() * streets.length)]

    return [
      { icon: "start", text: `${t.startPoint}: ${start.name}`, distance: "" },
      { icon: "straight", text: `${t.goStraight} ${t.along} ${randomStreet1}`, distance: "2.3 km" },
      { icon: "left", text: `${t.turnLeft} ${t.along} ${randomStreet2}`, distance: "1.8 km" },
      { icon: "right", text: `${t.turnRight}`, distance: "0.5 km" },
      { icon: "straight", text: `${t.goStraight}`, distance: "3.2 km" },
      { icon: "end", text: `${t.arrive} ${end.name}`, distance: "" },
    ]
  }

  const parseCoordinates = (text: string): { lat: number; lng: number } | null => {
    const coordPattern = /^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/
    const match = text.trim().match(coordPattern)
    if (match) {
      return { lat: Number.parseFloat(match[1]), lng: Number.parseFloat(match[2]) }
    }
    return null
  }

  const calculateDistance = (start: { lat: number; lng: number }, end: { lat: number; lng: number }): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = ((end.lat - start.lat) * Math.PI) / 180
    const dLng = ((end.lng - start.lng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((start.lat * Math.PI) / 180) *
        Math.cos((end.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const estimateTravelTime = (distanceKm: number, mode: TravelMode, type: RouteType): number => {
    let speed = mode === "driving" ? 60 : 50

    if (type === "fastest") {
      speed = mode === "driving" ? 80 : 65
    } else if (type === "eco") {
      speed = mode === "driving" ? 50 : 40
    }

    return (distanceKm / speed) * 60
  }

  const adjustDistanceForRouteType = (baseDistance: number, type: RouteType): number => {
    switch (type) {
      case "fastest":
        return baseDistance * 1.1
      case "shortest":
        return baseDistance
      case "eco":
        return baseDistance * 1.15
      default:
        return baseDistance
    }
  }

  const getRouteTypeIcon = (type: RouteType) => {
    switch (type) {
      case "fastest":
        return <Zap className="h-4 w-4" />
      case "shortest":
        return <Ruler className="h-4 w-4" />
      case "eco":
        return <Leaf className="h-4 w-4" />
    }
  }

  if (isCollapsed) {
    return (
      <div className={`absolute top-4 ${dir === "rtl" ? "right-20" : "left-4"} z-10`}>
        <Button variant="default" size="icon" onClick={() => setIsCollapsed(false)} className="shadow-xl">
          {dir === "rtl" ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>
    )
  }

  return (
    <div
      className={`absolute top-4 ${dir === "rtl" ? "right-20" : "left-4"} z-10 transition-all duration-300`}
      style={{ width: showRouteDetails ? "500px" : "420px" }}
    >
      <Card className="bg-white shadow-xl border-border/50 backdrop-blur-sm">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-5">
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-accent/50">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-bold text-foreground">{showRouteDetails ? t.routeDetails : t.routePlanning}</h2>
            {showRouteDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedStart(null)
                  setSelectedEnd(null)
                  setStartQuery("")
                  setEndQuery("")
                  setWaypoints([])
                  setShowRouteDetails(false)
                  onClearRoute?.()
                }}
                className={`${dir === "rtl" ? "mr-auto" : "ml-auto"} text-muted-foreground hover:text-foreground`}
              >
                <X className={`h-4 w-4 ${dir === "rtl" ? "ml-2" : "mr-2"}`} />
                {t.clearRoute}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(true)}
              className={`${showRouteDetails ? "" : dir === "rtl" ? "mr-auto" : "ml-auto"} hover:bg-accent/50`}
            >
              {dir === "rtl" ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>

          <div className="mb-4 flex gap-2">
            <Button
              variant={travelMode === "driving" ? "default" : "outline"}
              size="sm"
              onClick={() => setTravelMode("driving")}
              className="flex-1"
            >
              <Car className={`h-4 w-4 ${dir === "rtl" ? "ml-2" : "mr-2"}`} />
              {t.drivingMode}
            </Button>
            <Button
              variant={travelMode === "truck" ? "default" : "outline"}
              size="sm"
              onClick={() => setTravelMode("truck")}
              className="flex-1"
            >
              <Truck className={`h-4 w-4 ${dir === "rtl" ? "ml-2" : "mr-2"}`} />
              {t.truckMode}
            </Button>
          </div>

          <div className="space-y-4">
            {/* Start Location */}
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-primary flex-shrink-0 ring-4 ring-primary/20" />
                <Input
                  type="text"
                  placeholder={t.startPoint}
                  value={startQuery}
                  onChange={(e) => {
                    setStartQuery(e.target.value)
                    setShowStartSuggestions(true)
                    setSelectedStart(null)
                  }}
                  onFocus={() => setShowStartSuggestions(true)}
                  className={`flex-1 h-11 ${dir === "rtl" ? "text-right" : ""} border-input focus-visible:ring-primary`}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSwapLocations}
                  className="h-8 w-8 hover:bg-accent/50"
                  title={t.swapStartEnd}
                >
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>

              {showStartSuggestions && startQuery && filteredStartLocations.length > 0 && (
                <div className="absolute top-full mt-2 w-full max-h-64 overflow-y-auto border rounded-xl bg-white shadow-lg z-50">
                  {filteredStartLocations.map((location, index) => (
                    <button
                      key={index}
                      onClick={() => handleStartSelect(location)}
                      className="w-full px-4 py-3 text-left hover:bg-accent/50 flex items-center gap-3 border-b last:border-b-0"
                    >
                      <MapPin className="h-4 w-4 text-primary" />
                      <div className={`flex-1 ${dir === "rtl" ? "text-right" : "text-left"}`}>
                        <span className="text-sm font-medium">
                          {language === "zh"
                            ? location.name
                            : language === "en"
                              ? location.nameEn
                              : language === "ar"
                                ? location.nameAr
                                : language === "ms"
                                  ? location.nameMs || location.nameEn
                                  : language === "pt"
                                    ? location.namePt || location.nameEn
                                    : location.nameEs || location.nameEn}
                        </span>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {getTypeLabel(location.type)}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Add Waypoint Button */}
            {waypoints.length < 3 && (
              <div className={`flex items-center ${dir === "rtl" ? "mr-[7px]" : "ml-[7px]"}`}>
                <div className="h-3 w-0.5 bg-border" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleAddWaypoint}
                  className="h-8 w-8 rounded-full hover:bg-primary/10 mx-auto"
                  title={t.addWaypoint}
                >
                  <Plus className="h-4 w-4 text-primary" />
                </Button>
                <div className="h-3 w-0.5 bg-border" />
              </div>
            )}

            {/* Waypoints */}
            {waypoints.map((waypoint, index) => (
              <div key={waypoint.id}>
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-orange-500 flex-shrink-0 ring-4 ring-orange-500/20 flex items-center justify-center text-[10px] font-bold text-white">
                      {index + 1}
                    </div>
                    <Input
                      type="text"
                      placeholder={`${t.waypoint} ${index + 1}`}
                      value={waypoint.query}
                      onChange={(e) => handleWaypointQueryChange(waypoint.id, e.target.value)}
                      onFocus={() =>
                        setWaypoints(
                          waypoints.map((wp) => (wp.id === waypoint.id ? { ...wp, showSuggestions: true } : wp)),
                        )
                      }
                      className={`flex-1 h-11 ${dir === "rtl" ? "text-right" : ""} border-input focus-visible:ring-orange-500`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveWaypoint(waypoint.id)}
                      className="h-8 w-8 hover:bg-destructive/10"
                      title={t.removeWaypoint}
                    >
                      <Minus className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  {waypoint.showSuggestions &&
                    waypoint.query &&
                    getFilteredWaypointLocations(waypoint.query).length > 0 && (
                      <div className="absolute top-full mt-2 w-full max-h-64 overflow-y-auto border rounded-xl bg-white shadow-lg z-50">
                        {getFilteredWaypointLocations(waypoint.query).map((location, locIndex) => (
                          <button
                            key={locIndex}
                            onClick={() => handleWaypointSelect(waypoint.id, location)}
                            className="w-full px-4 py-3 text-left hover:bg-accent/50 flex items-center gap-3 border-b last:border-b-0"
                          >
                            <MapPin className="h-4 w-4 text-orange-500" />
                            <div className={`flex-1 ${dir === "rtl" ? "text-right" : "text-left"}`}>
                              <span className="text-sm font-medium">
                                {language === "zh"
                                  ? location.name
                                  : language === "en"
                                    ? location.nameEn
                                    : language === "ar"
                                      ? location.nameAr
                                      : language === "ms"
                                        ? location.nameMs || location.nameEn
                                        : language === "pt"
                                          ? location.namePt || location.nameEn
                                          : location.nameEs || location.nameEn}
                              </span>
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {getTypeLabel(location.type)}
                              </Badge>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                </div>

                {waypoints.length < 3 && index === waypoints.length - 1 && (
                  <div className={`flex items-center mt-4 ${dir === "rtl" ? "mr-[7px]" : "ml-[7px]"}`}>
                    <div className="h-3 w-0.5 bg-border" />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleAddWaypoint}
                      className="h-8 w-8 rounded-full hover:bg-primary/10 mx-auto"
                      title={t.addWaypoint}
                    >
                      <Plus className="h-4 w-4 text-primary" />
                    </Button>
                    <div className="h-3 w-0.5 bg-border" />
                  </div>
                )}
              </div>
            ))}

            {/* End Location */}
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-destructive flex-shrink-0 ring-4 ring-destructive/20" />
                <Input
                  type="text"
                  placeholder={t.endPoint}
                  value={endQuery}
                  onChange={(e) => {
                    setEndQuery(e.target.value)
                    setShowEndSuggestions(true)
                    setSelectedEnd(null)
                  }}
                  onFocus={() => setShowEndSuggestions(true)}
                  className={`flex-1 h-11 ${dir === "rtl" ? "text-right" : ""} border-input focus-visible:ring-destructive`}
                />
              </div>

              {showEndSuggestions && endQuery && filteredEndLocations.length > 0 && (
                <div className="absolute top-full mt-2 w-full max-h-64 overflow-y-auto border rounded-xl bg-white shadow-lg z-50">
                  {filteredEndLocations.map((location, index) => (
                    <button
                      key={index}
                      onClick={() => handleEndSelect(location)}
                      className="w-full px-4 py-3 text-left hover:bg-accent/50 flex items-center gap-3 border-b last:border-b-0"
                    >
                      <MapPin className="h-4 w-4 text-destructive" />
                      <div className={`flex-1 ${dir === "rtl" ? "text-right" : "text-left"}`}>
                        <span className="text-sm font-medium">
                          {language === "zh"
                            ? location.name
                            : language === "en"
                              ? location.nameEn
                              : language === "ar"
                                ? location.nameAr
                                : language === "ms"
                                  ? location.nameMs || location.nameEn
                                  : language === "pt"
                                    ? location.namePt || location.nameEn
                                    : location.nameEs || location.nameEn}
                        </span>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {getTypeLabel(location.type)}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {showRouteDetails && (
            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-3">{t.routeOptions}</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setRouteType("fastest")}
                    className={`w-full p-3 rounded-lg border-2 flex items-center gap-3 transition-all ${
                      routeType === "fastest"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-accent/30"
                    }`}
                  >
                    {getRouteTypeIcon("fastest")}
                    <span className="font-medium">{t.fastestRoute}</span>
                    {routeType === "fastest" && (
                      <Badge variant="default" className={`${dir === "rtl" ? "mr-auto" : "ml-auto"} text-xs`}>
                        {t.recommended}
                      </Badge>
                    )}
                  </button>

                  <button
                    onClick={() => setRouteType("shortest")}
                    className={`w-full p-3 rounded-lg border-2 flex items-center gap-3 transition-all ${
                      routeType === "shortest"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-accent/30"
                    }`}
                  >
                    {getRouteTypeIcon("shortest")}
                    <span className="font-medium">{t.shortestRoute}</span>
                  </button>

                  <button
                    onClick={() => setRouteType("eco")}
                    className={`w-full p-3 rounded-lg border-2 flex items-center gap-3 transition-all ${
                      routeType === "eco"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-accent/30"
                    }`}
                  >
                    {getRouteTypeIcon("eco")}
                    <span className="font-medium">{t.ecoRoute}</span>
                  </button>
                </div>
              </div>

              {/* Route Summary */}
              <Card className="bg-accent/30 border-none p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{t.distance}</span>
                  </div>
                  <span className="text-lg font-bold">{Math.round(totalDistance)} km</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{t.estimatedTime}</span>
                  </div>
                  <span className="text-lg font-bold">
                    {totalTime >= 60
                      ? `${Math.floor(totalTime / 60)} ${t.hours} ${Math.round(totalTime % 60)} ${t.minutes}`
                      : `${Math.round(totalTime)} ${t.minutes}`}
                  </span>
                </div>
              </Card>

              {/* Route Instructions */}
              <div>
                <div className="space-y-3">
                  {routeInstructions.map((instruction, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-1">{renderInstructionIcon(instruction.icon)}</div>
                      <div className="flex-1">
                        <p className={`text-sm ${dir === "rtl" ? "text-right" : "text-left"}`}>{instruction.text}</p>
                        {instruction.distance && (
                          <p
                            className={`text-xs text-muted-foreground mt-1 ${dir === "rtl" ? "text-right" : "text-left"}`}
                          >
                            {instruction.distance}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  if (hours > 0) {
    return `${hours}h ${mins}min`
  }
  return `${mins}min`
}
