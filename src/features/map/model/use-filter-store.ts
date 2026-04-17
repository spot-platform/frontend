import { create } from 'zustand';

type FeedTypeFilter = 'all' | 'offer' | 'request';

type FilterState = {
    feedType: FeedTypeFilter;
    categories: string[];
    setFeedType: (type: FeedTypeFilter) => void;
    toggleCategory: (category: string) => void;
    resetFilters: () => void;
};

export const useFilterStore = create<FilterState>((set) => ({
    feedType: 'all',
    categories: [],
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
    resetFilters: () => set({ feedType: 'all', categories: [] }),
}));
