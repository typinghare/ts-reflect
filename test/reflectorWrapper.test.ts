import { Class, ClassContainer, contextOf, DecoratedClass, DecoratorGenerator, Zone } from '../src/main'

interface CityContext {
    name: string
    population: number
    area?: number
}

describe('Reflector wrapper tests.', function () {
    const zone = new Zone('zone')
    const generator = new DecoratorGenerator(zone)

    function CityInfo(population: number): MethodDecorator {
        return generator.generateMethodDecorator<CityContext>(
            { population },
            function (_: Object, methodName: string | symbol) {
                this.set('name', methodName.toString())
            }
        )
    }

    @DecoratedClass()
    class State {
        @CityInfo(94398)
        public Quincy(): string {
            return 'A beautiful city'
        }
    }

    it('Reflector wrapper get.', function () {
        const classDecorator = ClassContainer.INSTANCE.get(State) as Class

        for (const cityMethod of classDecorator.getMethodMap<CityContext>().values()) {
            const context = contextOf(cityMethod, zone)
            expect(context.get('name')).toEqual('Quincy')
            expect(context.get('population')).toEqual(94398)
            expect(context.get('area')).toBeUndefined()
        }
    })
})
