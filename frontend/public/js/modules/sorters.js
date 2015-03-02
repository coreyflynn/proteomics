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
