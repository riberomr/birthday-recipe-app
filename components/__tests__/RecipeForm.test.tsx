import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RecipeForm } from '../RecipeForm'
import { useAuth } from '@/components/AuthContext'
import { useSnackbar } from '@/components/ui/Snackbar'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { compressImage } from '@/lib/utils'
import { useCreateRecipe } from '@/hooks/mutations/useCreateRecipe'
import { useUpdateRecipe } from '@/hooks/mutations/useUpdateRecipe'

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
jest.mock('@/hooks/mutations/useCreateRecipe')
jest.mock('@/hooks/mutations/useUpdateRecipe')

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:url')
global.URL.revokeObjectURL = jest.fn()

describe('RecipeForm', () => {
    const mockRouter = { push: jest.fn(), back: jest.fn(), refresh: jest.fn() }
    const mockShowSnackbar = jest.fn()
    const mockUser = { id: 'user1', displayName: 'User 1' }
    const mockCreateMutateAsync = jest.fn()
    const mockUpdateMutateAsync = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        mockCreateMutateAsync.mockReset()
        mockUpdateMutateAsync.mockReset()

            ; (useAuth as jest.Mock).mockReturnValue({ firebaseUser: mockUser, profile: { id: 'user1' } })
            ; (useSnackbar as jest.Mock).mockReturnValue({ showSnackbar: mockShowSnackbar })
            ; (useRouter as jest.Mock).mockReturnValue(mockRouter)
            ; (useCreateRecipe as jest.Mock).mockReturnValue({
                mutateAsync: mockCreateMutateAsync,
                isPending: false,
            })
            ; (useUpdateRecipe as jest.Mock).mockReturnValue({
                mutateAsync: mockUpdateMutateAsync,
                isPending: false,
            })
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
    })

    it('redirects if user is not owner in edit mode', async () => {
        ; (useAuth as jest.Mock).mockReturnValue({ firebaseUser: mockUser, profile: { id: 'otherUser' } })
        const initialData: any = { user_id: 'user1', id: 'recipe1' }

        render(<RecipeForm initialData={initialData} isEditing={true} />)

        expect(mockRouter.push).toHaveBeenCalledWith('/')
        expect(mockShowSnackbar).toHaveBeenCalledWith(expect.stringContaining('No tienes permiso'), 'error')
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
        mockCreateMutateAsync.mockResolvedValue({ recipeId: 'new-id' })

        await user.click(screen.getByText('Guardar Receta'))

        await waitFor(() => {
            expect(mockCreateMutateAsync).toHaveBeenCalled()
        })
        expect(mockRouter.push).toHaveBeenCalledWith('/recipes/new-id')
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

        // Mock update success
        mockUpdateMutateAsync.mockResolvedValue({ recipeId: 'recipe1' })

        await user.click(screen.getByText('Actualizar Receta'))

        await waitFor(() => {
            expect(mockUpdateMutateAsync).toHaveBeenCalled()
        })
        expect(mockRouter.push).toHaveBeenCalledWith('/recipes/recipe1')
    })

    it('handles submission error', async () => {
        const user = userEvent.setup()
        render(<RecipeForm />)

        // Fill required fields
        await user.type(screen.getByPlaceholderText('Ej: Pastel de Fresas Kawaii'), 'Test Recipe')
        await user.type(screen.getByPlaceholderText('Cuéntanos un poco sobre esta delicia...'), 'Description')

        const inputs = screen.getAllByRole('spinbutton')
        await user.type(inputs[0], '10')
        await user.type(inputs[1], '20')
        await user.type(inputs[2], '4')

        const ingInput = await screen.findByPlaceholderText('Ingrediente')
        await user.type(ingInput, 'Flour')

        const stepInput = await screen.findByPlaceholderText(/Paso \d+/)
        await user.type(stepInput, 'Mix')

        // Mock create failure
        mockCreateMutateAsync.mockRejectedValue(new Error('Submission failed'))

        await user.click(screen.getByText('Guardar Receta'))

        await waitFor(() => {
            expect(mockShowSnackbar).toHaveBeenCalledWith(expect.stringContaining('Submission failed'), 'error')
        })
    })

    it('shows loading state during submission', () => {
        ; (useCreateRecipe as jest.Mock).mockReturnValue({
            mutateAsync: mockCreateMutateAsync,
            isPending: true,
        })

        render(<RecipeForm />)
        expect(screen.getByText('Guardando...')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Guardando/i })).toBeDisabled()
    })

    it('filters out partial nutrition fields', async () => {
        const user = userEvent.setup()
        render(<RecipeForm />)

        // Fill required
        await user.type(screen.getByPlaceholderText('Ej: Pastel de Fresas Kawaii'), 'Title')
        await user.type(screen.getByPlaceholderText('Cuéntanos un poco sobre esta delicia...'), 'Description')
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

        mockCreateMutateAsync.mockResolvedValue({ recipeId: 'new-id' })
        await user.click(screen.getByText('Guardar Receta'))

        await waitFor(() => {
            expect(mockCreateMutateAsync).toHaveBeenCalled()
        })

        const formData = mockCreateMutateAsync.mock.calls[0][0] as FormData
        const nutrition = JSON.parse(formData.get('nutrition') as string)
        expect(nutrition).toHaveLength(0)

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
    })


    it('removes ingredient, step and nutrition', async () => {
        const user = userEvent.setup()
        render(<RecipeForm />)

        // Add items first
        await user.click(screen.getAllByText('Agregar')[0]) // Ingredient
        await user.click(screen.getAllByText('Agregar')[1]) // Step
        await user.click(screen.getAllByText('Agregar')[2]) // Nutrition

        // Remove them
        const removeBtns = screen.getAllByRole('button').filter(btn => btn.querySelector('svg.lucide-trash-2'))
        // We have initial 1 ing, 1 step, 1 nut. Added 1 each. Total 2 each.
        // removeBtns should have 6 buttons? No, trash icon is used for remove.
        // Let's use test ids if available or just click the buttons.
        // The component has data-testid={`remove-ingredient-${idx}`} etc.

        await user.click(screen.getByTestId('remove-ingredient-1'))
        expect(screen.queryByTestId('remove-ingredient-1')).not.toBeInTheDocument()

        await user.click(screen.getByTestId('remove-step-1'))
        expect(screen.queryByTestId('remove-step-1')).not.toBeInTheDocument()

        await user.click(screen.getByTestId('remove-nutrition-1'))
        expect(screen.queryByTestId('remove-nutrition-1')).not.toBeInTheDocument()
    })

    it('handles image upload and clear', async () => {
        const user = userEvent.setup()
        render(<RecipeForm />)

        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })
        const input = screen.getByLabelText(/Haz clic para subir/i)

        await user.upload(input, file)

        expect(screen.getByAltText('Preview')).toBeInTheDocument()
        expect(global.URL.createObjectURL).toHaveBeenCalled()

        await user.click(screen.getByText('Eliminar Imagen'))
        expect(screen.queryByAltText('Preview')).not.toBeInTheDocument()
        expect(global.URL.revokeObjectURL).toHaveBeenCalled()
    })

    it('shows validation error for empty steps', async () => {
        const user = userEvent.setup()
        render(<RecipeForm />)

        await user.type(screen.getByPlaceholderText(/Ej: Pastel/i), 'Receta sin pasos')
        await user.type(screen.getByPlaceholderText(/Cuéntanos/i), 'Descripción')
        await user.type(screen.getByPlaceholderText('Ingrediente'), 'Harina')

        // Vaciamos el paso que viene por defecto
        const stepInput = screen.getByPlaceholderText(/Paso 1/i)
        await user.clear(stepInput)

        const form = screen.getByPlaceholderText(/Ej: Pastel/i).closest('form')
        fireEvent.submit(form!)

        await waitFor(() => {
            expect(mockShowSnackbar).toHaveBeenCalledWith('Agrega al menos un paso de preparación', 'error')
        })
    })

    it('handles submission with image', async () => {
        const user = userEvent.setup()
        const testFile = new File(['hello'], 'test.png', { type: 'image/png' });

        (compressImage as jest.Mock).mockResolvedValue(testFile)
        mockCreateMutateAsync.mockResolvedValue({ recipeId: 'new-id' })

        render(<RecipeForm />)

        // Llenar datos mínimos
        await user.type(screen.getByPlaceholderText(/Ej: Pastel/i), 'Receta con Imagen')
        await user.type(screen.getByPlaceholderText(/Cuéntanos/i), 'Descripción')
        await user.type(screen.getByPlaceholderText('Ingrediente'), 'Chocolate')
        await user.type(screen.getByPlaceholderText(/Paso 1/i), 'Paso 1')

        // Subir imagen
        const input = screen.getByLabelText(/Haz clic para subir/i, { selector: 'input' })
        await user.upload(input, testFile)

        // Forzamos el submit para evitar que el botón 'disabled' por isPending o validación nos bloquee
        const form = screen.getByPlaceholderText(/Ej: Pastel/i).closest('form')
        fireEvent.submit(form!)

        await waitFor(() => {
            expect(compressImage).toHaveBeenCalled()
            expect(mockCreateMutateAsync).toHaveBeenCalled()
            expect(mockRouter.push).toHaveBeenCalledWith('/recipes/new-id')
        }, { timeout: 3000 })
    })

    it('shows error if user is not authenticated on submit', async () => {
        // Simulamos que no hay usuario
        (useAuth as jest.Mock).mockReturnValue({ firebaseUser: null, profile: null })
        const { container } = render(<RecipeForm />)

        const form = container.querySelector('form')
        fireEvent.submit(form!)

        await waitFor(() => {
            expect(mockShowSnackbar).toHaveBeenCalledWith("Debes iniciar sesión para crear una receta", "error")
        })
    })

    it('shows validation error for empty ingredients using manual submit', async () => {
        const { container } = render(<RecipeForm />)

        // Llenamos campos para pasar el HTML validation pero vaciamos el estado de ingredientes
        await userEvent.type(screen.getByPlaceholderText(/Ej: Pastel/i), 'Test')

        // Vaciamos el input de ingrediente inicial
        const ingInput = screen.getByPlaceholderText('Ingrediente')
        await userEvent.clear(ingInput)

        const form = container.querySelector('form')
        fireEvent.submit(form!)

        await waitFor(() => {
            expect(mockShowSnackbar).toHaveBeenCalledWith("Agrega al menos un ingrediente", "error")
        })
    })

    it('handles image retention in edit mode (keep_image)', async () => {
        const initialData: any = {
            id: 'recipe1',
            user_id: 'user1',
            image_url: 'http://existing-image.jpg',
            recipe_ingredients: [{ name: 'Test', amount: '1' }],
            recipe_steps: [{ content: 'Step' }]
        }

        const { container } = render(<RecipeForm initialData={initialData} isEditing={true} />)
        mockUpdateMutateAsync.mockResolvedValue({ recipeId: 'recipe1' })

        // No cambiamos la imagen, simplemente enviamos
        const form = container.querySelector('form')
        fireEvent.submit(form!)

        await waitFor(() => {
            const formData = mockUpdateMutateAsync.mock.calls[0][0].formData as FormData
            expect(formData.get('keep_image')).toBe('true')
        })
    })

    it('updates difficulty and nutrition unit on change', async () => {
        const user = userEvent.setup()
        render(<RecipeForm />)

        // Cambiar dificultad
        const select = screen.getByRole('combobox')
        await user.selectOptions(select, 'hard')
        expect(select).toHaveValue('hard')

        // Cambiar unidad de nutrición
        const unitInput = screen.getByPlaceholderText('Unidad')
        await user.type(unitInput, 'gr')
        expect(unitInput).toHaveValue('gr')
    })

    it('calls router.back when clicking Cancel button', async () => {
        const user = userEvent.setup()
        render(<RecipeForm />)

        const cancelBtn = screen.getByRole('button', { name: /Cancelar/i })
        await user.click(cancelBtn)

        expect(mockRouter.back).toHaveBeenCalled()
    })
})

