import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '../theme-provider'

// Mock next-themes
jest.mock('next-themes', () => ({
    ThemeProvider: ({ children, ...props }: any) => <div data-testid="theme-provider" {...props}>{children}</div>
}))

describe('ThemeProvider', () => {
    it('renders children', () => {
        render(
            <ThemeProvider attribute="class" defaultTheme="dark">
                <div data-testid="child">Child</div>
            </ThemeProvider>
        )

        expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
        expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('passes props to NextThemesProvider', () => {
        render(
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                <div>Child</div>
            </ThemeProvider>
        )

        const provider = screen.getByTestId('theme-provider')
        expect(provider).toHaveAttribute('attribute', 'class')
        expect(provider).toHaveAttribute('defaultTheme', 'dark')
    })
})
