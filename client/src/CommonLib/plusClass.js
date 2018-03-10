import BaseClass from './BaseClass.js';
import NumBaseClass from './NumBaseClass.js';

// var plus = new plusClass("12556","5214");
// setTimeout(()=>{console.log(plus.add());},0);

class plusClass extends BaseClass{
	constructor(Num1,Num2) {
		super();
		this.Num1 = new NumBaseClass(Num1);
		this.Num2 = new NumBaseClass(Num2);
		this.result = new NumBaseClass("0");
	}
	add(){
		var i,ilength,flength;
		if(this.Num1.numi.length > this.Num2.numi.length){
			ilength = this.Num1.numi.length;
		}else{
			ilength = this.Num2.numi.length;
		}
		if(this.Num1.numf.length > this.Num2.numf.length){
			flength = this.Num1.numf.length;
		}else{
			flength = this.Num2.numf.length;
		}
		
		var Num1 = this.Num1.getS(ilength,flength);
		var Num2 = this.Num2.getS(ilength,flength);
		for(i in Num1.numi){
			Num1.numi[i] = Num1.numi[i] + Num2.numi[i];
		}
		for(i in Num1.numf){
			Num1.numf[i] = Num1.numf[i] + Num2.numf[i];
		}
		
		return this.result.queue(Num1.numi,Num1.numf);
	}
}
export default plusClass;