// # **arrayAverage**

// a utility function to take the average of an array of numeric values

//		//evaluates to 2
//		var a = arrayAverage([1,2,3]);
Barista.arrayAverage = function arrayAverage (arr){
	return _.reduce(arr, function(memo, num){
		return memo + num;
	}, 0) / arr.length;
};