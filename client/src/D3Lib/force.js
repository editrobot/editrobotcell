import * as d3 from "d3";
import $ from "jquery";
import D3chart from './D3chart.js';

class force extends D3chart {
	constructor(id) {
		super();
		this.id = id;
		this.width = $(this.id).width();
		this.height = this.width;
		this.setTotals(0)
	}
	
	remove(){
		d3.select(this.id).selectAll("svg").remove();
	}
	
	setTotals(Totals){
		var nodes = [
			{ name: "m" },
			{ name: "c1" },
			{ name: "c2" },
			{ name: "c3" }
		];

		var edges = [
			{ source : 0  , target: 1 },
			{ source : 0  , target: 2 },
			{ source : 0  , target: 3 }
		];
		while(Totals !== 0){
			--Totals;
			nodes.push({ name: ""+Totals });
			edges.push({ source : 1  , target: (nodes.length-1) });
			edges.push({ source : 2  , target: (nodes.length-1) });
			edges.push({ source : 3  , target: (nodes.length-1) });
		}
		this.chart(nodes,edges)
	}
	
	chart(nodes,edges){
		var svg = d3.select(this.id)
					.append("svg")
					.attr("width",this.width)
					.attr("height",this.height);

		var force = d3.layout.force()
				.nodes(nodes)		//指定节点数组
				.links(edges)		//指定连线数组
				.size([this.width,this.height])	//指定范围
				.linkDistance(150)	//指定连线长度
				.charge(-400);	//相互之间的作用力

		force.start();	//开始作用

		// console.log(nodes);
		// console.log(edges);
		
		//添加连线		
		var svg_edges = svg.selectAll("line")
							.data(edges)
							.enter()
							.append("line")
							.style("stroke","#ccc")
							.style("stroke-width",3);
		
		var color = d3.scale.category20();
				
		//添加节点			
		var svg_nodes = svg.selectAll("circle")
							.data(nodes)
							.enter()
							.append("circle")
							.attr("r",10)
							.style("fill",function(d,i){
								return color(i);
							})
							.call(force.drag);	//使得节点能够拖动

		//添加描述节点的文字
		var svg_texts = svg.selectAll("text")
							.data(nodes)
							.enter()
							.append("text")
							.style("fill", "black")
							.attr("dx", 20)
							.attr("dy", 8)
							.text(function(d){
								return d.name;
							});
					

		force.on("tick", function(){	//对于每一个时间间隔
		
			 //更新连线坐标
			 svg_edges.attr("x1",function(d){ return d.source.x; })
			 		.attr("y1",function(d){ return d.source.y; })
			 		.attr("x2",function(d){ return d.target.x; })
			 		.attr("y2",function(d){ return d.target.y; });
			 
			 //更新节点坐标
			 svg_nodes.attr("cx",function(d){ return d.x; })
			 		.attr("cy",function(d){ return d.y; });

			 //更新文字坐标
			 svg_texts.attr("x", function(d){ return d.x; })
			 	.attr("y", function(d){ return d.y; });
		});


	}
}

export default force;