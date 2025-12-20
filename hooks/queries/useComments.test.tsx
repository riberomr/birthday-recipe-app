import { renderHook, waitFor } from '@testing-library/react';
import { useComments } from './useComments';
import { wrapper } from '@/lib/test-utils';
import { getComments } from '@/lib/api/comments';

jest.mock('@/lib/api/comments');

describe('useComments', () => {
    it('fetches comments successfully', async () => {
        const mockData = { comments: [{ id: '1', content: 'Test' }], total: 1 };
        (getComments as jest.Mock).mockResolvedValue(mockData);

        const { result } = renderHook(() => useComments('recipe1'), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(mockData);
        expect(getComments).toHaveBeenCalledWith('recipe1', 1, 5);
    });
});
