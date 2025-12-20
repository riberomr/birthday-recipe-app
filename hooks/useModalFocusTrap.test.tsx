
import { render, fireEvent } from "@testing-library/react"
import { useModalFocusTrap } from "./useModalFocusTrap"
import { useRef } from "react"
import { Delete } from "lucide-react"

function HookTestWrapper({
    isOpen,
    onClose,
}: {
    isOpen: boolean
    onClose: () => void
}) {
    const modalRef = useRef<HTMLDivElement>(null)
    useModalFocusTrap({ modalRef, isOpen, onClose })

    return (
        <div>
            <div ref={modalRef} data-testid="modal" >
                <button>Cancel </button>
                < button > Delete </button>
            </div>
        </div>
    )
}

describe("useModalFocusTrap with HookTestWrapper", () => {
    afterEach(() => {
        document.body.innerHTML = ""
    })

    it("calls onClose when Escape key is pressed", () => {
        const onClose = jest.fn()
        render(<HookTestWrapper isOpen onClose={onClose} />)

        fireEvent.keyDown(document, { key: "Escape" })
        expect(onClose).toHaveBeenCalled()
    })

    it("does not call onClose when modal is closed", () => {
        const onClose = jest.fn()
        render(<HookTestWrapper isOpen={false} onClose={onClose} />)

        fireEvent.keyDown(document, { key: "Escape" })
        expect(onClose).not.toHaveBeenCalled()
    })

    it("focuses the first element on open", () => {
        const onClose = jest.fn()
        render(<HookTestWrapper isOpen onClose={onClose} />)

        const cancelButton = document.querySelector("button")!
        expect(document.activeElement).toBe(cancelButton)
    })

    it("loops focus forward with Tab when last element is focused", () => {
        const onClose = jest.fn()
        render(<HookTestWrapper isOpen onClose={onClose} />)

        const buttons = document.querySelectorAll("button")
        const cancelButton = buttons[0]
        const deleteButton = buttons[1]

        deleteButton.focus()
        const modal = document.querySelector("[data-testid=modal]")!
        fireEvent.keyDown(modal, { key: "Tab" })
        expect(document.activeElement).toBe(cancelButton)
    })

    it("loops focus backward with Shift+Tab when first element is focused", () => {
        const onClose = jest.fn()
        render(<HookTestWrapper isOpen onClose={onClose} />)

        const buttons = document.querySelectorAll("button")
        const cancelButton = buttons[0]
        const deleteButton = buttons[1]

        cancelButton.focus()
        const modal = document.querySelector("[data-testid=modal]")!
        fireEvent.keyDown(modal, { key: "Tab", shiftKey: true })
        expect(document.activeElement).toBe(deleteButton)
    })

    it("ignores non-Tab keys in the focus trap", () => {
        const onClose = jest.fn()
        render(<HookTestWrapper isOpen onClose={onClose} />)

        const cancelButton = document.querySelector("button")!
        cancelButton.focus()
        const modal = document.querySelector("[data-testid=modal]")!
        fireEvent.keyDown(modal, { key: "Enter" })
        expect(document.activeElement).toBe(cancelButton)
    })

    it("does not throw if no focusable elements exist", () => {
        const onClose = jest.fn()
        render(
            <div>
                <HookTestWrapper isOpen={true} onClose={onClose} />
                <div data-testid="empty-modal" />
            </div>
        )
        const emptyModal = document.querySelector("[data-testid=empty-modal]")!
        expect(() => fireEvent.keyDown(emptyModal, { key: "Tab" })).not.toThrow()
    })
})