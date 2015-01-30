// # **GenericJSONCollection**
// A Backbone.Collection that represents and arbitrary set of objects stored
// in a JSON file. The JSON file is assumed to contain a top level array
// containing objects.  Each object in the array is modeled as a base
// Backbone.Model inside of the collection

// optional arguments:

// 1.  {Backbone.Model}  **model**  the model used for the collection objects. defaults to *PertModel*
// 2.  {String}  **url**  the url from which model data is fetched. defaults  to *'data.json'*
// 3.  {String}  **skip**  the skip parameter used in method calls when the collection is updated. defaults to *0*
// 4.  {Boolean}  **isLoading**  indicates wether or not the collection is in the middle of a fetch operation. defaults to *false*

//		pert_collection = new PertCollection({model: PertModel,
//											url: Barista.APIURL + '/a2/pertinfo?callback=?',
//											skip: 0,
//											isLoading: false});
Barista.Collections.GenericJSONCollection = Backbone.Collection.extend({
	// ### model
	// the model used for collection objects
	model: Barista.Models.PertModel,

	// #### url
    // the url from which model data is fetched
    url: 'data.json',

    // #### skip
    // the skip parameter used in api calls when the collection is updated. 
    skip: 0,

    // #### isLoading
    // indicates wether or not the collection is in the middle of a fetch operation. 
    isLoading: false,

    // ### maxCount
    // the maximum size of the collection. defaults to Infinity
    maxCount: Infinity,

    // ## getData
    // `GenericJSONCollection.getData(search_string,search_type,limit)`

    // Gets additional data from the specified url and stores them as models in the collection

    // arguments
    // 
    // 1.  {string}  **search\_string**  the string on which a regex search into the api at the collections url will be performed, defaults to *""*
    // 2.  {string}  **search\_type**  the type of search that will be performed, defaults to *"single"*
    // 3.  {number}  **limit**  the number of models to be fetched, defaults to *30*
    getData: function(search_string,search_type,limit){
        var self = this;
        // set **isLoading** to true so we don't constantly make api calls before the data comes back
        this.isLoading = true;

        // store the value of **search\_string**, **search\_type**, and **limit** on the collection object
        this.search_string = (search_string !== undefined) ? search_string : '';
        this.search_type = (search_type !== undefined) ? search_type : '';
        this.limit = (limit !== undefined) ? limit : 30;

        // fetch data from the given url.  If the url attribute is a string, fetch data via an ajax
        // request. Read each returned item in the response into a new PertModel.  If it is an object, 
        // assume it is an array of data and read each array item into a new PertModel
        if (typeof(this.url) == 'object'){
            this.url.forEach(function(o){self.add(new Barista.Models.PertModel(o));});
            // set the collection's maxCount attribute to the length of the collection
            this.maxCount = this.models.length;
        }else{
            $.getJSON(this.url,function(res){
                res.forEach(function(o){
                    self.add(new PertModel(o));
                });
                // set the collection's maxCount attribute to the length of the collection
                this.maxCount = this.models.length;
            });
        }
	}
});