define([
    'skylark-lodash',
//    'fast-deep-equal',
    '../_classes/nestedarray/NestedArrayComponent',
    '../_classes/component/Component',
    '../../utils/utils',
    './templates/index'
], function (_,  NestedArrayComponent, Component, a, templates) {
    'use strict';

    var equal = _.isEqual;
    
    const EditRowState = {
        New: 'new',
        Editing: 'editing',
        Saved: 'saved',
        Removed: 'removed'
    };
    return class EditGridComponent extends NestedArrayComponent {
        static schema(...extend) {
            return NestedArrayComponent.schema({
                type: 'editgrid',
                label: 'Edit Grid',
                key: 'editGrid',
                clearOnHide: true,
                input: true,
                tree: true,
                removeRow: 'Cancel',
                defaultOpen: false,
                openWhenEmpty: false,
                components: [],
                inlineEdit: false,
                templates: {
                    header: EditGridComponent.defaultHeaderTemplate,
                    row: EditGridComponent.defaultRowTemplate,
                    footer: ''
                }
            }, ...extend);
        }
        static get builderInfo() {
            return {
                title: 'Edit Grid',
                icon: 'tasks',
                group: 'data',
                documentation: 'http://help.form.io/userguide/#editgrid',
                weight: 30,
                schema: EditGridComponent.schema()
            };
        }
        static get defaultHeaderTemplate() {
            return `<div class="row">
  {% util.eachComponent(components, function(component) { %}
    <div class="col-sm-2">{{ component.label }}</div>
  {% }) %}
</div>`;
        }
        static get defaultRowTemplate() {
            return `<div class="row">
  {% util.eachComponent(components, function(component) { %}
    <div class="col-sm-2">
      {{ getView(component, row[component.key]) }}
    </div>
  {% }) %}
  {% if (!instance.options.readOnly && !instance.originalComponent.disabled) { %}
    <div class="col-sm-2">
      <div class="btn-group pull-right">
        <button class="btn btn-default btn-light btn-sm editRow"><i class="{{ iconClass('edit') }}"></i></button>
        {% if (!instance.hasRemoveButtons || instance.hasRemoveButtons()) { %}
          <button class="btn btn-danger btn-sm removeRow"><i class="{{ iconClass('trash') }}"></i></button>
        {% } %}
      </div>
    </div>
  {% } %}
</div>`;
        }
        get defaultSchema() {
            return EditGridComponent.schema();
        }
        get emptyValue() {
            return [];
        }
        get editgridKey() {
            return `editgrid-${ this.key }`;
        }
        get rowRef() {
            return `${ this.editgridKey }-row`;
        }
        get rowElements() {
            return this.refs[this.rowRef];
        }
        get addRowRef() {
            return `${ this.editgridKey }-addRow`;
        }
        get addRowElements() {
            return this.refs[this.addRowRef];
        }
        get saveRowRef() {
            return `${ this.editgridKey }-saveRow`;
        }
        get saveRowElements() {
            return this.refs[this.saveRowRef];
        }
        get cancelRowRef() {
            return `${ this.editgridKey }-cancelRow`;
        }
        get cancelRowElements() {
            return this.refs[this.cancelRowRef];
        }
        get inlineEditMode() {
            return this.component.inlineEdit;
        }
        get saveEditMode() {
            return !this.inlineEditMode;
        }
        get minLength() {
            return _.get(this.component, 'validate.minLength', 0);
        }
        get data() {
            return this._data;
        }
        set data(value) {
            this._data = value;
            const data = this.dataValue;
            (this.editRows || []).forEach((row, index) => {
                const rowData = data[index];
                row.data = rowData;
                row.components.forEach(component => {
                    component.data = rowData;
                });
            });
        }
        get iteratableRows() {
            return this.editRows;
        }
        constructor(...args) {
            super(...args);
            this.type = 'editgrid';
        }
        hasRemoveButtons() {
            return !this.component.disableAddingRemovingRows && !this.options.readOnly && !this.disabled && this.fullMode && this.dataValue.length > _.get(this.component, 'validate.minLength', 0);
        }
        init() {
            if (this.builderMode) {
                this.editRows = [];
                return super.init();
            }
            this.components = this.components || [];
            const dataValue = this.dataValue || [];
            const openWhenEmpty = !dataValue.length && this.component.openWhenEmpty;
            if (openWhenEmpty) {
                const dataObj = {};
                this.editRows = [{
                        components: this.createRowComponents(dataObj, 0),
                        data: dataObj,
                        state: EditRowState.New,
                        backup: null,
                        error: null
                    }];
                if (this.inlineEditMode) {
                    this.dataValue.push(dataObj);
                }
            } else {
                this.editRows = dataValue.map((row, rowIndex) => ({
                    components: this.createRowComponents(row, rowIndex),
                    data: row,
                    state: EditRowState.Saved,
                    backup: null,
                    error: null
                }));
            }
            this.checkData();
        }
        isOpen(editRow) {
            return [
                EditRowState.New,
                EditRowState.Editing
            ].includes(editRow.state);
        }
        render(children) {
            if (this.builderMode) {
                return super.render();
            }
            const dataValue = this.dataValue || [];
            const headerTemplate = a.Evaluator.noeval ? templates.header : _.get(this.component, 'templates.header');
            return super.render(children || this.renderTemplate('editgrid', {
                ref: {
                    row: this.rowRef,
                    addRow: this.addRowRef,
                    saveRow: this.saveRowRef,
                    cancelRow: this.cancelRowRef
                },
                header: this.renderString(headerTemplate, {
                    components: this.component.components,
                    value: dataValue
                }),
                footer: this.renderString(_.get(this.component, 'templates.footer'), {
                    components: this.component.components,
                    value: dataValue
                }),
                rows: this.editRows.map(this.renderRow.bind(this)),
                openRows: this.editRows.map(row => this.isOpen(row)),
                errors: this.editRows.map(row => row.error),
                hasAddButton: this.hasAddButton(),
                hasRemoveButtons: this.hasRemoveButtons()
            }));
        }
        attach(element) {
            if (this.builderMode) {
                return super.attach(element);
            }
            this.loadRefs(element, {
                [this.addRowRef]: 'multiple',
                [this.saveRowRef]: 'multiple',
                [this.cancelRowRef]: 'multiple',
                [this.rowRef]: 'multiple'
            });
            this.addRowElements.forEach(addButton => {
                this.addEventListener(addButton, 'click', () => this.addRow());
            });
            let openRowCount = 0;
            this.rowElements.forEach((row, rowIndex) => {
                const editRow = this.editRows[rowIndex];
                if (this.isOpen(editRow)) {
                    this.attachComponents(row, editRow.components);
                    this.addEventListener(this.saveRowElements[openRowCount], 'click', () => this.saveRow(rowIndex));
                    this.addEventListener(this.cancelRowElements[openRowCount], 'click', () => this.cancelRow(rowIndex));
                    openRowCount++;
                } else {
                    [
                        {
                            className: 'removeRow',
                            event: 'click',
                            action: () => this.removeRow(rowIndex)
                        },
                        {
                            className: 'editRow',
                            event: 'click',
                            action: () => this.editRow(rowIndex)
                        }
                    ].forEach(({className, event, action}) => {
                        const elements = row.getElementsByClassName(className);
                        Array.prototype.forEach.call(elements, element => {
                            this.addEventListener(element, event, action);
                        });
                    });
                }
            });
            if (openRowCount) {
                this.addClass(this.refs.component, `formio-component-${ this.component.type }-row-open`);
            } else {
                this.removeClass(this.refs.component, `formio-component-${ this.component.type }-row-open`);
            }
            return super.attach(element);
        }
        clearOnHide(show) {
            super.clearOnHide(show);
            if (this.component.clearOnHide && !this.visible) {
                if (!this.editRows) {
                    return;
                }
                this.removeAllRows();
            }
        }
        renderRow(row, rowIndex) {
            const dataValue = this.dataValue || [];
            if (this.isOpen(row)) {
                return this.renderComponents(row.components);
            } else {
                const flattenedComponents = this.flattenComponents(rowIndex);
                const rowTemplate = a.Evaluator.noeval ? templates.row : _.get(this.component, 'templates.row', EditGridComponent.defaultRowTemplate);
                return this.renderString(rowTemplate, {
                    row: dataValue[rowIndex] || {},
                    data: this.data,
                    rowIndex,
                    components: this.component.components,
                    flattenedComponents,
                    getView: (component, data) => {
                        const instance = flattenedComponents[component.key];
                        let view = instance ? instance.getView(data) : '';
                        if (instance && instance.widget && view !== '--- PROTECTED ---') {
                            if (_.isArray(view)) {
                                view = view.map(value => instance.widget.getValueAsString(value));
                            } else {
                                view = instance.widget.getValueAsString(view);
                            }
                        }
                        return view;
                    }
                });
            }
        }
        everyComponent(fn, rowIndex) {
            const components = this.getComponents(rowIndex);
            _.each(components, (component, index) => {
                if (fn(component, components, index) === false) {
                    return false;
                }
                if (typeof component.everyComponent === 'function') {
                    if (component.everyComponent(fn) === false) {
                        return false;
                    }
                }
            });
        }
        flattenComponents(rowIndex) {
            const result = {};
            this.everyComponent(component => {
                result[component.component.flattenAs || component.key] = component;
            }, rowIndex);
            return result;
        }
        getComponents(rowIndex) {
            this.editRows = this.editRows || [];
            return this.builderMode ? super.getComponents() : _.isNumber(rowIndex) ? this.editRows[rowIndex].components || [] : this.editRows.reduce((result, row) => result.concat(row.components || []), []);
        }
        destroyComponents(rowIndex) {
            if (this.builderMode) {
                return super.destroyComponents();
            }
            const components = this.getComponents(rowIndex).slice();
            components.forEach(comp => comp.destroy());
        }
        addRow() {
            if (this.options.readOnly) {
                return;
            }
            const dataObj = {};
            const rowIndex = this.editRows.length;
            const editRow = {
                components: this.createRowComponents(dataObj, rowIndex),
                data: dataObj,
                state: EditRowState.New,
                backup: null,
                error: null
            };
            this.editRows.push(editRow);
            if (this.inlineEditMode) {
                this.dataValue.push(dataObj);
                this.triggerChange();
            }
            this.emit('editGridAddRow', {
                component: this.component,
                row: editRow
            });
            this.checkRow('checkData', null, {}, editRow.data, editRow.components);
            if (this.component.modal) {
                this.addRowModal(rowIndex);
            } else {
                this.redraw();
            }
            return editRow;
        }
        addRowModal(rowIndex) {
            const modalContent = this.ce('div');
            const editRow = this.editRows[rowIndex];
            const {components} = editRow;
            modalContent.innerHTML = this.renderComponents(components);
            const dialog = this.component.modal ? this.createModal(modalContent) : undefined;
            dialog.refs.dialogContents.appendChild(this.ce('button', {
                class: 'btn btn-primary',
                onClick: () => {
                    if (this.validateRow(editRow, true)) {
                        dialog.close();
                        this.saveRow(rowIndex);
                    }
                }
            }, this.component.saveRow || 'Save'));
            this.attachComponents(modalContent, components);
        }
        editRow(rowIndex) {
            const editRow = this.editRows[rowIndex];
            editRow.state = EditRowState.Editing;
            const dataSnapshot = a.fastCloneDeep(editRow.data);
            if (this.inlineEditMode) {
                editRow.backup = dataSnapshot;
            } else {
                editRow.backup = editRow.data;
                editRow.data = dataSnapshot;
                this.restoreRowContext(editRow);
            }
            if (this.component.modal) {
                this.addRowModal(rowIndex);
            } else {
                this.redraw();
            }
        }
        clearErrors(rowIndex) {
            const editRow = this.editRows[rowIndex];
            if (editRow && Array.isArray(editRow.components)) {
                editRow.components.forEach(comp => {
                    comp.setPristine(true);
                    comp.setCustomValidity('');
                });
            }
        }
        cancelRow(rowIndex) {
            if (this.options.readOnly) {
                return;
            }
            const editRow = this.editRows[rowIndex];
            switch (editRow.state) {
            case EditRowState.New: {
                    editRow.state = EditRowState.Removed;
                    this.clearErrors(rowIndex);
                    this.destroyComponents(rowIndex);
                    if (this.inlineEditMode) {
                        this.splice(rowIndex);
                    }
                    this.editRows.splice(rowIndex, 1);
                    break;
                }
            case EditRowState.Editing: {
                    editRow.state = EditRowState.Saved;
                    if (this.inlineEditMode) {
                        this.dataValue[rowIndex] = editRow.backup;
                    }
                    editRow.data = editRow.backup;
                    editRow.backup = null;
                    this.restoreRowContext(editRow);
                    this.clearErrors(rowIndex);
                    break;
                }
            }
            this.checkValidity(null, true);
            this.redraw();
        }
        saveRow(rowIndex) {
            if (this.options.readOnly) {
                return;
            }
            const editRow = this.editRows[rowIndex];
            if (!this.validateRow(editRow, true)) {
                return false;
            }
            if (this.saveEditMode) {
                const dataValue = this.dataValue || [];
                switch (editRow.state) {
                case EditRowState.New: {
                        const newIndex = dataValue.length;
                        dataValue.push(editRow.data);
                        if (rowIndex !== newIndex) {
                            this.editRows.splice(rowIndex, 1);
                            this.editRows.splice(newIndex, 0, editRow);
                        }
                        break;
                    }
                case EditRowState.Editing: {
                        dataValue[rowIndex] = editRow.data;
                        break;
                    }
                }
            }
            editRow.state = EditRowState.Saved;
            editRow.backup = null;
            this.updateValue();
            this.triggerChange();
            this.checkValidity(null, true);
            this.redraw();
            return true;
        }
        updateComponentsRowIndex(components, rowIndex) {
            components.forEach((component, colIndex) => {
                component.rowIndex = rowIndex;
                component.row = `${ rowIndex }-${ colIndex }`;
            });
        }
        updateRowsComponents(rowIndex) {
            this.editRows.slice(rowIndex).forEach((row, index) => {
                this.updateComponentsRowIndex(row.components, index);
            });
        }
        removeRow(rowIndex) {
            if (this.options.readOnly) {
                return;
            }
            const editRow = this.editRows[rowIndex];
            editRow.state = EditRowState.Removed;
            this.destroyComponents(rowIndex);
            this.splice(rowIndex);
            this.editRows.splice(rowIndex, 1);
            this.updateRowsComponents(rowIndex);
            this.updateValue();
            this.triggerChange();
            this.checkValidity(null, true);
            this.checkData();
            this.redraw();
        }
        removeAllRows() {
            if (this.options.readOnly) {
                return;
            }
            const editRows = this.editRows || [];
            const rowIndex = editRows.length - 1;
            for (let index = rowIndex; index >= 0; index--) {
                this.removeRow(index);
            }
        }
        createRowComponents(row, rowIndex) {
            return this.component.components.map((col, colIndex) => {
                const column = _.clone(col);
                const options = _.clone(this.options);
                options.name += `[${ rowIndex }]`;
                options.row = `${ rowIndex }-${ colIndex }`;
                options.onChange = (flags, changed, modified) => {
                    const editRow = this.editRows[rowIndex];
                    if (this.inlineEditMode) {
                        this.triggerRootChange(flags, changed, modified);
                    } else if (editRow) {
                        this.checkRow('checkData', null, { changed }, editRow.data, editRow.components);
                    }
                };
                const comp = this.createComponent(_.assign({}, column, { row: options.row }), options, row);
                comp.rowIndex = rowIndex;
                if (comp.path && column.key) {
                    comp.path = comp.path.replace(new RegExp(`\\.${ column.key }$`), `[${ rowIndex }].${ column.key }`);
                }
                return comp;
            });
        }
        validateRow(editRow, dirty) {
            let valid = true;
            if (editRow.state === EditRowState.Editing || dirty) {
                editRow.components.forEach(comp => {
                    comp.setPristine(!dirty);
                    valid &= comp.checkValidity(null, dirty, editRow.data);
                });
            }
            if (this.component.validate && this.component.validate.row) {
                valid = this.evaluate(this.component.validate.row, {
                    valid,
                    row: editRow.data
                }, 'valid', true);
                if (valid.toString() !== 'true') {
                    editRow.error = valid;
                    valid = false;
                } else {
                    editRow.error = null;
                }
                if (valid === null) {
                    valid = `Invalid row validation for ${ this.key }`;
                }
            }
            return !!valid;
        }
        checkValidity(data, dirty, row) {
            data = data || this.rootValue;
            row = row || this.data;
            if (!this.checkCondition(row, data)) {
                this.setCustomValidity('');
                return true;
            }
            return this.checkComponentValidity(data, dirty, row);
        }
        checkComponentValidity(data, dirty, row) {
            if (!super.checkComponentValidity(data, dirty, row)) {
                return false;
            }
            let rowsValid = true;
            let rowsEditing = false;
            this.editRows.forEach(editRow => {
                const rowValid = this.validateRow(editRow, dirty);
                rowsValid &= rowValid;
                rowsEditing |= dirty && this.isOpen(editRow);
            });
            if (!rowsValid) {
                this.setCustomValidity('Please correct rows before proceeding.', dirty);
                return false;
            } else if (rowsEditing && this.saveEditMode) {
                this.setCustomValidity('Please save all rows before proceeding.', dirty);
                return false;
            }
            const message = this.invalid || this.invalidMessage(data, dirty);
            this.setCustomValidity(message, dirty);
            return true;
        }
        get defaultValue() {
            const value = super.defaultValue;
            const defaultValue = Array.isArray(value) ? value : [];
            _.times(this.minLength - defaultValue.length, () => defaultValue.push({}));
            return defaultValue;
        }
        setValue(value, flags = {}) {
            if (equal(this.defaultValue, value)) {
                return false;
            }
            if (!value) {
                this.dataValue = this.defaultValue;
                return false;
            }
            if (!Array.isArray(value)) {
                if (typeof value === 'object') {
                    value = [value];
                } else {
                    return false;
                }
            }
            const changed = this.hasChanged(value, this.dataValue);
            this.dataValue = value;
            this.dataValue.forEach((row, rowIndex) => {
                let editRow = this.editRows[rowIndex];
                if (editRow) {
                    editRow.data = row;
                    this.restoreRowContext(editRow, flags);
                    editRow.state = EditRowState.Saved;
                    editRow.backup = null;
                    editRow.error = null;
                } else {
                    editRow = this.editRows[rowIndex] = {
                        components: this.createRowComponents(row, rowIndex),
                        data: row,
                        state: EditRowState.Saved,
                        backup: null,
                        error: null
                    };
                    this.checkRow('checkData', null, {}, editRow.data, editRow.components);
                }
            });
            this.updateOnChange(flags, changed);
            if (changed) {
                this.redraw();
            }
            return changed;
        }
        restoreRowContext(editRow, flags = {}) {
            editRow.components.forEach(component => {
                component.data = editRow.data;
                this.setNestedValue(component, editRow.data, flags);
            });
        }
    };
    EditGridComponent.prototype.hasChanged = Component.prototype.hasChanged;
});