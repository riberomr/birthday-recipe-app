import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
    SelectRoot,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from './select'

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}

// ✅ REQUIRED for Radix Select
Element.prototype.scrollIntoView = jest.fn()

// Pointer capture mocks (Radix needs these)
Element.prototype.setPointerCapture = jest.fn()
Element.prototype.releasePointerCapture = jest.fn()
Element.prototype.hasPointerCapture = jest.fn()

describe('Select', () => {
    it('renders correctly', () => {
        render(
            <SelectRoot>
                <SelectTrigger aria-label="Select option">
                    <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                </SelectContent>
            </SelectRoot>
        )

        expect(screen.getByText('Select an option')).toBeInTheDocument()
    })

    it('opens and selects an item', async () => {
        const user = userEvent.setup()

        render(
            <SelectRoot>
                <SelectTrigger aria-label="Select option">
                    <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                </SelectContent>
            </SelectRoot>
        )

        const trigger = screen.getByRole('combobox')

        await user.click(trigger)

        const option1 = await screen.findByText('Option 1')
        expect(option1).toBeInTheDocument()

        await user.click(option1)

        expect(screen.getByText('Option 1')).toBeInTheDocument()
    })
})
