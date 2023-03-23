import { Reflect } from '../src/main'

interface MyClassContext {
    scope: 'singleton' | 'prototype' | 'request'
}

interface AnimalClassContext {
    type: 'mammal' | 'avian' | 'invertebrate'
    movingSpeed: 'slow' | 'medium' | 'fast'
}

describe('Basics.', function () {
    const generator = new Reflect.DecoratorGenerator()
    const zone = Reflect.Zone.DEFAULT

    function Scope(scope: MyClassContext['scope']): ClassDecorator {
        return generator.generateClassDecorator({ scope })
    }

    @Scope('singleton')
    class Bunny {}

    it('Basic context access.', function () {
        const bunnyReflector = Reflect.ClassContainer.INSTANCE.get<MyClassContext>(Bunny)
        expect(bunnyReflector).toBeDefined()
        expect(bunnyReflector?.getContext(zone, 'scope')).toBe('singleton')
    })
})

describe('Extensions.', function () {
    const generator = new Reflect.DecoratorGenerator()
    const zone = Reflect.Zone.DEFAULT

    function IsMammal(): ClassDecorator {
        return generator.generateClassDecorator<AnimalClassContext>({ type: 'mammal' })
    }

    function MovingSpeed(movingSpeed: AnimalClassContext['movingSpeed']): ClassDecorator {
        return generator.generateClassDecorator<AnimalClassContext>({ movingSpeed })
    }

    @IsMammal()
    class Mammal {}

    @MovingSpeed('medium')
    class Bunny extends Mammal {}

    it('Context in parent class.', function () {
        const bunnyClass = Reflect.ClassContainer.INSTANCE.get<AnimalClassContext>(Bunny)
        expect(bunnyClass).not.toBeNull()
        expect(bunnyClass?.getContext(zone, 'type')).toBeUndefined()

        const mammalReflector = bunnyClass?.getParent()
        expect(mammalReflector).not.toBeNull()
        expect(mammalReflector).toBe(Reflect.ClassContainer.INSTANCE.get<AnimalClassContext>(Mammal))
        expect(mammalReflector?.getConstructor()).toBe(Mammal)
    })
})
