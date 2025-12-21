import { screen, waitFor, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MyRecipesPage from './page'
import { useAuth } from '@/components/AuthContext'
import { useSnackbar } from '@/components/ui/Snackbar'
import { useRouter } from 'next/navigation'
import { useMyRecipes } from '@/hooks/queries/useMyRecipes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mocks de dependencias
jest.mock('@/components/AuthContext')
jest.mock('@/components/ui/Snackbar')
jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}))

// Mock del Hook - Esto es lo que pediste
jest.mock('@/hooks/queries/useMyRecipes')

jest.mock('@/components/RecipeCard', () => ({
    RecipeCard: ({ recipe }: any) => <div data-testid={`recipe-${recipe.id}`}>{recipe.title}</div>
}))

// Helper para renderizar sin el wrapper complejo si estamos mockeando el hook
const renderWithProvider = (ui: React.ReactElement) => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
    })
    return render(
        <QueryClientProvider client={queryClient}>
            {ui}
        </QueryClientProvider>
    )
}

describe('MyRecipesPage', () => {
    const mockRouter = { push: jest.fn() }
    const mockShowSnackbar = jest.fn()
    const mockUser = { id: 'user-1' }
    const mockRecipes = [
        { id: '1', title: 'My Recipe 1' },
        { id: '2', title: 'My Recipe 2' }
    ]

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useRouter as jest.Mock).mockReturnValue(mockRouter)
            ; (useSnackbar as jest.Mock).mockReturnValue({ showSnackbar: mockShowSnackbar })

            // Mock default state del hook
            ; (useMyRecipes as jest.Mock).mockReturnValue({
                data: {
                    pages: [{ recipes: mockRecipes, total: 2 }],
                },
                fetchNextPage: jest.fn(),
                hasNextPage: false,
                isFetchingNextPage: false,
                isLoading: false,
                isError: false,
            })
    })

    it('redirects to home when user is not logged in', async () => {
        ; (useAuth as jest.Mock).mockReturnValue({ profile: null, isLoading: false })
            ; (useMyRecipes as jest.Mock).mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: false
            })

        renderWithProvider(<MyRecipesPage />)

        await waitFor(() => {
            expect(mockShowSnackbar).toHaveBeenCalledWith('Debes iniciar sesión para ver tus recetas', 'error')
            expect(mockRouter.push).toHaveBeenCalledWith('/')
        })
    })

    it('displays recipes when loaded', async () => {
        ; (useAuth as jest.Mock).mockReturnValue({ profile: mockUser, isLoading: false })

        renderWithProvider(<MyRecipesPage />)

        expect(screen.getByText('Mis Recetas')).toBeInTheDocument()
        expect(screen.getByTestId('recipe-1')).toBeInTheDocument()
        expect(screen.getByTestId('recipe-2')).toBeInTheDocument()
    })

    it('shows empty state with create button when no recipes', async () => {
        ; (useAuth as jest.Mock).mockReturnValue({ profile: mockUser, isLoading: false })
            ; (useMyRecipes as jest.Mock).mockReturnValue({
                data: { pages: [{ recipes: [], total: 0 }] },
                isLoading: false,
                isError: false,
            })

        renderWithProvider(<MyRecipesPage />)

        expect(screen.getByText(/no tienes recetas creadas aún/i)).toBeInTheDocument()
        const createBtn = screen.getByRole('button', { name: /crear nueva receta/i })
        expect(createBtn).toBeInTheDocument()

        await userEvent.click(createBtn)
        expect(mockRouter.push).toHaveBeenCalledWith('/recipes/create')
    })

    it('handles fetch error gracefully', async () => {
        ; (useAuth as jest.Mock).mockReturnValue({ profile: mockUser, isLoading: false })
            ; (useMyRecipes as jest.Mock).mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: true,
            })

        renderWithProvider(<MyRecipesPage />)

        await waitFor(() => {
            expect(mockShowSnackbar).toHaveBeenCalledWith('Error al cargar mis recetas', 'error')
        })
    })

    it('loads more recipes when clicking the load more button', async () => {
        const fetchNextPage = jest.fn()
            ; (useAuth as jest.Mock).mockReturnValue({ profile: mockUser, isLoading: false })
            ; (useMyRecipes as jest.Mock).mockReturnValue({
                data: { pages: [{ recipes: mockRecipes, total: 4 }] },
                isLoading: false,
                isError: false,
                hasNextPage: true,
                isFetchingNextPage: false,
                fetchNextPage
            })

        renderWithProvider(<MyRecipesPage />)

        const loadMoreBtn = screen.getByRole('button', { name: /cargar más/i })
        await userEvent.click(loadMoreBtn)

        expect(fetchNextPage).toHaveBeenCalled()
    })

    it('shows loading state while fetching next page', async () => {
        ; (useAuth as jest.Mock).mockReturnValue({ profile: mockUser, isLoading: false })
            ; (useMyRecipes as jest.Mock).mockReturnValue({
                data: { pages: [{ recipes: mockRecipes, total: 4 }] },
                isLoading: false,
                isError: false,
                hasNextPage: true,
                isFetchingNextPage: true, // Esto activa el loader y deshabilita el botón
                fetchNextPage: jest.fn()
            })

        renderWithProvider(<MyRecipesPage />)

        expect(screen.getByText(/cargando.../i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /cargando.../i })).toBeDisabled()
    })

    it('shows initial loading state', () => {
        ; (useAuth as jest.Mock).mockReturnValue({ profile: mockUser, isLoading: false })
            ; (useMyRecipes as jest.Mock).mockReturnValue({
                data: undefined,
                isLoading: true,
                isError: false,
            })

        renderWithProvider(<MyRecipesPage />)
        // Buscamos el div que contiene el Loader (puedes añadir test-id al Loader si prefieres)
        expect(screen.getByTestId('loader')).toBeInTheDocument()
    })
})