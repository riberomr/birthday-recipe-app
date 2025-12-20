import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StarRating } from '../StarRating';
import { useAuth } from '@/components/AuthContext';
import { useUserRating } from '@/hooks/queries/useUserRating';
import { useRateRecipe } from '@/hooks/mutations/useRateRecipe';
import { useSnackbar } from '@/components/ui/Snackbar';

jest.mock('@/components/AuthContext');
jest.mock('@/hooks/queries/useUserRating');
jest.mock('@/hooks/mutations/useRateRecipe');
jest.mock('@/components/ui/Snackbar');

describe('StarRating', () => {
    const mockRateRecipe = jest.fn();
    const mockShowSnackbar = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({ supabaseUser: { id: 'user-1' } });
        (useUserRating as jest.Mock).mockReturnValue({ data: 0 });
        (useRateRecipe as jest.Mock).mockReturnValue({ mutate: mockRateRecipe, isPending: false });
        (useSnackbar as jest.Mock).mockReturnValue({ showSnackbar: mockShowSnackbar });
    });

    it('renders correctly', () => {
        render(<StarRating recipeId="recipe-1" />);
        expect(screen.getAllByRole('button')).toHaveLength(5);
    });

    it('displays user rating', () => {
        (useUserRating as jest.Mock).mockReturnValue({ data: 3 });
        const { container } = render(<StarRating recipeId="recipe-1" />);

        // Check if 3 stars are filled (yellow)
        const stars = container.querySelectorAll('.lucide-star');
        expect(stars[0]).toHaveClass('fill-yellow-400');
        expect(stars[1]).toHaveClass('fill-yellow-400');
        expect(stars[2]).toHaveClass('fill-yellow-400');
        expect(stars[3]).not.toHaveClass('fill-yellow-400');
    });

    it('calls rateRecipe on click', () => {
        render(<StarRating recipeId="recipe-1" />);

        const stars = screen.getAllByRole('button');
        fireEvent.click(stars[4]); // 5 stars

        expect(mockRateRecipe).toHaveBeenCalledWith(
            { recipeId: 'recipe-1', rating: 5 },
            expect.any(Object)
        );
    });

    it('handles success', async () => {
        mockRateRecipe.mockImplementation((variables, options) => {
            options.onSuccess();
        });

        render(<StarRating recipeId="recipe-1" />);

        const stars = screen.getAllByRole('button');
        fireEvent.click(stars[4]);

        expect(mockShowSnackbar).toHaveBeenCalledWith("¡Calificación guardada!", "success");
    });

    it('handles error', async () => {
        mockRateRecipe.mockImplementation((variables, options) => {
            options.onError(new Error('Failed'));
        });

        render(<StarRating recipeId="recipe-1" />);

        const stars = screen.getAllByRole('button');
        fireEvent.click(stars[4]);

        expect(mockShowSnackbar).toHaveBeenCalledWith("Failed", "error");
    });

    it('is disabled when readonly', () => {
        render(<StarRating recipeId="recipe-1" readonly />);
        const stars = screen.getAllByRole('button');
        expect(stars[0]).toBeDisabled();
    });

    it('is disabled when not authenticated', () => {
        (useAuth as jest.Mock).mockReturnValue({ supabaseUser: null });
        render(<StarRating recipeId="recipe-1" />);
        const stars = screen.getAllByRole('button');
        expect(stars[0]).toBeDisabled();
    });

    it('is disabled when pending', () => {
        (useRateRecipe as jest.Mock).mockReturnValue({ mutate: mockRateRecipe, isPending: true });
        render(<StarRating recipeId="recipe-1" />);
        const stars = screen.getAllByRole('button');
        expect(stars[0]).toBeDisabled();
    });
});
