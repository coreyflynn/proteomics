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
