/**
 * mini-event
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 工具库，仅供内部使用
 * @author otakustay
 */

define(
    function (require) {
        /**
         * 工具库，内部模块
         *
         * @type {Object}
         */
        var lib = {};

        /**
         * 扩展对象
         *
         * @param {Object} source 源对象
         * @param {Object...} additions 扩展的对象
         * @return {Object} 返回扩展后的`source`对象
         */
        lib.extend = function (source) {
            for (var i = 1; i < arguments.length; i++) {
                var addition = arguments[i];

                if (!addition) {
                    continue;
                }

                for (var key in addition) {
                    if (addition.hasOwnProperty(key)) {
                        source[key] = addition[key];
                    }
                }
            }

            return source;
        };

        return lib;
    }
);
