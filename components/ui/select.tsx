'use client'


import * as Select from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { forwardRef } from 'react'
import clsx from 'clsx'


export const SelectRoot = Select.Root
export const SelectValue = Select.Value


export const SelectTrigger = forwardRef(
    ({ className, children, ...props }: any, ref: any) => (
        <Select.Trigger
            ref={ref}
            className={clsx(
                'flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm',
                'bg-background focus:outline-none focus:ring-2 focus:ring-primary',
                className
            )}
            {...props}
        >
            {children}
            <Select.Icon>
                <ChevronDown className="h-4 w-4 opacity-50" />
            </Select.Icon>
        </Select.Trigger>
    )
)


export const SelectContent = ({ children }: any) => (
    <Select.Portal>
        <Select.Content
            className="z-50 min-w-[200px] overflow-hidden rounded-md border bg-popover shadow"
            position="popper"
        >
            <Select.Viewport className="p-1">{children}</Select.Viewport>
        </Select.Content>
    </Select.Portal>
)


export const SelectItem = forwardRef(
    ({ className, children, ...props }: any, ref: any) => (
        <Select.Item
            ref={ref}
            className={clsx(
                'relative flex cursor-pointer select-none items-center rounded px-2 py-1.5 text-sm',
                'focus:bg-accent focus:outline-none',
                className
            )}
            {...props}
        >
            <Select.ItemText>{children}</Select.ItemText>
            <Select.ItemIndicator className="absolute right-2">
                <Check className="h-4 w-4" />
            </Select.ItemIndicator>
        </Select.Item>
    )
)