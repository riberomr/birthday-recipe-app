import { render, screen, fireEvent } from '@testing-library/react'
import { LoginConfirmationModal } from '../LoginConfirmationModal'
import { useModal } from '@/hooks/ui/useModal'

// Mock dependencies
jest.mock('@/hooks/ui/useModal', () => ({
    useModal: jest.fn(),
}))

describe('LoginConfirmationModal', () => {
    const mockClose = jest.fn()
    const mockOnConfirm = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useModal as jest.Mock).mockReturnValue({
                isOpen: true,
                close: mockClose,
                data: { onConfirm: mockOnConfirm },
            })
    })

    it('renders correctly when open', () => {
        render(<LoginConfirmationModal />)
        expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument()
        expect(screen.getByText('Continuar')).toBeInTheDocument()
    })

    it('does not render when closed', () => {
        ; (useModal as jest.Mock).mockReturnValue({
            isOpen: false,
            close: mockClose,
            data: null,
        })
        render(<LoginConfirmationModal />)
        expect(screen.queryByText('Iniciar Sesión')).not.toBeInTheDocument()
    })

    it('calls onConfirm and close when confirmed', () => {
        render(<LoginConfirmationModal />)
        fireEvent.click(screen.getByText('Continuar'))
        expect(mockOnConfirm).toHaveBeenCalled()
        expect(mockClose).toHaveBeenCalled()
    })

    it('calls close when cancelled', () => {
        render(<LoginConfirmationModal />)
        fireEvent.click(screen.getByText('Cancelar'))
        expect(mockClose).toHaveBeenCalled()
    })

    it('calls close when clicking close button', () => {
        render(<LoginConfirmationModal />)
        fireEvent.click(screen.getByLabelText('Cerrar'))
        expect(mockClose).toHaveBeenCalled()
    })
})
