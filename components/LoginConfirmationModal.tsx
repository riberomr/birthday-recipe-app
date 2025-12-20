"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useModal } from "@/hooks/ui/useModal"

export function LoginConfirmationModal() {
    const { isOpen, close, data } = useModal('login-confirmation')

    if (!isOpen) return null

    const handleConfirm = () => {
        data?.onConfirm?.()
        close()
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] animate-in fade-in duration-200"
                onClick={close}
            />

            {/* Modal */}
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[calc(100%-2rem)] max-w-md animate-in zoom-in-95 fade-in duration-200">
                <div className="bg-card rounded-3xl shadow-2xl border border-primary/10 dark:border-primary/20 p-6 relative">
                    {/* Close button */}
                    <button
                        onClick={close}
                        className="absolute top-4 right-4 p-2 rounded-full [@media(hover:hover)]:hover:bg-primary/10 transition-colors text-muted-foreground [@media(hover:hover)]:hover:text-foreground"
                        aria-label="Cerrar"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Content */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-primary">
                                Iniciar Sesión
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Estás por iniciar sesión con tu cuenta de Google.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                La aplicación sólo accederá a tu <strong>nombre</strong> y <strong>foto de perfil</strong>.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col-reverse sm:flex-row gap-3">
                            <Button
                                variant="outline"
                                onClick={close}
                                className="flex-1 border-primary/20 [@media(hover:hover)]:hover:bg-primary/10 text-primary"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleConfirm}
                                className="flex-1 bg-primary [@media(hover:hover)]:hover:bg-primary/90 text-primary-foreground"
                            >
                                Continuar
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
