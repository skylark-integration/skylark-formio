define([
    'eventemitter2',
    './utils/utils'
], function (a, utils) {
    'use strict';
    return class EventEmitter extends a.EventEmitter2 {
        constructor(conf = {}) {
            const {
                loadLimit = 50,
                eventsSafeInterval = 300,
                pause = 500,
                inspect = false,
                ...ee2conf
            } = conf;
            super(ee2conf);
            const [isPaused, togglePause] = utils.withSwitch(false, true);
            const overloadHandler = () => {
                console.warn('Infinite loop detected');
                togglePause();
                setTimeout(togglePause, pause);
            };
            const dispatch = utils.observeOverload(overloadHandler, {
                limit: loadLimit,
                delay: eventsSafeInterval
            });
            this.emit = (...args) => {
                if (typeof inspect === 'function') {
                    inspect();
                }
                if (isPaused()) {
                    return;
                }
                super.emit(...args);
                dispatch();
            };
        }
    };
});