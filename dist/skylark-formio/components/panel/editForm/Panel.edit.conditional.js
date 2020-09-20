/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../../_classes/component/editForm/utils"],function(a){"use strict";return[{...a.javaScriptValue("Advanced Next Page","nextPage","nextPage",110,"\n  <p>You must assign the <strong>next</strong> variable with the API key of the next page.</p>\n  <p>The global variable <strong>data</strong> is provided, and allows you to access the data of any form component, by using its API key.</p>\n  <p>Also <strong>moment</strong> library is available, and allows you to manipulate dates in a convenient way.</p>\n  <h5>Example</h5><pre>next = data.addComment ? 'page3' : 'page4';</pre>\n","\n  <p>Submission data is available as JsonLogic variables, with the same api key as your components.</p>\n"),customConditional:a=>"wizard"===a.instance.options.editForm.display}]});
//# sourceMappingURL=../../../sourcemaps/components/panel/editForm/Panel.edit.conditional.js.map
