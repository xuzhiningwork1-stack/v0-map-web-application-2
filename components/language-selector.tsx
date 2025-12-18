"use client"

import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/hooks/use-language"

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="shadow-lg w-12 h-12">
          <Languages className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px] z-50">
        <DropdownMenuItem
          onClick={() => setLanguage("zh")}
          className={language === "zh" ? "bg-accent font-semibold" : ""}
        >
          <span className="w-full text-left">中文</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("en")}
          className={language === "en" ? "bg-accent font-semibold" : ""}
        >
          <span className="w-full text-left">English</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("ar")}
          className={language === "ar" ? "bg-accent font-semibold" : ""}
        >
          <span className="w-full text-right font-arabic">العربية</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("ms")}
          className={language === "ms" ? "bg-accent font-semibold" : ""}
        >
          <span className="w-full text-left">Bahasa Melayu</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("pt")}
          className={language === "pt" ? "bg-accent font-semibold" : ""}
        >
          <span className="w-full text-left">Português (BR)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("es")}
          className={language === "es" ? "bg-accent font-semibold" : ""}
        >
          <span className="w-full text-left">Español (ES)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
