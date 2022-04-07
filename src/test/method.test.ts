import { DecoratedClass } from '../common';
import { classContainer } from '../container';
import { DecoratorGenerator } from '../generator';

describe('basic method decorator tests', function() {
  const generator = new DecoratorGenerator();

  interface AnimalMethodContext {
    isMotion: boolean;
  }

  function Motion(): MethodDecorator {
    return generator.methodDecorator({ isMotion: true });
  }

  @DecoratedClass()
  class Bunny {
    @Motion()
    public run(): void {
      console.log('Bunny is running!');
    }
  }

  it('should be motion', function() {
    const bunnyReflector = classContainer.getByConstructor(Bunny);
    const runReflector = bunnyReflector?.getMethod<AnimalMethodContext>('run');
    expect(runReflector?.getValue()).toBe(new Bunny().run);
    expect(runReflector?.getContext('isMotion')).toBe(true);
  });
});