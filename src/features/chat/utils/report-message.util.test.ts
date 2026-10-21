import { formatReportMessage } from './report-message.util';

describe('formatReportMessage', () => {
  it('label · crop · Vietnam time (UTC+7) whatever the device zone', () => {
    expect(formatReportMessage('Lúa', '2026-10-20T07:30:00.000Z')).toBe('Báo cáo chẩn đoán · Lúa · 20/10/2026 14:30');
    expect(formatReportMessage('Sầu riêng', '2026-12-31T20:05:00.000Z')).toBe(
      'Báo cáo chẩn đoán · Sầu riêng · 01/01/2027 03:05',
    );
  });
});
