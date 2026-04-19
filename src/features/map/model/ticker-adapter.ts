// swarm-ticker-adapter 가 emit 하는 자연어 이벤트의 shape.

export type TickerEvent = {
    id: string;
    personaEmoji: string;
    personaName: string;
    predicate: string;
    timestamp: number;
};
