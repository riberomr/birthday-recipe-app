import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuGroup,
    DropdownMenuPortal,
} from '../dropdown-menu'

// Mocking ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}

// Mocking pointer capture methods
Element.prototype.setPointerCapture = jest.fn()
Element.prototype.releasePointerCapture = jest.fn()
Element.prototype.hasPointerCapture = jest.fn()

describe('DropdownMenu', () => {
    it('renders correctly', async () => {
        const user = userEvent.setup()

        render(
            <DropdownMenu>
                <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Billing</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )

        const trigger = screen.getByText('Open Menu')
        expect(trigger).toBeInTheDocument()

        await user.click(trigger)

        expect(screen.getByText('My Account')).toBeInTheDocument()
        expect(screen.getByText('Profile')).toBeInTheDocument()
        expect(screen.getByText('Billing')).toBeInTheDocument()
    })

    it('handles checkbox items', async () => {
        const user = userEvent.setup()

        render(
            <DropdownMenu>
                <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuCheckboxItem checked>Checked Item</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={false}>Unchecked Item</DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )

        await user.click(screen.getByText('Open Menu'))

        expect(screen.getByText('Checked Item')).toBeInTheDocument()
        expect(screen.getByText('Unchecked Item')).toBeInTheDocument()
    })

    it('handles radio items', async () => {
        const user = userEvent.setup()

        render(
            <DropdownMenu>
                <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuRadioGroup value="top">
                        <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        )

        await user.click(screen.getByText('Open Menu'))

        expect(screen.getByText('Top')).toBeInTheDocument()
        expect(screen.getByText('Bottom')).toBeInTheDocument()
    })

    it('renders shortcuts', async () => {
        const user = userEvent.setup()
        render(
            <DropdownMenu>
                <DropdownMenuTrigger>Open</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem>
                        New Tab <DropdownMenuShortcut>⌘T</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
        await user.click(screen.getByText('Open'))
        expect(screen.getByText('⌘T')).toBeInTheDocument()
    })

    it('renders submenus', async () => {
        const user = userEvent.setup()
        render(
            <DropdownMenu>
                <DropdownMenuTrigger>Open</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem>Sub Item</DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                </DropdownMenuContent>
            </DropdownMenu>
        )
        await user.click(screen.getByText('Open'))
        expect(screen.getByText('More')).toBeInTheDocument()

        // Hover or click subtrigger to open submenu
        await user.click(screen.getByText('More'))
        expect(screen.getByText('Sub Item')).toBeInTheDocument()
    })

    it('renders groups and portals', () => {
        render(
            <DropdownMenu>
                <DropdownMenuTrigger>Open</DropdownMenuTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            <DropdownMenuItem>Group Item</DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenuPortal>
            </DropdownMenu>
        )
        // Just verify it renders without crashing, as Portal might be hard to test in JSDOM without specific setup
        // But we can check if the trigger is there
        expect(screen.getByText('Open')).toBeInTheDocument()
    })

    it('renders with inset', async () => {
        const user = userEvent.setup()
        render(
            <DropdownMenu>
                <DropdownMenuTrigger>Open</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel inset>Label</DropdownMenuLabel>
                    <DropdownMenuItem inset>Item</DropdownMenuItem>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger inset>Sub</DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem>Sub Item</DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                </DropdownMenuContent>
            </DropdownMenu>
        )
        await user.click(screen.getByText('Open'))

        const label = screen.getByText('Label')
        expect(label).toHaveClass('pl-8')

        const item = screen.getByText('Item')
        expect(item).toHaveClass('pl-8')

        const sub = screen.getByText('Sub')
        expect(sub).toHaveClass('pl-8')
    })
})
