"use client"

import { useState, useEffect } from "react"
import { RecipeStep } from "@/types"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface CookingModeClientProps {
    steps: RecipeStep[]
    recipeId: string
    recipeTitle: string
}

export function CookingModeClient({ steps, recipeId, recipeTitle }: CookingModeClientProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0)
    const router = useRouter()

    // Wake Lock API
    useEffect(() => {
        let wakeLock: WakeLockSentinel | null = null

        const requestWakeLock = async () => {
            try {
                if ("wakeLock" in navigator) {
                    wakeLock = await navigator.wakeLock.request("screen")
                }
            } catch (err) {
                console.error(`${err}`)
            }
        }

        requestWakeLock()

        return () => {
            if (wakeLock) {
                wakeLock.release()
            }
        }
    }, [])

    const currentStep = steps[currentStepIndex]
    const isFirstStep = currentStepIndex === 0
    const isLastStep = currentStepIndex === steps.length - 1

    const handleNext = () => {
        if (isLastStep) {
            router.push(`/recipes/${recipeId}`)
        } else {
            setCurrentStepIndex((prev) => prev + 1)
        }
    }

    const handlePrev = () => {
        if (!isFirstStep) {
            setCurrentStepIndex((prev) => prev - 1)
        }
    }

    return (
        <div className="fixed inset-0 bg-background z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-card shadow-sm">
                <Link href={`/recipes/${recipeId}`}>
                    <Button variant="ghost" size="icon">
                        <X className="h-6 w-6" />
                    </Button>
                </Link>
                <div className="text-center">
                    <h2 className="font-bold text-primary text-sm uppercase tracking-wider">
                        Modo Cocina
                    </h2>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {recipeTitle}
                    </p>
                </div>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-muted w-full">
                <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{
                        width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
                    }}
                />
            </div>

            {/* Step Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStepIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-md w-full"
                    >
                        <div className="text-8xl font-black text-primary/10 mb-6">
                            {currentStep.step_order}
                        </div>
                        <p className="text-2xl md:text-3xl font-medium text-foreground leading-relaxed">
                            {currentStep.content}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="p-4 bg-card border-t border-border flex flex-wrap gap-2 justify-center">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={handlePrev}
                    disabled={isFirstStep}
                    className="flex-1 min-w-[120px] h-14 text-base rounded-xl"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Anterior
                </Button>
                <Button
                    variant="kawaii"
                    size="lg"
                    onClick={handleNext}
                    className="flex-1 min-w-[120px] h-14 text-base rounded-xl"
                >
                    {isLastStep ? (
                        <>
                            <Check className="mr-2 h-4 w-4" />
                            ¡Terminé!
                        </>
                    ) : (
                        <>
                            Siguiente
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
