import { render, screen } from '@testing-library/react'
import CommunityPhotosCarousel from '../CommunityRecipesPhotoCarrousel'

// Mock Swiper
jest.mock('swiper/react', () => ({
    Swiper: ({ children }: any) => <div data-testid="swiper">{children}</div>,
    SwiperSlide: ({ children }: any) => <div data-testid="swiper-slide">{children}</div>,
}))

jest.mock('swiper/modules', () => ({
    Navigation: jest.fn(),
    Pagination: jest.fn(),
}))

describe('CommunityRecipesPhotoCarrousel', () => {
    const mockPhotos = [
        { id: '1', image_url: 'http://example.com/photo1.jpg' },
        { id: '2', image_url: 'http://example.com/photo2.jpg' },
    ]

    it('renders correctly with photos', () => {
        render(<CommunityPhotosCarousel photos={mockPhotos} />)

        expect(screen.getByTestId('swiper')).toBeInTheDocument()
        expect(screen.getAllByTestId('swiper-slide')).toHaveLength(2)
    })

    it('renders nothing when no photos', () => {
        const { container } = render(<CommunityPhotosCarousel photos={[]} />)
        expect(container).toBeEmptyDOMElement()
    })

    it('uses image_url as key when id is not present', () => {
        const photosWithoutId: any = [
            { image_url: 'https://example.com/photo1.jpg' },
            { image_url: 'https://example.com/photo2.jpg' }
        ]

        render(<CommunityPhotosCarousel photos={photosWithoutId} />)

        // Verify the component renders with the photos (key is used internally by React)
        expect(screen.getByTestId('swiper')).toBeInTheDocument()
        expect(screen.getAllByTestId('swiper-slide')).toHaveLength(2)
    })
})
