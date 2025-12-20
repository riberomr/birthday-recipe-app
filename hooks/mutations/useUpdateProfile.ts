import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserProfile } from '@/lib/api/users';
import { Profile } from '@/types';

export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ firebaseUid, updates }: { firebaseUid: string; updates: Partial<Profile> }) =>
            updateUserProfile(firebaseUid, updates),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['profile', variables.firebaseUid] });
        },
    });
}
