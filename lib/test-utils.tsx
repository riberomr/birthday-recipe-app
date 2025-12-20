import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';

export const createQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
        mutations: {
            retry: false,
        }
    },
});

export function renderWithClient(ui: ReactNode) {
    const queryClient = createQueryClient();
    const { rerender, ...result } = render(
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
    return {
        ...result,
        rerender: (rerenderUi: ReactNode) =>
            rerender(
                <QueryClientProvider client={queryClient}>{rerenderUi}</QueryClientProvider>
            ),
    };
}

export function wrapper({ children }: { children: ReactNode }) {
    const queryClient = createQueryClient();
    return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
}
