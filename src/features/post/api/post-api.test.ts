import { afterEach, describe, expect, it, vi } from 'vitest';
import { postApi } from './post-api';

const plan = {
    steps: [
        { time: '10:00', activity: '집결', place_id: null, intent: 'meet' },
    ],
    total_duration_minutes: 120,
};

const preparation = {
    host_provides: ['돗자리'],
    partner_brings: ['물'],
    weather_contingency: '우천 시 실내로 이동',
    safety_notes: ['미끄럼 주의'],
    host_tip: '편한 신발 추천',
};

const priceBreakdown = {
    base_fee: 25000,
    included_items: [{ name: '기본 재료', value: '2인분' }],
    optional_addons: [],
    refund_policy: {
        cutoff_hours: 24,
        full_refund_until: null,
        note: '전날까지 환불',
    },
    summary_line: '기본 재료 포함',
};

describe('postApi', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('sends offer context-builder payload to the feed create endpoint', async () => {
        const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
            Response.json({
                data: {
                    id: 7,
                    type: 'OFFER',
                    title: '한강 자리 제공',
                    spotId: 11,
                    chatRoomId: 13,
                },
            }),
        );
        vi.stubGlobal('fetch', fetchMock);

        await postApi.createOffer({
            type: 'OFFER',
            spotName: '한강 명당',
            title: '한강 자리 제공',
            content: '자리 제공해요',
            categories: ['음식·요리'],
            photoUrls: ['https://cdn.example.com/offer.jpg'],
            pointCost: 25000,
            location: '여의도',
            lat: 37.5283,
            lng: 126.9326,
            deadline: '2026-06-30',
            detailDescription: '그늘막 포함',
            desiredPrice: 50000,
            maxPartnerCount: 4,
            plan,
            preparation,
            priceBreakdown,
        });

        const [url, init] = fetchMock.mock.calls[0];
        const body = JSON.parse(String(init?.body));

        expect(url).toBe('/api/backend/v1/feeds/offer');
        expect(body).toMatchObject({
            categories: ['음식_요리'],
            lat: 37.5283,
            lng: 126.9326,
            desiredPrice: 50000,
            maxPartnerCount: 4,
            plan,
            preparation,
            priceBreakdown,
        });
    });

    it('sends optional request context-builder payload to the feed create endpoint', async () => {
        const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
            Response.json({
                data: {
                    id: 8,
                    type: 'REQUEST',
                    title: '옥상 캠핑 요청',
                    spotId: 12,
                    chatRoomId: 14,
                },
            }),
        );
        vi.stubGlobal('fetch', fetchMock);

        await postApi.createRequest({
            type: 'REQUEST',
            spotName: '옥상 캠핑',
            title: '옥상 캠핑 요청',
            content: '공간 꾸미고 싶어요',
            categories: ['BBQ·조개'],
            photoUrls: [],
            pointCost: 15000,
            location: '합정동',
            lat: 37.5496,
            lng: 126.9136,
            deadline: '2026-06-30',
            detailDescription: '야간 이용 가능',
            serviceStylePhotoUrl: 'https://cdn.example.com/style.jpg',
            priceCapPerPerson: 30000,
            maxPartnerCount: 3,
            plan,
            preparation,
            priceBreakdown,
        });

        const [url, init] = fetchMock.mock.calls[0];
        const body = JSON.parse(String(init?.body));

        expect(url).toBe('/api/backend/v1/feeds/request');
        expect(body).toMatchObject({
            categories: ['BBQ_조개'],
            lat: 37.5496,
            lng: 126.9136,
            priceCapPerPerson: 30000,
            maxPartnerCount: 3,
            plan,
            preparation,
            priceBreakdown,
        });
    });
});
