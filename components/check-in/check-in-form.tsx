"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Check, Heart, Sparkles, HelpCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCheckInWorkflow } from "@/hooks/use-check-in-workflow"
import { useDebounce } from "@/hooks/use-debounce"
import { useOnboarding } from "@/hooks/useOnboarding"
import { Tooltip } from "@/components/onboarding/Tooltip"
import { ONBOARDING_STEPS } from "@/lib/onboarding-content"

import { MoodSlider } from "./mood-slider"
import { CitySelector } from "./city-selector"
import { MoodAdaptiveNews } from "./mood-adaptive-news"
import { OpinionInput } from "./opinion-input"
import { AgentSelector } from "./agent-selector"
import { ResponseCard } from "./response-card"
import { AgentFollowUp } from "./agent-follow-up"
import { StepIndicator } from "./step-indicator"
import { CheckInWeb3Recorder } from "@/components/solana/check-in-web3-recorder"
import { SolanaRegisterButton } from "./solana-register-button"

const TOTAL_STEPS = 9

export function CheckInForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [dynamicEmotions, setDynamicEmotions] = useState<{ label: string; emoji: string }[]>([])
  
  // Local state for immediate UI feedback
  const [localOpinion, setLocalOpinion] = useState("")
  const [localFollowUp, setLocalFollowUp] = useState("")
  
  const { sessionId, session, loading, error, initializeSession, updateSession, completeWorkflow } = useCheckInWorkflow()
  const { currentStep, isComplete, currentStepIndex, skip: skipOnboarding, next: nextOnboarding, reset: resetOnboarding, mounted } = useOnboarding('home')
  
  // Debounce text inputs to avoid constant Firebase updates
  const debouncedOpinion = useDebounce(localOpinion, 500)
  const debouncedFollowUp = useDebounce(localFollowUp, 500)
  
  // Sync debounced values to Firebase
  useEffect(() => {
    if (debouncedOpinion && debouncedOpinion !== session?.opinion) {
      updateSession({ opinion: debouncedOpinion })
    }
  }, [debouncedOpinion])
  
  useEffect(() => {
    if (debouncedFollowUp && debouncedFollowUp !== session?.followUpResponse) {
      updateSession({ followUpResponse: debouncedFollowUp })
    }
  }, [debouncedFollowUp])

  useEffect(() => {
    if (!initialized && !sessionId) {
      initializeSession()
      setInitialized(true)
    }
  }, [])
  
  // Sync session data to local state when it changes
  useEffect(() => {
    if (session?.opinion && !localOpinion) {
      setLocalOpinion(session.opinion)
    }
    if (session?.followUpResponse && !localFollowUp) {
      setLocalFollowUp(session.followUpResponse)
    }
  }, [session])

  const initialMood = session?.initialMood || 50
  const city = session?.city || ""
  const opinion = localOpinion
  const selectedAgent = session?.selectedAgent || ""
  const followUpResponse = localFollowUp
  const finalMood = session?.finalMood || 50

  const canProceed = () => {
    switch (step) {
      case 0: return true
      case 1: return city !== ""
      case 2: return city !== ""
      case 3: return opinion.length > 0
      case 4: return selectedAgent !== ""
      case 5: return true
      case 6: return followUpResponse.length > 0
      case 7: return true
      case 8: return true
      default: return false
    }
  }

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1 && canProceed()) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const handleMoodChange = async (value: number) => {
    if (step === 0) {
      await updateSession({ initialMood: value })
    } else if (step === 7) {
      await updateSession({ finalMood: value })
    }
  }

  const handleCityChange = async (newCity: string) => {
    await updateSession({ city: newCity })
  }

  const handleOpinionChange = async (newOpinion: string) => {
    setLocalOpinion(newOpinion)
  }

  const handleAgentChange = async (newAgent: string) => {
    await updateSession({ selectedAgent: newAgent })
  }

  const handleFollowUpChange = async (newResponse: string) => {
    setLocalFollowUp(newResponse)
  }

  const handleSubmit = async () => {
    if (sessionId) {
      console.log('[v0] handleSubmit called with finalMood:', finalMood)
      await completeWorkflow(finalMood)
      setIsSubmitted(true)
      // Redirigir a la cosecha después de 2 segundos
      setTimeout(() => {
        console.log('[v0] Redirecting to harvest page')
        router.push('/harvest')
      }, 2000)
    }
  }

  const handleRestart = async () => {
    setStep(0)
    setIsSubmitted(false)
    await initializeSession()
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md text-center space-y-6 animate-in fade-in">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-red-900/20 via-red-800/10 to-red-900/20 border-2 border-red-500/40 shadow-lg shadow-red-500/10">
            <h2 className="text-2xl font-bold text-red-400 mb-3">Error de Conexión</h2>
            <p className="text-sm text-red-300/80 mb-4 font-mono break-words text-left bg-black/30 p-4 rounded-lg">
              {error}
            </p>
            <p className="text-xs text-red-300/60 mb-4">
              Abre la consola del navegador (F12) para ver más detalles de depuración.
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => window.location.reload()} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg">
              Recargar página
            </Button>
            <Button 
              onClick={() => {
                setStep(0)
                setIsSubmitted(false)
              }}
              variant="outline"
              className="flex-1 border-purple-500/50 text-purple-300 hover:bg-purple-900/30 font-bold rounded-lg"
            >
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!session || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md text-center space-y-8 animate-in fade-in">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 animate-pulse flex items-center justify-center shadow-lg shadow-purple-500/30" />
          </div>
          <div className="space-y-3">
            <p className="font-bold text-lg text-white">Preparando tu experiencia...</p>
            <p className="text-sm text-purple-300/70">Nos estamos conectando a nuestros agentes de IA</p>
          </div>
          <div className="p-4 rounded-xl bg-purple-900/20 border border-purple-500/30 backdrop-blur-sm">
            <p className="text-xs text-purple-300/60 font-mono leading-relaxed">
              Si esto tarda más de 10 segundos:<br/>
              1. Verifica tus variables de entorno<br/>
              2. Recarga la página<br/>
              3. Abre consola (F12) para detalles
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    const moodChange = finalMood - initialMood
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md text-center space-y-8 animate-in fade-in">
          <div className="relative">
            <div className="w-28 h-28 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-pulse">
              <Heart className="w-14 h-14 text-white" />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
              <Sparkles className="w-8 h-8 text-pink-400 animate-bounce" />
            </div>
          </div>
          
          <div className="space-y-3 pt-4">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
              Check-in Completado
            </h1>
            <p className="text-purple-200/80 leading-relaxed text-sm">
              Tu reflexión ha sido registrada. Gracias por conectar con tus emociones de manera authentica.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-purple-900/30 border-2 border-purple-500/40 shadow-lg">
            <div className="flex items-center justify-between text-sm mb-6">
              <span className="text-purple-300/70 font-medium">Cambio de Ánimo</span>
              <span className={cn(
                "text-lg font-extrabold",
                moodChange > 0 ? "text-emerald-400" : 
                moodChange < 0 ? "text-rose-400" : "text-purple-300"
              )}>
                {moodChange > 0 ? "↑ +" : moodChange < 0 ? "↓ " : "→ "}{Math.abs(moodChange)}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-extrabold text-purple-300">{initialMood}</div>
                <div className="text-xs font-medium text-purple-400/60">Inicio</div>
              </div>
              <div className="flex-1 h-3 rounded-full bg-purple-900/50 overflow-hidden border border-purple-500/30">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 transition-all duration-1000"
                  style={{ width: `${(finalMood / 100) * 100}%` }}
                />
              </div>
              <div className="text-center">
                <div className="text-3xl font-extrabold text-pink-400">{finalMood}</div>
                <div className="text-xs font-medium text-pink-400/60">Final</div>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              onClick={() => router.push('/harvest')}
              className="w-full rounded-lg h-12 text-base font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-400 hover:via-pink-400 hover:to-purple-500 text-white shadow-lg shadow-purple-500/40 transition-all duration-300 hover:shadow-purple-500/60 hover:scale-[1.01] active:scale-[0.99] border border-purple-400/30"
            >
              Ver Cosecha Colaborativa
            </Button>
            <Button
              onClick={handleRestart}
              variant="outline"
              className="w-full rounded-lg h-12 text-base font-bold border-purple-500/50 text-purple-300 hover:bg-purple-900/30"
            >
              Nuevo Check-in
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return <MoodSlider value={initialMood} onChange={handleMoodChange} />
      case 1:
        return <CitySelector value={city} onChange={handleCityChange} agentId={selectedAgent} />
      case 2:
        return <MoodAdaptiveNews city={city} mood={initialMood} onEmotionsReady={setDynamicEmotions} />
      case 3:
        return <OpinionInput value={opinion} onChange={handleOpinionChange} dynamicEmotions={dynamicEmotions} />
      case 4:
        return <AgentSelector value={selectedAgent} onChange={handleAgentChange} />
      case 5:
        return <ResponseCard agentId={selectedAgent} initialMood={initialMood} sessionId={sessionId || undefined} opinion={opinion} city={city} />
      case 6:
        return (
          <AgentFollowUp 
            agentId={selectedAgent} 
            initialMood={initialMood}
            value={followUpResponse}
            onChange={handleFollowUpChange}
          />
        )
      case 7:
        return (
          <MoodSlider 
            value={finalMood} 
            onChange={handleMoodChange} 
            label="Como te sientes ahora?"
          />
        )
      case 8:
        return (
          <div className="space-y-6 animate-in">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent mb-2">
                <Check className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Listo para Enviar?
              </h2>
              <p className="text-sm text-muted-foreground">
                Revisa tu viaje emocional y completa tu check-in
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-card border-2 border-border shadow-lg space-y-0">
              <div className="flex justify-between items-center py-4 border-b border-border">
                <span className="text-sm text-muted-foreground">Animo inicial</span>
                <span className="font-bold text-foreground">{initialMood}/100</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-border">
                <span className="text-sm text-muted-foreground">Ubicacion</span>
                <span className="font-bold text-foreground">{city}</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-border">
                <span className="text-sm text-muted-foreground">Guia</span>
                <span className="font-bold text-foreground capitalize">{selectedAgent === "compassionate" ? "Nova" : selectedAgent === "analytical" ? "Atlas" : "Phoenix"}</span>
              </div>
              <div className="flex justify-between items-center py-4">
                <span className="text-sm text-muted-foreground">Animo final</span>
                <span className={cn(
                  "font-bold",
                  finalMood > initialMood ? "text-emerald-500" : 
                  finalMood < initialMood ? "text-rose-500" : "text-foreground"
                )}>
                  {finalMood}/100 ({finalMood > initialMood ? "+" : ""}{finalMood - initialMood})
                </span>
              </div>
            </div>

            <div className="pt-4">
              <SolanaRegisterButton
                city={city}
                initialMood={initialMood}
                finalMood={finalMood}
                agent={selectedAgent}
                sentiment={opinion || ''}
              />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-4 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 font-bold",
              step === 0 
                ? "invisible" 
                : "bg-purple-900/40 hover:bg-purple-700/60 text-purple-300 hover:text-purple-100 border border-purple-500/30 hover:border-purple-500/60 active:scale-95"
            )}
            title="Volver al paso anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-purple-300/80 uppercase tracking-widest">
              Paso {step + 1} de {TOTAL_STEPS}
            </span>
            <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} />
          </div>

          <button
            onClick={resetOnboarding}
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 font-bold bg-purple-900/40 hover:bg-purple-700/60 text-purple-300 hover:text-purple-100 border border-purple-500/30 hover:border-purple-500/60 active:scale-95"
            title="Show help"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col px-6 py-8 overflow-y-auto">
        <div className="flex-1 max-w-md mx-auto w-full">
          <div key={step} className="animate-in fade-in">
            {renderStep()}
          </div>
        </div>
      </main>

      {/* Onboarding Tooltip */}
      {mounted && !isComplete && currentStep && (
        <Tooltip
          step={currentStep}
          onNext={nextOnboarding}
          onSkip={skipOnboarding}
          stepNumber={currentStepIndex}
          totalSteps={currentStep && ONBOARDING_STEPS['home']?.length}
        />
      )}

      <footer className="sticky bottom-0 bg-background/95 backdrop-blur-xl border-t border-border/50 px-6 py-6 shadow-xl">
        <div className="max-w-md mx-auto">
          {step === TOTAL_STEPS - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-14 rounded-xl text-base font-bold gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-400 hover:via-pink-400 hover:to-purple-500 text-white shadow-lg shadow-purple-500/40 transition-all duration-300 hover:shadow-purple-500/60 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 border border-purple-400/30"
            >
              <Check className="w-5 h-5" />
              {loading ? "Enviando..." : "Completar Check-in"}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className={cn(
                "w-full h-14 rounded-xl text-base font-bold gap-2 shadow-lg transition-all duration-300 border",
                canProceed() && !loading
                  ? "bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-400 hover:via-pink-400 hover:to-purple-500 text-white shadow-purple-500/40 hover:shadow-purple-500/60 hover:scale-[1.01] active:scale-[0.99] border-purple-400/30"
                  : "bg-gray-700/30 text-gray-400 shadow-none border-gray-600/20 cursor-not-allowed"
              )}
            >
              Continuar
              <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  )
}
