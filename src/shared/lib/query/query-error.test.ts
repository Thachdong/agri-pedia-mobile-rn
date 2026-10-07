import { AppError } from '@/shared/lib/http';
import { handleGlobalError, setQueryErrorNotifier } from './query-error';

const error = (status: number, code: string) => new AppError({ status, code, message: 'm' });

describe('handleGlobalError', () => {
  const notifier = jest.fn();

  beforeEach(() => {
    notifier.mockReset();
    setQueryErrorNotifier(notifier);
  });

  afterAll(() => setQueryErrorNotifier(null));

  it('notifies business errors, including a 401 like wrong credentials', () => {
    handleGlobalError(error(401, 'USER_INVALID_CREDENTIALS'));
    handleGlobalError(error(409, 'USER_IDENTIFIER_ALREADY_USED'));
    expect(notifier).toHaveBeenCalledTimes(2);
  });

  // Regression (foundation CP8): every 401 used to be skipped.
  it.each(['AUTH_INVALID_ACCESS_TOKEN', 'USER_INVALID_REFRESH_TOKEN'])('skips session expiry %s', (code) => {
    handleGlobalError(error(401, code));
    expect(notifier).not.toHaveBeenCalled();
  });

  it('skips silent queries/mutations', () => {
    handleGlobalError(error(500, 'X'), { silent: true });
    expect(notifier).not.toHaveBeenCalled();
  });

  it('wraps non-AppError values as UNKNOWN_ERROR', () => {
    handleGlobalError(new Error('boom'));
    expect(notifier).toHaveBeenCalledWith(expect.objectContaining({ code: 'UNKNOWN_ERROR' }));
  });
});
