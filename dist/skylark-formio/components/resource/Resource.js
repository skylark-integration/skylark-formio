/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../select/Select"],function(e){"use strict";return class t extends e{static schema(...t){return e.schema({type:"resource",label:"Resource",key:"resource",dataSrc:"resource",resource:"",project:"",template:"<span>{{ item.data }}</span>"},...t)}static get builderInfo(){return{title:"Resource",group:"premium",icon:"files-o",weight:90,documentation:"http://help.form.io/userguide/#resource",schema:t.schema()}}init(){super.init(),this.component.dataSrc="resource",this.component.data={resource:this.component.resource}}get defaultSchema(){return t.schema()}}});
//# sourceMappingURL=../../sourcemaps/components/resource/Resource.js.map
