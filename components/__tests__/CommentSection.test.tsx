import { render, screen } from '@testing-library/react';
import { CommentSection } from '../CommentSection';
import { useComments } from '@/hooks/queries/useComments';

jest.mock('@/hooks/queries/useComments');
jest.mock('../CommentList', () => ({
    CommentList: () => <div>Mock CommentList</div>,
}));
jest.mock('../CommentForm', () => ({
    CommentForm: () => <div>Mock CommentForm</div>,
}));

describe('CommentSection', () => {
    it('renders header with count', () => {
        (useComments as jest.Mock).mockReturnValue({
            data: { total: 5 },
        });

        render(<CommentSection recipeId="recipe1" recipeOwnerId="owner1" />);
        expect(screen.getByText('Comentarios (5)')).toBeInTheDocument();
        expect(screen.getByText('Mock CommentList')).toBeInTheDocument();
        expect(screen.getByText('Mock CommentForm')).toBeInTheDocument();
    });
});
