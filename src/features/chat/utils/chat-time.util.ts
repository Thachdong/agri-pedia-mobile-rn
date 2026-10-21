const pad = (value: number) => String(value).padStart(2, '0');

/** Time under a message: "14:05" today, "08/10 14:05" this year, "08/10/2025 14:05" before. Local time. */
export function formatMessageTime(value: string, now: Date = new Date()): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  if (date.toDateString() === now.toDateString()) return time;
  const day = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
  return date.getFullYear() === now.getFullYear() ? `${day} ${time}` : `${day}/${date.getFullYear()} ${time}`;
}
