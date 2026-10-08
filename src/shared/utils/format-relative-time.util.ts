const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

/**
 * ISO / Date → "vừa xong", "5 phút trước", "3 giờ trước", "hôm qua", "2 tháng trước", "năm ngoái"...
 * Same output as web (`Intl.RelativeTimeFormat('vi-VN', { numeric: 'auto' })`), written by hand: Hermes has no
 * RelativeTimeFormat. A time in the future (device clock behind the server) reads "vừa xong".
 * `now` is a parameter so the function stays pure (tests, one reference time for a whole list).
 */
export function formatRelativeTime(value: string | Date, now: number = Date.now()): string {
  const seconds = Math.round((now - new Date(value).getTime()) / 1000);
  if (Number.isNaN(seconds) || seconds < MINUTE) return 'vừa xong';
  if (seconds < HOUR) return `${Math.trunc(seconds / MINUTE)} phút trước`;
  if (seconds < DAY) return `${Math.trunc(seconds / HOUR)} giờ trước`;
  if (seconds < MONTH) {
    const days = Math.trunc(seconds / DAY);
    return days === 1 ? 'hôm qua' : `${days} ngày trước`;
  }
  if (seconds < YEAR) {
    const months = Math.trunc(seconds / MONTH);
    return months === 1 ? 'tháng trước' : `${months} tháng trước`;
  }
  const years = Math.trunc(seconds / YEAR);
  return years === 1 ? 'năm ngoái' : `${years} năm trước`;
}
