/**
 * ============================================================================
 * IMPORTANT NOTICE / DISCLAIMER:
 * This application is a LOCAL DEMO & LEARNING PROJECT ONLY.
 * It is NOT intended for public deployment or commercial production use.
 * 
 * A production-ready version of a random video chat app requires:
 * 1. Mandatory Age Verification (18+ / Parental Controls).
 * 2. Automated Content Moderation (real-time video/image classification & text filters).
 * 3. User Reporting, Blocking, and Abuse Monitoring Mechanisms.
 * 4. Rate Limiting, Anti-Spam, and IP/Device Banning capabilities.
 * 5. TURN Servers (CoTURN / Twilio) alongside STUN for symmetric NAT traversal.
 * 6. Legal Compliance & Terms of Service Review (COPPA, GDPR, Privacy Policies).
 * ============================================================================
 */

import { Server, Socket } from 'socket.io';

/**
 * IN-MEMORY STATE FOR RANDOM MATCHING QUEUE & ROOMS
 */
const waitingQueue: string[] = [];
const activeRooms = new Map<string, { p1: string; p2: string }>();
const userRooms = new Map<string, string>();

/**
 * Broadcast current server stats (online users, queue size) to all connected clients.
 */
function broadcastStats(io: Server) {
  const onlineCount = io.sockets.sockets.size;
  const inQueueCount = waitingQueue.length;
  io.emit('server_stats', { onlineCount, inQueueCount });
}

/**
 * Removes a socket from the waiting queue if present.
 */
function removeFromQueue(socketId: string) {
  const index = waitingQueue.indexOf(socketId);
  if (index !== -1) {
    waitingQueue.splice(index, 1);
  }
}

/**
 * Cleans up active room for a given socket, notifying the room partner if applicable.
 */
function leaveActiveRoom(io: Server, socketId: string, isDisconnecting = false): string | null {
  const roomId = userRooms.get(socketId);
  if (!roomId) return null;

  const room = activeRooms.get(roomId);
  if (room) {
    const partnerId = room.p1 === socketId ? room.p2 : room.p1;
    
    // Clean up room records
    activeRooms.delete(roomId);
    userRooms.delete(room.p1);
    userRooms.delete(room.p2);

    // Notify the partner that their peer has left
    const partnerSocket = io.sockets.sockets.get(partnerId);
    if (partnerSocket) {
      partnerSocket.leave(roomId);
      partnerSocket.emit('partner_left', {
        reason: isDisconnecting ? 'Partner disconnected' : 'Partner left the chat'
      });
    }
  }

  const socket = io.sockets.sockets.get(socketId);
  if (socket) {
    socket.leave(roomId);
  }

  return roomId;
}

/**
 * Initializes Socket.IO event handlers for WebRTC Signaling & Queueing.
 */
export function setupSignalingServer(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);
    broadcastStats(io);

    /**
     * Event: join_queue
     * Triggered when user clicks "Start Chat" or "Next".
     */
    socket.on('join_queue', () => {
      console.log(`[Queue] Socket ${socket.id} requested to join queue.`);

      // Leave any existing active room
      leaveActiveRoom(io, socket.id);

      // Ensure socket is not already in waiting queue
      removeFromQueue(socket.id);

      // Clean up dead sockets from the waiting queue
      while (waitingQueue.length > 0) {
        const potentialPartnerId = waitingQueue[0];
        const partnerSocket = io.sockets.sockets.get(potentialPartnerId);

        if (!partnerSocket || partnerSocket.id === socket.id) {
          waitingQueue.shift();
          continue;
        }

        // We found a valid partner! Pop partner from queue
        waitingQueue.shift();

        const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        // Both sockets join the socket.io room
        socket.join(roomId);
        partnerSocket.join(roomId);

        // Store active room mapping
        activeRooms.set(roomId, { p1: partnerSocket.id, p2: socket.id });
        userRooms.set(partnerSocket.id, roomId);
        userRooms.set(socket.id, roomId);

        console.log(`[Queue] Paired ${partnerSocket.id} and ${socket.id} in room ${roomId}`);

        /**
         * WEBRTC SIGNALING ROLE ASSIGNMENT:
         * One partner must act as the 'initiator' (creates the WebRTC SDP offer),
         * while the other acts as the 'receiver' (waits for offer, creates SDP answer).
         */
        partnerSocket.emit('matched', {
          roomId,
          isInitiator: true,
          peerId: socket.id
        });

        socket.emit('matched', {
          roomId,
          isInitiator: false,
          peerId: partnerSocket.id
        });

        broadcastStats(io);
        return;
      }

      // If no waiting partner was found, add this socket to waiting queue
      waitingQueue.push(socket.id);
      socket.emit('waiting_in_queue');
      broadcastStats(io);
    });

    /**
     * Event: leave_queue
     * Triggered when user clicks "Stop" while waiting.
     */
    socket.on('leave_queue', () => {
      console.log(`[Queue] Socket ${socket.id} left queue.`);
      removeFromQueue(socket.id);
      broadcastStats(io);
    });

    /**
     * Event: leave_chat
     * Triggered when user clicks "Next" or "Stop" during active video chat.
     */
    socket.on('leave_chat', (data?: { requeue?: boolean }) => {
      console.log(`[Chat] Socket ${socket.id} requested to leave chat (requeue: ${data?.requeue}).`);
      removeFromQueue(socket.id);
      leaveActiveRoom(io, socket.id);

      if (data?.requeue) {
        // Re-trigger queue joining for instant matching
        socket.emit('trigger_requeue');
      }

      broadcastStats(io);
    });

    /**
     * WEBRTC SIGNALING RELAYS
     * The server acts strictly as a transparent relay for WebRTC metadata.
     * WebRTC connection establishment steps:
     * 1. Initiator creates SDP Offer -> sends to server -> server relays to Receiver
     * 2. Receiver sets Remote SDP -> creates SDP Answer -> sends to server -> server relays to Initiator
     * 3. Both peers discover local ICE Candidates -> send to server -> server relays to opposite peer
     */

    // Relay SDP Offer
    socket.on('signal_offer', ({ roomId, offer }: { roomId: string; offer: any }) => {
      console.log(`[Signaling] Offer received from ${socket.id} for room ${roomId}`);
      socket.to(roomId).emit('signal_offer', { offer });
    });

    // Relay SDP Answer
    socket.on('signal_answer', ({ roomId, answer }: { roomId: string; answer: any }) => {
      console.log(`[Signaling] Answer received from ${socket.id} for room ${roomId}`);
      socket.to(roomId).emit('signal_answer', { answer });
    });

    // Relay ICE Candidate
    socket.on('signal_ice_candidate', ({ roomId, candidate }: { roomId: string; candidate: any }) => {
      console.log(`[Signaling] ICE Candidate from ${socket.id} for room ${roomId}`);
      socket.to(roomId).emit('signal_ice_candidate', { candidate });
    });

    /**
     * Event: send_chat_message
     * Relays text chat message to the matched peer in the room.
     */
    socket.on('send_chat_message', ({ roomId, message }: { roomId: string; message: string }) => {
      if (!message || !message.trim()) return;
      socket.to(roomId).emit('receive_chat_message', {
        message: message.trim(),
        sender: 'stranger',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    });

    /**
     * Event: disconnect
     * Clean up queue and notify room partner upon network or tab closure.
     */
    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
      removeFromQueue(socket.id);
      leaveActiveRoom(io, socket.id, true);
      broadcastStats(io);
    });
  });
}
