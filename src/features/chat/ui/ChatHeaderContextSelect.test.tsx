import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ChatHeaderContextSelect } from './ChatHeaderContextSelect';

describe('ChatHeaderContextSelect', () => {
    const options = [
        { label: '개인 채팅', value: 'personal' },
        {
            label: '운동 크루 촬영 모임 with a very long label',
            value: 'spot-1',
        },
        { label: '브랜드 협업 스팟', value: 'spot-2' },
    ];

    it('keeps the combobox contract and forwards value changes through event.target.value', () => {
        const handleChange = vi.fn();

        function Harness() {
            const [value, setValue] = useState('spot-1');

            return (
                <ChatHeaderContextSelect
                    value={value}
                    onChange={(event) => {
                        handleChange(event.target.value);
                        setValue(event.target.value);
                    }}
                    options={options}
                />
            );
        }

        render(<Harness />);

        const combobox = screen.getByRole('combobox');
        const controlShell = combobox.parentElement;
        const popupRoot = controlShell?.parentElement;

        expect(combobox.tagName).toBe('BUTTON');
        expect(combobox.textContent).toContain(
            '운동 크루 촬영 모임 with a very long label',
        );
        expect(combobox.className).toContain('pr-10');
        expect(combobox.className).toContain('text-ellipsis');
        expect(controlShell?.className).toContain('rounded-full');
        expect(controlShell?.className).toContain('overflow-hidden');
        expect(controlShell?.className).toContain('border-border-soft');
        expect(popupRoot?.className).not.toContain('overflow-hidden');

        fireEvent.click(combobox);
        fireEvent.click(screen.getByText('브랜드 협업 스팟'));

        expect(handleChange).toHaveBeenCalledTimes(1);
        expect(handleChange).toHaveBeenCalledWith('spot-2');
        expect(combobox.textContent).toContain('브랜드 협업 스팟');
    });
});
