// # **SummlyResultModel**

// A Backbone.Model that represents the a single CMap Summly result. A single
// result is composed of the connection between two pert_inames (a query and a target), 
// the component data that went into computing the summly result, and the statistics 
// of the summly computation

//		summly_result = new SummlyResultModel();
Barista.Models.SummlyResultModel = Backbone.Model.extend({
	// ### defaults
	// set up defaults for model values

	// 1.  {String}  **query**  the query perturbagen (pert_iname), defaults to *""*
	// 2.  {String}  **target**  the target perturbagen (pert_iname), defaults to *""*
	// 3.  {Number}  **summly_score**   summarized connectivity score across cell types, defaults to *-666*
	// 4.  {Number}  **summly_rank**  summarized percent rank across cell types, defaults to *-666*
	// 5.  {Number}  **specificity**  fraction of background queries that score/rank higher than the observed connection, defaults to *-666*
	// 6.  {Object}  **cell_line_scores**  the connectivity map scores in each cell line for the target perturbagen , defaults to *{}*
	defaults: {
		query: "",
		target: "",
		summly_score: -666,
		summly_rank: -666,
		specificity: -666,
		cell_line_scores: {}
	},

	// ### initialize
	// overides the base model's initialize method to set the model's cid to 
	// the summly_id
	initialize: function(attributes,options){
		this.cid = this.get('target');
		var pert_type = this.get('pert_type');
		switch(pert_type){
			case "trt_cp": this.set({pert_type_label: '<span class="label" style="background-color: #E69F00">SMC</span>'}); break;
			case "trt_oe": this.set({pert_type_label: '<span class="label" style="background-color: #D55E00">OE</span>'}); break;
			case "trt_sh": this.set({pert_type_label: '<span class="label" style="background-color: #56B4E9">KD</span>'}); break;
			default: this.set({pert_type_label: '<span class="label">' + pert_type + '</span>'});
		}
	}
});