/**
 * mini-event
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 事件队列
 * @author otakustay
 */
define(
    function (require) {
        var lib = require('./lib');

        /**
         * 事件队列
         *
         * @constructor
         */
        function EventQueue() {
            this.queue = [];
        }

        /**
         * 添加一个事件处理函数
         *
         * @param {function} handler 处理函数
         * @param {Object} [options] 相关配置
         * @param {Mixed} [options.thisObject] 执行处理函数时的`this`对象
         * @param {boolean} [options.once] 设定函数仅执行一次
         */
        EventQueue.prototype.add = function (handler, options) {
            var wrapper = {
                handler: handler
            };
            lib.extend(wrapper, options);

            for (var i = 0; i < this.queue.length; i++) {
                var item = this.queue[i];
                // 同样的处理函数，不同的`this`对象，相当于外面`bind`了一把再添加，
                // 此时认为这是完全不同的2个处理函数
                if (item
                    && item.handler === handler
                    && (item.thisObject === wrapper.thisObject)
                ) {
                    return;
                }
            }

            this.queue.push(wrapper);
        };

        /**
         * 移除一个或全部处理函数
         *
         * @param {function} [handler] 指定移除的处理函数，如不提供则移除全部函数
         */
        EventQueue.prototype.remove = function (handler) {
            // 如果没提供`handler`，则直接清空
            if (!handler) {
                this.clear();
            }

            for (var i = 0; i < this.queue.length; i++) {
                var item = this.queue[i];
                if (item && item.handler === handler) {
                    // 为了让`execute`过程中调用的`remove`工作正常，
                    // 这里不能用`splice`直接删除，仅设为`null`留下这个空间
                    this.queue[i] = null;

                    // 不用担心重复，`add`的时候已经去重了
                    return;
                }
            }
        };

        /**
         * 移除全部处理函数
         */
        EventQueue.prototype.clear = function () {
            this.queue.length = 0;
        };

        /**
         * 执行所有处理函数
         *
         * @param {Event} event 事件对象
         * @param {Mixed} thisObject 函数执行时的`this`对象
         */
        EventQueue.prototype.execute = function (event, thisObject) {
            for (var i = 0; i < this.queue.length; i++) {
                if (typeof event.isImmediatePropagationStopped === 'function'
                    && event.isImmediatePropagationStopped()
                ) {
                    return;
                }

                var context = this.queue[i];

                // 移除事件时设置为`null`，因此可能无值
                if (!context) {
                    continue;
                }

                var handler = context.handler;

                // 这里不需要做去重处理了，在`on`的时候会去重，因此这里不可能重复

                handler.call(context.thisObject || thisObject, event);

                if (context.once) {
                    this.remove(context.handler);
                }
            }
        };

        /**
         * 销毁
         */
        EventQueue.prototype.dispose = function () {
            this.queue = null;
        };

        return EventQueue;
    }
);
