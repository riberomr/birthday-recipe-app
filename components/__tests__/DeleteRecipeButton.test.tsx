import { render, screen, fireEvent } from "@testing-library/react"
import { DeleteRecipeButton } from "../DeleteRecipeButton"
import { useAuth } from "@/components/AuthContext"
import { useModal } from "@/hooks/ui/useModal"
import { deleteRecipe } from "@/lib/api/recipes"
import { useRouter } from "next/navigation"
import { useSnackbar } from "@/components/ui/Snackbar"

// Mock dependencies
jest.mock("@/components/AuthContext")
jest.mock("@/hooks/ui/useModal")
jest.mock("@/lib/api/recipes")
jest.mock("next/navigation", () => ({
    useRouter: jest.fn()
}))
jest.mock("@/components/ui/Snackbar")

describe("DeleteRecipeButton", () => {
    const mockOpen = jest.fn()
    const mockClose = jest.fn()
    const mockPush = jest.fn()
    const mockShowSnackbar = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useAuth as jest.Mock).mockReturnValue({
                firebaseUser: { uid: "user123" },
                profile: { id: "user123" }
            })
            ; (useModal as jest.Mock).mockReturnValue({
                open: mockOpen,
                close: mockClose
            })
            ; (useRouter as jest.Mock).mockReturnValue({
                push: mockPush
            })
            ; (useSnackbar as jest.Mock).mockReturnValue({
                showSnackbar: mockShowSnackbar
            })
    })

    it("renders button when user is owner", () => {
        render(<DeleteRecipeButton recipeId="recipe123" ownerId="user123" />)
        expect(screen.getByRole("button", { name: /eliminar receta/i })).toBeInTheDocument()
    })

    it("does not render when user is not owner", () => {
        ; (useAuth as jest.Mock).mockReturnValue({
            firebaseUser: { uid: "otherUser" },
            profile: { id: "otherUser" }
        })
        const { container } = render(<DeleteRecipeButton recipeId="recipe123" ownerId="user123" />)
        expect(container).toBeEmptyDOMElement()
    })

    it("does not render when not logged in", () => {
        ; (useAuth as jest.Mock).mockReturnValue({
            firebaseUser: null,
            profile: null
        })
        const { container } = render(<DeleteRecipeButton recipeId="recipe123" ownerId="user123" />)
        expect(container).toBeEmptyDOMElement()
    })

    it("opens modal on click", () => {
        render(<DeleteRecipeButton recipeId="recipe123" ownerId="user123" />)
        fireEvent.click(screen.getByRole("button", { name: /eliminar receta/i }))
        expect(mockOpen).toHaveBeenCalledWith(expect.objectContaining({
            title: "¿Eliminar receta?",
            description: expect.stringContaining("papelera")
        }))
    })

    it("handles delete confirmation success", async () => {
        (deleteRecipe as jest.Mock).mockResolvedValue({ success: true })

        render(<DeleteRecipeButton recipeId="recipe123" ownerId="user123" />)
        fireEvent.click(screen.getByRole("button", { name: /eliminar receta/i }))

        // Simulate modal confirm callback
        const modalConfig = mockOpen.mock.calls[0][0]
        await modalConfig.onConfirm()

        expect(deleteRecipe).toHaveBeenCalledWith("recipe123")
        expect(mockShowSnackbar).toHaveBeenCalledWith("Receta eliminada correctamente", "success")
        expect(mockPush).toHaveBeenCalledWith("/recipes")
        expect(mockClose).toHaveBeenCalled()
    })

    it("handles delete confirmation error", async () => {
        (deleteRecipe as jest.Mock).mockRejectedValue(new Error("Failed"))

        render(<DeleteRecipeButton recipeId="recipe123" ownerId="user123" />)
        fireEvent.click(screen.getByRole("button", { name: /eliminar receta/i }))

        // Simulate modal confirm callback
        const modalConfig = mockOpen.mock.calls[0][0]
        await modalConfig.onConfirm()

        expect(deleteRecipe).toHaveBeenCalledWith("recipe123")
        expect(mockShowSnackbar).toHaveBeenCalledWith("Error al eliminar la receta", "error")
        expect(mockPush).not.toHaveBeenCalled()
        expect(mockClose).not.toHaveBeenCalled()
    })
})
