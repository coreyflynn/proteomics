// # **PertCountModel**

// A Backbone.Model that represents the count of a set of perturbagens.  The data model
// captures both the total count of perturbagens that meet a search criteria and the count
// of each annotation category for the set of perturbagens.

// optional arguments:

// 1.  {string}  **type_string**  the string of pert_types that will be search upon fetching data, defaults to *'["trt_sh","trt_oe"]'*

// `count_model = new PertCountModel({type_string: '["trt_sh","trt_oe"]'})`

Barista.Models.PertCountModel = Backbone.Model.extend({
  // ### defaults
  // describes the model's default parameters

  // 1.  {String}  **type_string**  the string of pert_types that will be search upon fetching data, defaults to *'["trt_sh","trt_oe"]'*
  // 2.  {Number}  **pert\_count**  the number of perturbagens matching an api query, defaults to *0*
  // 3.  {Array}  **pert\_types**  an array of objects representing pert\_type categories to keep track of, defaults to *[{}}]*
  // 4.  {String}  **pert\_type\_field**  a field name over which to look for pert_types.  This runs an aggregated count over the specified field name in the Connectivity Map database, defaults to *'pert_icollection'*
  // 5.  {Date}  **last\_update**  a timestamp of the latest model update, defaults to the current time
  defaults: {
    "type_string": '["trt_cp"]',
    "count": 0,
    "pert_types": [{}],
    "pert_type_field": "pert_icollection",
    "last_update": (new Date()).getTime()
  },

  // ### fetch
  // fetches new data from the pert_info api.  the count and pert_types data
  // is replaced with new data coming from the api call
  fetch: function(search_string,search_type){
    // depending on the type of query we are making, set up the q param for the api call.
    // if we are doing a single query, match that query as a regular expression. If we are
    // doing a multi query, match exact names. If we are doing a cell line query, only match
    // cell\_ids
    var pert_info = Barista.APIURL + '/a2/pertinfo?callback=?';
    var params = {};
    if (search_type === "multi") {
      search_string = '["' + search_string.split(/[:, ]/).join('","') + '"]';
      params = {q:'{"pert_type":{"$in":' + this.get('type_string') + '},"pert_iname":{"$in":' + search_string + '}}',c:true};
    }
    if (search_type === "single" || search_type === undefined){
      params = {q:'{"pert_type":{"$in":' + this.get('type_string') + '},"pert_iname":{"$regex":"^' + search_string + '","$options":"i"}}',c:true};
    }
    if (search_type === "cell") {
      params = {q:'{"pert_type":{"$in":' + this.get('type_string') + '},"pert_iname":{"$regex":"","$options":"i"},"cell_id":"' + search_string + '"}', c:true};
    }

    // run the api request
    var self = this;
    var num_perts;
    $.getJSON(pert_info,params,function(perts) {
      if (perts === 0){
        num_perts = 0;
      }else{
        num_perts = perts.count;
      }
      var t = (new Date()).getTime();
      params = _.omit(params,'c');
      params = _.extend(params,{g:self.get('pert_type_field')});
      $.getJSON(pert_info, params, function(pert_types){
        self.set({count: num_perts, pert_types: pert_types, last_update: t});
      });
    });
  }
});
