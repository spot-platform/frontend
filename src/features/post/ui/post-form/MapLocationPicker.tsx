'use client';

import { useMemo, useState } from 'react';
import { IconMapPin } from '@tabler/icons-react';
import { MapV3Canvas } from '@/features/map/ui/MapV3Canvas';
import type { SelectedPostLocation } from '../../model/types';

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
    const [manualLat, setManualLat] = useState(() => String(center.lat));
    const [manualLng, setManualLng] = useState(() => String(center.lng));
    const [manualError, setManualError] = useState<string | null>(null);

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
        setManualError(null);
        setManualLat(String(lat));
        setManualLng(String(lng));
        onChange({
            lat,
            lng,
            label: formatLocationLabel(lat, lng),
        });
    };

    const handleManualSelect = () => {
        const lat = Number(manualLat);
        const lng = Number(manualLng);

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            lat < -90 ||
            lat > 90 ||
            lng < -180 ||
            lng > 180
        ) {
            setManualError(
                '위도는 -90~90, 경도는 -180~180 사이 숫자로 입력해주세요.',
            );
            return;
        }

        handleSelect(lat, lng);
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
                className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-3 text-sm sm:grid-cols-[1fr_1fr_auto]"
                aria-describedby="location-picker-help"
            >
                <p id="location-picker-help" className="sr-only">
                    지도 조작이 어려우면 현재 중심점을 선택하거나 위도와 경도를
                    직접 입력해서 활동 위치를 선택할 수 있어요.
                </p>
                <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
                    위도
                    <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        min="-90"
                        max="90"
                        value={manualLat}
                        onChange={(event) => setManualLat(event.target.value)}
                        className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        aria-label="선택할 위치의 위도"
                    />
                </label>
                <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
                    경도
                    <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        min="-180"
                        max="180"
                        value={manualLng}
                        onChange={(event) => setManualLng(event.target.value)}
                        className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        aria-label="선택할 위치의 경도"
                    />
                </label>
                <div className="flex flex-col justify-end gap-2 sm:min-w-36">
                    <button
                        type="button"
                        onClick={() => handleSelect(center.lat, center.lng)}
                        className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    >
                        현재 중심점 선택
                    </button>
                    <button
                        type="button"
                        onClick={handleManualSelect}
                        className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary/90 focus:ring-2 focus:ring-primary/30 focus:outline-none"
                    >
                        좌표로 선택
                    </button>
                </div>
                {manualError ? (
                    <p
                        className="text-xs font-medium text-red-500 sm:col-span-3"
                        role="alert"
                    >
                        {manualError}
                    </p>
                ) : null}
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
