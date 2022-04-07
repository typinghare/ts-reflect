import { DecoratorGenerator } from '../generator';
import { classContainer } from '../container';

describe('basic parameter decorator tests', function() {
  const generator = new DecoratorGenerator();

  interface ClassContext {
    mapping: string;
  }

  interface MethodContext {
    mapping: string;
    httpMethod: 'get' | 'post' | 'put' | 'delete';
  }

  interface ParameterContext {
    from: 'param' | 'query' | 'body';
    name: string;
  }

  const controllerCollector: { [mapping: string]: Function } = {};

  function Controller(mapping: string): ClassDecorator {
    return generator.classDecorator<ClassContext>({ mapping }, function(controller: Function) {
      controllerCollector[mapping] = controller;
    });
  }

  function Get(mapping: string): MethodDecorator {
    return generator.methodDecorator<MethodContext>({ mapping, httpMethod: 'get' });
  }

  function Param(name?: string): ParameterDecorator {
    return generator.parameterDecorator<ParameterContext>({
      from: 'param', name
    });
  }

  @Controller('/blog')
  class Blog {
    @Get('/articles/:id')
    public async article(@Param('id') id: number): Promise<string> {
      return `article [ ${id} ]`;
    }
  }

  function execute(controller: Function, url: string, httpMethod: string): any {
    for (const [mapping, controller] of Object.entries(controllerCollector)) {
      if (!url.startsWith(mapping)) continue;

      url = url.slice(mapping.length);
      const controllerReflector = classContainer.getByConstructor(controller);
      const decoratedMethodSet = controllerReflector?.getDecoratedMethodCollector<MethodContext>();
      if (decoratedMethodSet) {
        for (const method of decoratedMethodSet) {
          if (httpMethod !== method.getContext('httpMethod')) continue;

          const mapping = method.getContext('mapping');
          if (!mapping) continue;

          const params: { [name: string]: string } = {};
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
            const name = parameter.getName();
            args.push(params[name]);
          }

          return method.getValue().apply(null, args);
        }
      }
    }
  }

  it('should be expected value', async function() {
    expect(await execute(Blog, '/blog/articles/5', 'get')).toBe('article [ 5 ]');
  });
});