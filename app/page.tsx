"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Cake, ChefHat, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="min-h-screen bg-pink-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-10 text-pink-200 dark:text-pink-900/20"
        >
          <Cake size={120} />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 right-10 text-yellow-200 dark:text-yellow-900/20"
        >
          <ChefHat size={100} />
        </motion.div>
      </div>

      <div className="z-10 w-full max-w-md flex flex-col items-center gap-8 text-center">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl border-4 border-pink-200 dark:border-pink-900"
        >
          <h1 className="text-4xl font-bold text-pink-500 mb-2">¡Feliz Cumple!</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">40 Años Cocinando Amor</p>
          <div className="mt-6 text-6xl">🎂</div>
        </motion.div>

        <div className="flex flex-col gap-4 w-full">
          <Link href="/recipes" className="w-full">
            <Button variant="kawaii" size="lg" className="w-full text-xl py-8 rounded-2xl bg-pink-400 hover:bg-pink-500 border-pink-600">
              <ChefHat className="mr-2 h-6 w-6" />
              Ver Recetas
            </Button>
          </Link>

          <Link href="/fotos" className="w-full">
            <Button variant="outline" size="lg" className="w-full text-xl py-8 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600">
              <Camera className="mr-2 h-6 w-6" />
              Fotos (Próximamente)
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
