"use client"

import { useState } from "react"
import { Search, MapPin, Clock, Navigation, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/hooks/use-language"
import { locationsDatabase } from "@/lib/locations-data"

interface SearchPanelProps {
  onSearch: (location: { lat: number; lng: number; name: string; type?: string; address?: string }) => void
  onRouteRequest: () => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  nearbyLocation?: { lat: number; lng: number; name: string } | null
  onClearNearby?: () => void
  selectedLocation?: { lat: number; lng: number; name: string; type?: string; address?: string } | null
  showPOIDetail?: boolean
  onShowPOIDetail?: () => void
  onSetAsDestination?: () => void
}

export function SearchPanel({
  onSearch,
  onRouteRequest,
  searchQuery,
  setSearchQuery,
  nearbyLocation,
  onClearNearby,
  selectedLocation,
  showPOIDetail,
  onShowPOIDetail,
  onSetAsDestination,
}: SearchPanelProps) {
  const [recentSearches, setRecentSearches] = useState<typeof locationsDatabase>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { t, language, dir } = useLanguage()

  const handleSearch = (location: (typeof locationsDatabase)[0]) => {
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
    onSearch({
      lat: location.lat,
      lng: location.lng,
      name: locationName,
      type: location.type,
      address: location.address,
    })

    setRecentSearches((prev) => {
      const filtered = prev.filter((l) => l.name !== location.name)
      return [location, ...filtered].slice(0, 5)
    })

    setSearchQuery("")
    setShowSuggestions(false)
  }

  const filteredLocations = locationsDatabase
    .filter((location) => {
      const searchLower = searchQuery.toLowerCase().trim()
      if (!searchLower) return false
      return (
        location.name.toLowerCase().includes(searchLower) ||
        location.nameEn.toLowerCase().includes(searchLower) ||
        location.nameAr.includes(searchQuery)
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

  const getPlaceholder = () => {
    if (nearbyLocation) {
      return t.searchNearbyTemplate.replace("{location}", nearbyLocation.name)
    }
    return t.searchPlaceholder
  }

  return (
    <>
      <div className={`absolute top-4 ${dir === "rtl" ? "right-20" : "left-4"} z-10 w-auto`}>
        <div className="flex items-center gap-2">
          <div className="relative flex-shrink-0" style={{ width: "420px" }}>
            <Search
              className={`absolute top-1/2 -translate-y-1/2 ${dir === "rtl" ? "right-4" : "left-4"} h-5 w-5 text-primary`}
            />
            <Input
              type="text"
              placeholder={getPlaceholder()}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              className={`${dir === "rtl" ? "pr-12 pl-4 text-right" : "pl-12 pr-4"} ${nearbyLocation ? (dir === "rtl" ? "pl-12" : "pr-12") : ""} h-12 text-base border-input focus-visible:ring-primary bg-white shadow-lg`}
            />
            {nearbyLocation && onClearNearby && (
              <button
                onClick={onClearNearby}
                className={`absolute top-1/2 -translate-y-1/2 ${dir === "rtl" ? "left-4" : "right-4"} text-muted-foreground hover:text-foreground transition-colors`}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Button
            onClick={onRouteRequest}
            size="icon"
            className="h-12 w-12 bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0 shadow-lg"
          >
            <Navigation className="h-5 w-5" />
          </Button>
        </div>

        {showSuggestions && searchQuery && filteredLocations.length > 0 && (
          <div
            className="mt-2 max-h-80 overflow-y-auto border rounded-xl bg-white shadow-xl"
            style={{ width: "420px" }}
          >
            {filteredLocations.map((location, index) => (
              <button
                key={index}
                onClick={() => handleSearch(location)}
                className="w-full px-4 py-3 text-left hover:bg-accent/50 flex items-center gap-3 border-b last:border-b-0 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className={`flex-1 ${dir === "rtl" ? "text-right" : "text-left"}`}>
                  <div className="font-medium text-foreground">
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
                  </div>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {getTypeLabel(location.type)}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        )}

        {!searchQuery && recentSearches.length > 0 && (
          <div className="mt-2 p-3 bg-white shadow-xl rounded-xl" style={{ width: "420px" }}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t.recentSearches}
            </h3>
            <div className="space-y-1">
              {recentSearches.map((location, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(location)}
                  className="w-full px-3 py-2.5 text-left hover:bg-accent/50 rounded-lg flex items-center gap-3 transition-colors"
                >
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className={`text-sm ${dir === "rtl" ? "text-right" : "text-left"}`}>
                    {language === "zh" ? location.name : language === "en" ? location.nameEn : location.nameAr}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedLocation && !showPOIDetail && !nearbyLocation && (
        <button
          onClick={onShowPOIDetail}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl px-5 py-4 z-10 max-w-md border border-border/50 hover:shadow-2xl transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-base text-foreground">{selectedLocation.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
              </p>
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onSetAsDestination?.()
              }}
              size="icon"
              className="h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0"
            >
              <Navigation className="h-4 w-4" />
            </Button>
          </div>
        </button>
      )}
    </>
  )
}
