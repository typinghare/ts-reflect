import { ClassContainer, DecoratedClass, DecoratorGenerator, Zone } from '../src/main'

interface AnimalMethodContext {
    isMotion: boolean;
}

describe('Basic method tests.', function() {
    const generator = new DecoratorGenerator();
    const zone = Zone.DEFAULT;

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
        const bunnyClass = ClassContainer.INSTANCE.get(Bunny);
        const runMethod = bunnyClass?.getMethod<AnimalMethodContext>('run');
        expect(runMethod?.getFunction()).toBe(new Bunny().run);
        expect(runMethod?.getContext(zone, 'isMotion')).toBe(true);
    });
});