"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.classCollector = exports.DecoratorGenerator = exports.Parameter = exports.Property = exports.Accessor = exports.Method = exports.Class = exports.AbstractReflector = void 0;
/**
 * General type of constructor function.
 */
const misc_1 = require("./misc");
require("reflect-metadata");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const constant_1 = require("./constant");
const get_parameter_names_1 = __importDefault(require("@captemulation/get-parameter-names"));
/**
 *
 */
class AbstractReflector {
    /**
     * Constructor.
     * @param name
     */
    constructor(name) {
        /**
         * Decorative context map.
         * @protected
         */
        this._decorativeContextMap = new Map();
        this.name = name;
    }
    getContext(zone, key) {
        const decorativeContext = this._decorativeContextMap.get(zone);
        if (key === undefined) {
            return decorativeContext;
        }
        return decorativeContext && decorativeContext[key];
    }
    setContext(zone, key, value) {
        const context = this.getContext(zone) || {};
        this._decorativeContextMap.set(zone, context);
        if (value === undefined) {
            Object.assign(context, key);
        }
        else {
            context[key] = value;
        }
    }
    /**
     * Set the name of the reflected object.
     * @param name
     * @protected
     */
    setName(name) {
        this.name = name;
    }
    /**
     * Get the name of the reflected object.
     */
    getName() {
        return this.name;
    }
}
exports.AbstractReflector = AbstractReflector;
class Class extends AbstractReflector {
    constructor(name, _constructor) {
        super(name);
        this.decoratedMethodSet = new Set();
        this.decoratedAccessorSet = new Set();
        this.decoratedPropertySet = new Set();
        this._constructor = _constructor;
    }
    getConstructor() {
        return this._constructor;
    }
    getMethod(name) {
        return (0, misc_1.findOne)(this.decoratedMethodSet, (method) => method.getName() === name);
    }
    getAccessor(name) {
        return (0, misc_1.findOne)(this.decoratedAccessorSet, (accessor) => accessor.getName() === name);
    }
    getProperty(name) {
        return (0, misc_1.findOne)(this.decoratedPropertySet, (property) => property.getName() === name);
    }
}
exports.Class = Class;
class Method extends AbstractReflector {
    constructor(name, value) {
        super(name);
        this.decoratedParameterArray = [];
        this._value = value;
    }
    getValue() {
        return this._value;
    }
    getParameterByName(name) {
        for (const _parameter of this.decoratedParameterArray) {
            if (_parameter.getName() === name)
                return _parameter;
        }
        return undefined;
    }
    getParameterByIndex(index) {
        return this.decoratedParameterArray[index];
    }
}
exports.Method = Method;
class Accessor extends AbstractReflector {
}
exports.Accessor = Accessor;
class Property extends AbstractReflector {
}
exports.Property = Property;
class Parameter extends AbstractReflector {
    constructor() {
        super('');
    }
    setName(name) {
        this.name = name;
    }
}
exports.Parameter = Parameter;
/**
 * Decorator generator.
 */
class DecoratorGenerator {
    constructor(zone) {
        this._zone = zone;
    }
    classDecorator(context, decorator) {
        return (constructor) => {
            const _class = Reflect.getOwnMetadata(constant_1.METADATA_KEY_CLASS, constructor) || new Class(constructor.name, constructor);
            Reflect.defineMetadata(constant_1.METADATA_KEY_CLASS, _class, constructor);
            // register to class collection
            exports.classCollector.setClass(constructor.name, _class);
            // load methods (if it hasn't been done)
            if (_class.decoratedMethodSet === undefined) {
                _class.decoratedMethodSet = Reflect.getMetadata('hareMethodSet', constructor) || new Set();
                _class.decoratedMethodSet.forEach(decoratedMethod => {
                    decoratedMethod.decoratedParameterArray =
                        Reflect.getOwnMetadata('hareParameterArray', constructor, decoratedMethod.getName()) || [];
                    const parameterNames = (0, get_parameter_names_1.default)(decoratedMethod.getValue());
                    for (const decoratedParameter of decoratedMethod.decoratedParameterArray) {
                        const name = parameterNames.shift();
                        name && decoratedParameter.setName(name);
                    }
                });
            }
            // load accessors (if it hasn't been done)
            if (_class.decoratedAccessorSet === undefined) {
                _class.decoratedAccessorSet =
                    Reflect.getMetadata('hareAccessorSet', constructor) || new Set();
            }
            // load properties (if it hasn't been done)
            if (_class.decoratedPropertySet === undefined) {
                _class.decoratedPropertySet =
                    Reflect.getMetadata('harePropertySet', constructor) || new Set();
            }
            // set context
            const _context = _class.getContext(this._zone) || {};
            Object.assign(_context, context);
            _class.setContext(this._zone, _context);
            decorator && decorator.apply(_class, [constructor]);
        };
    }
    methodDecorator(context, decorator) {
        return (target, methodName, descriptor) => {
            const constructor = target.constructor;
            const methodSet = Reflect.getOwnMetadata(constant_1.METADATA_KEY_METHOD_SET, constructor) || new Set();
            Reflect.defineMetadata(constant_1.METADATA_KEY_METHOD_SET, methodSet, constructor);
            const method = (0, misc_1.findOne)(methodSet, method => method.getName() === methodName)
                || new Method(methodName.toString(), descriptor.value);
            methodSet.add(method);
            // set context
            context && method.setContext(this._zone, context);
            decorator && decorator.apply(method, [target, methodName, descriptor]);
        };
    }
    accessorDecorator(context, decorator) {
        return (target, accessorName, descriptor) => {
            const constructor = target.constructor;
            const accessorSet = Reflect.getOwnMetadata(constant_1.METADATA_KEY_ACCESSOR_SET, constructor) || new Set();
            Reflect.defineMetadata(constant_1.METADATA_KEY_ACCESSOR_SET, accessorSet, constructor);
            const accessor = (0, misc_1.findOne)(accessorSet, accessor => accessor.getName() === accessorName)
                || new Accessor(accessorName.toString());
            accessorSet.add(accessor);
            if (descriptor.get !== undefined)
                accessor.getter = descriptor.get;
            if (descriptor.set !== undefined)
                accessor.setter = descriptor.set;
            // set context
            context && accessor.setContext(this._zone, context);
            decorator && decorator.apply(accessor, [target, accessorName, descriptor]);
        };
    }
    propertyDecorator(context, decorator) {
        return (target, propertyName) => {
            const constructor = target.constructor;
            const propertySet = Reflect.getOwnMetadata(constant_1.METADATA_KEY_PROPERTY_SET, constructor) || new Set();
            Reflect.defineMetadata(constant_1.METADATA_KEY_PROPERTY_SET, propertySet, constructor);
            // adds to property set if not exists
            const property = (0, misc_1.findOne)(propertySet, (property) => property.getName() === propertyName)
                || new Property(propertyName.toString());
            propertySet.add(property);
            // set context
            context && property.setContext(this._zone, context);
            decorator && decorator.apply(property, [target, propertyName]);
        };
    }
    parameterDecorator(context, decorator) {
        return (target, methodName, parameterIndex) => {
            const constructor = target.constructor;
            const parameterArray = Reflect.getOwnMetadata(constant_1.METADATA_KEY_PARAMETER_ARRAY, target.constructor, methodName) || [];
            Reflect.defineMetadata(constant_1.METADATA_KEY_PARAMETER_ARRAY, parameterArray, constructor, methodName);
            const parameter = parameterArray[parameterIndex] || new Parameter();
            parameterArray[parameterIndex] = parameter;
            // set context
            context && parameter.setContext(this._zone, context);
            decorator && decorator.apply(parameter, [target, methodName, parameterIndex]);
        };
    }
}
exports.DecoratorGenerator = DecoratorGenerator;
/**
 * Class collector.
 */
class ClassCollector {
    constructor() {
        this._currentNamespace = '/';
        this._classCollection = {};
    }
    /**
     * Set class by name.
     * @param name
     * @param _class
     */
    setClass(name, _class) {
        if (!(this._currentNamespace in this._classCollection)) {
            this._classCollection[this._currentNamespace] = {};
        }
        this._classCollection[this._currentNamespace][name] = _class;
    }
    /**
     * Get a class by specified namespace and name;
     * @param path name of class (with default namespace); string likes <namespace:name>, or mere namespace if [name] is given.
     * @param name name of class of nothing
     */
    getClass(path, name) {
        let namespace;
        if (!path.startsWith('/')) {
            [namespace, name] = ['/', path];
        }
        else {
            [namespace, name] = name === undefined ? path.split(':').map(e => e.trim()) : [path, name];
        }
        if (name === undefined || !this._classCollection[namespace])
            return undefined;
        return this._classCollection[namespace][name];
    }
    /**
     * Scan a file.
     * @param filepath
     * @param namespace
     */
    scan(filepath, namespace = '/') {
        this._currentNamespace = namespace;
        filepath = filepath.toString('utf-8');
        if (path_1.default.extname(filepath) !== '.js')
            filepath += '.js';
        require(filepath);
        this._currentNamespace = '/';
    }
    /**
     * Scan a directory iteratively.
     * @param dir_path directory path
     * @param namespace
     */
    scanDir(dir_path, namespace = '/') {
        dir_path = dir_path.toString('utf-8');
        for (const file of fs_1.default.readdirSync(dir_path).filter(e => path_1.default.extname(e) == '.js')) {
            fs_1.default.lstatSync(path_1.default.join(dir_path, file)).isDirectory() ?
                this.scanDir(path_1.default.join(dir_path, file), `${namespace}/${file}`) :
                this.scan(path_1.default.join(dir_path, file), namespace);
        }
    }
}
/**
 * Singleton instance of ClassCollector.
 */
exports.classCollector = new ClassCollector();
