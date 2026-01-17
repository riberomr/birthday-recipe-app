import { renderHook, waitFor } from '@testing-library/react';
import { useUserRating } from '../useUserRating';
import { getUserRating } from '@/lib/api/ratings';
import { createQueryClient } from '@/lib/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';

jest.mock('@/lib/api/ratings');

describe('useUserRating', () => {
    let queryClient: any;
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        process.env = { ...originalEnv };
        process.env.NEXT_PUBLIC_ENABLE_USER_RATING = 'true';
        queryClient = createQueryClient();
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    it('fetches user rating when enabled', async () => {
        (getUserRating as jest.Mock).mockResolvedValue(5);

        const { result } = renderHook(() => useUserRating('recipe-1', 'user-1'), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toBe(5);
        expect(getUserRating).toHaveBeenCalledWith('recipe-1');
    });

    it('is disabled when flag is false', () => {
        process.env.NEXT_PUBLIC_ENABLE_USER_RATING = 'false';
        const { result } = renderHook(() => useUserRating('recipe-1', 'user-1'), { wrapper });

        expect(result.current.fetchStatus).toBe('idle');
        expect(result.current.status).toBe('pending');
        expect(getUserRating).not.toHaveBeenCalled();
    });

    it('does not fetch if userId is missing', () => {
        const { result } = renderHook(() => useUserRating('recipe-1', undefined), { wrapper });
        expect(result.current.isPending).toBe(true);
        expect(result.current.fetchStatus).toBe('idle');
        expect(getUserRating).not.toHaveBeenCalled();
    });
});
