/**
 * mini-event
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 事件对象类
 * @author otakustay
 */

define(
    function (require) {
        var lib = require('./lib');

        function returnTrue() { return true; }
        function returnFalse() { return false; }

        /**
         * 事件类
         *
         * @param {string} type 事件类型
         * @param {Object=} args 事件中的数据
         * @constructor
         */
        function Event(type, args) {
            this.type = type;

            lib.extend(this, args);
        }

        /**
         * 判断默认行为是否已被阻止
         *
         * @return {boolean}
         */
        Event.prototype.isDefaultPrevented = returnFalse;

        /**
         * 阻止默认行为
         */
        Event.prototype.preventDefault = function () {
            this.isDefaultPrevented = returnTrue;
        };

        /**
         * 判断事件传播是否已被阻止
         *
         * @return {boolean}
         */
        Event.prototype.isPropagationStopped = returnFalse;

        /**
         * 阻止事件传播
         */
        Event.prototype.stopPropagation = function () {
            this.isPropagationStopped = returnTrue;
        };

        /**
         * 判断事件横向传播是否已被阻止
         *
         * @return {boolean}
         */
        Event.prototype.isImmediatePropagationStopped = returnFalse;

        /**
         * 阻止事件横向传播
         */
        Event.prototype.stopImmediatePropagation = function () {
            this.isImmediatePropagationStopped = returnTrue;
        };

        return {
            Event: Event
        };
    }
);
