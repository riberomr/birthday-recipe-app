import { render } from '@testing-library/react'
import { RecipeCardSkeleton } from '../RecipeCardSkeleton'

describe('RecipeCardSkeleton', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('renders correctly', () => {
        const { container } = render(<RecipeCardSkeleton />)
        expect(container.firstChild).toHaveClass('card-base')
    })

    it('renders rating skeleton when enabled', () => {
        process.env.NEXT_PUBLIC_ENABLE_AVERAGE_RATING = 'true';
        const { container } = render(<RecipeCardSkeleton />);
        
        // Use a more specific selector to find the rating skeleton part
        // The rating skeleton is in the last div of CardFooter
        const footer = container.querySelector('.flex.flex-col.items-start.gap-2');
        const ratingSkeleton = footer?.querySelector('.mt-1.flex.justify-between');
        
        expect(ratingSkeleton).toBeInTheDocument();
    });

    it('hides rating skeleton when disabled', () => {
        process.env.NEXT_PUBLIC_ENABLE_AVERAGE_RATING = 'false';
        const { container } = render(<RecipeCardSkeleton />);
        
        const footer = container.querySelector('.flex.flex-col.items-start.gap-2');
        const ratingSkeleton = footer?.querySelector('.mt-1.flex.justify-between');
        
        expect(ratingSkeleton).not.toBeInTheDocument();
    });
})
