var data = [],
    dataView,
    handleSearch,
    handleSearchMock,
    searchBox,
    searchString,
    table,
    tableColumns,
    tableSorter,
    tableOptions;

/*************************
 * Set up the search box *
 *************************/

/**
 * searchbox to handle all query inputs
 * @type {Barista.Views.PertSearchBar}
 */
searchBox = new Barista.Views.PertSearchBar({
  el: $('#searchBox'),
  placeholder: 'search by gene',
  datasets: [Barista.Datasets.GeneticPertIName],
  match_cell_lines: false
});


/**
 * bind the search input to the input handler and typeahead selection events
 * after giving the code a bit of time to update the DOM
 */
setTimeout(function(){
  $('input.typeahead').on('keypress',function(e){
    if(e.which == 13) {
      handleSearchMock(searchBox.get_val());
    }
  });

  $('body').on('typeahead:selected',function(e,suggestion,dataset){
    handleSearchMock(suggestion.value);
  })
},100);

/*****************
 * table setup *
 *****************/
dataView = new Slick.Data.DataView({ inlineFilters: true });

tableColumns = [
  { id: "ID", name: "ID", field:"id",sortable: true},
  { id: "value", name: "Value", field:"value",sortable: true},
];

tableOptions = {
  enableColumnReorder: false,
  multiColumnSort: true,
  forceFitColumns: true,
};

table = new Slick.Grid('#resultTable', dataView, tableColumns, tableOptions);

table.onSort.subscribe(function (e, args) {
    tableSorter(e,args);
  });


/*************
 * App setup *
 *************/
$('#resultTable').css('opacity',0);


/*********************
 * Utility Functions *
 *********************/

/**
 * function used to sort the columns in a table
 * @param {event} e    the event passed to the sorter
 * @param {opbject} args the arguments passed to the sorter from slickgrid
 */
tableSorter = function tableSorter (e, args){
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
  updateTable();
}


/**
 * Wrapper function around data view updates
 */
updateTable = function updateTable () {
  dataView.beginUpdate();
  dataView.setItems(data);
  dataView.endUpdate();
  table.invalidate();
  table.render();
}

/**
 * Utility to parse the input into the search box only when the user
 * hits the enter key
 * @param {string} e the string that should be searched
 */
handleSearch = function handleSearch (searchString) {
  searchURL = 'http://ec2-54-68-48-33.us-west-2.compute.amazonaws.com:3000/search/bygene?';
  params = {g:searchString};
  $.getJSON(searchURL,params,function(res){
    console.log(res);
  })
}

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
    $('#resultTable').animate({opacity:1},600);
    data = results;
    updateTable();
  }else{
    $('#resultTable').animate({opacity:0},600);
    setTimeout( function () {
      data = results;
      updateTable();
    });
  }
}
