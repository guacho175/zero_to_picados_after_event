"use client"

import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/contexts/LanguageContext"
import { useState, useEffect } from "react"
import { getCitiesAsArray } from "@/lib/firebase-cities"

interface CitySelectorProps {
  value: string
  onChange: (value: string) => void
  agentId?: string
}

// Fallback cities - always available as last resort
const FALLBACK_CITIES = [
  { name: "Santiago", icon: "🏔️", country: "Chile" },
  { name: "Mendoza", icon: "🍷", country: "Argentina" },
  { name: "Buenos Aires", icon: "🎭", country: "Argentina" },
  { name: "Lima", icon: "🌊", country: "Peru" },
  { name: "Bogota", icon: "🌿", country: "Colombia" },
]

export function CitySelector({ value, onChange, agentId }: CitySelectorProps) {
  const { t } = useTranslation()
  const [citiesToDisplay, setCitiesToDisplay] = useState<Array<{ name: string; icon: string; country: string }>>(FALLBACK_CITIES)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCities = async () => {
      try {
        setLoading(true)
        const firebaseCities = await getCitiesAsArray()
        
        if (firebaseCities && firebaseCities.length > 0) {
          setCitiesToDisplay(firebaseCities)
          console.log('[v0] Loaded', firebaseCities.length, 'cities from Firebase')
        } else {
          console.warn('[v0] No cities returned from Firebase, using fallback')
          setCitiesToDisplay(FALLBACK_CITIES)
        }
        setError(null)
      } catch (error) {
        console.error('[v0] Error loading cities from Firebase:', error)
        setCitiesToDisplay(FALLBACK_CITIES)
        setError('Error loading cities')
      } finally {
        setLoading(false)
      }
    }

    loadCities()
  }, [agentId]) // Re-fetch if agentId changes

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent mb-2">
          <MapPin className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {t('checkin.city.title')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('checkin.city.description')}</p>
        {error && (
          <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950 rounded-lg p-2 mt-2">
            {error}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {citiesToDisplay.map((city) => (
          <button
            key={city.name}
            onClick={() => onChange(city.name)}
            disabled={loading}
            className={cn(
              "group relative flex flex-col items-start gap-1 p-4 rounded-2xl border-2 transition-all duration-300",
              "hover:scale-[1.03] active:scale-[0.97]",
              loading && "opacity-50 cursor-wait",
              value === city.name
                ? "border-primary bg-gradient-to-br from-primary/10 to-accent/10 shadow-xl shadow-primary/20"
                : "border-border bg-card hover:border-primary/50 hover:shadow-lg"
            )}
          >
            <span className={cn(
              "text-3xl transition-transform duration-300",
              value === city.name ? "scale-110" : "group-hover:scale-110"
            )}>
              {city.icon}
            </span>
            <div className="text-left">
              <span className={cn(
                "font-semibold text-sm block",
                value === city.name ? "text-primary" : "text-foreground"
              )}>
                {city.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {city.country}
              </span>
            </div>
            {value === city.name && (
              <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-primary animate-pulse-soft" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}


