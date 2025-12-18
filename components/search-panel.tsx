"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, MapPin, Clock, Navigation, X, Utensils, Hotel, Building2, Trash2 } from "lucide-react"
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
  const [searchHistory, setSearchHistory] = useState<Array<{ name: string; type?: string; lat: number; lng: number }>>(
    [],
  )
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const { t, language, dir } = useLanguage()

  useEffect(() => {
    const saved = localStorage.getItem("searchHistory")
    console.log("[v0] Loading search history from localStorage:", saved)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        console.log("[v0] Parsed search history:", parsed)
        setSearchHistory(parsed)
      } catch (e) {
        console.error("[v0] Failed to load search history:", e)
      }
    }
  }, [])

  useEffect(() => {
    console.log("[v0] Saving search history to localStorage:", searchHistory)
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory))
  }, [searchHistory])

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

    console.log("[v0] Adding to search history:", locationName)

    onSearch({
      lat: location.lat,
      lng: location.lng,
      name: locationName,
      type: location.type,
      address: location.address,
    })

    setSearchHistory((prev) => {
      const filtered = prev.filter((l) => l.lat !== location.lat || l.lng !== location.lng)
      return [{ name: locationName, type: location.type, lat: location.lat, lng: location.lng }, ...filtered].slice(
        0,
        10,
      )
    })

    setSearchQuery("")
    setShowSuggestions(false)
    setIsFocused(false)
  }

  const handleCategorySearch = (category: string) => {
    console.log("[v0] Category search:", category)
    setSearchQuery(category)
    setShowSuggestions(true)
  }

  const handleRemoveHistoryItem = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("[v0] Removing history item at index:", index)
    setSearchHistory((prev) => prev.filter((_, i) => i !== index))
  }

  const handleClearAllHistory = () => {
    console.log("[v0] Clearing all history")
    setSearchHistory([])
  }

  const filteredLocations = locationsDatabase
    .filter((location) => {
      const searchLower = searchQuery.toLowerCase().trim()
      if (!searchLower) return false
      return (
        location.name.toLowerCase().includes(searchLower) ||
        location.nameEn.toLowerCase().includes(searchLower) ||
        location.nameAr.includes(searchQuery) ||
        location.type.toLowerCase().includes(searchLower)
      )
    })
    .slice(0, 6)

  const getTypeLabel = (type: string) => {
    const labels: Record<string, { zh: string; en: string; ar: string; ms: string; pt: string; es: string }> = {
      city: { zh: "城市", en: "City", ar: "مدينة", ms: "Bandar", pt: "Cidade", es: "Ciudad" },
      landmark: { zh: "地标", en: "Landmark", ar: "معلم", ms: "Mercu Tanda", pt: "Marco", es: "Punto de Interés" },
      airport: { zh: "机场", en: "Airport", ar: "مطار", ms: "Lapangan Terbang", pt: "Aeroporto", es: "Aeropuerto" },
      restaurant: { zh: "餐厅", en: "Restaurant", ar: "مطعم", ms: "Restoran", pt: "Restaurante", es: "Restaurante" },
      hotel: { zh: "酒店", en: "Hotel", ar: "فندق", ms: "Hotel", pt: "Hotel", es: "Hotel" },
      bank: { zh: "银行", en: "Bank", ar: "بنك", ms: "Bank", pt: "Banco", es: "Banco" },
    }
    return labels[type]?.[language] || type
  }

  const getPlaceholder = () => {
    if (nearbyLocation) {
      return t.searchNearbyTemplate.replace("{location}", nearbyLocation.name)
    }
    return t.searchPlaceholder
  }

  const categories = [
    {
      key: "restaurant",
      icon: Utensils,
      label: { zh: "餐厅", en: "Restaurant", ar: "مطعم", ms: "Restoran", pt: "Restaurante", es: "Restaurante" },
    },
    {
      key: "hotel",
      icon: Hotel,
      label: { zh: "酒店", en: "Hotel", ar: "فندق", ms: "Hotel", pt: "Hotel", es: "Hotel" },
    },
    {
      key: "bank",
      icon: Building2,
      label: { zh: "银行", en: "Bank", ar: "بنك", ms: "Bank", pt: "Banco", es: "Banco" },
    },
  ]

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
                setShowSuggestions(e.target.value.length > 0)
              }}
              onFocus={() => {
                console.log("[v0] Input focused")
                setIsFocused(true)
              }}
              onBlur={() => {
                console.log("[v0] Input blur - waiting 200ms")
                setTimeout(() => {
                  setIsFocused(false)
                  setShowSuggestions(false)
                }, 200)
              }}
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

        {isFocused && !searchQuery && (
          <div
            className="mt-2 bg-white shadow-xl rounded-xl border border-border/50 overflow-hidden"
            style={{ width: "420px" }}
          >
            {/* Category buttons */}
            <div className="p-4 border-b border-border/50">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">{t.quickSearch}</h3>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => {
                  const Icon = cat.icon
                  return (
                    <button
                      key={cat.key}
                      onClick={() => handleCategorySearch(cat.key)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-sm font-medium"
                    >
                      <Icon className="w-4 h-4 text-primary" />
                      {cat.label[language]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Search history */}
            {searchHistory.length > 0 && (
              <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {t.recentSearches}
                  </h3>
                  <button
                    onClick={handleClearAllHistory}
                    className="text-xs text-destructive hover:text-destructive/80 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    {t.clearAll}
                  </button>
                </div>
                <div className="space-y-1">
                  {searchHistory.slice(0, 5).map((item, index) => (
                    <div
                      key={index}
                      className="group w-full px-3 py-2.5 hover:bg-accent/50 rounded-lg flex items-center gap-3 transition-colors cursor-pointer"
                      onClick={() => {
                        console.log("[v0] Clicking history item:", item)
                        const location = locationsDatabase.find((l) => l.lat === item.lat && l.lng === item.lng)
                        if (location) handleSearch(location)
                      }}
                    >
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className={`text-sm flex-1 ${dir === "rtl" ? "text-right" : "text-left"}`}>
                        {item.name}
                      </span>
                      <button
                        onClick={(e) => handleRemoveHistoryItem(index, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search results dropdown */}
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
