import { Reflect } from '../src/main'
import DecoratedClass = Reflect.DecoratedClass


interface AnimalMethodContext {
    isMotion: boolean;
}

describe('Basic method tests.', function() {
    const generator = new Reflect.DecoratorGenerator();
    const zone = Reflect.Zone.DEFAULT;

    function Motion(): MethodDecorator {
        return generator.generateMethodDecorator<AnimalMethodContext>({ isMotion: true });
    }

    @DecoratedClass()
    class Bunny {
        @Motion()
        public run(): void {
            console.log('This bunny is running!');
        }
    }

    it('Test accessing context from method reflector.', function() {
        const bunnyClass = Reflect.ClassContainer.INSTANCE.get(Bunny);
        const runMethod = bunnyClass?.getMethod<AnimalMethodContext>('run');
        expect(runMethod?.getFunction()).toBe(new Bunny().run);
        expect(runMethod?.getContext(zone, 'isMotion')).toBe(true);
    });
});