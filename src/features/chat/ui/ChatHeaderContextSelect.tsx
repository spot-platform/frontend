'use client';

import { Dropdown, type DropdownOption } from '@frontend/design-system';
import type { ChangeEventHandler } from 'react';

interface ChatHeaderContextSelectProps {
    value: string;
    onChange: ChangeEventHandler<HTMLSelectElement>;
    options: DropdownOption[];
    id?: string;
    name?: string;
    disabled?: boolean;
    ariaLabel?: string;
}

export function ChatHeaderContextSelect({
    value,
    onChange,
    options,
    id,
    name,
    disabled,
    ariaLabel = '채팅 컨텍스트 전환',
}: ChatHeaderContextSelectProps) {
    return (
        <Dropdown
            id={id}
            name={name}
            aria-label={ariaLabel}
            value={value}
            onChange={onChange}
            options={options}
            disabled={disabled}
            controlClassName="overflow-hidden rounded-full border border-border-soft bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] shadow-[0_8px_20px_-16px_rgba(15,23,42,0.4)] transition-[border-color,box-shadow,background-color] duration-200 hover:border-border-strong focus-within:border-border-strong focus-within:ring-4 focus-within:ring-border-soft"
            className="h-10 rounded-full border-transparent bg-transparent pl-4 pr-10 text-[15px] font-semibold tracking-[-0.02em] text-foreground shadow-none outline-none overflow-hidden text-ellipsis whitespace-nowrap hover:border-transparent hover:bg-transparent focus:border-transparent focus:ring-0 disabled:bg-transparent disabled:text-muted-foreground"
            indicatorClassName="right-3 text-muted-foreground peer-hover:text-text-secondary peer-focus-visible:text-text-secondary"
        />
    );
}
