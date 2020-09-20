/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'<div class="pdf-upload formio-component-file">\n  <h3 class="label">{{ctx.t(\'Upload a PDF File\')}}</h3>\n  <input type="file" style="opacity: 0; position: absolute;" tabindex="-1" accept=".pdf" ref="hiddenFileInputElement">\n  <div class="fileSelector" ref="fileDrop">\n    <i class="{{ctx.iconClass(\'cloud-upload\')}}"></i>{{ctx.t(\'Drop pdf to start, or\')}} <a href="#" ref="fileBrowse" class="browse">{{ctx.t(\'browse\')}}</a>\n  </div>\n  <div class="alert alert-danger" ref="uploadError">\n\n  </div>\n</div>\n\n'});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/pdfBuilderUpload/form.ejs.js.map
