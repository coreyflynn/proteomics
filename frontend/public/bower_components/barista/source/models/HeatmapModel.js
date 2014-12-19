// # **HeatmapModel**

// A Backbone.Model that represents the data in a heatmap.  The model contains
// a two dimensional array of numbers, row and columns labels, and a title.

// example usage:

// 			heatmap_model = new HeatmapModel();

// optional arguments

// 1.  {Array}  **data**  the data object to use in the heatmap. defualts to *[[1,2],[3,4]]*
// 2.  {Array}  **rid**  the row labels to use in the heatmap. defualts to *['1','2']*
// 3.  {Array}  **cid**  the column labels to use in the heatmap. defualts to *['1','2']*
// 4.  {Array}  **annots**  optional annotations categories to show under the heatmap. defualts to *undefined*
// 4.  {Array}  **annots_label**  optional label for annotations. defualts to *undefined*
// 5.  {String}  **title**  the title to use in the plot, defaults to *""*

//			heatmap_model = new HeatmapModel({data: [[1,2],[3,4]],
//											rid: ['1','2'],
//											cid: ['1','2'],
//											annots: ['1','2'],
//											title: ""});
Barista.Models.HeatmapModel = Backbone.Model.extend({
	// ### defaults
	// set up defaults for model values

	// 1.  {Array}  **data**  the data object to use in the heatmap. defualts to *[[1,2],[3,4]]*
	// 2.  {Array}  **rid**  the row labels to use in the heatmap. defualts to *['1','2']*
	// 3.  {Array}  **cid**  the column labels to use in the heatmap. defualts to *['1','2']*
	// 4.  {Array}  **annots**  optional annotations categories to show under the heatmap. defualts to *undefined*
	// 5.  {String}  **title**  the title to use in the plot, defaults to *""*
	defaults: {
		data: [[1,2],[3,4]],
		rid: ['1','2'],
		cid: ['1','2'],
		annots: undefined,
		title: "",
		last_update: (new Date()).getTime()
	}
})