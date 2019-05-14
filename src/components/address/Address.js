define([
    'lodash',
    '../textfield/TextField',
    '../../Formio'
], function (_, TextFieldComponent, Formio) {
    'use strict';
    return class AddressComponent extends TextFieldComponent {
        static schema(...extend) {
            return TextFieldComponent.schema({
                type: 'address',
                label: 'Address',
                key: 'address',
                map: {
                    region: '',
                    key: ''
                }
            }, ...extend);
        }
        static get builderInfo() {
            return {
                title: 'Address Field',
                group: 'advanced',
                icon: 'fa fa-home',
                documentation: 'http://help.form.io/userguide/#address',
                weight: 30,
                schema: AddressComponent.schema()
            };
        }
        constructor(component, options, data) {
            super(component, options, data);
            let src = 'https://maps.googleapis.com/maps/api/js?v=3&libraries=places&callback=googleMapsCallback';
            if (component.map && component.map.key) {
                src += `&key=${ component.map.key }`;
            }
            if (component.map && component.map.region) {
                src += `&region=${ component.map.region }`;
            }
            Formio.requireLibrary('googleMaps', 'google.maps.places', src);
            this.addresses = [];
        }
        get defaultSchema() {
            return AddressComponent.schema();
        }
        setValueAt(index, value, flags) {
            flags = flags || {};
            if (!flags.noDefault && (value === null || value === undefined)) {
                value = this.defaultValue;
            }
            this.addresses[index] = value;
            if (value && value.formatted_address) {
                this.inputs[index].value = value.formatted_address;
            }
        }
        getValueAt(index) {
            return this.addresses[index];
        }
        autoCompleteInit(input, autoCompleteOptions) {
            input.setAttribute('autocomplete', 'off');
            this.autoCompleteSuggestions = [];
            const autoComplete = new google.maps.places.AutocompleteService();
            const suggestionContainer = document.createElement('div');
            suggestionContainer.classList.add('pac-container', 'pac-logo');
            input.parentNode.appendChild(suggestionContainer);
            this.addEventListener(input, 'input', () => {
                if (input.value) {
                    const options = { input: input.value };
                    autoComplete.getPlacePredictions(_.defaultsDeep(options, autoCompleteOptions), (suggestions, status) => {
                        this.autoCompleteDisplaySuggestions(suggestions, status, suggestionContainer, input);
                    });
                } else {
                    this.autoCompleteCleanSuggestions(suggestionContainer);
                    suggestionContainer.style.display = 'none';
                }
            });
            this.addEventListener(input, 'blur', () => {
                _.delay(() => {
                    suggestionContainer.style.display = 'none';
                }, 100);
            });
            this.addEventListener(input, 'focus', () => {
                if (suggestionContainer.childElementCount) {
                    suggestionContainer.style.display = 'block';
                }
            });
            this.addEventListener(window, 'resize', () => {
                suggestionContainer.style.width = `${ input.offsetWidth }px`;
            });
            this.autoCompleteKeyboardListener(suggestionContainer, input);
        }
        autoCompleteKeyboardListener(suggestionContainer, input) {
            this.autoCompleteKeyCodeListener = event => {
                if (input.value) {
                    switch (event.keyCode) {
                    case 38:
                        this.autoCompleteKeyUpInteraction(suggestionContainer, input);
                        break;
                    case 40:
                        this.autoCompleteKeyDownInteraction(suggestionContainer, input);
                        break;
                    case 9:
                        this.autoCompleteKeyValidationInteraction(suggestionContainer, input);
                        break;
                    case 13:
                        this.autoCompleteKeyValidationInteraction(suggestionContainer, input);
                        break;
                    }
                }
            };
            this.addEventListener(input, 'keydown', this.autoCompleteKeyCodeListener);
        }
        autoCompleteKeyUpInteraction(suggestionContainer, input) {
            const elementSelected = document.querySelector('.pac-item-selected');
            if (!elementSelected) {
                return this.autoCompleteListDecorator(suggestionContainer.lastChild, input);
            } else {
                const previousSibling = elementSelected.previousSibling;
                if (previousSibling) {
                    this.autoCompleteListDecorator(previousSibling, input);
                } else {
                    elementSelected.classList.remove('pac-item-selected');
                    input.value = this.autoCompleteInputValue;
                }
            }
        }
        autoCompleteKeyDownInteraction(suggestionContainer, input) {
            const elementSelected = document.querySelector('.pac-item-selected');
            if (!elementSelected) {
                if (suggestionContainer.firstChild) {
                    return this.autoCompleteListDecorator(suggestionContainer.firstChild, input);
                }
            } else {
                const nextSibling = elementSelected.nextSibling;
                if (nextSibling) {
                    this.autoCompleteListDecorator(nextSibling, input);
                } else {
                    elementSelected.classList.remove('pac-item-selected');
                    input.value = this.autoCompleteInputValue;
                }
            }
        }
        autoCompleteKeyValidationInteraction(suggestionContainer, input) {
            const elementSelected = document.querySelector('.pac-item-selected');
            if (elementSelected) {
                for (const suggestion of this.autoCompleteSuggestions) {
                    const content = elementSelected.textContent || elementSelected.innerText;
                    if (content === suggestion.description) {
                        this.autoCompleteServiceListener(suggestion, suggestionContainer, input);
                    }
                }
                elementSelected.classList.remove('pac-item-selected');
            }
        }
        autoCompleteListDecorator(item, input) {
            const elementSelected = document.querySelector('.pac-item-selected');
            if (elementSelected) {
                elementSelected.classList.remove('pac-item-selected');
            }
            input.value = item.textContent;
            item.classList.add('pac-item-selected');
        }
        autoCompleteFilterSuggestion(data) {
            const result = this.evaluate(this.component.map.autoCompleteFilter, {
                show: true,
                data
            }, 'show');
            if (result === null) {
                return true;
            }
            return result.toString() === 'true';
        }
        autoCompleteCleanSuggestions(suggestionContainer) {
            for (const suggestion of this.autoCompleteSuggestions) {
                suggestion.item.removeEventListener('click', suggestion.clickListener);
            }
            this.autoCompleteSuggestions = [];
            while (suggestionContainer.firstChild) {
                suggestionContainer.removeChild(suggestionContainer.firstChild);
            }
        }
        autoCompleteDisplaySuggestions(suggestions, status, suggestionContainer, input) {
            suggestionContainer.style.width = `${ input.offsetWidth }px`;
            this.autoCompleteInputValue = input.value;
            this.autoCompleteCleanSuggestions(suggestionContainer);
            if (status !== google.maps.places.PlacesServiceStatus.OK) {
                suggestionContainer.style.display = 'none';
                return;
            }
            for (const suggestion of suggestions) {
                if (this.autoCompleteFilterSuggestion(suggestion)) {
                    this.autoCompleteSuggestions.push(suggestion);
                    this.autoCompleteSuggestionBuilder(suggestion, suggestionContainer, input);
                }
            }
            if (!suggestionContainer.childElementCount) {
                this.autoCompleteCleanSuggestions(suggestionContainer);
                suggestionContainer.style.display = 'none';
            } else {
                suggestionContainer.style.display = 'block';
            }
        }
        autoCompleteSuggestionBuilder(suggestion, suggestionContainer, input) {
            const item = document.createElement('div');
            item.classList.add('pac-item');
            const itemLogo = document.createElement('span');
            itemLogo.classList.add('pac-icon', 'pac-icon-marker');
            item.appendChild(itemLogo);
            const itemMain = document.createElement('span');
            itemMain.classList.add('pac-item-query');
            if (suggestion.structured_formatting.main_text_matched_substrings) {
                const matches = suggestion.structured_formatting.main_text_matched_substrings;
                for (const k in matches) {
                    const part = matches[k];
                    if (k === 0 && part.offset > 0) {
                        itemMain.appendChild(document.createTextNode(suggestion.structured_formatting.main_text.substring(0, part.offset)));
                    }
                    const itemBold = document.createElement('span');
                    itemBold.classList.add('pac-matched');
                    itemBold.appendChild(document.createTextNode(suggestion.structured_formatting.main_text.substring(part.offset, part.offset + part.length)));
                    itemMain.appendChild(itemBold);
                    if (k === matches.length - 1) {
                        const content = suggestion.structured_formatting.main_text.substring(part.offset + part.length);
                        if (content.length > 0) {
                            itemMain.appendChild(document.createTextNode(content));
                        }
                    }
                }
            } else {
                itemMain.appendChild(document.createTextNode(suggestion.structured_formatting.main_text));
            }
            item.appendChild(itemMain);
            if (suggestion.structured_formatting.secondary_text) {
                const itemSecondary = document.createElement('span');
                if (suggestion.structured_formatting.secondary_text_matched_substrings) {
                    const matches = suggestion.structured_formatting.secondary_text_matched_substrings;
                    for (const k in matches) {
                        const part = matches[k];
                        if (k === 0 && part.offset > 0) {
                            itemSecondary.appendChild(document.createTextNode(suggestion.structured_formatting.secondary_text.substring(0, part.offset)));
                        }
                        const itemBold = document.createElement('span');
                        itemBold.classList.add('pac-matched');
                        itemBold.appendChild(document.createTextNode(suggestion.structured_formatting.secondary_text.substring(part.offset, part.offset + part.length)));
                        itemSecondary.appendChild(itemBold);
                        if (k === matches.length - 1) {
                            const content = suggestion.structured_formatting.secondary_text.substring(part.offset + part.length);
                            if (content.length > 0) {
                                itemSecondary.appendChild(document.createTextNode(content));
                            }
                        }
                    }
                } else {
                    itemSecondary.appendChild(document.createTextNode(suggestion.structured_formatting.secondary_text));
                }
                item.appendChild(itemSecondary);
            }
            suggestionContainer.appendChild(item);
            const clickListener = () => {
                input.value = suggestion.description;
                this.autoCompleteInputValue = suggestion.description;
                this.autoCompleteServiceListener(suggestion, suggestionContainer, input);
            };
            suggestion.clickListener = clickListener;
            suggestion.item = item;
            if ('addEventListener' in item) {
                item.addEventListener('click', clickListener, false);
            } else if ('attachEvent' in item) {
                item.attachEvent('onclick', clickListener);
            }
        }
        autoCompleteServiceListener(suggestion, suggestionContainer, input) {
            const service = new google.maps.places.PlacesService(input);
            service.getDetails({ placeId: suggestion.place_id }, (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    this.setValue(place);
                }
            });
        }
        addInput(input, container) {
            super.addInput(input, container);
            Formio.libraryReady('googleMaps').then(() => {
                let autoCompleteOptions = {};
                if (this.component.map) {
                    autoCompleteOptions = this.component.map.autoCompleteOptions || {};
                    if (autoCompleteOptions.location) {
                        const {lat, lng} = autoCompleteOptions.location;
                        autoCompleteOptions.location = new google.maps.LatLng(lat, lng);
                    }
                }
                if (this.component.map && this.component.map.autoCompleteFilter) {
                    this.autoCompleteInit(input, autoCompleteOptions);
                } else {
                    const autocomplete = new google.maps.places.Autocomplete(input);
                    autocomplete.addListener('place_changed', () => this.setValue(autocomplete.getPlace()));
                }
            });
        }
        elementInfo() {
            const info = super.elementInfo();
            info.attr.class += ' address-search';
            return info;
        }
        getView(value) {
            return _.get(value, 'formatted_address', '');
        }
    };
});