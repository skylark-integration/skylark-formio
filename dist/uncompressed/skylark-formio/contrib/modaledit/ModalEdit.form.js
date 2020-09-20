define([
    './editForm/ModalEdit.edit.display',
    '../../components/textarea/TextArea.form'
], function (modalEditDisplayForm, textAreaEditForm) {
    'use strict';
    return function (...extend) {
        return textAreaEditForm([{
                key: 'display',
                components: [
                    {
                        key: 'rows',
                        ignore: true
                    },
                    {
                        key: 'multiple',
                        ignore: true
                    },
                    ...modalEditDisplayForm
                ]
            }], ...extend);
    };
});