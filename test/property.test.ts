import { ClassContainer, DecoratedClass, DecoratorGenerator, getClass, Zone } from '../src/main'

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

describe('Double property decorator tests.', function () {
    const generator = new DecoratorGenerator()
    const zone = Zone.DEFAULT

    type PriceContext = {
        taxPercentage: number
        tipsPercentage: number
    }

    function Tax(taxPercentage: number): PropertyDecorator {
        return generator.generatePropertyDecorator<PriceContext>({ taxPercentage })
    }

    function Tips(tipsPercentage: number): PropertyDecorator {
        return generator.generatePropertyDecorator<PriceContext>({ tipsPercentage })
    }

    class Dish {
        @Tax(0.07) @Tips(0.15) price: number = 10000
    }

    it('Accessing property context.', function () {
        const classReflect = getClass(Dish)
        const priceProperty = classReflect!.getProperty<PriceContext>('price')
        const priceContext = priceProperty.getWrapper(zone)

        expect(priceContext.get('taxPercentage')).toBe(0.07)
        expect(priceContext.get('tipsPercentage')).toBe(0.15)
    })
})
