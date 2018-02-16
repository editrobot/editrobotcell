import BaseClass from './BaseClass.js';

class StorageClass extends BaseClass{
	constructor() {
		super();
		if('indexedDB' in window) {
			console.log("yes")
			this.run()
		} else {
			console.log("no")
		}
	}
	
	run(){
		var openRequest = window.indexedDB.open("test",1);
		var db;

		openRequest.onupgradeneeded = function(e) {
			// upgradeneeded：第一次打开该数据库，或者数据库版本发生变化。
			console.log("Upgrading...");
			db = e.target.result;
			if(!db.objectStoreNames.contains("ClientDB")) {
				console.log("ClientDB");
				db.createObjectStore("ClientDB",{ autoIncrement: true });
			}
		}

		openRequest.onsuccess = function(e) {
			// success：打开成功。
			console.log("Success!");
			db = e.target.result;
			var t = db.transaction(["ClientDB"],"readwrite");
			t.oncomplete = function(e) {
				console.log("oncomplete");
			};
			t.onabort = function(e) {
				console.log("abort");
			};
			t.onerror = function(e) {
				console.log("error");
			};

			var store = t.objectStore("ClientDB");
			var o = {p: 123};
			var request = store.add(o);
			
			request.onerror = function(e) {
				console.log("Error",e.target.error.name);
				// error handler
			}

			request.onsuccess = function(e) {
				console.log("数据添加成功！");
			}
			db.transaction(["ClientDB"], "readonly")
			.objectStore("ClientDB")
			.get(1)
			.onsuccess = function(e){
				console.log(e.target.result);
			}

			var request = store.put({ p:456 });
			
			// var request = db.transaction(["ClientDB"], "readwrite").objectStore("ClientDB").delete(3);

			var store = db.transaction(["ClientDB"], "readonly").objectStore("ClientDB");
			var cursor = store.openCursor();
			cursor.onsuccess = function(e) {
				var res = e.target.result;
				if(res) {
					console.log("Key", res.key);
					console.log(res.value);
					res.continue();
				}
			}
		}

		openRequest.onerror = function(e) {
			// error：打开失败。
			console.log("Error");
			console.dir(e);
		}
	}
}

export default StorageClass;