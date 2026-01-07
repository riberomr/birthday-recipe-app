import { render, screen } from '@testing-library/react';
import AboutPage, { metadata } from './page';

describe('AboutPage', () => {
    it('renders the hero section correctly', () => {
        render(<AboutPage />);
        expect(screen.getByText(/Cocina Casera/i)).toBeInTheDocument();
        expect(screen.getByText(/Hecha con Amor/i)).toBeInTheDocument();
        expect(screen.getByText(/Nuestra misión es hacer que la cocina deliciosa/i)).toBeInTheDocument();
    });

    it('renders the story section', () => {
        render(<AboutPage />);
        expect(screen.getByRole('heading', { name: /Nuestra Historia/i })).toBeInTheDocument();
        expect(screen.getByText(/Todo comenzó en una pequeña cocina/i)).toBeInTheDocument();
    });

    it('renders the features/why us section', () => {
        render(<AboutPage />);
        expect(screen.getByRole('heading', { name: /¿Por qué este blog\?/i })).toBeInTheDocument();
        expect(screen.getByText('Ingredientes Reales')).toBeInTheDocument();
        expect(screen.getByText('Comunidad')).toBeInTheDocument();
        expect(screen.getByText('Pasión Pura')).toBeInTheDocument();
    });

    it('renders the CTA section with link to recipes', () => {
        render(<AboutPage />);
        expect(screen.getByText(/¿Listo para cocinar algo delicioso\?/i)).toBeInTheDocument();
        const link = screen.getByRole('link', { name: /Ver Recetas/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/recipes');
    });

    it('has correct metadata', () => {
        expect(metadata).toEqual({
            title: 'Sobre Nosotros - Recetario La María',
            description: 'Conoce más sobre nuestra misión y la pasión por la cocina casera.',
        });
    });
});
