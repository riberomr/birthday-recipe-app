import { render, screen } from '@testing-library/react'
import { EditRecipeButton } from '../EditRecipeButton'
import { useAuth } from '../AuthContext'

// Mock dependencies
jest.mock('../AuthContext', () => ({
    useAuth: jest.fn(),
}))

describe('EditRecipeButton', () => {
    it('renders when user is owner', () => {
        ; (useAuth as jest.Mock).mockReturnValue({
            supabaseUser: { id: 'owner-id' },
        })

        render(<EditRecipeButton recipeId="recipe-1" ownerId="owner-id" />)
        expect(screen.getByRole('link')).toBeInTheDocument()
    })

    it('does not render when user is not owner', () => {
        ; (useAuth as jest.Mock).mockReturnValue({
            supabaseUser: { id: 'other-id' },
        })

        render(<EditRecipeButton recipeId="recipe-1" ownerId="owner-id" />)
        expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    it('does not render when user is not logged in', () => {
        ; (useAuth as jest.Mock).mockReturnValue({
            supabaseUser: null,
        })

        render(<EditRecipeButton recipeId="recipe-1" ownerId="owner-id" />)
        expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })
})
