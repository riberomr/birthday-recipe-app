import { useCallback } from "react"
import { useModalContext } from "@/lib/contexts/ModalContext"

export function useModal(modalId: string) {
    const { openModal, closeModal, isModalOpen, getModalData } = useModalContext()

    const open = useCallback((data?: any) => {
        openModal(modalId, data)
    }, [modalId, openModal])

    const close = useCallback(() => {
        closeModal(modalId)
    }, [modalId, closeModal])

    const isOpen = isModalOpen(modalId)
    const data = getModalData(modalId)

    return {
        open,
        close,
        isOpen,
        data
    }
}
