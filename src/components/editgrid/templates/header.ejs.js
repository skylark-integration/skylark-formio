define([],function() {
return `<div class="row">
  {% ctx.util.eachComponent(ctx.components, function(component) { %}
    {% if (!component.hasOwnProperty('tableView') || component.tableView) { %}
      <div class="col-sm-2">{{ component.label }}</div>
    {% } %}
  {% }) %}
</div>` ;
});
