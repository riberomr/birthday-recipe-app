import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/lib/api/users';
import { Profile } from '@/types';

export function useProfile(firebaseUid: string | undefined) {
    return useQuery<Profile | null>({
        queryKey: ['profile', firebaseUid],
        queryFn: () => getUserProfile(firebaseUid!),
        enabled: !!firebaseUid,
    });
}
