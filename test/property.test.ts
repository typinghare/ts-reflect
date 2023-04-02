import { ClassContainer, DecoratedClass, DecoratorGenerator, Zone } from '../src/main'

interface AnimalPropertyContext {
    pattern: string
}

describe('Basic property tests.', function () {
    const generator = new DecoratorGenerator()
    const zone = Zone.DEFAULT

    function Caption(pattern: string): PropertyDecorator {
        return generator.generatePropertyDecorator<AnimalPropertyContext>({ pattern })
    }

    @DecoratedClass()
    class Bunny {
        @Caption(`(*) miles per hour`)
        public movingSpeed: number = 0
    }

    /**
     * Returns a moving speed caption of a bunny.
     * @param bunny
     */
    function getMovingSpeed(bunny: Bunny) {
        const movingSpeed = bunny.movingSpeed

        const bunnyClass = ClassContainer.INSTANCE.get(Bunny)
        const pattern = bunnyClass?.getProperty<AnimalPropertyContext>('movingSpeed')?.getContext(zone, 'pattern')

        // pattern match
        return pattern?.replace(/\(\*\)/g, movingSpeed.toString())
    }

    it('Accessing property context.', function () {
        const bunny = new Bunny()
        bunny.movingSpeed = 7
        expect(getMovingSpeed(bunny)).toBe('7 miles per hour')
    })
})
