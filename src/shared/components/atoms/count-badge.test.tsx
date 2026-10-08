import { render, screen } from '@testing-library/react-native';
import { CountBadge, formatCount } from './count-badge';

describe('CountBadge', () => {
  it('0 → nothing', async () => {
    await render(<CountBadge count={0} />);
    expect(screen.toJSON()).toBeNull();
  });

  it('shows the count, max+ above max', async () => {
    await render(<CountBadge count={120} />);
    expect(screen.getByText('99+', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('formatCount: atLeast → N+', () => {
    expect(formatCount(3)).toBe('3');
    expect(formatCount(3, 99, true)).toBe('3+');
  });
});
