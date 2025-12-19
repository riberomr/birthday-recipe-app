import { renderHook, act } from '@testing-library/react'
import { useModal } from './useModal'
import { ModalProvider } from '@/lib/contexts/ModalContext'

describe('useModal', () => {
    it('handles open and close', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ModalProvider>{children}</ModalProvider>
        )

        const { result } = renderHook(() => useModal('test-modal'), { wrapper })

        expect(result.current.isOpen).toBe(false)

        act(() => {
            result.current.open({ id: 1 })
        })

        expect(result.current.isOpen).toBe(true)
        expect(result.current.data).toEqual({ id: 1 })

        act(() => {
            result.current.close()
        })

        expect(result.current.isOpen).toBe(false)
        expect(result.current.data).toBeUndefined()
    })
})
