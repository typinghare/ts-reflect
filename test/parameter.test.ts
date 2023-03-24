import { Reflect } from '../src/main'
import Constructor = jest.Constructor
import Dict = NodeJS.Dict

interface ClassContext {
    mapping: string
}

interface MethodContext {
    mapping: string;
    httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

interface ParameterContext {
    from: 'param' | 'query' | 'body';
    name: string;
}

describe('Basic Parameter tests.', function() {
    const decoratorGenerator = new Reflect.DecoratorGenerator();
    const zone = Reflect.Zone.DEFAULT;
    const controllerCollector: Dict<Function> = {};

    function Controller(mapping: string): ClassDecorator {
        return decoratorGenerator.generateClassDecorator<ClassContext>({ mapping }, function(controller: Function) {
            controllerCollector[mapping] = controller;
        });
    }

    function Post(mapping: string): MethodDecorator {
        return decoratorGenerator.generateMethodDecorator<MethodContext>({ mapping, httpMethod: 'POST' });
    }

    function Param(name?: string): ParameterDecorator {
        return decoratorGenerator.generateParameterDecorator<ParameterContext>({ from: 'param', name });
    }

    @Controller('/blog')
    class Blog {
        @Post('/articles/:id')
        public async article(@Param('id') id: number): Promise<string> {
            return `article [ ${id} ]`;
        }
    }

    function execute(controller: Function, url: string, httpMethod: string): any {
        for (const [mapping, controller] of Object.entries(controllerCollector)) {
            if (!url.startsWith(mapping)) continue;

            url = url.slice(mapping.length);
            const controllerReflector = Reflect.ClassContainer.INSTANCE.get<ClassContext>(controller as Constructor);
            if (controllerReflector === undefined) return null;

            const decoratedMethodMap = controllerReflector.getMethodMap<MethodContext>();
            if (decoratedMethodMap) {
                for (const method of decoratedMethodMap.values()) {
                    if (httpMethod !== method.getContext(zone, 'httpMethod')) continue;

                    const mapping = method.getContext(zone, 'mapping');
                    if (!mapping) continue;

                    const params: { [name: symbol | string]: string } = {};
                    const mappingPieces = mapping.split('/');
                    const urlPieces = url.split('/');

                    let matched = true;
                    for (let i = 0; i < mappingPieces.length; ++i) {
                        if (mappingPieces[i].startsWith(':')) {
                            params[mappingPieces[i].slice(1)] = urlPieces[i];
                        } else {
                            if (mappingPieces[i] !== urlPieces[i]) {
                                matched = false;
                                break;
                            }
                        }
                    }
                    if (!matched) continue;

                    const args = [];
                    const parameterArray = method.getParameterArray<ParameterContext>();
                    for (const parameter of parameterArray) {
                        const name = parameter.getName()
                        args.push(params[name]);
                    }

                    return method.getFunction().apply(null, args);
                }
            }
        }
    }

    it('Controller mock test.', async function() {
        expect(await execute(Blog, '/blog/articles/5', 'POST')).toBe('article [ 5 ]');
    });
});