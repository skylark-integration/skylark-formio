define(['choices.js'], function (Choices) {
    'use strict';
    Choices.prototype._generatePlaceholderValue = function () {
        if (this._isSelectElement && this.passedElement.placeholderOption) {
            const {placeholderOption} = this.passedElement;
            return placeholderOption ? placeholderOption.text : false;
        }
        const {placeholder, placeholderValue} = this.config;
        const {
            element: {dataset}
        } = this.passedElement;
        if (placeholder) {
            if (placeholderValue) {
                return placeholderValue;
            }
            if (dataset.placeholder) {
                return dataset.placeholder;
            }
        }
        return false;
    };
    const KEY_CODES = {
        BACK_KEY: 46,
        DELETE_KEY: 8,
        TAB_KEY: 9,
        ENTER_KEY: 13,
        A_KEY: 65,
        ESC_KEY: 27,
        UP_KEY: 38,
        DOWN_KEY: 40,
        PAGE_UP_KEY: 33,
        PAGE_DOWN_KEY: 34
    };
    class ChoicesWrapper extends Choices {
        constructor(...args) {
            super(...args);
            this._onTabKey = this._onTabKey.bind(this);
            this.isDirectionUsing = false;
            this.shouldOpenDropDown = true;
        }
        _handleButtonAction(activeItems, element) {
            if (!this._isSelectOneElement) {
                return super._handleButtonAction(activeItems, element);
            }
            if (!activeItems || !element || !this.config.removeItems || !this.config.removeItemButton) {
                return;
            }
            this.shouldOpenDropDown = false;
            super._handleButtonAction(activeItems, element);
        }
        _onDirectionKey(...args) {
            if (!this._isSelectOneElement) {
                return super._onDirectionKey(...args);
            }
            this.isDirectionUsing = true;
            super._onDirectionKey(...args);
            this.onSelectValue(...args);
            this.isDirectionUsing = false;
        }
        _onTabKey({activeItems, hasActiveDropdown}) {
            if (hasActiveDropdown) {
                this._selectHighlightedChoice(activeItems);
            }
        }
        _selectHighlightedChoice(activeItems) {
            const highlightedChoice = this.dropdown.getChild(`.${ this.config.classNames.highlightedState }`);
            if (highlightedChoice) {
                this._handleChoiceAction(activeItems, highlightedChoice);
            }
            event.preventDefault();
        }
        _onKeyDown(event) {
            if (!this._isSelectOneElement) {
                return super._onKeyDown(event);
            }
            const {target, keyCode, ctrlKey, metaKey} = event;
            if (target !== this.input.element && !this.containerOuter.element.contains(target)) {
                return;
            }
            const activeItems = this._store.activeItems;
            const hasFocusedInput = this.input.isFocussed;
            const hasActiveDropdown = this.dropdown.isActive;
            const hasItems = this.itemList.hasChildren;
            const keyString = String.fromCharCode(keyCode);
            const {BACK_KEY, DELETE_KEY, TAB_KEY, ENTER_KEY, A_KEY, ESC_KEY, UP_KEY, DOWN_KEY, PAGE_UP_KEY, PAGE_DOWN_KEY} = KEY_CODES;
            const hasCtrlDownKeyPressed = ctrlKey || metaKey;
            if (!this._isTextElement && /[a-zA-Z0-9-_ ]/.test(keyString)) {
                this.showDropdown();
            }
            const keyDownActions = {
                [A_KEY]: this._onAKey,
                [TAB_KEY]: this._onTabKey,
                [ENTER_KEY]: this._onEnterKey,
                [ESC_KEY]: this._onEscapeKey,
                [UP_KEY]: this._onDirectionKey,
                [PAGE_UP_KEY]: this._onDirectionKey,
                [DOWN_KEY]: this._onDirectionKey,
                [PAGE_DOWN_KEY]: this._onDirectionKey,
                [DELETE_KEY]: this._onDeleteKey,
                [BACK_KEY]: this._onDeleteKey
            };
            if (keyDownActions[keyCode]) {
                keyDownActions[keyCode]({
                    event,
                    target,
                    keyCode,
                    metaKey,
                    activeItems,
                    hasFocusedInput,
                    hasActiveDropdown,
                    hasItems,
                    hasCtrlDownKeyPressed
                });
            }
        }
        onSelectValue({event, activeItems, hasActiveDropdown}) {
            if (hasActiveDropdown) {
                this._selectHighlightedChoice(activeItems);
            } else if (this._isSelectOneElement) {
                this.showDropdown();
                event.preventDefault();
            }
        }
        showDropdown(...args) {
            if (!this.shouldOpenDropDown) {
                this.shouldOpenDropDown = true;
                return;
            }
            super.showDropdown(...args);
        }
        hideDropdown(...args) {
            if (this.isDirectionUsing) {
                return;
            }
            super.hideDropdown(...args);
        }
    }
    return ChoicesWrapper;
});