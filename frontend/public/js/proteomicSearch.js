var evidenceData = [],
    evidenceDataView,
    datumLists = {},
    handleSearch,
    handleSearchErrorMock,
    handleSearchSuccessMock,
    proteomicsURL,
    searchBox,
    searchString,
    evidenceTable,
    evidenceTtableColumns,
    evidenceTtableSorter,
    evidenceTtableOptions;

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
    // Barista.Datasets.ProteomicsProteinNames,
    // Barista.Datasets.ProteomicsModificationNames,
  ]
});


/**
 * bind the search input to the input handler and typeahead selection events
 * after giving the code a bit of time to update the DOM
 */
setTimeout(function(){
  $('input.typeahead').on('keypress',function(e){
    if(e.keyCode == 13) {
      console.log('fdsa')
      handleSearch(searchBox.get_val());
    }
  });

  $('body').on('typeahead:selected',function(e,suggestion,dataset){
    handleSearch(suggestion.value);
  })
},100);

/*****************
 * table setup *
 *****************/
evidenceDataView = new Slick.Data.DataView({ inlineFilters: true });

evidenceTableColumns = [
  { id: "sequence", name: "Sequence", field:"sequence",sortable: true},
];

evidenceTableOptions = {
  enableColumnReorder: false,
  multiColumnSort: true,
  forceFitColumns: true,
};

evidenceTable = new Slick.Grid('#evidenceTable',
  evidenceDataView,
  evidenceTableColumns,
  evidenceTableOptions);

evidenceTable.onSort.subscribe(function (e, args) {
    evidenceTableSorter(e,args);
  });


/*************
 * App setup *
 *************/
$('#apiError').css('opacity',0);
$('#evidenceTable').css('opacity',0);

// try to make a call to the proteomics API and let the user know if it fails
$.ajax({
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
});

/*********************
 * Utility Functions *
 *********************/

/**
 * function used to sort the columns in a table
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
  updateTable();
}


/**
 * Wrapper function around data view updates
 */
updateTable = function updateTable () {

  evidenceDataView.beginUpdate();
  evidenceDataView.setItems(evidenceData);
  evidenceDataView.endUpdate();
  evidenceTable.invalidate();
  evidenceTable.render();
}

/**
 * Utility to handle search strings input into the search box
 * @param {string} e the string that should be searched
 */
handleSearch = function handleSearch (searchString) {
  params = {
    q: ['{"','gene names','":{"$regex":"^',searchString,'"}}'].join(''),
    d: 'sequence',
    col: '["evidence"]'
  }

  $.ajax({
    dataType: 'jsonp',
    url: proteomicsURL,
    data: params,
    success: function (res) {
      $('#apiError').animate({'opacity':0},600);
      evidenceData = [];
      console.log(res);
      res.forEach(function(element,i){
        evidenceData.push({id:i, sequence:element});
      })
      updateTable();
      $('#evidenceTable').animate({opacity:1},600);
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
    $('#evidenceTable').animate({opacity:1},600);
    data = results;
    updateTable();
  }else{
    $('#evidenceTable').animate({opacity:0},600);
    setTimeout( function () {
      data = results;
      updateTable();
    },600);
  }
};


/**********************************
 * Custom Datasets to back search *
 **********************************/

/**
 * Wrapper function to add custom datasets to Barista so our search
 * box can use them
 */


function configureDatasets() {
  // addDataset('ProteomicsGeneNames','gene names','Gene','#00ccff');
  // addDataset('ProteomicsProteinNames','proteins','Protein','#ff66cc');
  // addDataset('ProteomicsModificationNames','modifications','Modification','#996600');

  Barista.Datasets = _.extend(Barista.Datasets,
    {ProteomicsGeneNames:
      {
    		// only return 4 items at a time in the autocomplete dropdown
    		limit: 4,

    		// provide a name for the default typeahead data source
    		name: 'ProteomicsGeneNames',

    		// the template to render for all results
    		template: '<span class="label" style="background-color: {{ color }}">{{ type }}</span> {{ value }}',

    		// use twitter's hogan.js to compile the template for the typeahead results
    		engine: Hogan,

    		remote: {
    			url: '',

    			replace: function(url, query){
    				query = (query[0] === "*") ? query.replace("*",".*") : query;
    				return [proteomicsURL,
    					'q={"','gene names','":{"$regex":"^',query,'", "$options":"i"}}',
    					'&d=','gene names'].join('')
    			} ,

    			dataType: 'jsonp',

          ajax: {cache: false},

    			filter: function(response){
            var datum_list = [];
            var auto_data = [];
            var object_map = {};

            // for each item, pull out its cell_id and use that for the
            // autocomplete value. Build a datum of other relevant data
            // for use in suggestion displays
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
                type: 'Gene',
                search_column: 'gene names',
                color: '#00ccff',
              });
              datum_list.push(datum);
            });

            // return the processed list of datums for the autocomplete
            return datum_list;
          }
    		}
    	}
    }
  );

  Barista.Datasets = _.extend(Barista.Datasets,
    {ProteomicsModificationNames:
      {
        // only return 4 items at a time in the autocomplete dropdown
        limit: 4,

        // provide a name for the default typeahead data source
        name: 'ProteomicsModificationNames',

        // the template to render for all results
        template: '<span class="label" style="background-color: {{ color }}">{{ type }}</span> {{ value }}',

        // use twitter's hogan.js to compile the template for the typeahead results
        engine: Hogan,

        remote: {
          url: '',

          replace: function(url, query){
            query = (query[0] === "*") ? query.replace("*",".*") : query;
            return [proteomicsURL,
              'q={"','modifications','":{"$regex":"^',query,'", "$options":"i"}}',
              '&d=','modifications'].join('')
          } ,

          dataType: 'jsonp',

          filter: function(response){
            datumLists.Modifications = [];
            var auto_data = [];
            var object_map = {};

            // for each item, pull out its cell_id and use that for the
            // autocomplete value. Build a datum of other relevant data
            // for use in suggestion displays
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
                type: 'Modification',
                search_column: 'modifications',
                color: '#996600',
              });
              datumLists.Modifications.push(datum);
            });

            // return the processed list of datums for the autocomplete
            return datumLists.Modifications;
          }
        }
      }
    }
  );
}
