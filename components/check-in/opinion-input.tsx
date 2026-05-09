"use client"

import { PenLine } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useTranslation } from "@/contexts/LanguageContext"

interface OpinionInputProps {
  value: string
  onChange: (value: string) => void
  dynamicEmotions?: { label: string; emoji: string }[]
}

const staticEmotionTags = [
  { label: "Esperanzado/a", emoji: "🌟" },
  { label: "Preocupado/a", emoji: "😟" },
  { label: "Inspirado/a", emoji: "💡" },
  { label: "Curioso/a", emoji: "🤔" },
  { label: "Tranquilo/a", emoji: "😌" },
  { label: "Energico/a", emoji: "⚡" },
]

export function OpinionInput({ value, onChange, dynamicEmotions }: OpinionInputProps) {
  const { t } = useTranslation()
  const characterCount = value.length
  const maxCharacters = 500

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent mb-2">
          <PenLine className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {t('checkin.opinion.title')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('checkin.opinion.description')}
        </p>
      </div>

      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxCharacters))}
          placeholder={t('checkin.opinion.placeholder')}
          className="min-h-[160px] resize-none rounded-2xl border-2 border-border bg-card p-5 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 shadow-sm focus:shadow-lg"
        />
        <div className="absolute bottom-4 right-4 px-2 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
          {characterCount}/{maxCharacters}
        </div>
      </div>

      <div className="space-y-3">
        {dynamicEmotions && dynamicEmotions.length > 0 && (
          <div className="space-y-3 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                Emociones personalizadas segun tu animo:
              </p>
              <span className="px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                ✨ Personalizado
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {dynamicEmotions.map((tag) => (
                <button
                  key={tag.label}
                  onClick={() => onChange(value + (value ? " " : "") + `Me siento ${tag.label.toLowerCase()}.`)}
                  className="group flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-2 border-purple-500/60 text-foreground hover:border-purple-400 hover:from-purple-800/60 hover:to-pink-800/60 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">{tag.emoji}</span>
                  <span>{tag.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="space-y-3 pt-4">
          <p className="text-xs font-medium text-muted-foreground text-center">
            O selecciona como te sientes:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {staticEmotionTags.map((tag) => (
              <button
                key={tag.label}
                onClick={() => onChange(value + (value ? " " : "") + `Me siento ${tag.label.toLowerCase()}.`)}
                className="group flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-card border-2 border-border text-foreground hover:border-primary hover:bg-primary/5 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">{tag.emoji}</span>
                <span>{tag.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
