import { DecoratedClass } from '../common';
import { Scanner } from '../control';
import { zone } from '../generator';

describe('basic method decorator tests', function() {
  const scanner = Scanner.getInstance({
    rootPath: __dirname
  });
  const classCollector = scanner.classCollector;
  const myZone = Symbol('myZone');

  interface AnimalMethodContext {
    isMotion: boolean;
  }

  function Motion(): MethodDecorator {
    return zone(myZone).methodDecorator({ isMotion: true });
  }

  @DecoratedClass()
  class Bunny {
    @Motion()
    public run(): void {
      console.log('Bunny is running!');
    }
  }

  it('should be motion', function() {
    const bunnyReflector = classCollector.getByConstructor(Bunny);
    const runReflector = bunnyReflector?.getMethod<AnimalMethodContext>('run');
    expect(runReflector?.getValue()).toBe(new Bunny().run);
    expect(runReflector?.getContext(myZone, 'isMotion')).toBe(true);
  });
});