"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Cake, ChefHat, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="page-container flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-10 text-primary/20"
        >
          <Cake size={120} />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 right-10 text-secondary/20"
        >
          <ChefHat size={100} />
        </motion.div>
      </div>

      <div className="z-10 w-full max-w-md flex flex-col items-center gap-8 text-center">

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="card-kawaii"
        >
          <h1 className="text-4xl font-bold text-primary mb-2">Pagina de recetas</h1>
          <p className="text-xl text-muted-foreground">🥰 Cocinando Amor 🥰</p>
          <div className="mt-6 text-6xl">🎂</div>
        </motion.div>

        <div className="flex flex-col gap-4 w-full">
          <Link href="/recipes" className="w-full">
            <Button variant="kawaii" size="lg" className="w-full text-xl py-8 rounded-2xl bg-primary hover:bg-primary/90 border-primary-foreground/20">
              <ChefHat className="mr-2 h-6 w-6" />
              Ver Recetas
            </Button>
          </Link>

          <Link href="/fotos" className="w-full">
            <Button variant="outline" size="lg" className="w-full text-xl py-8 rounded-2xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:text-foreground hover:border-muted-foreground/50">
              <Camera className="mr-2 h-6 w-6" />
              Fotos
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
