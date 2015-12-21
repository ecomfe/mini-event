import Event from 'Event';
import EventTarget from 'EventTarget';

describe('Event', () => {
    it('should be a constructor', () => {
        expect(typeof Event).toBe('function');
    });

    it('should be instantiable', () => {
        expect(() => new Event()).not.toThrow();
    });

    describe('constructor', () => {
        it('should accept no arguments to create an empty event object', () => {
            let event = new Event();
            expect(typeof event).toBe('object');
            expect(event.type).toBeUndefined();
        });

        it('should accept a type', () => {
            let event = new Event('foo');
            expect(event.type).toBe('foo');
        });

        it('should accept an object and extend the object to itself', () => {
            let event = new Event({type: 'foo', x: 1});
            expect(event.type).toBe('foo');
            expect(event.x).toBe(1);
        });

        it('should accept both `type` and `args`, and `type` is more priorier', () => {
            let event = new Event('foo', {type: 'bar', x: 1});
            expect(event.type).toBe('foo');
            expect(event.x).toBe(1);
        });
    });

    describe('`preventDefault` method', () => {
        it('should exists', () => {
            let event = new Event();
            expect(typeof event.preventDefault).toBe('function');
        });

        it('should take effect when called', () => {
            let event = new Event();
            event.preventDefault();
            expect(event.isDefaultPrevented()).toBe(true);
        });
    });

    describe('`stopPropagation` method', () => {
        it('should exists', () => {
            let event = new Event();
            expect(typeof event.stopPropagation).toBe('function');
        });

        it('should take effect when called', () => {
            let event = new Event();
            event.stopPropagation();
            expect(event.isPropagationStopped()).toBe(true);
        });
    });

    describe('`stopImmediatePropagation` method', () => {
        it('should exists', () => {
            let event = new Event();
            expect(typeof event.stopImmediatePropagation).toBe('function');
        });

        it('should take effect when called', () => {
            let event = new Event();
            event.stopImmediatePropagation();
            expect(event.isImmediatePropagationStopped()).toBe(true);
        });
    });

    describe('`fromEvent` method', () => {
        it('should exists', () => {
            expect(typeof Event.fromEvent).toBe('function');
        });

        it('should basically create an event object with the same `type` property', () => {
            let event = new Event('foo', {x: 1});
            let newEvent = Event.fromEvent(event);
            expect(newEvent.type).toBe('foo');
            expect(newEvent.x).toBeUndefined();
        });

        it('should copy all data properties from old event object if `preserveData` is specified', () => {
            let event = new Event('foo', {x: 1});
            let newEvent = Event.fromEvent(event, {preserveData: true});
            expect(newEvent.type).toBe('foo');
            expect(newEvent.x).toBe(1);
        });

        it('should sync states between 2 event objects, if `syncState` is specified', () => {
            let event = new Event('foo', {x: 1});
            let newEvent = Event.fromEvent(event, {syncState: true});
            newEvent.stopPropagation();
            newEvent.preventDefault();
            newEvent.stopImmediatePropagation();
            expect(event.isPropagationStopped()).toBe(true);
            expect(event.isDefaultPrevented()).toBe(true);
            expect(event.isImmediatePropagationStopped()).toBe(true);
        });

        it('should extend the new event object if `extend` is specified', () => {
            let event = new Event('foo');
            let newEvent = Event.fromEvent(event, {extend: {x: 1}});
            expect(newEvent.x).toBe(1);
        });
    });

    describe('`delegate` method', () => {
        it('should exists', () => {
            expect(typeof Event.delegate).toBe('function');
        });

        it('should take no effect when source object does not support `fire` method', () => {
            let source = {};
            let target = {
                fire: jasmine.createSpy('fire'),
                on: jasmine.createSpy('on')
            };
            expect(() => Event.delegate(source, target, 'foo')).not.toThrow();
        });

        it('should take no effect when target object does not support `fire` method', () => {
            let source = {on: jasmine.createSpy('on')};
            let target = {on: jasmine.createSpy('on')};
            expect(() => Event.delegate(source, target, 'foo')).not.toThrow();
        });

        it('should take no effect when target object does not support `on` method', () => {
            let source = {};
            let target = {
                fire: jasmine.createSpy('fire')
            };
            expect(() => Event.delegate(source, target, 'foo')).not.toThrow();
        });

        it('should delegate `type` from `source` to `target`', () => {
            let source = new EventTarget();
            let target = new EventTarget();
            spyOn(source, 'on').and.callThrough();
            spyOn(target, 'fire').and.callThrough();
            Event.delegate(source, target, 'foo');
            expect(source.on).toHaveBeenCalled();
            expect(source.on.calls.mostRecent().args[0]).toBe('foo');
            source.fire('foo');
            expect(target.fire).toHaveBeenCalled();
            expect(target.fire.calls.mostRecent().args[0]).toBe('foo');
        });

        it('should be able to delegate with custom event names', () => {
            let source = new EventTarget();
            let target = new EventTarget();
            spyOn(source, 'on').and.callThrough();
            spyOn(target, 'fire').and.callThrough();
            Event.delegate(source, 'foo', target, 'bar');
            source.fire('foo');
            expect(target.fire).toHaveBeenCalled();
            expect(target.fire.calls.mostRecent().args[0]).toBe('bar');
        });

        it('should preserve all data if `preserveData` is specified when delegate the same event', () => {
            let source = new EventTarget();
            let target = new EventTarget();
            spyOn(source, 'on').and.callThrough();
            spyOn(target, 'fire').and.callThrough();
            Event.delegate(source, target, 'foo', {preserveData: true});
            let event = {x: 1};
            source.fire('foo', event);
            expect(target.fire).toHaveBeenCalled();
            expect(target.fire.calls.mostRecent().args[0]).toBe('foo');
            expect(target.fire.calls.mostRecent().args[1].x).toBe(1);
        });

        it('should preserve all data if `preserveData` is specified when delegate custom event', () => {
            let source = new EventTarget();
            let target = new EventTarget();
            spyOn(source, 'on').and.callThrough();
            spyOn(target, 'fire').and.callThrough();
            Event.delegate(source, 'foo', target, 'bar', {preserveData: true});
            let event = {x: 1};
            source.fire('foo', event);
            expect(target.fire).toHaveBeenCalled();
            expect(target.fire.calls.mostRecent().args[0]).toBe('bar');
            expect(target.fire.calls.mostRecent().args[1].x).toBe(1);
        });

        it('should sync the state between 2 event objects `syncState` is specified when delegate the same event', () => {
            let source = new EventTarget();
            let target = new EventTarget();
            spyOn(source, 'on').and.callThrough();
            spyOn(target, 'fire').and.callThrough();
            let handler = event => {
                event.stopPropagation();
                event.preventDefault();
                event.stopImmediatePropagation();
            };
            target.on('foo', handler);
            Event.delegate(source, target, 'foo', {syncState: true});
            let event = source.fire('foo', {x: 1});
            expect(target.fire).toHaveBeenCalled();
            expect(target.fire.calls.mostRecent().args[0]).toBe('foo');
            expect(event.isPropagationStopped()).toBe(true);
            expect(event.isDefaultPrevented()).toBe(true);
            expect(event.isImmediatePropagationStopped()).toBe(true);
        });

        it('should sync the state between 2 event objects `syncState` is specified when delegate custom event', () => {
            let source = new EventTarget();
            let target = new EventTarget();
            spyOn(source, 'on').and.callThrough();
            spyOn(target, 'fire').and.callThrough();
            let handler = event => {
                event.stopPropagation();
                event.preventDefault();
                event.stopImmediatePropagation();
            };
            target.on('bar', handler);
            Event.delegate(source, 'foo', target, 'bar', {syncState: true});
            let event = source.fire('foo', {x: 1});
            expect(target.fire).toHaveBeenCalled();
            expect(target.fire.calls.mostRecent().args[0]).toBe('bar');
            expect(event.isPropagationStopped()).toBe(true);
            expect(event.isDefaultPrevented()).toBe(true);
            expect(event.isImmediatePropagationStopped()).toBe(true);
        });

        it('should reset `target` property to target object', () => {
            let source = new EventTarget();
            let target = new EventTarget();
            spyOn(source, 'on').and.callThrough();
            spyOn(target, 'fire').and.callThrough();
            let handler = event => {
                event.stopPropagation();
                event.preventDefault();
                event.stopImmediatePropagation();
            };
            target.on('bar', handler);
            Event.delegate(source, 'foo', target, 'bar', {syncState: true});
            source.fire('foo', {x: 1});
            expect(target.fire).toHaveBeenCalled();
            expect(target.fire.calls.mostRecent().args[1].target).toBe(target);
        });

        it('should reset `type` property to target type if it is different from source type', () => {
            let source = new EventTarget();
            let target = new EventTarget();
            spyOn(source, 'on').and.callThrough();
            spyOn(target, 'fire').and.callThrough();
            let handler = event => {
                event.stopPropagation();
                event.preventDefault();
                event.stopImmediatePropagation();
            };
            target.on('bar', handler);
            Event.delegate(source, 'foo', target, 'bar', {syncState: true});
            source.fire('foo', {x: 1});
            expect(target.fire).toHaveBeenCalled();
            expect(target.fire.calls.mostRecent().args[1].type).toBe('bar');
        });
    });
});
