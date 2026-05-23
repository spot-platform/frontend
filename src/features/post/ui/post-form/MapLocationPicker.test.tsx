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
});
