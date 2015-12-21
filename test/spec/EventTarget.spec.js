import Event from 'Event';
import EventTarget from 'EventTarget';

describe('EventTarget', () => {
    it('should be a construtor', () => {
        expect(typeof EventTarget).toBe('function');
    });

    it('should be instantiable', () => {
        expect(typeof new EventTarget()).toBe('object');
    });

    describe('`on` method', () => {
        it('should exist', () => {
            let eventTarget = new EventTarget();
            expect(typeof eventTarget.on).toBe('function');
        });

        it('should be safe to attach a handler for a named event', () => {
            let eventTarget = new EventTarget();
            expect(() => eventTarget.on('change', () => {})).not.toThrow();
        });

        it('should be safe to attach a global event handler', () => {
            let eventTarget = new EventTarget();
            expect(() => eventTarget.on('*', () => {})).not.toThrow();
        });

        it('should be safe to specify a `this` object', () => {
            let eventTarget = new EventTarget();
            let fn = () => {};
            expect(() => eventTarget.on('change', fn, {})).not.toThrow();
        });


        it('should be safe to specify a `options` object', () => {
            let eventTarget = new EventTarget();
            let fn = () => {};
            expect(() => eventTarget.on('change', fn, {}, {once: true})).not.toThrow();
        });
    });

    describe('`once` method', () => {
        it('should exist', () => {
            let eventTarget = new EventTarget();
            expect(typeof eventTarget.once).toBe('function');
        });

        it('should be safe to attach a handler for a named event', () => {
            let eventTarget = new EventTarget();
            expect(() => eventTarget.once('change', () => {})).not.toThrow();
        });

        it('should be safe to specify a `this` object', () => {
            let eventTarget = new EventTarget();
            let fn = () => {};
            expect(() => eventTarget.on('change', fn, {})).not.toThrow();
        });

        it('should be safe to attach a global event handler', () => {
            let eventTarget = new EventTarget();
            expect(() => eventTarget.once('*', () => {})).not.toThrow();
        });

        it('should be safe to specify a `options` object', () => {
            let eventTarget = new EventTarget();
            let fn = () => {};
            expect(() => eventTarget.on('change', fn, {}, {once: false})).not.toThrow();
        });
    });

    describe('`un` method', () => {
        it('should exist', () => {
            let eventTarget = new EventTarget();
            expect(typeof eventTarget.un).toBe('function');
        });

        it('should be safe to remove an attached handler', () => {
            let fn = () => {};
            let eventTarget = new EventTarget();
            eventTarget.on('change', fn);
            expect(() => eventTarget.un('change', fn)).not.toThrow();
        });

        it('should be safe to remove all event handlers by not providing a specified handler', () => {
            let fn = () => {};
            let eventTarget = new EventTarget();
            eventTarget.on('change', fn);
            expect(() => eventTarget.un('change')).not.toThrow();
        });

        it('should be safe to remove a non-attached handler', () => {
            let fn = () => {};
            let eventTarget = new EventTarget();
            expect(() => eventTarget.un('change', fn)).not.toThrow();
        });

        it('should be safe to remove a type of event with no handler initialized', () => {
            let eventTarget = new EventTarget();
            expect(() => eventTarget.un('change')).not.toThrow();
        });
    });

    describe('`fire` method', () => {
        it('should exist', () => {
            let eventTarget = new EventTarget();
            expect(typeof eventTarget.fire).toBe('function');
        });

        it('should execute all named event handlers', () => {
            let eventTarget = new EventTarget();
            let handlerA = jasmine.createSpy('handlerA');
            let handlerB = jasmine.createSpy('handlerB');
            let handlerC = jasmine.createSpy('handlerC');
            eventTarget.on('change', handlerA);
            eventTarget.on('change', handlerB);
            eventTarget.on('change', handlerC);
            eventTarget.fire('change');
            expect(handlerA).toHaveBeenCalled();
            expect(handlerB).toHaveBeenCalled();
            expect(handlerC).toHaveBeenCalled();
        });

        it('should execute all global event handlers when any named event is fired', () => {
            let eventTarget = new EventTarget();
            let handlerA = jasmine.createSpy('handlerA');
            let handlerB = jasmine.createSpy('handlerB');
            let handlerC = jasmine.createSpy('handlerC');
            eventTarget.on('*', handlerA);
            eventTarget.on('*', handlerB);
            eventTarget.on('*', handlerC);
            eventTarget.fire('change');
            expect(handlerA).toHaveBeenCalled();
            expect(handlerB).toHaveBeenCalled();
            expect(handlerC).toHaveBeenCalled();
        });

        it('should be safe to fire an event with no handler initialized', () => {
            let eventTarget = new EventTarget();
            expect(() => eventTarget.fire('change')).not.toThrow();
        });

        it('should return a correctly built `Event` object', () => {
            let eventTarget = new EventTarget();
            let event = eventTarget.fire('change');
            expect(event instanceof Event).toBe(true);
            expect(event.type).toBe('change');
            expect(event.target).toBe(eventTarget);
        });

        it('should accept an `Event` object and then return this object itself', () => {
            let eventTarget = new EventTarget();
            let event = new Event();
            let returnedEvent = eventTarget.fire('change', event);
            expect(returnedEvent).toBe(event);
        });

        it('should accept any object as event\'s data', () => {
            let eventTarget = new EventTarget();
            let event = eventTarget.fire('change', {x: 1});
            expect(event.x).toBe(1);
        });

        it('should accept any non-object value and extend it to event object as the `data` property', () => {
            let eventTarget = new EventTarget();
            let event = eventTarget.fire('change', 1);
            expect(event.data).toBe(1);
        });

        it('should accept only one object as arguments', () => {
            let eventTarget = new EventTarget();
            let event = eventTarget.fire({type: 'change', x: 1});
            expect(event.type).toBe('change');
            expect(event.x).toBe(1);
        });

        it('should pass the event object to handlers', () => {
            let eventTarget = new EventTarget();
            let handler = jasmine.createSpy('handler');
            eventTarget.on('change', handler);
            let event = eventTarget.fire('change');
            expect(handler.calls.mostRecent().args[0]).toBe(event);
        });

        it('should call handlers specified as `once` only once', () => {
            let eventTarget = new EventTarget();
            let handlerA = jasmine.createSpy('handlerA');
            let handlerB = jasmine.createSpy('handlerB');
            eventTarget.on('change', handlerA, null, {once: true});
            eventTarget.once('change', handlerB);
            eventTarget.fire('change');
            eventTarget.fire('change');
            expect(handlerA.calls.count()).toBe(1);
            expect(handlerB.calls.count()).toBe(1);
        });

        it('should pass the `thisObject` as handler\'s `this`', () => {
            let eventTarget = new EventTarget();
            let thisObject = {};
            let handlerA = jasmine.createSpy('handlerA');
            let handlerB = jasmine.createSpy('handlerB');
            eventTarget.on('change', handlerA, thisObject);
            eventTarget.on('change', handlerB, null, {thisObject: thisObject});
            eventTarget.fire('change');
            expect(handlerA.calls.mostRecent().object).toBe(thisObject);
            expect(handlerB.calls.mostRecent().object).toBe(thisObject);
        });

        it('should pass the EventTarget object itself as `this` if `thisObject` is given a null value', () => {
            let eventTarget = new EventTarget();
            let handlerA = jasmine.createSpy('handlerA');
            let handlerB = jasmine.createSpy('handlerB');
            eventTarget.on('change', handlerA, null);
            eventTarget.on('change', handlerB, undefined);
            eventTarget.fire('change');
            expect(handlerA.calls.mostRecent().object).toBe(eventTarget);
            expect(handlerB.calls.mostRecent().object).toBe(eventTarget);
        });

        it('should be safe to dispose itself when executing handlers, all remaining handlers should not be called', () => {
            let eventTarget = new EventTarget();
            eventTarget.on('change', () => eventTarget.destroyEvents());
            let handler = jasmine.createSpy('handler');
            eventTarget.on('change', handler);
            expect(() => eventTarget.fire('change')).not.toThrow();
            expect(handler).not.toHaveBeenCalled();
        });

        it('should not execute global event handlers (those registered with `*`) when disposed on executing', () => {
            let eventTarget = new EventTarget();
            eventTarget.on('change', () => eventTarget.destroyEvents());
            let handler = jasmine.createSpy('handler');
            eventTarget.on('*', handler);
            expect(() => eventTarget.fire('change')).not.toThrow();
            expect(handler).not.toHaveBeenCalled();
        });
    });

    describe('`destroyEvents` method', () => {
        it('should exist', () => {
            let eventTarget = new EventTarget();
            expect(typeof eventTarget.destroyEvents).toBe('function');
        });

        it('should remove all events', () => {
            let eventTarget = new EventTarget();
            let handler = jasmine.createSpy('handler');
            eventTarget.on('change', handler);
            eventTarget.destroyEvents();
            eventTarget.fire('change');
            expect(handler).not.toHaveBeenCalled();
        });

        it('should works silently when no events are initialized', () => {
            let eventTarget = new EventTarget();
            expect(() => eventTarget.destroyEvents()).not.toThrow();
        });
    });
});
