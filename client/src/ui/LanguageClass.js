class LanguageClass {
	constructor() {
		this.ForUI = [
			{
				"name":"MyID",
				"en":"MyID",
				"jp":"わたしのID",
				"cn":"我的ID"
			},
			{
				"name":"Total number of clients",
				"en":"Total number of clients",
				"jp":"クライアントの総数",
				"cn":"结点总数"
			},
			{
				"name":"please input code here",
				"en":"please input code here",
				"jp":"ここにコードを入力してください",
				"cn":"请在这里输入公式"
			},
			{
				"name":"this is out put result",
				"en":"this is out put result",
				"jp":"これは結果を出したものです",
				"cn":"这里将会输入处理结果"
			},
			{
				"name":"begin process",
				"en":"begin process",
				"jp":"プロセスを開始する",
				"cn":"开始处理"
			},
			{
				"name":"calculating...",
				"en":"calculating...",
				"jp":"計算する",
				"cn":"正在计算"
			},
			{
				"name":"clean input history",
				"en":"clean input history",
				"jp":"クリーンな入力履歴",
				"cn":"清空历史记录"
			},
			{
				"name":"Message panel",
				"en":"Message panel",
				"jp":"メッセージパネル",
				"cn":"消息面板"
			},
			{
				"name":"NOTICE",
				"en":"NOTICE",
				"jp":"知らせ",
				"cn":"提醒"
			},
			{
				"name":"input history",
				"en":"input history",
				"jp":"入力履歴",
				"cn":"输入记录"
			},
			{
				"name":"The End",
				"en":"The End",
				"jp":"終わり",
				"cn":"结束"},
			{
				"name":"YOUR GEOLOCATION",
				"en":"YOUR GEOLOCATION",
				"jp":"あなたの地理座標",
				"cn":"你的地理位置"
			},
			{
				"name":"longitude",
				"en":"longitude",
				"jp":"経度",
				"cn":"经度"
			},
			{
				"name":"latitude",
				"en":"latitude",
				"jp":"緯度",
				"cn":"纬度"
			}
		]
		this.ForMsg = [
			{
				"name":"MyID",
				"en":"MyID",
				"jp":"わたしのID",
				"cn":"我的ID"
			},
			{
				"name":"Total number of clients",
				"en":"Total number of clients",
				"jp":"クライアントの総数",
				"cn":"结点总数"
			}
		]
	}
	outPutUIText(str){
		var that = this;
		var i;
		var output = {}
		switch(str){
			case "en":
			case "cn":
			case "jp":
				for(i in that.ForUI){
					if(typeof that.ForUI[i][str] !== "undefined"){
						output[that.ForUI[i]["name"]] = that.ForUI[i][str]
					}else{
						output[that.ForUI[i]["name"]] = that.ForUI[i]["en"]
					}
				}
			break;
			default:
				for(i in that.ForUI){
					output[that.ForUI[i]["name"]] = that.ForUI[i]["en"];
				}
		}
		return output;
	}
	
}

export default LanguageClass;