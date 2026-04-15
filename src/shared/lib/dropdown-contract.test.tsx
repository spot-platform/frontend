import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Dropdown } from '@frontend/design-system';

afterEach(() => {
    cleanup();
});

describe('Dropdown', () => {
    const options = [
        { label: '교육', value: 'education' },
        { label: '운동', value: 'fitness' },
    ];

    it('renders a custom combobox trigger, keeps className overrides, and exposes placeholder in the listbox', () => {
        render(
            <Dropdown
                label="카테고리"
                placeholder="카테고리를 선택해 주세요"
                options={options}
                className="px-0 pr-7"
                name="category"
            />,
        );

        const combobox = screen.getByRole('combobox');
        const hiddenInput = document.querySelector(
            'input[type="hidden"][name="category"]',
        ) as HTMLInputElement | null;

        expect(combobox.tagName).toBe('BUTTON');
        expect(combobox.className).toContain('px-0');
        expect(combobox.className).toContain('pr-7');
        expect(combobox.textContent).toContain('카테고리를 선택해 주세요');
        expect(hiddenInput?.value).toBe('');
        expect(screen.queryByRole('listbox')).toBeNull();

        fireEvent.click(combobox);

        expect(screen.getByRole('listbox')).toBeTruthy();
        expect(
            screen.getByRole('option', { name: '카테고리를 선택해 주세요' }),
        ).toBeTruthy();
    });

    it('renders error text instead of hint when error is present', () => {
        render(
            <Dropdown
                label="카테고리"
                hint="이 힌트는 숨겨져야 해요."
                error="카테고리를 선택해 주세요."
                options={options}
            />,
        );

        expect(screen.getByText('카테고리를 선택해 주세요.')).toBeTruthy();
        expect(screen.queryByText('이 힌트는 숨겨져야 해요.')).toBeNull();
    });

    it('connects descriptive text and invalid state accessibly', () => {
        render(
            <Dropdown
                id="category"
                label="카테고리"
                error="카테고리를 선택해 주세요."
                options={options}
            />,
        );

        const combobox = screen.getByRole('combobox');
        const error = screen.getByText('카테고리를 선택해 주세요.');

        expect(combobox.getAttribute('aria-invalid')).toBe('true');
        expect(combobox.getAttribute('aria-describedby')).toBe(
            'category-description',
        );
        expect(error.getAttribute('id')).toBe('category-description');
    });

    it('supports leading adornment and disabled trigger state', () => {
        render(
            <Dropdown
                label="카테고리"
                options={options}
                leadingAdornment={
                    <span data-testid="leading-adornment">A</span>
                }
                disabled
            />,
        );

        const combobox = screen.getByRole('combobox') as HTMLButtonElement;

        expect(screen.getByTestId('leading-adornment')).toBeTruthy();
        expect(combobox.className).toContain('pl-11');
        expect(combobox.disabled).toBe(true);
    });

    it('supports opt-in control and indicator styling hooks', () => {
        render(
            <Dropdown
                label="카테고리"
                options={options}
                controlClassName="rounded-full border-gray-300"
                indicatorClassName="text-gray-600"
            />,
        );

        const combobox = screen.getByRole('combobox');
        const controlShell = combobox.parentElement;
        const popupRoot = controlShell?.parentElement;

        expect(controlShell?.className).toContain('rounded-full');
        expect(controlShell?.className).toContain('border-gray-300');
        expect(popupRoot?.className).not.toContain('rounded-full');
        expect(popupRoot?.className).not.toContain('overflow-hidden');
        expect(controlShell?.lastElementChild?.className).toContain(
            'text-gray-600',
        );
    });

    it('supports keyboard selection, synthetic change events, escape, and outside click close', () => {
        const handleChange = vi.fn();

        render(
            <Dropdown
                label="카테고리"
                placeholder="카테고리를 선택해 주세요"
                options={options}
                onChange={(event) => handleChange(event.target.value)}
            />,
        );

        const combobox = screen.getByRole('combobox');

        fireEvent.keyDown(combobox, { key: 'ArrowDown' });

        expect(screen.getByRole('listbox')).toBeTruthy();

        fireEvent.keyDown(combobox, { key: 'Enter' });

        expect(handleChange).toHaveBeenCalledWith('education');
        expect(combobox.textContent).toContain('교육');
        expect(screen.queryByRole('listbox')).toBeNull();

        fireEvent.click(combobox);
        expect(screen.getByRole('listbox')).toBeTruthy();

        fireEvent.keyDown(combobox, { key: 'Escape' });
        expect(screen.queryByRole('listbox')).toBeNull();

        fireEvent.click(combobox);
        expect(screen.getByRole('listbox')).toBeTruthy();

        fireEvent.pointerDown(document.body);
        expect(screen.queryByRole('listbox')).toBeNull();
    });
});
