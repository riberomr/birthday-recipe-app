import { render, screen, fireEvent } from '@testing-library/react'
import { PrintButton } from './PrintButton'

describe('PrintButton', () => {
    it('renders correctly', () => {
        render(<PrintButton />)
        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('calls window.print on click', () => {
        const printSpy = jest.spyOn(window, 'print').mockImplementation(() => { })
        render(<PrintButton />)
        fireEvent.click(screen.getByRole('button'))
        expect(printSpy).toHaveBeenCalled()
        printSpy.mockRestore()
    })
})
