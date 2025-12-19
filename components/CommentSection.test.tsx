import { render, screen, waitFor } from '@testing-library/react'
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
})
