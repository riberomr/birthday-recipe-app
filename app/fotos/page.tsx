import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Camera } from "lucide-react"

export default function PhotosPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-center">
            <div className="mb-8 p-8 bg-card rounded-full shadow-lg">
                <Camera size={64} className="text-muted" />
            </div>
            <h1 className="text-3xl font-bold text-muted-foreground mb-2">Próximamente</h1>
            <p className="text-muted-foreground mb-8">Las fotos del cumpleaños estarán disponibles aquí.</p>
            <Link href="/">
                <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Inicio
                </Button>
            </Link>
        </div>
    )
}
