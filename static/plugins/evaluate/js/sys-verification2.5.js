/*
 * SYSUI-verification1.5
 * 2019-06-11
 * 799129700@qq.com SYSHUXL-化海天堂 www.husysui.com
 * Reserved head available commercial use
 * Universal background system interface framework
 */
//合并
function extend(o, n, override) {
	for(var key in n) {
		if(n.hasOwnProperty(key) && (!o.hasOwnProperty(key) || override)) {
			o[key] = n[key];
		}
	}
	return o;
};
//处理
function addLoadListener(fn) {
	if(typeof window.addEventListener != 'undefined') {
		window.addEventListener('load', fn, false);
	} else if(typeof document.addEventListener != 'undefined') {
		document.addEventListener('load', fn, false);
	} else if(typeof window.attachEvent != 'undefined') {
		window.attachEvent('onload', fn);
	} else {
		var oldfn = window.onload;
		if(typeof window.onload != 'function') {
			window.onload = fn;
		} else {
			window.onload = function() {
				oldfn();
				fn();
			};
		}
	}
};
//简化document.getElementById方法
function ID$(i) {
	return document.getElementById(i)
};
//简化document.createElement方法
function LABEL$(i) {
	return document.createElement(i)
};
//简化document.getElementsByName方法
function NAME$(i) {
	return document.getElementsByName(i)
}

function TAGNAME$(i) {
	return document.getElementsByTagName(i)
}
// 插件构造函数 - 返回数组结构
function SYSVerification(options) {
	this._initial(options);
};
//添加属性和方法

SYSVerification.prototype = {
	constructor: this,
	//创建方法
	_initial:function(options){
		//创建属性
		var par = {
			Verification: '', //指定验证区域
			Submit: '', //提交名
			Icon: '',
			Empty: '',
			keyCode:null,//是否回车触发
			Transform: true,
			Passwordlength: 6,
			Checkbox:true,
			SelectionBox:".SelectionBox",
			DataSource:null,
			Mixedkey:false,//是否启用混合将关键字转换为不可识别的字符
			Editmode: '', //编辑模式
			Loading: '<div class="padding05">加载中......</div>', //加载样式设置
			Verify_Promptcode: 101, //验证码返回数字
			ConfirmCode: 202, //确认返回数字
			FailureCode: 102, //失败认证码
			FailurePrompt: '', //请求失败提示
			CkPrompt:false,//是否启用搜索提示信息
			Load: function() {}, //载入数据方法
			Formmode: "submitmode", //submitmode提交模式，loadmode加载模式
			SelectEvent: function() {},
			ConfirmCallback: function() {}, //确认回调方法
			SubmitMethod: function() {}, //提交操作
			Expand: function() {},
			Complete: function() {}, //页面加载完成在执行
			ExtendMethod: function() {},
			Loadselect:function(){}//
		};
		this.par = extend(par, options, true);
		//判断是否存在class属性方法
		this.hasClass = function(elements, cName) {
			return !!elements.className.match(new RegExp("(\\s|^)" + cName + "(\\s|$)"));
		}
		//添加class属性方法
		this.addClass = function(elements, cName) {
			if(!this.hasClass(elements, cName)) {
				elements.className += " " + cName;
			};
		};
		//删除class属性方法 elements当前结构  cName类名
		this.removeClass = function(elements, cName) {
			if(this.hasClass(elements, cName)) {
				elements.className = elements.className.replace(new RegExp("(\\s|^)" + cName + "(\\s|$)"), " "); // replace方法是替换
			};
		};
		//根据class类名条件筛选结构
		this.getElementsByClassName = function(parent, className) {
			var aEls = parent.getElementsByTagName("*");　　//获取所有父节点下的tag元素　
			var arr = [];
			//循环所有tag元素　
			for(var i = 0; i < aEls.length; i++) {
				//将tag元素所包含的className集合（这里指一个元素可能包含多个class）拆分成数组,赋值给aClassName	　　　　
				var aClassName = aEls[i].className.split(' ');　　　　 //遍历每个tag元素所包含的每个className
				for(var j = 0; j < aClassName.length; j++) {　　　　　　 //如果符合所选class，添加到arr数组				　　　　　
					if(aClassName[j] == className) {　　　　　　　　
						arr.push(aEls[i]);　　　　　　　　 //如果className里面包含'box' 则跳出循环						　　　　　　　　
						break; //防止一个元素出现多次相同的class被添加多次						　　　　　　
					}　　　　
				};　　
			};　　
			return arr;
		};
		//根据class类名条件筛选结构
		this.getByClass = function(oParent, sClass) { //根据class获取元素
			var oReasult = [];
			var oEle = oParent.getElementsByTagName("*");
			for(i = 0; i < oEle.length; i++) {
				if(oEle[i].className == sClass) {
					oReasult.push(oEle[i]);
				}
			};
			return oReasult;
		};
		//删除指定_element方法
		this.removeElement = function(_element) {
			var _parentElement = _element.parentNode;
			if(_parentElement) {
				_parentElement.removeChild(_element);
			};
		};
		this.par.Expand(this);
		this.show(this.par);
	},
	//将big-endian单词数组转换为base-64字符
	binb2b64: function(binarray) {
		var b64pad = "";
		var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
		var str = "";
		if(binarray != undefined) {
			for(var i = 0; i < binarray.length * 4; i += 3) {
				var triplet = (((binarray[i >> 2] >> 8 * (3 - i % 4)) & 0xFF) << 16) | (((binarray[i + 1 >> 2] >> 8 * (3 - (i + 1) % 4)) & 0xFF) << 8) | ((binarray[i + 2 >> 2] >> 8 * (3 - (i + 2) % 4)) & 0xFF);
				for(var j = 0; j < 4; j++) {
					if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
					else str += tab.charAt((triplet >> 6 * (3 - j)) & 0x3F);
				}
			}
		}
		return str;
	},
	//将关键字转换为不可识别的字符
	stringTonum:function(a) {
        var str = a.toLowerCase().split("");
        var al = str.length;
        var getCharNumber = function (charx) {
            return charx.charCodeAt() - 96;
        };
        var numout = 0;
        var charnum = 0;
        for (var i = 0; i < al; i++) {
            charnum = getCharNumber(str[i]);
            numout += charnum * Math.pow(26, al - i - 1);
        };
        var now = new Date();
        var year = now.getFullYear();       //年
	    var month = now.getMonth() + 1;     //月
	    var day = now.getDate();            //日
	    var hh = now.getHours();            //时
	    var mm = now.getMinutes();          //分
	    var ss = now.getSeconds();           //秒
	    var clock = year;
	    if(month < 10)
	        clock += "0";    
	    clock += month;    
	    if(day < 10)
	        clock += "0";	        
	    clock += day;	    
	    if(hh < 10)
	        clock += "0";
	    clock += hh;
	    if (mm < 10) clock += '0'; 
	    clock += mm; 	     
	    if (ss < 10) clock += '0'; 
	        clock += ss; 
        return clock+numout;
    },	
	//集合方法
	show: function(set) {
		var _Method = this;
		var region = ID$(set.Verification);
		var subname = ID$(set.Submit);
		var Empty = ID$(set.Empty);
		var mobile_flag = _Method.isMobile(mobile_flag);
		var keyCode = set.keyCode;
		var onbtn = null;
		_Method.ajaxObject(_Method);
		addLoadListener(subname);
		var conttext = _Method.conttext(conttext);
		if(subname != null) {
			if(keyCode==true){
				document.onkeydown=function(event,onbtn){ 
				    if(event.keyCode==13){ 
				        _Method.verificationMethod(region, conttext, subname, _Method, event);
						var evt = event || window.event;
						var onbtn = evt.target || evt.srcElement;
				    } 
				};
				subname.onmousedown = function(event, onbtn) {
				_Method.verificationMethod(region, conttext, subname, _Method, event);
				var evt = event || window.event;
				var onbtn = evt.target || evt.srcElement;
			}
			}else{
				subname.onmousedown = function(event, onbtn) {
				_Method.verificationMethod(region, conttext, subname, _Method, event);
				var evt = event || window.event;
				var onbtn = evt.target || evt.srcElement;
			}
			}
			
		}
		
		if(Empty != null) {
			Empty.onclick = function(event) {
				for(var i = 0; i < conttext.length; i++) {
					conttext[i].value = "";
				}
			}
		}
		if(mobile_flag) {
			_Method.addClass(region, "mobile");
		} else {
			_Method.removeClass(region, "mobile");
		}

		for(var i = 0; i < conttext.length; i++) {
			//事件会在对象失去焦点时发生
			conttext[i].onblur = function(e, onbtn) {
				onblurMobile(e, onbtn);
			}
			conttext[i].onfocus = function(e) {
				onfocusMobile(e)
			};
		}
		var mode = set.PromptMode;
		var onfocusMobile = function(e) {
			var evt = e || window.event;
			var tar = evt.target || evt.srcElement;
			if(tar.tagName.toLowerCase() == "textarea") {
				addLoadListener(_Method.Wordcount(_Method, conttext, e));
			}
			var eventname = evt.type;
			_Method.PromptModeMethod(tar, _Method, eventname);
		};
		var onblurMobile = function(e) {
			var textname = "不能为空！";
			var evt = e || window.event;
			var tar = evt.target || evt.srcElement;
			if(tar.tagName.toLowerCase() == "input" || tar.tagName.toLowerCase() == "select") {
				var index = tar.selectedIndex; // 选中索引
				var Hints = tar.getAttribute('data-name');
				var verify = tar.getAttribute('data-verify');
				if(index != null) {
					var selectname = tar.options[index].value;
					if(selectname == "0") {
						_Method.newprompt(textname, Hints, _Method, tar);
					} else {
						_Method.prompthtml(tar);
					}
				} else if(tar.value != "") {
					var promptname = tar.getAttribute('data-prompt');
					for(var i = 0; i < conttext.length; i++) {
						var dataprompt = conttext[i].getAttribute('data-prompt');
						if(dataprompt == "password") {
							var zhi = conttext[i].value;
						}
					}
					_Method.prompthtml(tar);
					_Method.formatmethod(conttext, Hints, _Method, tar, promptname, zhi, verify);

				} else {
					if(verify == "verify") {
						_Method.newprompt(textname, Hints, _Method, tar);
					}
				}
			}
			var eventname = evt.type;
			_Method.PromptModeMethod(tar, _Method, eventname);
		}
		set.Load(_Method, conttext);
		if(_Method.par.DataSource!=null){
			_Method.FormdataMethod(_Method.par.DataSource, _Method,"data");
		}else{
			_Method.FormdataMethod(null, _Method,null);
		}
		set.SelectEvent(_Method, conttext);
		set.ExtendMethod(_Method, conttext);
	},
	//设置提示模式
	PromptModeMethod: function(tar, _Method, name) {
		var mode = _Method.par.PromptMode;
		if(mode == "mode") {

		} else if(mode == "mode1") {
			if(name == "focus") {
				_Method.removeClass(tar.parentNode, "form_prompt");
				_Method.addClass(tar.parentNode, "form_errors");
			} else if(name == "blur" || name == "click") {
				_Method.removeClass(tar.parentNode, "form_errors");
				if(tar.value == null) {
					_Method.addClass(tar.parentNode, "form_prompt");
				} else {
					_Method.removeClass(tar.parentNode, "form_prompt");
				}
			}
		}
	},
	//判断是手机还是pc
	isMobile: function(mobile_flag) {
		var userAgentInfo = navigator.userAgent;
		var mobileAgents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
		var mobile_flag = false;
		//根据userAgent判断是否是手机
		for(var v = 0; v < mobileAgents.length; v++) {
			if(userAgentInfo.indexOf(mobileAgents[v]) > 0) {
				mobile_flag = true;
				break;
			}
		}
		var screen_width = window.screen.width;
		var screen_height = window.screen.height;
		//根据屏幕分辨率判断是否是手机
		if(screen_width < 500 && screen_height < 800) {
			mobile_flag = true;
		}
		return mobile_flag;
	},
	ajaxObject: function(obj) {
		//声明ajax方法.，用于判断浏览器是否支持ajax
		var xmlHttp;
		try {
			// Firefox, Opera 8.0+, Safari
			xmlHttp = new XMLHttpRequest();
		} catch(e) {
			// Internet Explorer
			try {
				xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
			} catch(e) {
				try {
					xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
				} catch(e) {
					obj.PromptBox('您的浏览器不支持AJAX', 2);
					return false;
				}
			}
		}
		return xmlHttp;
	},
	//get请求
	ajaxGet: function(url, conttext,stu) {
		var _Method = this;
		var ajax = _Method.ajaxObject();
		ajax.open("GET", url, true);
		if(ajax) {
			_Method.PromptBox(_Method.par.Loading, 0, true);
		}
		ajax.onreadystatechange = function() {
			if(ajax.readyState == 4) {
				if(ajax.status == 200) {
					var json = ajax.responseText; //获取到json字符串，还需解析
					var jsonStr = JSON.parse(json); //将字符串转换为json数组
					_Method.FormdataMethod(jsonStr, _Method,stu);
				} else {
					_Method.PromptBox("HTTP请求错误！错误码：" + ajax.status, 2);
				}
				_Method.PromptBox(null, 0, true);
				_Method.par.Complete(_Method, conttext);
			}
		};
		ajax.send();
	},
	//Post请求
	ajaxPost: function(url, data, newarr) {
		var _Method = this;
		var ajax = _Method.ajaxObject();
		ajax.open("post", url, true);
		if(data == null) {
			ajax.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		} else {
			ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		}
		if(ajax) {
			_Method.PromptBox(_Method.par.Loading, 0, true);
		}
		ajax.onreadystatechange = function() {
			if(ajax.readyState == 4) {
				if(ajax.status == 200) {
					_Method.statusname(ajax.responseText, _Method, newarr,data);
				} else if(ajax.status == 500) {
					_Method.PromptBox('服务器出错，请稍后再试。', 2);
				} else if(ajax.status == 404) {
					_Method.PromptBox('页面已删除或不存在', 2);
				} else if(ajax.status == 401) {
					_Method.statusname(ajax.responseText, _Method, newarr,data);
				} else {
					_Method.PromptBox("HTTP请求错误！错误码：" + ajax.status, 2);
					return;
				}
			} else {
				return false;
			}
			_Method.PromptBox(null, 0, true);
		}
		if(data == null) {
			ajax.send(newarr);
		} else {
			typeof(data) != "undefined" ? ajax.send(data): '';
		}
	},
	//提示
	statusname: function(status, _Method, newarr,data) {
		var region = ID$(_Method.par.Verification);
		var Prompt_Code = _Method.par.Verify_Promptcode;
		var ConfirmCode = _Method.par.ConfirmCode;
		var FailureCode = _Method.par.FailureCode;
		var FailurePrompt = _Method.par.FailurePrompt;
		_Method.par.ConfirmCallback(status, _Method, newarr,data);
		var conttext = _Method.getElementsByClassName(region, "Required");; //name集合
		for(var i = 0; i < conttext.length; i++) {
			var keyname = conttext[i].getAttribute("data-method");
			if(keyname == "select") {
				conttext[i].value = "0";
			} else {
				conttext[i].value = "";
			}
			var stint = conttext[i].getAttribute('data-stint');
			stint == 'Wordcount' ? addLoadListener(_Method.Wordcount(_Method, conttext, conttext[i])) : '';
		}
	},
	//列表重组集合方法
	conttext: function(setlist) {
		var _Method = this;
		var region = ID$(_Method.par.Verification);
		var setlist = new Array();
		var sets = _Method.getElementsByClassName(region, "Required");
		var up = NAME$("files"); //上传
		for(var i = 0; i < sets.length + up.length; i++) {
			var name = "";
			for(var u = 0; u < up.length; u++) {
				up[u] != null ? name = up[0].type : '';
			}
			if(up[i] != null) {
				var ele = up[i];
			} else {
				if(!name) {
					var ele = sets[i];
				} else {
					var ele = sets[i - 1];
				}
			}
			setlist.push(ele); //重组集合数组 
		}
		return setlist;
	},
	FormdataMethod: function(data, _Method,stu) {
		//var Arrayset = [];
		var value = '',
			value1 = '';
		var conttext = _Method.conttext(conttext);
		//Arrayset.push(data);
		for(var i = 0; i < conttext.length; i++) {
			var keyvalue = conttext[i].getAttribute("data-key");
			var keyname = conttext[i].getAttribute("data-method");
			var ArrayString = conttext[i].getAttribute("data-Array");
			var checkboxid = conttext[i].getAttribute("data-checkboxid");
			var stint = conttext[i].getAttribute("data-stint");
			var reveal = conttext[i].getAttribute("data-reveal"); //显示模式
			if(data != null) {
				//var Arrayset = Arrayset[0];
				value = data[keyvalue];
				if(value==undefined){
					value=null;
				}
				var Selected = conttext[i].getAttribute("data-Selected");
				if(Selected) {
					if(keyname == "select") {
						var index = conttext[i].options;
						if(index.length > 1) {
							conttext[i].innerHTML = "";
						} else {}
						conttext[i].id = "Competence_sort" + i + "";
						var S = index.length;
						if(S < data.length + 1) {
							for(var s = 0; s < data.length; s++) {
								var loop = data[s];
								var id = data[s].id;
								var name = loop[Selected];
								if(name) {
									conttext[i].innerHTML += "<option value=" + id + ">" + name + "</option>";
									value1 ? value = value1 : value = 0;
								}
							}
						}
						if(_Method.par.Formmode == "submitmode") {
							
						} else if(_Method.par.Formmode == "loadmode") {
							 _Method.par.Loadselect(_Method,conttext,conttext[i],"Competence_sort" + i + "",value);
						};
						for(var op = 0; op < index.length; op++) {
							var mun = conttext[i].options[op].value;
							if(mun == value) {
								conttext[i].value = value;
								//value1 ? value = value1 : value = value;
							}
						}
					}
				}
			}
			if(keyname == "SelectionBox") {
				var mode = conttext[i].getAttribute("data-mode");
				var muster = _Method.getByClass(conttext[i], 'SelectionBox');
				if(_Method.par.Formmode == "submitmode") {
				}else if(_Method.par.Formmode == "loadmode") {
					if(stu!=null){
					conttext[i].innerHTML = ""; //清除内容
					var muster = _Method.getByClass(conttext[i], 'SelectionBox');
					}
				};
				if(muster.length == 0) {
					var uid = '',
					    initialid=0,
						result = ArrayString.split(",");
					checkboxid != null ? uid = checkboxid.split(",") : '';
					var initial=conttext[i].getAttribute("data-initial");//初始值,用于单选复选框中
					if(initial!=null){
						initialid=parseInt(initial);
					}
					var newarr = []; //声明一个数组
					for(var n = 0; n < result.length; n++) {
						if(checkboxid != null) {
							id = uid[n];
						} else {
							id = n+initialid;
						}
						var newgroup = {
							id: id,
							name: result[n]
						};
						newarr.push(newgroup); //从新整合数组 
					};
					for(var r = 0; r < newarr.length; r++) {
						conttext[i].innerHTML += "<label class='SelectionBox'><input name='radio" + i + "' type='" + mode + "' value='" + newarr[r].id + "' class='ace'><span class='lbl Selectstyle"+r+"' data-radio='" + r + "'>" + newarr[r].name + "</span></label>";
					}
					var musterlist=function(values){						
				    	muster = _Method.getByClass(conttext[i], 'SelectionBox');
						//m = values.split(",");
						var un="";
						for(var r = 0; r < muster.length; r++) {
							var d = muster[r].childNodes[0];//当前方法
							var v = muster[r].childNodes[0].value;  //当前的value
							if(v.indexOf(",") != -1){
								un=values.lastIndexOf(v);
							}else{
								un=v;
							}
							var va=values.indexOf(un);
							if(va!=-1){
								d.parentNode.innerHTML = "<input name='radio" + i + "' type='" + mode + "' checked='checked' value='" + newarr[r].id + "' class='ace'><span class='lbl Selectstyle"+r+"' data-radio='"+r+"'>" + newarr[r].name + "</span>";
								var cp=_Method.par.CkPrompt;
								if(cp==true){
									var verify = conttext[1].getAttribute('data-verify');
									if(verify=="verify"){
										var prompts = document.createAttribute("data-name");
										prompts.nodeValue = newarr[r].name;
										conttext[1].setAttributeNode(prompts);
									}else{
										
									}
								}else{
									
								}
							}else{
								d.parentNode.innerHTML = "<input name='radio" + i + "' type='" + mode + "' value='" + newarr[r].id + "' class='ace'><span class='lbl Selectstyle"+r+"' data-radio='"+r+"'>" + newarr[r].name + "</span>";
							};
						};
					};
					if(!value) {
						if(_Method.par.Formmode == "submitmode") {
							values = conttext[i].getAttribute("data-value");
					    	musterlist(values);
						} else if(_Method.par.Formmode == "loadmode") {
							musterlist(value.toString());
						};
					} else {
						var isArray= Array.isArray(value);
						var z='';
						if(isArray==true){
							for(var n = 0; n < value.length; n++) {
							    var values =value[n].id;
							    if(value.length-1==n){
							    	z+=values;
							    }else{
							    	z+=values+',';
							    }
							    
						    }
							musterlist(z);
						}else{
							values = value;
							musterlist(values);
						}
					}
				}
			} else if(keyname == "time") {
				var format = conttext[i].getAttribute("data-time");
				var dateTime = _Method.formatDate(format, value);
				conttext[i].innerHTML = dateTime;

			} else {
				if(reveal == "html") {
					if(stu!=null){
						if(value!=null){
							conttext[i].innerHTML = value;
						}else{
							conttext[i].innerHTML="无";	
						}
                    }else{
                    	var con=conttext[i].value;
                    	con==null?conttext[i].innerHTML = value:'';
                    }
				} else if(reveal == "value") {
                   if(stu!=null){
                   	    conttext[i].value = value;
                    }else{
                    	var con=conttext[i].value;
                    	con==null?conttext[i].value = value:'';
                    }
				}
			};
			if(stint) {
				addLoadListener(_Method.Wordcount(_Method, conttext));
			}
			if(keyvalue!=null){
				if(_Method.par.Mixedkey==true){
					var pages = document.createAttribute("data-key");
				    pages.nodeValue ="key-"+_Method.stringTonum(keyvalue);
				    conttext[i].setAttributeNode(pages);
				}
			}
		}
		return false;
	},
	//时间戳转换
	formatDate: function(format, date) {
		if(typeof date === "string") {
			var mts = date.match(/(\/Date(\d+)\/)/);
			if(mts && mts.length >= 3) {
				date = parseInt(mts[2]);
			}
		}
		date = new Date(parseInt(date * 1000));
		if(!date || date.toUTCString() == "Invalid Date") {
			return "";
		}
		var map = {
			"M": date.getMonth() + 1, //月份
			"d": date.getDate(), //日
			"h": date.getHours(), //小时
			"m": date.getMinutes(), //分
			"s": date.getSeconds(), //秒
			"q": Math.floor((date.getMonth() + 3) / 3), //季度
			"S": date.getMilliseconds() //毫秒
		};
		format = format.replace(/([yMdhmsqS])+/g, function(all, t) {
			var v = map[t];
			if(v !== undefined) {
				if(all.length > 1) {
					v = '0' + v;
					v = v.substr(v.length - 2);
				}
				return v;
			} else if(t === 'y') {
				return(date.getFullYear() + '').substr(4 - all.length);
			}
			return all;
		});
		return format;
	},
	//一个提示方法pc端
	newprompt: function(name, Hints, _Method, obj) {
		var mobile_flag = _Method.isMobile(mobile_flag);
		var prompt = obj.parentNode.getElementsByTagName('span')[0];
		var newspan = LABEL$("span");
		if(mobile_flag) {
			if(!prompt) {
				_Method.removeClass(obj.parentNode.appendChild(newspan), "prompt iconfont");
				obj.parentNode.appendChild(newspan).className = "prompt mobile-prompt";
				newspan.innerHTML = Hints + name;
				return false;
			} else {
				prompt.innerHTML = Hints + name;
			}
		} else {
			if(!prompt) {
				obj.parentNode.appendChild(newspan).className = "prompt iconfont";
				newspan.innerHTML = _Method.par.Icon + Hints + name;
				return false;
			} else {
				prompt.innerHTML = _Method.par.Icon + Hints + name;
			}
		}
	},
	//清除提示信息
	prompthtml: function(obj) {
		var prompt = obj.parentNode.getElementsByTagName('span')[0];
		if(prompt) {
			var prompthtml = obj.parentNode.removeChild(prompt);
		}
		return prompthtml;
	},
	//设置一个提示框，编辑提示框，texts为提示文本 ，time为显示时间秒单位
	PromptBox: function(texts, time, status) {
		var _this = this;
		var b = document.body.querySelector(".box_Bullet");
		if(!b) {
			var box = document.createElement("div");
			document.body.appendChild(box).className = "box_Bullet";
			var boxcss = document.querySelector(".box_Bullet");
			var winWidth = window.innerWidth;
			document.body.appendChild(box).innerHTML = texts;
			var wblank = winWidth - boxcss.offsetWidth;
			box.style.cssText = "width:" + boxcss.offsetWidth + "px" + "; left:" + (wblank / 2) + "px" + ";" +
				"margin-top:" + (-boxcss.offsetHeight / 2) + "px";

			var int = setInterval(function() {
				time--;
				_this.endclearInterval(time, box, int);
			}, 1000);

		} else if(status == true) {
			document.body.removeChild(b);
			return;
		}
	},
	endclearInterval: function(time, box, int) {
		time > 0 ? time-- : clearInterval(int);
		if(time == 0) {
			clearInterval(int);
			document.body.removeChild(box);
			return;
		}
	},
	//判断方法
	verificationMethod: function(region, conttext, subname, _Method, event) {
		var mobile_flag = _Method.isMobile(mobile_flag);
		var setvalue = [];
		mun = 0;
		for(var i = 0; i < conttext.length; i++) {
			var verify = conttext[i].getAttribute('data-verify');
			var textname = "不能为空！";
			//if(verify === "verify") {
			var obj = conttext[i];
			var Hints = conttext[i].getAttribute('data-name');
			var promptname = conttext[i].getAttribute('data-prompt');
			var mode = conttext[i].getAttribute('data-mode');
			var selects = ID$("Competence_sort" + i + "");
			var index = conttext[i].selectedIndex; // 选中索引
			if(index) {
				var selectname = conttext[i].options[index].value;
			}
			if(conttext[i].value == "") {
				if(verify == "verify") {
					var eventname = event.type;
					_Method.PromptModeMethod(conttext[i], _Method, eventname);
					_Method.newprompt(textname, Hints, _Method, obj);
					setvalue.push(i);
				}
			} else if(conttext[i] == selects) {
				var selectname = conttext[i].options[index].value;
				if(selectname == "0") {
					if(verify == "verify") {
						_Method.newprompt(textname, Hints, _Method, selects);
						setvalue.push(i);
					}
				} else {
					_Method.prompthtml(selects);
				}
			}
			mun++;
			//}
			var content = conttext[i].value;
			if(content != "") {
				var Editmode = _Method.par.Editmode;
				if(mode == Editmode) {
					_Method.prompthtml(obj);
				} else {
					if(conttext[i] != selects) {
						_Method.formatmethod(conttext, Hints, _Method, obj, promptname, verify);
					}
				}
			}
		}
		_Method.submitoperate(setvalue, conttext, _Method, mun);
	},
	//格式验证方法
	formatmethod: function(conttext, Hints, _Method, obj, promptname, verify) {
		if(promptname != null) {
			if(promptname == "phone") {
				var expression = /^[1][3,4,5,7,8][0-9]{9}$/;
			} else if(promptname == "mailbox") {
				var expression = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
			} else if(promptname == "password") {
				var expression = /^[a-zA-Z]\w{5,17}$/;
			} else if(promptname == "text_content") {
				var expression = /^[A-Za-z0-9]+$/;
			}
		}
		var v = obj.value;
		if(expression != null) {
			if(promptname == "password") {
				if(v != "") {
					var V = v.length;
					if(V < _Method.par.Passwordlength) {
						var textname = "长度不能小于" + _Method.par.Passwordlength + "位数，请从新输入。";
						obj.value = "";
						_Method.newprompt(textname, Hints, _Method, obj);
						return false
					} else if(expression.test(v)) {
						var textname = "不能只包括数字或字母。";
						_Method.newprompt(textname, Hints, _Method, obj);
						return false
					} else {
						var textname = "",
							Hints = "";
						_Method.newprompt(textname, Hints, _Method, obj);
						return false
					}
				};
			}
		}
		if(promptname == "confirm") {
			for(var i = 0; i < conttext.length; i++) {
				var format = conttext[i].getAttribute('data-prompt');
				if(format == "password") {
					var zhi = conttext[i].value;
				}
			}
			if(v != "") {
				if(zhi != v) {
					var textname = "不一致,请从新输入。";
					//obj.value="";
					_Method.newprompt(textname, Hints, _Method, obj);
					return false;
				} else {
					_Method.prompthtml(obj);
				}
			}
		} else {
			var textname = "",
				Hints = "";
			if(verify === "verify") {
				_Method.newprompt(textname, Hints, _Method, obj);
			}
			return false
		}
	},
	submitoperate: function(setvalue, conttext, _Method, mun) {
		if(setvalue.length == 0) {
			var formData = "";
			var newarr = []; //声明一个数组
			var newgroup = {};
			for(var i = 0; i < conttext.length; i++) {
				var keyvalue = conttext[i].getAttribute("data-key");
				var keypassword = conttext[i].getAttribute("data-value");
				var datatype = conttext[i].getAttribute("data-type");
				var verupload = conttext[i].type;
				var v = conttext[i].value;
				var muster = _Method.getByClass(conttext[i], 'SelectionBox');
				newgroup[keyvalue] = '';
				if(keyvalue != null) {
					if(muster != 0) {
						var mode = conttext[i].getAttribute("data-mode");
						if(mode == 'radio') {
							for(var c = 0; c < muster.length; c++) {
								var checkedname = NAME$("radio" + i + "")[c];
								if(checkedname.checked == true) {
									var v = NAME$("radio" + i + "")[c].value;
								}
							}
						} else if(mode == 'checkbox') {
							var checkboxArray = []; //声明一个数组
							var ArrayString = conttext[i].getAttribute("data-Array");
							var result = ArrayString.split(",");
							for(var c = 0; c < muster.length; c++) {
								var checkedname = NAME$("radio" + i + "")[c];
								if(checkedname.checked == true) {
									var x = NAME$("radio" + i + "")[c].value;
									var newcheckbox = {
										id: x,
										name: result[c]
									};
									checkboxArray.push(newcheckbox); //从新整合数组
								}
							}
							var v = JSON.stringify(checkboxArray);
						}
					}
					if(keypassword == "password") {
						var base = _Method.par.Transform;
						if(base == true) {
							formData += keyvalue + "=" + _Method.binb2b64(v) + "&";
							newgroup[keyvalue] += _Method.binb2b64(v);
						} else if(base == false) {
							formData += keyvalue + "=" + v + "&";
							newgroup[keyvalue] += v;
						}
					} else if(verupload == "file") {
						if(conttext[i].files[0]) {
							v = conttext[i].files[0].name;
							formData += keyvalue + "=" + v + "&";
							newgroup[keyvalue] += v;

						} else {
							newgroup[keyvalue] += "";
						}

					} else {
						formData += keyvalue + "=" + v + "&";
						newgroup[keyvalue] += v;
					}
				} else {
					newgroup[keyvalue] += v;
				}
			}

			newarr.push(newgroup); //从新整合数组
			_Method.par.SubmitMethod(_Method, formData, newarr);
		} else {
			return false
		}
	},
	//文本框字数限制设置
	Wordcount: function(_Method, conttext, e) {
		for(var i = 0; i < conttext.length; i++) {
			var stint = conttext[i].getAttribute('data-stint');
			if(stint == "Wordcount") {
				var obj = conttext[i];
				var S = obj.value.length;
				var span = LABEL$("span");
				var sl = conttext[i].getAttribute('size');
				if(sl) {
					var size = parseInt(conttext[i].getAttribute('size'));
				} else {
					var size = 20;
				}
				var classname = _Method.getByClass(obj.parentNode, 'word_count')[0];
				if(classname) {
					if(S == 0) {
						classname.innerHTML = "剩余字数 :<em class='number'>" + size + "</em>字符";
					}
					var prompt = classname.getElementsByTagName('em')[0];
				} else {
					obj.parentNode.appendChild(span).className = "word_count";
					span.innerHTML = "剩余字数 :<em class='number'>" + size + "</em>字符";
					var prompt = span.getElementsByTagName('em')[0];
				}

				obj.onkeyup = function(event) {
					_Method.Wordonkeyup(obj, size, _Method, prompt);
				}
				obj.onblur = function(event) {
					var expression = /^[A-Za-z0-9]+$/;
					if(expression.test(obj.value)) {
						var Hints = obj.getAttribute('data-name');
						var textname = "文本内容不能只包括数字字母。";
						_Method.newprompt(textname, Hints, _Method, obj);
						//_Method.PromptBox("文本内容不能只包括数字字母", 2);
					}
				};
				!e ? _Method.Wordonkeyup(obj, size, _Method, prompt) : '';
			}
		}
	},
	Wordonkeyup: function(obj, size, _Method, prompt) {
		if(obj.value.length > size) {
			_Method.PromptBox("您输入的字数超过限制", 2);
			obj.value = obj.value.substring(0, size);
			prompt.innerHTML = 0;
			return false;
		} else {
			var curr = size - obj.value.length; //减去 当前输入的	
			prompt.innerHTML = curr.toString();
			return true;
		}
	}
}