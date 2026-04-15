import type {
    SharedFile,
    SpotDetailFull,
    SpotVote,
} from '@/entities/spot/types';

export type ChatRoomCategory = 'personal' | 'spot';
export type MainChatTopTab = 'personal' | 'team';
export type PersonalCounterpartRole = 'SUPPORTER' | 'PARTNER';
export type MainChatPersonalFilter = 'all' | 'unread' | 'SUPPORTER' | 'PARTNER';
export type MainChatTeamFilter = 'all' | 'vote' | 'schedule' | 'file';
export type ChatActionKind = 'vote' | 'schedule' | 'file' | 'reverse-offer';

export type ChatReverseOfferStatus =
    | 'PARTNER_REVIEW'
    | 'ADMIN_APPROVAL_PENDING';

export type ChatReverseOfferFinancialSource = 'management' | 'estimated';

export interface ChatReverseOfferFinancialSnapshot {
    sourceKind: ChatReverseOfferFinancialSource;
    targetAmount: number;
    agreedHeadcount: number;
    currentHeadcount: number;
    agreedPerPersonAmount: number;
    agreedRemainder: number;
    currentPerPersonAmount: number;
    currentRemainder: number;
    comparisonNeeded: boolean;
}

export interface ChatReverseOfferSummary {
    id: string;
    spotId: string;
    authorId: string;
    status: ChatReverseOfferStatus;
    approvedPartnerCount: number;
    totalPartnerCount: number;
    approverIds: string[];
    priorAgreementReachedInChat: boolean;
    financialSnapshot?: ChatReverseOfferFinancialSnapshot;
    createdAt: string;
    updatedAt: string;
}

export function formatReverseOfferApprovalProgress(
    summary: ChatReverseOfferSummary,
): string {
    return `파트너 승인 ${summary.approvedPartnerCount}/${summary.totalPartnerCount}`;
}

export interface ChatFriend {
    id: string;
    name: string;
    role: PersonalCounterpartRole;
    presenceLabel: string;
}

export interface ChatScheduleDraft {
    id: string;
    spotId: string;
    title: string;
    description: string;
    metaLabel: string;
    createdAt: string;
}

export type ChatMessage =
    | {
          id: string;
          kind: 'system';
          content: string;
          createdAt: string;
      }
    | {
          id: string;
          kind: 'message';
          authorId: string;
          authorName: string;
          content: string;
          createdAt: string;
      }
    | {
          id: string;
          kind: 'vote';
          authorId: string;
          authorName: string;
          vote: SpotVote;
          createdAt: string;
      }
    | {
          id: string;
          kind: 'schedule';
          authorId: string;
          authorName: string;
          schedule: ChatScheduleDraft;
          createdAt: string;
      }
    | {
          id: string;
          kind: 'file';
          authorId: string;
          authorName: string;
          file: SharedFile;
          createdAt: string;
      }
    | {
          id: string;
          kind: 'shortcut';
          authorId: string;
          authorName: string;
          shortcut: {
              actionKind: Extract<ChatActionKind, 'vote' | 'schedule' | 'file'>;
              actionId: string;
              label: string;
              title: string;
              preview: string;
          };
          createdAt: string;
      }
    | {
          id: string;
          kind: 'reverse-offer';
          authorId: string;
          authorName: string;
          reverseOffer: ChatReverseOfferSummary;
          createdAt: string;
      }
    | {
          id: string;
          kind: 'proposal';
          authorId: string;
          authorName: string;
          proposal: {
              suggestedAmount: number;
              amountRange?: { min: number; max: number };
              availableDates: string[];
              description: string;
          };
          status: 'PENDING' | 'ACCEPTED' | 'NEGOTIATING' | 'DECLINED';
          createdAt: string;
      };

interface ChatRoomBase {
    id: string;
    category: ChatRoomCategory;
    currentUserId: string;
    currentUserName: string;
    title: string;
    subtitle: string;
    description: string;
    metaLabel: string;
    updatedAt: string;
    messages: ChatMessage[];
}

export interface PersonalChatRoom extends ChatRoomBase {
    category: 'personal';
    partnerId: string;
    partnerName: string;
    presenceLabel: string;
    unreadCount: number;
    counterpartRole: PersonalCounterpartRole;
}

export interface SpotChatRoom extends ChatRoomBase {
    category: 'spot';
    spot: SpotDetailFull;
    reverseOffer?: ChatReverseOfferSummary;
    sourceFeedId?: string;
    participationRole?: 'SUPPORTER' | 'PARTNER';
}

export type ChatRoom = PersonalChatRoom | SpotChatRoom;

export interface ChatRouteSearchParams {
    tab?: string | string[];
    roomId?: string | string[];
    spotId?: string | string[];
    userId?: string | string[];
    actionKind?: string | string[];
    actionId?: string | string[];
}

export interface ChatActionTarget {
    actionKind: ChatActionKind;
    actionId: string;
}

export type ChatRouteIntent =
    | { kind: 'default' }
    | { kind: 'room'; roomId: string; actionTarget?: ChatActionTarget }
    | { kind: 'spot'; spotId: string }
    | { kind: 'user'; userId: string };

export interface ResolvedChatRoom {
    roomId: string | null;
    fallbackMessage?: string;
}

/**
 * 채팅 목록에서 투표/일정/파일을 독립 리스트 아이템으로 보여주기 위한 가상 아이템 타입.
 * 실제 채팅방이 없고, 탭 시 nav 확장 패널을 열어서 수정/제출한다.
 */
export type ChatSSEEventType = 'message' | 'read' | 'typing';

export type ChatSSEEvent =
    | { type: 'message'; data: ChatMessage }
    | { type: 'read'; data: { roomId: string; userId: string } }
    | { type: 'typing'; data: { roomId: string; userId: string } };

export type SpotActionItem =
    | {
          kind: Extract<ChatActionKind, 'vote'>;
          id: string;
          roomId: string;
          roomTitle: string;
          vote: import('@/entities/spot/types').SpotVote;
          updatedAt: string;
      }
    | {
          kind: Extract<ChatActionKind, 'schedule'>;
          id: string;
          roomId: string;
          roomTitle: string;
          schedule: ChatScheduleDraft;
          updatedAt: string;
      }
    | {
          kind: Extract<ChatActionKind, 'file'>;
          id: string;
          roomId: string;
          roomTitle: string;
          file: import('@/entities/spot/types').SharedFile;
          updatedAt: string;
      }
    | {
          kind: Extract<ChatActionKind, 'reverse-offer'>;
          id: string;
          roomId: string;
          roomTitle: string;
          reverseOffer: ChatReverseOfferSummary;
          updatedAt: string;
      };
