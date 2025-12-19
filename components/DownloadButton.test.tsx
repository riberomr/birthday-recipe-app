import { render, screen, fireEvent } from '@testing-library/react'
import { DownloadButton } from './DownloadButton'

describe('DownloadButton', () => {
    it('renders correctly', () => {
        render(<DownloadButton />)
        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('calls window.print on click', () => {
        const printSpy = jest.spyOn(window, 'print').mockImplementation(() => { })
        render(<DownloadButton />)
        fireEvent.click(screen.getByRole('button'))
        expect(printSpy).toHaveBeenCalled()
        printSpy.mockRestore()
    })
})
