import { render, screen, fireEvent } from '@testing-library/react'
import { ModalProvider, useModalContext } from './ModalContext'

const TestComponent = () => {
    const { openModal, closeModal, isModalOpen, getModalData } = useModalContext()

    return (
        <div>
            <button onClick={() => openModal('test-modal', { foo: 'bar' })}>Open</button>
            <button onClick={() => closeModal('test-modal')}>Close</button>
            <div data-testid="status">{isModalOpen('test-modal') ? 'Open' : 'Closed'}</div>
            <div data-testid="data">{JSON.stringify(getModalData('test-modal'))}</div>
        </div>
    )
}

describe('ModalContext', () => {
    it('provides modal state', () => {
        render(
            <ModalProvider>
                <TestComponent />
            </ModalProvider>
        )

        expect(screen.getByTestId('status')).toHaveTextContent('Closed')

        fireEvent.click(screen.getByText('Open'))
        expect(screen.getByTestId('status')).toHaveTextContent('Open')
        expect(screen.getByTestId('data')).toHaveTextContent('{"foo":"bar"}')

        fireEvent.click(screen.getByText('Close'))
        expect(screen.getByTestId('status')).toHaveTextContent('Closed')
        expect(screen.getByTestId('data')).toBeEmptyDOMElement()
    })

    it('throws error when used outside provider', () => {
        // Suppress console.error for this test as React logs errors for uncaught exceptions in effects
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })

        expect(() => {
            render(<TestComponent />)
        }).toThrow('useModalContext must be used within a ModalProvider')

        consoleSpy.mockRestore()
    })
})
