/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(function(){"use strict";return[{type:"select",input:!0,dataSrc:"url",data:{url:"/form?limit=4294967295&select=_id,title"},searchField:"title__regex",template:"<span>{{ item.title }}</span>",valueProperty:"_id",authenticate:!0,label:"Form",key:"form",weight:10,lazyLoad:!1,tooltip:"The form to load within this form component.",validate:{required:!0}},{type:"textfield",input:!0,label:"Form Revision",placeholder:"Current",tooltip:"You can lock the nested form to a specific revision by entering the revision number here.",key:"revision",weight:11},{type:"checkbox",input:!0,weight:20,key:"reference",label:"Save as reference",tooltip:"Using this option will save this field as a reference and link its value to the value of the origin record."}]});
//# sourceMappingURL=../../../sourcemaps/components/form/editForm/Form.edit.form.js.map
