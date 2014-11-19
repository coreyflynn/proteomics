function query() {

   var collection = document.getElementById("collection");
   var key  = document.getElementById("key");
   var value = document.getElementById("value");


    var URL = 'localhost:3000/search/' + collection.options[elt.selectedIndex].text;
    URL += '?q={"' + key.text + '":';
    try{
        parseFloat(value.text);
        URL += value.text;
    }catch(err){
	URL += '"' + value.text + '"';
    }
    URL += '}';

    window.location = URL;
}
