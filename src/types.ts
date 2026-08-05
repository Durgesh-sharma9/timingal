export type AppState = 'landing' | 'requesting_permissions' | 'queue' | 'connected';

export interface ChatMessage {
  id: string;
  sender: 'you' | 'stranger' | 'system';
  text: string;
  timestamp: string;
}

export interface SignalingOfferPayload {
  roomId: string;
  offer: RTCSessionDescriptionInit;
}

export interface SignalingAnswerPayload {
  roomId: string;
  answer: RTCSessionDescriptionInit;
}

export interface SignalingIcePayload {
  roomId: string;
  candidate: RTCIceCandidateInit;
}

export interface MatchedPayload {
  roomId: string;
  isInitiator: boolean;
  peerId: string;
}

export interface ServerStats {
  onlineCount: number;
  inQueueCount: number;
}
