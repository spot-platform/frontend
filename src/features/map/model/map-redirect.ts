import { redirect } from 'next/navigation';
import { buildMapHref, type MapRedirectParams } from './map-url';

export function createMapRedirect(params?: MapRedirectParams) {
    return function MapRedirectPage(): never {
        redirect(buildMapHref(params));
    };
}
