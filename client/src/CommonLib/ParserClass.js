import BaseClass from './BaseClass.js';
// import plusClass from './plusClass.js';
// import NumBaseClass from './NumBaseClass.js';

class MathBaseClass extends BaseClass{
	constructor() {
		super();
		this.SymbolPermissions = [["+","-"],["*","/"],["^","!"]];
		this.SymbolStack = [];
		this.ResultStack = [];
		this.structureTree = [];

		this.point = 0;
		this.tempArray = [];
	}
	Symbolsplit(str){
		var temp = "";
		var sarray = str.split("");
		var result = [];

		for (var i in sarray){
			switch(isNaN(sarray[i])){
				case true:
					if(sarray[i] === "."){
						temp = temp+sarray[i];
					}
					else{
						if(temp !== ""){
							result.push(temp);
							temp = "";
						}
						result.push(sarray[i]);
					}
				break;
				case false:
					temp = temp+sarray[i];
				break;
				default:
			}
		}
		if(temp !== ""){
			result.push(temp);
			temp = "";
		}
		return result;
	}
	SymbolCompare(code1,code2){
		var code1Permissions = -1;
		var code2Permissions = -1;
		for(var i in this.SymbolPermissions){
			var code1t = this.SymbolPermissions[i].indexOf(code1)
			var code2t = this.SymbolPermissions[i].indexOf(code2)
			if(code1t !== -1){
				code1Permissions = i;
			}
			if(code2t !== -1){
				code2Permissions = i;
			}
		}
		return code1Permissions-code2Permissions
	}
	calc(Symbol,code1,code2){
		switch(Symbol.body){
			case "^":
				return {"format":"num","body":Math.pow(code2.body,code1.body)}
			case "*":
				return {"format":"num","body":code2.body*code1.body}
			case "/":
				return {"format":"num","body":code2.body/code1.body}
			case "+":
				return {"format":"num","body":code2.body+code1.body}
			case "-":
				return {"format":"num","body":code2.body-code1.body}
			default:
				return {"format":"num","body":0}
		}
	}
	Symbolprocess(Symbol){
		if(this.SymbolStack.length === 0){
			this.SymbolStack.push(Symbol)
		}
		else if(this.SymbolCompare(
			Symbol.body,
			this.SymbolStack[this.SymbolStack.length-1].body) > 0){
			this.SymbolStack.push(Symbol)
		}
		else{
			this.ResultStack.push(this.calc(this.SymbolStack.pop(),this.ResultStack.pop(),this.ResultStack.pop()))
			this.Symbolprocess(Symbol);
		}
	}
	Classified(list,tempArray){
		var temppoint = 0;
		for(var i in list){
			switch(list[i].format){
				case "Symbol":
					this.Symbolprocess(list[i])
				break;
				case "num":
					this.ResultStack.push(list[i])
				break;
				case "split":
					this.ResultStack.push(this.calc(this.SymbolStack.pop(),this.ResultStack.pop(),this.ResultStack.pop()))
				break;
				case "point":
					this.ResultStack.push(tempArray[temppoint])
					temppoint++;
				break;
				default:
			}
		}
		while(true){
			if(this.SymbolStack.length !== 0){
				this.ResultStack.push(this.calc(this.SymbolStack.pop(),this.ResultStack.pop(),this.ResultStack.pop()))
			}
			else{break;}
		}
	}
	process(structureTree){
		var tempArray;
		while(structureTree.length !== 0){
			this.SymbolStack = [];
			tempArray = this.ResultStack;
			this.ResultStack = [];
			this.Classified(structureTree.pop(),tempArray);
		}
		tempArray = [];
	}
	MakestructureTree(inputcode){
		function Symbol(structureTree,point,code){
			if(typeof structureTree[point] === "undefined"){structureTree[point] = [];}
			switch(isNaN(code)){
				case false:
					structureTree[point].push({"format":"num","body":parseFloat(code)})
				break;
				case true:
				switch(code){
					case "(":
						structureTree[point].push({"format":"point"})
						point++;
					break;
					case ")":
						structureTree[point].push({"format":"split"})
						point--;
					break;
					case "!":
						var tempnum = structureTree[point][structureTree[point].length-1].body
						while(tempnum !== 1){
							--tempnum;
							structureTree[point].push({"format":"Symbol","body":"*"})
							structureTree[point].push({"format":"num","body":tempnum})
						}
					break;
					default:
						structureTree[point].push({"format":"Symbol","body":code})
				}
				break;
				default:
			}
			return {"structureTree":structureTree,"point":point}
		}
		var point = 0;
		var structureTree = [];
		var i;
		var that = this;
		var temp;
		var tempArray = that.Symbolsplit(inputcode).concat();
		for(i in tempArray){
			if(tempArray[i] !== " "){
				temp = Symbol(structureTree,point,tempArray[i])
				structureTree = temp.structureTree;
				point = temp.point;
			}
		}
		return structureTree;
	}
	viewStack(text){
		var i;
		console.log("----------------------------")
		console.log(text)
		console.log("this.structureTree:")
		for(i in this.structureTree){
			console.log(this.structureTree[i])
		}
		console.log("SymbolStack:")
		for(i in this.SymbolStack){
			console.log(this.SymbolStack[i])
		}
		console.log("ResultStack:")
		for(i in this.ResultStack){
			console.log(this.ResultStack[i])
		}
	}
}

class ParserClass extends MathBaseClass{
	constructor() {
		super();
	}
	
	testResult(inputcode){
		var i;
		var structureTree = this.MakestructureTree(inputcode);
		for(i in structureTree){
			console.log(structureTree[i])
		}
	}
	GetResult(inputcode,cb){
		var that = this;
		this.assembly(inputcode).then((v)=>{
			return that.assembly(that.MakestructureTree(v));
		},(v)=>{that.trace(v)})
		.then((v)=>{
			that.process(v)
		},(v)=>{that.trace(v)})
		.finally(() => {
			var temp = "";
			var i;
			for(i in that.ResultStack){
				temp = that.ResultStack[i].body + temp;
			}
			if(typeof cb === "function"){
				cb(temp)
			}
		}).then((v)=>{
		},(v)=>{that.trace(v)})
		.finally(() => {})
	}
}

export default ParserClass;