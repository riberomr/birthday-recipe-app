import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Camera } from "lucide-react"

export default function PhotosPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-100 dark:bg-zinc-950 text-center">
            <div className="mb-8 p-8 bg-white dark:bg-zinc-900 rounded-full shadow-lg">
                <Camera size={64} className="text-gray-300 dark:text-gray-700" />
            </div>
            <h1 className="text-3xl font-bold text-gray-400 mb-2">Próximamente</h1>
            <p className="text-gray-500 mb-8">Las fotos del cumpleaños estarán disponibles aquí.</p>
            <Link href="/">
                <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Inicio
                </Button>
            </Link>
        </div>
    )
}
