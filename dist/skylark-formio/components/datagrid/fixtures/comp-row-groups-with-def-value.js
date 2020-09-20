/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(function(){"use strict";return{label:"Data Grid",disableAddingRemovingRows:!0,defaultOpen:!1,layoutFixed:!1,enableRowGroups:!0,mask:!1,tableView:!0,alwaysEnabled:!1,type:"datagrid",input:!0,key:"dataGrid",components:[{label:"Name",allowMultipleMasks:!1,showWordCount:!1,showCharCount:!1,tableView:!0,alwaysEnabled:!1,type:"textfield",input:!0,key:"name",widget:{type:""},row:"0-0"},{label:"Age",mask:!1,tableView:!0,alwaysEnabled:!1,type:"number",input:!0,key:"age",row:"0-1"}],encrypted:!1,defaultValue:[{name:"Alex",age:1},{name:"Bob",age:2},{name:"Conny",age:3}],validate:{customMessage:"",json:""},conditional:{show:"",when:"",json:""},rowGroups:[{label:"Header",numberOfRows:1},{label:"Body",numberOfRows:3},{label:"Footer",numberOfRows:1}],groupToggle:!1}});
//# sourceMappingURL=../../../sourcemaps/components/datagrid/fixtures/comp-row-groups-with-def-value.js.map
