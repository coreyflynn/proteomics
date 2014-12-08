/*************************
 * Set up the search box *
 *************************/

/**
 * searchbox to handle all query inputs
 * @type {Barista.Views.PertSearchBar}
 */
var searchBox = new Barista.Views.PertSearchBar({
  el: $('#searchBox'),
  datasets: [Barista.Datasets.GeneticPertIName],
  match_cell_lines: false
});

/**
 * utility to parse the input into the search box only when the user
 * hits the enter key
 * @param {event} e the jquery click event to work with
 */
function handleSearch (searchString) {
  searchURL = 'http://ec2-54-68-48-33.us-west-2.compute.amazonaws.com:3000/search/bygene?';
  params = {g:searchString};
  $.getJSON(searchURL,params,function(res){
    console.log(res);
  })
}

// bind the search input to the input handler after giving the code a bit of
// time to update the DOM
setTimeout(function(){
  $('input.typeahead').on('keypress',function(e){
    if(e.which == 13) {
      handleSearch(searchBox.get_val());
    }
  });

  $('body').on('typeahead:selected',function(e,suggestion,dataset){
    handleSearch(suggestion.value);
  })
},100);
