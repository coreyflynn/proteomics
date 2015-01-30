// # **CellModel**

// A Backbone.Model that represents a cell line
// `pert_model = new CellModel()`
Barista.Models.CellModel = Backbone.Model.extend({
	// ### initialize
	// Overides the base Model's initialize method to set the model's cid to the cell_id of the perturbagen
	initialize: function(attributes, options) {
		this.cid = this.get('cell_id');
  }
});
