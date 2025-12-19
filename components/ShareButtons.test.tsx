import { render, screen, fireEvent } from '@testing-library/react'
import { ShareButtons } from './ShareButtons'
import { useSnackbar } from '@/components/ui/Snackbar'

// Mock dependencies
jest.mock('@/components/ui/Snackbar', () => ({
    useSnackbar: jest.fn(),
}))

Object.assign(navigator, {
    clipboard: {
        writeText: jest.fn(),
    },
})

Object.assign(window, {
    open: jest.fn(),
})

describe('ShareButtons', () => {
    const mockShowSnackbar = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useSnackbar as jest.Mock).mockReturnValue({ showSnackbar: mockShowSnackbar })
    })

    it('renders correctly', () => {
        render(<ShareButtons title="Recipe Title" />)
        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('opens share menu on click', () => {
        render(<ShareButtons title="Recipe Title" />)
        fireEvent.click(screen.getByRole('button'))
        expect(screen.getByText('Copiar enlace')).toBeInTheDocument()
        expect(screen.getByText('WhatsApp')).toBeInTheDocument()
    })

    it('copies link to clipboard', () => {
        render(<ShareButtons title="Recipe Title" />)
        fireEvent.click(screen.getByRole('button'))
        fireEvent.click(screen.getByText('Copiar enlace'))

        expect(navigator.clipboard.writeText).toHaveBeenCalled()
        expect(mockShowSnackbar).toHaveBeenCalledWith('Enlace copiado al portapapeles', 'success')
    })

    it('opens WhatsApp share', () => {
        render(<ShareButtons title="Recipe Title" />)
        fireEvent.click(screen.getByRole('button'))
        fireEvent.click(screen.getByText('WhatsApp'))

        expect(window.open).toHaveBeenCalled()
    })
})
