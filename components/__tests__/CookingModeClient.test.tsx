import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CookingModeClient } from '../CookingModeClient'
import { useRouter } from 'next/navigation'

// Mock dependencies
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        push: mockPush,
    })),
}))

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

const mockSteps = [
    { id: '1', step_order: 1, content: 'Step 1' },
    { id: '2', step_order: 2, content: 'Step 2' },
]

describe('CookingModeClient', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders first step correctly', () => {
        render(<CookingModeClient steps={mockSteps as any} recipeId="1" recipeTitle="Test Recipe" />)
        expect(screen.getByText('Step 1')).toBeInTheDocument()
        expect(screen.getByText('Modo Cocina')).toBeInTheDocument()
    })

    it('navigates to next step', async () => {
        render(<CookingModeClient steps={mockSteps as any} recipeId="1" recipeTitle="Test Recipe" />)
        fireEvent.click(screen.getByText('Siguiente'))
        await waitFor(() => {
            expect(screen.getByText('Step 2')).toBeInTheDocument()
        })
    })

    it('navigates to previous step', async () => {
        render(<CookingModeClient steps={mockSteps as any} recipeId="1" recipeTitle="Test Recipe" />)
        fireEvent.click(screen.getByText('Siguiente')) // Go to step 2
        await waitFor(() => screen.getByText('Step 2'))

        fireEvent.click(screen.getByText('Anterior')) // Go back to step 1
        await waitFor(() => {
            expect(screen.getByText('Step 1')).toBeInTheDocument()
        })
    })

    it('finishes cooking mode', async () => {
        render(<CookingModeClient steps={mockSteps as any} recipeId="1" recipeTitle="Test Recipe" />)
        fireEvent.click(screen.getByText('Siguiente')) // Go to step 2 (last)
        await waitFor(() => screen.getByText('Step 2'))

        fireEvent.click(screen.getByText('¡Terminé!'))
        expect(mockPush).toHaveBeenCalledWith('/recipes/1')
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

        render(<CookingModeClient steps={mockSteps as any} recipeId="1" recipeTitle="Test Recipe" />)

        await waitFor(() => {
            expect(consoleError).toHaveBeenCalled()
        })

        consoleError.mockRestore()
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

        render(<CookingModeClient steps={mockSteps as any} recipeId="1" recipeTitle="Test Recipe" />)
        // Should not throw
    })

    it('does not navigate prev on first step', () => {
        render(<CookingModeClient steps={mockSteps as any} recipeId="1" recipeTitle="Test Recipe" />)
        const prevButton = screen.getByText('Anterior')
        expect(prevButton).toBeDisabled()

        // Force click (though disabled) to ensure handler doesn't crash or change state if somehow invoked
        fireEvent.click(prevButton)
        expect(screen.getByText('Step 1')).toBeInTheDocument()
    })
})
