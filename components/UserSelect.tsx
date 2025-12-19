'use client'


import {
    SelectRoot,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select'
import { SupabaseUser } from '@/types';


export function UserSelect({ users, value, onChange, className }: { users: SupabaseUser[]; value: string; onChange: (value: string) => void; className?: string }) {
    return (
        <SelectRoot value={value} onValueChange={onChange} >
            <SelectTrigger className={className}>
                <SelectValue placeholder="Filtrar por un usuario" />
            </SelectTrigger>


            <SelectContent className="max-h-[200px] overflow-y-auto">
                <SelectItem value="all">
                    <div className="flex items-center gap-2">
                        <span>Todos</span>
                    </div>
                </SelectItem>
                {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                            <img
                                src={user.avatar_url}
                                alt={user.full_name}
                                className="h-5 w-5 rounded-full"
                            />
                            <span>{user.full_name}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </SelectRoot>
    )
}