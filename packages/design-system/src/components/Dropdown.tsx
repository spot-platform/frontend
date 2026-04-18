'use client';

import {
    type ChangeEvent,
    type FocusEvent,
    type KeyboardEvent as ReactKeyboardEvent,
    type MouseEvent as ReactMouseEvent,
    type ReactNode,
    type SelectHTMLAttributes,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from 'react';
import { cn } from '../lib/cn';

export interface DropdownOption {
    label: string;
    value: string;
    disabled?: boolean;
}

export interface DropdownProps extends Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    'size'
> {
    label?: string;
    hint?: string;
    error?: string;
    options: DropdownOption[];
    placeholder?: string;
    leadingAdornment?: ReactNode;
    controlClassName?: string;
    indicatorClassName?: string;
}

function getInitialValue({
    value,
    defaultValue,
    placeholder,
    options,
}: {
    value?: string | readonly string[] | number;
    defaultValue?: string | readonly string[] | number;
    placeholder?: string;
    options: DropdownOption[];
}) {
    if (typeof value === 'string') return value;
    if (typeof defaultValue === 'string') return defaultValue;
    if (placeholder) return '';
    return options.find((o) => !o.disabled)?.value ?? '';
}

export function Dropdown({
    className,
    label,
    hint,
    error,
    options,
    placeholder,
    leadingAdornment,
    controlClassName,
    indicatorClassName,
    id,
    value,
    defaultValue,
    disabled,
    onChange,
    onBlur,
    onFocus,
    onKeyDown,
    onClick,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    autoFocus,
    form,
    name,
    required,
    tabIndex,
    title,
}: DropdownProps) {
    const fallbackId = useId();
    const selectId = id ?? fallbackId;
    const labelId = `${selectId}-label`;
    const helperTextId = `${selectId}-description`;
    const listboxId = `${selectId}-listbox`;
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(() =>
        getInitialValue({ value, defaultValue, placeholder, options }),
    );
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const currentValue = isControlled
        ? typeof value === 'string'
            ? value
            : ''
        : internalValue;

    const normalizedOptions = useMemo(
        () =>
            placeholder
                ? [
                      { label: placeholder, value: '', disabled: false },
                      ...options,
                  ]
                : options,
        [options, placeholder],
    );

    const selectedIndex = normalizedOptions.findIndex(
        (o) => o.value === currentValue,
    );
    const selectedOption = normalizedOptions[selectedIndex];
    const [highlightedIndex, setHighlightedIndex] = useState(
        Math.max(selectedIndex, 0),
    );

    useEffect(() => {
        setHighlightedIndex(Math.max(selectedIndex, 0));
    }, [selectedIndex]);

    useEffect(() => {
        function handlePointerDown(event: PointerEvent) {
            if (!rootRef.current?.contains(event.target as Node))
                setIsOpen(false);
        }
        document.addEventListener('pointerdown', handlePointerDown);
        return () =>
            document.removeEventListener('pointerdown', handlePointerDown);
    }, []);

    const activeDescendant =
        isOpen && normalizedOptions[highlightedIndex]
            ? `${selectId}-option-${highlightedIndex}`
            : undefined;

    function getNextEnabledIndex(startIndex: number, direction: 1 | -1) {
        let index = startIndex;
        for (let step = 0; step < normalizedOptions.length; step++) {
            index =
                (index + direction + normalizedOptions.length) %
                normalizedOptions.length;
            if (!normalizedOptions[index]?.disabled) return index;
        }
        return -1;
    }

    function emitChange(nextValue: string) {
        const syntheticTarget = {
            value: nextValue,
            name,
            id: selectId,
        } as HTMLSelectElement;
        onChange?.({
            target: syntheticTarget,
            currentTarget: syntheticTarget,
        } as ChangeEvent<HTMLSelectElement>);
    }

    function selectValue(nextValue: string) {
        if (!isControlled) setInternalValue(nextValue);
        emitChange(nextValue);
        setIsOpen(false);
        buttonRef.current?.focus();
    }

    function handleTriggerKeyDown(
        event: ReactKeyboardEvent<HTMLButtonElement>,
    ) {
        onKeyDown?.(event as unknown as ReactKeyboardEvent<HTMLSelectElement>);
        if (event.defaultPrevented || disabled) return;

        switch (event.key) {
            case 'ArrowDown': {
                event.preventDefault();
                if (!isOpen) {
                    setIsOpen(true);
                    const next = getNextEnabledIndex(selectedIndex, 1);
                    if (next >= 0) setHighlightedIndex(next);
                    return;
                }
                const next = getNextEnabledIndex(highlightedIndex, 1);
                if (next >= 0) setHighlightedIndex(next);
                return;
            }
            case 'ArrowUp': {
                event.preventDefault();
                if (!isOpen) {
                    setIsOpen(true);
                    const next = getNextEnabledIndex(
                        selectedIndex >= 0 ? selectedIndex : 0,
                        -1,
                    );
                    if (next >= 0) setHighlightedIndex(next);
                    return;
                }
                const next = getNextEnabledIndex(highlightedIndex, -1);
                if (next >= 0) setHighlightedIndex(next);
                return;
            }
            case 'Enter':
            case ' ': {
                event.preventDefault();
                if (!isOpen) {
                    setIsOpen(true);
                    return;
                }
                const option = normalizedOptions[highlightedIndex];
                if (option && !option.disabled) selectValue(option.value);
                return;
            }
            case 'Escape': {
                if (isOpen) {
                    event.preventDefault();
                    setIsOpen(false);
                }
                return;
            }
        }
    }

    return (
        <div className="flex w-full flex-col gap-1.5">
            {label && (
                <label
                    id={labelId}
                    htmlFor={selectId}
                    className="text-sm font-medium text-foreground"
                >
                    {label}
                </label>
            )}
            <div ref={rootRef} className="relative block">
                <div className={cn('relative block', controlClassName)}>
                    {leadingAdornment && (
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {leadingAdornment}
                        </span>
                    )}
                    <input type="hidden" name={name} value={currentValue} />
                    <button
                        ref={buttonRef}
                        id={selectId}
                        type="button"
                        role="combobox"
                        aria-label={ariaLabel}
                        aria-labelledby={ariaLabelledBy}
                        aria-controls={listboxId}
                        aria-expanded={isOpen}
                        aria-haspopup="listbox"
                        aria-activedescendant={activeDescendant}
                        aria-describedby={
                            error || hint ? helperTextId : undefined
                        }
                        aria-invalid={error ? true : undefined}
                        aria-required={required ? true : undefined}
                        autoFocus={autoFocus}
                        disabled={disabled}
                        form={form}
                        tabIndex={tabIndex}
                        title={title}
                        className={cn(
                            'peer flex h-9 w-full items-center rounded-lg border bg-background pr-9 text-left text-sm text-foreground shadow-xs outline-none transition-colors hover:border-nav-inactive focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
                            leadingAdornment ? 'pl-10' : 'px-3',
                            error
                                ? 'border-destructive hover:border-destructive focus-visible:border-destructive focus-visible:ring-destructive-border'
                                : 'border-input',
                            className,
                        )}
                        onClick={(event) => {
                            onClick?.(
                                event as unknown as ReactMouseEvent<HTMLSelectElement>,
                            );
                            if (event.defaultPrevented) return;
                            setIsOpen((prev) => !prev);
                        }}
                        onFocus={(event) =>
                            onFocus?.(
                                event as unknown as FocusEvent<HTMLSelectElement>,
                            )
                        }
                        onBlur={(event) =>
                            onBlur?.(
                                event as unknown as FocusEvent<HTMLSelectElement>,
                            )
                        }
                        onKeyDown={handleTriggerKeyDown}
                    >
                        <span className="block truncate">
                            {selectedOption?.label ?? placeholder ?? ''}
                        </span>
                    </button>
                    <span
                        className={cn(
                            'pointer-events-none absolute right-2.5 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-muted-foreground transition-transform',
                            isOpen && 'rotate-180',
                            indicatorClassName,
                        )}
                    >
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 16 16"
                            fill="none"
                            className="h-4 w-4"
                        >
                            <path
                                d="M4 6.5L8 10L12 6.5"
                                stroke="currentColor"
                                strokeWidth="1.75"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </span>
                </div>
                {isOpen && (
                    <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-lg border border-border-soft bg-popover p-1 shadow-md">
                        <ul
                            id={listboxId}
                            role="listbox"
                            aria-labelledby={label ? labelId : undefined}
                            className="max-h-64 overflow-auto"
                        >
                            {normalizedOptions.map((option, index) => {
                                const isSelected =
                                    option.value === currentValue;
                                const isHighlighted =
                                    index === highlightedIndex;
                                return (
                                    <li
                                        key={`${option.value}-${index}`}
                                        id={`${selectId}-option-${index}`}
                                        role="option"
                                        aria-selected={isSelected}
                                        aria-disabled={
                                            option.disabled ? true : undefined
                                        }
                                        className="list-none"
                                    >
                                        <button
                                            type="button"
                                            disabled={option.disabled}
                                            className={cn(
                                                'flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-sm outline-none transition-colors',
                                                option.disabled
                                                    ? 'cursor-not-allowed text-muted-foreground/50'
                                                    : 'text-popover-foreground hover:bg-muted',
                                                isHighlighted &&
                                                    !option.disabled &&
                                                    'bg-muted',
                                                isSelected &&
                                                    !option.disabled &&
                                                    'bg-brand-50 text-brand-700',
                                            )}
                                            onMouseEnter={() => {
                                                if (!option.disabled)
                                                    setHighlightedIndex(index);
                                            }}
                                            onClick={() => {
                                                if (!option.disabled)
                                                    selectValue(option.value);
                                            }}
                                        >
                                            <span className="block truncate">
                                                {option.label}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
            {error ? (
                <span
                    id={helperTextId}
                    className="text-xs font-medium text-destructive"
                >
                    {error}
                </span>
            ) : (
                hint && (
                    <span
                        id={helperTextId}
                        className="text-xs text-muted-foreground"
                    >
                        {hint}
                    </span>
                )
            )}
        </div>
    );
}
