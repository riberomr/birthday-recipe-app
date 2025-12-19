import { render, screen } from '@testing-library/react'
import { ModalRegistry } from '../ModalRegistry'
import { LoginConfirmationModal } from '@/components/LoginConfirmationModal'

// Mock dependencies
jest.mock('@/components/LoginConfirmationModal', () => ({
    LoginConfirmationModal: () => <div data-testid="login-modal">Login Modal</div>,
}))

describe('ModalRegistry', () => {
    it('renders correctly', () => {
        render(<ModalRegistry />)
        expect(screen.getByTestId('login-modal')).toBeInTheDocument()
    })
})
