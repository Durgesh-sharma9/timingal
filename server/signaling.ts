/**
 * ============================================================================
 * DESTINY SIGNALING SERVER WITH SAFETY & MODERATION INFRASTRUCTURE
 * - Strict In-Memory Queue & Room Management
 * - Client IP Tracking & Ban Enforcement
 * - Real-Time Text Moderation Filter
 * - Abuse Prevention & User Reporting Pipeline
 * ============================================================================
 */

import { Server, Socket } from 'socket.io';
import { moderateText } from './moderation.js';

/**
 * IN-MEMORY STATE
 */
const waitingQueue: string[] = [];
const activeRooms = new Map<string, { p1: string; p2: string }>();
const userRooms = new Map<string, string>();

// Abuse & Ban Tracking
interface BanRecord {
  reason: string;
  expiresAt: number;
}
const bannedIPs = new Map<string, BanRecord>();
const ipStrikes = new Map<string, number>();

/**
 * Helper to extract client IP address accurately
 */
function getClientIp(socket: Socket): string {
  const forwarded = socket.handshake.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return socket.handshake.address || 'unknown';
}

/**
 * Checks if an IP is currently banned
 */
function isIpBanned(ip: string): { banned: boolean; reason?: string; remainingSec?: number } {
  const record = bannedIPs.get(ip);
  if (!record) return { banned: false };

  const now = Date.now();
  if (now > record.expiresAt) {
    bannedIPs.delete(ip);
    return { banned: false };
  }

  const remainingSec = Math.ceil((record.expiresAt - now) / 1000);
  return { banned: true, reason: record.reason, remainingSec };
}

/**
 * Broadcast current server stats (online users, queue size)
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
function leaveActiveRoom(io: Server, socketId: string, isDisconnecting = false, reasonText?: string): string | null {
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
        reason: reasonText || (isDisconnecting ? 'Partner disconnected' : 'Partner left the chat')
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
 * Initializes Socket.IO event handlers for WebRTC Signaling & Moderation.
 */
export function setupSignalingServer(io: Server) {
  io.on('connection', (socket: Socket) => {
    const clientIp = getClientIp(socket);
    console.log(`[Socket.IO] Client connected: ${socket.id} (IP: ${clientIp})`);

    // 1. Check IP Ban Status
    const banCheck = isIpBanned(clientIp);
    if (banCheck.banned) {
      console.warn(`[Security] Rejected banned IP: ${clientIp} (${banCheck.reason})`);
      socket.emit('banned_notice', {
        reason: banCheck.reason,
        remainingSec: banCheck.remainingSec,
      });
      socket.disconnect(true);
      return;
    }

    broadcastStats(io);

    /**
     * Event: join_queue
     */
    socket.on('join_queue', () => {
      // Re-verify ban status
      const recheck = isIpBanned(clientIp);
      if (recheck.banned) {
        socket.emit('banned_notice', { reason: recheck.reason, remainingSec: recheck.remainingSec });
        socket.disconnect(true);
        return;
      }

      console.log(`[Queue] Socket ${socket.id} joining queue.`);

      // Leave any existing active room
      leaveActiveRoom(io, socket.id);
      removeFromQueue(socket.id);

      // Clean up dead sockets from the waiting queue
      while (waitingQueue.length > 0) {
        const potentialPartnerId = waitingQueue[0];
        const partnerSocket = io.sockets.sockets.get(potentialPartnerId);

        if (!partnerSocket || partnerSocket.id === socket.id) {
          waitingQueue.shift();
          continue;
        }

        // Valid partner found
        waitingQueue.shift();
        const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        socket.join(roomId);
        partnerSocket.join(roomId);

        activeRooms.set(roomId, { p1: partnerSocket.id, p2: socket.id });
        userRooms.set(partnerSocket.id, roomId);
        userRooms.set(socket.id, roomId);

        console.log(`[Queue] Paired ${partnerSocket.id} and ${socket.id} in room ${roomId}`);

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

      // No waiting partner found
      waitingQueue.push(socket.id);
      socket.emit('waiting_in_queue');
      broadcastStats(io);
    });

    /**
     * Event: leave_queue
     */
    socket.on('leave_queue', () => {
      removeFromQueue(socket.id);
      broadcastStats(io);
    });

    /**
     * Event: leave_chat
     */
    socket.on('leave_chat', (data?: { requeue?: boolean }) => {
      removeFromQueue(socket.id);
      leaveActiveRoom(io, socket.id);

      if (data?.requeue) {
        socket.emit('trigger_requeue');
      }

      broadcastStats(io);
    });

    /**
     * WEBRTC SIGNALING RELAYS
     */
    socket.on('signal_offer', ({ roomId, offer }: { roomId: string; offer: any }) => {
      socket.to(roomId).emit('signal_offer', { offer });
    });

    socket.on('signal_answer', ({ roomId, answer }: { roomId: string; answer: any }) => {
      socket.to(roomId).emit('signal_answer', { answer });
    });

    socket.on('signal_ice_candidate', ({ roomId, candidate }: { roomId: string; candidate: any }) => {
      socket.to(roomId).emit('signal_ice_candidate', { candidate });
    });

    /**
     * Event: send_chat_message
     * Passes message through AI & heuristic text moderation filter
     */
    socket.on('send_chat_message', async ({ roomId, message }: { roomId: string; message: string }) => {
      if (!message || !message.trim()) return;

      const trimmed = message.trim();
      const moderation = await moderateText(trimmed);

      if (!moderation.isSafe) {
        // Reject message and warn sender
        socket.emit('message_blocked', {
          reason: moderation.reason || 'Message blocked: Violates safety guidelines.',
        });

        // Track strikes for bad behavior
        const currentStrikes = (ipStrikes.get(clientIp) || 0) + 1;
        ipStrikes.set(clientIp, currentStrikes);

        if (currentStrikes >= 5) {
          // Ban IP for 1 hour
          bannedIPs.set(clientIp, {
            reason: 'Excessive safety policy violations (Inappropriate chat text).',
            expiresAt: Date.now() + 60 * 60 * 1000,
          });
          socket.emit('banned_notice', {
            reason: 'Banned for repeated safety policy violations.',
            remainingSec: 3600,
          });
          socket.disconnect(true);
        }
        return;
      }

      // Safe message: relay to peer
      socket.to(roomId).emit('receive_chat_message', {
        message: trimmed,
        sender: 'stranger',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    });

    /**
     * Event: report_user
     * Triggered when a user reports their matched peer
     */
    socket.on('report_user', ({
      roomId,
      reason,
      details,
    }: {
      roomId: string;
      reason: string;
      details?: string;
    }) => {
      console.warn(`[Report] Socket ${socket.id} reported user in room ${roomId}. Reason: ${reason}`);

      const room = activeRooms.get(roomId);
      if (!room) return;

      const offenderId = room.p1 === socket.id ? room.p2 : room.p1;
      const offenderSocket = io.sockets.sockets.get(offenderId);

      if (offenderSocket) {
        const offenderIp = getClientIp(offenderSocket);
        const strikes = (ipStrikes.get(offenderIp) || 0) + 1;
        ipStrikes.set(offenderIp, strikes);

        // Immediate ban for high-severity violations or 2+ strikes
        const isSevere = /nudity|underage|harassment/i.test(reason);
        if (isSevere || strikes >= 2) {
          const banDurationMs = 2 * 60 * 60 * 1000; // 2 hours
          bannedIPs.set(offenderIp, {
            reason: `Account suspended: Reported for ${reason}`,
            expiresAt: Date.now() + banDurationMs,
          });

          offenderSocket.emit('banned_notice', {
            reason: `You have been temporarily suspended for violating Community Guidelines (${reason}).`,
            remainingSec: Math.ceil(banDurationMs / 1000),
          });
          offenderSocket.disconnect(true);
        } else {
          offenderSocket.emit('warning_notice', {
            message: 'You have been reported by your chat partner. Continued violations will result in an IP ban.',
          });
        }
      }

      // Close the room and notify reporter
      leaveActiveRoom(io, socket.id, false, 'Chat ended due to report submission');
      socket.emit('report_confirmed', {
        message: 'Thank you for keeping Destiny safe. The user has been flagged and blocked.',
      });
      broadcastStats(io);
    });

    /**
     * Event: disconnect
     */
    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
      removeFromQueue(socket.id);
      leaveActiveRoom(io, socket.id, true);
      broadcastStats(io);
    });
  });
}
