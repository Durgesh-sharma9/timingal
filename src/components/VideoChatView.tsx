import React, { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Loader2, User, UserX, Shield, Volume2, Sparkles, AlertCircle } from 'lucide-react';
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

  // Refs for WebRTC & Socket.IO
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const onStatsUpdateRef = useRef(onStatsUpdate);
  const roomIdRef = useRef<string | null>(null);

  // Keep onStatsUpdate ref current
  useEffect(() => {
    onStatsUpdateRef.current = onStatsUpdate;
  }, [onStatsUpdate]);

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
      {/* Status Bar */}
      <div className="bg-[#1e293b]/80 border border-slate-800/80 backdrop-blur-md rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs shadow-md shrink-0">
        <div className="flex items-center gap-2.5">
          {isSearching ? (
            <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
          ) : isConnected ? (
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-500" />
          )}
          <span className="font-bold text-slate-200">{statusText}</span>
        </div>

        {roomId && (
          <div className="hidden sm:flex items-center gap-2 text-slate-400 font-mono text-[10px] tracking-wider uppercase font-bold">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>P2P Channel: {roomId.slice(0, 14)}...</span>
          </div>
        )}
      </div>

      {/* Main Grid: Left Side Side-by-Side Videos, Right Side Text Chat */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-3 lg:gap-4 flex-1 min-h-0">
        {/* Videos Container (Takes 2 cols on lg screens) */}
        <div className="lg:col-span-2 flex flex-col gap-3 min-h-0 flex-1 lg:flex-initial">
          <div className="relative flex-1 flex flex-col sm:grid sm:grid-cols-2 gap-3 min-h-0">
            {/* Remote Video (Stranger) */}
            <div className="relative flex-1 sm:flex-initial sm:h-full bg-[#0f172a] border border-slate-800/80 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:border-slate-700 flex items-center justify-center group">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover ${!isConnected ? 'hidden' : 'block'}`}
              />

              {!isConnected && (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                  {isSearching ? (
                    <>
                      <div className="relative flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow-sm">
                          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                        </div>
                        <div className="absolute inset-0 rounded-full border border-indigo-400/10 animate-ping" />
                      </div>
                      <p className="text-sm font-bold text-slate-100">Searching for stranger...</p>
                      <p className="text-xs text-slate-400 max-w-xs">
                        Matching you with available users in the queue.
                      </p>
                    </>
                  ) : roomId ? (
                    <>
                      <div className="relative flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow-sm">
                          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                        </div>
                        <div className="absolute inset-0 rounded-full border border-purple-400/10 animate-ping" />
                      </div>
                      <p className="text-sm font-bold text-slate-100">Match found!</p>
                      <p className="text-xs text-slate-400 max-w-xs">
                        Establishing secure P2P video...
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-full bg-[#1e293b]/50 border border-slate-800 flex items-center justify-center text-slate-400">
                        <UserX className="w-7 h-7" />
                      </div>
                      <p className="text-sm font-bold text-slate-300">Ready to Match</p>
                      <button
                        onClick={handleNextStranger}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-550 hover:from-indigo-400 hover:to-purple-550 text-white font-extrabold text-xs rounded-xl transition-all shadow-md cursor-pointer"
                      >
                        Find Next Stranger
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Overlay Label */}
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-1.5 shadow-sm z-10">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Stranger</span>
              </div>
            </div>

            {/* Local Video (You) */}
            <div className="absolute bottom-3 right-3 w-28 h-36 z-20 shadow-2xl border-2 border-slate-800 sm:relative sm:bottom-0 sm:right-0 sm:w-full sm:h-full sm:border sm:border-slate-800 sm:shadow-md bg-[#0f172a] rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 hover:border-slate-700 flex items-center justify-center group">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isMirrored ? '-scale-x-100' : ''} ${isCameraOff ? 'hidden' : 'block'}`}
              />

              {isCameraOff && (
                <div className="flex flex-col items-center justify-center text-slate-400 p-6 space-y-2">
                  <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                    <User className="w-7 h-7" />
                  </div>
                  <p className="text-xs font-bold text-slate-300">Camera Paused</p>
                </div>
              )}

              {/* Overlay Label */}
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-1.5 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline">You</span>
                {isMuted && <span className="text-[10px] text-rose-450 ml-1 font-bold">(Muted)</span>}
              </div>
            </div>
          </div>

          {/* Video Action Controls Bar */}
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

        {/* Text Chat Panel (1 col on lg screens) */}
        <div className="lg:col-span-1 h-[280px] sm:h-[350px] lg:h-full min-h-0 flex flex-col shrink-0 lg:shrink-1">
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
