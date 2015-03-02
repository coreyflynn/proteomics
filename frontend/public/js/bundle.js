(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./public/js/app.js":[function(require,module,exports){
require('./modules/var');
var searchBox = require('./modules/searchBox');
var table = require('./modules/table');

// Set up the default entry point for API calls
proteomicsURL = 'http://localhost:3000/search?';
// proteomicsURL = 'http://massive.broadinstitute.org:3000/search?';

// build the search box and autocomplete
searchBox.build();

// build the tables
pathTable = table.buildTable('#pathTable',
  [
    { id: "path", name: "File Path", field:"path",sortable: true}
  ]
);

evidenceTable = table.buildTable('#evidenceTable',
  [
    { id: "sequence", name: "Sequence", field:"sequence",sortable: true},
    { id: "modifications", name: "Modifications", field:"modifications",sortable: true},
    { id: "count", name: "Count", field:"count",sortable: true},
    { id: "totInten", name: "Total Intensity", field:"totInten",sortable: true},
    { id: "avgInten", name: "Average Intensity", field:"avgInten",sortable: true},
  ]
);


/*****************
 * table setup *
 *****************/
// evidenceDataView = new Slick.Data.DataView({ inlineFilters: true });
// pathDataView = new Slick.Data.DataView({ inlineFilters: true });
//
// evidenceTableColumns = [
//   { id: "sequence", name: "Sequence", field:"sequence",sortable: true},
//   { id: "modifications", name: "Modifications", field:"modifications",sortable: true},
//   { id: "count", name: "Count", field:"count",sortable: true},
//   { id: "totInten", name: "Total Intensity", field:"totInten",sortable: true},
//   { id: "avgInten", name: "Average Intensity", field:"avgInten",sortable: true},
// ];
// pathTableColumns = [
//   { id: "path", name: "File Path", field:"path",sortable: true},
// ];
//
// evidenceTableOptions = {
//   enableColumnReorder: false,
//   multiColumnSort: true,
//   forceFitColumns: true,
// };
// pathTableOptions = {
//   enableColumnReorder: false,
//   multiColumnSort: true,
//   forceFitColumns: true,
// };
//
// evidenceTable = new Slick.Grid('#evidenceTable',
//   evidenceDataView,
//   evidenceTableColumns,
//   evidenceTableOptions);
// pathTable = new Slick.Grid('#pathTable',
//   pathDataView,
//   pathTableColumns,
//   pathTableOptions);
//
// evidenceTable.onSort.subscribe(function (e, args) {
//     evidenceTableSorter(e,args);
//   });
// pathTable.onSort.subscribe(function (e, args) {
//     pathTableSorter(e,args);
//   });


/*************
 * App setup *
 *************/
$('#apiError').css('opacity',0);
$('#evidenceContainer').css('opacity',0);
$('#pathTable').css('opacity',0);
$('#evidenceTableTSV').click(function(){exportTable(evidenceTable);});
$('#evidenceTableCSV').click(function(){exportTable(evidenceTable, 'csv');});
$('#evidenceTablePNG').click(function(){exportTable(evidenceTable, 'png');});

// try to make a call to the proteomics API and let the user know if it fails
$.ajax({
  dataType: 'jsonp',
  url: proteomicsURL,
  data: {q:'{}',l:1},
  error: function (jqXHR, textStatus) {
    if (textStatus === 'error'){
      $('#apiError').animate({'opacity':1},600);
    }else{
      console.log(jqXHR);
    }
  }
});



/*********************
 * Utility Functions *
 *********************/

/**
 * Utility to handle search strings input into the search box
 * @param {string} e the string that should be searched
 */
handleSearch = function handleSearch (e) {
  var parenChars = ['(',')'];
  parenChars.forEach(function(char) {
    e.val = e.val.split(char).join('\\\\' + char);
  });

  if (e.val.length){
    var fieldMap = {
      '': 'gene names',
      Gene:'gene names',
      Modification: 'modifications',
      Protein: 'protein names'
    }

      params = {
        q: ['{"',fieldMap[e.type],'":{"$regex":"^',e.val,'", "$options":"i"}}'].join(''),
        f: '{"modified sequence":1,"intensity":1,"modifications":1}',
        col: '["evidence"]',
        l: 1000
      }

      $.ajax({
        dataType: 'jsonp',
        url: [proteomicsURL],
        data: params,
        success: function (res) {
          $('#apiError').animate({'opacity':0},600);

          var elements  = [], seqCounts = [], mods = [],
              sequences = [], intenSums = [], evidenceData = [];

          _.keys(res).forEach(function(key,i){
            res[key].forEach(function(element,j){
              elements.push(element);
            });
          })

          seqCounts = _.countBy(elements, function (element) {
            return element['modified sequence'];
          });

          // Populate array grouped on sequence
          // "ABCDEFG":[{id:123, sequence:"ABCDEFG", intensity:456}
          //            {id:234, sequence:"ABCDEFG", intensity:567}]
          sequences = _.groupBy(elements, function (element) {
            return element['modified sequence'];
          });

          // Populate intensity sum and modification arrays
          _.keys(sequences).forEach(function(sequence){

            // Modification
            mods[sequence] = [];
            for (obj in sequences[sequence]){
              if (sequences[sequence][obj].modifications){
                mods[sequence].push(sequences[sequence][obj].modifications);
              }
            }
            mods[sequence] = _.uniq(mods[sequence]);

            // Intensity
            intenSums[sequence] = _.reduce(sequences[sequence], function(memo, obj){
              if (obj.intensity)
                return memo + obj.intensity;
              else
                return memo + 0;
            }, 0);

          })

          _.keys(seqCounts).forEach(function(seq,i){
            var avg = (intenSums[seq]/seqCounts[seq]);
            evidenceData.push({id:i,sequence:seq,modifications:mods[seq],count:seqCounts[seq],totInten:intenSums[seq],avgInten:avg});
          })

          table.updateTable(evidenceTable,evidenceData);
          table.resizeTable(evidenceTable);

          if (evidenceTable.data.length){
            $('#evidenceContainer').animate({opacity:1},600);
          }else{
            $('#evidenceContainer').animate({opacity:0},600);
          }
          },
        error: function (jqXHR, textStatus) {
          if (textStatus === 'error'){
            $('#apiError').animate({'opacity':1},600);
            $('#evidenceContainer').animate({opacity:0},600);
          }else{
            console.log(jqXHR);
          }
        }
      });


    params = {
      q: ['{"',fieldMap[e.type],'":{"$regex":"^',e.val,'", "$options":"i"}}'].join(''),
      l: 1000
    }

    $.ajax({
      dataType: 'jsonp',
      url: proteomicsURL.slice(0,-1) + '/experiments?',
      data: params,
      success: function (res) {
        var pathData = [];

        $('#apiError').animate({'opacity':0},600);

        res.forEach(function(element,j){
          pathData.push(_.extend(element,{id:element._id}));
        });

        table.updateTable(pathTable, pathData);
        table.resizeTable(pathTable);

        if (pathTable.data.length) {
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
    table.updateTable(evidenceTable, []);
    table.updateTable(pathTable, []);
    $('#evidenceContainer').animate({opacity:0},600);
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
    $('#evidenceContainer').animate({opacity:1},600);
    data = results;
    updateTables();
  }else{
    $('#evidenceContainer').animate({opacity:0},600);
    setTimeout( function () {
      data = results;
      updateTables();
    },600);
  }
};


/**
 * Utility to draw sequence diagrams based on the sequences observed
 */
function drawSequences() {
  var $container = $('#sequenceViews'),
      $sequenceViews = $container.children();
      sequences = _.pluck(evidenceTable.getData().getItems(),'sequence');

  $sequenceViews.each(function() {
    $(this).finish();
    $(this).animate({'opacity':0}, 600);
    setTimeout(function(){
      $container.empty();
    },600);
  });

  setTimeout(function(){
    sequenceViews = [];
    sequenceModels = [];
    $container.finish();
    $container.css('opacity',0);

    sequences.forEach(function(sequence,i) {
      var id = 'sequence' + i;
      $container.append('<div id="' + id + '" class="col-xs-4"></div>');
      sequenceModels.push(new Barista.Models.SequenceModel());
      sequenceViews.push(new Barista.Views.SequenceView({el:$('#' + id), model: sequenceModels[i], png: false}));
      sequenceViews[i].model.set({sequence:sequence});
    });
    $container.animate({'opacity':1},600);
  }, 600);

}

/**
 * Utility to export the content of a dataView to a tab separated value table
 * @param {SlickGrid table} table the table to export
 * @param {string} the method to export the table. Valid options are 'tsv' and 'csv'. Defaults to 'tsv'
 */
function exportTable(table,method) {
  var exportString,
      blob,
      timestamp,
      joiner,
      lines = [],
      timestamp = new Date().getTime(),
      data = table.getData().getItems(),
      dataLength = data.length,
      headers = _.pluck(table.getColumns(),'field');

  // make sure we have a method set up
  method = (method === undefined) ? 'tsv' : method;

  // if the method is png, download the table as a png image,
  // otherwise download it as a text file
  if (method === 'png') {
    html2canvas(table.getContainerNode(), {
      onrendered: function(canvas) {
        var ctx = canvas.getContext("2d");
        // ctx.scale(10,10);
        canvas.toBlob(function(blob) {
            saveAs(blob, "ProteomicsCrawler" + timestamp + ".png");
        });
      }
    });

  } else {
    switch (method) {
      case 'tsv':
        joiner = '\t';
        loaderID = '#evidenceTSVLoader';
        break;
      case 'csv':
        joiner = ',';
        break;
      default:
        joiner = '\t';
        break;
    }

    // build the first line from the headers of the table
    lines.push(headers.join(joiner));

    // continue building lines from each row in the table
    data.forEach(function(datum,i) {
      var cells = [];
      headers.forEach(function(header) {
        cells.push(datum[header]);
      });
      lines.push(cells.join(joiner));
    });

    // Build the full export string and save it as a blob
    exportString = lines.join("\n");
    blob = new Blob([exportString], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "ProteomicsCrawler" + timestamp + "." + method);
  }

}

},{"./modules/searchBox":"/Users/cflynn/Code/proteomics/frontend/public/js/modules/searchBox.js","./modules/table":"/Users/cflynn/Code/proteomics/frontend/public/js/modules/table.js","./modules/var":"/Users/cflynn/Code/proteomics/frontend/public/js/modules/var.js"}],"/Users/cflynn/Code/proteomics/frontend/public/js/modules/addDataset.js":[function(require,module,exports){
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

},{}],"/Users/cflynn/Code/proteomics/frontend/public/js/modules/searchBox.js":[function(require,module,exports){
var addDataset = require('./addDataset');

/*************************
 * Set up the search box *
 *************************/
function build() {
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
}


function configureDatasets() {
  addDataset('ProteomicsGeneNames','gene names','Gene','#00ccff');
  addDataset('ProteomicsProteinNames','protein names','Protein','#ff66cc');
  addDataset('ProteomicsModificationNames','modifications','Modification','#996600');
}

module.exports = {build:build};

},{"./addDataset":"/Users/cflynn/Code/proteomics/frontend/public/js/modules/addDataset.js"}],"/Users/cflynn/Code/proteomics/frontend/public/js/modules/sorters.js":[function(require,module,exports){
/**
 * function used to sort the columns in the evidence table
 * @param {event} e    the event passed to the sorter
 * @param {object} args the arguments passed to the sorter from slickgrid
 */
function defaultSorter (e, args,data) {
  var cols = args.sortCols;
  data.sort(function (dataRow1, dataRow2) {
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
}

module.exports = {
  default: defaultSorter
}

},{}],"/Users/cflynn/Code/proteomics/frontend/public/js/modules/table.js":[function(require,module,exports){
var sorters = require('./sorters');

/*****************
 * Table methods *
 *****************/
/**
 * Construct a new table
 * @param {string} DOMtarget The selector to use in targeting the table to the
 *
 * @param {array} columns   an array of objects describing the table columns
 * @param {object} options   an object of slick grid configuration parameters
 * @return {object} an object containing the build table and configuration
 */
function buildTable(DOMtarget,columns,options){
  var tableObject = {};

  // dataView setup
  dataView = new Slick.Data.DataView({ inlineFilters: true });
  tableObject.dataView = dataView;

  // default columns
  if (columns === undefined) {
    columns = [
      { id: "id", name: "ID", field:"id",sortable: true}
    ]
  }
  tableObject.columns = columns;

  // default options
  if (options === undefined) {
    options = {
      enableColumnReorder: false,
      multiColumnSort: true,
      forceFitColumns: true,
    }
  }
  tableObject.options = options;

  // build the table
  tableObject.table = new Slick.Grid(DOMtarget,
    dataView,
    columns,
    options);

  // default the data in the table to an empty array
  tableObject.data = [];

  // set up table updates
  tableObject.update = function(data) {
    updateTable(this,data);
  }

  // set up table sorting
  tableObject.table.onSort.subscribe(function (e, args) {
    sorters.default(e,args,tableObject.data);
    tableObject.update();
  });

  return tableObject;
}

/**
 * updates a table with new data
 * @param {slick grid table} table the table to update
 * @param {array} data  an array of data objects to use as the new data
 * @return {slick grid table} the updated table
 */
function updateTable(table,data) {
  if (data) {
    table.data = data;
  }
  table.dataView.beginUpdate();
  table.dataView.setItems(table.data);
  table.dataView.endUpdate();
  table.table.invalidate();
  table.table.render();

  return table;
}

/**
 * resizes a table based on the data in the table
 * @param {slick grid table} table the table to resize
 */
function resizeTable(table) {
  var rows = (table.table.getDataLength() > 19) ? 19 : table.table.getDataLength() + 1;
  $(table.table.getContainerNode()).css('height',rows*25 + 10);
}

module.exports = {
  buildTable: buildTable,
  updateTable: updateTable,
  resizeTable: resizeTable
}

},{"./sorters":"/Users/cflynn/Code/proteomics/frontend/public/js/modules/sorters.js"}],"/Users/cflynn/Code/proteomics/frontend/public/js/modules/var.js":[function(require,module,exports){
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

},{}]},{},["./public/js/app.js"]);

//# sourceMappingURL=bundle.js.map