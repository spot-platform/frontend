import { afterEach, describe, expect, it, vi } from 'vitest';
import { chatApi } from './chat-api';
import type { SpotChatRoom } from '../model/types';

describe('chatApi room lifecycle mapping', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('preserves feedId and spotId nullable pair so shared group rooms can be classified as feed or spot chats', async () => {
        const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
            Response.json({
                data: [
                    {
                        id: 10,
                        type: 'GROUP',
                        feedId: 123,
                        spotId: null,
                        title: '피드 모집 채팅',
                        lastMessagePreview: '아직 피드 상태예요',
                        createdAt: '2026-05-24T10:00:00.000Z',
                    },
                    {
                        id: 20,
                        type: 'GROUP',
                        feedId: null,
                        spotId: 456,
                        title: '확정 스팟 채팅',
                        lastMessagePreview: '스팟으로 전환됐어요',
                        createdAt: '2026-05-24T11:00:00.000Z',
                    },
                ],
            }),
        );
        vi.stubGlobal('fetch', fetchMock);

        const { data } = await chatApi.listRooms();

        const feedRoom = data[0] as SpotChatRoom;
        const spotRoom = data[1] as SpotChatRoom;
        expect(feedRoom.category).toBe('spot');
        expect(feedRoom.sourceFeedId).toBe('123');
        expect(feedRoom.spot.id).toBe('10');
        expect(spotRoom.category).toBe('spot');
        expect(spotRoom.sourceFeedId).toBeUndefined();
        expect(spotRoom.spot.id).toBe('456');
    });
});
