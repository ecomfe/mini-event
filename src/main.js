/**
 * mini-event
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 入口
 * @author otakustay
 */

define(
    function (require) {
        var Event = require('./Event');

        return {
            Event: Event,
            fromDOMEvent: Event.fromDOMEvent,
            fromEvent: Event.fromEvent,
            delegate: Event.delegate
        };
    }
);
