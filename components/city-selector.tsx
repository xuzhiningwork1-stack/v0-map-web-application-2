"use client"

import { useState, useRef, useEffect } from "react"
import { useLanguage } from "@/hooks/use-language"
import { MapIcon } from "lucide-react"

interface CitySelectorProps {
  onCitySelect: (city: { lat: number; lng: number; name: string }) => void
}

const citiesData = [
  {
    name: "北京",
    nameEn: "Beijing",
    nameAr: "بكين",
    nameMs: "Beijing",
    namePt: "Pequim",
    nameEs: "Pekín",
    lat: 39.9042,
    lng: 116.4074,
  },
  {
    name: "曼谷",
    nameEn: "Bangkok",
    nameAr: "بانكوك",
    nameMs: "Bangkok",
    namePt: "Bangcoc",
    nameEs: "Bangkok",
    lat: 13.7563,
    lng: 100.5018,
  },
  {
    name: "迪拜",
    nameEn: "Dubai",
    nameAr: "دبي",
    nameMs: "Dubai",
    namePt: "Dubai",
    nameEs: "Dubái",
    lat: 25.2048,
    lng: 55.2708,
  },
  {
    name: "吉隆坡",
    nameEn: "Kuala Lumpur",
    nameAr: "كوالالمبور",
    nameMs: "Kuala Lumpur",
    namePt: "Kuala Lumpur",
    nameEs: "Kuala Lumpur",
    lat: 3.139,
    lng: 101.6869,
  },
  {
    name: "圣保罗",
    nameEn: "São Paulo",
    nameAr: "ساو باولو",
    nameMs: "São Paulo",
    namePt: "São Paulo",
    nameEs: "São Paulo",
    lat: -23.5505,
    lng: -46.6333,
  },
  {
    name: "墨西哥城",
    nameEn: "Mexico City",
    nameAr: "مكسيكو سيتي",
    nameMs: "Mexico City",
    namePt: "Cidade do México",
    nameEs: "Ciudad de México",
    lat: 19.4326,
    lng: -99.1332,
  },
  {
    name: "新加坡",
    nameEn: "Singapore",
    nameAr: "سنغافورة",
    nameMs: "Singapura",
    namePt: "Singapura",
    nameEs: "Singapur",
    lat: 1.3521,
    lng: 103.8198,
  },
]

export function CitySelector({ onCitySelect }: CitySelectorProps) {
  const { language, dir, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const getCityName = (city: any) => {
    switch (language) {
      case "zh":
        return city.name
      case "en":
        return city.nameEn || city.name
      case "ar":
        return city.nameAr || city.name
      case "ms":
        return city.nameMs || city.name
      case "pt":
        return city.namePt || city.name
      case "es":
        return city.nameEs || city.name
      default:
        return city.name
    }
  }

  const handleCityClick = (city: any) => {
    const cityName = getCityName(city)
    setSelectedCity(cityName)
    onCitySelect({
      lat: city.lat,
      lng: city.lng,
      name: cityName,
    })
    setIsOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 px-4 bg-white rounded-xl shadow-xl border border-border/50 hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
        aria-label="Select city"
      >
        <MapIcon className="w-5 h-5 text-primary flex-shrink-0" />
        <span className="text-sm font-medium text-foreground whitespace-nowrap">{selectedCity || t.selectCity}</span>
      </button>

      {isOpen && (
        <div
          className={`absolute top-14 ${dir === "rtl" ? "left-0" : "right-0"} w-64 bg-white rounded-xl shadow-2xl border border-border z-50 max-h-96 overflow-y-auto`}
        >
          <div className="p-2 border-b border-border/50 sticky top-0 bg-white">
            <p className="text-sm font-semibold text-foreground px-2 py-1">{t.selectCity}</p>
          </div>
          <div className="py-1">
            {citiesData.map((city, index) => (
              <button
                key={index}
                onClick={() => handleCityClick(city)}
                className="w-full px-4 py-2.5 text-left hover:bg-primary/10 transition-colors text-sm font-medium flex items-center gap-3"
              >
                <MapIcon className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-foreground">{getCityName(city)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
