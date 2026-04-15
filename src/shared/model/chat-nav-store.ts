import { create } from 'zustand';
import type { SpotActionItem } from '@/features/chat/model/types';

type ChatNavMode =
    | { kind: 'creation'; step: 'vote' | 'schedule' | 'file' | 'reverse-offer' }
    | { kind: 'personal-create' }
    | { kind: 'friend-add' }
    | { kind: 'action-item'; item: SpotActionItem }
    | { kind: 'room-info'; roomId: string };

type ChatNavState = {
    expanded: boolean;
    subNavOpen: boolean;
    mode: ChatNavMode;
    activeActionItem: SpotActionItem | null;
    setExpanded: (expanded: boolean) => void;
    open: () => void;
    close: () => void;
    setSubNavOpen: (open: boolean) => void;
    openCreation: (
        step: 'vote' | 'schedule' | 'file' | 'reverse-offer',
    ) => void;
    openPersonalCreate: () => void;
    openFriendAdd: () => void;
    openActionItem: (item: SpotActionItem) => void;
    openRoomInfo: (roomId: string) => void;
};

export const useChatNavStore = create<ChatNavState>()((set, get) => ({
    expanded: false,
    subNavOpen: false,
    mode: { kind: 'creation', step: 'vote' },
    activeActionItem: null,
    setExpanded: (expanded) => set({ expanded }),
    open: () => set({ expanded: true, subNavOpen: false }),
    close: () =>
        set({
            expanded: false,
            subNavOpen: false,
            activeActionItem: null,
            mode: { kind: 'creation', step: 'vote' },
        }),
    setSubNavOpen: (subNavOpen) =>
        set({
            subNavOpen,
            expanded: subNavOpen ? false : get().expanded,
        }),
    openCreation: (step) =>
        set({
            expanded: true,
            subNavOpen: false,
            mode: { kind: 'creation', step },
            activeActionItem: null,
        }),
    openPersonalCreate: () =>
        set({
            expanded: true,
            subNavOpen: false,
            mode: { kind: 'personal-create' },
            activeActionItem: null,
        }),
    openFriendAdd: () =>
        set({
            expanded: true,
            subNavOpen: false,
            mode: { kind: 'friend-add' },
            activeActionItem: null,
        }),
    openActionItem: (item) =>
        set({
            expanded: true,
            subNavOpen: false,
            mode: { kind: 'action-item', item },
            activeActionItem: item,
        }),
    openRoomInfo: (roomId) =>
        set({
            expanded: true,
            subNavOpen: false,
            mode: { kind: 'room-info', roomId },
            activeActionItem: null,
        }),
}));
