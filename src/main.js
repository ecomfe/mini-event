/**
 * mini-event
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 入口
 * @author otakustay
 */

import Event from './Event';

/**
 * 版本号
 *
 * @type {string}
 */
export let version = '2.3.0';

/**
 * {@link Event}类
 *
 * @type {Function}
 */
export {Event};

/**
 * 参考{@link Event#fromEvent}
 */
export let fromEvent = Event.fromEvent;

/**
 * 参考{@link Event#delegate}
 */
export let delegate = Event.delegate;
