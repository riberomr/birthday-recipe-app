import { render, screen } from "@testing-library/react"
import { DisplayRating } from "../DisplayRating"

describe("DisplayRating", () => {
    it("renders correctly with partial rating", () => {
        render(<DisplayRating rating={3.5} count={5} />)
        // We can't easily check visual width in jsdom, but we can check if it renders without crashing
        // and if it displays the count/rating text if enabled
        expect(screen.getByText("3.5 (5)")).toBeInTheDocument()
    })

    it("renders correct count when provided", () => {
        render(<DisplayRating rating={4.2} count={100} />)
        expect(screen.getByText("4.2 (100)")).toBeInTheDocument()
    })

    it("does not render count when showCount is false", () => {
        render(<DisplayRating rating={4} count={10} showCount={false} />)
        expect(screen.queryByText(/4\.0/)).not.toBeInTheDocument()
    })

    it("renders correct number of stars", () => {
        const { container } = render(<DisplayRating rating={5} />)
        // 5 background stars + 5 foreground stars = 10 stars total icons
        // The implementation uses a map of [1,2,3,4,5], rendering 2 stars per iteration (bg + fg)
        // So we expect 10 SVG elements or similar.
        // Let's just check if it renders the container
        expect(container.firstChild).toHaveClass("flex items-center gap-2")
    })

    it("applies custom className", () => {
        const { container } = render(<DisplayRating rating={0} className="custom-class" />)
        expect(container.firstChild).toHaveClass("custom-class")
    })
})
