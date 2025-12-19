import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider, useSnackbar } from './Snackbar'

const TestComponent = () => {
    const { showSnackbar } = useSnackbar()
    return (
        <div>
            <button onClick={() => showSnackbar('Success message', 'success')}>Show Success</button>
            <button onClick={() => showSnackbar('Error message', 'error')}>Show Error</button>
            <button onClick={() => showSnackbar('Info message', 'info')}>Show Info</button>
        </div>
    )
}

describe('Snackbar', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('shows snackbar with message and type', async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

        render(
            <SnackbarProvider>
                <TestComponent />
            </SnackbarProvider>
        )

        await user.click(screen.getByText('Show Success'))

        const snackbar = await screen.findByText('Success message')
        expect(snackbar).toBeInTheDocument()
        expect(snackbar.closest('div')).toHaveClass('bg-green-500')
    })

    it('auto-hides after 3 seconds', async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

        render(
            <SnackbarProvider>
                <TestComponent />
            </SnackbarProvider>
        )

        await user.click(screen.getByText('Show Info'))

        expect(await screen.findByText('Info message')).toBeInTheDocument()

        act(() => {
            jest.advanceTimersByTime(3000)
        })

        expect(screen.queryByText('Info message')).not.toBeInTheDocument()
    })

    it('can be closed manually', async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

        render(
            <SnackbarProvider>
                <TestComponent />
            </SnackbarProvider>
        )

        await user.click(screen.getByText('Show Error'))

        const snackbar = await screen.findByText('Error message')
        expect(snackbar).toBeInTheDocument()

        const closeButton = screen.getByRole('button', { name: '' }) // X icon button usually has no text
        await user.click(closeButton)

        expect(screen.queryByText('Error message')).not.toBeInTheDocument()
    })

    it('throws error if used outside provider', () => {
        // Suppress console.error for this test as React will log the error
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })

        expect(() => render(<TestComponent />)).toThrow('useSnackbar must be used within a SnackbarProvider')

        consoleSpy.mockRestore()
    })
})
