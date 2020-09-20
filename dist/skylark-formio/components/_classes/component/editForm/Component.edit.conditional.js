/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./utils","../../../../utils/utils"],function(e,t){"use strict";return[{type:"panel",title:"Simple",key:"simple-conditional",theme:"default",components:[{type:"select",input:!0,label:"This component should Display:",key:"conditional.show",dataSrc:"values",data:{values:[{label:"True",value:"true"},{label:"False",value:"false"}]}},{type:"select",input:!0,label:"When the form component:",key:"conditional.when",dataSrc:"custom",valueProperty:"value",data:{custom:e=>t.getContextComponents(e)}},{type:"textfield",input:!0,label:"Has the value:",key:"conditional.eq"}]},e.javaScriptValue("Advanced Conditions","customConditional","conditional.json",110,"<p>You must assign the <strong>show</strong> variable a boolean result.</p><p><strong>Note: Advanced Conditional logic will override the results of the Simple Conditional logic.</strong></p><h5>Example</h5><pre>show = !!data.showMe;</pre>",'<p><a href="http://formio.github.io/formio.js/app/examples/conditions.html" target="_blank">Click here for an example</a></p>')]});
//# sourceMappingURL=../../../../sourcemaps/components/_classes/component/editForm/Component.edit.conditional.js.map
