import { schema, v } from '@/shared/lib/validation';
import type { TChatMessageFormValues } from '../types/chat.types';

/** Mirrors `chat.message.send` (message 1..2000 chars after trim → CHAT_INVALID_MESSAGE). Same as web. */
export const chatMessageSchema = schema<TChatMessageFormValues>({
  message: v.string().trim().min(1).max(2000).required().messages({ 'string.empty': 'Nhập tin nhắn' }),
});
