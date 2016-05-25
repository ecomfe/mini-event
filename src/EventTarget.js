/**
 * ER (Enterprise RIA)
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 提供事件相关操作的基类
 * @author otakustay
 */

import Event from './Event';
import EventQueue from './EventQueue';

const EVENT_POOL = Symbol('eventPool');

/**
 * 提供事件相关操作的基类
 *
 * 可以让某个类继承此类，获得事件的相关功能：
 *
 * ```js
 * function MyClass() {
 *     // 此处可以不调用EventTarget构造函数
 * }
 *
 * inherits(MyClass, EventTarget);
 *
 * let instance = new MyClass();
 * instance.on('foo', executeFoo);
 * instance.fire('foo', { bar: 'Hello World' });
 * ```
 *
 * 当然也可以使用`Object.create`方法：
 *
 * ```js
 * let instance = Object.create(EventTarget.prototype);
 * instance.on('foo', executeFoo);
 * instance.fire('foo', { bar: 'Hello World' });
 * ```
 *
 * 还可以使用`enable`方法让一个静态的对象拥有事件功能：
 *
 * ```js
 * let instance = {}
 * EventTarget.enable(instance);
 *
 * // 同样可以使用事件
 * instance.on('foo', executeFoo);
 * instance.fire('foo', { bar: 'Hello World' });
 * ```
 */
export default class EventTarget {

    /**
     * 注册一个事件处理函数
     *
     * @param {string} type 事件的类型
     * @param {Function | boolean} fn 事件的处理函数，
     * 特殊地，如果此参数为`false`，将被视为特殊的事件处理函数，
     * 其效果等于`preventDefault()`及`stopPropagation()`
     * @param {*} [thisObject] 事件执行时`this`对象
     * @param {Object} [options] 事件相关配置项
     * @param {boolean} [options.once=false] 控制事件仅执行一次
     */
    on(type, fn, thisObject, options) {
        if (!this[EVENT_POOL]) {
            this[EVENT_POOL] = Object.create(null);
        }

        if (!this[EVENT_POOL][type]) {
            this[EVENT_POOL][type] = new EventQueue();
        }

        let queue = this[EVENT_POOL][type];

        options = Object.assign({}, options);
        if (thisObject) {
            options.thisObject = thisObject;
        }

        queue.add(fn, options);
    }

    /**
     * 注册一个仅执行一次的处理函数
     *
     * @param {string} type 事件的类型
     * @param {Function} fn 事件的处理函数
     * @param {*} [thisObject] 事件执行时`this`对象
     * @param {Object} [options] 事件相关配置项
     */
    once(type, fn, thisObject, options) {
        options = Object.assign({}, options);
        options.once = true;
        this.on(type, fn, thisObject, options);
    }

    /**
     * 注销一个事件处理函数
     *
     * @param {string} type 事件的类型，如果值为`*`仅会注销通过`*`为类型注册的事件，并不会将所有事件注销
     * @param {Function} [handler] 事件的处理函数，无此参数则注销`type`指定类型的所有事件处理函数
     * @param {*} [thisObject] 处理函数对应的`this`对象，无此参数则注销`type`与`handler`符合要求，且无`this`对象的处理函数
     */
    un(type, handler, thisObject) {
        if (!this[EVENT_POOL] || !this[EVENT_POOL][type]) {
            return;
        }

        let queue = this[EVENT_POOL][type];
        queue.remove(handler, thisObject);
    }

    /**
     * 触发指定类型的事件
     *
     * 3个重载：
     *
     * - `.fire(type)`
     * - `.fire(args)`
     * - `.fire(type, args)`
     *
     * @param {string | Object} type 事件类型
     * @param {*} [args] 事件对象
     * @return {Event} 事件传递过程中的`Event`对象
     */
    fire(type, args) {
        // 只提供一个对象作为参数，则是`.fire(args)`的形式，需要加上type
        /* eslint-disable prefer-rest-params */
        if (arguments.length === 1 && typeof type === 'object') {
            args = type;
            type = args.type;
        }
        /* eslint-enable prefer-rest-params */

        if (!type) {
            throw new Error('No event type specified');
        }

        if (type === '*') {
            throw new Error('Cannot fire global event');
        }

        let event = args instanceof Event
            ? args
            : new Event(type, args);
        event.target = this;

        // 在此处可能没有[EVENT_POOL]`，这是指对象整个就没初始化，
        // 即一个事件也没注册过就`fire`了，这是正常现象
        if (this[EVENT_POOL] && this[EVENT_POOL][type]) {
            let queue = this[EVENT_POOL][type];
            queue.execute(event, this);
        }

        // 同时也有可能在上面执行标准事件队列的时候，把这个`EventTarget`给销毁了，
        // 此时[EVENT_POOL]`就没了，这种情况是正常的不能抛异常，要特别处理
        if (this[EVENT_POOL] && this[EVENT_POOL]['*']) {
            let globalQueue = this[EVENT_POOL]['*'];
            globalQueue.execute(event, this);
        }

        return event;
    }

    /**
     * 销毁所有事件
     */
    destroyEvents() {
        if (!this[EVENT_POOL]) {
            return;
        }

        for (let name in this[EVENT_POOL]) {
            if (this[EVENT_POOL][name]) {
                this[EVENT_POOL][name].dispose();
            }
        }

        this[EVENT_POOL] = null;
    }
}
