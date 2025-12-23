import { useQuery } from '@tanstack/react-query';
import { Profile } from '@/types';
import { initProfile } from '@/lib/api/users';
import { User } from 'firebase/auth';


export function useInitProfile(user: User | null) {
    return useQuery<Profile | null>({
        queryKey: ['init-profile', user?.uid],
        queryFn: () => initProfile(user),
        enabled: !!user
    })
}
