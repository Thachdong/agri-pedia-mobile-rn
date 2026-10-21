import { reviewSchema } from './review.schema';

const errorPaths = (values: object) =>
  reviewSchema.validate({ star: 5, content: 'Tốt', ...values }, { abortEarly: false }).error?.details.map((d) => d.path[0]) ?? [];

describe('reviewSchema', () => {
  it('star 1..5 integer (0 = not chosen)', () => {
    expect(errorPaths({})).toEqual([]);
    expect(errorPaths({ star: 0 })).toContain('star');
    expect(errorPaths({ star: 6 })).toContain('star');
    expect(errorPaths({ star: 2.5 })).toContain('star');
  });

  it('content 1..1000 after trim', () => {
    expect(errorPaths({ content: '   ' })).toContain('content');
    expect(errorPaths({ content: 'a'.repeat(1001) })).toContain('content');
    expect(reviewSchema.validate({ star: 4, content: '  ok  ' }).value?.content).toBe('ok');
  });
});
