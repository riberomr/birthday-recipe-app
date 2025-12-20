import { useEffect, RefObject } from "react"

interface UseModalFocusTrapProps {
    modalRef: RefObject<HTMLDivElement | null>
    isOpen: boolean
    onClose: () => void
}

export function useModalFocusTrap({ modalRef, isOpen, onClose }: UseModalFocusTrapProps) {
    // Escape key to close modal
    useEffect(() => {
        if (!isOpen) return

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose()
            }
        }

        document.addEventListener("keydown", handleEscape)
        return () => document.removeEventListener("keydown", handleEscape)
    }, [isOpen, onClose])

    // Focus trap
    useEffect(() => {
        if (!isOpen || !modalRef.current) return

        const modalElement = modalRef.current
        const focusableElements = modalElement.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement | undefined
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement | undefined

        if (firstElement) {
            firstElement.focus()
        }

        const handleTab = (e: KeyboardEvent) => {
            if (e.key !== "Tab") return
            if (!firstElement || !lastElement) return

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault()
                    lastElement.focus()
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault()
                    firstElement.focus()
                }
            }
        }

        modalElement.addEventListener("keydown", handleTab)
        return () => modalElement.removeEventListener("keydown", handleTab)
    }, [isOpen, modalRef])
}