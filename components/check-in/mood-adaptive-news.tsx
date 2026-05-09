"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, Newspaper } from "lucide-react"
import newsData from "@/data/news.json"
import { useTranslation } from "@/contexts/LanguageContext"
import { cn } from "@/lib/utils"

interface MoodAdaptiveNewsProps {
  city: string
  mood: number
  onEmotionsReady?: (emotions: { label: string; emoji: string }[]) => void
}

// Emotion pools based on mood ranges
const LOW_EMOTIONS = [
  { label: "Reconfortado/a", emoji: "🫂" },
  { label: "Esperanzado/a", emoji: "🌟" },
  { label: "Reflexivo/a", emoji: "🤔" },
  { label: "Agradecido/a", emoji: "🙏" },
  { label: "Sereno/a", emoji: "🕊️" },
  { label: "Vulnerable", emoji: "💧" },
  { label: "Nostálgico/a", emoji: "🌅" },
  { label: "Comprendido/a", emoji: "💛" },
]

const MEDIUM_EMOTIONS = [
  { label: "Curioso/a", emoji: "🔍" },
  { label: "Inspirado/a", emoji: "💡" },
  { label: "Pensativo/a", emoji: "💭" },
  { label: "Conectado/a", emoji: "🤝" },
  { label: "Contemplativo/a", emoji: "🌊" },
  { label: "Determinado/a", emoji: "🎯" },
  { label: "Abierto/a", emoji: "🌻" },
  { label: "Intrigado/a", emoji: "🧩" },
]

const HIGH_EMOTIONS = [
  { label: "Energético/a", emoji: "⚡" },
  { label: "Motivado/a", emoji: "🚀" },
  { label: "Entusiasmado/a", emoji: "🎉" },
  { label: "Empoderado/a", emoji: "💪" },
  { label: "Radiante", emoji: "🌞" },
  { label: "Creativo/a", emoji: "🎨" },
  { label: "Imparable", emoji: "🔥" },
  { label: "Pleno/a", emoji: "✨" },
]

const getMoodRange = (mood: number) => {
  if (mood < 20) return { range: "rose", emoji: "😔", tone: "very_low" }
  if (mood < 40) return { range: "amber", emoji: "😐", tone: "low" }
  if (mood < 55) return { range: "sky", emoji: "🙂", tone: "medium_low" }
  if (mood < 70) return { range: "emerald", emoji: "😊", tone: "medium_high" }
  if (mood < 85) return { range: "violet", emoji: "😄", tone: "high" }
  return { range: "fuchsia", emoji: "🤩", tone: "very_high" }
}

const getMoodAffinity = (mood: number) => {
  if (mood < 40) return "low"
  if (mood < 70) return "medium"
  return "high"
}

const getEmotionCount = (mood: number) => {
  if (mood < 25) return 3
  if (mood < 40) return 4
  if (mood < 55) return 4
  if (mood < 70) return 5
  if (mood < 85) return 5
  return 6
}

export function MoodAdaptiveNews({ city, mood, onEmotionsReady }: MoodAdaptiveNewsProps) {
  const { language } = useTranslation()
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0)
  
  const moodRange = getMoodRange(mood)
  const moodAffinity = getMoodAffinity(mood)
  const emotionCount = getEmotionCount(mood)
  
  // Get emotions based on mood range
  const getEmotionsForMood = () => {
    let pool = []
    if (mood < 40) {
      pool = LOW_EMOTIONS
    } else if (mood < 70) {
      pool = MEDIUM_EMOTIONS
    } else {
      pool = HIGH_EMOTIONS
    }
    return pool.slice(0, emotionCount)
  }
  
  const dynamicEmotions = useMemo(() => {
    const emotions = getEmotionsForMood()
    onEmotionsReady?.(emotions)
    return emotions
  }, [mood, language])
  
  // Filter and sort news
  const filteredNews = useMemo(() => {
    const cityNews = newsData.filter(item => item.city === city)
    
    // Sort by mood affinity match
    return cityNews.sort((a, b) => {
      const aMatches = a.moodAffinity === moodAffinity ? 1 : 0
      const bMatches = b.moodAffinity === moodAffinity ? 1 : 0
      
      if (aMatches !== bMatches) return bMatches - aMatches
      
      // Then by date
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    }).slice(0, 3) // Show up to 3 news
  }, [city, moodAffinity])
  
  // Get text in current language
  const getText = (bilingual: any) => {
    if (typeof bilingual === 'string') return bilingual
    if (language === 'en' && bilingual.en) return bilingual.en
    return bilingual.es || ''
  }
  
  if (filteredNews.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent mb-2">
            <Newspaper className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Noticias de {city}
          </h2>
          <p className="text-sm text-muted-foreground">Esto es lo que esta pasando en tu area</p>
        </div>
        
        <div className="p-8 rounded-3xl bg-card border-2 border-dashed border-border text-center">
          <p className="text-muted-foreground">No hay noticias disponibles para {city}</p>
        </div>
      </div>
    )
  }
  
  const currentNews = filteredNews[currentNewsIndex]
  const colorMap: Record<string, string> = {
    rose: "from-rose-500 to-rose-400",
    amber: "from-amber-500 to-amber-400",
    sky: "from-sky-500 to-sky-400",
    emerald: "from-emerald-500 to-emerald-400",
    violet: "from-violet-500 to-violet-400",
    fuchsia: "from-fuchsia-500 to-fuchsia-400",
  }
  
  const textColorMap: Record<string, string> = {
    rose: "text-rose-600 dark:text-rose-400",
    amber: "text-amber-600 dark:text-amber-400",
    sky: "text-sky-600 dark:text-sky-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    violet: "text-violet-600 dark:text-violet-400",
    fuchsia: "text-fuchsia-600 dark:text-fuchsia-400",
  }
  
  const bgColorMap: Record<string, string> = {
    rose: "bg-rose-100 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50",
    amber: "bg-amber-100 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50",
    sky: "bg-sky-100 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/50",
    emerald: "bg-emerald-100 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50",
    violet: "bg-violet-100 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/50",
    fuchsia: "bg-fuchsia-100 dark:bg-fuchsia-950/30 border-fuchsia-200 dark:border-fuchsia-800/50",
  }
  
  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent mb-2">
          <Newspaper className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Noticias de {city}
        </h2>
        <p className="text-sm text-muted-foreground">Esto es lo que esta pasando en tu area</p>
      </div>
      
      {/* Mood Pill */}
      <div className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border-2 mx-auto",
        `bg-gradient-to-r ${colorMap[moodRange.range]}`,
        "text-white font-bold text-sm shadow-md"
      )}>
        <span>{moodRange.emoji}</span>
        <span>{mood}/100</span>
      </div>
      
      {/* News Card */}
      <div className={cn(
        "group p-6 rounded-3xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 space-y-4",
        bgColorMap[moodRange.range]
      )}>
        {/* Top Section */}
        <div className="flex items-center justify-between gap-2">
          <span className={cn(
            "px-3 py-1.5 text-xs font-bold rounded-full",
            `bg-gradient-to-r ${colorMap[moodRange.range]} text-white shadow-md`
          )}>
            {currentNews.category}
          </span>
          <span className="text-2xl">{currentNews.emoji}</span>
        </div>
        
        {/* Headline */}
        <h3 className={cn(
          "text-xl font-bold leading-snug transition-colors group-hover:scale-105 origin-left",
          textColorMap[moodRange.range]
        )}>
          {getText(currentNews.headline)}
        </h3>
        
        {/* Summary */}
        <p className="text-muted-foreground leading-relaxed">
          {getText(currentNews.summary)}
        </p>
        
        {/* Mood Tags */}
        <div className="flex flex-wrap gap-2 pt-2">
          {currentNews.moodTags?.map((tag: string) => (
            <span
              key={tag}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-full border",
                `bg-${moodRange.range}-50 dark:bg-${moodRange.range}-950/50`,
                textColorMap[moodRange.range]
              )}
            >
              #{tag}
            </span>
          ))}
        </div>
        
        {/* Source Attribution */}
        <div className="pt-2 text-sm font-medium text-muted-foreground">
          vía <span className={textColorMap[moodRange.range]}>{currentNews.source}</span>
        </div>
      </div>
      
      {/* Navigation */}
      {filteredNews.length > 1 && (
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setCurrentNewsIndex((prev) => (prev - 1 + filteredNews.length) % filteredNews.length)}
            className="w-10 h-10 rounded-lg flex items-center justify-center bg-card border-2 border-border hover:border-primary hover:bg-primary/5 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex gap-1.5">
            {filteredNews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentNewsIndex(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  idx === currentNewsIndex
                    ? `bg-gradient-to-r ${colorMap[moodRange.range]}`
                    : "bg-border hover:bg-muted"
                )}
              />
            ))}
          </div>
          
          <button
            onClick={() => setCurrentNewsIndex((prev) => (prev + 1) % filteredNews.length)}
            className="w-10 h-10 rounded-lg flex items-center justify-center bg-card border-2 border-border hover:border-primary hover:bg-primary/5 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
