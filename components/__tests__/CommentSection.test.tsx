import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommentSection } from '../CommentSection'
import { useAuth } from '../AuthContext'
import { getComments, postComment, deleteComment } from '@/lib/api/comments'
import { useSnackbar } from '../ui/Snackbar'
import { compressImage } from '@/lib/utils'
import { useModal } from '@/hooks/useModal'

jest.mock('../AuthContext')
jest.mock('@/lib/api/comments')
jest.mock('../ui/Snackbar')
jest.mock('@/lib/utils')
jest.mock('@/hooks/useModal')
jest.mock('../CommentSkeleton', () => ({
    CommentSkeleton: () => <div data-testid="comment-skeleton">Loading...</div>
}))

describe('CommentSection', () => {
    const mockUser = {
        id: 'user-1',
        full_name: 'Test User',
        avatar_url: 'https://example.com/photo.jpg'
    }

    const mockComments = [
        {
            id: '1',
            user_id: 'user-1',
            content: 'Great recipe!',
            created_at: '2024-01-01',
            profiles: {
                full_name: 'John Doe',
                avatar_url: 'https://example.com/avatar.jpg'
            }
        },
        {
            id: '2',
            user_id: 'user-2',
            content: 'Love it!',
            created_at: '2024-01-02',
            profiles: {
                full_name: 'Jane Smith',
                avatar_url: 'https://example.com/avatar2.jpg'
            },
            image_url: 'https://example.com/comment-image.jpg'
        }
    ]

    const mockShowSnackbar = jest.fn()
    const mockLogin = jest.fn()
    const mockOpen = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useAuth as jest.Mock).mockReturnValue({ supabaseUser: null, login: mockLogin })
            ; (useSnackbar as jest.Mock).mockReturnValue({ showSnackbar: mockShowSnackbar })
            ; (getComments as jest.Mock).mockResolvedValue({ comments: mockComments, total: 2 })
            ; (postComment as jest.Mock).mockResolvedValue({})
            ; (deleteComment as jest.Mock).mockResolvedValue({})
            ; (compressImage as jest.Mock).mockImplementation((file) => Promise.resolve(file))
            ; (useModal as jest.Mock).mockReturnValue({ open: mockOpen })

        // Mock URL methods
        global.URL.createObjectURL = jest.fn(() => 'blob:test')
        global.URL.revokeObjectURL = jest.fn()
    })

    describe('when user is not logged in', () => {
        it('renders login prompt', async () => {
            render(<CommentSection recipeId="1" recipeOwnerId="owner-1" />)

            await waitFor(() => {
                expect(screen.getByText(/para dejar un comentario/i)).toBeInTheDocument()
            })

            expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()

            await waitFor(() => {
                expect(getComments).toHaveBeenCalled()
            })
        })

        it('opens login modal when clicking login button', async () => {
            const user = userEvent.setup()
            render(<CommentSection recipeId="1" recipeOwnerId="owner-1" />)

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
            })

            await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

            expect(mockOpen).toHaveBeenCalled()
        })

        it('calls login when confirming modal', async () => {
            const user = userEvent.setup()
            render(<CommentSection recipeId="1" recipeOwnerId="owner-1" />)

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
            })

            await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

            // Simulate modal confirmation
            const openCall = mockOpen.mock.calls[0][0]
            await openCall.onConfirm()

            expect(mockLogin).toHaveBeenCalled()
        })
    })

    describe('when user is logged in', () => {
        beforeEach(() => {
            ; (useAuth as jest.Mock).mockReturnValue({ supabaseUser: mockUser, login: mockLogin })
        })

        it('renders comment form', async () => {
            render(<CommentSection recipeId="1" recipeOwnerId="owner-1" />)

            await waitFor(() => {
                expect(screen.getByPlaceholderText(/escribe un comentario/i)).toBeInTheDocument()
            })

            await waitFor(() => {
                expect(getComments).toHaveBeenCalled()
            })
        })

        it('submits comment successfully', async () => {
            const user = userEvent.setup()
            render(<CommentSection recipeId="1" recipeOwnerId="owner-1" />)

            await waitFor(() => {
                expect(screen.getByPlaceholderText(/escribe un comentario/i)).toBeInTheDocument()
            })

            const textarea = screen.getByPlaceholderText(/escribe un comentario/i)
            await user.type(textarea, 'This is a test comment')

            const submitButton = screen.getByTestId('submit-button')
            await user.click(submitButton)

            await waitFor(() => {
                expect(postComment).toHaveBeenCalled()
                expect(mockShowSnackbar).toHaveBeenCalledWith('¡Comentario publicado!', 'success')
            })
        })

        it('handles submission error', async () => {
            const user = userEvent.setup()
                ; (postComment as jest.Mock).mockRejectedValue(new Error('Submission failed'))
            const consoleError = jest.spyOn(console, 'error').mockImplementation()

            render(<CommentSection recipeId="1" recipeOwnerId="owner-1" />)

            await waitFor(() => {
                expect(screen.getByPlaceholderText(/escribe un comentario/i)).toBeInTheDocument()
            })

            const textarea = screen.getByPlaceholderText(/escribe un comentario/i)
            await user.type(textarea, 'This is a test comment')

            const submitButton = screen.getByTestId('submit-button')
            await user.click(submitButton)

            await waitFor(() => {
                expect(consoleError).toHaveBeenCalledWith('Error saving comment:', expect.any(Error))
                expect(mockShowSnackbar).toHaveBeenCalledWith('Submission failed', 'error')
            })

            consoleError.mockRestore()
        })
    })

    describe('comment loading and display', () => {
        it('shows loading skeletons initially', async () => {
            render(<CommentSection recipeId="1" recipeOwnerId="owner-1" />)
            expect(screen.getAllByTestId('comment-skeleton')).toHaveLength(3)

            await waitFor(() => {
                expect(screen.queryByTestId('comment-skeleton')).not.toBeInTheDocument()
            })
        })

        it('displays comments after loading', async () => {
            render(<CommentSection recipeId="1" recipeOwnerId="owner-1" />)

            await waitFor(() => {
                expect(screen.getByText('Great recipe!')).toBeInTheDocument()
                expect(screen.getByText('Love it!')).toBeInTheDocument()
            })
        })

        it('shows empty state when no comments', async () => {
            ; (getComments as jest.Mock).mockResolvedValue({ comments: [], total: 0 })

            render(<CommentSection recipeId="1" recipeOwnerId="owner-1" />)

            await waitFor(() => {
                expect(screen.getByText(/no hay comentarios aún/i)).toBeInTheDocument()
            })
        })

        it('displays comment with image', async () => {
            render(<CommentSection recipeId="1" recipeOwnerId="owner-1" />)

            await waitFor(() => {
                const commentImage = screen.getByAltText('Foto del comentario')
                expect(commentImage).toBeInTheDocument()
                expect(commentImage).toHaveAttribute('src', 'https://example.com/comment-image.jpg')
            })
        })

        it('loads more comments when clicking load more button', async () => {
            const user = userEvent.setup()
                ; (getComments as jest.Mock)
                    .mockResolvedValueOnce({ comments: mockComments, total: 10 })
                    .mockResolvedValueOnce({ comments: [{ ...mockComments[0], id: '3' }], total: 10 })

            render(<CommentSection recipeId="1" recipeOwnerId="owner-1" />)

            await waitFor(() => {
                expect(screen.getByText(/cargar más comentarios/i)).toBeInTheDocument()
            })

            await user.click(screen.getByText(/cargar más comentarios/i))

            await waitFor(() => {
                expect(getComments).toHaveBeenCalledTimes(2)
                expect(getComments).toHaveBeenLastCalledWith('1', 2, 5)
            })
        })

        it('handles load more error', async () => {
            const user = userEvent.setup()
            const consoleError = jest.spyOn(console, 'error').mockImplementation()
                ; (getComments as jest.Mock)
                    .mockResolvedValueOnce({ comments: mockComments, total: 10 })
                    .mockRejectedValueOnce(new Error('Load more failed'))

            render(<CommentSection recipeId="1" recipeOwnerId="owner-1" />)

            await waitFor(() => {
                expect(screen.getByText(/cargar más comentarios/i)).toBeInTheDocument()
            })

            await user.click(screen.getByText(/cargar más comentarios/i))

            await waitFor(() => {
                expect(consoleError).toHaveBeenCalledWith('Error loading more comments:', expect.any(Error))
            })

            consoleError.mockRestore()
        })

        it('hides load more button when all comments are loaded', async () => {
            render(<CommentSection recipeId="1" recipeOwnerId="owner-1" />)

            await waitFor(() => {
                expect(screen.queryByText(/cargar más comentarios/i)).not.toBeInTheDocument()
            })
        })

        it('handles fetch comments error gracefully', async () => {
            const consoleError = jest.spyOn(console, 'error').mockImplementation()
                ; (getComments as jest.Mock).mockRejectedValue(new Error('Fetch failed'))

            render(<CommentSection recipeId="1" recipeOwnerId="owner-1" />)

            await waitFor(() => {
                expect(consoleError).toHaveBeenCalled()
            })

            consoleError.mockRestore()
        })
    })

    describe('image handling', () => {
        beforeEach(() => {
            ; (useAuth as jest.Mock).mockReturnValue({ supabaseUser: mockUser, login: mockLogin })
        })

        it('previews selected image', async () => {
            const { container } = render(<CommentSection recipeId="1" recipeOwnerId="owner-1" />)

            await waitFor(() => {
                expect(screen.getByPlaceholderText(/escribe un comentario/i)).toBeInTheDocument()
            })

            const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })
            const input = container.querySelector('input[type="file"]') as HTMLInputElement

            fireEvent.change(input, { target: { files: [file] } })

            await waitFor(() => {
                expect(screen.getByAltText('Preview')).toBeInTheDocument()
                expect(global.URL.createObjectURL).toHaveBeenCalledWith(file)
            })
        })

        it('clears selected image', async () => {
            const { container } = render(<CommentSection recipeId="1" recipeOwnerId="owner-1" />)

            await waitFor(() => {
                expect(screen.getByPlaceholderText(/escribe un comentario/i)).toBeInTheDocument()
            })

            const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })
            const input = container.querySelector('input[type="file"]') as HTMLInputElement

            fireEvent.change(input, { target: { files: [file] } })

            await waitFor(() => {
                expect(screen.getByAltText('Preview')).toBeInTheDocument()
            })

            const clearButton = container.querySelector('button.bg-destructive') as HTMLButtonElement
            fireEvent.click(clearButton)

            await waitFor(() => {
                expect(screen.queryByAltText('Preview')).not.toBeInTheDocument()
            })
        })

        it('submits comment with image', async () => {
            const user = userEvent.setup()
            const { container } = render(<CommentSection recipeId="1" recipeOwnerId="owner-1" />)

            await waitFor(() => {
                expect(screen.getByPlaceholderText(/escribe un comentario/i)).toBeInTheDocument()
            })

            const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })
            const input = container.querySelector('input[type="file"]') as HTMLInputElement
            fireEvent.change(input, { target: { files: [file] } })

            const textarea = screen.getByPlaceholderText(/escribe un comentario/i)
            await user.type(textarea, 'Comment with image')

            const submitButton = screen.getByTestId('submit-button')
            await user.click(submitButton)

            await waitFor(() => {
                expect(compressImage).toHaveBeenCalledWith(file)
                expect(postComment).toHaveBeenCalled()
            })
        })



        it('does not submit if comment is only whitespace', async () => {
            const user = userEvent.setup()
            render(<CommentSection recipeId="1" recipeOwnerId="owner-1" />)

            await waitFor(() => {
                expect(screen.getByPlaceholderText(/escribe un comentario/i)).toBeInTheDocument()
            })

            const textarea = screen.getByPlaceholderText(/escribe un comentario/i)
            await user.type(textarea, '   ')

            const submitButton = screen.getByTestId('submit-button')
            await user.click(submitButton)

            expect(postComment).not.toHaveBeenCalled()
        })

        it('handles empty file selection', async () => {
            const { container } = render(<CommentSection recipeId="1" recipeOwnerId="owner-1" />)
            await waitFor(() => {
                expect(screen.getByPlaceholderText(/escribe un comentario/i)).toBeInTheDocument()
            })

            const input = container.querySelector('input[type="file"]') as HTMLInputElement
            fireEvent.change(input, { target: { files: [] } })

            expect(screen.queryByAltText('Preview')).not.toBeInTheDocument()
        })


    })

    describe('edge cases', () => {
        it('uses fallback avatar for user', async () => {
            const userWithoutPhoto = { ...mockUser, avatar_url: null, full_name: null }
                ; (useAuth as jest.Mock).mockReturnValue({ supabaseUser: userWithoutPhoto, login: mockLogin })

            render(<CommentSection recipeId="1" recipeOwnerId="owner-1" />)

            await waitFor(() => {
                const img = screen.getByAltText('User')
                expect(img).toHaveAttribute('src', expect.stringContaining('seed=default'))
            })
        })

        it('uses fallback avatar and name for comment author', async () => {
            const commentWithoutProfile = {
                ...mockComments[0],
                id: '3',
                profiles: null
            }
                ; (getComments as jest.Mock).mockResolvedValue({ comments: [commentWithoutProfile], total: 1 })

            render(<CommentSection recipeId="1" recipeOwnerId="owner-1" />)

            await waitFor(() => {
                expect(screen.getByText('Usuario')).toBeInTheDocument()
                const img = screen.getByAltText('User')
                expect(img).toHaveAttribute('src', expect.stringContaining('seed=default'))
            })
        })

        it('uses default error message on submission failure', async () => {
            const user = userEvent.setup()
                ; (useAuth as jest.Mock).mockReturnValue({ supabaseUser: mockUser, login: mockLogin })
                ; (postComment as jest.Mock).mockRejectedValue({}) // Error without message
            const consoleError = jest.spyOn(console, 'error').mockImplementation()

            render(<CommentSection recipeId="1" recipeOwnerId="owner-1" />)

            await waitFor(() => {
                expect(screen.getByPlaceholderText(/escribe un comentario/i)).toBeInTheDocument()
            })

            const textarea = screen.getByPlaceholderText(/escribe un comentario/i)
            await user.type(textarea, 'Test')

            await user.click(screen.getByTestId('submit-button'))

            await waitFor(() => {
                expect(mockShowSnackbar).toHaveBeenCalledWith('Error al publicar comentario', 'error')
            })

            consoleError.mockRestore()
        })
    })
    it('prevents multiple load more calls', async () => {
        const user = userEvent.setup()
            ; (getComments as jest.Mock)
                .mockResolvedValueOnce({ comments: mockComments, total: 10 })
                // Delay the second response to allow double click
                .mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve({ comments: [], total: 10 }), 100)))

        render(<CommentSection recipeId="1" recipeOwnerId="owner-1" />)

        await waitFor(() => {
            expect(screen.getByText(/cargar más comentarios/i)).toBeInTheDocument()
        })

        const button = screen.getByText(/cargar más comentarios/i)

        // Click twice rapidly
        await user.click(button)
        await user.click(button)

        expect(getComments).toHaveBeenCalledTimes(2) // Initial fetch + 1 load more
        // Should not be 3
    })

    describe('comment deletion', () => {
        beforeEach(() => {
            ; (useAuth as jest.Mock).mockReturnValue({ supabaseUser: mockUser, login: mockLogin })
        })

        it('shows delete button for comment author', async () => {
            render(<CommentSection recipeId="1" recipeOwnerId="owner-2" />)

            await waitFor(() => {
                // mockUser is 'user-1', comment 1 is 'user-1'
                const deleteButtons = screen.getAllByRole('button', { name: /eliminar comentario/i })
                expect(deleteButtons).toHaveLength(1)
            })
        })

        it('shows delete button for recipe owner', async () => {
            // mockUser is 'user-1', recipeOwnerId is 'user-1'
            render(<CommentSection recipeId="1" recipeOwnerId="user-1" />)

            await waitFor(() => {
                // Should see buttons for both comments (one is own, one is other's but user is owner)
                const deleteButtons = screen.getAllByRole('button', { name: /eliminar comentario/i })
                expect(deleteButtons).toHaveLength(2)
            })
        })

        it('does not show delete button for unauthorized user', async () => {
            // mockUser is 'user-1', recipeOwnerId is 'owner-2'
            // comment 2 is 'user-2'
            // user-1 should NOT see delete button for comment 2
            render(<CommentSection recipeId="1" recipeOwnerId="owner-2" />)

            await waitFor(() => {
                const deleteButtons = screen.getAllByRole('button', { name: /eliminar comentario/i })
                expect(deleteButtons).toHaveLength(1) // Only for comment 1 (own comment)
            })
        })

        it('opens delete modal on click', async () => {
            const user = userEvent.setup()
            render(<CommentSection recipeId="1" recipeOwnerId="owner-2" />)

            await waitFor(() => {
                expect(screen.getByText('Great recipe!')).toBeInTheDocument()
            })

            const deleteButtons = screen.getAllByRole('button', { name: /eliminar comentario/i })
            await user.click(deleteButtons[0])

            expect(mockOpen).toHaveBeenCalledWith(expect.objectContaining({
                title: "¿Eliminar comentario?",
                onConfirm: expect.any(Function)
            }))
        })

        it('calls deleteComment on confirmation', async () => {
            const user = userEvent.setup()
            render(<CommentSection recipeId="1" recipeOwnerId="owner-2" />)

            await waitFor(() => {
                expect(screen.getByText('Great recipe!')).toBeInTheDocument()
            })

            const deleteButtons = screen.getAllByRole('button', { name: /eliminar comentario/i })
            await user.click(deleteButtons[0])

            const openCall = mockOpen.mock.calls[0][0]
            await openCall.onConfirm()

            expect(deleteComment).toHaveBeenCalledWith('1')
            expect(mockShowSnackbar).toHaveBeenCalledWith('Comentario eliminado', 'success')
        })

        it('handles deleteComment error gracefully', async () => {
            const user = userEvent.setup()
            const consoleError = jest.spyOn(console, 'error').mockImplementation()

                // Forzamos el fallo de la API de eliminación
                ; (deleteComment as jest.Mock).mockRejectedValue(new Error())

            render(<CommentSection recipeId="1" recipeOwnerId="owner-2" />)

            await waitFor(() => {
                expect(screen.getByText('Great recipe!')).toBeInTheDocument()
            })

            // 1. Click en el botón de borrar para abrir el modal
            const deleteButtons = screen.getAllByRole('button', { name: /eliminar comentario/i })
            await user.click(deleteButtons[0])

            // 2. Recuperamos la función onConfirm que se pasó al mock del modal
            const openCall = mockOpen.mock.calls[0][0]

            // 3. Ejecutamos onConfirm y esperamos a que el catch sea capturado
            await openCall.onConfirm()

            expect(consoleError).toHaveBeenCalledWith('Error deleting comment:', expect.any(Error))
            expect(mockShowSnackbar).toHaveBeenCalledWith('Error al eliminar comentario', 'error')

            consoleError.mockRestore()
        })
    })
})
