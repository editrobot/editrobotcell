import BaseClass from './BaseClass.js';
import NumBaseClass from './NumBaseClass.js';

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
	Symbol(code){
		if(typeof this.structureTree[this.point] === "undefined"){
			this.structureTree[this.point] = [];
		}
		switch(isNaN(code)){
			case false:
				this.structureTree[this.point].push({"format":"num","body":parseFloat(code)})
			break;
			case true:
			switch(code){
				case "(":
					this.structureTree[this.point].push({"format":"point"})
					this.point++;
				break;
				case ")":
					this.structureTree[this.point].push({"format":"split"})
					this.point--;
				break;
				case "!":
					var tempnum = this.structureTree[this.point][this.structureTree[this.point].length-1].body
					while(tempnum !== 1){
						--tempnum;
						this.structureTree[this.point].push({"format":"Symbol","body":"*"})
						this.structureTree[this.point].push({"format":"num","body":tempnum})
					}
				break;
				default:
					this.structureTree[this.point].push({"format":"Symbol","body":code})
			}
			break;
			default:
		}
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
	Classified(list){
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
					this.ResultStack.push(this.tempArray[temppoint])
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
		while(structureTree.length !== 0){
			this.SymbolStack = [];
			this.tempArray = this.ResultStack;
			this.ResultStack = [];
			this.Classified(structureTree.pop());
		}
		this.tempArray = [];
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
		console.log("tempArray:")
		for(i in this.tempArray){
			console.log(this.tempArray[i])
		}
	}
}

class ParserClass extends MathBaseClass{
	constructor() {
		super();
	}
	inputcodetest(inputcode,cb){
		var that = this;
		this.assembly(inputcode).then((v)=>{
			var sarray = that.Symbolsplit(v);
			return that.assembly(sarray);
		},(v)=>{that.trace(v)}).then((v)=>{
			for(var i in v){
				if(v[i] !== " "){
					that.Symbol(v[i])
				}
			}
			return that.assembly(that.structureTree);
		},(v)=>{that.trace(v)})
		.then((v)=>{
			that.viewStack("in test:")
			// that.process(v)
		},(v)=>{that.trace(v)})
		.finally(() => {
			var temp = "";
			// var i;
			// for(i in that.ResultStack){
				// temp = that.ResultStack[i].body + temp;
			// }
			if(typeof cb === "function"){
				cb(temp)
			}
		}).then((v)=>{
		},(v)=>{that.trace(v)})
		.finally(() => {})
	}
	GetResult(inputcode,cb){
		var that = this;
		this.assembly(inputcode).then((v)=>{
			return that.assembly(that.Symbolsplit(v).concat());
		},(v)=>{that.trace(v)}).then((v)=>{
			for(var i in v){
				if(v[i] !== " "){
					that.Symbol(v[i])
				}
			}
			return that.assembly(that.structureTree);
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