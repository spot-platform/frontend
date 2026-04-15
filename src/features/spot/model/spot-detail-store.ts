import { create } from 'zustand';

export type ActiveModal =
    | 'schedule'
    | 'vote-create'
    | 'vote-cast'
    | 'checklist'
    | 'files'
    | 'note'
    | 'review'
    | null;

type SpotDetailState = {
    activeModal: ActiveModal;
    selectedVoteId: string | null;
    openModal: (modal: ActiveModal, meta?: { voteId?: string }) => void;
    closeModal: () => void;
};

export const useSpotDetailStore = create<SpotDetailState>()((set) => ({
    activeModal: null,
    selectedVoteId: null,
    openModal: (modal, meta) =>
        set({ activeModal: modal, selectedVoteId: meta?.voteId ?? null }),
    closeModal: () => set({ activeModal: null, selectedVoteId: null }),
}));
