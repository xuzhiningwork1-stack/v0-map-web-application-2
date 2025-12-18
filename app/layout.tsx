import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { LanguageProvider } from "@/hooks/use-language"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _notoArabic = Noto_Sans_Arabic({ subsets: ["arabic"], variable: "--font-arabic" })

export const metadata: Metadata = {
  title: "地图应用 | Map Application | تطبيق الخرائط",
  description: "Interactive map with search and route planning | خريطة تفاعلية مع البحث وتخطيط المسار",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={`font-sans antialiased ${_notoArabic.variable}`}>
        <LanguageProvider>{children}</LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
