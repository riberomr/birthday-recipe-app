import { render, screen, fireEvent } from "@testing-library/react"
import { DeleteConfirmationModal } from "../DeleteConfirmationModal"
import { useModalContext } from "@/lib/contexts/ModalContext"

// Mock the context hook
jest.mock("@/lib/contexts/ModalContext")

describe("DeleteConfirmationModal", () => {
    const mockCloseModal = jest.fn()
    const mockOnConfirm = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useModalContext as jest.Mock).mockReturnValue({
                isModalOpen: jest.fn().mockReturnValue(true),
                closeModal: mockCloseModal,
                getModalData: jest.fn().mockReturnValue({
                    onConfirm: mockOnConfirm,
                    title: "Test Title",
                    description: "Test Description",
                    isDeleting: false
                })
            })
    })

    it("renders correctly when open", () => {
        render(<DeleteConfirmationModal />)
        expect(screen.getByText("Test Title")).toBeInTheDocument()
        expect(screen.getByText("Test Description")).toBeInTheDocument()
        expect(screen.getByText("Cancelar")).toBeInTheDocument()
        expect(screen.getByText("Eliminar")).toBeInTheDocument()
    })

    it("does not render when closed", () => {
        ; (useModalContext as jest.Mock).mockReturnValue({
            isModalOpen: jest.fn().mockReturnValue(false),
            closeModal: mockCloseModal,
            getModalData: jest.fn().mockReturnValue({})
        })
        const { container } = render(<DeleteConfirmationModal />)
        expect(container).toBeEmptyDOMElement()
    })

    it("calls closeModal when Cancel is clicked", () => {
        render(<DeleteConfirmationModal />)
        fireEvent.click(screen.getByText("Cancelar"))
        expect(mockCloseModal).toHaveBeenCalledWith("delete-confirmation")
    })

    it("calls onConfirm when Delete is clicked", () => {
        render(<DeleteConfirmationModal />)
        fireEvent.click(screen.getByText("Eliminar"))
        expect(mockOnConfirm).toHaveBeenCalled()
    })

    it("shows loading state when confirming", async () => {
        const delayedConfirm = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

            ; (useModalContext as jest.Mock).mockReturnValue({
                isModalOpen: jest.fn().mockReturnValue(true),
                closeModal: mockCloseModal,
                getModalData: jest.fn().mockReturnValue({
                    onConfirm: delayedConfirm,
                })
            })

        render(<DeleteConfirmationModal />)

        const deleteBtn = screen.getByText("Eliminar")
        fireEvent.click(deleteBtn)

        expect(screen.getByText("Eliminando...")).toBeInTheDocument()
        expect(screen.getByText("Cancelar")).toBeDisabled()
        expect(screen.getByText("Eliminando...")).toBeDisabled()
    })

    it("renders with default text when data is missing", () => {
        ; (useModalContext as jest.Mock).mockReturnValue({
            isModalOpen: jest.fn().mockReturnValue(true),
            closeModal: jest.fn(),
            getModalData: jest.fn().mockReturnValue(undefined)
        })

        render(<DeleteConfirmationModal />)

        expect(screen.getByText("¿Eliminar receta?")).toBeInTheDocument()
        expect(
            screen.getByText(/¿Estás seguro de que quieres eliminar esta receta\?/)
        ).toBeInTheDocument()
    })

    it("handles error during confirmation", async () => {
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { })
        const error = new Error("Delete failed")
        const mockRejectConfirm = jest.fn().mockRejectedValue(error)

            ; (useModalContext as jest.Mock).mockReturnValue({
                isModalOpen: jest.fn().mockReturnValue(true),
                closeModal: jest.fn(),
                getModalData: jest.fn().mockReturnValue({
                    onConfirm: mockRejectConfirm,
                })
            })

        render(<DeleteConfirmationModal />)

        fireEvent.click(screen.getByText("Eliminar"))

        // Wait for async action
        await screen.findByText("Eliminar")

        expect(consoleSpy).toHaveBeenCalledWith("Error in delete confirmation:", error)
        expect(screen.getByText("Eliminar")).toBeEnabled()

        consoleSpy.mockRestore()
    })

    it("resets loading state when modal closes", async () => {
        // 1. Start with modal open and loading
        const delayedConfirm = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
        const mockCloseModal = jest.fn()
        const mockIsModalOpen = jest.fn().mockReturnValue(true)

            ; (useModalContext as jest.Mock).mockReturnValue({
                isModalOpen: mockIsModalOpen,
                closeModal: mockCloseModal,
                getModalData: jest.fn().mockReturnValue({
                    onConfirm: delayedConfirm,
                })
            })

        const { rerender } = render(<DeleteConfirmationModal />)

        fireEvent.click(screen.getByText("Eliminar"))
        expect(screen.getByText("Eliminando...")).toBeInTheDocument()

        // 2. Close modal
        mockIsModalOpen.mockReturnValue(false)
        rerender(<DeleteConfirmationModal />)

        // 3. Re-open modal
        mockIsModalOpen.mockReturnValue(true)
        rerender(<DeleteConfirmationModal />)

        // Should be reset to "Eliminar"
        expect(screen.getByText("Eliminar")).toBeInTheDocument()
        expect(screen.queryByText("Eliminando...")).not.toBeInTheDocument()
    })
})