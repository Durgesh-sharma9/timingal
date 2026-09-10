import React, { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Loader2, User, UserX, Shield, Volume2, Sparkles, AlertCircle, Send } from 'lucide-react';
import { ChatMessage, ServerStats } from '../types';
import { VideoControls } from './VideoControls';
import { ChatPanel } from './ChatPanel';

interface VideoChatViewProps {
  onStopChat: () => void;
  onStatsUpdate: (stats: ServerStats) => void;
}

const STUN_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
};

export const VideoChatView: React.FC<VideoChatViewProps> = ({
  onStopChat,
  onStatsUpdate,
}) => {
  // Connection & Queue State
  const [statusText, setStatusText] = useState<string>('Initializing camera & microphone...');
  const [isSearching, setIsSearching] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<string | null>(null);

  // Media Controls State
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCameraOff, setIsCameraOff] = useState<boolean>(false);
  const [isMirrored, setIsMirrored] = useState<boolean>(true);

  // Messages State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mobileInput, setMobileInput] = useState('');

  // Refs for WebRTC & Socket.IO
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const onStatsUpdateRef = useRef(onStatsUpdate);
  const roomIdRef = useRef<string | null>(null);
  const mobileChatRef = useRef<HTMLDivElement>(null);

  // Keep onStatsUpdate ref current
  useEffect(() => {
    onStatsUpdateRef.current = onStatsUpdate;
  }, [onStatsUpdate]);

  // Scroll mobile chat to bottom on new message
  useEffect(() => {
    if (mobileChatRef.current) {
      mobileChatRef.current.scrollTop = mobileChatRef.current.scrollHeight;
    }
  }, [messages]);

  // Add system message helper
  const addSystemMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'system',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  /**
   * Cleans up existing PeerConnection instance safely.
   */
  const cleanupPeerConnection = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }
    pendingCandidatesRef.current = [];
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    setIsConnected(false);
    setRoomId(null);
    roomIdRef.current = null;
  }, []);

  /**
   * Initializes or recreates WebRTC RTCPeerConnection for a new match.
   */
  const createPeerConnection = useCallback((currentRoomId: string) => {
    cleanupPeerConnection();

    // Restore room ID states that were cleared during cleanupPeerConnection
    setRoomId(currentRoomId);
    roomIdRef.current = currentRoomId;

    console.log(`[WebRTC] Creating new RTCPeerConnection for room: ${currentRoomId}`);
    const pc = new RTCPeerConnection(STUN_SERVERS);
    pcRef.current = pc;

    // Attach local media tracks (video & audio) to RTCPeerConnection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // Handle incoming remote media tracks
    pc.ontrack = (event) => {
      console.log('[WebRTC] Remote track received:', event.track.kind);
      if (remoteVideoRef.current) {
        if (event.streams && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
        } else {
          // Fallback if event.streams is empty
          if (!remoteVideoRef.current.srcObject) {
            remoteVideoRef.current.srcObject = new MediaStream();
          }
          (remoteVideoRef.current.srcObject as MediaStream).addTrack(event.track);
        }
        // Explicitly trigger play to bypass browser autoplay policies
        remoteVideoRef.current.play().catch((err) => {
          console.warn('[WebRTC] Error playing remote video:', err);
        });
      }
    };

    // Handle local ICE candidate discovery & relay to signaling server
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        console.log('[WebRTC] Discovered local ICE Candidate, signaling to peer...');
        socketRef.current.emit('signal_ice_candidate', {
          roomId: currentRoomId,
          candidate: event.candidate,
        });
      }
    };

    // Monitor WebRTC connection status state using both connectionState and iceConnectionState
    const checkConnectionState = () => {
      const connState = pc.connectionState;
      const iceState = pc.iceConnectionState;
      console.log(`[WebRTC State Update] connectionState: ${connState}, iceConnectionState: ${iceState}`);

      if (connState === 'connected' || iceState === 'connected' || iceState === 'completed') {
        setStatusText('Connected! Video stream live.');
        setIsConnected(true);
        setIsSearching(false);
      } else if (
        connState === 'failed' ||
        connState === 'disconnected' ||
        iceState === 'failed' ||
        iceState === 'disconnected'
      ) {
        setStatusText('Video stream interrupted.');
        setIsConnected(false);
      }
    };

    pc.onconnectionstatechange = checkConnectionState;
    pc.oniceconnectionstatechange = checkConnectionState;

    return pc;
  }, [cleanupPeerConnection]);

  /**
   * Socket.IO & Media Stream Setup
   */
  useEffect(() => {
    let mounted = true;

    async function initMediaAndSocket() {
      try {
        // Step 1: Request user media (Camera & Mic)
        setStatusText('Requesting camera & microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch((err) => {
            console.warn('[WebRTC] Error playing local video:', err);
          });
        }

        // Step 2: Initialize Socket.IO connection
        const socket = io({
          transports: ['websocket', 'polling'],
        });
        socketRef.current = socket;

        // Server stats handler
        socket.on('server_stats', (stats: ServerStats) => {
          onStatsUpdateRef.current(stats);
        });

        // Status: Waiting in queue
        socket.on('waiting_in_queue', () => {
          setStatusText('Searching for a random stranger...');
          setIsSearching(true);
          setIsConnected(false);
        });

        // Event: Matched with another user!
        socket.on('matched', async ({ roomId: newRoomId, isInitiator }: { roomId: string; isInitiator: boolean }) => {
          console.log(`[Socket] Matched! Room: ${newRoomId}, isInitiator: ${isInitiator}`);
          setRoomId(newRoomId);
          roomIdRef.current = newRoomId;
          setIsSearching(false);
          setStatusText(isInitiator ? 'Match found! Initiating WebRTC offer...' : 'Match found! Waiting for video offer...');
          addSystemMessage('You are now connected to a stranger. Say hello!');

          const pc = createPeerConnection(newRoomId);

          if (isInitiator) {
            /**
             * INITIATOR FLOW:
             * 1. Create WebRTC SDP offer
             * 2. Set Local Description
             * 3. Send offer to signaling server
             */
            try {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              socket.emit('signal_offer', { roomId: newRoomId, offer });
              console.log('[WebRTC] Sent SDP offer');
            } catch (err) {
              console.error('[WebRTC] Error creating offer:', err);
            }
          }
        });

        // Event: Incoming WebRTC SDP Offer
        socket.on('signal_offer', async ({ offer }: { offer: RTCSessionDescriptionInit }) => {
          console.log('[WebRTC] Received SDP offer from partner');
          if (!pcRef.current || !socketRef.current) return;

          try {
            await pcRef.current.setRemoteDescription(offer);

            // Flush any buffered pending ICE candidates
            for (const cand of pendingCandidatesRef.current) {
              await pcRef.current.addIceCandidate(cand);
            }
            pendingCandidatesRef.current = [];

            /**
             * RECEIVER FLOW:
             * 1. Create WebRTC SDP answer
             * 2. Set Local Description
             * 3. Send answer to signaling server
             */
            const answer = await pcRef.current.createAnswer();
            await pcRef.current.setLocalDescription(answer);

            const activeRoom = roomIdRef.current;
            if (activeRoom) {
              socket.emit('signal_answer', { roomId: activeRoom, answer });
              console.log('[WebRTC] Sent SDP answer');
            }
          } catch (err) {
            console.error('[WebRTC] Error handling offer:', err);
          }
        });

        // Event: Incoming WebRTC SDP Answer
        socket.on('signal_answer', async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
          console.log('[WebRTC] Received SDP answer from partner');
          if (!pcRef.current) return;

          try {
            await pcRef.current.setRemoteDescription(answer);

            // Flush any buffered pending ICE candidates
            for (const cand of pendingCandidatesRef.current) {
              await pcRef.current.addIceCandidate(cand);
            }
            pendingCandidatesRef.current = [];
          } catch (err) {
            console.error('[WebRTC] Error setting remote description from answer:', err);
          }
        });

        // Event: Incoming ICE Candidate from peer
        socket.on('signal_ice_candidate', async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
          if (!pcRef.current) return;

          try {
            if (pcRef.current.remoteDescription && pcRef.current.remoteDescription.type) {
              await pcRef.current.addIceCandidate(candidate);
            } else {
              // Buffer candidate until remote description is set
              pendingCandidatesRef.current.push(candidate);
            }
          } catch (err) {
            console.error('[WebRTC] Error adding remote ICE candidate:', err);
          }
        });

        // Event: Text message received from stranger
        socket.on('receive_chat_message', ({ message, sender, timestamp }: { message: string; sender: 'stranger'; timestamp: string }) => {
          setMessages((prev) => [
            ...prev,
            {
              id: Math.random().toString(36).substring(2, 9),
              sender: 'stranger',
              text: message,
              timestamp,
            },
          ]);
        });

        // Event: Partner left or disconnected
        socket.on('partner_left', ({ reason }: { reason: string }) => {
          console.log(`[Socket] Partner left: ${reason}`);
          cleanupPeerConnection();
          addSystemMessage(`Stranger has disconnected. (${reason})`);
          setStatusText('Stranger left the chat.');
        });

        // Event: Trigger requeue after leaving previous chat
        socket.on('trigger_requeue', () => {
          cleanupPeerConnection();
          setMessages([]);
          addSystemMessage('Searching for a new stranger...');
          socket.emit('join_queue');
        });

        // Start initial queue join
        socket.emit('join_queue');
      } catch (err) {
        console.error('Failed to initialize media/socket:', err);
        setStatusText('Camera or microphone permission denied. Please allow access and reload.');
      }
    }

    initMediaAndSocket();

    return () => {
      mounted = false;
      cleanupPeerConnection();
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [createPeerConnection, cleanupPeerConnection]);

  /**
   * Action: "Next Stranger" button
   */
  const handleNextStranger = () => {
    setIsSearching(true);
    setIsConnected(false);
    setStatusText('Searching for a new stranger...');
    cleanupPeerConnection();
    setMessages([]);
    if (socketRef.current) {
      socketRef.current.emit('leave_chat', { requeue: true });
    }
  };

  /**
   * Action: "Stop" button
   */
  const handleStop = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave_chat', { requeue: false });
      socketRef.current.emit('leave_queue');
    }
    cleanupPeerConnection();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    onStopChat();
  };

  /**
   * Action: Send text chat message
   */
  const handleSendMessage = (text: string) => {
    if (!socketRef.current || !roomId) return;

    socketRef.current.emit('send_chat_message', { roomId, message: text });

    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'you',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  /**
   * Toggle Mute Audio
   */
  const handleToggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  /**
   * Toggle Camera Off/On
   */
  const handleToggleCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(!isCameraOff);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 lg:py-6 flex flex-col gap-3 lg:gap-4 h-[calc(100vh-65px)] lg:h-auto min-h-0 overflow-hidden">
      {/* Top Session Status Bar */}
      <div className="bg-[#0b1120]/80 border border-white/[0.08] backdrop-blur-2xl rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs shadow-lg shrink-0">
        <div className="flex items-center gap-2.5">
          {isSearching ? (
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
              <span className="absolute w-2 h-2 rounded-full bg-indigo-400" />
            </div>
          ) : isConnected ? (
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="absolute w-2 h-2 rounded-full bg-emerald-400" />
            </div>
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400" />
          )}
          <span className="font-bold text-slate-100 text-xs sm:text-[13px]">{statusText}</span>
        </div>

        {roomId && (
          <div className="hidden sm:flex items-center gap-2 text-slate-400 font-mono text-[10px] tracking-wider uppercase font-semibold bg-slate-900/80 border border-white/[0.06] px-3 py-1 rounded-full">
            <Shield className="w-3 h-3 text-indigo-400" />
            <span>P2P ID: {roomId.slice(0, 12)}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Video Streams & Text Chat */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-3 lg:gap-4 flex-1 min-h-0">
        {/* Videos Container (Takes 2 cols on lg screens) */}
        <div className="lg:col-span-2 flex flex-col gap-3 min-h-0 flex-1 lg:flex-initial">
          <div className="relative flex-1 flex flex-col sm:grid sm:grid-cols-2 gap-3 min-h-0">
            {/* Remote Video Container (Stranger) */}
            <div className="relative flex-1 sm:flex-initial sm:h-full bg-[#070b14] border border-white/[0.09] hover:border-indigo-500/30 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-300 flex items-center justify-center group">
              {/* Stranger Video Element */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover ${!isConnected ? 'hidden' : 'block'}`}
              />

              {/* Not Connected Overlay: Radar Searching / Matching / Ready States */}
              {!isConnected && (
                <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center space-y-4">
                  {isSearching ? (
                    <>
                      {/* Concentric Radar Sonar Waves */}
                      <div className="relative flex items-center justify-center w-36 h-36">
                        <div className="absolute inset-0 rounded-full border border-indigo-500/30 animate-radar-sonar-1" />
                        <div className="absolute inset-0 rounded-full border border-purple-500/30 animate-radar-sonar-2" />
                        <div className="absolute inset-0 rounded-full border border-pink-500/20 animate-radar-sonar-3" />
                        
                        {/* Center Radar Scanner Orb */}
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-950 via-purple-950 to-slate-900 border border-indigo-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] relative overflow-hidden">
                          {/* Rotating radar scanner beam */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent animate-radar-sweep origin-center" />
                          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin relative z-10" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-base font-bold font-display text-white">Searching for someone new...</p>
                        <p className="text-xs text-slate-400 max-w-xs">
                          Matching you with another user in the global waiting room.
                        </p>
                      </div>
                    </>
                  ) : roomId ? (
                    <>
                      <div className="relative flex items-center justify-center w-24 h-24">
                        <div className="absolute inset-0 rounded-full border border-purple-500/40 animate-ping" />
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                          <Sparkles className="w-8 h-8 text-white animate-pulse" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-bold font-display text-white">Stranger Found!</p>
                        <p className="text-xs text-slate-400 max-w-xs">
                          Negotiating direct peer-to-peer WebRTC stream...
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-slate-900/80 border border-white/[0.08] flex items-center justify-center text-slate-400 shadow-md">
                        <UserX className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-bold font-display text-slate-200">Chat Ended</p>
                        <p className="text-xs text-slate-400">Ready to meet your next conversation partner?</p>
                      </div>
                      <button
                        onClick={handleNextStranger}
                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-[0_4px_15px_rgba(99,102,241,0.3)] cursor-pointer"
                      >
                        Find Next Stranger
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Mobile Chat Overlay (Visible on smaller screens) */}
              <div
                ref={mobileChatRef}
                className="lg:hidden absolute bottom-4 left-3 w-[75%] max-w-[260px] z-30 max-h-[120px] overflow-y-auto flex flex-col gap-1.5 pointer-events-auto no-scrollbar"
              >
                {messages.map((msg) => {
                  if (msg.sender === 'system') {
                    return (
                      <div key={msg.id} className="self-center py-0.5">
                        <span className="text-[9px] bg-slate-950/80 backdrop-blur-md border border-white/[0.08] text-indigo-300 font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  const isYou = msg.sender === 'you';
                  return (
                    <div
                      key={msg.id}
                      className={`max-w-[90%] px-3 py-1.5 rounded-xl text-[10px] sm:text-xs backdrop-blur-md border text-white shadow-md ${
                        isYou
                          ? 'bg-indigo-600/80 border-indigo-500/30 self-end rounded-tr-none'
                          : 'bg-slate-900/85 border-white/[0.08] self-start rounded-tl-none'
                      }`}
                    >
                      <span className="font-bold text-[8px] text-slate-400 block mb-0.5">
                        {isYou ? 'You' : 'Stranger'}
                      </span>
                      {msg.text}
                    </div>
                  );
                })}
              </div>

              {/* Stranger Label Badge */}
              <div className="absolute top-3.5 left-3.5 bg-[#090d16]/80 backdrop-blur-xl border border-white/[0.09] px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-2 shadow-md z-10">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Stranger</span>
              </div>
            </div>

            {/* Local Video Container (You) - Picture-in-Picture on Mobile, Side-by-Side on Desktop */}
            <div className="absolute top-3.5 right-3.5 w-28 h-36 sm:relative sm:top-0 sm:right-0 sm:w-full sm:h-full sm:border sm:border-white/[0.09] sm:shadow-lg bg-[#070b14] rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 hover:border-indigo-500/30 flex items-center justify-center group z-20 shadow-2xl border-2 border-indigo-500/30">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isMirrored ? '-scale-x-100' : ''} ${isCameraOff ? 'hidden' : 'block'}`}
              />

              {isCameraOff && (
                <div className="flex flex-col items-center justify-center text-slate-400 p-6 space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/[0.08] flex items-center justify-center text-slate-400">
                    <User className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-300">Camera Off</p>
                </div>
              )}

              {/* You Label Badge */}
              <div className="absolute top-3 left-3 bg-[#090d16]/80 backdrop-blur-xl border border-white/[0.09] px-2.5 py-1 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-1.5 shadow-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">You</span>
                {isMuted && <span className="text-[10px] text-rose-400 font-bold ml-0.5">(Muted)</span>}
              </div>
            </div>
          </div>

          {/* Mobile Chat Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (mobileInput.trim()) {
                handleSendMessage(mobileInput);
                setMobileInput('');
              }
            }}
            className="lg:hidden flex gap-2 p-2 bg-[#0b1120]/80 border border-white/[0.08] rounded-2xl shrink-0 backdrop-blur-md"
          >
            <input
              type="text"
              value={mobileInput}
              onChange={(e) => setMobileInput(e.target.value)}
              placeholder={roomId ? "Send message to stranger..." : "Waiting to match..."}
              disabled={!roomId}
              className="flex-1 bg-slate-900 border border-white/[0.08] focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none disabled:opacity-40"
            />
            <button
              type="submit"
              disabled={!roomId || !mobileInput.trim()}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0 shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Video Action Controls Dock */}
          <VideoControls
            isMuted={isMuted}
            isCameraOff={isCameraOff}
            isMirrored={isMirrored}
            onToggleMute={handleToggleMute}
            onToggleCamera={handleToggleCamera}
            onToggleMirror={() => setIsMirrored(!isMirrored)}
            onNext={handleNextStranger}
            onStop={handleStop}
            isSearching={isSearching}
          />
        </div>

        {/* Text Chat Panel (Visible on desktop screens) */}
        <div className="hidden lg:flex lg:col-span-1 h-full min-h-0 flex-col">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isConnected={!!roomId}
          />
        </div>
      </div>
    </div>
  );
};
