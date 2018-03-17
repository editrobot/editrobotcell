import * as d3 from "d3";
import $ from "jquery";

class D3chart{
	constructor() {
		console.log(d3.version)
		// console.log(d3)
		console.log($(window).width())
		this.width = $("body").width()/2;
		this.height = this.width;
	}
}
export default D3chart;