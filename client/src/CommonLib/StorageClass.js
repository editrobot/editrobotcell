import BaseClass from './BaseClass.js';

class StorageClass extends BaseClass{
	constructor(dbname) {
		super();
		var that = this;
		this.dbname = dbname;
		if('indexedDB' in window) {
			console.log("support indexedDB")
		} else {
			console.log("do not support indexedDB")
		}
		this.openRequest = window.indexedDB.open(this.dbname,1);
		this.openRequest.onupgradeneeded = function(e) {
			var store;
			var db = e.target.result;
			if(!db.objectStoreNames.contains(that.dbname)) {
				store = db.createObjectStore(that.dbname,{ autoIncrement: true });
			}
		}
	}

	openDB(mode,success,error,oncomplete){
		var that = this;
		this.openRequest = window.indexedDB.open(this.dbname,1);
		this.openRequest.onsuccess = function(e) {
			var db = e.target.result;
			var transaction = db.transaction([that.dbname],mode);
			transaction.oncomplete = function(e) {
				console.log("oncomplete");
				if(typeof oncomplete === "function"){
					if(oncomplete()){
						db.close();
					}
				}
			};
			transaction.onabort = function(e) {
				console.log("abort");
			};
			transaction.onerror = function(e) {
				console.log("error");
			};
			if(typeof success === "function"){
				success(transaction.objectStore(that.dbname))
			}
		}

		this.openRequest.onerror = function(e) {
			if(typeof error === "function"){
				error(e);
			}
		}
	}

	addData (data){
		this.openDB(
			"readwrite",
			(store)=>{
				var request = store.add(data);

				request.onerror = function(e) {
					console.log("Error",e.target.error.name);
				}

				request.onsuccess = function(e) {
					console.log("add db success！");
				}
			},
			(e)=>{
				console.log("Error");
				console.dir(e);
			},
			()=>{return true;}
		);
	}
	
	readData(key,cb){
		this.openDB(
			"readonly",
			(store)=>{
				var cursor = store.openCursor();
				cursor.onsuccess = function(e) {
					var res = e.target.result;
					if(res){
						if(key === res.key){
							console.log("Key", res.key);
							console.dir(res.value);
							return;
						}
						res.continue();
					}
				}
				// store.get(key).onsuccess = function(e){
					// console.log(e.target.result);
				// }
			},
			(e)=>{
				console.log("Error");
				console.dir(e);
			},
			()=>{return true;}
		);
	}
	
	resetData(key,data){
		this.openDB(
			"readwrite",
			(store)=>{
				store.put(data, key);
			},
			(e)=>{
				console.log("Error");
				console.dir(e);
			},
			()=>{return true;}
		);
	}
	
	deleteData(key){
		this.openDB(
			"readwrite",
			(store)=>{
				store.delete(key);
			},
			(e)=>{
				console.log("Error");
				console.dir(e);
			},
			()=>{return true;}
		);
	}
	
	mapData(cb){
		this.openDB(
			"readonly",
			(store)=>{
				var cursor = store.openCursor();
				cursor.onsuccess = function(e) {
					var res = e.target.result;
					if(res){
						// console.log(res);
						if(typeof cb === "function"){
							cb(res.key,res.value);
						}
						console.log("Key",res.key,res.value);
						res.continue();
					}
				}
			},
			(e)=>{
				console.log("Error");
				console.dir(e);
			},
			()=>{return true;}
		);
	}
	
	removeDB(){
		window.indexedDB.deleteDatabase(this.dbname);
	}
}

export default StorageClass;