define(function() {
    var Observable = require('mini-event/Observable');
    var Event = require('mini-event/Event');

    describe('Observable', function() {
        it('should be a construtor', function () {
            expect(Observable).toBeOfType('function');
        });

        it('should be instantiable', function () {
            expect(new Observable()).toBeOfType('object');
        });
        
        describe('`on` method', function() {
            it('should exist', function () {
                var observable = new Observable();
                expect(observable.on).toBeOfType('function');
            });

            it('should be safe to attach a handler for a named event', function () {
                var observable = new Observable();
                expect(function () { observable.on('change', function () {}); }).not.toThrow();
            });

            it('should be safe to attach a global event handler', function () {
                var observable = new Observable();
                expect(function () { observable.on('*', function () {}); }).not.toThrow();
            });

            it('should be safe to specify a `this` object', function () {
                var observable = new Observable();
                var fn = function () {};
                expect(function () { observable.on('change', fn, {}); }).not.toThrow();
            });


            it('should be safe to specify a `options` object', function () {
                var observable = new Observable();
                var fn = function () {};
                expect(function () { observable.on('change', fn, {}, { once: true }); }).not.toThrow();
            });
        });

        describe('`once` method', function () {
            it('should exist', function () {
                var observable = new Observable();
                expect(observable.once).toBeOfType('function');
            });

            it('should be safe to attach a handler for a named event', function () {
                var observable = new Observable();
                expect(function () { observable.once('change', function () {}); }).not.toThrow();
            });

            it('should be safe to specify a `this` object', function () {
                var observable = new Observable();
                var fn = function () {};
                expect(function () { observable.on('change', fn, {}); }).not.toThrow();
            });

            it('should be safe to attach a global event handler', function () {
                var observable = new Observable();
                expect(function () { observable.once('*', function () {}); }).not.toThrow();
            });

            it('should be safe to specify a `options` object', function () {
                var observable = new Observable();
                var fn = function () {};
                expect(function () { observable.on('change', fn, {}, { once: false }); }).not.toThrow();
            });
        });

        describe('`un` method', function() {
            it('should exist', function () {
                var observable = new Observable();
                expect(observable.un).toBeOfType('function');
            });

            it('should be safe to remove an attached handler', function () {
                var fn = function () {};
                var observable = new Observable();
                observable.on('change', fn);
                expect(function () { observable.un('change', fn); }).not.toThrow();
            });

            it('should be safe to remove all event handlers by not providing a specified handler', function () {
                var fn = function () {};
                var observable = new Observable();
                observable.on('change', fn);
                expect(function () { observable.un('change'); }).not.toThrow();
            });

            it('should be safe to remove a non-attached handler', function () {
                var fn = function () {};
                var observable = new Observable();
                expect(function () { observable.un('change', fn); }).not.toThrow();
            });

            it('should be safe to remove a type of event with no handler initialized', function () {
                var observable = new Observable();
                expect(function () { observable.un('change'); }).not.toThrow();
            });
        });

        describe('`fire` method', function() {
            it('should exist', function () {
                var observable = new Observable();
                expect(observable.fire).toBeOfType('function');
            });

            it('should execute all named event handlers', function () {
                var observable = new Observable();
                var handlerA = jasmine.createSpy('handlerA');
                var handlerB = jasmine.createSpy('handlerB');
                var handlerC = jasmine.createSpy('handlerC');
                observable.on('change', handlerA);
                observable.on('change', handlerB);
                observable.on('change', handlerC);
                observable.fire('change');
                expect(handlerA).toHaveBeenCalled();
                expect(handlerB).toHaveBeenCalled();
                expect(handlerC).toHaveBeenCalled();
            });

            it('should execute all global event handlers when any named event is fired', function () {
                var observable = new Observable();
                var handlerA = jasmine.createSpy('handlerA');
                var handlerB = jasmine.createSpy('handlerB');
                var handlerC = jasmine.createSpy('handlerC');
                observable.on('*', handlerA);
                observable.on('*', handlerB);
                observable.on('*', handlerC);
                observable.fire('change');
                expect(handlerA).toHaveBeenCalled();
                expect(handlerB).toHaveBeenCalled();
                expect(handlerC).toHaveBeenCalled();
            });

            it('should be safe to fire an event with no handler initialized', function () {
                var observable = new Observable();
                expect(function () { observable.fire('change'); }).not.toThrow();
            });

            it('should return a correctly built `Event` object', function () {
                var observable = new Observable();
                var event = observable.fire('change');
                expect(event instanceof Event).toBe(true);
                expect(event.type).toBe('change');
                expect(event.target).toBe(observable);
            });

            it('should accept an `Event` object and then return this object itself', function () {
                var observable = new Observable();
                var event = new Event();
                var returnedEvent = observable.fire('change', event);
                expect(returnedEvent).toBe(event);
            });

            it('should accept any object as event\'s data', function () {
                var observable = new Observable();
                var event = observable.fire('change', { x: 1 });
                expect(event.x).toBe(1);
            });

            it('should accept any non-object value and extend it to event object as the `data` property', function () {
                var observable = new Observable();
                var event = observable.fire('change', 1);
                expect(event.data).toBe(1);
            });

            it('should accept only one object as arguments', function () {
                var observable = new Observable();
                var event = observable.fire({ type: 'change', x: 1 });
                expect(event.type).toBe('change');
                expect(event.x).toBe(1);
            });

            it('should call inline handler', function () {
                var observable = new Observable();
                observable.onchange = jasmine.createSpy();
                observable.fire('change');
                expect(observable.onchange).toHaveBeenCalled();
            });

            it('should pass the event object to handlers', function () {
                var observable = new Observable();
                var handler = jasmine.createSpy('handler');
                observable.on('change', handler);
                var event = observable.fire('change');
                expect(handler.mostRecentCall.args[0]).toBe(event);
            });

            it('should call handlers specified as `once` only once', function () {
                var observable = new Observable();
                var handlerA = jasmine.createSpy('handlerA');
                var handlerB = jasmine.createSpy('handlerB');
                observable.on('change', handlerA, null, { once: true });
                observable.once('change', handlerB);
                observable.fire('change');
                observable.fire('change');
                expect(handlerA.callCount).toBe(1);
                expect(handlerB.callCount).toBe(1);
            });

            it('should pass the `thisObject` as handler\'s `this`', function () {
                var observable = new Observable();
                var thisObject = {};
                var handlerA = jasmine.createSpy('handlerA');
                var handlerB = jasmine.createSpy('handlerB');
                observable.on('change', handlerA, thisObject);
                observable.on('change', handlerB, null, { thisObject: thisObject });
                observable.fire('change');
                expect(handlerA.mostRecentCall.object).toBe(thisObject);
                expect(handlerB.mostRecentCall.object).toBe(thisObject);
            });

            it('should pass the observable object itself as `this` if `thisObject` is given a null value', function () {
                var observable = new Observable();
                var handlerA = jasmine.createSpy('handlerA');
                var handlerB = jasmine.createSpy('handlerB');
                observable.on('change', handlerA, null);
                observable.on('change', handlerB, undefined);
                observable.fire('change');
                expect(handlerA.mostRecentCall.object).toBe(observable);
                expect(handlerB.mostRecentCall.object).toBe(observable);
            })
        });

        describe('`enable` method', function() {
            it('should exist', function () {
                expect(Observable.enable).toBeOfType('function');
            });

            it('make a Object has the function of Observable without inherit', function() {
                var obj = {};
                Observable.enable(obj);
                expect(obj.on).toBe(Observable.prototype.on);
                expect(obj.once).toBe(Observable.prototype.once);
                expect(obj.un).toBe(Observable.prototype.un);
                expect(obj.fire).toBe(Observable.prototype.fire);
            });
        });
    });
});