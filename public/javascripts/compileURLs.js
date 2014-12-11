function query() {

    var collection = document.getElementById("collection");
    var key  = document.getElementById("key");
    var value = document.getElementById("value");

    var URL = 'http://' + location.hostname + ':3000/search'
    URL += '?q={"' + key.value + '":';

    if (isNaN(value.value))
        URL += '"' + value.value + '"';
    else
	URL += value.value;

    URL += '}';
    window.location.replace(URL);
};

function distinct() {

    var distinctValue = document.getElementById('distinct');

    var URL =  'http://' + location.hostname + ':3000/search';
        URL += '?d=' + distinctValue.value;

    window.location.replace(URL);
};
