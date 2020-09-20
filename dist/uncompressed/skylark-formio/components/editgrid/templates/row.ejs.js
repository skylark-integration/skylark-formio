define([],function() {
return   `<div class="row">
  {% ctx.util.eachComponent(ctx.components, function(component) { %}
    {% if (!component.hasOwnProperty('tableView') || component.tableView) { %}
      <div class="col-sm-2">
        {{ ctx.getView(component, ctx.row[component.key]) }}
      </div>
    {% } %}
  {% }) %}
  {% if (!ctx.self.options.readOnly) { %}
    <div class="col-sm-2">
      <div class="btn-group pull-right">
        <button class="btn btn-default btn-light btn-sm editRow"><i class="{{ ctx.iconClass('edit') }}"></i></button>
        <button class="btn btn-danger btn-sm removeRow"><i class="{{ ctx.iconClass('trash') }}"></i></button>
      </div>
    </div>
  {% } %}
</div>` ;
});
