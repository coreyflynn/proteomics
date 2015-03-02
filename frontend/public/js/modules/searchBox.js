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
