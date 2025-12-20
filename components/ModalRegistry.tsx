"use client"

import { LoginConfirmationModal } from "@/components/LoginConfirmationModal"
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal"

export function ModalRegistry() {
    return (
        <>
            <LoginConfirmationModal />
            <DeleteConfirmationModal />
            {/* Future modals can be added here */}
        </>
    )
}
