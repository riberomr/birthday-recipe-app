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
        <div className="fixed inset-0 bg-pink-50 dark:bg-zinc-950 z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 shadow-sm">
                <Link href={`/recipes/${recipeId}`}>
                    <Button variant="ghost" size="icon">
                        <X className="h-6 w-6" />
                    </Button>
                </Link>
                <div className="text-center">
                    <h2 className="font-bold text-pink-600 dark:text-pink-400 text-sm uppercase tracking-wider">
                        Modo Cocina
                    </h2>
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">
                        {recipeTitle}
                    </p>
                </div>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-gray-200 dark:bg-zinc-800 w-full">
                <div
                    className="h-full bg-pink-500 transition-all duration-300"
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
                        <div className="text-8xl font-black text-pink-100 dark:text-pink-900/20 mb-6">
                            {currentStep.step_order}
                        </div>
                        <p className="text-2xl md:text-3xl font-medium text-gray-800 dark:text-gray-100 leading-relaxed">
                            {currentStep.content}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="p-6 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-gray-800 flex gap-4">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={handlePrev}
                    disabled={isFirstStep}
                    className="flex-1 h-16 text-lg rounded-xl"
                >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Anterior
                </Button>
                <Button
                    variant="kawaii"
                    size="lg"
                    onClick={handleNext}
                    className="flex-1 h-16 text-lg rounded-xl"
                >
                    {isLastStep ? (
                        <>
                            <Check className="mr-2 h-5 w-5" />
                            ¡Terminé!
                        </>
                    ) : (
                        <>
                            Siguiente
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
