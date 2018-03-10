import BaseClass from './BaseClass.js';

class NumBaseClass extends BaseClass{
	constructor(Str) {
		super();
		this.nums = "+";
		this.Progressive = 9999;
		this.numi = [0];
		this.numf = [0];
		this.status = false
		this.set(Str)
	}
	set(Str,cb){
		var that = this;
		this.assembly(Str).then((v)=>{
			if(v[0] === "-"){
				return that.assembly({
					"nums" : "-",
					"num" : v.replace(/-/, "")
				});
			}else{
				return that.assembly({
					"nums" : "+",
					"num" : v.replace(/\+/, "")
				});
			}
		}).then((v)=>{
			return that.assembly({
				"nums" : v.nums,
				"numi" : v.num.split(".")[0],
				"numf" : (typeof v.num.split(".")[1] !== "undefined")?(v.num.split(".")[1]):("0")
			});
		}).then((v)=>{
			return that.assembly({
				"nums" : v.nums,
				"numi" : v.numi.split(""),
				"numf" : v.numf.split("")
			});
		}).then((v)=>{
			var strlength = that.Progressive.toString().length;
			var numi = [];
			var numf = [];
			var tempif;
			var i;
			while(v.numi.length !== 0){
				i = 0;
				tempif = "";
				while((v.numi.length !== 0)&&(i<strlength)){
					tempif = v.numi.pop()+tempif;
					i++;
				}
				numi.push(tempif);
			}
			v.numf.reverse();
			while(v.numf.length !== 0){
				i = 0;
				tempif = "";
				while((v.numf.length !== 0)&&(i<strlength)){
					tempif = tempif+v.numf.pop();
					i++;
				}
				
				while(strlength-tempif.length !== 0){
					tempif = tempif+"0"
				}
				numf.push(tempif);
			}
			
			return that.assembly({
				"nums" : v.nums,
				"numi" : numi.reverse(),
				"numf" : numf
			});
		}).then((v)=>{
			console.log(v);
			var i;
			that.nums = v.nums;
			for(i in v.numi){
				v.numi[i] = parseInt(v.numi[i],10);
			}
			that.numi = v.numi;
			for(i in v.numf){
				v.numf[i] = parseInt(v.numf[i],10);
			}
			that.numf = v.numf;
			if(typeof cb === "function"){
				cb(that.nums,that.numi,that.numf)
			}
		})
	}
	get(){
		var i;
		var templength;
		var temp = "";
		var gaplength;
		var numi = "";
		var numf = "";

		for(i in this.numi){
			temp = this.numi[i].toString();
			templength = temp.length;
			gaplength = this.Progressive.toString().length - templength
			while(gaplength>0){
				temp = "0"+temp;
				gaplength--;
			}
			numi = numi+temp;
		}
		for(i in this.numf){
			temp = this.numf[i].toString();
			templength = temp.length;
			gaplength = this.Progressive.toString().length - templength
			while(gaplength>0){
				temp = "0"+temp;
				gaplength--;
			}
			numf = numf+temp;
		}

		if(this.nums === "-"){
			return this.nums+numi+"."+numf;
		}else{
			return numi+"."+numf;
		}
	}
	getS(IntNumLength,FloatNumLength){
		var numi = this.numi.concat();
		var numf = this.numf.concat();
		
		var lgap = FloatNumLength-numf.length
		while(lgap>0){
			numf.push(0)
			lgap--;
		}
		var NumSymbol = 1;
		if(this.nums === "-"){
			NumSymbol = NumSymbol*-1
		}
		var i;
		if(numi.length + numf.length > 1){
			for(i in numi){
				numi[i] = numi[i]+this.Progressive;
			}
			for(i in numf){
				numf[i] = numf[i]+this.Progressive;
			}
		}
		numi[0] = numi[0]-this.Progressive-1;
		numf[(numf.length-1)] = numf[(numf.length-1)]+1;
		
		for(i in numi){
			numi[i] = NumSymbol*numi[i]
		}
		for(i in numf){
			numf[i] = NumSymbol*numf[i]
		}
		numi.reverse();
		lgap = IntNumLength-numi.length;
		while(lgap>0){
			numi.push(0)
			lgap--;
		}
		return {
			nums : this.nums,
			numi : numi.reverse(),
			numf : numf
		}
	}
	queue(numi,numf){
		var temp;
		var NumSymbol = 1;
		var lock = true;
		var i;
		var tempnuminumf = []
		// for(i in numi){
			// if(!lock){
				// tempnuminumf.push(numi[i])
			// }else if(numi[i] !== 0){
				// lock = !lock;
				// tempnuminumf.push(numi[i])
			// }
		// }
		// numi = (tempnuminumf.length !== 0)?(tempnuminumf):([0]);
		// lock = true;
		// while(numf.length !== 0){
			// temp = numf.pop();
			// if(temp !== 0){
				// numf.push(temp);
				// break;
			// }
		// }
		
		tempnuminumf = numi.concat((numf.length !== 0)?(numf):([0]));
		
		for(i in tempnuminumf){
			if(tempnuminumf[i]>0 && tempnuminumf[i]!==0){
				NumSymbol = 1;
				break;
			}else if(tempnuminumf[0]<0){
				NumSymbol = -1;
				break;
			}
		}

		var carry = 0;
		lock = true;
		while(lock){
			lock = false;
			carry = 0;
			i = tempnuminumf.length - 1;
			while(!(i < 0)){
				switch(NumSymbol){
					case 1:
						tempnuminumf[i] = tempnuminumf[i]+carry;
						carry = 0;
						if(tempnuminumf[i]<0){
							carry = -1;
							tempnuminumf[i] = tempnuminumf[i]+(this.Progressive+1);
							lock = lock || true;
						}else if(tempnuminumf[i] > this.Progressive){
							carry = 1;
							tempnuminumf[i] = tempnuminumf[i]-(this.Progressive+1);
							lock = lock || true;
						}
					break;
					case -1:
						tempnuminumf[i] = tempnuminumf[i]+carry;
						carry = 0;
						if(tempnuminumf[i]>0){
							carry = 1;
							tempnuminumf[i] = tempnuminumf[i]-(this.Progressive+1);
							lock = lock || true;
						}else if(tempnuminumf[i] < -1*this.Progressive){
							carry = -1;
							tempnuminumf[i] = tempnuminumf[i]+(this.Progressive+1);
							lock = lock || true;
						}
						if(tempnuminumf[i]<0){
							tempnuminumf[i] = tempnuminumf[i]*-1;
						}
					break;
					default:
				}
				i--;
			}
			if(carry !== 0){
				tempnuminumf[i+1] = tempnuminumf[i+1]+carry;
			}
		}
		
		this.nums = (NumSymbol>0)?("+"):("-");
		this.numi = tempnuminumf.slice(0,numi.length)
		this.numf = tempnuminumf.slice(numi.length)
		return this.get();
	}
}

export default NumBaseClass;