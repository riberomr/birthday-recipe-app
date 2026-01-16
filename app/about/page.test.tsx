import { render, screen } from '@testing-library/react';
import AboutPage, { metadata } from './page';

describe('AboutPage', () => {
    it('renders the hero section correctly', () => {
        render(<AboutPage />);
        expect(screen.getByText(/Más que un Recetario/i)).toBeInTheDocument();
        expect(screen.getByText(/una Comunidad Familiar/i)).toBeInTheDocument();
    });

    it('renders the story section', () => {
        render(<AboutPage />);
        expect(screen.getByRole('heading', { name: /Nuestra Historia/i })).toBeInTheDocument();
        expect(screen.getByText(/Recetario La María nació como un proyecto personal/i)).toBeInTheDocument();
    });

    it('renders the how it works section', () => {
        render(<AboutPage />);
        expect(screen.getByRole('heading', { name: /¿Cómo funciona\?/i })).toBeInTheDocument();
        expect(screen.getByText('Para Visitantes')).toBeInTheDocument();
        expect(screen.getByText('Para Miembros')).toBeInTheDocument();
        expect(screen.getByText('Tu Espacio')).toBeInTheDocument();
    });

    it('renders the privacy section', () => {
        render(<AboutPage />);
        expect(screen.getByRole('heading', { name: /Tu Privacidad y Datos/i })).toBeInTheDocument();
        expect(screen.getByText(/¿Qué guardamos\?/i)).toBeInTheDocument();
        expect(screen.getByText(/¿Para qué usamos tus datos\?/i)).toBeInTheDocument();
    });

    it('renders the CTA section with link to recipes', () => {
        render(<AboutPage />);
        expect(screen.getByText(/¿Te animas a cocinar\?/i)).toBeInTheDocument();
        const link = screen.getByRole('link', { name: /Ver Recetas/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/recipes');
    });

    it('has correct metadata', () => {
        expect(metadata).toEqual({
            title: 'Sobre Nosotros - Recetario La María',
            description: 'Conoce más sobre nuestro proyecto, cómo funciona y cómo cuidamos tu privacidad.',
        });
    });
});
