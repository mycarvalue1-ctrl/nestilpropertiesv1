import { cn } from './utils';

describe('cn', () => {
  it('should merge class names correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const hasError = false;
    expect(cn('base', isActive && 'active', hasError && 'error')).toBe('base active');
  });

  it('should override conflicting tailwind classes', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('should handle a mix of strings, objects, and arrays', () => {
    expect(cn('foo', { bar: true, baz: false }, ['qux'])).toBe('foo bar qux');
  });

  it('should return an empty string for falsy values', () => {
    expect(cn(null, undefined, false, '')).toBe('');
  });
});
