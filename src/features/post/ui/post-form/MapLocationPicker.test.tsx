import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MapLocationPicker } from './MapLocationPicker';

vi.mock('@/features/map/ui/MapV3Canvas', () => ({
    MapV3Canvas: ({
        onMapClickAction,
    }: {
        onMapClickAction?: (lat: number, lng: number) => void;
    }) => (
        <button
            type="button"
            onClick={() => onMapClickAction?.(37.2636, 127.0286)}
        >
            테스트 지도 좌표 선택
        </button>
    ),
}));

afterEach(() => {
    cleanup();
});

describe('MapLocationPicker', () => {
    it('selects a required feed location as lat/lng from a map click', () => {
        const handleChange = vi.fn();

        render(<MapLocationPicker value={null} onChange={handleChange} />);

        fireEvent.click(
            screen.getByRole('button', { name: '테스트 지도 좌표 선택' }),
        );

        expect(handleChange).toHaveBeenCalledWith({
            lat: 37.2636,
            lng: 127.0286,
            label: '지도 선택 위치 (37.26360, 127.02860)',
        });
    });

    it('renders the selected coordinate summary', () => {
        render(
            <MapLocationPicker
                value={{
                    lat: 37.2636,
                    lng: 127.0286,
                    label: '지도 선택 위치 (37.26360, 127.02860)',
                }}
                onChange={vi.fn()}
            />,
        );

        expect(
            screen.getByText('지도 선택 위치 (37.26360, 127.02860)'),
        ).toBeTruthy();
        expect(
            screen.getByText(/lat\s+37\.263600\s+· lng\s+127\.028600/),
        ).toBeTruthy();
    });

    it('selects the current center with a keyboard-accessible button', () => {
        const handleChange = vi.fn();

        render(<MapLocationPicker value={null} onChange={handleChange} />);

        fireEvent.click(
            screen.getByRole('button', { name: '현재 중심점 선택' }),
        );

        expect(handleChange).toHaveBeenCalledWith({
            lat: 37.2636,
            lng: 127.0286,
            label: '지도 선택 위치 (37.26360, 127.02860)',
        });
    });

    it('selects a required feed location from manual coordinates', () => {
        const handleChange = vi.fn();

        render(<MapLocationPicker value={null} onChange={handleChange} />);

        fireEvent.change(screen.getByLabelText('선택할 위치의 위도'), {
            target: { value: '37.5123' },
        });
        fireEvent.change(screen.getByLabelText('선택할 위치의 경도'), {
            target: { value: '127.0456' },
        });
        fireEvent.click(screen.getByRole('button', { name: '좌표로 선택' }));

        expect(handleChange).toHaveBeenCalledWith({
            lat: 37.5123,
            lng: 127.0456,
            label: '지도 선택 위치 (37.51230, 127.04560)',
        });
    });

    it('shows an error and does not select empty manual coordinates', () => {
        const handleChange = vi.fn();

        render(<MapLocationPicker value={null} onChange={handleChange} />);

        fireEvent.change(screen.getByLabelText('선택할 위치의 위도'), {
            target: { value: '' },
        });
        fireEvent.change(screen.getByLabelText('선택할 위치의 경도'), {
            target: { value: '127.0456' },
        });
        fireEvent.click(screen.getByRole('button', { name: '좌표로 선택' }));

        expect(handleChange).not.toHaveBeenCalled();
        expect(
            screen.getByText(
                '위도는 -90~90, 경도는 -180~180 사이 숫자로 입력해주세요.',
            ),
        ).toBeTruthy();
    });

    it('shows an error and does not select out-of-range manual coordinates', () => {
        const handleChange = vi.fn();

        render(<MapLocationPicker value={null} onChange={handleChange} />);

        fireEvent.change(screen.getByLabelText('선택할 위치의 위도'), {
            target: { value: '91' },
        });
        fireEvent.change(screen.getByLabelText('선택할 위치의 경도'), {
            target: { value: '200' },
        });
        fireEvent.click(screen.getByRole('button', { name: '좌표로 선택' }));

        expect(handleChange).not.toHaveBeenCalled();
        expect(
            screen.getByText(
                '위도는 -90~90, 경도는 -180~180 사이 숫자로 입력해주세요.',
            ),
        ).toBeTruthy();
    });
});
