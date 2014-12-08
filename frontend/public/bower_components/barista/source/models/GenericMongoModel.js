// # **GenericMongoModel**

// A Backbone.Model that represents a generic MongoDB object.  All fields in the document
// are passed to the model as normal and a date attribute is set from the _id field of the mongo document
// `pert_model = new GenericMongoModel()`
Barista.Models.GenericMongoModel = Backbone.Model.extend({
    // ### initialize
    // Overides the base Model's initialize method to add the models date attribute and set the cid to the mongo _id field
    initialize: function(attributes, options) {
        this.cid = this.get('_id')
        this.set("date", new Date(parseInt(this.cid.substring(0,8), 16)*1000));
  }
});
