var evidenceData = [],
    pathData = [],
    datumLists = {},
    appEvents,
    handleSearch,
    handleSearchThrottled,
    handleSearchErrorMock,
    handleSearchSuccessMock,
    proteomicsURL,
    searchBox,
    searchString,
    evidenceTable,
    evidenceTableColumns,
    evidenceTableSorter,
    evidenceTableOptions,
    evidenceDataView,
    pathTable,
    pathTableColumns,
    pathTableSorter,
    pathTableOptions,
    pathDataView;

// Set up the default entry point for API calls
proteomicsURL = 'http://ec2-54-68-96-157.us-west-2.compute.amazonaws.com:3000/search?';


/*************************
 * Set up the search box *
 *************************/
configureDatasets();

/**
 * searchbox to handle all query inputs
 * @type {Barista.Views.PertSearchBar}
 */
searchBox = new Barista.Views.PertSearchBar({
  el: $('#searchBox'),
  placeholder: 'search by gene',
  datasets: [
    Barista.Datasets.ProteomicsGeneNames,
    Barista.Datasets.ProteomicsProteinNames,
    Barista.Datasets.ProteomicsModificationNames,
  ]
});


/**
 * bind the search input to the input handler and typeahead selection events
 * after giving the code a bit of time to update the DOM
 */

appEvents = _.extend({}, Backbone.Events);
appEvents.listenTo(searchBox,"search:DidType",function(e){
  handleSearchThrottled(e);
});

/*****************
 * table setup *
 *****************/
evidenceDataView = new Slick.Data.DataView({ inlineFilters: true });
pathDataView = new Slick.Data.DataView({ inlineFilters: true });

evidenceTableColumns = [
  { id: "sequence", name: "Sequence", field:"sequence",sortable: true},
  { id: "modifications", name: "Modifications", field:"modifications",sortable: true},
  { id: "count", name: "Count", field:"count",sortable: true},
  { id: "totInten", name: "Total Intensity", field:"totInten",sortable: true},
  { id: "avgInten", name: "Average Intensity", field:"avgInten",sortable: true},
];
pathTableColumns = [
  { id: "path", name: "File Path", field:"path",sortable: true},
];

evidenceTableOptions = {
  enableColumnReorder: false,
  multiColumnSort: true,
  forceFitColumns: true,
};
pathTableOptions = {
  enableColumnReorder: false,
  multiColumnSort: true,
  forceFitColumns: true,
};

evidenceTable = new Slick.Grid('#evidenceTable',
  evidenceDataView,
  evidenceTableColumns,
  evidenceTableOptions);
pathTable = new Slick.Grid('#pathTable',
  pathDataView,
  pathTableColumns,
  pathTableOptions);

evidenceTable.onSort.subscribe(function (e, args) {
    evidenceTableSorter(e,args);
  });
pathTable.onSort.subscribe(function (e, args) {
    pathTableSorter(e,args);
  });


/*************
 * App setup *
 *************/
$('#apiError').css('opacity',0);
$('#evidenceTable').css('opacity',0);
$('#pathTable').css('opacity',0);

// try to make a call to the proteomics API and let the user know if it fails
(function(){$.ajax({
  dataType: 'jsonp',
  url: proteomicsURL,
  data: {q:'{"gene names":"ACTB"}',d:'gene names'},
  error: function (jqXHR, textStatus) {
    if (textStatus === 'error'){
      $('#apiError').animate({'opacity':1},600);
    }else{
      console.log(jqXHR);
    }
  }
});})();

/*********************
 * Utility Functions *
 *********************/

/**
 * function used to sort the columns in the evidence table
 * @param {event} e    the event passed to the sorter
 * @param {opbject} args the arguments passed to the sorter from slickgrid
 */
evidenceTableSorter = function evidenceTableSorter (e, args){
  var cols = args.sortCols;
  evidenceData.sort(function (dataRow1, dataRow2) {
    for (var i = 0, l = cols.length; i < l; i++) {
      var field = cols[i].sortCol.field;
      var sign = cols[i].sortAsc ? 1 : -1;
      var value1 = dataRow1[field], value2 = dataRow2[field];
      var result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
      if (result != 0) {
        return result;
      }
    }
    return 0;
  });
  updateTables();
}

/**
 * function used to sort the columns in the path table
 * @param {event} e    the event passed to the sorter
 * @param {opbject} args the arguments passed to the sorter from slickgrid
 */
pathTableSorter = function pathTableSorter (e, args){
  var cols = args.sortCols;
  pathData.sort(function (dataRow1, dataRow2) {
    for (var i = 0, l = cols.length; i < l; i++) {
      var field = cols[i].sortCol.field;
      var sign = cols[i].sortAsc ? 1 : -1;
      var value1 = dataRow1[field], value2 = dataRow2[field];
      var result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
      if (result != 0) {
        return result;
      }
    }
    return 0;
  });
  updateTables();
}

/**
 * Wrapper function around data view updates
 */
updateTables = function updateTables () {


  evidenceDataView.beginUpdate();
  evidenceDataView.setItems(evidenceData);
  evidenceDataView.endUpdate();
  evidenceTable.invalidate();
  evidenceTable.render();

  pathDataView.beginUpdate();
  pathDataView.setItems(pathData);
  pathDataView.endUpdate();
  pathTable.invalidate();
  pathTable.render();
}

/**
 * Utility to handle search strings input into the search box
 * @param {string} e the string that should be searched
 */
handleSearch = function handleSearch (e) {

  if (e.val.length){
    var fieldMap = {
      '': 'gene names',
      Gene:'gene names',
      Modification: 'modifications',
      Protein: 'protein names'
    }

      params = {
        q: ['{"',fieldMap[e.type],'":{"$regex":"^',e.val,'"}}'].join(''),
        f: '{"sequence":1,"intensity":1,"modifications":1}',
        col: '["evidence"]'
      }

      $.ajax({
        dataType: 'jsonp',
        url: proteomicsURL,
        data: params,
        success: function (res) {
          $('#apiError').animate({'opacity':0},600);
          var elements = [],
              seqCounts = [];
          intenSums     = [];
          mods          = [];
          evidenceData  = [];

          _.keys(res).forEach(function(key,i){
            res[key].forEach(function(element,j){
              elements.push(element);
            });
          })

          seqCounts = _.countBy(elements, function (element) {
            return element.sequence;
          });

          // Intensity sum array creation
          intenSums = _.groupBy(elements, function (element) {
            return element.sequence;
          });
          alert("Stage 1: " + JSON.stringify(intenSums));

          _.keys(intenSums).forEach(function(sequence){
            mods[sequence] = _.reduce(intenSums[sequence], function(memo, obj){
              if (obj.modifications)
                return memo.push(obj.modifications);
              else
                return memo;
            }, []];
          });

          alert("Stage 2: " + JSON.stringify(mods));

          _.keys(intenSums).forEach(function(sequence){
            intenSums[sequence] = _.reduce(intenSums[sequence], function(memo, obj){
              if (obj.intensity)
                return memo + obj.intensity;
              else
                return memo + 0;
            }, 0);
          });

          alert("Stage 3: " + JSON.stringify(intenSums));

          _.keys(seqCounts).forEach(function(seq,i){
            var avg = (intenSums[seq]/seqCounts[seq]);
            evidenceData.push({id:i,sequence:seq,count:seqCounts[seq],totInten:intenSums[seq],avgInten:avg});
          })

          updateTables();

          if (evidenceData.length){
            $('#evidenceTable').animate({opacity:1},600);
          }else{
            $('#evidenceTable').animate({opacity:0},600);
          }
          },
        error: function (jqXHR, textStatus) {
          if (textStatus === 'error'){
            $('#apiError').animate({'opacity':1},600);
            $('#evidenceTable').animate({opacity:0},600);
          }else{
            console.log(jqXHR);
          }
        }
      });


    params = {
      q: ['{"',fieldMap[e.type],'":{"$regex":"^',e.val,'"}}'].join('')
    }

    $.ajax({
      dataType: 'jsonp',
      url: proteomicsURL.slice(0,-1) + '/experiments?',
      data: params,
      success: function (res) {
        $('#apiError').animate({'opacity':0},600);
        pathData = [];
        res.forEach(function(element,j){
          pathData.push(_.extend(element,{id:element._id}));
        });
        updateTables();
        if (pathData.length) {
          $('#pathTable').animate({opacity:1},600);
        }else{
          $('#pathTable').animate({opacity:0},600);
        }
      },
      error: function (jqXHR, textStatus) {
        if (textStatus === 'error'){
          $('#apiError').animate({'opacity':1},600);
          $('#pathTable').animate({opacity:0},600);
        }else{
          console.log(jqXHR);
        }
      }
    });

  }else{
    evidenceData = [];
    pathData = [];
    updateTables();
    $('#evidenceTable').animate({opacity:0},600);
    $('#pathTable').animate({opacity:0},600);
  }
}

handleSearchThrottled = _.throttle(handleSearch,1000,{leading:false});


/**
 * Utility function to mock the results of a query typed into the search searchbox
 * @param {search} searchString the string that should be mocked
 */
handleSearchMock = function handleSearchMock (searchString) {
  var results = [],
      _i;

  if (searchString){
    for (_i = 0; _i < 1000; _i++){
      results.push({id: 'MockData' + Math.round(Math.random() * 1000000000), value: Math.random()});
    }
    $('#evidenceTable').animate({opacity:1},600);
    data = results;
    updateTables();
  }else{
    $('#evidenceTable').animate({opacity:0},600);
    setTimeout( function () {
      data = results;
      updateTables();
    },600);
  }
};


/**
 * Utility function to resize the tables in the app depending on how much
 * data is in them
 */
function resizeTables() {
  var rows = (tables[level].getDataLength() > 19) ? 19 : tables[level].getDataLength() + 1;
  $('#' + level).css('height',rows*25 + 10);
}


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
    limit: 3,

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
  console.log(baseObject)
  Barista.Datasets = _.extend(Barista.Datasets,baseObject);
}

function configureDatasets() {
  addDataset('ProteomicsGeneNames','gene names','Gene','#00ccff');
  addDataset('ProteomicsProteinNames','protein names','Protein','#ff66cc');
  addDataset('ProteomicsModificationNames','modifications','Modification','#996600');

}
