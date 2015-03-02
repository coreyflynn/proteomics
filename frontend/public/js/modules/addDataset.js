/**********************************
 * Custom Datasets to back search *
 **********************************/

/**
 * Wrapper function to add custom datasets to Barista so our search
 * box can use them
 */
function addDataset(name, field, type, color){
  var filterFunction = function(response){
    var datum_list = [];
    var auto_data = [];
    var object_map = {};

    response.forEach(function(element){
      auto_data.push(element);
      object_map[element] = element;
    });

    // make sure we only show unique items
    auto_data = _.uniq(auto_data);

    // build a list of datum objects
    auto_data.forEach(function(item){
      var datum = {
        value: item,
        tokens: [item],
        data: object_map[item]
      }
      _.extend(datum,{
        type: type,
        search_column: field,
        color: color,
      });
      datum_list.push(datum);
    });

    // return the processed list of datums for the autocomplete
    return datum_list;
  };

  baseObject = {}
  baseObject[name] = {
    // only return 4 items at a time in the autocomplete dropdown
    limit: 10,

    // provide a name for the default typeahead data source
    name: name,

    // the template to render for all results
    template: '<span class="label" style="background-color: {{ color }}">{{ type }}</span> {{ value }}',

    // use twitter's hogan.js to compile the template for the typeahead results
    engine: Hogan,

    remote: {
      url: '',

      replace: function(url, query){
        query = (query[0] === "*") ? query.replace("*",".*") : query;
        return [proteomicsURL,
          'q={"',field,'":{"$regex":"^',query,'", "$options":"i"}}',
          '&d=',field].join('')
      } ,

      dataType: 'jsonp',

      filter: filterFunction
    }
  }
  Barista.Datasets = _.extend(Barista.Datasets,baseObject);
}

module.exports = addDataset;
