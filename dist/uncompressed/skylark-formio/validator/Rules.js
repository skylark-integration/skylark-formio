define([
    './rules/index'
], function (rules) {
    'use strict';
    return class Rules {
        static addRule(name, rule) {
            Rules.rules[name] = rule;
        }
        static addRules(rules) {
            Rules.rules = {
                ...Rules.rules,
                ...rules
            };
        }
        static getRule(name) {
            return Rules.rules[name];
        }
        static getRules() {
            return Rules.rules;
        }
    };
    Rules.rules = rules;
});