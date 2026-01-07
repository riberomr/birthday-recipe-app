import { render, screen } from '@testing-library/react';
import PrivacyPage, { metadata } from './page';

describe('PrivacyPage', () => {
    it('renders the main heading and last update', () => {
        render(<PrivacyPage />);
        expect(screen.getByRole('heading', { name: /Política de Privacidad/i, level: 1 })).toBeInTheDocument();
        expect(screen.getByText(/Última actualización:/i)).toBeInTheDocument();
    });

    it('renders all policy sections', () => {
        render(<PrivacyPage />);
        expect(screen.getByText(/Información que Recopilamos/i)).toBeInTheDocument();
        expect(screen.getByText(/Cómo Usamos tus Datos/i)).toBeInTheDocument();
        expect(screen.getByText(/Cookies y Tecnologías Similares/i)).toBeInTheDocument();
        expect(screen.getByText(/Servicios de Terceros/i)).toBeInTheDocument();
    });

    it('renders the contact section with email link', () => {
        render(<PrivacyPage />);
        expect(screen.getByText(/¿Tienes preguntas\?/i)).toBeInTheDocument();
        const link = screen.getByRole('link', { name: /Contáctanos/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href');
    });

    it('has correct metadata', () => {
        expect(metadata).toEqual({
            title: 'Política de Privacidad - Birthday Recipe App',
            description: 'Política de privacidad y manejo de datos.',
        });
    });
});
