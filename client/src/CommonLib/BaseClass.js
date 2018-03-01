class ParserClass {
	constructor() {
		console.log("ParserClass")
		this.SymbolPermissions = [["+","-"],["*","/"],["^"]];

		this.Result = [];
		this.point = 0;
		this.SymbolStack = [];
		this.ResultStack = [];
		this.temppoint = 0;
		this.tempArray = [];
	}
	viewStack(text){
		var i;
		console.log("----------------------------")
		console.log(text)
		console.log("this.Result:")
		for(i in this.Result){
			console.log(this.Result[i])
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
		if(typeof this.Result[this.point] === "undefined"){
			this.Result[this.point] = [];
		}
		switch(isNaN(code)){
			case false:
				this.Result[this.point].push({"format":"num","body":parseFloat(code)})
			break;
			case true:
			switch(code){
				case "(":
					this.Result[this.point].push({"format":"point"})
					this.point++;
				break;
				case ")":
					this.Result[this.point].push({"format":"split"})
					this.point--;
				break;
				default:
					this.Result[this.point].push({"format":"Symbol","body":code})
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
					this.ResultStack.push(this.tempArray[this.temppoint])
					this.temppoint++;
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
	process(){
		while(this.Result.length !== 0){
			this.SymbolStack = [];
			this.temppoint = 0;
			this.tempArray = this.ResultStack;
			this.ResultStack = [];
			this.viewStack("end");
			this.Classified(this.Result.pop());
		}
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
	Parser(str){
		this.trace("src:"+str);
		var sarray = this.Symbolsplit(str);
		for(var i in sarray){
			if(sarray[i] !== " "){
				this.Symbol(sarray[i])
			}
		}
		this.process()
		this.viewStack("end");
	}
}

class BaseClass extends ParserClass{
	constructor() {
		super();
		console.log("BaseClass")
	}

	GetQueryString(name){
		var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if(r!=null) return unescape(r[2]); return null;
	}

	trace(text) {
		if (text[text.length - 1] === '\n') {
			text = text.substring(0, text.length - 1);
		}
		if (window.performance) {
			var now = (window.performance.now() / 1000).toFixed(3);
			console.log(now + ': ' + text);
		} else {
			console.log(text);
		}
	}
}

export default BaseClass;