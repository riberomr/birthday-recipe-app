import { renderHook, waitFor } from '@testing-library/react';
import { useDeleteComment } from '../useDeleteComment';
import { wrapper, createQueryClient } from '@/lib/test-utils';
import { deleteComment } from '@/lib/api/comments';
import { QueryClientProvider } from '@tanstack/react-query';

jest.mock('@/lib/api/comments');

describe('useDeleteComment', () => {
    it('deletes comment and invalidates queries', async () => {
        const queryClient = createQueryClient();
        const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');
        (deleteComment as jest.Mock).mockResolvedValue(undefined);

        const { result } = renderHook(() => useDeleteComment('recipe1'), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            ),
        });

        result.current.mutate('comment1');

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(deleteComment).toHaveBeenCalledWith('comment1');
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['comments', 'recipe1'] });
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['recipes', 'recipe1'] });
    });
});
