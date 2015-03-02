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
