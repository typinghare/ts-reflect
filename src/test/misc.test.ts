import { findOne, getAccessorMap, getMethodSet } from '../misc';

describe('misc tests', function() {
  it('should find the specified element', function() {
    const set = new Set(['What', 'Which', 'Why', 'When', 'Who', 'How']);

    expect(findOne(set, (e) => e.includes('H'))).toBe('How');
    expect(findOne(set, (e) => e.includes('Z'))).toBeNull();
  });

  it('should get a correct method set', function() {
    class Test {
      public a() {
      }

      protected b() {
      }

      public get c() {
        return;
      }
    }

    const set = getMethodSet(new Test().constructor);
    expect(set.size).toBe(3);

    const names: string[] = [];
    set.forEach(method => {
      names.push(method.name);
    });

    expect(names).toContain('a');
    expect(names).toContain('b');
    expect(names).not.toContain('c');

  });

  it('should get a correct accessor map', function() {
    class Test {
      public get a() {
        return;
      }

      public set b(value: string) {
        console.log(value);
      }

      public c() {
      }
    }

    const map = getAccessorMap(new Test().constructor);
    expect(map.size).toBe(2);

    const names: string[] = [];
    for (let n of map.keys()) {
      names.push(n);
    }

    expect(names).toContain('a');
    expect(names).toContain('b');
    expect(names).not.toContain('c');
  });
});