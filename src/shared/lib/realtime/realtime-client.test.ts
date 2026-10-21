import { io } from 'socket.io-client';
import { refreshTokens } from '@/shared/lib/auth';
import { APP_ERROR_CODE, isAppError } from '@/shared/lib/http';
import { realtimeClient, realtimeConnection } from './realtime-client';

jest.mock('@/shared/lib/auth', () => ({
  refreshTokens: jest.fn(async () => null),
  tokenStore: { get: () => ({ accessToken: 'a1', refreshToken: 'r1' }) },
}));

type THandler = (...args: unknown[]) => void;
const handlers = new Map<string, THandler[]>();
const emitWithAck = jest.fn();
const mockSocket = {
  connected: false,
  active: false,
  on: jest.fn((event: string, handler: THandler) => handlers.set(event, [...(handlers.get(event) ?? []), handler])),
  off: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  timeout: jest.fn(() => ({ emitWithAck })),
};
jest.mock('socket.io-client', () => ({ io: jest.fn(() => mockSocket) }));

const fire = (event: string, ...args: unknown[]) => handlers.get(event)?.forEach((handler) => handler(...args));

describe('realtimeClient', () => {
  beforeEach(() => {
    emitWithAck.mockReset();
    jest.mocked(refreshTokens).mockClear();
  });

  it('one socket, websocket only, not auto-connected; auth sends the current access token', async () => {
    emitWithAck.mockResolvedValue({ ok: true });
    await realtimeClient.emitWithAck('x', {});
    const [, options] = jest.mocked(io).mock.calls[0] as unknown as [string, Record<string, unknown>];
    expect(options).toMatchObject({ autoConnect: false, transports: ['websocket'] });
    const auth = jest.fn();
    (options.auth as (cb: typeof auth) => void)(auth);
    expect(auth).toHaveBeenCalledWith({ token: 'a1' });
  });

  it('ack data → resolved', async () => {
    emitWithAck.mockResolvedValue({ roomId: 'r1' });
    await expect(realtimeClient.emitWithAck('chat.room.enter', { roomId: 'r1' })).resolves.toEqual({ roomId: 'r1' });
    expect(emitWithAck).toHaveBeenCalledWith('chat.room.enter', { roomId: 'r1' });
  });

  it('ack { error } → AppError with the server code', async () => {
    emitWithAck.mockResolvedValue({ error: { code: 'CHAT_ROOM_NOT_FOUND', message: 'not found' } });
    const error = await realtimeClient.emitWithAck('chat.room.enter', {}).catch((e: unknown) => e);
    expect(isAppError(error) && error.code).toBe('CHAT_ROOM_NOT_FOUND');
  });

  it('no ack in time → AppError TIMEOUT', async () => {
    emitWithAck.mockRejectedValue(new Error('operation has timed out'));
    const error = await realtimeClient.emitWithAck('x', {}).catch((e: unknown) => e);
    expect(isAppError(error) && error.code).toBe(APP_ERROR_CODE.TIMEOUT);
  });

  it('handshake rejected for an expired token → one refresh until a connection succeeds', () => {
    realtimeConnection.connect();
    fire('connect_error', new Error('AUTH_INVALID_ACCESS_TOKEN'));
    fire('connect_error', new Error('AUTH_INVALID_ACCESS_TOKEN'));
    expect(refreshTokens).toHaveBeenCalledTimes(1);

    fire('connect');
    expect(realtimeConnection.getStatus()).toBe('connected');
    fire('connect_error', new Error('AUTH_INVALID_ACCESS_TOKEN'));
    expect(refreshTokens).toHaveBeenCalledTimes(2);
  });

  it('other connect errors → no refresh', () => {
    fire('connect');
    fire('connect_error', new Error('xhr poll error'));
    expect(refreshTokens).not.toHaveBeenCalled();
  });
});
