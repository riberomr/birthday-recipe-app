import { renderHook, waitFor } from '@testing-library/react';
import { useCreateComment } from '../useCreateComment';
import { wrapper, createQueryClient } from '@/lib/test-utils';
import { postComment } from '@/lib/api/comments';
import { QueryClientProvider } from '@tanstack/react-query';

jest.mock('@/lib/api/comments');

describe('useCreateComment', () => {
    it('creates comment and invalidates queries', async () => {
        const queryClient = createQueryClient();
        const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');
        (postComment as jest.Mock).mockResolvedValue({ id: '1', content: 'Test' });

        const { result } = renderHook(() => useCreateComment(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            ),
        });

        const formData = new FormData();
        formData.append('recipe_id', 'recipe1');

        result.current.mutate(formData);

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(postComment).toHaveBeenCalledWith(formData);
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['comments', 'recipe1'] });
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['recipes', 'recipe1'] });
    });
});
