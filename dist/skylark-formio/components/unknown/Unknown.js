/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../_classes/component/Component"],function(e){"use strict";return class t extends e{static schema(){return{type:"custom",key:"custom",protected:!1,persistent:!0}}static get builderInfo(){return{title:"Custom",icon:"cubes",group:"premium",documentation:"https://help.form.io/userguide/form-components/#custom",weight:120,schema:t.schema()}}get defaultSchema(){return t.schema()}}});
//# sourceMappingURL=../../sourcemaps/components/unknown/Unknown.js.map
