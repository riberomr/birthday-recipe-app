import { renderHook, waitFor } from '@testing-library/react';
import { useCreateRecipe } from '../useCreateRecipe';
import { createRecipe } from '@/lib/api/recipes';
import { createQueryClient } from '@/lib/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';

jest.mock('@/lib/api/recipes');

describe('useCreateRecipe', () => {
    let queryClient: any;

    beforeEach(() => {
        jest.clearAllMocks();
        queryClient = createQueryClient();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    it('creates recipe successfully and invalidates cache', async () => {
        (createRecipe as jest.Mock).mockResolvedValue({ recipeId: '1' });
        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

        const { result } = renderHook(() => useCreateRecipe(), { wrapper });

        const formData = new FormData();
        formData.append('title', 'New Recipe');

        await result.current.mutateAsync(formData);

        expect(createRecipe).toHaveBeenCalledWith(formData);
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['recipes'] });
    });
});
