/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./Rule","../../utils/utils","skylark-lodash","../../vendors/getify/npo"],function(e,s,i,t){class d extends e{check(e){return!(e&&!i.isEmpty(e))||(!this.config.db||new t(t=>{const d=this.config.form,n=this.config.submission,a=`data.${this.component.path}`,r={form:d._id};i.isString(e)?r[a]={$regex:new RegExp(`^${s.escapeRegExCharacters(e)}$`),$options:"i"}:i.isPlainObject(e)&&e.address&&e.address.address_components&&e.address.place_id?r[`${a}.address.place_id`]={$regex:new RegExp(`^${s.escapeRegExCharacters(e.address.place_id)}$`),$options:"i"}:i.isArray(e)?r[a]={$all:e}:i.isObject(e)&&(r[a]={$eq:e}),r.deleted={$eq:null},this.config.db.findOne(r,(e,s)=>t(!e&&(!s||n._id&&s._id.toString()===n._id)))}).catch(()=>!1))}}return d.prototype.defaultMessage="{{field}} must be unique",d});
//# sourceMappingURL=../../sourcemaps/validator/rules/Unique.js.map
