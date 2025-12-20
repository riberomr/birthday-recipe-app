import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommentForm } from '../CommentForm';
import { useCreateComment } from '@/hooks/mutations/useCreateComment';
import { useAuth } from '@/components/AuthContext';
import { useModal } from '@/hooks/ui/useModal';
import { compressImage } from '@/lib/utils';

jest.mock('@/hooks/mutations/useCreateComment');
jest.mock('@/components/AuthContext');
jest.mock('@/hooks/ui/useModal');
jest.mock('@/lib/utils', () => ({
    compressImage: jest.fn(),
    cn: (...inputs: any[]) => inputs.join(' '),
}));

const mockShowSnackbar = jest.fn();
jest.mock('@/components/ui/Snackbar', () => ({
    useSnackbar: () => ({ showSnackbar: mockShowSnackbar }),
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('CommentForm', () => {
    const mockUseCreateComment = useCreateComment as jest.Mock;
    const mockUseAuth = useAuth as jest.Mock;
    const mockUseModal = useModal as jest.Mock;
    const mockMutate = jest.fn();
    const mockOpenLoginModal = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseCreateComment.mockReturnValue({
            mutate: mockMutate,
            isPending: false,
        });
        mockUseAuth.mockReturnValue({
            profile: { id: 'user1', avatar_url: 'url' },
            login: jest.fn(),
        });
        mockUseModal.mockReturnValue({
            open: mockOpenLoginModal,
        });
        (compressImage as jest.Mock).mockResolvedValue(new File([''], 'compressed.jpg', { type: 'image/jpeg' }));
    });

    it('renders login prompt if not authenticated', () => {
        mockUseAuth.mockReturnValue({ profile: null });
        render(<CommentForm recipeId="recipe1" />);
        expect(screen.getByText('Para dejar un comentario necesitás iniciar sesión ✨')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Iniciar Sesión'));
        expect(mockOpenLoginModal).toHaveBeenCalled();
    });

    it('renders form if authenticated', () => {
        render(<CommentForm recipeId="recipe1" />);
        expect(screen.getByPlaceholderText('Escribe un comentario...')).toBeInTheDocument();
        expect(screen.getByTestId('submit-button')).toBeDisabled();
    });

    it('submits form with text only', async () => {
        render(<CommentForm recipeId="recipe1" />);

        fireEvent.change(screen.getByPlaceholderText('Escribe un comentario...'), {
            target: { value: 'New comment' },
        });

        const submitButton = screen.getByTestId('submit-button');
        expect(submitButton).not.toBeDisabled();

        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalledWith(expect.any(FormData), expect.any(Object));
        });

        const formData = mockMutate.mock.calls[0][0] as FormData;
        expect(formData.get('content')).toBe('New comment');
        expect(formData.get('recipe_id')).toBe('recipe1');
        expect(formData.get('user_id')).toBe('user1');
        expect(formData.get('file')).toBeNull();
    });

    it('handles image upload and preview', async () => {
        const { container } = render(<CommentForm recipeId="recipe1" />);

        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        // Use fireEvent on the input directly, even if hidden
        const input = container.querySelector('input[type="file"]');
        if (!input) throw new Error('Input not found');

        fireEvent.change(input, { target: { files: [file] } });

        expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
        expect(screen.getByAltText('Preview')).toBeInTheDocument();

        const submitButton = screen.getByTestId('submit-button');
        expect(submitButton).not.toBeDisabled();

        // Submit with image
        // fireEvent.click(submitButton) sometimes fails to trigger submit in JSDOM if not set up perfectly
        // Using fireEvent.submit on the form is more reliable for testing the handler
        const form = container.querySelector('form');
        if (!form) throw new Error('Form not found');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(compressImage).toHaveBeenCalledWith(file);
            expect(mockMutate).toHaveBeenCalled();
        });

        const formData = mockMutate.mock.calls[0][0] as FormData;
        expect(formData.get('file')).not.toBeNull();
    });

    it('clears image preview', async () => {
        const { container } = render(<CommentForm recipeId="recipe1" />);
        const input = container.querySelector('input[type="file"]');
        if (!input) throw new Error('Input not found');

        const file = new File([''], 'test.png', { type: 'image/png' });
        fireEvent.change(input, { target: { files: [file] } });

        expect(screen.getByAltText('Preview')).toBeInTheDocument();

        // Find the clear button. It is the button inside the relative div that contains the preview image.
        // We can find it by looking for the X icon's parent or just the button that is NOT the submit button.
        // Or we can add a test id to the clear button in the component, but we want to avoid changing component if possible.
        // The clear button has `onClick={clearImage}`.
        // Let's find all buttons and pick the one that is not submit and not login (login is not shown here).
        // Actually, there is only one other button: the submit button.
        // Wait, the camera icon is in a label, not a button.
        // So there are 2 buttons: Clear and Submit.

        const buttons = screen.getAllByRole('button');
        const clearButton = buttons.find(b => !b.getAttribute('data-testid')); // Submit has data-testid

        if (!clearButton) throw new Error('Clear button not found');
        fireEvent.click(clearButton);

        expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();
        expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('shows loading state', () => {
        mockUseCreateComment.mockReturnValue({
            mutate: mockMutate,
            isPending: true,
        });

        render(<CommentForm recipeId="recipe1" />);

        const submitButton = screen.getByTestId('submit-button');
        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveTextContent('Publicando...');
    });

    it('handles submission error', async () => {
        mockMutate.mockImplementation((formData, { onError }) => {
            onError(new Error('Submission failed'));
        });

        render(<CommentForm recipeId="recipe1" />);

        fireEvent.change(screen.getByPlaceholderText('Escribe un comentario...'), {
            target: { value: 'Test' },
        });

        fireEvent.click(screen.getByTestId('submit-button'));

        await waitFor(() => {
            expect(mockShowSnackbar).toHaveBeenCalledWith('Submission failed', 'error');
        });
    });

    it('handles submission success', async () => {
        mockMutate.mockImplementation((formData, { onSuccess }) => {
            onSuccess();
        });

        render(<CommentForm recipeId="recipe1" />);

        const input = screen.getByPlaceholderText('Escribe un comentario...');
        fireEvent.change(input, { target: { value: 'Test' } });

        fireEvent.click(screen.getByTestId('submit-button'));

        await waitFor(() => {
            expect(mockShowSnackbar).toHaveBeenCalledWith('¡Comentario publicado!', 'success');
            expect(input).toHaveValue('');
        });
    });
    it('should show error snackbar when image compression fails', async () => {
        (compressImage as jest.Mock).mockRejectedValue(new Error('Compression failed'));

        const { container } = render(<CommentForm recipeId="recipe1" />);

        // Simular selección de imagen
        const file = new File(['hello'], 'hello.png', { type: 'image/png' });
        const input = container.querySelector('input[type="file"]');
        if (!input) throw new Error('Input not found');
        fireEvent.change(input, { target: { files: [file] } });

        fireEvent.change(screen.getByPlaceholderText('Escribe un comentario...'), {
            target: { value: 'Test comment' },
        });

        fireEvent.click(screen.getByTestId('submit-button'));

        await waitFor(() => {
            expect(mockShowSnackbar).toHaveBeenCalledWith('Compression failed', 'error');
        });
    });

    it('should open login modal and call login on confirm', async () => {
        const mockLogin = jest.fn();
        const mockOpenModal = jest.fn(({ onConfirm }) => onConfirm()); // Simula ejecución inmediata

        mockUseAuth.mockReturnValue({
            profile: null,
            login: mockLogin,
        });
        mockUseModal.mockReturnValue({
            open: mockOpenModal,
        });

        render(<CommentForm recipeId="recipe1" />);

        const loginButton = screen.getByRole('button', { name: /iniciar sesión/i });
        fireEvent.click(loginButton);

        expect(mockOpenModal).toHaveBeenCalledWith(expect.objectContaining({
            onConfirm: expect.any(Function)
        }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalled();
        });
    });
});
