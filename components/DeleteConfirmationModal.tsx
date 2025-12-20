"use client"

import { useRef } from "react"
import { useModalContext } from "@/lib/contexts/ModalContext"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useModalFocusTrap } from "@/hooks/useModalFocusTrap"

export function DeleteConfirmationModal() {
    const { isModalOpen, closeModal, getModalData } = useModalContext()
    const isOpen = isModalOpen("delete-confirmation")
    const data = getModalData("delete-confirmation")
    const modalRef = useRef<HTMLDivElement>(null)

    useModalFocusTrap({
        modalRef,
        isOpen,
        onClose: () => closeModal("delete-confirmation")
    })

    if (!isOpen) return null

    const { onConfirm, title, description, isDeleting } = data || {}

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-modal-title"
                aria-describedby="delete-modal-description"
                className="bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-primary/10"
            >
                <div className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-destructive mb-4">
                        <Trash2 className="w-8 h-8" />
                    </div>

                    <h2 id="delete-modal-title" className="text-2xl font-bold text-foreground">
                        {title || "¿Eliminar receta?"}
                    </h2>

                    <p id="delete-modal-description" className="text-muted-foreground">
                        {description || "¿Estás seguro de que quieres eliminar esta receta? Esta acción moverá la receta a la papelera."}
                    </p>

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            className="flex-1 rounded-xl h-12 text-base"
                            onClick={() => closeModal("delete-confirmation")}
                            disabled={isDeleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1 rounded-xl h-12 text-base shadow-lg shadow-destructive/20"
                            onClick={onConfirm}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
