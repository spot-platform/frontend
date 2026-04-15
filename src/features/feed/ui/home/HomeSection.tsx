'use client';

import { Carousel } from '@/shared/ui/Carousel';
import { getLatestNoticeAdminPost } from '@/features/admin-post';
import { HotSpotBanner } from '../HotSpotBanner';
import { Notice } from '../Notice';
import { HomeFeedCard } from '../FeedCard';
import { SupporterCard } from './SupporterCard';
import { MOCK_FEED, MOCK_SUPPORTERS } from '../../model/mock';
import { Section } from '@/shared/ui';

export function HomeSection() {
    const latestNoticeAdminPost = getLatestNoticeAdminPost();
    const closingSoon = MOCK_FEED.filter(
        (item) => item.type === 'OFFER' && (item.progressPercent ?? 0) >= 70,
    );
    const bookmarkedFeed = MOCK_FEED.filter(
        (item) =>
            item.isBookmarked &&
            (item.type === 'OFFER' || item.type === 'REQUEST'),
    );

    return (
        <div className="flex flex-col gap-6">
            <HotSpotBanner />

            {latestNoticeAdminPost ? (
                <Notice
                    id={latestNoticeAdminPost.id}
                    title={latestNoticeAdminPost.title}
                />
            ) : null}

            <Section
                className="flex flex-col gap-2"
                title="곧 스팟이 되가는 포스트"
            >
                <Carousel>
                    {closingSoon.map((item) => (
                        <HomeFeedCard key={item.id} item={item} />
                    ))}
                </Carousel>
            </Section>

            <Section className="flex flex-col gap-2" title="내가 찜한 활동">
                <Carousel>
                    {bookmarkedFeed.map((item) => (
                        <HomeFeedCard key={item.id} item={item} />
                    ))}
                </Carousel>
            </Section>

            <Section className="flex flex-col gap-2" title="새 서포터 등장">
                <Carousel>
                    {MOCK_SUPPORTERS.map((supporter) => (
                        <SupporterCard
                            key={supporter.id}
                            supporter={supporter}
                        />
                    ))}
                </Carousel>
            </Section>
        </div>
    );
}
