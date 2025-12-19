import { render, screen } from '@testing-library/react'
import RootLayout, { metadata } from '../layout'

// Mock all providers and components
jest.mock('@/components/theme-provider', () => ({
    ThemeProvider: ({ children }: any) => <div data-testid="theme-provider">{children}</div>
}))

jest.mock('@/components/AuthContext', () => ({
    AuthProvider: ({ children }: any) => <div data-testid="auth-provider">{children}</div>
}))

jest.mock('@/components/ui/Snackbar', () => ({
    SnackbarProvider: ({ children }: any) => <div data-testid="snackbar-provider">{children}</div>
}))

jest.mock('@/lib/contexts/ModalContext', () => ({
    ModalProvider: ({ children }: any) => <div data-testid="modal-provider">{children}</div>
}))

jest.mock('@/components/Navbar', () => ({
    Navbar: () => <nav data-testid="navbar">Navbar</nav>
}))

jest.mock('@/components/ModalRegistry', () => ({
    ModalRegistry: () => <div data-testid="modal-registry">Modal Registry</div>
}))

describe('RootLayout', () => {
    it('renders children with all providers', () => {
        const testContent = <div>Test Content</div>

        const { container } = render(
            <RootLayout>{testContent}</RootLayout>
        )

        // Verify all providers are present
        expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
        expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
        expect(screen.getByTestId('snackbar-provider')).toBeInTheDocument()
        expect(screen.getByTestId('modal-provider')).toBeInTheDocument()

        // Verify Navbar and ModalRegistry
        expect(screen.getByTestId('navbar')).toBeInTheDocument()
        expect(screen.getByTestId('modal-registry')).toBeInTheDocument()

        // Verify children are rendered
        expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('exports correct metadata', () => {
        expect(metadata).toEqual({
            title: 'Recetario La María',
            description: 'Recetas de mi cocina a la tuya'
        })
    })
})
