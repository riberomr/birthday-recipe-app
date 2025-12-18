"use client"

import { createContext, useContext, useState, ReactNode, useCallback } from "react"

interface ModalState {
    isOpen: boolean
    data?: any
}

interface ModalContextValue {
    openModal: (modalId: string, data?: any) => void
    closeModal: (modalId: string) => void
    isModalOpen: (modalId: string) => boolean
    getModalData: (modalId: string) => any
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined)

export function useModalContext() {
    const context = useContext(ModalContext)
    if (!context) {
        throw new Error("useModalContext must be used within a ModalProvider")
    }
    return context
}

interface ModalProviderProps {
    children: ReactNode
}

export function ModalProvider({ children }: ModalProviderProps) {
    const [modals, setModals] = useState<Record<string, ModalState>>({})

    const openModal = useCallback((modalId: string, data?: any) => {
        setModals(prev => ({
            ...prev,
            [modalId]: { isOpen: true, data }
        }))
    }, [])

    const closeModal = useCallback((modalId: string) => {
        setModals(prev => ({
            ...prev,
            [modalId]: { isOpen: false, data: undefined }
        }))
    }, [])

    const isModalOpen = useCallback((modalId: string) => {
        return modals[modalId]?.isOpen ?? false
    }, [modals])

    const getModalData = useCallback((modalId: string) => {
        return modals[modalId]?.data
    }, [modals])

    return (
        <ModalContext.Provider value={{ openModal, closeModal, isModalOpen, getModalData }}>
            {children}
        </ModalContext.Provider>
    )
}
