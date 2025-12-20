import { render, screen } from '@testing-library/react'
import { ModalRegistry } from '../ModalRegistry'

// Mock dependencies
jest.mock('@/components/LoginConfirmationModal', () => ({
    LoginConfirmationModal: () => <div data-testid="login-modal">Login Modal</div>,
}))
jest.mock('@/components/DeleteConfirmationModal', () => ({
    DeleteConfirmationModal: () => <div data-testid="delete-modal">Delete Modal</div>,
}))

describe('ModalRegistry', () => {
    it('renders correctly', () => {
        render(<ModalRegistry />)
        expect(screen.getByTestId('login-modal')).toBeInTheDocument()
        expect(screen.getByTestId('delete-modal')).toBeInTheDocument()
    })
})
