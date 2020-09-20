define([
    './index',
    './address/Address.form',
    './button/Button.form',
    './checkbox/Checkbox.form',
    './columns/Columns.form',
    './container/Container.form',
    './content/Content.form',
    './currency/Currency.form',
    './datagrid/DataGrid.form',
    './datamap/DataMap.form',
    './datetime/DateTime.form',
    './day/Day.form',
    './editgrid/EditGrid.form',
    './email/Email.form',
    './fieldset/Fieldset.form',
    './file/File.form',
    './form/Form.form',
    './hidden/Hidden.form',
    './html/HTML.form',
    './number/Number.form',
    './panel/Panel.form',
    './password/Password.form',
    './phonenumber/PhoneNumber.form',
    './radio/Radio.form',
    './recaptcha/ReCaptcha.form',
    './resource/Resource.form',
    './selectboxes/SelectBoxes.form',
    './select/Select.form',
    './signature/Signature.form',
    './survey/Survey.form',
    './table/Table.form',
    './tabs/Tabs.form',
    './tags/Tags.form',
    './textarea/TextArea.form',
    './textfield/TextField.form',
    './time/Time.form',
    './tree/Tree.form',
    './unknown/Unknown.form',
    './url/Url.form',
    './well/Well.form'
], function (Components, AddressForm, ButtonForm, CheckboxForm, ColumnsForm, ContainerForm, ContentForm, CurrencyForm, DataGridForm, DataMapForm, DateTimeForm, DayForm, EditGridForm, EmailForm, FieldsetForm, FileForm, FormForm, HiddenForm, HtmlElementForm, NumberForm, PanelForm, PasswordForm, PhoneNumberForm, RadioForm, ReCaptchaForm, ResourceForm, SelectboxesForm, SelectForm, SignatureForm, SurveyForm, TableForm, TabsForm, TagsForm, TextAreaForm, TextfieldForm, TimeForm, TreeForm, UnknownForm, UrlForm, WellForm) {
    'use strict';
    Components.address.editForm = AddressForm;
    Components.button.editForm = ButtonForm;
    Components.checkbox.editForm = CheckboxForm;
    Components.columns.editForm = ColumnsForm;
    Components.container.editForm = ContainerForm;
    Components.content.editForm = ContentForm;
    Components.currency.editForm = CurrencyForm;
    Components.datagrid.editForm = DataGridForm;
    Components.datamap.editForm = DataMapForm;
    Components.datetime.editForm = DateTimeForm;
    Components.day.editForm = DayForm;
    Components.editgrid.editForm = EditGridForm;
    Components.email.editForm = EmailForm;
    Components.fieldset.editForm = FieldsetForm;
    Components.file.editForm = FileForm;
    Components.form.editForm = FormForm;
    Components.hidden.editForm = HiddenForm;
    Components.htmlelement.editForm = HtmlElementForm;
    Components.number.editForm = NumberForm;
    Components.panel.editForm = PanelForm;
    Components.password.editForm = PasswordForm;
    Components.phoneNumber.editForm = PhoneNumberForm;
    Components.radio.editForm = RadioForm;
    Components.recaptcha.editForm = ReCaptchaForm;
    Components.resource.editForm = ResourceForm;
    Components.select.editForm = SelectForm;
    Components.selectboxes.editForm = SelectboxesForm;
    Components.signature.editForm = SignatureForm;
    Components.survey.editForm = SurveyForm;
    Components.table.editForm = TableForm;
    Components.tabs.editForm = TabsForm;
    Components.tags.editForm = TagsForm;
    Components.textarea.editForm = TextAreaForm;
    Components.textfield.editForm = TextfieldForm;
    Components.time.editForm = TimeForm;
    Components.tree.editForm = TreeForm;
    Components.unknown.editForm = UnknownForm;
    Components.url.editForm = UrlForm;
    Components.well.editForm = WellForm;
    return Components;
});