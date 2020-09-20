define([
    '../../../test/harness',
    './Location',
    './fixtures/index'
], function (Harness, LocationComponent, a) {
    'use strict';
    describe('Location Component', function () {
        it('Should build a location component', function () {
            return Harness.testCreate(LocationComponent, a.comp1);
        });
    });
});