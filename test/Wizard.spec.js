define([
    'skylark-lodash/each',
    'chai',
    '../test/wizards',
    './Wizard'
], function (_, a, WizardTests, Wizard) {
    'use strict';
    const each = _.each;
    describe('Wizard Component', () => {
        describe('getPreviousPage', () => {
            it('should return previous page number or zero', () => {
                const {getPreviousPage} = Wizard.prototype;
                a.expect(getPreviousPage.call({ page: 3 })).to.equal(2);
                a.expect(getPreviousPage.call({ page: 9 })).to.equal(8);
                a.expect(getPreviousPage.call({ page: 199 })).to.equal(198);
                a.expect(getPreviousPage.call({ page: 1 })).to.equal(0);
                a.expect(getPreviousPage.call({ page: 0 })).to.equal(0);
            });
        });
    });
    describe('WizardRenderer tests', () => {
        each(WizardTests, wizardTest => {
            each(wizardTest.tests, (wizardTestTest, title) => {
                it(title, done => {
                    const wizardElement = document.createElement('div');
                    const wizard = new Wizard(wizardElement);
                    wizard.setForm(wizardTest.form).then(() => {
                        return wizardTestTest(wizard, done);
                    }).catch(error => {
                        done(error);
                    });
                });
            });
        });
    });
});