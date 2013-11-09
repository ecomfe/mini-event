/**
 * ER (Enterprise RIA)
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 提供事件相关操作的基类
 * @author otakustay
 */
define(
    function (require) {
        var lib = require('./lib');
        var Event = require('./Event');
        var EventQueue = require('./EventQueue');

        /**
         * 提供与事件相关的操作的基类
         *
         * @constructor
         */
        function EventTarget() {
            this.miniEventPool = {};
        }

        /**
         * 注册一个事件处理函数
         *
         * @param {string} type 事件的类型
         * @param {function} fn 事件的处理函数
         * @param {Mixed} [thisObject] 事件执行时`this`对象
         * @param {Object} [options] 事件相关配置项
         * @param {boolean} [options.once=false] 控制事件仅执行一次
         */
        EventTarget.prototype.on = function (type, fn, thisObject, options) {
            if (!this.miniEventPool) {
                this.miniEventPool = {};
            }

            if (!this.miniEventPool.hasOwnProperty(type)) {
                this.miniEventPool[type] = new EventQueue();
            }

            var queue = this.miniEventPool[type];

            options = lib.extend({}, options);
            if (thisObject) {
                options.thisObject = thisObject;
            }

            queue.add(fn, options);
        };

        /**
         * 注册一个仅执行一次的处理函数
         *
         * @param {string} type 事件的类型
         * @param {function} fn 事件的处理函数
         * @param {Mixed} [thisObject] 事件执行时`this`对象
         * @param {Object} [options] 事件相关配置项
         */
        EventTarget.prototype.once = function (type, fn, thisObject, options) {
            options = lib.extend({}, options);
            options.once = true;
            this.on(type, fn, thisObject, options);
        };

        /**
         * 注销一个事件处理函数
         *
         * @param {string} type 事件的类型，
         * 如果值为`*`仅会注销通过`*`为类型注册的事件，并不会将所有事件注销
         * @param {function} [handler] 事件的处理函数，
         * 无此参数则注销`type`指定类型的所有事件处理函数
         */
        EventTarget.prototype.un = function (type, handler) {
            if (!this.miniEventPool
                || !this.miniEventPool.hasOwnProperty(type)
            ) {
                return;
            }

            var queue = this.miniEventPool[type];
            queue.remove(handler);
        };

        /**
         * 触发指定类型的事件
         *
         * @param {string} type 事件类型
         * @param {Mixed} [args] 事件对象
         * @return {Event} 事件传递过程中的`Event`对象
         */
        EventTarget.prototype.fire = function (type, args) {
            // 3个重载：
            //
            // - `.fire(type)`
            // - `.fire(args)`
            // - `.fire(type, args)`

            // 只提供一个对象作为参数，则是`.fire(args)`的形式，需要加上type
            if (arguments.length === 1 && typeof type === 'object') {
                args = type;
                type = args.type;
            }

            if (!type) {
                throw new Error('No event type specified');
            }

            if (type === '*') {
                throw new Error('Cannot fire global event');
            }

            var event = args instanceof Event
                ? args
                : new Event(type, args);
            event.target = this;

            // 无论`this.miniEventPool`有没有被初始化，
            // 如果有直接挂在对象上的方法是要触发的
            var inlineHandler = this['on' + type];
            if (typeof inlineHandler === 'function') {
                inlineHandler.call(this, event);
            }

            if (!this.miniEventPool) {
                return event;
            }

            if (this.miniEventPool.hasOwnProperty(type)) {
                var queue = this.miniEventPool[type];
                queue.execute(event, this);
            }

            if (this.miniEventPool.hasOwnProperty('*')) {
                var globalQueue = this.miniEventPool['*'];
                globalQueue.execute(event, this);
            }

            return event;
        };

        /**
         * 销毁所有事件
         */
        EventTarget.prototype.destroyEvents = function () {
            if (!this.miniEventPool) {
                return;
            }

            for (var name in this.miniEventPool) {
                if (this.miniEventPool.hasOwnProperty(name)) {
                    this.miniEventPool[name].dispose();
                }
            }

            this.miniEventPool = null;
        };

        /**
         * 在无继承关系的情况下，使一个对象拥有事件处理的功能
         * 
         * @param {Mixed} target 需要支持事件处理功能的对象
         */
        EventTarget.enable = function (target) {
            target.miniEventPool = {};
            lib.extend(target, EventTarget.prototype);
        };

        return EventTarget;
    }
);
