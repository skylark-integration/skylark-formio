/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../../_classes/component/editForm/utils"],function(a){"use strict";return[a.javaScriptValue("Custom Default Value","customDefaultValue","customDefaultValue",120,'<p><h4>Example:</h4><pre>value = data.firstName + " " + data.lastName;</pre></p>','<p><h4>Example:</h4><pre>{"cat": [{"var": "data.firstName"}, " ", {"var": "data.lastName"}]}</pre>'),a.javaScriptValue("Calculated Value","calculateValue","calculateValue",130,"<p><h4>Example:</h4><pre>value = data.a + data.b + data.c;</pre></p>",'<p><h4>Example:</h4><pre>{"+": [{"var": "data.a"}, {"var": "data.b"}, {"var": "data.c"}]}</pre><p><a target="_blank" href="http://formio.github.io/formio.js/app/examples/calculated.html">Click here for an example</a></p>')]});
//# sourceMappingURL=../../../sourcemaps/components/form/editForm/Form.edit.data.js.map
