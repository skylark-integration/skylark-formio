/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../../components/_classes/component/Component.form","./editForm/EditTable.edit.display"],function(e,a){"use strict";return function(...o){return e([{key:"display",components:a},{key:"data",components:[{key:"defaultValue",ignore:!0},{label:"",mask:!1,tableView:!0,alwaysEnabled:!1,type:"hidden",input:!0,key:"disableAddingRemovingRows",calculateValue:e=>e.instance.data.enableRowGroups,encrypted:!1},{key:"enableRowGroups",type:"checkbox",label:"Enable Row Groups",weight:50},{label:"Groups",disableAddingRemovingRows:!1,defaultOpen:!1,addAnother:"",addAnotherPosition:"bottom",mask:!1,tableView:!0,alwaysEnabled:!1,type:"datagrid",input:!0,key:"rowGroups",reorder:!0,components:[{label:"Label",allowMultipleMasks:!1,showWordCount:!1,showCharCount:!1,tableView:!0,alwaysEnabled:!1,type:"textfield",input:!0,key:"label",widget:{type:""},row:"0-0"},{label:"Number of Rows",mask:!1,tableView:!0,alwaysEnabled:!1,type:"number",input:!0,key:"numberOfRows",row:"0-1"}],weight:51,conditional:{json:{var:"data.enableRowGroups"}}}]}],...o)}});
//# sourceMappingURL=../../sourcemaps/contrib/edittable/EditTable.form.js.map
