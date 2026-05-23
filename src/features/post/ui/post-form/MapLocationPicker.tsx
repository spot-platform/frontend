'use client';

import { useMemo } from 'react';
import { IconMapPin } from '@tabler/icons-react';
import { MapV3Canvas } from '@/features/map/ui/MapV3Canvas';

export type SelectedPostLocation = {
    lat: number;
    lng: number;
    label: string;
};

type MapLocationPickerProps = {
    value: SelectedPostLocation | null;
    onChange: (value: SelectedPostLocation) => void;
};

const DEFAULT_CENTER = { lat: 37.2636, lng: 127.0286 };

function formatLocationLabel(lat: number, lng: number) {
    return `지도 선택 위치 (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
}

export function MapLocationPicker({ value, onChange }: MapLocationPickerProps) {
    const center = value ? { lat: value.lat, lng: value.lng } : DEFAULT_CENTER;

    const overlays = useMemo(
        () =>
            value
                ? [
                      {
                          key: 'selected-location',
                          position: { lat: value.lat, lng: value.lng },
                          render: () => (
                              <div className="pointer-events-none flex -translate-y-2 flex-col items-center gap-1">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg ring-4 ring-primary/20">
                                      <IconMapPin size={22} stroke={2.2} />
                                  </div>
                                  <span className="rounded-full bg-black/70 px-2 py-1 text-[11px] font-semibold whitespace-nowrap text-white">
                                      선택한 위치
                                  </span>
                              </div>
                          ),
                      },
                  ]
                : [],
        [value],
    );

    const handleSelect = (lat: number, lng: number) => {
        onChange({
            lat,
            lng,
            label: formatLocationLabel(lat, lng),
        });
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="relative h-64 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
                <MapV3Canvas
                    center={center}
                    level={5}
                    overlays={overlays}
                    onMapClickAction={handleSelect}
                    theme="light"
                    className="h-full w-full"
                />
                <div className="pointer-events-none absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur">
                    지도를 눌러 활동 위치를 선택해주세요
                </div>
            </div>

            <div
                className={`rounded-2xl border px-4 py-3 text-sm ${
                    value
                        ? 'border-primary/30 bg-primary/5 text-gray-800'
                        : 'border-dashed border-gray-300 bg-gray-50 text-gray-500'
                }`}
            >
                {value ? (
                    <div className="flex flex-col gap-1">
                        <span className="font-semibold">{value.label}</span>
                        <span className="text-xs text-gray-500">
                            lat {value.lat.toFixed(6)} · lng{' '}
                            {value.lng.toFixed(6)}
                        </span>
                    </div>
                ) : (
                    '아직 위치가 선택되지 않았어요. 지도에서 장소를 눌러주세요.'
                )}
            </div>
        </div>
    );
}
