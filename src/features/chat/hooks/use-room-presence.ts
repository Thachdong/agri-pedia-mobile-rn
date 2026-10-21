import { useEffect } from 'react';
import { queryKeys, useAppQueryClient } from '@/shared/lib/query';
import { useRealtimeStatus } from '@/shared/lib/realtime';
import { enterRoom, leaveRoom } from '../services/chat.realtime';

/**
 * While a room is on screen (`active` + `roomId`, socket connected) → `chat.room.enter`: the server marks every
 * message read → refetch rooms (unread back to 0). Off screen → `chat.room.leave`.
 * Re-enters after a reconnect (the server left every room on disconnect).
 */
export function useRoomPresence(roomId: string | null, active: boolean) {
  const client = useAppQueryClient();
  const connected = useRealtimeStatus() === 'connected';

  useEffect(() => {
    if (!roomId || !active || !connected) return;
    enterRoom(roomId)
      .then(() => client.invalidateQueries({ queryKey: queryKeys.chat.rooms() }))
      .catch(() => undefined); // not entered: only "read" is lost, messages still show
    return () => {
      leaveRoom(roomId).catch(() => undefined);
    };
  }, [roomId, active, connected, client]);
}
