class BaseClass {
	constructor() {
		console.log("BaseClass")
	}
	
	GetQueryString(name){
		var url = window.location.search;
		return window.location.search.substring(url.lastIndexOf('=')+1, url.length);
	}
}

export default BaseClass;