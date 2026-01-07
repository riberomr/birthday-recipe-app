import { render, screen } from '@testing-library/react'
import Home from '../page'

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>
    }
}))

describe('Home Page', () => {
    it('renders the home page content', () => {
        render(<Home />)

        expect(screen.getByText('Pagina de recetas')).toBeInTheDocument()
        expect(screen.getByText('🥰 Cocinando Amor 🥰')).toBeInTheDocument()

        expect(screen.getByRole('link', { name: /ver recetas/i })).toHaveAttribute('href', '/recipes')
        expect(screen.getByRole('link', { name: /fotos/i })).toHaveAttribute('href', '/fotos')
    })
})
