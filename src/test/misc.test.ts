import { findOne } from '../misc';

describe('misc tests', function() {
  it('should find the specified element', function() {
    const set = new Set(['What', 'Which', 'Why', 'When', 'Who', 'How']);

    expect(findOne(set, (e) => e.includes('H'))).toBe('How');
    expect(findOne(set, (e)=> e.includes('Z'))).toBeNull();
  });
});