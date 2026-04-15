'use client';

// SearchPage - 최근 검색어와 스팟 검색 결과를 관리하는 검색 화면
import {
    useState,
    useCallback,
    useDeferredValue,
    useSyncExternalStore,
} from 'react';
import { SearchX, Clock, TrendingUp, X } from 'lucide-react';
import { SearchBar } from '@/shared/ui/SearchBar';
import { Tabs, EmptyState, Main } from '@/shared/ui';
import { useSpotSearch } from '@/features/spot/model/use-spot-search';
import { InProgressSpotRow } from '@/features/spot';

const TRENDING = ['베이킹', '가드닝', '홈카페', '공동구매', '클래스'];

type SearchTab = 'spot' | 'post' | 'user';
const TABS: { value: SearchTab; label: string }[] = [
    { value: 'spot', label: '스팟' },
    { value: 'post', label: '게시물' },
    { value: 'user', label: '사용자' },
];

const STORAGE_KEY = 'recentSearches';
const MAX_RECENT = 8;
const RECENT_SEARCHES_EVENT = 'recent-searches:change';

function loadRecent(): string[] {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
        return [];
    }
}

function saveRecent(searches: string[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
}

const EMPTY_RECENT: string[] = [];
let cachedSnapshot: string[] | null = null;

function subscribeRecentSearches(onStoreChange: () => void) {
    if (typeof window === 'undefined') {
        return () => {};
    }

    window.addEventListener(RECENT_SEARCHES_EVENT, onStoreChange);

    return () => {
        window.removeEventListener(RECENT_SEARCHES_EVENT, onStoreChange);
    };
}

function getRecentSearchesSnapshot(): string[] {
    if (typeof window === 'undefined') {
        return EMPTY_RECENT;
    }

    if (cachedSnapshot === null) {
        cachedSnapshot = loadRecent();
    }

    return cachedSnapshot;
}

function getRecentSearchesServerSnapshot(): string[] {
    return EMPTY_RECENT;
}

function notifyRecentSearchesChanged() {
    if (typeof window === 'undefined') {
        return;
    }

    cachedSnapshot = null;
    window.dispatchEvent(new Event(RECENT_SEARCHES_EVENT));
}

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [tab, setTab] = useState<SearchTab>('spot');
    const recent = useSyncExternalStore(
        subscribeRecentSearches,
        getRecentSearchesSnapshot,
        getRecentSearchesServerSnapshot,
    );

    // 타이핑 중 debounce — React의 useDeferredValue로 검색 쿼리만 지연
    const deferredQuery = useDeferredValue(query);

    const { data: spotResults = [], isLoading } = useSpotSearch(deferredQuery);

    const handleSearch = useCallback(
        (q: string) => {
            const trimmed = q.trim();
            if (!trimmed) return;

            const next = [
                trimmed,
                ...recent.filter((keyword) => keyword !== trimmed),
            ].slice(0, MAX_RECENT);

            saveRecent(next);
            notifyRecentSearchesChanged();
        },
        [recent],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') handleSearch(query);
        },
        [query, handleSearch],
    );

    const removeRecent = (keyword: string) => {
        const next = recent.filter((item) => item !== keyword);
        saveRecent(next);
        notifyRecentSearchesChanged();
    };

    const clearAllRecent = () => {
        saveRecent([]);
        notifyRecentSearchesChanged();
    };

    const applyKeyword = (keyword: string) => {
        setQuery(keyword);
        handleSearch(keyword);
    };

    const hasResults = spotResults.length > 0;
    const showEmpty =
        deferredQuery.trim().length > 0 && !isLoading && !hasResults;

    return (
        <Main>
            <div className="flex flex-col bg-white" onKeyDown={handleKeyDown}>
                <div className="sticky top-0 z-30 border-b border-gray-100 bg-white">
                    <SearchBar
                        value={query}
                        onChange={setQuery}
                        placeholder="스팟, 게시물, 사용자 검색"
                    />
                </div>

                <div className="flex-1 pb-28">
                    {!deferredQuery.trim() ? (
                        <div className="px-4 pt-4">
                            {recent.length > 0 && (
                                <section className="mb-6">
                                    <div className="mb-3 flex items-center justify-between">
                                        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                                            <Clock
                                                size={14}
                                                className="text-gray-400"
                                            />
                                            최근 검색어
                                        </h2>
                                        <button
                                            type="button"
                                            onClick={clearAllRecent}
                                            className="text-xs text-gray-400 active:text-gray-600"
                                        >
                                            전체 삭제
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {recent.map((keyword) => (
                                            <div
                                                key={keyword}
                                                className="flex items-center gap-1 rounded-full bg-gray-100 pl-3 pr-2 py-1.5"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        applyKeyword(keyword)
                                                    }
                                                    className="text-sm text-gray-700"
                                                >
                                                    {keyword}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeRecent(keyword)
                                                    }
                                                    className="flex h-4 w-4 items-center justify-center rounded-full text-gray-400 active:text-gray-600"
                                                    aria-label={`${keyword} 삭제`}
                                                >
                                                    <X
                                                        size={10}
                                                        strokeWidth={2.5}
                                                    />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            <section>
                                <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                                    <TrendingUp
                                        size={14}
                                        className="text-brand-600"
                                    />
                                    인기 키워드
                                </h2>
                                <ul className="space-y-2.5">
                                    {TRENDING.map((keyword, i) => (
                                        <li key={keyword}>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    applyKeyword(keyword)
                                                }
                                                className="flex w-full items-center gap-3 active:opacity-60"
                                            >
                                                <span className="w-5 text-sm font-bold text-brand-600">
                                                    {i + 1}
                                                </span>
                                                <span className="text-sm text-gray-800">
                                                    {keyword}
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>
                    ) : (
                        <div>
                            <div className="border-b border-gray-100 px-4 pt-3 pb-0">
                                <Tabs
                                    tabs={TABS}
                                    active={tab}
                                    onChange={setTab}
                                    size="sm"
                                />
                            </div>

                            {isLoading && (
                                <div className="flex flex-col gap-3 px-4 pt-4">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="h-24 animate-pulse rounded-xl bg-gray-100"
                                        />
                                    ))}
                                </div>
                            )}

                            {showEmpty && (
                                <EmptyState
                                    icon={<SearchX size={40} />}
                                    title={`'${deferredQuery}' 검색 결과가 없어요`}
                                    description="다른 키워드로 검색해보세요"
                                />
                            )}

                            {!isLoading && tab === 'spot' && hasResults && (
                                <div className="flex flex-col gap-2 px-4 pt-3">
                                    {spotResults.map((spot) => (
                                        <InProgressSpotRow
                                            key={spot.id}
                                            spot={spot}
                                        />
                                    ))}
                                </div>
                            )}

                            {!isLoading &&
                                (tab === 'post' || tab === 'user') && (
                                    <EmptyState
                                        icon={<SearchX size={40} />}
                                        title="준비 중이에요"
                                        description="곧 만나볼 수 있어요"
                                    />
                                )}
                        </div>
                    )}
                </div>
            </div>
        </Main>
    );
}
