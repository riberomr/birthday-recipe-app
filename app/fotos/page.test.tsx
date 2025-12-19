import { render, screen } from '@testing-library/react'
import PhotosPage from './page'

describe('PhotosPage', () => {
    it('renders the photos page content', () => {
        render(<PhotosPage />)

        expect(screen.getByText('Próximamente')).toBeInTheDocument()
        expect(screen.getByText('Las fotos del cumpleaños estarán disponibles aquí.')).toBeInTheDocument()

        expect(screen.getByRole('link', { name: /volver al inicio/i })).toHaveAttribute('href', '/')
    })
})
