import * as d3 from "d3";
import $ from "jquery";
import D3chart from './D3chart.js';

class bundle extends D3chart {
	constructor(id) {
		super();
		this.id = id;
		this.width = $(this.id).width();
		this.height = this.width;
		this.setTotals(0);
	}
	remove(){
		d3.select(this.id).selectAll("svg").remove();
	}
	
	setTotals(Totals){

		var childnode = {
			name: "",
			children:[
				{ name: "master" },
				{ name: "server1" },
				{ name: "server2" },
				{ name: "server3" }
			]
		};
		
		var childnodeline = [
			{source: "master", target: "server1"},
			{source: "master", target: "server2"},
			{source: "master", target: "server3"}
		];
		while(Totals !== 0){
			--Totals;
			childnode.children.push({ name: "node "+Totals })
			childnodeline.push({source: "server1", target: "node "+Totals})
		}
		this.chart(childnode,childnodeline)
	}

	chart(childnode,childnodeline){
			
		var svg = d3.select(this.id)			//选择<body>
					.append("svg")			//在<body>中添加<svg>
					.attr("width", this.width)	//设定<svg>的宽度属性
					.attr("height", this.height);//设定<svg>的高度属性
		
		//2. 转换数据
		var cluster = d3.layout.cluster()
				.size([450, this.width/2 - 50])
				.separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

		var bundle = d3.layout.bundle();				

		var nodes = cluster.nodes(childnode);
		console.log(nodes);
		
		var oLinks = map(nodes, childnodeline);
		console.log(oLinks);
		
		var links = bundle(oLinks);
		console.log(links);
		
		//将links中的source和target由名称替换成节点
		function map( nodes, links ){
			var hash = [];
			for(var i = 0; i < nodes.length; i++){
				hash[nodes[i].name] = nodes[i];
			}
			var resultLinks = [];
			for(var i = 0; i < links.length; i++){
				resultLinks.push({  source: hash[ links[i].source ], 
									target: hash[ links[i].target ]
								});
			}
			return resultLinks;
		}
		
		//3. 绘图
		var line = d3.svg.line.radial()
					.interpolate("bundle")
					.tension(.85)
					.radius(function(d) { return d.y; })
					.angle(function(d) { return d.x / 180 * Math.PI; });
					
		var gBundle = svg.append("g")
					.attr("transform", "translate(" + (this.width/2) + "," + (this.height/2) + ")");
		
		var color = d3.scale.category20c();
			
		var link = gBundle.selectAll(".link")
			  .data(links)
			  .enter()
			  .append("path")
			  .attr("class", "link")
			  .attr("d", line);	//使用线段生成器
			
		
		var node = gBundle.selectAll(".node")
			  .data( nodes.filter(function(d) { return !d.children; }) )
			  .enter()
			  .append("g")
			  .attr("class", "node")
			  .attr("transform", function(d) {
					return "rotate(" + (d.x- 90) + ")translate(" + d.y + ")" + "rotate("+ (90 - d.x) +")"; 
			  });
			
		node.append("circle")
			  .attr("r", 8)
			  .style("fill",function(d,i){ return color(i); });
			
		node.append("text")
			.attr("dy",".2em")
			.style("text-anchor", "middle")
			.text(function(d) { return d.name; });

	}
}
export default bundle;