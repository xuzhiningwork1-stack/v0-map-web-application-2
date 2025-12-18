"use client"

import { useState, useCallback } from "react"
import { MapContainer } from "@/components/map-container"
import { SearchPanel } from "@/components/search-panel"
import { RoutePanel } from "@/components/route-panel"
import { POIDetailPanel } from "@/components/poi-detail-panel"
import { useLanguage } from "@/hooks/use-language"

export default function MapPage() {
  const { dir } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number
    lng: number
    name: string
    type?: string
    address?: string
  } | null>(null)
  const [routeMode, setRouteMode] = useState(false)
  const [routeStartText, setRouteStartText] = useState("")
  const [routeEndText, setRouteEndText] = useState("")
  const [routeStartCoords, setRouteStartCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [routeEndCoords, setRouteEndCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [waypoints, setWaypoints] = useState<Array<{ lat: number; lng: number; name: string }>>([])
  const [showPOIDetail, setShowPOIDetail] = useState(false)
  const [nearbySearchLocation, setNearbySearchLocation] = useState<{ lat: number; lng: number; name: string } | null>(
    null,
  )

  const handleSearch = useCallback(
    (location: { lat: number; lng: number; name: string; type?: string; address?: string }) => {
      setSelectedLocation(location)
      setShowPOIDetail(true)
      setRouteMode(false)
      setNearbySearchLocation(null)
    },
    [],
  )

  const handleRouteRequest = useCallback(() => {
    setRouteMode(true)
    setShowPOIDetail(false)
    if (selectedLocation) {
      setRouteStartText(selectedLocation.name)
      setRouteStartCoords({ lat: selectedLocation.lat, lng: selectedLocation.lng })
    }
    setNearbySearchLocation(null)
  }, [selectedLocation])

  const handleRouteComplete = useCallback(
    (
      start: { lat: number; lng: number; name: string },
      end: { lat: number; lng: number; name: string },
      waypointsList: Array<{ lat: number; lng: number; name: string }> = [],
    ) => {
      setRouteStartCoords({ lat: start.lat, lng: start.lng })
      setRouteEndCoords({ lat: end.lat, lng: end.lng })
      setWaypoints(waypointsList)
    },
    [],
  )

  const handleSetRouteStart = useCallback((location: { lat: number; lng: number; name: string }) => {
    setRouteStartText(location.name)
    setRouteStartCoords({ lat: location.lat, lng: location.lng })
    setRouteMode(true)
    setShowPOIDetail(false)
    setNearbySearchLocation(null)
  }, [])

  const handleSetRouteEnd = useCallback((location: { lat: number; lng: number; name: string }) => {
    setRouteEndText(location.name)
    setRouteEndCoords({ lat: location.lat, lng: location.lng })
    setRouteMode(true)
    setShowPOIDetail(false)
    setNearbySearchLocation(null)
  }, [])

  const handleClosePOI = useCallback(() => {
    setShowPOIDetail(false)
    setSelectedLocation(null)
  }, [])

  const handleGoHere = useCallback(() => {
    if (selectedLocation) {
      setRouteMode(true)
      setRouteEndText(selectedLocation.name)
      setRouteEndCoords({ lat: selectedLocation.lat, lng: selectedLocation.lng })
      setShowPOIDetail(false)
      setNearbySearchLocation(null)
    }
  }, [selectedLocation])

  const handleSearchNearby = useCallback(() => {
    if (selectedLocation) {
      setNearbySearchLocation(selectedLocation)
      setShowPOIDetail(false)
    }
  }, [selectedLocation])

  const handleSearchNearbyFromMap = useCallback((location: { lat: number; lng: number; name: string }) => {
    setNearbySearchLocation(location)
    setRouteMode(false)
    setShowPOIDetail(false)
  }, [])

  const handleClearNearby = useCallback(() => {
    setNearbySearchLocation(null)
  }, [])

  const handleSetAsDestination = useCallback(() => {
    if (selectedLocation) {
      setRouteMode(true)
      setRouteEndText(selectedLocation.name)
      setRouteEndCoords({ lat: selectedLocation.lat, lng: selectedLocation.lng })
      setShowPOIDetail(false)
      setNearbySearchLocation(null)
    }
  }, [selectedLocation])

  const handleShowPOIDetail = useCallback(() => {
    setShowPOIDetail(true)
  }, [])

  const handleClearRoute = useCallback(() => {
    setRouteStartCoords(null)
    setRouteEndCoords(null)
    setWaypoints([])
  }, [])

  return (
    <div className="flex h-screen w-screen overflow-hidden" dir={dir}>
      {showPOIDetail && selectedLocation && !routeMode ? (
        <POIDetailPanel
          location={selectedLocation}
          onClose={handleClosePOI}
          onSearchNearby={handleSearchNearby}
          onGoHere={handleGoHere}
        />
      ) : !routeMode ? (
        <SearchPanel
          onSearch={handleSearch}
          onRouteRequest={handleRouteRequest}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          nearbyLocation={nearbySearchLocation}
          onClearNearby={handleClearNearby}
          selectedLocation={selectedLocation}
          showPOIDetail={showPOIDetail}
          onShowPOIDetail={handleShowPOIDetail}
          onSetAsDestination={handleSetAsDestination}
        />
      ) : (
        <RoutePanel
          initialStartText={routeStartText}
          initialEndText={routeEndText}
          onRouteComplete={handleRouteComplete}
          onClose={() => {
            setRouteMode(false)
            setShowPOIDetail(false)
          }}
          onClearRoute={handleClearRoute}
        />
      )}

      <MapContainer
        selectedLocation={selectedLocation}
        routeStart={routeStartCoords}
        routeEnd={routeEndCoords}
        waypoints={waypoints}
        onSetRouteStart={handleSetRouteStart}
        onSetRouteEnd={handleSetRouteEnd}
        onSearchNearby={handleSearchNearbyFromMap}
        showPOIDetail={showPOIDetail}
      />
    </div>
  )
}
