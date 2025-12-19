import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from '../theme-toggle'
import { useTheme } from 'next-themes'

// Mock dependencies
jest.mock('next-themes', () => ({
    useTheme: jest.fn(),
}))

describe('ThemeToggle', () => {
    const mockSetTheme = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useTheme as jest.Mock).mockReturnValue({
                setTheme: mockSetTheme,
                theme: 'light',
            })
    })

    it('renders correctly', () => {
        render(<ThemeToggle />)
        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('toggles theme on click', () => {
        render(<ThemeToggle />)
        fireEvent.click(screen.getByRole('button'))
        expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })

    it('toggles back to light', () => {
        ; (useTheme as jest.Mock).mockReturnValue({
            setTheme: mockSetTheme,
            theme: 'dark',
        })
        render(<ThemeToggle />)
        fireEvent.click(screen.getByRole('button'))
        expect(mockSetTheme).toHaveBeenCalledWith('light')
    })
})
