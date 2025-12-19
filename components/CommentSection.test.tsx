import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommentSection } from './CommentSection'
import { useAuth } from './AuthContext'
import { getComments, postComment } from '@/lib/api/comments'
import { useSnackbar } from './ui/Snackbar'
import { compressImage } from '@/lib/utils'
import { useModal } from '@/hooks/useModal'

jest.mock('./AuthContext')
jest.mock('@/lib/api/comments')
jest.mock('./ui/Snackbar')
jest.mock('@/lib/utils')
jest.mock('@/hooks/useModal')
jest.mock('./CommentSkeleton', () => ({
    CommentSkeleton: () => <div data-testid="comment-skeleton">Loading...</div>
}))

describe('CommentSection', () => {
    const mockUser = {
        uid: 'user-1',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg'
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
            ; (useAuth as jest.Mock).mockReturnValue({ user: null, login: mockLogin })
            ; (useSnackbar as jest.Mock).mockReturnValue({ showSnackbar: mockShowSnackbar })
            ; (getComments as jest.Mock).mockResolvedValue({ comments: mockComments, total: 2 })
            ; (postComment as jest.Mock).mockResolvedValue({})
            ; (compressImage as jest.Mock).mockImplementation((file) => Promise.resolve(file))
            ; (useModal as jest.Mock).mockReturnValue({ open: mockOpen })

        // Mock URL methods
        global.URL.createObjectURL = jest.fn(() => 'blob:test')
        global.URL.revokeObjectURL = jest.fn()
    })

    describe('when user is not logged in', () => {
        it('renders login prompt', async () => {
            render(<CommentSection recipeId="1" />)

            await waitFor(() => {
                expect(screen.getByText(/para dejar un comentario/i)).toBeInTheDocument()
            })

            expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
        })

        it('opens login modal when clicking login button', async () => {
            const user = userEvent.setup()
            render(<CommentSection recipeId="1" />)

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
            })

            await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

            expect(mockOpen).toHaveBeenCalled()
        })

        it('calls login when confirming modal', async () => {
            const user = userEvent.setup()
            render(<CommentSection recipeId="1" />)

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
            ; (useAuth as jest.Mock).mockReturnValue({ user: mockUser, login: mockLogin })
        })

        it('renders comment form', async () => {
            render(<CommentSection recipeId="1" />)

            await waitFor(() => {
                expect(screen.getByPlaceholderText(/escribe un comentario/i)).toBeInTheDocument()
            })
        })

        it('submits comment successfully', async () => {
            const user = userEvent.setup()
            render(<CommentSection recipeId="1" />)

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

            render(<CommentSection recipeId="1" />)

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
        it('shows loading skeletons initially', () => {
            render(<CommentSection recipeId="1" />)
            expect(screen.getAllByTestId('comment-skeleton')).toHaveLength(3)
        })

        it('displays comments after loading', async () => {
            render(<CommentSection recipeId="1" />)

            await waitFor(() => {
                expect(screen.getByText('Great recipe!')).toBeInTheDocument()
                expect(screen.getByText('Love it!')).toBeInTheDocument()
            })
        })

        it('shows empty state when no comments', async () => {
            ; (getComments as jest.Mock).mockResolvedValue({ comments: [], total: 0 })

            render(<CommentSection recipeId="1" />)

            await waitFor(() => {
                expect(screen.getByText(/no hay comentarios aún/i)).toBeInTheDocument()
            })
        })

        it('displays comment with image', async () => {
            render(<CommentSection recipeId="1" />)

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
                    .mockResolvedValueOnce({ comments: [mockComments[0]], total: 10 })

            render(<CommentSection recipeId="1" />)

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

            render(<CommentSection recipeId="1" />)

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
            render(<CommentSection recipeId="1" />)

            await waitFor(() => {
                expect(screen.queryByText(/cargar más comentarios/i)).not.toBeInTheDocument()
            })
        })

        it('handles fetch comments error gracefully', async () => {
            const consoleError = jest.spyOn(console, 'error').mockImplementation()
                ; (getComments as jest.Mock).mockRejectedValue(new Error('Fetch failed'))

            render(<CommentSection recipeId="1" />)

            await waitFor(() => {
                expect(consoleError).toHaveBeenCalled()
            })

            consoleError.mockRestore()
        })
    })

    describe('image handling', () => {
        beforeEach(() => {
            ; (useAuth as jest.Mock).mockReturnValue({ user: mockUser, login: mockLogin })
        })

        it('previews selected image', async () => {
            const { container } = render(<CommentSection recipeId="1" />)

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
            const { container } = render(<CommentSection recipeId="1" />)

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
            const { container } = render(<CommentSection recipeId="1" />)

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
            render(<CommentSection recipeId="1" />)

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
            const { container } = render(<CommentSection recipeId="1" />)
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
            const userWithoutPhoto = { ...mockUser, photoURL: null, displayName: null }
                ; (useAuth as jest.Mock).mockReturnValue({ user: userWithoutPhoto, login: mockLogin })

            render(<CommentSection recipeId="1" />)

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

            render(<CommentSection recipeId="1" />)

            await waitFor(() => {
                expect(screen.getByText('Usuario')).toBeInTheDocument()
                const img = screen.getByAltText('User')
                expect(img).toHaveAttribute('src', expect.stringContaining('seed=default'))
            })
        })

        it('uses default error message on submission failure', async () => {
            const user = userEvent.setup()
                ; (useAuth as jest.Mock).mockReturnValue({ user: mockUser, login: mockLogin })
                ; (postComment as jest.Mock).mockRejectedValue({}) // Error without message
            const consoleError = jest.spyOn(console, 'error').mockImplementation()

            render(<CommentSection recipeId="1" />)

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

        render(<CommentSection recipeId="1" />)

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
})
