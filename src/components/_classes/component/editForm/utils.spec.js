define([
    'chai',
    'skylark-lodash',
    './utils'
], function (a, _, utils) {
    'use strict';
    describe('Edit Form Utils', function () {
        describe('unifyComponents', () => {
            it('should merge all objects with the same key', () => {
                const components = [
                    {
                        key: 'a',
                        label: 1,
                        input: true
                    },
                    {
                        key: 'a',
                        one: 1,
                        two: 2
                    },
                    {
                        key: 'b',
                        one: 1,
                        two: 2
                    }
                ];
                a.expect(_.unionWith(components, utils.unifyComponents)).to.deep.equal([
                    {
                        key: 'a',
                        label: 1,
                        input: true,
                        one: 1,
                        two: 2
                    },
                    {
                        key: 'b',
                        one: 1,
                        two: 2
                    }
                ]);
            });
            it('should not merge objects with "skipMerge" flag', () => {
                const components = [
                    {
                        key: 'a',
                        label: 1
                    },
                    {
                        key: 'a',
                        label: 2,
                        skipMerge: true
                    },
                    {
                        key: 'b',
                        one: 1,
                        two: 2
                    },
                    {
                        key: 'b',
                        one: 1
                    },
                    {
                        key: 'b',
                        one: 1,
                        ok: true
                    }
                ];
                a.expect(_.unionWith(components, utils.unifyComponents)).to.deep.equal([
                    {
                        key: 'a',
                        label: 1
                    },
                    {
                        key: 'a',
                        label: 2,
                        skipMerge: true
                    },
                    {
                        key: 'b',
                        one: 1,
                        two: 2,
                        ok: true
                    }
                ]);
            });
        });
    });
});