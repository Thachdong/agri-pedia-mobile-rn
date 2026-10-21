import { CHAT_REPORT_LABEL } from '../constants/chat.constants';

/** Vietnam time, fixed — the text is stored in the message, it must not depend on the sender's time zone. */
const VN_OFFSET_MS = 7 * 60 * 60_000;
const pad = (value: number) => String(value).padStart(2, '0');

/** "20/10/2026 14:30" in UTC+7 (Intl time zones are not reliable on every Hermes build). */
const formatReportTime = (iso: string) => {
  const date = new Date(new Date(iso).getTime() + VN_OFFSET_MS);
  return `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}/${date.getUTCFullYear()} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
};

/**
 * Text of a DIAGNOSIS_REPORT message (`message` is required) — the server sends no crop / time with it, so bubbles and
 * previews show this: "Báo cáo chẩn đoán · Lúa · 20/10/2026 14:30" (time = when the diagnosis was created). Same as web.
 */
export const formatReportMessage = (cropName: string, diagnosedAt: string) =>
  [CHAT_REPORT_LABEL, cropName, formatReportTime(diagnosedAt)].join(' · ');
