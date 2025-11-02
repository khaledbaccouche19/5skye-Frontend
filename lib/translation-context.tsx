"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Translation {
  // Navigation
  dashboard: string
  towers: string
  monitoring: string
  maintenance: string
  analytics: string
  settings: string
  
  // Common
  search: string
  searchPlaceholder: string
  refresh: string
  loading: string
  error: string
  success: string
  cancel: string
  save: string
  delete: string
  edit: string
  add: string
  view: string
  close: string
  
  // Tower related
  towerStatus: string
  online: string
  offline: string
  maintenance: string
  temperature: string
  battery: string
  uptime: string
  networkLoad: string
  
  // Alerts
  alerts: string
  notifications: string
  critical: string
  high: string
  medium: string
  low: string
  
  // Hardware
  hardware: string
  components: string
  vendor: string
  model: string
  serialNumber: string
  warranty: string
  specifications: string
  
  // Maintenance
  maintenanceHistory: string
  scheduled: string
  inProgress: string
  completed: string
  cancelled: string
  onHold: string
  overdue: string
  routine: string
  emergency: string
  preventive: string
  corrective: string
  upgrade: string
  
  // AI Assistant
  aiAssistant: string
  chatWithAI: string
  askQuestion: string
  send: string
  
  // Language names
  english: string
  arabic: string
  french: string

  // Tower details page specific
  back: string
  exportData: string
  editTower: string
  tower3dVisualization: string
  refreshing: string
  auto: string

  // Tower form fields
  towerName: string
  statusLabel: string
  useCase: string
  region: string
  city: string
  latitude: string
  longitude: string
  metrics: string
  batteryPct: string
  temperatureC: string
  uptimePct: string
  networkLoadPct: string
  lastMaintenanceDate: string
  sitebossIntegrationOptional: string
  enableSiteboss: string
  testConnection: string
  testing: string
  connectionSuccess: string

  // Data source + credentials
  apiEndpointUrlOptional: string
  apiKeyOptional: string
  enterApiKey: string
  useSimulator: string
  deviceHostIp: string
  username: string
  password: string
}

const translations: Record<string, Translation> = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    towers: "Towers",
    monitoring: "Monitoring",
    maintenance: "Maintenance",
    analytics: "Analytics",
    settings: "Settings",
    
    // Common
    search: "Search",
    searchPlaceholder: "Search towers, alerts, or insights...",
    refresh: "Refresh",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    view: "View",
    close: "Close",
    
    // Tower related
    towerStatus: "Tower Status",
    online: "Online",
    offline: "Offline",
    maintenance: "Maintenance",
    temperature: "Temperature",
    battery: "Battery",
    uptime: "Uptime",
    networkLoad: "Network Load",
    
    // Alerts
    alerts: "Alerts",
    notifications: "Notifications",
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    
    // Hardware
    hardware: "Hardware",
    components: "Components",
    vendor: "Vendor",
    model: "Model",
    serialNumber: "Serial Number",
    warranty: "Warranty",
    specifications: "Specifications",
    
    // Maintenance
    maintenanceHistory: "Maintenance History",
    scheduled: "Scheduled",
    inProgress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    onHold: "On Hold",
    overdue: "Overdue",
    routine: "Routine",
    emergency: "Emergency",
    preventive: "Preventive",
    corrective: "Corrective",
    upgrade: "Upgrade",
    
    // AI Assistant
    aiAssistant: "AI Assistant",
    chatWithAI: "Chat with AI",
    askQuestion: "Ask a question...",
    send: "Send",
    
    // Language names
    english: "English",
    arabic: "العربية",
    french: "Français"
    ,
    // Tower details page specific
    back: "Back",
    exportData: "Export Data",
    editTower: "Edit Tower",
    tower3dVisualization: "3D Tower Visualization",
    refreshing: "Refreshing...",
    auto: "Auto"
    ,
    // Tower form fields
    towerName: "Tower Name",
    statusLabel: "Status",
    useCase: "Use Case",
    region: "Region",
    city: "City",
    latitude: "Latitude",
    longitude: "Longitude",
    metrics: "Metrics",
    batteryPct: "Battery (%)",
    temperatureC: "Temperature (°C)",
    uptimePct: "Uptime (%)",
    networkLoadPct: "Network Load (%)",
    lastMaintenanceDate: "Last Maintenance Date",
    sitebossIntegrationOptional: "SiteBoss Integration (Optional)",
    enableSiteboss: "Enable SiteBoss Integration",
    testConnection: "Test Connection",
    testing: "Testing...",
    connectionSuccess: "Connection successful"
    ,
    // Data source + credentials
    apiEndpointUrlOptional: "API Endpoint URL (Optional)",
    apiKeyOptional: "API Key (Optional)",
    enterApiKey: "Enter API key if required",
    useSimulator: "Use Simulator",
    deviceHostIp: "Device Host/IP",
    username: "Username",
    password: "Password"
  },
  ar: {
    // Navigation
    dashboard: "لوحة التحكم",
    towers: "الأبراج",
    monitoring: "المراقبة",
    maintenance: "الصيانة",
    analytics: "التحليلات",
    settings: "الإعدادات",
    
    // Common
    search: "بحث",
    searchPlaceholder: "ابحث في الأبراج أو التنبيهات أو الرؤى...",
    refresh: "تحديث",
    loading: "جاري التحميل...",
    error: "خطأ",
    success: "نجح",
    cancel: "إلغاء",
    save: "حفظ",
    delete: "حذف",
    edit: "تعديل",
    add: "إضافة",
    view: "عرض",
    close: "إغلاق",
    
    // Tower related
    towerStatus: "حالة البرج",
    online: "متصل",
    offline: "غير متصل",
    maintenance: "صيانة",
    temperature: "درجة الحرارة",
    battery: "البطارية",
    uptime: "وقت التشغيل",
    networkLoad: "حمل الشبكة",
    
    // Alerts
    alerts: "التنبيهات",
    notifications: "الإشعارات",
    critical: "حرج",
    high: "عالي",
    medium: "متوسط",
    low: "منخفض",
    
    // Hardware
    hardware: "الأجهزة",
    components: "المكونات",
    vendor: "الشركة المصنعة",
    model: "الموديل",
    serialNumber: "الرقم التسلسلي",
    warranty: "الضمان",
    specifications: "المواصفات",
    
    // Maintenance
    maintenanceHistory: "تاريخ الصيانة",
    scheduled: "مجدول",
    inProgress: "قيد التنفيذ",
    completed: "مكتمل",
    cancelled: "ملغي",
    onHold: "معلق",
    overdue: "متأخر",
    routine: "روتيني",
    emergency: "طوارئ",
    preventive: "وقائي",
    corrective: "تصحيحي",
    upgrade: "ترقية",
    
    // AI Assistant
    aiAssistant: "المساعد الذكي",
    chatWithAI: "تحدث مع الذكاء الاصطناعي",
    askQuestion: "اطرح سؤالاً...",
    send: "إرسال",
    
    // Language names
    english: "English",
    arabic: "العربية",
    french: "Français"
    ,
    // Tower details page specific
    back: "رجوع",
    exportData: "تصدير البيانات",
    editTower: "تعديل البرج",
    tower3dVisualization: "عرض البرج ثلاثي الأبعاد",
    refreshing: "جاري التحديث...",
    auto: "تلقائي"
    ,
    // Tower form fields
    towerName: "اسم البرج",
    statusLabel: "الحالة",
    useCase: "حالة الاستخدام",
    region: "المنطقة",
    city: "المدينة",
    latitude: "خط العرض",
    longitude: "خط الطول",
    metrics: "المؤشرات",
    batteryPct: "البطارية (%)",
    temperatureC: "درجة الحرارة (°م)",
    uptimePct: "وقت التشغيل (%)",
    networkLoadPct: "حمل الشبكة (%)",
    lastMaintenanceDate: "تاريخ آخر صيانة",
    sitebossIntegrationOptional: "تكامل SiteBoss (اختياري)",
    enableSiteboss: "تفعيل تكامل SiteBoss",
    testConnection: "اختبار الاتصال",
    testing: "جارٍ الاختبار...",
    connectionSuccess: "تم الاتصال بنجاح"
    ,
    // Data source + credentials
    apiEndpointUrlOptional: "عنوان واجهة البرمجة (اختياري)",
    apiKeyOptional: "مفتاح API (اختياري)",
    enterApiKey: "أدخل مفتاح API إذا لزم الأمر",
    useSimulator: "استخدام المحاكي",
    deviceHostIp: "مضيف/عنوان الجهاز",
    username: "اسم المستخدم",
    password: "كلمة المرور"
  },
  fr: {
    // Navigation
    dashboard: "Tableau de bord",
    towers: "Tours",
    monitoring: "Surveillance",
    maintenance: "Maintenance",
    analytics: "Analyses",
    settings: "Paramètres",
    
    // Common
    search: "Rechercher",
    searchPlaceholder: "Rechercher des tours, alertes ou insights...",
    refresh: "Actualiser",
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    cancel: "Annuler",
    save: "Enregistrer",
    delete: "Supprimer",
    edit: "Modifier",
    add: "Ajouter",
    view: "Voir",
    close: "Fermer",
    
    // Tower related
    towerStatus: "Statut de la tour",
    online: "En ligne",
    offline: "Hors ligne",
    maintenance: "Maintenance",
    temperature: "Température",
    battery: "Batterie",
    uptime: "Temps de fonctionnement",
    networkLoad: "Charge du réseau",
    
    // Alerts
    alerts: "Alertes",
    notifications: "Notifications",
    critical: "Critique",
    high: "Élevé",
    medium: "Moyen",
    low: "Faible",
    
    // Hardware
    hardware: "Matériel",
    components: "Composants",
    vendor: "Fournisseur",
    model: "Modèle",
    serialNumber: "Numéro de série",
    warranty: "Garantie",
    specifications: "Spécifications",
    
    // Maintenance
    maintenanceHistory: "Historique de maintenance",
    scheduled: "Programmé",
    inProgress: "En cours",
    completed: "Terminé",
    cancelled: "Annulé",
    onHold: "En attente",
    overdue: "En retard",
    routine: "Routine",
    emergency: "Urgence",
    preventive: "Préventif",
    corrective: "Correctif",
    upgrade: "Mise à niveau",
    
    // AI Assistant
    aiAssistant: "Assistant IA",
    chatWithAI: "Discuter avec l'IA",
    askQuestion: "Posez une question...",
    send: "Envoyer",
    
    // Language names
    english: "English",
    arabic: "العربية",
    french: "Français"
    ,
    // Tower details page specific
    back: "Retour",
    exportData: "Exporter les données",
    editTower: "Modifier la tour",
    tower3dVisualization: "Visualisation 3D de la tour",
    refreshing: "Actualisation...",
    auto: "Auto"
    ,
    // Tower form fields
    towerName: "Nom de la tour",
    statusLabel: "Statut",
    useCase: "Cas d'utilisation",
    region: "Région",
    city: "Ville",
    latitude: "Latitude",
    longitude: "Longitude",
    metrics: "Métriques",
    batteryPct: "Batterie (%)",
    temperatureC: "Température (°C)",
    uptimePct: "Temps de fonctionnement (%)",
    networkLoadPct: "Charge du réseau (%)",
    lastMaintenanceDate: "Date de la dernière maintenance",
    sitebossIntegrationOptional: "Intégration SiteBoss (Optionnel)",
    enableSiteboss: "Activer l'intégration SiteBoss",
    testConnection: "Tester la connexion",
    testing: "Test en cours...",
    connectionSuccess: "Connexion réussie"
    ,
    // Data source + credentials
    apiEndpointUrlOptional: "URL de l'API (Optionnel)",
    apiKeyOptional: "Clé API (Optionnel)",
    enterApiKey: "Entrer la clé API si nécessaire",
    useSimulator: "Utiliser le simulateur",
    deviceHostIp: "Hôte/IP du dispositif",
    username: "Nom d'utilisateur",
    password: "Mot de passe"
  }
}

interface TranslationContextType {
  language: string
  setLanguage: (lang: string) => void
  t: Translation
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState('en')
  const [isClient, setIsClient] = useState(false)

  // Set client-side flag and load language from localStorage
  useEffect(() => {
    setIsClient(true)
    const savedLanguage = localStorage.getItem('language')
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language to localStorage when it changes (client-side only)
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('language', language)
    }
  }, [language, isClient])

  const t = translations[language] || translations.en

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}
