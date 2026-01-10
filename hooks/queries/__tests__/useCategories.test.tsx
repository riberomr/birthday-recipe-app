import { renderHook } from "@testing-library/react"
import { useCategories } from "../useCategories"
import { useQuery } from "@tanstack/react-query"
import { getCategories } from "@/lib/api/recipes"

// Mock dependencies
jest.mock("@tanstack/react-query", () => ({
    useQuery: jest.fn(),
}))

jest.mock("@/lib/api/recipes", () => ({
    getCategories: jest.fn(),
}))

describe("useCategories", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should call useQuery with correct parameters", () => {
        const mockUseQuery = useQuery as jest.Mock

        renderHook(() => useCategories())

        expect(mockUseQuery).toHaveBeenCalledWith({
            queryKey: ["categories"],
            queryFn: getCategories,
        })
    })

    it("should return categories when fetch is successful", async () => {
        const mockCategories = [
            { id: 1, name: "Dessert" },
            { id: 2, name: "Dinner" }
        ]

        const mockUseQuery = useQuery as jest.Mock
        mockUseQuery.mockReturnValue({
            data: mockCategories,
            isLoading: false,
            error: null
        })

        const { result } = renderHook(() => useCategories())

        expect(result.current.data).toEqual(mockCategories)
        expect(result.current.isLoading).toBe(false)
    })

    it("should handle loading state", () => {
        const mockUseQuery = useQuery as jest.Mock
        mockUseQuery.mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null
        })

        const { result } = renderHook(() => useCategories())

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toBeUndefined()
    })

    it("should handle error state", () => {
        const mockError = new Error("Failed to fetch")
        const mockUseQuery = useQuery as jest.Mock
        mockUseQuery.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: mockError
        })

        const { result } = renderHook(() => useCategories())

        expect(result.current.error).toEqual(mockError)
    })
})
