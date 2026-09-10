import React, { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  Loader2, 
  User, 
  UserX, 
  Shield, 
  Sparkles, 
  AlertCircle, 
  Send, 
  ShieldAlert, 
  EyeOff, 
  Eye, 
  AlertTriangle,
  Flag,
  Lock
} from 'lucide-react';
import { ChatMessage, ServerStats } from '../types';
import { VideoControls } from './VideoControls';
import { ChatPanel } from './ChatPanel';
import { ReportModal } from './ReportModal';

interface VideoChatViewProps {
  onStopChat: () => void;
  onStatsUpdate: (stats: ServerStats) => void;
}

const DEFAULT_ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    {
      urls: [
        'turn:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:443',
        'turn:openrelay.metered.ca:443?transport=tcp',
      ],
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
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

  // AI Moderation & Safety Shield State
  const [isSafeModeBlurred, setIsSafeModeBlurred] = useState<boolean>(false);
  const [safetyWarning, setSafetyWarning] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [banNotice, setBanNotice] = useState<{ reason: string; remainingSec?: number } | null>(null);

  // Messages State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mobileInput, setMobileInput] = useState('');

  // Refs for WebRTC, ICE & Socket.IO
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const onStatsUpdateRef = useRef(onStatsUpdate);
  const roomIdRef = useRef<string | null>(null);
  const mobileChatRef = useRef<HTMLDivElement>(null);
  const iceConfigRef = useRef<RTCConfiguration>(DEFAULT_ICE_SERVERS);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameScanIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
    setIsSafeModeBlurred(false);
    setSafetyWarning(null);
    setRoomId(null);
    roomIdRef.current = null;

    if (frameScanIntervalRef.current) {
      clearInterval(frameScanIntervalRef.current);
      frameScanIntervalRef.current = null;
    }
  }, []);

  /**
   * Initializes WebRTC RTCPeerConnection with dynamic STUN/TURN servers
   */
  const createPeerConnection = useCallback((currentRoomId: string) => {
    cleanupPeerConnection();

    setRoomId(currentRoomId);
    roomIdRef.current = currentRoomId;

    console.log(`[WebRTC] Creating new RTCPeerConnection with TURN/STUN for room: ${currentRoomId}`);
    const pc = new RTCPeerConnection(iceConfigRef.current);
    pcRef.current = pc;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pc.ontrack = (event) => {
      console.log('[WebRTC] Remote track received:', event.track.kind);
      if (remoteVideoRef.current) {
        if (event.streams && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
        } else {
          if (!remoteVideoRef.current.srcObject) {
            remoteVideoRef.current.srcObject = new MediaStream();
          }
          (remoteVideoRef.current.srcObject as MediaStream).addTrack(event.track);
        }
        remoteVideoRef.current.play().catch((err) => {
          console.warn('[WebRTC] Error playing remote video:', err);
        });
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('signal_ice_candidate', {
          roomId: currentRoomId,
          candidate: event.candidate,
        });
      }
    };

    const checkConnectionState = () => {
      const connState = pc.connectionState;
      const iceState = pc.iceConnectionState;

      if (connState === 'connected' || iceState === 'connected' || iceState === 'completed') {
        setStatusText('Connected! Secure P2P Live.');
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
   * Real-time Video Frame AI Scanner
   * Periodically captures remote video frames and runs AI moderation
   */
  useEffect(() => {
    if (!isConnected || !remoteVideoRef.current) return;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const scanRemoteFrame = async () => {
      const video = remoteVideoRef.current;
      if (!video || video.readyState < 2 || video.videoWidth === 0) return;

      try {
        const canvas = canvasRef.current!;
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);

        const res = await fetch('/api/moderate-frame', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: dataUrl }),
        });

        if (res.ok) {
          const result = await res.json();
          if (result.isSafe === false) {
            console.warn('[AI Shield] Inappropriate content detected in video frame:', result.flagReason);
            setIsSafeModeBlurred(true);
            const reason = result.flagReason || 'Inappropriate or prohibited content detected.';
            setSafetyWarning(`AI Safety Shield Engaged: ${reason}`);
            addSystemMessage(`⚠️ Safety Shield: Stranger video automatically blurred due to safety policy violation.`);
          }
        }
      } catch (err) {
        console.warn('[AI Shield] Frame scan skipped:', err);
      }
    };

    // Run first scan after 3s, then every 7s
    const initialTimeout = setTimeout(scanRemoteFrame, 3000);
    const interval = setInterval(scanRemoteFrame, 7000);
    frameScanIntervalRef.current = interval;

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isConnected]);

  /**
   * Initialize ICE servers, UserMedia and Socket connection
   */
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        // Step 1: Fetch dedicated TURN & STUN servers from server
        try {
          const iceRes = await fetch('/api/ice-servers');
          if (iceRes.ok) {
            const data = await iceRes.json();
            if (data && data.iceServers) {
              iceConfigRef.current = data;
              console.log('[WebRTC] Loaded dynamic ICE servers (TURN + STUN).');
            }
          }
        } catch {
          console.warn('[WebRTC] Using fallback STUN/TURN servers.');
        }

        // Step 2: Request user media (Camera & Mic)
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

        // Step 3: Initialize Socket.IO connection
        const socket = io({
          transports: ['websocket', 'polling'],
        });
        socketRef.current = socket;

        // Banned Notice from Server
        socket.on('banned_notice', (data: { reason: string; remainingSec?: number }) => {
          console.warn('[Security] IP Banned:', data);
          setBanNotice(data);
          cleanupPeerConnection();
        });

        // Warning Notice from Server
        socket.on('warning_notice', (data: { message: string }) => {
          addSystemMessage(`⚠️ Notice: ${data.message}`);
        });

        // Chat text blocked by AI / Profanity moderation
        socket.on('message_blocked', (data: { reason: string }) => {
          addSystemMessage(`⚠️ Message Blocked: ${data.reason}`);
        });

        // Report confirmed
        socket.on('report_confirmed', (data: { message: string }) => {
          addSystemMessage(`🛡️ ${data.message}`);
        });

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

        // Event: Matched with another user
        socket.on('matched', async ({ roomId: newRoomId, isInitiator }: { roomId: string; isInitiator: boolean }) => {
          console.log(`[Socket] Matched! Room: ${newRoomId}, isInitiator: ${isInitiator}`);
          setRoomId(newRoomId);
          roomIdRef.current = newRoomId;
          setIsSearching(false);
          setIsSafeModeBlurred(false);
          setSafetyWarning(null);
          setStatusText(isInitiator ? 'Match found! Initiating WebRTC offer...' : 'Match found! Waiting for video offer...');
          addSystemMessage('Connected to stranger. Communications are encrypted.');

          const pc = createPeerConnection(newRoomId);

          if (isInitiator) {
            try {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              socket.emit('signal_offer', { roomId: newRoomId, offer });
            } catch (err) {
              console.error('[WebRTC] Error creating offer:', err);
            }
          }
        });

        // Event: Incoming WebRTC SDP Offer
        socket.on('signal_offer', async ({ offer }: { offer: RTCSessionDescriptionInit }) => {
          if (!pcRef.current || !socketRef.current) return;

          try {
            await pcRef.current.setRemoteDescription(offer);

            for (const cand of pendingCandidatesRef.current) {
              await pcRef.current.addIceCandidate(cand);
            }
            pendingCandidatesRef.current = [];

            const answer = await pcRef.current.createAnswer();
            await pcRef.current.setLocalDescription(answer);

            const activeRoom = roomIdRef.current;
            if (activeRoom) {
              socket.emit('signal_answer', { roomId: activeRoom, answer });
            }
          } catch (err) {
            console.error('[WebRTC] Error handling offer:', err);
          }
        });

        // Event: Incoming WebRTC SDP Answer
        socket.on('signal_answer', async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
          if (!pcRef.current) return;

          try {
            await pcRef.current.setRemoteDescription(answer);

            for (const cand of pendingCandidatesRef.current) {
              await pcRef.current.addIceCandidate(cand);
            }
            pendingCandidatesRef.current = [];
          } catch (err) {
            console.error('[WebRTC] Error setting remote description from answer:', err);
          }
        });

        // Event: Incoming ICE Candidate
        socket.on('signal_ice_candidate', async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
          if (!pcRef.current) return;

          try {
            if (pcRef.current.remoteDescription && pcRef.current.remoteDescription.type) {
              await pcRef.current.addIceCandidate(candidate);
            } else {
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
          cleanupPeerConnection();
          addSystemMessage(`Stranger disconnected. (${reason})`);
          setStatusText('Stranger left the chat.');
        });

        // Event: Trigger requeue
        socket.on('trigger_requeue', () => {
          cleanupPeerConnection();
          setMessages([]);
          addSystemMessage('Searching for a new stranger...');
          socket.emit('join_queue');
        });

        // Initial queue join
        socket.emit('join_queue');
      } catch (err) {
        console.error('Failed to initialize media/socket:', err);
        setStatusText('Camera or microphone permission denied. Please allow access.');
      }
    }

    init();

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
   * Action: "Next Stranger"
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
   * Action: "Stop" / Leave
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
   * Action: Submit Abuse Report
   */
  const handleSubmitReport = (reason: string, details?: string) => {
    if (!socketRef.current || !roomId) return;

    socketRef.current.emit('report_user', {
      roomId,
      reason,
      details,
    });

    handleNextStranger();
  };

  /**
   * Action: Send text message
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

  const handleToggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const handleToggleCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(!isCameraOff);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex flex-col gap-2.5 h-[calc(100vh-55px)] lg:h-auto min-h-0 overflow-hidden relative">
      {/* Ban Suspension Screen Overlay */}
      {banNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-white border border-rose-200 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900">Access Suspended</h2>
              <p className="text-xs text-rose-600 mt-1 font-semibold">{banNotice.reason}</p>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your IP address has been temporarily banned from Destiny due to repeated violations of community guidelines.
            </p>
            {banNotice.remainingSec && (
              <p className="text-[11px] text-slate-500 font-mono">
                Cooldown remaining: {Math.ceil(banNotice.remainingSec / 60)} minutes
              </p>
            )}
            <button
              onClick={handleStop}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Exit Application
            </button>
          </div>
        </div>
      )}

      {/* Top Session Status Bar */}
      <div className="bg-white/90 border border-slate-200/90 backdrop-blur-xl rounded-xl px-3.5 py-2 flex items-center justify-between text-xs shadow-2xs shrink-0">
        <div className="flex items-center gap-2">
          {isSearching ? (
            <div className="relative flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
              <span className="absolute w-1.5 h-1.5 rounded-full bg-indigo-600" />
            </div>
          ) : isConnected ? (
            <div className="relative flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="absolute w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          )}
          <span className="font-bold text-slate-800 text-xs">{statusText}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Shield Active Indicator */}
          {isConnected && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <Shield className="w-3 h-3 text-emerald-600" />
              AI Shield Active
            </span>
          )}

          {roomId && (
            <div className="hidden sm:flex items-center gap-1.5 text-slate-500 font-mono text-[10px] tracking-wider uppercase font-semibold bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
              <Lock className="w-3 h-3 text-indigo-600" />
              <span>P2P/TURN: {roomId.slice(0, 8)}</span>
            </div>
          )}
        </div>
      </div>

      {/* AI Safety Shield Alert Banner */}
      {safetyWarning && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl px-3.5 py-2 text-xs text-rose-800 flex items-center justify-between shadow-2xs shrink-0 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{safetyWarning}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSafeModeBlurred(!isSafeModeBlurred)}
              className="text-[11px] underline font-bold hover:text-rose-950 cursor-pointer"
            >
              {isSafeModeBlurred ? 'Reveal Video' : 'Hide Video'}
            </button>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 rounded-md cursor-pointer"
            >
              Report Stranger
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Video Streams & Text Chat */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-2.5 flex-1 min-h-0">
        {/* Videos Container */}
        <div className="lg:col-span-2 flex flex-col gap-2 min-h-0 flex-1 lg:flex-initial">
          <div className="relative flex-1 flex flex-col sm:grid sm:grid-cols-2 gap-2.5 min-h-0">
            {/* Remote Video Container (Stranger) */}
            <div className="relative flex-1 sm:flex-initial sm:h-full bg-slate-950 border border-slate-200 rounded-2xl overflow-hidden shadow-md flex items-center justify-center group">
              {/* Stranger Video Element with Auto-Blur Shield if flagged */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover transition-all duration-300 ${!isConnected ? 'hidden' : 'block'} ${
                  isSafeModeBlurred ? 'filter blur-3xl scale-110' : ''
                }`}
              />

              {/* Safety Shield Overlay if blurred */}
              {isSafeModeBlurred && isConnected && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-black/60 backdrop-blur-md text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
                    <EyeOff className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Video Blurred for Safety</h4>
                    <p className="text-[11px] text-slate-300 max-w-xs mt-1">
                      Our automated AI moderation detected potentially inappropriate content.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsSafeModeBlurred(false)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      Show Anyway
                    </button>
                    <button
                      onClick={handleNextStranger}
                      className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Skip to Next
                    </button>
                  </div>
                </div>
              )}

              {/* Not Connected Overlay: Radar Searching */}
              {!isConnected && (
                <div className="relative z-10 flex flex-col items-center justify-center p-5 text-center space-y-3">
                  {isSearching ? (
                    <>
                      <div className="relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32">
                        <div className="absolute inset-0 rounded-full border border-indigo-400/35 animate-radar-sonar-1" />
                        <div className="absolute inset-0 rounded-full border border-purple-400/30 animate-radar-sonar-2" />
                        <div className="absolute inset-0 rounded-full border border-pink-400/25 animate-radar-sonar-3" />
                        
                        <div className="w-16 h-16 rounded-full bg-slate-900 border border-indigo-500/40 flex items-center justify-center shadow-lg relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent animate-radar-sweep origin-center" />
                          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin relative z-10" />
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-sm font-bold font-display text-white">Searching for stranger...</p>
                        <p className="text-[11px] text-slate-400 max-w-xs">
                          Matching you with a verified online user.
                        </p>
                      </div>
                    </>
                  ) : roomId ? (
                    <>
                      <div className="relative flex items-center justify-center w-20 h-20">
                        <div className="absolute inset-0 rounded-full border border-purple-400/40 animate-ping" />
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-purple-500/30">
                          <Sparkles className="w-6 h-6 text-white animate-pulse" />
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold font-display text-white">Match Found!</p>
                        <p className="text-[11px] text-slate-400 max-w-xs">
                          Connecting secure WebRTC stream...
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                        <UserX className="w-6 h-6" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold font-display text-slate-200">Chat Ended</p>
                        <p className="text-[11px] text-slate-400">Ready to meet your next match?</p>
                      </div>
                      <button
                        onClick={handleNextStranger}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-lg transition-all shadow-sm cursor-pointer"
                      >
                        Find Next Stranger
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Mobile Chat Overlay */}
              <div
                ref={mobileChatRef}
                className="lg:hidden absolute bottom-3 left-2.5 w-[75%] max-w-[240px] z-30 max-h-[110px] overflow-y-auto flex flex-col gap-1 pointer-events-auto no-scrollbar"
              >
                {messages.map((msg) => {
                  if (msg.sender === 'system') {
                    return (
                      <div key={msg.id} className="self-center py-0.5">
                        <span className="text-[8px] bg-slate-950/80 backdrop-blur-md border border-white/10 text-indigo-300 font-bold px-2 py-0.5 rounded-full">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  const isYou = msg.sender === 'you';
                  return (
                    <div
                      key={msg.id}
                      className={`max-w-[90%] px-2.5 py-1 rounded-lg text-[10px] backdrop-blur-md border text-white shadow-xs ${
                        isYou
                          ? 'bg-indigo-600/90 border-indigo-500/30 self-end rounded-tr-none'
                          : 'bg-slate-900/90 border-white/10 self-start rounded-tl-none'
                      }`}
                    >
                      <span className="font-bold text-[8px] text-slate-300 block mb-0.5">
                        {isYou ? 'You' : 'Stranger'}
                      </span>
                      {msg.text}
                    </div>
                  );
                })}
              </div>

              {/* Stranger Label Badge */}
              <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white flex items-center gap-1.5 shadow-xs z-10">
                <User className="w-3 h-3 text-indigo-400" />
                <span>Stranger</span>
              </div>
            </div>

            {/* Local Video Container (You) */}
            <div className="absolute top-2.5 right-2.5 w-24 h-32 sm:relative sm:top-0 sm:right-0 sm:w-full sm:h-full bg-slate-950 rounded-xl sm:rounded-2xl overflow-hidden shadow-md border-2 border-indigo-500/40 sm:border sm:border-slate-200 flex items-center justify-center group z-20">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isMirrored ? '-scale-x-100' : ''} ${isCameraOff ? 'hidden' : 'block'}`}
              />

              {isCameraOff && (
                <div className="flex flex-col items-center justify-center text-slate-400 p-4 space-y-1.5">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <p className="text-[11px] font-bold text-slate-300">Camera Off</p>
                </div>
              )}

              <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-lg text-[10px] font-bold text-white flex items-center gap-1 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">You</span>
                {isMuted && <span className="text-[9px] text-rose-400 font-bold ml-0.5">(Muted)</span>}
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
            className="lg:hidden flex gap-1.5 p-1.5 bg-white/95 border border-slate-200 rounded-xl shrink-0 shadow-xs"
          >
            <input
              type="text"
              value={mobileInput}
              onChange={(e) => setMobileInput(e.target.value)}
              placeholder={roomId ? "Message stranger..." : "Waiting..."}
              disabled={!roomId}
              className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none disabled:opacity-40"
            />
            <button
              type="submit"
              disabled={!roomId || !mobileInput.trim()}
              className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg transition-all disabled:opacity-30 flex items-center justify-center shrink-0 shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
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
            onReport={() => setIsReportModalOpen(true)}
            isSearching={isSearching}
            isConnected={isConnected}
          />
        </div>

        {/* Text Chat Panel (Desktop) */}
        <div className="hidden lg:flex lg:col-span-1 h-full min-h-0 flex-col">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isConnected={!!roomId}
          />
        </div>
      </div>

      {/* User Report & Abuse Prevention Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitReport={handleSubmitReport}
      />
    </div>
  );
};
