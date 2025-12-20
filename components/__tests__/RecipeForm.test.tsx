import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RecipeForm } from '../RecipeForm'
import { useAuth } from '@/components/AuthContext'
import { useSnackbar } from '@/components/ui/Snackbar'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { compressImage } from '@/lib/utils'

// Define mocks outside to avoid hoisting issues
const mockCreateRecipe = jest.fn()
const mockUpdateRecipe = jest.fn()

// Mocks
jest.mock('@/components/AuthContext', () => ({
    useAuth: jest.fn(),
}))
jest.mock('@/components/ui/Snackbar', () => ({
    useSnackbar: jest.fn(),
}))
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}))
jest.mock('@/lib/api/recipes', () => ({
    __esModule: true,
    createRecipe: (...args: any[]) => mockCreateRecipe(...args),
    updateRecipe: (...args: any[]) => mockUpdateRecipe(...args),
}))
jest.mock('@/lib/supabase/client', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn().mockResolvedValue({ data: [{ id: 'tag1', name: 'Kawaii' }] }),
        })),
    },
}))
jest.mock('@/lib/utils', () => ({
    compressImage: jest.fn(),
    cn: jest.requireActual('@/lib/utils').cn,
}))

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:url')
global.URL.revokeObjectURL = jest.fn()

describe('RecipeForm', () => {
    const mockRouter = { push: jest.fn(), back: jest.fn(), refresh: jest.fn() }
    const mockShowSnackbar = jest.fn()
    const mockUser = { id: 'user1', displayName: 'User 1' }

    beforeEach(() => {
        jest.clearAllMocks()
        mockCreateRecipe.mockReset()
        mockUpdateRecipe.mockReset()

            ; (useAuth as jest.Mock).mockReturnValue({ firebaseUser: mockUser, profile: { id: 'user1' } })
            ; (useSnackbar as jest.Mock).mockReturnValue({ showSnackbar: mockShowSnackbar })
            ; (useRouter as jest.Mock).mockReturnValue(mockRouter)
    })

    it('renders correctly in create mode', async () => {
        const user = userEvent.setup()
        render(<RecipeForm />)
        expect(screen.getByText('Nueva Receta Mágica ✨')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Ej: Pastel de Fresas Kawaii')).toBeInTheDocument()

        // Check if tags are loaded
        await waitFor(() => {
            expect(screen.getByText('Kawaii')).toBeInTheDocument()
        })

        // Toggle tag
        const tagBtn = screen.getByText('Kawaii')
        await user.click(tagBtn) // Select
        expect(tagBtn).toHaveClass('bg-primary')
        await user.click(tagBtn) // Deselect
        expect(tagBtn).not.toHaveClass('bg-primary')

        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('renders correctly in edit mode', async () => {
        const initialData: any = {
            id: 'recipe1',
            title: 'Existing Recipe',
            description: 'Desc',
            prep_time_minutes: 10,
            cook_time_minutes: 20,
            difficulty: 'easy',
            servings: 2,
            user_id: 'user1',
            tags: [{ id: 'tag1', name: 'Kawaii' }],
            recipe_ingredients: [{ name: 'Flour', amount: '1 cup', optional: false }],
            recipe_steps: [{ content: 'Mix' }],
            recipe_nutrition: [{ name: 'Calories', amount: '100', unit: 'kcal' }],
            image_url: 'http://example.com/image.jpg'
        }

        render(<RecipeForm initialData={initialData} isEditing={true} />)
        expect(screen.getByText('Editar Receta ✏️')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Existing Recipe')).toBeInTheDocument()

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('redirects if user is not owner in edit mode', async () => {
        ; (useAuth as jest.Mock).mockReturnValue({ firebaseUser: mockUser, profile: { id: 'otherUser' } })
        const initialData: any = { user_id: 'user1', id: 'recipe1' }

        render(<RecipeForm initialData={initialData} isEditing={true} />)

        expect(mockRouter.push).toHaveBeenCalledWith('/')
        expect(mockShowSnackbar).toHaveBeenCalledWith(expect.stringContaining('No tienes permiso'), 'error')

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('handles form submission for new recipe', async () => {
        const user = userEvent.setup()
        render(<RecipeForm />)

        // Fill form
        await user.type(screen.getByPlaceholderText('Ej: Pastel de Fresas Kawaii'), 'New Recipe')
        await user.type(screen.getByPlaceholderText('Cuéntanos un poco sobre esta delicia...'), 'Description')

        // Inputs for numbers
        const inputs = screen.getAllByRole('spinbutton')
        await user.type(inputs[0], '10') // Prep
        await user.type(inputs[1], '20') // Cook
        await user.type(inputs[2], '4') // Servings

        // Ingredients
        await user.type(screen.getByPlaceholderText('Ingrediente'), 'Sugar')
        await user.type(screen.getByPlaceholderText('Cant.'), '1 cup')

        // Steps
        await user.type(screen.getByPlaceholderText('Paso 1'), 'Mix everything')

        // Submit
        mockCreateRecipe.mockResolvedValue({ recipeId: 'new-id' })

        await user.click(screen.getByText('Guardar Receta'))

        await waitFor(() => {
            expect(mockCreateRecipe).toHaveBeenCalled()
        })
        expect(mockRouter.push).toHaveBeenCalledWith('/recipes/new-id')

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('validates required fields', async () => {
        const user = userEvent.setup()
        render(<RecipeForm />)

        // Fill title to pass HTML required
        await user.type(screen.getByPlaceholderText('Ej: Pastel de Fresas Kawaii'), 'Title')
        await user.type(screen.getByPlaceholderText('Cuéntanos un poco sobre esta delicia...'), 'Desc')
        const inputs = screen.getAllByRole('spinbutton')
        await user.type(inputs[0], '10')
        await user.type(inputs[1], '20')
        await user.type(inputs[2], '4')

        // Clear default ingredient
        const removeIngBtn = screen.getAllByRole('button').find(b => b.className.includes('text-destructive'))
        if (removeIngBtn) await user.click(removeIngBtn)

        await user.click(screen.getByText('Guardar Receta'))

        await waitFor(() => {
            expect(mockShowSnackbar).toHaveBeenCalledWith('Agrega al menos un ingrediente', 'error')
        })

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('handles image upload', async () => {
        const user = userEvent.setup()
        const { container } = render(<RecipeForm />)

        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })
        const input = container.querySelector('input[type="file"]') as HTMLInputElement

        await user.upload(input, file)

        expect(input.files?.[0]).toBe(file)
        expect(input.files?.item(0)).toBe(file)
        expect(global.URL.createObjectURL).toHaveBeenCalled()
        // compressImage is called on submit, not on upload

        // Check if preview is shown
        expect(screen.getByAltText('Preview')).toBeInTheDocument()

        // Clear image
        await user.click(screen.getByText('Eliminar Imagen'))
        expect(screen.queryByAltText('Preview')).not.toBeInTheDocument()

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('handles dynamic fields (ingredients, steps, nutrition)', async () => {
        const user = userEvent.setup()
        render(<RecipeForm />)

        // Add Ingredient
        const addIngBtn = screen.getAllByText('Agregar')[0]
        await user.click(addIngBtn)
        const ingInputs = screen.getAllByPlaceholderText('Ingrediente')
        expect(ingInputs).toHaveLength(2)

        // Remove Ingredient
        const removeIngBtns = screen.getAllByTestId(/remove-ingredient-/)
        await user.click(removeIngBtns[0])
        expect(screen.getAllByPlaceholderText('Ingrediente')).toHaveLength(1)

        // Add Step
        const addStepBtn = screen.getAllByText('Agregar')[1]
        await user.click(addStepBtn)
        const stepInputs = screen.getAllByPlaceholderText(/Paso \d/)
        expect(stepInputs).toHaveLength(2)

        // Add Nutrition
        const addNutBtn = screen.getAllByText('Agregar')[2]
        await user.click(addNutBtn)
        const nutInputs = screen.getAllByPlaceholderText('Nombre (ej: Calorías)')
        expect(nutInputs).toHaveLength(2)

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('handles update submission', async () => {
        const user = userEvent.setup()
        const initialData: any = {
            id: 'recipe1',
            title: 'Old Title',
            description: 'Old Desc',
            user_id: 'user1',
            tags: [],
            recipe_ingredients: [{ name: 'Old Ing', amount: '1', optional: false }],
            recipe_steps: [{ content: 'Old Step' }],
            recipe_nutrition: [],
            prep_time_minutes: 10,
            cook_time_minutes: 20,
            servings: 4
        }

        render(<RecipeForm initialData={initialData} isEditing={true} />)

        const titleInput = screen.getByDisplayValue('Old Title')
        await user.clear(titleInput)
        await user.type(titleInput, 'New Title')

        // Update existing ingredient
        const ingInput = screen.getByDisplayValue('Old Ing')
        await user.clear(ingInput)
        await user.type(ingInput, 'Ing 1')

        // Update existing step
        const stepInput = screen.getByDisplayValue('Old Step')
        await user.clear(stepInput)
        await user.type(stepInput, 'Step 1')

        // Mock update success
        mockUpdateRecipe.mockResolvedValue({ recipeId: 'recipe1' })

        await user.click(screen.getByText('Actualizar Receta'))

        await waitFor(() => {
            expect(mockUpdateRecipe).toHaveBeenCalled()
        })
        expect(mockRouter.push).toHaveBeenCalledWith('/recipes/recipe1')

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('handles submission error', async () => {
        const user = userEvent.setup()
        render(<RecipeForm />)

        // Fill required fields
        await user.type(screen.getByPlaceholderText('Ej: Pastel de Fresas Kawaii'), 'Test Recipe')
        await user.type(screen.getByPlaceholderText('Cuéntanos un poco sobre esta delicia...'), 'Description')

        // Fill other required fields to avoid HTML validation blocking submission
        const inputs = screen.getAllByRole('spinbutton')
        await user.type(inputs[0], '10')
        await user.type(inputs[1], '20')
        await user.type(inputs[2], '4')

        // Add ingredient
        // Wait for ingredient input to be available
        const ingInput = await screen.findByPlaceholderText('Ingrediente')
        await user.type(ingInput, 'Flour')

        // Add step
        const stepInput = await screen.findByPlaceholderText(/Paso \d+/)
        await user.type(stepInput, 'Mix')

        // Mock create failure
        mockCreateRecipe.mockRejectedValue(new Error('Submission failed'))

        await user.click(screen.getByText('Guardar Receta'))

        await waitFor(() => {
            expect(mockShowSnackbar).toHaveBeenCalledWith(expect.stringContaining('Submission failed'), 'error')
        })

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('handles tag selection', async () => {
        render(<RecipeForm />)
        expect(screen.getByText('Etiquetas')).toBeInTheDocument()

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('handles nutrition fields', async () => {
        const user = userEvent.setup()
        render(<RecipeForm />)

        // Add nutrition
        const addBtns = screen.getAllByText('Agregar')
        await user.click(addBtns[2]) // Assuming 3rd button is nutrition

        const nutritionInputs = screen.getAllByPlaceholderText('Nombre (ej: Calorías)')
        expect(nutritionInputs).toHaveLength(2) // Default 1 + Added 1

        // Remove nutrition
        const removeBtns = screen.getAllByTestId(/remove-nutrition-/)
        await user.click(removeBtns[0]) // Remove the added one (index 1)

        // Should be back to 1
        expect(screen.getAllByPlaceholderText('Nombre (ej: Calorías)')).toHaveLength(1)

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('validates steps', async () => {
        const user = userEvent.setup()
        render(<RecipeForm />)

        // Fill required fields but leave steps empty
        await user.type(screen.getByPlaceholderText('Ej: Pastel de Fresas Kawaii'), 'Test Recipe')
        await user.type(screen.getByPlaceholderText('Cuéntanos un poco sobre esta delicia...'), 'Description')
        await user.type(screen.getByPlaceholderText('Ingrediente'), 'Flour')

        // Fill other required fields
        const inputs = screen.getAllByRole('spinbutton')
        await user.type(inputs[0], '10')
        await user.type(inputs[1], '20')
        await user.type(inputs[2], '4')

        await user.click(screen.getByText('Guardar Receta'))

        await waitFor(() => {
            expect(mockShowSnackbar).toHaveBeenCalledWith('Agrega al menos un paso de preparación', 'error')
        })

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('handles keep_image logic', async () => {
        const user = userEvent.setup()
        const initialData: any = {
            id: 'recipe1',
            title: 'Title',
            description: 'Description',
            user_id: 'user1',
            image_url: 'http://example.com/img.jpg',
            recipe_ingredients: [{ name: 'i', amount: '1', optional: false }],
            recipe_steps: [{ content: 's' }],
            recipe_nutrition: [],
            prep_time_minutes: 10,
            cook_time_minutes: 20,
            servings: 4
        }

        render(<RecipeForm initialData={initialData} isEditing={true} />)

        // Submit without changing image
        mockUpdateRecipe.mockResolvedValue({ recipeId: 'recipe1' })

        await user.click(screen.getByText('Actualizar Receta'))

        await waitFor(() => {
            expect(mockUpdateRecipe).toHaveBeenCalled()
        })

        // Check if keep_image was sent
        const formData = mockUpdateRecipe.mock.calls[0][1] as FormData
        expect(formData.get('keep_image')).toBe('true')

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('prevents submission if not logged in', async () => {
        ; (useAuth as jest.Mock).mockReturnValue({ firebaseUser: null, profile: null })
        const user = userEvent.setup()
        render(<RecipeForm />)

        // Fill form to pass HTML validation
        await user.type(screen.getByPlaceholderText('Ej: Pastel de Fresas Kawaii'), 'Title')
        await user.type(screen.getByPlaceholderText('Cuéntanos un poco sobre esta delicia...'), 'Desc')
        const inputs = screen.getAllByRole('spinbutton')
        await user.type(inputs[0], '10')
        await user.type(inputs[1], '20')
        await user.type(inputs[2], '4')
        await user.type(screen.getByPlaceholderText('Ingrediente'), 'Ing')
        await user.type(screen.getByPlaceholderText('Paso 1'), 'Step')

        await user.click(screen.getByText('Guardar Receta'))

        expect(mockShowSnackbar).toHaveBeenCalledWith('Debes iniciar sesión para crear una receta', 'error')

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('handles image selection cancellation', async () => {
        const user = userEvent.setup()
        const { container } = render(<RecipeForm />)
        const input = container.querySelector('input[type="file"]') as HTMLInputElement

        // Select file
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })
        await user.upload(input, file)
        expect(input.files?.[0]).toBe(file)

        // Cancel selection (upload empty)
        await user.upload(input, [])
        // Note: input.files might not change in jsdom if empty, but we can check if state remains or changes
        // Actually, standard behavior is it doesn't clear. 
        // But if we trigger change event with no files:
        fireEvent.change(input, { target: { files: [] } })

        // Should not crash and keep previous or clear? 
        // Code says: if (e.target.files && e.target.files[0])
        // So if no files, it does nothing.

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('validates empty strings in arrays', async () => {
        const user = userEvent.setup()
        render(<RecipeForm />)

        // Fill required
        await user.type(screen.getByPlaceholderText('Ej: Pastel de Fresas Kawaii'), 'Title')
        await user.type(screen.getByPlaceholderText('Cuéntanos un poco sobre esta delicia...'), 'Desc')
        const inputs = screen.getAllByRole('spinbutton')
        await user.type(inputs[0], '10')
        await user.type(inputs[1], '20')
        await user.type(inputs[2], '4')

        // Add empty ingredient (default is empty)
        // Add empty step (default is empty)

        await user.click(screen.getByText('Guardar Receta'))

        await waitFor(() => {
            expect(mockShowSnackbar).toHaveBeenCalledWith('Agrega al menos un ingrediente', 'error')
        })

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('cleans up preview url on unmount', async () => {
        const { unmount } = render(<RecipeForm />)
        // Set preview url
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })
        const input = document.querySelector('input[type="file"]') as HTMLInputElement
        fireEvent.change(input, { target: { files: [file] } })

        unmount()
        expect(global.URL.revokeObjectURL).toHaveBeenCalled()

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('handles image compression and upload', async () => {
        const user = userEvent.setup()
        render(<RecipeForm />)

        // Fill form
        await user.type(screen.getByPlaceholderText('Ej: Pastel de Fresas Kawaii'), 'Title')
        await user.type(screen.getByPlaceholderText('Cuéntanos un poco sobre esta delicia...'), 'Desc')
        const inputs = screen.getAllByRole('spinbutton')
        await user.type(inputs[0], '10')
        await user.type(inputs[1], '20')
        await user.type(inputs[2], '4')
        await user.type(screen.getByPlaceholderText('Ingrediente'), 'Ing')
        await user.type(screen.getByPlaceholderText('Paso 1'), 'Step')

        // Upload image
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })
        const input = document.querySelector('input[type="file"]') as HTMLInputElement
        await user.upload(input, file)

            // Mock compression
            ; (compressImage as jest.Mock).mockResolvedValue(new File(['compressed'], 'compressed.jpg', { type: 'image/jpeg' }))
        mockCreateRecipe.mockResolvedValue({ recipeId: 'new-id' })

        await user.click(screen.getByText('Guardar Receta'))

        await waitFor(() => {
            expect(compressImage).toHaveBeenCalledWith(file)
            expect(mockCreateRecipe).toHaveBeenCalled()
        })

        const formData = mockCreateRecipe.mock.calls[0][0] as FormData
        expect(formData.get('file')).not.toBeNull()

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('handles cancel button', async () => {
        const user = userEvent.setup()
        render(<RecipeForm />)
        const cancelBtn = screen.getByText('Cancelar')
        await user.click(cancelBtn)
        expect(mockRouter.back).toHaveBeenCalled()

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('handles difficulty change', async () => {
        const user = userEvent.setup()
        render(<RecipeForm />)
        const difficultySelect = screen.getByRole('combobox')
        await user.selectOptions(difficultySelect, 'hard')
        expect(difficultySelect).toHaveValue('hard')

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('handles nutrition inputs', async () => {
        const user = userEvent.setup()
        render(<RecipeForm />)
        const addNutBtn = screen.getAllByText('Agregar')[2]
        await user.click(addNutBtn)
        const nutNameInput = screen.getAllByPlaceholderText('Nombre (ej: Calorías)')[1]
        await user.type(nutNameInput, 'Protein')
        const nutAmountInput = screen.getAllByPlaceholderText('Valor')[1]
        await user.type(nutAmountInput, '10g')
        const nutUnitInput = screen.getAllByPlaceholderText('Unidad')[1]
        await user.type(nutUnitInput, 'g')

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('handles step removal via button', async () => {
        const user = userEvent.setup()
        render(<RecipeForm />)
        const addStepBtn = screen.getAllByText('Agregar')[1]
        await user.click(addStepBtn)
        // Should have 2 steps
        expect(screen.getAllByPlaceholderText(/Paso \d/)).toHaveLength(2)

        const removeStepBtns = screen.getAllByTestId(/remove-step-/)
        await user.click(removeStepBtns[0])

        // Should have 1 step
        expect(screen.getAllByPlaceholderText(/Paso \d/)).toHaveLength(1)

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('handles null data from fetchTags', async () => {
        // Mock supabase response with null data
        const mockSelect = jest.fn().mockResolvedValue({ data: null })
            ; (supabase.from as jest.Mock).mockReturnValue({
                select: mockSelect
            })

        render(<RecipeForm />)

        await waitFor(() => {
            expect(mockSelect).toHaveBeenCalled()
        })
        // Should not crash
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('does not revoke object url if preview is null or same as initial', async () => {
        const initialData: any = {
            image_url: 'http://example.com/img.jpg'
        }
        const { unmount } = render(<RecipeForm initialData={initialData} isEditing={true} />)

        // Unmount with initial image (should not revoke)
        unmount()
        expect(global.URL.revokeObjectURL).not.toHaveBeenCalled()

        // Rerender with null preview (simulate clear)
        // We need to mount again to test another case or use rerender
        render(<RecipeForm />)
        // Default preview is null. Unmount.
        // But we need to capture the unmount of the NEW component.

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('does not revoke object url if preview is null', async () => {
        const { unmount } = render(<RecipeForm />)
        unmount()
        expect(global.URL.revokeObjectURL).not.toHaveBeenCalled()

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('filters out empty nutrition fields on submission', async () => {
        const user = userEvent.setup()
        render(<RecipeForm />)

        // Fill required fields
        await user.type(screen.getByPlaceholderText('Ej: Pastel de Fresas Kawaii'), 'Test Recipe')
        await user.type(screen.getByPlaceholderText('Cuéntanos un poco sobre esta delicia...'), 'Description')
        const inputs = screen.getAllByRole('spinbutton')
        await user.type(inputs[0], '10')
        await user.type(inputs[1], '20')
        await user.type(inputs[2], '4')
        await user.type(screen.getByPlaceholderText('Ingrediente'), 'Flour')
        await user.type(screen.getByPlaceholderText('Paso 1'), 'Mix')

        // Add nutrition but leave empty
        const addNutBtn = screen.getAllByText('Agregar')[2]
        await user.click(addNutBtn)
        // Now we have default empty nutrition + added empty nutrition

        mockCreateRecipe.mockResolvedValue({ recipeId: 'new-id' })
        await user.click(screen.getByText('Guardar Receta'))

        await waitFor(() => {
            expect(mockCreateRecipe).toHaveBeenCalled()
        })

        const formData = mockCreateRecipe.mock.calls[0][0] as FormData
        const nutrition = JSON.parse(formData.get('nutrition') as string)
        expect(nutrition).toHaveLength(0) // Should be empty array as all were empty

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('handles submission error without message', async () => {
        const user = userEvent.setup()
        render(<RecipeForm />)

        // Fill required fields
        await user.type(screen.getByPlaceholderText('Ej: Pastel de Fresas Kawaii'), 'Test Recipe')
        await user.type(screen.getByPlaceholderText('Cuéntanos un poco sobre esta delicia...'), 'Description')
        const inputs = screen.getAllByRole('spinbutton')
        await user.type(inputs[0], '10')
        await user.type(inputs[1], '20')
        await user.type(inputs[2], '4')
        await user.type(screen.getByPlaceholderText('Ingrediente'), 'Flour')
        await user.type(screen.getByPlaceholderText('Paso 1'), 'Mix')

        mockCreateRecipe.mockRejectedValue({}) // Error object without message
        await user.click(screen.getByText('Guardar Receta'))

        await waitFor(() => {
            expect(mockShowSnackbar).toHaveBeenCalledWith('Error al guardar la receta. Por favor intenta de nuevo.', 'error')
        })

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('uses default difficulty if undefined in initialData', async () => {
        const initialData: any = {
            id: 'recipe1',
            title: 'Title',
            description: 'Desc',
            user_id: 'user1',
            // difficulty missing
        }
        render(<RecipeForm initialData={initialData} isEditing={true} />)
        const select = screen.getByRole('combobox') as HTMLSelectElement
        expect(select.value).toBe('medium')

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('handles undefined amount and unit in initialData', async () => {
        const initialData: any = {
            id: 'recipe1',
            title: 'Title',
            description: 'Desc',
            user_id: 'user1',
            recipe_ingredients: [{ name: 'Ing', amount: null, optional: false }], // amount null
            recipe_nutrition: [{ name: 'Nut', amount: '10', unit: null }], // unit null
            recipe_steps: [],
            tags: []
        }
        render(<RecipeForm initialData={initialData} isEditing={true} />)

        // Check if inputs have empty string (or default)
        const amountInput = screen.getByPlaceholderText('Cant.') as HTMLInputElement
        expect(amountInput.value).toBe('') // amount was null, so ""

        const unitInput = screen.getByPlaceholderText('Unidad') as HTMLInputElement
        expect(unitInput.value).toBe('') // unit was null, so ""

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('handles image change with no files', async () => {
        const { container } = render(<RecipeForm />)
        const input = container.querySelector('input[type="file"]') as HTMLInputElement

        // Trigger change with no files
        fireEvent.change(input, { target: { files: null } })

        // Should not crash, preview should remain null (or whatever it was)
        expect(screen.queryByAltText('Preview')).not.toBeInTheDocument()

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('filters out partial nutrition fields', async () => {
        const user = userEvent.setup()
        render(<RecipeForm />)

        // Fill required
        await user.type(screen.getByPlaceholderText('Ej: Pastel de Fresas Kawaii'), 'Title')
        await user.type(screen.getByPlaceholderText('Cuéntanos un poco sobre esta delicia...'), 'Desc')
        const inputs = screen.getAllByRole('spinbutton')
        await user.type(inputs[0], '10')
        await user.type(inputs[1], '20')
        await user.type(inputs[2], '4')
        await user.type(screen.getByPlaceholderText('Ingrediente'), 'Flour')
        await user.type(screen.getByPlaceholderText('Paso 1'), 'Mix')

        // Add nutrition with only name
        const addNutBtn = screen.getAllByText('Agregar')[2]
        await user.click(addNutBtn)
        const nutName = screen.getAllByPlaceholderText('Nombre (ej: Calorías)')[1]
        await user.type(nutName, 'Only Name')

        // Add nutrition with only amount
        await user.click(addNutBtn)
        const nutAmount = screen.getAllByPlaceholderText('Valor')[2]
        await user.type(nutAmount, '100')

        mockCreateRecipe.mockResolvedValue({ recipeId: 'new-id' })
        await user.click(screen.getByText('Guardar Receta'))

        await waitFor(() => {
            expect(mockCreateRecipe).toHaveBeenCalled()
        })

        const formData = mockCreateRecipe.mock.calls[0][0] as FormData
        const nutrition = JSON.parse(formData.get('nutrition') as string)
        expect(nutrition).toHaveLength(0)

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
        await new Promise(resolve => setTimeout(resolve, 0))
    })
})

