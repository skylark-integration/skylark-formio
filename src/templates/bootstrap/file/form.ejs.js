define([], function() { return "{% if (!ctx.self.imageUpload) { %}\n  <ul class=\"list-group list-group-striped\">\n    <li class=\"list-group-item list-group-header hidden-xs hidden-sm\">\n      <div class=\"row\">\n        {% if (!ctx.disabled) { %}\n          <div class=\"col-md-1\"></div>\n        {% } %}\n        <div class=\"col-md-{% if (ctx.self.hasTypes) { %}7{% } else { %}9{% } %}\"><strong>{{ctx.t('File Name')}}</strong></div>\n        <div class=\"col-md-2\"><strong>{{ctx.t('Size')}}</strong></div>\n        {% if (ctx.self.hasTypes) { %}\n          <div class=\"col-md-2\"><strong>{{ctx.t('Type')}}</strong></div>\n        {% } %}\n      </div>\n    </li>\n    {% ctx.files.forEach(function(file) { %}\n      <li class=\"list-group-item\">\n        <div class=\"row\">\n          {% if (!ctx.disabled) { %}\n            <div class=\"col-md-1\"><i class=\"{{ctx.iconClass('remove')}}\" ref=\"removeLink\"></i></div>\n          {% } %}\n          <div class=\"col-md-{% if (ctx.self.hasTypes) { %}7{% } else { %}9{% } %}\">\n            {% if (ctx.component.uploadOnly) { %}\n              {{file.originalName || file.name}}\n            {% } else { %}\n              <a href=\"{{file.url || '#'}}\" target=\"_blank\" ref=\"fileLink\">{{file.originalName || file.name}}</a>\n            {% } %}\n          </div>\n          <div class=\"col-md-2\">{{ctx.fileSize(file.size)}}</div>\n          {% if (ctx.self.hasTypes && !ctx.disabled) { %}\n            <div class=\"col-md-2\">\n              <select class=\"file-type\" ref=\"fileType\">\n                {% ctx.component.fileTypes.map(function(type) { %}\n                  <option class=\"test\" value=\"{{ type.value }}\" {% if (type.label === file.fileType) { %}selected=\"selected\"{% } %}>{{ type.label }}</option>\n                {% }); %}\n              </select>\n            </div>\n          {% } %}\n          {% if (ctx.self.hasTypes && ctx.disabled) { %}\n          <div class=\"col-md-2\">{{file.fileType}}</div>\n          {% } %}\n        </div>\n      </li>\n    {% }) %}\n  </ul>\n{% } else { %}\n  <div>\n    {% ctx.files.forEach(function(file) { %}\n      <div>\n        <span>\n          <img ref=\"fileImage\" src=\"\" alt=\"{{file.originalName || file.name}}\" style=\"width:{{ctx.component.imageSize}}px\">\n          {% if (!ctx.disabled) { %}\n            <i class=\"{{ctx.iconClass('remove')}}\" ref=\"removeLink\"></i>\n          {% } %}\n        </span>\n      </div>\n    {% }) %}\n  </div>\n{% } %}\n{% if (!ctx.disabled && (ctx.component.multiple || !ctx.files.length)) { %}\n  {% if (ctx.self.useWebViewCamera) { %}\n    <div class=\"fileSelector\">\n      <button class=\"btn btn-primary\" ref=\"galleryButton\"><i class=\"fa fa-book\"></i> {{ctx.t('Gallery')}}</button>\n      <button class=\"btn btn-primary\" ref=\"cameraButton\"><i class=\"fa fa-camera\"></i> {{ctx.t('Camera')}}</button>\n    </div>\n  {% } else if (!ctx.self.cameraMode) { %}\n    <div class=\"fileSelector\" ref=\"fileDrop\">\n      <i class=\"{{ctx.iconClass('cloud-upload')}}\"></i> {{ctx.t('Drop files to attach,')}}\n        {% if (ctx.self.imageUpload) { %}\n          <a href=\"#\" ref=\"toggleCameraMode\"><i class=\"fa fa-camera\"></i> {{ctx.t('Use Camera,')}}</a>\n        {% } %}\n        {{ctx.t('or')}} <a href=\"#\" ref=\"fileBrowse\" class=\"browse\">{{ctx.t('browse')}}</a>\n    </div>\n  {% } else { %}\n    <div>\n      <video class=\"video\" autoplay=\"true\" ref=\"videoPlayer\"></video>\n    </div>\n    <button class=\"btn btn-primary\" ref=\"takePictureButton\"><i class=\"fa fa-camera\"></i> {{ctx.t('Take Picture')}}</button>\n    <button class=\"btn btn-primary\" ref=\"toggleCameraMode\">{{ctx.t('Switch to file upload')}}</button>\n  {% } %}\n{% } %}\n{% ctx.statuses.forEach(function(status) { %}\n  <div class=\"file {{ctx.statuses.status === 'error' ? ' has-error' : ''}}\">\n    <div class=\"row\">\n      <div class=\"fileName col-form-label col-sm-10\">{{status.originalName}} <i class=\"{{ctx.iconClass('remove')}}\" ref=\"fileStatusRemove\"></i></div>\n      <div class=\"fileSize col-form-label col-sm-2 text-right\">{{ctx.fileSize(status.size)}}</div>\n    </div>\n    <div class=\"row\">\n      <div class=\"col-sm-12\">\n        {% if (status.status === 'progress') { %}\n          <div class=\"progress\">\n            <div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"{{status.progress}}\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: {{status.progress}}%\">\n              <span class=\"sr-only\">{{status.progress}}% {{ctx.t('Complete')}}</span>\n            </div>\n          </div>\n        {% } else { %}\n          <div class=\"bg-{{status.status}}\">{{ctx.t(status.message)}}</div>\n        {% } %}\n      </div>\n    </div>\n  </div>\n{% }) %}\n{% if (!ctx.component.storage || ctx.support.hasWarning) { %}\n  <div class=\"alert alert-warning\">\n    {% if (!ctx.component.storage) { %}\n      <p>{{ctx.t('No storage has been set for this field. File uploads are disabled until storage is set up.')}}</p>\n    {% } %}\n    {% if (!ctx.support.filereader) { %}\n      <p>{{ctx.t('File API & FileReader API not supported.')}}</p>\n    {% } %}\n    {% if (!ctx.support.formdata) { %}\n      <p>{{ctx.t(\"XHR2's FormData is not supported.\")}}</p>\n    {% } %}\n    {% if (!ctx.support.progress) { %}\n      <p>{{ctx.t(\"XHR2's upload progress isn't supported.\")}}</p>\n    {% } %}\n  </div>\n{% } %}\n"; });