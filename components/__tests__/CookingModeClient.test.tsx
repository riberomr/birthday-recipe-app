import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CookingModeClient } from '../CookingModeClient'
import { useRecipe } from '@/hooks/queries/useRecipe'

// Mock dependencies
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        push: mockPush,
    })),
}))

jest.mock('@/hooks/queries/useRecipe')

// Mock WakeLock
Object.defineProperty(navigator, 'wakeLock', {
    value: {
        request: jest.fn().mockResolvedValue({
            release: jest.fn(),
        }),
    },
    writable: true,
    configurable: true,
})

const mockRecipe = {
    id: '1',
    title: 'Test Recipe',
    recipe_steps: [
        { id: '1', step_order: 1, content: 'Step 1' },
        { id: '2', step_order: 2, content: 'Step 2' },
    ]
}

describe('CookingModeClient', () => {
    beforeEach(() => {
        jest.clearAllMocks()
            ; (useRecipe as jest.Mock).mockReturnValue({
                data: mockRecipe,
                isLoading: false,
                isError: false,
            })
    })

    it('renders first step correctly', () => {
        render(<CookingModeClient recipeId="1" />)
        expect(screen.getByText('Step 1')).toBeInTheDocument()
        expect(screen.getByText('Modo Cocina')).toBeInTheDocument()
        expect(screen.getByText('Test Recipe')).toBeInTheDocument()
    })

    it('navigates to next step', async () => {
        render(<CookingModeClient recipeId="1" />)
        fireEvent.click(screen.getByText('Siguiente'))
        await waitFor(() => {
            expect(screen.getByText('Step 2')).toBeInTheDocument()
        })
    })

    it('navigates to previous step', async () => {
        render(<CookingModeClient recipeId="1" />)
        fireEvent.click(screen.getByText('Siguiente')) // Go to step 2
        await waitFor(() => screen.getByText('Step 2'))

        fireEvent.click(screen.getByText('Anterior')) // Go back to step 1
        await waitFor(() => {
            expect(screen.getByText('Step 1')).toBeInTheDocument()
        })
    })

    it('finishes cooking mode', async () => {
        render(<CookingModeClient recipeId="1" />)
        fireEvent.click(screen.getByText('Siguiente')) // Go to step 2 (last)
        await waitFor(() => screen.getByText('Step 2'))

        fireEvent.click(screen.getByText('¡Terminé!'))
        expect(mockPush).toHaveBeenCalledWith('/recipes/1')
    })

    it('shows loading state', () => {
        ; (useRecipe as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        })
        render(<CookingModeClient recipeId="1" />)
        // Check for the loader (you might need to add a test-id or check for class)
        // Since I added a div with animate-spin, I can check for that class or just that it doesn't crash
        const loader = document.querySelector('.animate-spin')
        expect(loader).toBeInTheDocument()
    })

    it('handles wake lock request error', async () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation()
        const mockWakeLock = {
            request: jest.fn().mockRejectedValue(new Error('Wake lock failed'))
        }
        Object.defineProperty(navigator, 'wakeLock', {
            value: mockWakeLock,
            writable: true,
        })

        render(<CookingModeClient recipeId="1" />)

        await waitFor(() => {
            expect(consoleError).toHaveBeenCalled()
        })

        consoleError.mockRestore()
    })

    it('requests wake lock on mount', async () => {
        const mockRequest = jest.fn().mockResolvedValue({
            release: jest.fn(),
        })
        Object.defineProperty(navigator, 'wakeLock', {
            value: {
                request: mockRequest,
            },
            writable: true,
            configurable: true,
        })

        render(<CookingModeClient recipeId="1" />)

        await waitFor(() => {
            expect(mockRequest).toHaveBeenCalledWith('screen')
        })
    })

    it('handles missing wakeLock API', async () => {
        // Make wakeLock configurable so we can delete it
        Object.defineProperty(navigator, 'wakeLock', {
            configurable: true,
            writable: true,
            value: undefined
        })
        // @ts-ignore
        delete navigator.wakeLock

        render(<CookingModeClient recipeId="1" />)
        // Should not throw
    })

    it('does not navigate prev on first step', () => {
        render(<CookingModeClient recipeId="1" />)
        const prevButton = screen.getByText('Anterior')
        expect(prevButton).toBeDisabled()

        // Force click (though disabled) to ensure handler doesn't crash or change state if somehow invoked
        fireEvent.click(prevButton)
        expect(screen.getByText('Step 1')).toBeInTheDocument()
    })

    it('renders error state when recipe is missing or error occurs', () => {
        ; (useRecipe as jest.Mock).mockReturnValue({
            data: null,
            isLoading: false,
            isError: true,
        })

        render(<CookingModeClient recipeId="1" />)
        expect(screen.getByText('Receta no encontrada')).toBeInTheDocument()
        expect(screen.getByText('Volver a Recetas')).toBeInTheDocument()
    })
})
