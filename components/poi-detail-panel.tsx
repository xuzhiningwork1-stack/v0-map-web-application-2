"use client"

import { MapPin, Navigation2, Search, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/hooks/use-language"

interface POIDetailPanelProps {
  location: {
    lat: number
    lng: number
    name: string
    type?: string
    address?: string
    category?: string
  }
  onClose: () => void
  onSearchNearby: () => void
  onGoHere: () => void
}

export function POIDetailPanel({ location, onClose, onSearchNearby, onGoHere }: POIDetailPanelProps) {
  const { t, language, dir } = useLanguage()

  const getTypeLabel = (type: string) => {
    const labels: Record<string, { zh: string; en: string; ar: string; ms: string; pt: string; es: string }> = {
      city: { zh: "城市", en: "City", ar: "مدينة", ms: "Bandar", pt: "Cidade", es: "Ciudad" },
      landmark: { zh: "地标", en: "Landmark", ar: "معلم", ms: "Mercu Tanda", pt: "Marco", es: "Punto de Interés" },
      airport: { zh: "机场", en: "Airport", ar: "مطار", ms: "Lapangan Terbang", pt: "Aeroporto", es: "Aeropuerto" },
      restaurant: { zh: "餐厅", en: "Restaurant", ar: "مطعم", ms: "Restoran", pt: "Restaurante", es: "Restaurante" },
      hotel: { zh: "酒店", en: "Hotel", ar: "فندق", ms: "Hotel", pt: "Hotel", es: "Hotel" },
      shopping: { zh: "购物", en: "Shopping", ar: "تسوق", ms: "Membeli-belah", pt: "Compras", es: "Compras" },
      park: { zh: "公园", en: "Park", ar: "حديقة", ms: "Taman", pt: "Parque", es: "Parque" },
    }
    return labels[type]?.[language] || type
  }

  const getCategoryDisplay = () => {
    if (location.type) {
      return getTypeLabel(location.type)
    }
    if (location.category) {
      return location.category
    }
    return t.pointOfInterest
  }

  const getAddressDisplay = () => {
    if (location.address) {
      const addressParts = location.address.split("|").map((part) => part.trim())
      if (addressParts.length > 1) {
        // Try to find the address in the current language or default to first part
        const langIndex = { zh: 0, en: 1, ar: 2, ms: 1, pt: 1, es: 1 }[language] || 0
        return addressParts[Math.min(langIndex, addressParts.length - 1)]
      }
      return location.address
    }
    return null
  }

  return (
    <div className={`absolute top-4 ${dir === "rtl" ? "right-4" : "left-4"} z-10`} style={{ width: "420px" }}>
      <Card className="bg-white shadow-xl border-border/50 backdrop-blur-sm overflow-hidden">
        {/* Header with close button */}
        <div className="relative">
          <div className="h-48 bg-gradient-to-br from-primary/20 via-primary/10 to-background relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/scenic-landscape.png')] bg-cover bg-center opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className={`absolute top-3 ${dir === "rtl" ? "left-3" : "right-3"} bg-white/90 hover:bg-white shadow-lg`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-5">
          {/* Location name */}
          <h2 className={`text-2xl font-bold text-foreground mb-2 ${dir === "rtl" ? "text-right" : ""}`}>
            {location.name}
          </h2>

          <Badge variant="secondary" className="mb-4">
            {getCategoryDisplay()}
          </Badge>

          {getAddressDisplay() && (
            <div className={`flex items-start gap-3 mb-3 ${dir === "rtl" ? "flex-row-reverse" : ""}`}>
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className={`flex-1 ${dir === "rtl" ? "text-right" : ""}`}>
                <p className="text-sm text-muted-foreground leading-relaxed">{getAddressDisplay()}</p>
              </div>
            </div>
          )}

          <div className={`flex items-start gap-3 mb-4 ${dir === "rtl" ? "flex-row-reverse" : ""}`}>
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className={`flex-1 ${dir === "rtl" ? "text-right" : ""}`}>
              <p className="text-sm text-muted-foreground leading-relaxed font-mono">
                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={onGoHere} className="flex-1 bg-primary hover:bg-primary/90" size="lg">
              <Navigation2 className={`h-4 w-4 ${dir === "rtl" ? "ml-2" : "mr-2"}`} />
              {t.goHere}
            </Button>
            <Button onClick={onSearchNearby} variant="outline" className="flex-1 bg-transparent" size="lg">
              <Search className={`h-4 w-4 ${dir === "rtl" ? "ml-2" : "mr-2"}`} />
              {t.searchNearby}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
