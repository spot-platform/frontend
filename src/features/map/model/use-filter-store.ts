import { create } from 'zustand';
import type { SpotCategory } from '@/entities/spot/categories';

type FeedTypeFilter = 'all' | 'offer' | 'request';

type FilterState = {
    feedType: FeedTypeFilter;
    categories: SpotCategory[];
    searchQuery: string;
    setFeedType: (type: FeedTypeFilter) => void;
    toggleCategory: (category: SpotCategory) => void;
    setSearchQuery: (q: string) => void;
    resetFilters: () => void;
};

export const useFilterStore = create<FilterState>((set) => ({
    feedType: 'all',
    categories: [],
    searchQuery: '',
    setFeedType: (feedType) =>
        set((state) => ({
            feedType: state.feedType === feedType ? 'all' : feedType,
        })),
    toggleCategory: (category) =>
        set((state) => ({
            categories: state.categories.includes(category)
                ? state.categories.filter((c) => c !== category)
                : [...state.categories, category],
        })),
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    resetFilters: () =>
        set({ feedType: 'all', categories: [], searchQuery: '' }),
}));
