import { render, screen } from '@testing-library/react'
import CreateRecipePage from './page'

// Mock RecipeForm component
jest.mock('@/components/RecipeForm', () => ({
    RecipeForm: () => <div data-testid="recipe-form">Recipe Form</div>
}))

describe('CreateRecipePage', () => {
    it('renders RecipeForm component', () => {
        render(<CreateRecipePage />)

        expect(screen.getByTestId('recipe-form')).toBeInTheDocument()
    })
})
