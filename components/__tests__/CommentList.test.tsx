import { render, screen, fireEvent } from '@testing-library/react';
import { CommentList } from '../CommentList';
import { useComments } from '@/hooks/queries/useComments';
import { useDeleteComment } from '@/hooks/mutations/useDeleteComment';
import { useAuth } from '@/components/AuthContext';
import { useModal } from '@/hooks/ui/useModal';

jest.mock('@/hooks/queries/useComments');
jest.mock('@/hooks/mutations/useDeleteComment');
jest.mock('@/components/AuthContext');
jest.mock('@/hooks/ui/useModal');

const mockShowSnackbar = jest.fn();
jest.mock('@/components/ui/Snackbar', () => ({
    useSnackbar: () => ({ showSnackbar: mockShowSnackbar }),
}));

describe('CommentList', () => {
    const mockUseComments = useComments as jest.Mock;
    const mockUseDeleteComment = useDeleteComment as jest.Mock;
    const mockUseAuth = useAuth as jest.Mock;
    const mockUseModal = useModal as jest.Mock;
    const mockDeleteMutate = jest.fn();
    const mockOpenDeleteModal = jest.fn();
    const mockCloseDeleteModal = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseComments.mockReturnValue({
            data: { comments: [], total: 0 },
            isLoading: false,
            error: null,
        });
        mockUseDeleteComment.mockReturnValue({
            mutate: mockDeleteMutate,
        });
        mockUseAuth.mockReturnValue({
            profile: { id: 'user1' },
        });
        mockUseModal.mockReturnValue({
            open: mockOpenDeleteModal,
            close: mockCloseDeleteModal,
        });
    });

    it('renders empty state', () => {
        render(<CommentList recipeId="recipe1" recipeOwnerId="owner1" />);
        expect(screen.getByText('No hay comentarios aún. ¡Sé el primero!')).toBeInTheDocument();
    });

    it('renders loading state', () => {
        mockUseComments.mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
        });

        render(<CommentList recipeId="recipe1" recipeOwnerId="owner1" />);
        // Check for skeletons (usually they have animate-pulse class or similar, or we check for absence of "No hay comentarios")
        // The component renders 3 CommentSkeleton.
        // Let's check if we can find elements with specific class if we knew it, or just check that empty message is not there.
        expect(screen.queryByText('No hay comentarios aún. ¡Sé el primero!')).not.toBeInTheDocument();
        // We can also check for aria-busy or similar if we added it.
    });

    it('renders error state', () => {
        mockUseComments.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new Error('Fetch error'),
        });

        render(<CommentList recipeId="recipe1" recipeOwnerId="owner1" />);
        expect(screen.getByText('Error al cargar comentarios.')).toBeInTheDocument();
    });

    it('renders comments', () => {
        mockUseComments.mockReturnValue({
            data: {
                comments: [
                    {
                        id: '1',
                        content: 'Test comment',
                        created_at: new Date().toISOString(),
                        user_id: 'user1',
                        profiles: { full_name: 'User 1', avatar_url: 'url' },
                    },
                ],
                total: 1,
            },
            isLoading: false,
            error: null,
        });

        render(<CommentList recipeId="recipe1" recipeOwnerId="owner1" />);
        expect(screen.getByText('Test comment')).toBeInTheDocument();
        expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    it('shows delete button for own comment', () => {
        mockUseComments.mockReturnValue({
            data: {
                comments: [
                    {
                        id: '1',
                        content: 'Test comment',
                        created_at: new Date().toISOString(),
                        user_id: 'user1',
                        profiles: { full_name: 'User 1', avatar_url: 'url' },
                    },
                ],
                total: 1,
            },
            isLoading: false,
            error: null,
        });

        render(<CommentList recipeId="recipe1" recipeOwnerId="owner1" />);
        expect(screen.getByLabelText('Eliminar comentario')).toBeInTheDocument();
    });

    it('does not show delete button for other user comment', () => {
        mockUseAuth.mockReturnValue({
            profile: { id: 'user2' },
        });
        mockUseComments.mockReturnValue({
            data: {
                comments: [
                    {
                        id: '1',
                        content: 'Test comment',
                        created_at: new Date().toISOString(),
                        user_id: 'user1',
                        profiles: { full_name: 'User 1', avatar_url: 'url' },
                    },
                ],
                total: 1,
            },
            isLoading: false,
            error: null,
        });

        render(<CommentList recipeId="recipe1" recipeOwnerId="owner1" />);
        expect(screen.queryByLabelText('Eliminar comentario')).not.toBeInTheDocument();
    });

    it('shows delete button for recipe owner', () => {
        mockUseAuth.mockReturnValue({
            profile: { id: 'owner1' },
        });
        mockUseComments.mockReturnValue({
            data: {
                comments: [
                    {
                        id: '1',
                        content: 'Test comment',
                        created_at: new Date().toISOString(),
                        user_id: 'user1',
                        profiles: { full_name: 'User 1', avatar_url: 'url' },
                    },
                ],
                total: 1,
            },
            isLoading: false,
            error: null,
        });

        render(<CommentList recipeId="recipe1" recipeOwnerId="owner1" />);
        expect(screen.getByLabelText('Eliminar comentario')).toBeInTheDocument();
    });

    it('handles delete interaction', async () => {
        mockUseComments.mockReturnValue({
            data: {
                comments: [
                    {
                        id: '1',
                        content: 'Test comment',
                        created_at: new Date().toISOString(),
                        user_id: 'user1',
                        profiles: { full_name: 'User 1', avatar_url: 'url' },
                    },
                ],
                total: 1,
            },
            isLoading: false,
            error: null,
        });

        render(<CommentList recipeId="recipe1" recipeOwnerId="owner1" />);

        fireEvent.click(screen.getByLabelText('Eliminar comentario'));

        expect(mockOpenDeleteModal).toHaveBeenCalledWith(expect.objectContaining({
            title: "¿Eliminar comentario?",
            onConfirm: expect.any(Function),
        }));

        // Simulate confirm
        const { onConfirm } = mockOpenDeleteModal.mock.calls[0][0];
        onConfirm();

        expect(mockDeleteMutate).toHaveBeenCalledWith('1', expect.any(Object));

        // Simulate success callback
        const { onSuccess } = mockDeleteMutate.mock.calls[0][1];
        onSuccess();

        expect(mockShowSnackbar).toHaveBeenCalledWith('Comentario eliminado', 'success');
        expect(mockCloseDeleteModal).toHaveBeenCalled();
    });

    it('handles delete error', () => {
        mockUseComments.mockReturnValue({
            data: {
                comments: [{ id: '1', content: 'Test', created_at: '', user_id: 'user1' }],
                total: 1,
            },
            isLoading: false,
            error: null,
        });

        render(<CommentList recipeId="recipe1" recipeOwnerId="owner1" />);

        fireEvent.click(screen.getByLabelText('Eliminar comentario'));
        const { onConfirm } = mockOpenDeleteModal.mock.calls[0][0];
        onConfirm();

        // Simulate error callback
        const { onError } = mockDeleteMutate.mock.calls[0][1];
        onError(new Error('Delete failed'));

        expect(mockShowSnackbar).toHaveBeenCalledWith('Delete failed', 'error');
    });

    it('handles pagination', () => {
        mockUseComments.mockReturnValue({
            data: {
                comments: Array(5).fill({ id: '1', content: 'Test', created_at: '', user_id: 'user1' }),
                total: 10,
            },
            isLoading: false,
            error: null,
        });

        render(<CommentList recipeId="recipe1" recipeOwnerId="owner1" />);

        const loadMoreButton = screen.getByText('Cargar más comentarios');
        expect(loadMoreButton).toBeInTheDocument();

        fireEvent.click(loadMoreButton);

        // The component updates local state `limit`.
        // We can't easily check internal state, but we can check if `useComments` is called with new limit on re-render.
        // `useComments` is a mock.
        expect(mockUseComments).toHaveBeenLastCalledWith('recipe1', 1, 10);
    });
});
