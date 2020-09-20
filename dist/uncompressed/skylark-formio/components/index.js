define([
    './address/Address',
    './button/Button',
    './checkbox/Checkbox',
    './columns/Columns',
    './_classes/component/Component',
    './container/Container',
    './content/Content',
    './currency/Currency',
    './datagrid/DataGrid',
    './datamap/DataMap',
    './datetime/DateTime',
    './day/Day',
    './editgrid/EditGrid',
    './email/Email',
    './fieldset/Fieldset',
    './file/File',
    './form/Form',
    './hidden/Hidden',
    './_classes/input/Input',
    './_classes/multivalue/Multivalue',
    './_classes/field/Field',
    './html/HTML',
    './_classes/nested/NestedComponent',
    './_classes/nesteddata/NestedDataComponent',
    './_classes/nestedarray/NestedArrayComponent',
    './number/Number',
    './panel/Panel',
    './password/Password',
    './phonenumber/PhoneNumber',
    './radio/Radio',
    './recaptcha/ReCaptcha',
    './resource/Resource',
    './selectboxes/SelectBoxes',
    './select/Select',
    './signature/Signature',
    './survey/Survey',
    './table/Table',
    './tabs/Tabs',
    './tags/Tags',
    './textarea/TextArea',
    './textfield/TextField',
    './time/Time',
    './tree/Tree',
    './unknown/Unknown',
    './url/Url',
    './well/Well'
], function (AddressComponent, ButtonComponent, CheckBoxComponent, ColumnsComponent, Component, ContainerComponent, ContentComponent, CurrencyComponent, DataGridComponent, DataMapComponent, DateTimeComponent, DayComponent, EditGridComponent, EmailComponent, FieldsetComponent, FileComponent, FormComponent, HiddenComponent, Input, Multivalue, Field, HTMLComponent, NestedComponent, NestedDataComponent, NestedArrayComponent, NumberComponent, PanelComponent, PasswordComponent, PhoneNumberComponent, RadioComponent, ReCaptchaComponent, ResourceComponent, SelectBoxesComponent, SelectComponent, SignatureComponent, SurveyComponent, TableComponent, TabsComponent, TagsComponent, TextAreaComponent, TextFieldComponent, TimeComponent, TreeComponent, UnknownComponent, UrlComponent, WellComponent) {
    'use strict';
    return {
        address: AddressComponent,
        base: Component,
        component: Component,
        button: ButtonComponent,
        checkbox: CheckBoxComponent,
        columns: ColumnsComponent,
        container: ContainerComponent,
        content: ContentComponent,
        currency: CurrencyComponent,
        datagrid: DataGridComponent,
        datamap: DataMapComponent,
        datetime: DateTimeComponent,
        day: DayComponent,
        editgrid: EditGridComponent,
        email: EmailComponent,
        input: Input,
        field: Field,
        multivalue: Multivalue,
        fieldset: FieldsetComponent,
        file: FileComponent,
        form: FormComponent,
        hidden: HiddenComponent,
        htmlelement: HTMLComponent,
        nested: NestedComponent,
        nesteddata: NestedDataComponent,
        nestedarray: NestedArrayComponent,
        number: NumberComponent,
        panel: PanelComponent,
        password: PasswordComponent,
        phoneNumber: PhoneNumberComponent,
        radio: RadioComponent,
        recaptcha: ReCaptchaComponent,
        resource: ResourceComponent,
        select: SelectComponent,
        selectboxes: SelectBoxesComponent,
        signature: SignatureComponent,
        survey: SurveyComponent,
        table: TableComponent,
        tabs: TabsComponent,
        tags: TagsComponent,
        textarea: TextAreaComponent,
        textfield: TextFieldComponent,
        time: TimeComponent,
        tree: TreeComponent,
        unknown: UnknownComponent,
        url: UrlComponent,
        well: WellComponent
    };
});