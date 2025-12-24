"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Language = "zh" | "en" | "ar" | "ms" | "pt" | "es"

interface Translations {
  searchPlaceholder: string
  recentSearches: string
  getDirections: string
  routePlanning: string
  startPoint: string
  endPoint: string
  routeDetails: string
  route: string
  planRoute: string
  distance: string
  setAsStart: string
  setAsEnd: string
  start: string
  end: string
  drivingMode: string
  truckMode: string
  mode: string
  turnLeft: string
  turnRight: string
  goStraight: string
  along: string
  arrive: string
  goHere: string
  searchNearby: string
  pointOfInterest: string
  searchNearbyTemplate: string
  swapStartEnd: string
  selectCity: string
  clearRoute: string
  view3D: string
  view2D: string
  mapStyle: string
  standardMap: string
  satelliteMap: string
  terrainMap: string
  estimatedTime: string
  hours: string
  minutes: string
  waypoint: string
  addWaypoint: string
  removeWaypoint: string
  quickSearch: string
  clearAll: string
  routeOptions: string
  fastestRoute: string
  shortestRoute: string
  ecoRoute: string
  recommended: string
  collapsePanel: string
  expandPanel: string
}

const translations: Record<Language, Translations> = {
  zh: {
    searchPlaceholder: "搜索地点",
    recentSearches: "最近搜索",
    getDirections: "路线规划",
    routePlanning: "路线规划",
    startPoint: "起点",
    endPoint: "终点",
    routeDetails: "路线详情",
    route: "路线",
    planRoute: "规划路线",
    distance: "距离",
    setAsStart: "选择为起点",
    setAsEnd: "选择为终点",
    start: "起",
    end: "终",
    drivingMode: "驾车模式",
    truckMode: "货车模式",
    mode: "模式",
    turnLeft: "左转",
    turnRight: "右转",
    goStraight: "直行",
    along: "沿",
    arrive: "到达",
    goHere: "去这里",
    searchNearby: "搜附近",
    pointOfInterest: "兴趣点",
    searchNearbyTemplate: "在{location}附近搜索",
    swapStartEnd: "交换起终点",
    selectCity: "选择城市",
    clearRoute: "清除路线",
    view3D: "3D视角",
    view2D: "2D视角",
    mapStyle: "地图样式",
    standardMap: "标准地图",
    satelliteMap: "卫星地图",
    terrainMap: "地形地图",
    estimatedTime: "预计时间",
    hours: "小时",
    minutes: "分钟",
    waypoint: "途经点",
    addWaypoint: "添加途经点",
    removeWaypoint: "删除途经点",
    quickSearch: "快捷搜索",
    clearAll: "清空",
    routeOptions: "路线选择",
    fastestRoute: "最快路线",
    shortestRoute: "距离最短",
    ecoRoute: "环保路线",
    recommended: "推荐",
    collapsePanel: "收起面板",
    expandPanel: "展开面板",
  },
  en: {
    searchPlaceholder: "Search places",
    recentSearches: "Recent searches",
    getDirections: "Get Directions",
    routePlanning: "Route Planning",
    startPoint: "Start point",
    endPoint: "End point",
    routeDetails: "Route Details",
    route: "Route",
    planRoute: "Plan Route",
    distance: "Distance",
    setAsStart: "Set as start point",
    setAsEnd: "Set as end point",
    start: "Start",
    end: "End",
    drivingMode: "Driving Mode",
    truckMode: "Truck Mode",
    mode: "Mode",
    turnLeft: "Turn left",
    turnRight: "Turn right",
    goStraight: "Go straight",
    along: "Along",
    arrive: "Arrive at",
    goHere: "Go here",
    searchNearby: "Search nearby",
    pointOfInterest: "Point of Interest",
    searchNearbyTemplate: "Search near {location}",
    swapStartEnd: "Swap start/end",
    selectCity: "Select City",
    clearRoute: "Clear Route",
    view3D: "3D View",
    view2D: "2D View",
    mapStyle: "Map Style",
    standardMap: "Standard",
    satelliteMap: "Satellite",
    terrainMap: "Terrain",
    estimatedTime: "Estimated Time",
    hours: "h",
    minutes: "min",
    waypoint: "Waypoint",
    addWaypoint: "Add waypoint",
    removeWaypoint: "Remove waypoint",
    quickSearch: "Quick Search",
    clearAll: "Clear All",
    routeOptions: "Route Options",
    fastestRoute: "Fastest Route",
    shortestRoute: "Shortest Distance",
    ecoRoute: "Eco-Friendly",
    recommended: "Recommended",
    collapsePanel: "Collapse panel",
    expandPanel: "Expand panel",
  },
  ar: {
    searchPlaceholder: "البحث عن الأماكن",
    recentSearches: "عمليات البحث الأخيرة",
    getDirections: "الحصول على الاتجاهات",
    routePlanning: "تخطيط المسار",
    startPoint: "نقطة البداية",
    endPoint: "نقطة النهاية",
    routeDetails: "تفاصيل المسار",
    route: "المسار",
    planRoute: "تخطيط المسار",
    distance: "المسافة",
    setAsStart: "تعيين كنقطة بداية",
    setAsEnd: "تعيين كنقطة نهاية",
    start: "بداية",
    end: "نهاية",
    drivingMode: "وضع القيادة",
    truckMode: "وضع الشاحنة",
    mode: "وضع",
    turnLeft: "انعطف يسارًا",
    turnRight: "انعطف يمينًا",
    goStraight: "استمر بشكل مستقيم",
    along: "على طول",
    arrive: "الوصول إلى",
    goHere: "اذهب إلى هنا",
    searchNearby: "البحث في الجوار",
    pointOfInterest: "نقطة اهتمام",
    searchNearbyTemplate: "البحث بالقرب من {location}",
    swapStartEnd: "تبديل البداية/النهاية",
    selectCity: "اختر المدينة",
    clearRoute: "مسح المسار",
    view3D: "عرض ثلاثي الأبعاد",
    view2D: "عرض ثنائي الأبعاد",
    mapStyle: "نمط الخريطة",
    standardMap: "قياسي",
    satelliteMap: "الأقمار الصناعية",
    terrainMap: "التضاريس",
    estimatedTime: "الوقت المقدر",
    hours: "ساعة",
    minutes: "دقيقة",
    waypoint: "نقطة مرور",
    addWaypoint: "إضافة نقطة مرور",
    removeWaypoint: "حذف نقطة مرور",
    quickSearch: "بحث سريع",
    clearAll: "مسح الكل",
    routeOptions: "خيارات المسار",
    fastestRoute: "المسار الأسرع",
    shortestRoute: "أقصر مسافة",
    ecoRoute: "صديق للبيئة",
    recommended: "موصى به",
    collapsePanel: "طي اللوحة",
    expandPanel: "توسيع اللوحة",
  },
  ms: {
    searchPlaceholder: "Cari lokasi",
    recentSearches: "Carian terkini",
    getDirections: "Dapatkan Arah",
    routePlanning: "Perancangan Laluan",
    startPoint: "Titik permulaan",
    endPoint: "Titik akhir",
    routeDetails: "Butiran Laluan",
    route: "Laluan",
    planRoute: "Rancang Laluan",
    distance: "Jarak",
    setAsStart: "Tetapkan sebagai titik permulaan",
    setAsEnd: "Tetapkan sebagai titik akhir",
    start: "Mula",
    end: "Tamat",
    drivingMode: "Mod Memandu",
    truckMode: "Modo Lori",
    mode: "Mod",
    turnLeft: "Belok kiri",
    turnRight: "Belok kanan",
    goStraight: "Terus ke hadapan",
    along: "Sepanjang",
    arrive: "Tiba di",
    goHere: "Pergi ke sini",
    searchNearby: "Cari berdekatan",
    pointOfInterest: "Tempat Menarik",
    searchNearbyTemplate: "Cari berhampiran {location}",
    swapStartEnd: "Tukar permulaan/akhir",
    selectCity: "Pilih Bandar",
    clearRoute: "Kosongkan Laluan",
    view3D: "Paparan 3D",
    view2D: "Paparan 2D",
    mapStyle: "Gaya Peta",
    standardMap: "Standard",
    satelliteMap: "Satelit",
    terrainMap: "Rupa Bumi",
    estimatedTime: "Masa Anggaran",
    hours: "jam",
    minutes: "minit",
    waypoint: "Titik Singgah",
    addWaypoint: "Tambah titik singgah",
    removeWaypoint: "Buang titik singgah",
    quickSearch: "Carian Pantas",
    clearAll: "Kosongkan Semua",
    routeOptions: "Pilihan Laluan",
    fastestRoute: "Laluan Terpantas",
    shortestRoute: "Jarak Terpendek",
    ecoRoute: "Mesra Alam",
    recommended: "Disyorkan",
    collapsePanel: "Tutup panel",
    expandPanel: "Kembangkan panel",
  },
  pt: {
    searchPlaceholder: "Pesquisar locais",
    recentSearches: "Pesquisas recentes",
    getDirections: "Obter Direções",
    routePlanning: "Planejamento de Rota",
    startPoint: "Ponto de partida",
    endPoint: "Ponto de chegada",
    routeDetails: "Detalhes da Rota",
    route: "Rota",
    planRoute: "Planejar Rota",
    distance: "Distância",
    setAsStart: "Definir como ponto de partida",
    setAsEnd: "Definir como ponto de chegada",
    start: "Início",
    end: "Fim",
    drivingMode: "Modo de Condução",
    truckMode: "Modo Caminhão",
    mode: "Modo",
    turnLeft: "Vire à esquerda",
    turnRight: "Vire à direita",
    goStraight: "Continúe recto",
    along: "Ao longo de",
    arrive: "Chegar a",
    goHere: "Ir para aqui",
    searchNearby: "Buscar próximo",
    pointOfInterest: "Ponto de Interesse",
    searchNearbyTemplate: "Buscar perto de {location}",
    swapStartEnd: "Trocar início/fim",
    selectCity: "Selecionar Cidade",
    clearRoute: "Limpar Rota",
    view3D: "Visualização 3D",
    view2D: "Visualização 2D",
    mapStyle: "Estilo do Mapa",
    standardMap: "Padrão",
    satelliteMap: "Satélite",
    terrainMap: "Terreno",
    estimatedTime: "Tempo Estimado",
    hours: "h",
    minutes: "min",
    waypoint: "Ponto de Passagem",
    addWaypoint: "Adicionar ponto de passagem",
    removeWaypoint: "Remover ponto de passagem",
    quickSearch: "Busca Rápida",
    clearAll: "Limpar Tudo",
    routeOptions: "Opções de Rota",
    fastestRoute: "Rota Mais Rápida",
    shortestRoute: "Distância Mais Curta",
    ecoRoute: "Ecológica",
    recommended: "Recomendado",
    collapsePanel: "Recolher painel",
    expandPanel: "Expandir painel",
  },
  es: {
    searchPlaceholder: "Buscar lugares",
    recentSearches: "Búsquedas recientes",
    getDirections: "Obtener Direcciones",
    routePlanning: "Planificación de Ruta",
    startPoint: "Punto de inicio",
    endPoint: "Ponto final",
    routeDetails: "Detalles de la Ruta",
    route: "Ruta",
    planRoute: "Planificar Ruta",
    distance: "Distancia",
    setAsStart: "Establecer como punto de inicio",
    setAsEnd: "Establecer como punto de final",
    start: "Inicio",
    end: "Fin",
    drivingMode: "Modo de Conducción",
    truckMode: "Modo Camión",
    mode: "Modo",
    turnLeft: "Gire a la izquierda",
    turnRight: "Gire a la derecha",
    goStraight: "Continúe recto",
    along: "A lo largo de",
    arrive: "Llegar a",
    goHere: "Ir aquí",
    searchNearby: "Buscar cerca",
    pointOfInterest: "Punto de Interés",
    searchNearbyTemplate: "Buscar cerca de {location}",
    swapStartEnd: "Intercambiar inicio/fin",
    selectCity: "Seleccionar Ciudad",
    clearRoute: "Limpiar Rota",
    view3D: "Vista 3D",
    view2D: "Vista 2D",
    mapStyle: "Estilo de Mapa",
    standardMap: "Estándar",
    satelliteMap: "Satélite",
    terrainMap: "Terreno",
    estimatedTime: "Tiempo Estimado",
    hours: "h",
    minutes: "min",
    waypoint: "Punto de Paso",
    addWaypoint: "Añadir punto de paso",
    removeWaypoint: "Eliminar punto de paso",
    quickSearch: "Búsqueda Rápida",
    clearAll: "Limpiar Todo",
    routeOptions: "Opciones de Ruta",
    fastestRoute: "Ruta Más Rápida",
    shortestRoute: "Distancia Más Corta",
    ecoRoute: "Ecológica",
    recommended: "Recomendado",
    collapsePanel: "Contraer panel",
    expandPanel: "Expandir panel",
  },
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
  dir: "ltr" | "rtl"
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("zh")

  const value = {
    language,
    setLanguage,
    t: translations[language],
    dir: language === "ar" ? ("rtl" as const) : ("ltr" as const),
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
