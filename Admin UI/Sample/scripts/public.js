/** 启动时执行
 */
$(function() {
	//对于有限定长度的字段执行keyup事件
	$(".iLimitLength").unbind("keyup").keyup(function (event) {
		if ($(this).val().length > 30) {
			$(this).val($(this).val().substring(0, 30));
		}
	});

	//给新建账户对话框添加圆角外框
	addCorner();

	//validate生成对应的标签
	$.metadata.setType("attr", "validate");
});

/** 给新建账户对话框添加圆角外框
 */
function addCorner() {
	$('.addBox').each(function(index) {
		$(this).wrap('<div id="' + this.id + 'boxBg" class="boxBg" style="display:none;" />');
		$(this).before('<div class="boxBg1"></div><div class="boxBg2"></div><div class="boxBg3"></div><div class="boxBg4"></div>');
		noBottom = "";
		if ($(this).hasClass("noBottom")) noBottom = "NB";
		boxAfter = '<div class="boxBg6"></div>'
			+ '<div class="boxBg7' + noBottom + '"></div>'
			+ '<div class="boxBg8' + noBottom + '">'
			+ '<ul class="oplist">'
			+ '</ul>'
			+ '</div>'
			+ '<div class="boxBg9' + noBottom + '"></div><div class="boxClose" onclick="cancelAdd(\'' + this.id + '\');"></div>';
		$(this).after(boxAfter);
		$(this).boxwidth($(this).width());
	});
}

function customizeRadio() {
	$(".radio").each(function() {
	    $(this).children("li").click(function () {
			$(this).siblings("li").removeClass("cur");
			$(this).removeClass("curnone");
			$(this).addClass("cur");
			$(this).parent("ul").attr("status", $(this).index());
		});	        
	});
} 

/** 点击某选项
 * @param sName 选项id
 * @param html 整体div
 * @param list 列表div
 * @param option 选项div  
 */ 
function optionClick(sName, html, list, option) {
	option.mouseover(function () {
		$(this).css("background", "#E1EDF5");
	}).mouseout(function () {
		$(this).css("background", "#F7FBFE");
	}).click(function (e) {
		/*try{
		 	var aaa= $(this).html();
			//alert("aaa" + aaa);
		}catch(e){
			alert(e.message);
		} */
        e.stopPropagation();
		html.children("input[name='" + sName + "']").val($(this).attr("val")).trigger("change");
		if($(this).attr("mhvalue")) {
			html.children(".label").html($(this).attr("mhvalue"));
		} else {
			html.children(".label").html($(this).html());
		/*	try{
				html.children(".label").html($(this).html());
			}catch(e){
				alert(e.message);
			}*/
		}

		switch (sName) {
			case "sAccount":
				//点击账户时需要修改下方的币种显示
				html.parents(".dRDetail").find(".currencyName").html(getCurrencyDesc($("#accountList div[bid='" + $(this).attr("val") + "']").attr("currency")) + "：");
				if (currentBillType == 2)
					getIamount2Status();
				break;

			case "sAccount2":
				var subAccountId = $("#sAccount2").val();
				getIamount2Status();
				break;
				
			case "bank":
				if ($(this).html() == "支付宝") {
					$("#newsa4 input[name='currency']").siblings(".list").children(".option[val!='1']").hide();
					selectOption("#newsa4", "currency", 1);
				} else {
					$("#newsa4 input[name='currency']").siblings(".list").children(".option").show();
				}
				break;
				
			default:
				break;
		}
		list.hide();
        html.data("state", "close");
	});
}

/** 添加一个选项
 * @param divName 图层编号
 * @param selectName 选择框名称
 * @param optionId 选中项编号 
 * @param optionName 选中项名称
 * @param customTag 自定义标签
 * @param customClass 自定义样式 
 * @param itemPosition 要插入点的位置   
 */ 
function addOption(divName, selectName, optionId, optionName, customTag, customClass, itemPosition) {
	if (customClass == undefined) customClass = "";
	if (customTag == undefined) customTag = "";
	html = $(divName + " input[name='" + selectName + "']").parent();
	list = $(divName + " input[name='" + selectName + "']").siblings(".list");
	option = '<div class="option span-6 last' + customClass + '" val="' + optionId + '" ' + customTag + ' style="background: none repeat scroll 0% 0% rgb(247, 251, 254);">' + optionName + '</div>';
	option = $(option);
	if (itemPosition == undefined) {
		list.append(option);
	} else {
		itemPosition.after(option);
	}
	optionClick(selectName, html, list, option);
}

/** 编辑一个选项
 * @param divName 图层编号
 * @param selectName 选择框名称
 * @param optionId 选中项编号 
 * @param newOptionName 选中项新名称 
 * @param customTag 自定义标签
 * @param customClass 自定义样式 
 * @param itemPosition 要插入点的位置   
 */ 
function editOption(divName, selectName, optionId, newOptionName, customTag, customClass, itemPosition) {
	if (customClass == undefined) customClass = "";
	if (customTag == undefined) customTag = "";
	html = $(divName + " input[name='" + selectName + "']").parent();
	list = $(divName + " input[name='" + selectName + "']").siblings(".list");
	divLabel = $(divName + " input[name='" + selectName + "']").siblings(".label");
	option = '<div class="option span-6 last' + customClass + '" val="' + optionId + '" ' + customTag + ' style="background: none repeat scroll 0% 0% rgb(247, 251, 254);">' + newOptionName + '</div>';
	option = $(option);
	oldOptionName = list.children(".option[val='" + optionId + "']").html();
	if (itemPosition == undefined) {
		list.children(".option[val='" + optionId + "']").replaceWith(option);
	} else {
		list.children(".option[val='" + optionId + "']").remove();
		itemPosition.after(option);
	}
	optionClick(selectName, html, list, option);
	if (divLabel.html() == oldOptionName) {
		divLabel.html(newOptionName);
	}
}

/** 选择某选项
 * @param divName 图层编号
 * @param selectName 选择框名称
 * @param id 选中项编号 
 */ 
function selectOption(divName, selectName, id) {
	divList = $(divName + " input[name='" + selectName + "']").siblings(".list");
	$(divName + " input[name='" + selectName + "']").parent().data("state", "open");
	divList.children(".option[val='" + id + "']").click();
}

/** 定制下拉框
 * @param divId 指定哪个div下面的select需要被定制
 */
function customizeSelect(divId) {
	var openSelect = null;
	if (!divId) divId = "";
	$(divId + " select").each( function() {
		var i = $(this);
		var list = [];
		var label = "";
		var firstElement = "";
		i.children().each( function() {
			var tagName = String($(this)[0].tagName).toUpperCase();
			if(tagName == "OPTION") {
				list.push($(this));
				if (firstElement == "") firstElement = $(this).val();
			} else if(tagName == "OPTGROUP") {
				if (firstElement == "") firstElement = $(this).children()[0].value;
				var subList = {
					label:$(this).attr("label"),
					img:$(this).attr("img"),
					children:$(this).children()
				};
				list.push(subList);
			}
		});
		var sName = $(this).attr("name");

		//定义选定时的value
		var selectedValue = "";
		var html = "<div class=\"select span-5\" >";
		html += "<input type=\"hidden\" id=\"" + sName + "\" name=\"" + sName + "\" value=\"" + firstElement + "\" />";
		html += "<div class=\"label\"></div>";
		html += "<div class=\"button\"></div>";
		//html += "<div class=\"button\" ><img src=\"../images/selectarrow.gif\" /></div>";
		html += "<div class=\"list hide\" >";
		for (var node in list) {
			if (list[node].label != undefined) {
				var img = "";
				if (list[node].img != undefined) {
					img = "<img src=\"" + list[node].img + "\" />";
				}
				html += "<div class=\"optgroup span-6 last\" >" + img + list[node].label + "</div>";
				list[node].children.each(function() {
					var img = "";
					if($(this).attr("img")) {
						img = "<img src=\"" + $(this).attr("img") + "\" />";
					}
					var selected = "";
					if($(this).attr("selected")) {						
						selected = "selected=\"selected\"";
						//赋值给变量
						if(list[node].attr("mhvalue")) {
							label = img + list[node].attr("mhvalue");
						} else{
							label = img + $(this).html();
						}
						
					}
					html+= "<div class=\"option span-6 last\" " + selected + " val=\"" + $(this).val() + "\">" + img + $(this).html() + "</div>";
				});
			} else {
				var img = "";
				if(list[node].attr("img") != undefined) {
					img = "<img src=\"" + list[node].attr("img") + "\" />";
				}
				var selected = "";
				if (list[node].attr("selected")) {
					selected = "selected=\"selected\"";
					//赋值给变量
					selectedValue = $(this).val();
					if(list[node].attr("mhvalue")) {
						label = img + list[node].attr("mhvalue");
					}else {
						label = img + list[node].html();
					}
				}
				var mhvalue = "";
				var catLevel = "";
				if (list[node].attr("mhvalue")) {
					mhvalue = " mhvalue=\"" + list[node].attr("mhvalue") + "\"";
					if (list[node].attr("mhvalue").indexOf(":") == -1) {
						catLevel = " firstCat";
					} else {
						catLevel = " secondCat";
					}
				}
				var cattype = "";
				if (list[node].attr("cattype")) {
					cattype = " cattype=\"" + list[node].attr("cattype") + "\"";
				}
				var parentclass = "";
				if (list[node].attr("parentclass")) {
					parentclass = " parentclass=\"" + list[node].attr("parentclass") + "\"";
				}
				html += "<div class=\"option span-6 last" + catLevel + "\" " + selected + mhvalue + cattype + parentclass + " val=\"" + list[node].val() + "\">" + img + list[node].html() + "</div>";
			}
		}
		html += "</div>";
		html += "</div>";
		html = $(html);
		i.replaceWith(html);
		
		//将选定的项赋值给需求
	    html.children("input[name='" + sName + "']").val(selectedValue);
		html.data("state", "close");
		var list = html.children(".list");
		list.hide();
		if(!label) {
			label = list.children().first().html();
		}
		list.children(".option").last().addClass("bottom");
		html.children(".label").html(label);
		
		var curOption = 1;
		var curChild;

		list.unbind('keydown').keydown(function (event) {
			if (event.keyCode == 9) {
				//TAB键
				html.focus();
			} else {
				if (event.keyCode == 38) {
					//上键
					if (curOption > 1) curOption --;
				} else if (event.keyCode == 40) {
					//下键
					if (curOption < list.children(".option").length) curOption ++;
				}
				curChild = list.children(".option:nth-child(" + curOption + ")");
				list.children(".option").css("background", "#F7FBFE");
				curChild.css("background", "#E1EDF5");
				html.children("input[name='" + sName + "']").val(curChild.attr("val"));
				if(curChild.attr("mhvalue")) {
					html.children(".label").html(curChild.attr("mhvalue"));
				} else {
					html.children(".label").html(curChild.html());
				}
			}
		});

   		list.unbind('keypress').keypress(function (event) {
   			if (event.keyCode == 13) {
				event.preventDefault();
				list.hide();
				html.data("state", "close");
   			}
   		});
   		
		list.children(".option").mouseover(function () {
			$(this).css("background", "#E1EDF5");
		}).mouseout(function () {
			$(this).css("background", "#F7FBFE");
		});
		list.children(".option").each(function () {
			optionClick(sName, html, list, $(this));
		});
		
		//焦点切换时响应
		html.focusin(function() {
			if ($(this).data("state") == "close") {
				$(".select").css("z-index", 500);
				$(this).css("z-index", 2000);
				$(this).closest(".dRDRField").css("z-index", 2000);
				function show() {
					list.show();
					if (html.offset().top + list.height() + 26 > resHeight) {
						upHeight = 0 - list.height() - 5;
						list.css("top", upHeight + "px");
					} else {
						list.css("top", "26px");
					}
					//list.focus();
					html.data("state", "open");
				}
				setTimeout(show, 125);
			}
		});

		html.click(function(event) {
			if ($(this).data("state") == "close") {
				$(this).focusin();
			} else {
				$(this).focusout();
			}
		});
		
		html.focusout(function(event) {
			if ($(this).data("state") == "open") {
			    $(".select").css("z-index", 0);
				$(this).css("z-index", 0);
				$(this).closest(".dRDRField").css("z-index", 0);
				list.hide();
				html.data("state", "close");
			}
		});  

        $(document.body).click(function (){
            if (html.data("state") == "open") {
				html.focusout();
			} 
        });

	});
}

/** 反解select框
 */
function decustomizeSelect(dialogName) {
	$(dialogName + " .select").each(function () {
		selectName = $(this).children("input").attr("id");
		content = "<select name='" + selectName + "'>";
		$(this).find(".option").each(function() {
			if (selectName == "classout") {
				content += "<option value='" + $(this).attr("val") + "' cattype='" + $(this).attr("cattype") + "'>" + $(this).html() + "</option>";
			} else if (selectName == "category") {
				content += "<option value='" + $(this).attr("val") + "' cattype='" + $(this).attr("cattype") + "' parentclass='" + $(this).attr("parentclass") + "' mhvalue='" + $(this).attr("mhvalue") + "'>" + $(this).html() + "</option>";
			} else {
				content += "<option value='" + $(this).attr("val") + "'>" + $(this).html() + "</option>";
			}
		});
		content += "</select>"
		$(this).replaceWith(content);
	});
}

/** 调整外框宽度以显示周边圆角
 */
jQuery.fn.boxwidth = function (boxContentWidth) {
	this.siblings(".boxBg2").width(boxContentWidth - 2);
	this.width(boxContentWidth);
	this.siblings(".boxBg8").width(boxContentWidth);
	this.siblings(".boxBg8NB").width(boxContentWidth);
	this.parent().width(boxContentWidth + 36);
	return this;
}

/** 调整外框高度以显示周边圆角
 */
jQuery.fn.boxheight = function (boxContentHeight) {
	this.siblings(".boxBg4").height(boxContentHeight);
	this.height(boxContentHeight);
	this.siblings(".boxBg6").height(boxContentHeight);
	this.parent().height(boxContentHeight+84);
	return this;
}

/** 使某图层居于屏幕正中
 */
jQuery.fn.center = function () {
	this.css("position","absolute");
	this.css("top", (resHeight - this.height()) / 2 + $(window).scrollTop() + "px");
	this.css("left", (resWidth - this.width()) / 2 + $(window).scrollLeft() + "px");
	return this;
}

/** 入库前的字符串处理
 */
function replaceSQLStr(str){
	//sql保留字替换
	return str=str.replace(/\'/g,"\'\'");
}

/** 格式化数字
 * @param srcstr 数字
 * @param nafterdot 保留小数点后多少位
 * @return 格式化后的数字字符串  
 */
function formatnumber(srcstr, nafterdot) {
　　var srcstr,nafterdot;
　　var resultstr,nten;
　　srcstr = ""+srcstr+"";
　　strlen = srcstr.length;
　　dotpos = srcstr.indexOf(".",0);
　　if (dotpos == -1){
　　　　resultstr = srcstr+".";
　　　　for (i=0;i<nafterdot;i++){
　　　　　　resultstr = resultstr+"0";
　　　　}
　　　　return resultstr;
　　} else {
　　　　if ((strlen - dotpos - 1) >= nafterdot){
　　　　　　nafter = dotpos + nafterdot + 1;
　　　　　　nten =1;
　　　　　　for(j=0;j<nafterdot;j++){
　　　　　　　　nten = nten*10;
　　　　　　}
　　　　　　resultstr = Math.round(parseFloat(srcstr)*nten)/nten;
　　　　　　return resultstr;
　　　　} else {
　　　　　　resultstr = srcstr;
　　　　　　for (i=0;i<(nafterdot - strlen + dotpos + 1);i++){
　　　　　　　　resultstr = resultstr+"0";
　　　　　　}
　　　　　　return resultstr;
　　　　}
　　}
}

/** 取得汉字的拼音
 * @param str
 * @param sp
 */    
function getGB2312Spell(str, sp) {
    var i, c, t, p, ret = "";  
    if (sp == null) sp = "";  
    for (i=0; i<str.length; i++) {
        if(str.charCodeAt(i) >= 0x4e00) {  
            p = strGB.indexOf(str.charAt(i));  
            if (p>-1 && p<3755) {  
                for (t=qswhSpell.length-1; t>0; t=t-2) {
					if (qswhSpell[t]<=p)
						break;
				}  
                if (t>0) ret += "|1|" + qswhSpell[t-1] + sp;  
            }  
        } else {
			ret += "|0|" + str[i];
		}  
    }  
    return ret.substr(0, ret.length-sp.length);  
}

var qswhSpell = ["a",0,"ai",2,"an",15,"ang",24,"ao",27,"ba",36,"bai",54,"ban",62,"bang",77,"bao",89,"bei",106,"ben",121,"beng",125,"bi",131,"bian",155,"biao",167,"bie",171,"bin",175,"bing",181,"bo",190,"bu",211,"ca",220,"cai",221,"can",232,"cang",239,"cao",244,"ce",249,"ceng",254,"cha",256,"chai",267,"chan",270,"chang",280,"chao",293,"che",302,"chen",308,"cheng",318,"chi",333,"chong",349,"chou",354,"chu",366,"chuai",382,"chuan",383,"chuang",390,"chui",396,"chun",401,"chuo",408,"ci",410,"cong",422,"cou",428,"cu",429,"cuan",433,"cui",436,"cun",444,"cuo",447,"da",453,"dai",459,"dan",471,"dang",486,"dao",491,"de",503,"deng",506,"di",513,"dian",532,"diao",548,"die",557,"ding",564,"diu",573,"dong",574,"dou",584,"du",591,"duan",606,"dui",612,"dun",616,"duo",625,"e",637,"en",650,"er",651,"fa",659,"fan",667,"fang",684,"fei",695,"fen",707,"feng",722,"fo",737,"fou",738,"fu",739,"ga",784,"gai",786,"gan",792,"gang",803,"gao",812,"ge",822,"gei",839,"gen",840,"geng",842,"gong",849,"gou",864,"gu",873,"gua",891,"guai",897,"guan",900,"guang",911,"gui",914,"gun",930,"guo",933,"ha",939,"hai",940,"han",947,"hang",966,"hao",969,"he",978,"hei",996,"hen",998,"heng",1002,"hong",1007,"hou",1016,"hu",1023,"hua",1041,"huai",1050,"huan",1055,"huang",1069,"hui",1083,"hun",1104,"huo",1110,"ji",1120,"jia",1173,"jian",1190,"jiang",1230,"jiao",1243,"jie",1271,"jin",1298,"jing",1318,"jiong",1343,"jiu",1345,"ju",1362,"juan",1387,"jue",1394,"jun",1404,"ka",1415,"kai",1419,"kan",1424,"kang",1430,"kao",1437,"ke",1441,"ken",1456,"keng",1460,"kong",1462,"kou",1466,"ku",1470,"kua",1477,"kuai",1482,"kuan",1486,"kuang",1488,"kui",1496,"kun",1507,"kuo",1511,"la",1515,"lai",1522,"lan",1525,"lang",1540,"lao",1547,"le",1556,"lei",1558,"leng",1569,"li",1572,"lia",1606,"lian",1607,"liang",1621,"liao",1632,"lie",1645,"lin",1650,"ling",1662,"liu",1676,"long",1687,"lou",1696,"lu",1702,"lv",1722,"luan",1736,"lue",1742,"lun",1744,"luo",1751,"ma",1763,"mai",1772,"man",1778,"mang",1787,"mao",1793,"me",1805,"mei",1806,"men",1822,"meng",1825,"mi",1833,"mian",1847,"miao",1856,"mie",1864,"min",1866,"ming",1872,"miu",1878,"mo",1879,"mou",1896,"mu",1899,"na",1914,"nai",1921,"nan",1926,"nang",1929,"nao",1930,"ne",1935,"nei",1936,"nen",1938,"neng",1939,"ni",1940,"nian",1951,"niang",1958,"niao",1960,"nie",1962,"nin",1969,"ning",1970,"niu",1976,"nong",1980,"nu",1984,"nv",1987,"nuan",1988,"nue",1989,"nuo",1991,"o",1995,"ou",1996,"pa",2003,"pai",2009,"pan",2015,"pang",2023,"pao",2028,"pei",2035,"pen",2044,"peng",2046,"pi",2060,"pian",2077,"piao",2081,"pie",2085,"pin",2087,"ping",2092,"po",2101,"pu",2110,"qi",2125,"qia",2161,"qian",2164,"qiang",2186,"qiao",2194,"qie",2209,"qin",2214,"qing",2225,"qiong",2238,"qiu",2240,"qu",2248,"quan",2261,"que",2272,"qun",2280,"ran",2282,"rang",2286,"rao",2291,"re",2294,"ren",2296,"reng",2306,"ri",2308,"rong",2309,"rou",2319,"ru",2322,"ruan",2332,"rui",2334,"run",2337,"ruo",2339,"sa",2341,"sai",2344,"san",2348,"sang",2352,"sao",2355,"se",2359,"sen",2362,"seng",2363,"sha",2364,"shai",2373,"shan",2375,"shang",2391,"shao",2399,"she",2410,"shen",2422,"sheng",2438,"shi",2449,"shou",2496,"shu",2506,"shua",2539,"shuai",2541,"shuan",2545,"shuang",2547,"shui",2550,"shun",2554,"shuo",2558,"si",2562,"song",2578,"sou",2586,"su",2589,"suan",2602,"sui",2605,"sun",2616,"suo",2619,"ta",2627,"tai",2636,"tan",2645,"tang",2663,"tao",2676,"te",2687,"teng",2688,"ti",2692,"tian",2707,"tiao",2715,"tie",2720,"ting",2723,"tong",2733,"tou",2746,"tu",2750,"tuan",2761,"tui",2763,"tun",2769,"tuo",2772,"wa",2783,"wai",2790,"wan",2792,"wang",2809,"wei",2819,"wen",2852,"weng",2862,"wo",2865,"wu",2874,"xi",2903,"xia",2938,"xian",2951,"xiang",2977,"xiao",2997,"xie",3015,"xin",3036,"xing",3046,"xiong",3061,"xiu",3068,"xu",3077,"xuan",3096,"xue",3106,"xun",3112,"ya",3126,"yan",3142,"yang",3175,"yao",3192,"ye",3207,"yi",3222,"yin",3275,"ying",3291,"yo",3309,"yong",3310,"you",3325,"yu",3346,"yuan",3390,"yue",3410,"yun",3420,"za",3432,"zai",3435,"zan",3442,"zang",3446,"zao",3449,"ze",3463,"zei",3467,"zen",3468,"zeng",3469,"zha",3473,"zhai",3487,"zhan",3493,"zhang",3510,"zhao",3525,"zhe",3535,"zhen",3545,"zheng",3561,"zhi",3576,"zhong",3619,"zhou",3630,"zhu",3644,"zhua",3670,"zhuai",3672,"zhuan",3673,"zhuang",3679,"zhui",3686,"zhun",3692,"zhuo",3694,"zi",3705,"zong",3720,"zou",3727,"zu",3731,"zuan",3739,"zui",3741,"zun",3745,"zuo",3747];
var strGB = "啊阿埃挨哎唉哀皑癌蔼矮艾碍爱隘鞍氨安俺按暗岸胺案肮昂盎凹敖熬翱袄傲奥懊澳芭捌扒叭吧笆八疤巴拔跋靶把耙坝霸罢爸白柏百摆佰败拜稗斑班搬扳般颁板版扮拌伴瓣半办绊邦帮梆榜膀绑棒磅蚌镑傍谤苞胞包褒剥薄雹保堡饱宝抱报暴豹鲍爆杯碑悲卑北辈背贝钡倍狈备惫焙被奔苯本笨崩绷甭泵蹦迸逼鼻比鄙笔彼碧蓖蔽毕毙毖币庇痹闭敝弊必辟壁臂避陛鞭边编贬扁便变卞辨辩辫遍标彪膘表鳖憋别瘪彬斌濒滨宾摈兵冰柄丙秉饼炳病并玻菠播拨钵波博勃搏铂箔伯帛舶脖膊渤泊驳捕卜哺补埠不布步簿部怖擦猜裁材才财睬踩采彩菜蔡餐参蚕残惭惨灿苍舱仓沧藏操糙槽曹草厕策侧册测层蹭插叉茬茶查碴搽察岔差诧拆柴豺搀掺蝉馋谗缠铲产阐颤昌猖场尝常长偿肠厂敞畅唱倡超抄钞朝嘲潮巢吵炒车扯撤掣彻澈郴臣辰尘晨忱沉陈趁衬撑称城橙成呈乘程惩澄诚承逞骋秤吃痴持匙池迟弛驰耻齿侈尺赤翅斥炽充冲虫崇宠抽酬畴踌稠愁筹仇绸瞅丑臭初出橱厨躇锄雏滁除楚础储矗搐触处揣川穿椽传船喘串疮窗幢床闯创吹炊捶锤垂春椿醇唇淳纯蠢戳绰疵茨磁雌辞慈瓷词此刺赐次聪葱囱匆从丛凑粗醋簇促蹿篡窜摧崔催脆瘁粹淬翠村存寸磋撮搓措挫错搭达答瘩打大呆歹傣戴带殆代贷袋待逮怠耽担丹单郸掸胆旦氮但惮淡诞弹蛋当挡党荡档刀捣蹈倒岛祷导到稻悼道盗德得的蹬灯登等瞪凳邓堤低滴迪敌笛狄涤翟嫡抵底地蒂第帝弟递缔颠掂滇碘点典靛垫电佃甸店惦奠淀殿碉叼雕凋刁掉吊钓调跌爹碟蝶迭谍叠丁盯叮钉顶鼎锭定订丢东冬董懂动栋侗恫冻洞兜抖斗陡豆逗痘都督毒犊独读堵睹赌杜镀肚度渡妒端短锻段断缎堆兑队对墩吨蹲敦顿囤钝盾遁掇哆多夺垛躲朵跺舵剁惰堕蛾峨鹅俄额讹娥恶厄扼遏鄂饿恩而儿耳尔饵洱二贰发罚筏伐乏阀法珐藩帆番翻樊矾钒繁凡烦反返范贩犯饭泛坊芳方肪房防妨仿访纺放菲非啡飞肥匪诽吠肺废沸费芬酚吩氛分纷坟焚汾粉奋份忿愤粪丰封枫蜂峰锋风疯烽逢冯缝讽奉凤佛否夫敷肤孵扶拂辐幅氟符伏俘服浮涪福袱弗甫抚辅俯釜斧脯腑府腐赴副覆赋复傅付阜父腹负富讣附妇缚咐噶嘎该改概钙盖溉干甘杆柑竿肝赶感秆敢赣冈刚钢缸肛纲岗港杠篙皋高膏羔糕搞镐稿告哥歌搁戈鸽胳疙割革葛格蛤阁隔铬个各给根跟耕更庚羹埂耿梗工攻功恭龚供躬公宫弓巩汞拱贡共钩勾沟苟狗垢构购够辜菇咕箍估沽孤姑鼓古蛊骨谷股故顾固雇刮瓜剐寡挂褂乖拐怪棺关官冠观管馆罐惯灌贯光广逛瑰规圭硅归龟闺轨鬼诡癸桂柜跪贵刽辊滚棍锅郭国果裹过哈骸孩海氦亥害骇酣憨邯韩含涵寒函喊罕翰撼捍旱憾悍焊汗汉夯杭航壕嚎豪毫郝好耗号浩呵喝荷菏核禾和何合盒貉阂河涸赫褐鹤贺嘿黑痕很狠恨哼亨横衡恒轰哄烘虹鸿洪宏弘红喉侯猴吼厚候后呼乎忽瑚壶葫胡蝴狐糊湖弧虎唬护互沪户花哗华猾滑画划化话槐徊怀淮坏欢环桓还缓换患唤痪豢焕涣宦幻荒慌黄磺蝗簧皇凰惶煌晃幌恍谎灰挥辉徽恢蛔回毁悔慧卉惠晦贿秽会烩汇讳诲绘荤昏婚魂浑混豁活伙火获或惑霍货祸击圾基机畸稽积箕肌饥迹激讥鸡姬绩缉吉极棘辑籍集及急疾汲即嫉级挤几脊己蓟技冀季伎祭剂悸济寄寂计记既忌际妓继纪嘉枷夹佳家加荚颊贾甲钾假稼价架驾嫁歼监坚尖笺间煎兼肩艰奸缄茧检柬碱硷拣捡简俭剪减荐槛鉴践贱见键箭件健舰剑饯渐溅涧建僵姜将浆江疆蒋桨奖讲匠酱降蕉椒礁焦胶交郊浇骄娇嚼搅铰矫侥脚狡角饺缴绞剿教酵轿较叫窖揭接皆秸街阶截劫节桔杰捷睫竭洁结解姐戒藉芥界借介疥诫届巾筋斤金今津襟紧锦仅谨进靳晋禁近烬浸尽劲荆兢茎睛晶鲸京惊精粳经井警景颈静境敬镜径痉靖竟竞净炯窘揪究纠玖韭久灸九酒厩救旧臼舅咎就疚鞠拘狙疽居驹菊局咀矩举沮聚拒据巨具距踞锯俱句惧炬剧捐鹃娟倦眷卷绢撅攫抉掘倔爵觉决诀绝均菌钧军君峻俊竣浚郡骏喀咖卡咯开揩楷凯慨刊堪勘坎砍看康慷糠扛抗亢炕考拷烤靠坷苛柯棵磕颗科壳咳可渴克刻客课肯啃垦恳坑吭空恐孔控抠口扣寇枯哭窟苦酷库裤夸垮挎跨胯块筷侩快宽款匡筐狂框矿眶旷况亏盔岿窥葵奎魁傀馈愧溃坤昆捆困括扩廓阔垃拉喇蜡腊辣啦莱来赖蓝婪栏拦篮阑兰澜谰揽览懒缆烂滥琅榔狼廊郎朗浪捞劳牢老佬姥酪烙涝勒乐雷镭蕾磊累儡垒擂肋类泪棱楞冷厘梨犁黎篱狸离漓理李里鲤礼莉荔吏栗丽厉励砾历利傈例俐痢立粒沥隶力璃哩俩联莲连镰廉怜涟帘敛脸链恋炼练粮凉梁粱良两辆量晾亮谅撩聊僚疗燎寥辽潦了撂镣廖料列裂烈劣猎琳林磷霖临邻鳞淋凛赁吝拎玲菱零龄铃伶羚凌灵陵岭领另令溜琉榴硫馏留刘瘤流柳六龙聋咙笼窿隆垄拢陇楼娄搂篓漏陋芦卢颅庐炉掳卤虏鲁麓碌露路赂鹿潞禄录陆戮驴吕铝侣旅履屡缕虑氯律率滤绿峦挛孪滦卵乱掠略抡轮伦仑沦纶论萝螺罗逻锣箩骡裸落洛骆络妈麻玛码蚂马骂嘛吗埋买麦卖迈脉瞒馒蛮满蔓曼慢漫谩芒茫盲氓忙莽猫茅锚毛矛铆卯茂冒帽貌贸么玫枚梅酶霉煤没眉媒镁每美昧寐妹媚门闷们萌蒙檬盟锰猛梦孟眯醚靡糜迷谜弥米秘觅泌蜜密幂棉眠绵冕免勉娩缅面苗描瞄藐秒渺庙妙蔑灭民抿皿敏悯闽明螟鸣铭名命谬摸摹蘑模膜磨摩魔抹末莫墨默沫漠寞陌谋牟某拇牡亩姆母墓暮幕募慕木目睦牧穆拿哪呐钠那娜纳氖乃奶耐奈南男难囊挠脑恼闹淖呢馁内嫩能妮霓倪泥尼拟你匿腻逆溺蔫拈年碾撵捻念娘酿鸟尿捏聂孽啮镊镍涅您柠狞凝宁拧泞牛扭钮纽脓浓农弄奴努怒女暖虐疟挪懦糯诺哦欧鸥殴藕呕偶沤啪趴爬帕怕琶拍排牌徘湃派攀潘盘磐盼畔判叛乓庞旁耪胖抛咆刨炮袍跑泡呸胚培裴赔陪配佩沛喷盆砰抨烹澎彭蓬棚硼篷膨朋鹏捧碰坯砒霹批披劈琵毗啤脾疲皮匹痞僻屁譬篇偏片骗飘漂瓢票撇瞥拼频贫品聘乒坪苹萍平凭瓶评屏坡泼颇婆破魄迫粕剖扑铺仆莆葡菩蒲埔朴圃普浦谱曝瀑期欺栖戚妻七凄漆柒沏其棋奇歧畦崎脐齐旗祈祁骑起岂乞企启契砌器气迄弃汽泣讫掐恰洽牵扦钎铅千迁签仟谦乾黔钱钳前潜遣浅谴堑嵌欠歉枪呛腔羌墙蔷强抢橇锹敲悄桥瞧乔侨巧鞘撬翘峭俏窍切茄且怯窃钦侵亲秦琴勤芹擒禽寝沁青轻氢倾卿清擎晴氰情顷请庆琼穷秋丘邱球求囚酋泅趋区蛆曲躯屈驱渠取娶龋趣去圈颧权醛泉全痊拳犬券劝缺炔瘸却鹊榷确雀裙群然燃冉染瓤壤攘嚷让饶扰绕惹热壬仁人忍韧任认刃妊纫扔仍日戎茸蓉荣融熔溶容绒冗揉柔肉茹蠕儒孺如辱乳汝入褥软阮蕊瑞锐闰润若弱撒洒萨腮鳃塞赛三叁伞散桑嗓丧搔骚扫嫂瑟色涩森僧莎砂杀刹沙纱傻啥煞筛晒珊苫杉山删煽衫闪陕擅赡膳善汕扇缮墒伤商赏晌上尚裳梢捎稍烧芍勺韶少哨邵绍奢赊蛇舌舍赦摄射慑涉社设砷申呻伸身深娠绅神沈审婶甚肾慎渗声生甥牲升绳省盛剩胜圣师失狮施湿诗尸虱十石拾时什食蚀实识史矢使屎驶始式示士世柿事拭誓逝势是嗜噬适仕侍释饰氏市恃室视试收手首守寿授售受瘦兽蔬枢梳殊抒输叔舒淑疏书赎孰熟薯暑曙署蜀黍鼠属术述树束戍竖墅庶数漱恕刷耍摔衰甩帅栓拴霜双爽谁水睡税吮瞬顺舜说硕朔烁斯撕嘶思私司丝死肆寺嗣四伺似饲巳松耸怂颂送宋讼诵搜艘擞嗽苏酥俗素速粟僳塑溯宿诉肃酸蒜算虽隋随绥髓碎岁穗遂隧祟孙损笋蓑梭唆缩琐索锁所塌他它她塔獭挞蹋踏胎苔抬台泰酞太态汰坍摊贪瘫滩坛檀痰潭谭谈坦毯袒碳探叹炭汤塘搪堂棠膛唐糖倘躺淌趟烫掏涛滔绦萄桃逃淘陶讨套特藤腾疼誊梯剔踢锑提题蹄啼体替嚏惕涕剃屉天添填田甜恬舔腆挑条迢眺跳贴铁帖厅听烃汀廷停亭庭挺艇通桐酮瞳同铜彤童桶捅筒统痛偷投头透凸秃突图徒途涂屠土吐兔湍团推颓腿蜕褪退吞屯臀拖托脱鸵陀驮驼椭妥拓唾挖哇蛙洼娃瓦袜歪外豌弯湾玩顽丸烷完碗挽晚皖惋宛婉万腕汪王亡枉网往旺望忘妄威巍微危韦违桅围唯惟为潍维苇萎委伟伪尾纬未蔚味畏胃喂魏位渭谓尉慰卫瘟温蚊文闻纹吻稳紊问嗡翁瓮挝蜗涡窝我斡卧握沃巫呜钨乌污诬屋无芜梧吾吴毋武五捂午舞伍侮坞戊雾晤物勿务悟误昔熙析西硒矽晰嘻吸锡牺稀息希悉膝夕惜熄烯溪汐犀檄袭席习媳喜铣洗系隙戏细瞎虾匣霞辖暇峡侠狭下厦夏吓掀锨先仙鲜纤咸贤衔舷闲涎弦嫌显险现献县腺馅羡宪陷限线相厢镶香箱襄湘乡翔祥详想响享项巷橡像向象萧硝霄削哮嚣销消宵淆晓小孝校肖啸笑效楔些歇蝎鞋协挟携邪斜胁谐写械卸蟹懈泄泻谢屑薪芯锌欣辛新忻心信衅星腥猩惺兴刑型形邢行醒幸杏性姓兄凶胸匈汹雄熊休修羞朽嗅锈秀袖绣墟戌需虚嘘须徐许蓄酗叙旭序畜恤絮婿绪续轩喧宣悬旋玄选癣眩绚靴薛学穴雪血勋熏循旬询寻驯巡殉汛训讯逊迅压押鸦鸭呀丫芽牙蚜崖衙涯雅哑亚讶焉咽阉烟淹盐严研蜒岩延言颜阎炎沿奄掩眼衍演艳堰燕厌砚雁唁彦焰宴谚验殃央鸯秧杨扬佯疡羊洋阳氧仰痒养样漾邀腰妖瑶摇尧遥窑谣姚咬舀药要耀椰噎耶爷野冶也页掖业叶曳腋夜液一壹医揖铱依伊衣颐夷遗移仪胰疑沂宜姨彝椅蚁倚已乙矣以艺抑易邑屹亿役臆逸肄疫亦裔意毅忆义益溢诣议谊译异翼翌绎茵荫因殷音阴姻吟银淫寅饮尹引隐印英樱婴鹰应缨莹萤营荧蝇迎赢盈影颖硬映哟拥佣臃痈庸雍踊蛹咏泳涌永恿勇用幽优悠忧尤由邮铀犹油游酉有友右佑釉诱又幼迂淤于盂榆虞愚舆余俞逾鱼愉渝渔隅予娱雨与屿禹宇语羽玉域芋郁吁遇喻峪御愈欲狱育誉浴寓裕预豫驭鸳渊冤元垣袁原援辕园员圆猿源缘远苑愿怨院曰约越跃钥岳粤月悦阅耘云郧匀陨允运蕴酝晕韵孕匝砸杂栽哉灾宰载再在咱攒暂赞赃脏葬遭糟凿藻枣早澡蚤躁噪造皂灶燥责择则泽贼怎增憎曾赠扎喳渣札轧铡闸眨栅榨咋乍炸诈摘斋宅窄债寨瞻毡詹粘沾盏斩辗崭展蘸栈占战站湛绽樟章彰漳张掌涨杖丈帐账仗胀瘴障招昭找沼赵照罩兆肇召遮折哲蛰辙者锗蔗这浙珍斟真甄砧臻贞针侦枕疹诊震振镇阵蒸挣睁征狰争怔整拯正政帧症郑证芝枝支吱蜘知肢脂汁之织职直植殖执值侄址指止趾只旨纸志挚掷至致置帜峙制智秩稚质炙痔滞治窒中盅忠钟衷终种肿重仲众舟周州洲诌粥轴肘帚咒皱宙昼骤珠株蛛朱猪诸诛逐竹烛煮拄瞩嘱主著柱助蛀贮铸筑住注祝驻抓爪拽专砖转撰赚篆桩庄装妆撞壮状椎锥追赘坠缀谆准捉拙卓桌琢茁酌啄着灼浊兹咨资姿滋淄孜紫仔籽滓子自渍字鬃棕踪宗综总纵邹走奏揍租足卒族祖诅阻组钻纂嘴醉最罪尊遵昨左佐柞做作坐座";
