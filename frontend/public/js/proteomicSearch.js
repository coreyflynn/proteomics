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
// proteomicsURL = 'http://ec2-54-68-96-157.us-west-2.compute.amazonaws.com:3000/search?';
proteomicsURL = 'http://massive.broadinstitute.org:3000/search/';
newURL = 'http://massive.broadinstitute.org:3000/search/';


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
$('#evidenceContainer').css('opacity',0);
$('#pathTable').css('opacity',0);
$('#evidenceTableTSV').click(function(){exportTable(evidenceTable);});
$('#evidenceTableCSV').click(function(){exportTable(evidenceTable, 'csv');});
$('#evidenceTablePNG').click(function(){exportTable(evidenceTable, 'png');});

// try to make a call to the proteomics API and let the user know if it fails
(function(){$.ajax({
  dataType: 'jsonp',
  url: newURL + 'genes?',
  data: {q:'{"gene":"ACTB"}'},
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

  resizeTables();
  drawSequences();
}

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
      '': 'gene',
      Gene:'gene',
      Modification: 'modifications',
      Protein: 'protein names'
    }

    var URLMap = {
      '': 'genes',
      Gene:'genes',
      Modification: 'modifications',
      Protein: 'proteins'
    }

      params = {
        q: ['{"',fieldMap[e.type],'":{"$regex":"^',e.val,'"}}'].join('')
      }

      alert(newURL + URLMap[e.type] + " with params: " + [params])

      $.ajax({
        dataType: 'jsonp',
        url: newURL + 'genes',
        data: params,
        success: function (res) {

          $('#apiError').animate({'opacity':0},600);

          var elements  = [], seqCounts = [], mods = [];
          sequences = []; intenSums = [];evidenceData = [];

          alert(res);

          /*seqCounts = _.countBy(elements, function (element) {
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
          })*/

          //updateTables();

          if (evidenceData.length){
            $('#evidenceContainer').animate({opacity:1},600);
          }else{
            $('#evidenceContainer').animate({opacity:0},600);
          }
          },
        error: function (jqXHR, textStatus) {

          alert("FAIL");
          if (textStatus === 'error'){
            $('#apiError').animate({'opacity':1},600);
            $('#evidenceContainer').animate({opacity:0},600);
          }else{
            console.log(jqXHR);
          }
        }
      });

  }else{
    evidenceData = [];
    pathData = [];
    updateTables();
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
 * Utility function to resize the tables in the app depending on how much
 * data is in them
 */
function resizeTables() {

  var rows = (evidenceTable.getDataLength() > 19) ? 19 : evidenceTable.getDataLength() + 1;
  $(evidenceTable.getContainerNode()).css('height',rows*25 + 10);

  rows = (pathTable.getDataLength() > 19) ? 19 : pathTable.getDataLength() + 1;
  $(pathTable.getContainerNode()).animate({'height':rows*25 + 10}, 600);
}

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


/**********************************
 * Custom Datasets to back search *
 **********************************/

/**
 * Wrapper function to add custom datasets to Barista so our search
 * box can use them
 */
function addDataset(name, collection, type, color){
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
        collection: collection,
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
        return [newURL,
          'q={"',collection,'":{"$regex":"^',query,'", "$options":"i"}}'].join('')
      } ,

      dataType: 'jsonp',

      filter: filterFunction
    }
  }
  Barista.Datasets = _.extend(Barista.Datasets,baseObject);
}

function configureDatasets() {
  addDataset('ProteomicsGeneNames','gene','Gene','#00ccff');
  addDataset('ProteomicsProteinNames','proteinNames','Protein','#ff66cc');
  addDataset('ProteomicsModificationNames','modifications','Modification','#996600');

}
