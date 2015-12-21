import EventQueue from 'EventQueue';

describe('EventQueue', () => {
    it('should be a constructor', () => {
        expect(typeof EventQueue).toBe('function');
    });

    it('should be instantiable', () => {
        expect(typeof new EventQueue()).toBe('object');
    });

    describe('`add` method', () => {
        it('should exist', () => {
            let queue = new EventQueue();
            expect(typeof queue.add).toBe('function');
        });

        it('should be safe to add a function handler', () => {
            let queue = new EventQueue();
            let handler = () => {};
            expect(() => queue.add(handler)).not.toThrow();
        });

        it('should be safe to add a function handler with `options` object', () => {
            let queue = new EventQueue();
            let handler = () => {};
            let options = {
                thieObject: {},
                once: true
            };
            expect(() => queue.add(handler, options)).not.toThrow();
        });

        it('should be safe to add `false` as handler', () => {
            let queue = new EventQueue();
            expect(() => queue.add(false)).not.toThrow();
        });

        it('should throw an error if a non-function and non-false handler is given', () => {
            let queue = new EventQueue();
            expect(() => queue.add({})).toThrow();
        });
    });

    describe('`remove` method', () => {
        it('should exist', () => {
            let queue = new EventQueue();
            expect(typeof queue.remove).toBe('function');
        });

        it('should be safe to remove an attached handler', () => {
            let queue = new EventQueue();
            let handler = () => {};
            queue.add(handler);
            expect(() => queue.remove(handler)).not.toThrow();
        });

        it('should be safe to remove a non-attached handler', () => {
            let queue = new EventQueue();
            let handler = () => {};
            expect(() => queue.remove(handler)).not.toThrow();
        });

        it('should be safe to remove all handlers by not providing `handler` argument', () => {
            let queue = new EventQueue();
            expect(() => queue.remove()).not.toThrow();
        });
    });

    describe('`clear` method', () => {
        it('should exist', () => {
            let queue = new EventQueue();
            expect(typeof queue.clear).toBe('function');
        });

        it('should be safe to clear the queue', () => {
            let queue = new EventQueue();
            expect(() => queue.clear()).not.toThrow();
        });
    });

    describe('`exeute` method', () => {
        it('should exist', () => {
            let queue = new EventQueue();
            expect(typeof queue.execute).toBe('function');
        });

        it('should pass the `event` object to handler', () => {
            let queue = new EventQueue();
            let handler = jasmine.createSpy('handler');
            queue.add(handler);
            let event = {};
            queue.execute(event, null);
            expect(handler).toHaveBeenCalled();
            expect(handler.calls.mostRecent().args[0]).toBe(event);
        });

        it('should pass the `thisObject` object as `this` to handler', () => {
            let queue = new EventQueue();
            let handler = jasmine.createSpy('handler');
            queue.add(handler);
            let thisObject = {};
            queue.execute({}, thisObject);
            expect(handler).toHaveBeenCalled();
            expect(handler.calls.mostRecent().object).toBe(thisObject);
        });

        it('should use the `thisObject` specified when add instead of the given one', () => {
            let queue = new EventQueue();
            let handler = jasmine.createSpy('handler');
            let thisObject = {};
            queue.add(handler, {thisObject: thisObject});
            queue.execute({}, null);
            expect(handler).toHaveBeenCalled();
            expect(handler.calls.mostRecent().object).toBe(thisObject);
        });

        it('should execute attached handler by attaching order', () => {
            let queue = new EventQueue();
            let order = [];
            let handlerA = () => order.push(1);
            let handlerB = () => order.push(2);
            queue.add(handlerA);
            queue.add(handlerB);
            queue.execute({}, null);
            expect(order).toEqual([1, 2]);
        });

        it('should not execute removed handler', () => {
            let queue = new EventQueue();
            let handlerA = jasmine.createSpy('handlerA');
            let handlerB = jasmine.createSpy('handlerB');
            queue.add(handlerA);
            queue.add(handlerB);
            queue.remove(handlerA);
            queue.execute({}, null);
            expect(handlerA).not.toHaveBeenCalled();
        });

        it('should not execute any handler if it is cleared', () => {
            let queue = new EventQueue();
            let handlerA = jasmine.createSpy('handlerA');
            let handlerB = jasmine.createSpy('handlerB');
            queue.add(handlerA);
            queue.add(handlerB);
            queue.remove();
            queue.execute({}, null);
            expect(handlerA).not.toHaveBeenCalled();
            expect(handlerB).not.toHaveBeenCalled();

            queue.add(handlerA);
            queue.add(handlerB);
            queue.clear();
            queue.execute({}, null);
            expect(handlerA).not.toHaveBeenCalled();
            expect(handlerB).not.toHaveBeenCalled();
        });

        it('should not execute removed handler event it is removed when the queue is executing', () => {
            let queue = new EventQueue();
            let handlerA = () => queue.remove(handlerB);
            let handlerB = jasmine.createSpy('handlerB');
            queue.add(handlerA);
            queue.add(handlerB);
            queue.execute({}, null);
            expect(handlerB).not.toHaveBeenCalled();
        });

        it('should execute handler only once if `once` option is specified', () => {
            let queue = new EventQueue();
            let handler = jasmine.createSpy();
            queue.add(handler, {once: true});
            queue.execute({}, null);
            queue.execute({}, null);
            expect(handler.calls.count()).toBe(1);
        });

        it('should keep all handler in order and executed even one handler is removed when executing', () => {
            let queue = new EventQueue();
            let handlerA = jasmine.createSpy('handlerA').and.callFake(() => queue.remove(handlerB));
            let handlerB = jasmine.createSpy('handlerB');
            let handlerC = jasmine.createSpy('handlerC');
            let handlerD = jasmine.createSpy('handlerD');
            queue.add(handlerA);
            queue.add(handlerB);
            queue.add(handlerC);
            queue.add(handlerD);
            queue.execute({}, null);
            expect(handlerA).toHaveBeenCalled();
            expect(handlerC).toHaveBeenCalled();
            expect(handlerD).toHaveBeenCalled();
        });

        it('should not execute following handlers if event is immediately stopped', () => {
            let queue = new EventQueue();
            let event = {
                isImmediatePropagationStopped: () => false
            };
            let handlerA = () => {
                event.isImmediatePropagationStopped = () => true;
            };
            let handlerB = jasmine.createSpy('handlerB');
            queue.add(handlerA);
            queue.add(handlerB);
            queue.execute(event, null);
            expect(handlerB).not.toHaveBeenCalled();
        });

        it('should not execute duplicated handlers', () => {
            let queue = new EventQueue();
            let handler = jasmine.createSpy('handler');
            queue.add(handler);
            queue.add(handler);
            queue.execute({}, null);
            expect(handler.calls.count()).toBe(1);
        });

        it('should treated the same handler with different `thisObject` to be different', () => {
            let queue = new EventQueue();
            let handler = jasmine.createSpy('handler');
            queue.add(handler, {thisObject: {x: 1}});
            queue.add(handler, {thisObject: {x: 2}});
            queue.execute({}, null);
            expect(handler.calls.count()).toBe(2);
        });

        it('should not remove the handler if with different `thisObject`', () => {
            let queue = new EventQueue();
            let handler = jasmine.createSpy('handler');
            let x = {x: 1};
            let y = {x: 2};
            queue.add(handler, {thisObject: x});
            queue.add(handler, {thisObject: y});
            queue.remove(handler, x);
            queue.execute({}, null);
            expect(handler.calls.count()).toBe(1);
        });

        it('should not remove handlers with custom `thieObject` if `thisObject` is not given as a argument', () => {
            let queue = new EventQueue();
            let handler = jasmine.createSpy('handler');
            let x = {x: 1};
            queue.add(handler, {thisObject: x});
            queue.add(handler);
            queue.remove(handler);
            queue.execute({}, null);
            expect(handler.calls.count()).toBe(1);
        });

        it('should treat a `false` handler as `preventDefault` & `stopPropagation`', () => {
            let queue = new EventQueue();
            queue.add(false);
            let event = {
                preventDefault: jasmine.createSpy('preventDefault'),
                stopPropagation: jasmine.createSpy('stopPropagation')
            };
            queue.execute(event);
            expect(event.preventDefault).toHaveBeenCalled();
            expect(event.stopPropagation).toHaveBeenCalled();
        });

        it('should be ok to remove a `false` handler', () => {
            let queue = new EventQueue();
            queue.add(false);
            queue.remove(false);
            let event = {
                preventDefault: jasmine.createSpy('preventDefault'),
                stopPropagation: jasmine.createSpy('stopPropagation')
            };
            queue.execute(event);
            expect(event.preventDefault).not.toHaveBeenCalled();
            expect(event.stopPropagation).not.toHaveBeenCalled();
        });

        it('should be safe to dispose the queue when executing, all remaining handlers should not be called', () => {
            let queue = new EventQueue();
            queue.add(() => { queue.dispose(); });
            let handler = jasmine.createSpy('handler');
            queue.add(handler);
            expect(() => { queue.execute({}); }).not.toThrow();
            expect(handler).not.toHaveBeenCalled();
        });
    });

    describe('`length` method', () => {
        it('should exists', () => {
            let queue = new EventQueue();
            expect(typeof queue.length).toBe('function');
        });

        it('should have an alias method named `length`', () => {
            let queue = new EventQueue();
            expect(queue.length).toBe(queue.length);
        });

        it('should increment when an handler is added', () => {
            let queue = new EventQueue();
            queue.add(() => {});
            expect(queue.length()).toBe(1);
        });

        it('should increment when `false` is added as a handler', () => {
            let queue = new EventQueue();
            queue.add(false);
            expect(queue.length()).toBe(1);
        });

        it('should decrement when an handler is removed', () => {
            let queue = new EventQueue();
            let handler = () => {};
            queue.add(handler);
            queue.remove(handler);
            expect(queue.length()).toBe(0);
        });
    });
});
