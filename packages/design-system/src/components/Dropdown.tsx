'use client';

import {
    type FocusEvent,
    type MouseEvent as ReactMouseEvent,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
    type KeyboardEvent as ReactKeyboardEvent,
    type ReactNode,
    type SelectHTMLAttributes,
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
    if (typeof value === 'string') {
        return value;
    }

    if (typeof defaultValue === 'string') {
        return defaultValue;
    }

    if (placeholder) {
        return '';
    }

    return options.find((option) => !option.disabled)?.value ?? '';
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
        getInitialValue({
            value,
            defaultValue,
            placeholder,
            options,
        }),
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
        (option) => option.value === currentValue,
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
            if (!rootRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('pointerdown', handlePointerDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
        };
    }, []);

    const activeDescendant =
        isOpen && normalizedOptions[highlightedIndex]
            ? `${selectId}-option-${highlightedIndex}`
            : undefined;

    function getNextEnabledIndex(startIndex: number, direction: 1 | -1) {
        if (normalizedOptions.length === 0) {
            return -1;
        }

        let index = startIndex;

        for (let step = 0; step < normalizedOptions.length; step += 1) {
            index =
                (index + direction + normalizedOptions.length) %
                normalizedOptions.length;

            if (!normalizedOptions[index]?.disabled) {
                return index;
            }
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
        if (!isControlled) {
            setInternalValue(nextValue);
        }

        emitChange(nextValue);
        setIsOpen(false);
        buttonRef.current?.focus();
    }

    function openListbox() {
        if (disabled || normalizedOptions.length === 0) {
            return;
        }

        setIsOpen(true);
    }

    function closeListbox() {
        setIsOpen(false);
    }

    function handleTriggerKeyDown(
        event: ReactKeyboardEvent<HTMLButtonElement>,
    ) {
        onKeyDown?.(event as unknown as ReactKeyboardEvent<HTMLSelectElement>);

        if (event.defaultPrevented || disabled) {
            return;
        }

        switch (event.key) {
            case 'ArrowDown': {
                event.preventDefault();

                if (!isOpen) {
                    openListbox();
                    const nextIndex = getNextEnabledIndex(selectedIndex, 1);

                    if (nextIndex >= 0) {
                        setHighlightedIndex(nextIndex);
                    }

                    return;
                }

                const nextIndex = getNextEnabledIndex(highlightedIndex, 1);

                if (nextIndex >= 0) {
                    setHighlightedIndex(nextIndex);
                }

                return;
            }
            case 'ArrowUp': {
                event.preventDefault();

                if (!isOpen) {
                    openListbox();
                    const nextIndex = getNextEnabledIndex(
                        selectedIndex >= 0 ? selectedIndex : 0,
                        -1,
                    );

                    if (nextIndex >= 0) {
                        setHighlightedIndex(nextIndex);
                    }

                    return;
                }

                const nextIndex = getNextEnabledIndex(highlightedIndex, -1);

                if (nextIndex >= 0) {
                    setHighlightedIndex(nextIndex);
                }

                return;
            }
            case 'Enter':
            case ' ': {
                event.preventDefault();

                if (!isOpen) {
                    openListbox();
                    return;
                }

                const option = normalizedOptions[highlightedIndex];

                if (option && !option.disabled) {
                    selectValue(option.value);
                }

                return;
            }
            case 'Escape': {
                if (isOpen) {
                    event.preventDefault();
                    closeListbox();
                }

                return;
            }
            default:
                return;
        }
    }

    return (
        <div className="flex w-full flex-col gap-1.5">
            {label && (
                <label
                    id={labelId}
                    htmlFor={selectId}
                    className="text-sm font-semibold text-gray-700"
                >
                    {label}
                </label>
            )}
            <div ref={rootRef} className="relative block">
                <div className={cn('relative block', controlClassName)}>
                    {leadingAdornment && (
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
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
                            'peer h-11 w-full rounded-xl border border-gray-200 bg-white pr-10 text-left text-sm text-gray-900 outline-none transition-colors duration-150 hover:border-gray-300 focus-visible:border-brand-500 focus-visible:ring-4 focus-visible:ring-brand-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400',
                            leadingAdornment ? 'pl-11' : 'px-4',
                            error
                                ? 'border-red-300 hover:border-red-400 focus-visible:border-red-400 focus-visible:ring-red-100'
                                : undefined,
                            className,
                        )}
                        onClick={(event) => {
                            onClick?.(
                                event as unknown as ReactMouseEvent<HTMLSelectElement>,
                            );

                            if (event.defaultPrevented) {
                                return;
                            }

                            if (isOpen) {
                                closeListbox();
                                return;
                            }

                            openListbox();
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
                            'pointer-events-none absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-gray-400 transition-transform duration-150 peer-disabled:text-gray-300',
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
                    <div className="absolute left-0 right-0 top-[calc(100%+0.375rem)] z-20 overflow-hidden rounded-xl border border-gray-200 bg-white p-1">
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
                                                'flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-gray-700 outline-none transition-colors duration-100',
                                                option.disabled
                                                    ? 'cursor-not-allowed text-gray-300'
                                                    : 'hover:bg-gray-50 focus-visible:bg-gray-50',
                                                isHighlighted &&
                                                    !option.disabled &&
                                                    'bg-gray-50 text-gray-900',
                                                isSelected &&
                                                    !option.disabled &&
                                                    'bg-brand-50 text-brand-700',
                                            )}
                                            onMouseEnter={() => {
                                                if (!option.disabled) {
                                                    setHighlightedIndex(index);
                                                }
                                            }}
                                            onClick={() => {
                                                if (!option.disabled) {
                                                    selectValue(option.value);
                                                }
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
                    className="text-xs font-medium text-red-500"
                >
                    {error}
                </span>
            ) : (
                hint && (
                    <span id={helperTextId} className="text-xs text-gray-500">
                        {hint}
                    </span>
                )
            )}
        </div>
    );
}
