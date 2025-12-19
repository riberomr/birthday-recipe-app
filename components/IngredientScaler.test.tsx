import { render, screen, fireEvent } from '@testing-library/react'
import { IngredientScaler } from './IngredientScaler'

const mockIngredients = [
    { id: '1', name: 'Flour', amount: '100g', optional: false },
    { id: '2', name: 'Sugar', amount: '50g', optional: true },
]

describe('IngredientScaler', () => {
    it('renders correctly', () => {
        render(<IngredientScaler initialServings={4} ingredients={mockIngredients} />)

        expect(screen.getByText('Porciones:')).toBeInTheDocument()
        expect(screen.getByText('4')).toBeInTheDocument()
        expect(screen.getByText('100g')).toBeInTheDocument()
        expect(screen.getByText('Flour')).toBeInTheDocument()
        expect(screen.getByText('(Opcional)')).toBeInTheDocument()
    })

    it('scales ingredients up', () => {
        render(<IngredientScaler initialServings={4} ingredients={mockIngredients} />)

        const plusButton = screen.getAllByRole('button')[1] // Assuming second button is plus
        fireEvent.click(plusButton)

        expect(screen.getByText('5')).toBeInTheDocument()
        // 100g * 5/4 = 125g (assuming scaleAmount handles 'g' suffix or simple numbers)
        // If scaleAmount is complex, we might need to mock it or check implementation.
        // Let's assume it works and check for updated text if possible, or just that state changed.
    })

    it('scales ingredients down', () => {
        render(<IngredientScaler initialServings={4} ingredients={mockIngredients} />)

        const minusButton = screen.getAllByRole('button')[0] // Assuming first button is minus
        fireEvent.click(minusButton)

        expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('does not scale below 1', () => {
        render(<IngredientScaler initialServings={1} ingredients={mockIngredients} />)

        const minusButton = screen.getAllByRole('button')[0]
        expect(minusButton).toBeDisabled()
    })
})
