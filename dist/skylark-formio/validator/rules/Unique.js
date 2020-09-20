/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../../utils/utils","skylark-lodash","../../vendors/getify/npo"],function(e,s,i){"use strict";const t=require("./Rule");module.exports=class extends t{check(t){return!(t&&!s.isEmpty(t))||(!this.config.db||new i(i=>{const d=this.config.form,n=this.config.submission,a=`data.${this.component.path}`,r={form:d._id};s.isString(t)?r[a]={$regex:new RegExp(`^${e.escapeRegExCharacters(t)}$`),$options:"i"}:s.isPlainObject(t)&&t.address&&t.address.address_components&&t.address.place_id?r[`${a}.address.place_id`]={$regex:new RegExp(`^${e.escapeRegExCharacters(t.address.place_id)}$`),$options:"i"}:s.isArray(t)?r[a]={$all:t}:s.isObject(t)&&(r[a]={$eq:t}),r.deleted={$eq:null},this.config.db.findOne(r,(e,s)=>i(!e&&(!s||n._id&&s._id.toString()===n._id)))}).catch(()=>!1))}},Unique.prototype.defaultMessage="{{field}} must be unique"});
//# sourceMappingURL=../../sourcemaps/validator/rules/Unique.js.map
