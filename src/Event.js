/**
 * mini-event
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 事件对象类
 * @author otakustay
 */

let isObject = target => Object.prototype.toString.call(target) === '[object Object]';


// 复制事件属性的时候不复制这几个
const EVENT_PROPERTY_BLACK_LIST = new Set([
    'type', 'target',
    'preventDefault', 'isDefaultPrevented',
    'stopPropagation', 'isPropagationStopped',
    'stopImmediatePropagation', 'isImmediatePropagationStopped'
]);

/**
 * 事件对象类
 */
export default class Event {

    /**
     * 构造函数
     *
     * 3个重载：
     *      - `new Event(type)`
     *      - `new Event(args)`
     *      - `new Event(type, args)`
     * 只提供一个对象作为参数，则是`new Event(args)`的形式，需要加上type
     *
     * @param {string | *} [type] 事件类型
     * @param {*} [args] 事件中的数据，如果为对象则将参数扩展到`Event`实例上。如果参数是非对象类型，则作为实例的`data`属性使用
     */
    constructor(type, args) {
        // 如果第1个参数是对象，则就当是`new Event(args)`形式
        if (typeof type === 'object') {
            args = type;
            type = args.type;
        }

        if (isObject(args)) {
            Object.assign(this, args);
        }
        else if (args) {
            this.data = args;
        }

        if (type) {
            this.type = type;
        }
    }

    /**
     * 判断默认行为是否已被阻止
     *
     * @return {boolean}
     */
    isDefaultPrevented() {
        return false;
    }

    /**
     * 阻止默认行为
     */
    preventDefault() {
        this.isDefaultPrevented = () => true;
    }

    /**
     * 判断事件传播是否已被阻止
     *
     * @return {boolean}
     */
    isPropagationStopped() {
        return false;
    }

    /**
     * 阻止事件传播
     */
    stopPropagation() {
        this.isPropagationStopped = () => true;
    }

    /**
     * 判断事件的立即传播是否已被阻止
     *
     * @return {boolean}
     */
    isImmediatePropagationStopped() {
        return false;
    }

    /**
     * 立即阻止事件传播
     */
    stopImmediatePropagation() {
        this.isImmediatePropagationStopped = () => true;

        this.stopPropagation();
    }

    /**
     * 从一个已有事件对象生成一个新的事件对象
     *
     * @static
     * @param {Event} originalEvent 作为源的已有事件对象
     * @param {Object} [options] 配置项
     * @param {string} [options.type] 新事件对象的类型，不提供则保留原类型
     * @param {boolean} [options.preserveData=false] 是否保留事件的信息
     * @param {boolean} [options.syncState=false] 是否让2个事件状态同步，状态包括阻止传播、立即阻止传播和阻止默认行为
     * @param {Object} [options.extend] 提供事件对象的更多属性
     * @return {Event}
     */
    static fromEvent(originalEvent, options) {
        let defaults = {
            type: originalEvent.type,
            preserveData: false,
            syncState: false
        };
        options = Object.assign(defaults, options);

        let newEvent = new Event(options.type);
        // 如果保留数据，则把数据复制过去
        if (options.preserveData) {
            // 要去掉一些可能出现的杂质，因此不用`lib.extend`
            for (let key in originalEvent) {
                if (originalEvent.hasOwnProperty(key) && !EVENT_PROPERTY_BLACK_LIST.has(key)) {
                    newEvent[key] = originalEvent[key];
                }
            }
        }

        // 如果有扩展属性，加上去
        if (options.extend) {
            Object.assign(newEvent, options.extend);
        }

        // 如果要同步状态，把和状态相关的方法挂接上
        if (options.syncState) {
            let preventDefault = newEvent.preventDefault;
            newEvent.preventDefault = function () {
                originalEvent.preventDefault();

                preventDefault.call(this);
            };

            let stopPropagation = originalEvent.stopPropagation;
            newEvent.stopPropagation = function () {
                originalEvent.stopPropagation();

                stopPropagation.call(this);
            };

            let stopImmediatePropagation = originalEvent.stopImmediatePropagation;
            newEvent.stopImmediatePropagation = function () {
                originalEvent.stopImmediatePropagation();

                stopImmediatePropagation.call(this);
            };
        }

        return newEvent;
    }

    /**
     * 将一个对象的事件代理到另一个对象
     *
     * @static
     * @param {EventTarget} from 事件提供方
     * @param {EventTarget | string} fromType 为字符串表示提供方事件类型；
     * 为可监听对象则表示接收方，此时事件类型由第3个参数提供
     * @param {EventTarget | string} to 为字符串则表示提供方和接收方事件类型一致，
     * 由此参数作为事件类型；为可监听对象则表示接收方，此时第2个参数必须为字符串
     * @param {string} [toType] 接收方的事件类型
     * @param {Object} [options] 配置项
     * @param {boolean} [options.preserveData=false] 是否保留事件的信息
     * @param {boolean} [options.syncState=false] 是否让2个事件状态同步，状态包括阻止传播、立即阻止传播和阻止默认行为
     * @param {Object} [options.extend] 提供事件对象的更多属性
     *
     * ```
     * // 当`label`触发`click`事件时，自身也触发`click`事件
     * Event.delegate(label, this, 'click');
     *
     * // 当`label`触发`click`事件时，自身触发`labelclick`事件
     * Event.delegate(label, 'click', this, 'labelclick');
     * ```
     */
    static delegate(from, fromType, to, toType, options) {
        // 重载：
        //
        // 1. `.delegate(from, fromType, to, toType)`
        // 2. `.delegate(from, fromType, to, toType, options)`
        // 3. `.delegate(from, to, type)`
        // 4. `.delegate(from, to, type, options)

        // 重点在于第2个参数的类型，如果为字符串则肯定是1或2，否则为3或4
        let useDifferentType = typeof fromType === 'string';
        let source = {
            object: from,
            type: useDifferentType ? fromType : to
        };
        let target = {
            object: useDifferentType ? to : fromType,
            type: useDifferentType ? toType : to
        };
        let config = useDifferentType ? options : toType;
        config = Object.assign({preserveData: false}, config);

        // 如果提供方不能注册事件，或接收方不能触发事件，那就不用玩了
        if (typeof source.object.on !== 'function'
            || typeof target.object.on !== 'function'
            || typeof target.object.fire !== 'function'
        ) {
            return;
        }

        let delegator = function (originalEvent) {
            let event = Event.fromEvent(originalEvent, config);
            // 修正`type`和`target`属性
            event.type = target.type;
            event.target = target.object;

            target.object.fire(target.type, event);
        };

        source.object.on(source.type, delegator);
    }
}
