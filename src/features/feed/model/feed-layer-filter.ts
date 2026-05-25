import type { LayerType } from '@/features/layer/model/use-layer-store';

export function getFeedListIsAiParamByLayer(
    activeLayer: LayerType,
): boolean | undefined {
    if (activeLayer === 'real') return false;
    if (activeLayer === 'virtual') return true;
    return undefined;
}
