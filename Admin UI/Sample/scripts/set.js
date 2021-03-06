/**addSubAccount，存储子账户信息的二维数组；
 */
var subAccount = new Array();
var newSubAccountId = 0;

/** 当前编辑状态
 */
var currentEditType = "edit";
var currentBankEditType = "add";
var currentPayeeEditType = "add";

/** 金融机构分类
 */
var classBank = 0;
var classFinance = 1;
var classPay = 2;

//获取所有币种
var listCurrency = getCurrencyInfo();

//获取所有存期
var duringData = getAccountSubDuringData();
//获取所有子账户类型
var listSubAccount = getSubAccountType();
//获取所有账户
var listAccount = getAccountList();
//取得分类
var listCategory = getCategoryInfo();
//获取所有一级分类
var listCategoryOut = getCategory1Info();
//获取所有收付款方
var listPayee = getPayeeInfo();
//获取所有金融机构
var listBank = getBankInfo(classBank);
var listFinance = getBankInfo(classFinance);
var listPay = getBankInfo(classPay);

/** currentTbAccountType，当前的用户类型
 */
var currentTbAccountType = -1;

var resWidth = 0;
var resHeight = 0;

var showAddAccount = "-1";
var showAddCategory = "-1";
var showAddPayee = "-1";

/** 天数选择
 */
var DaySelector = {
   initSeletor : function(id, state){
        var screem = $("#" + id + " span[id = 'rmday']"),
			up = $("#" + id + " a[id = 'rmup']"),
			down = $("#" + id + " a[id = 'rmdown']");
		
		var setState = function(state){
			screem.html(state);
			screem.attr("status", state);
		};
		
		var getState = function(){
			return parseInt(screem.attr("status"));
		};
		
		var getLimit = function(){
			return parseInt(screem.attr("limit"));
		};
		
		up.click(function(){
			var l = getLimit(),
				n = getState();
			if( n > 0 && n < l){
				setState(getState() + 1);
			}
		});
		
		down.click(function(){
			var l = getLimit(),
				n = getState();
			if( n > 1 && n <= l){
				setState(getState() - 1);
			}
		});
		
		if(typeof state !== 'undefined'){
			setState(state);
	    }
    },
	
	setrmDayLimit : function(id, n){
        var screem = $("#" + id + " span[id = 'rmday']");
		screem.attr("limit", n);
		screem.attr("status", 3);
		screem.html(3); //默认为3天
	}
}

$(document).ready(function() {

	//生成账户列表
	createAccountList();

	//生成分类列表
	createCategoryList();

	//生成收付款方列表
	createPayeeList();

	//生成银行列表
	createBankList(listBank, classBank);
	createBankList(listPay, classPay);
	createBankList(listFinance, classFinance);
	//设置银行下拉框@huwence
	appendOption("newsa2_bank", listBank);
	appendOption("newsa3_bank", listBank);
	
	//设置投资机构下拉框@huwence
	appendOption("newsa5_bank", listFinance);

	//设置支付机构下拉框@huwence
	appendOption("newsa4_bank", listPay);
    
	//设置币种下拉框@huwence
	appendOption("newsa100_currency", listCurrency);
	appendOption("newsa101_currency", listCurrency);
	appendOption("newsa102_currency", listCurrency);
	appendOption("newsa201_currency", listCurrency);
	appendOption("newsa1_currency", listCurrency);
	appendOption("newsa2_currency", listCurrency);
	appendOption("newsa3_currency", listCurrency);
	//修改bug4264
	//目前版本的第三方支付业务，统一为仅支持人民币一种
	appendOption("newsa4_currency", [{"id": "1", "Name": "人民币"}]);
	//appendOption("newsa4_currency", listCurrency);
	appendOption("newsa5_currency", listCurrency);
	appendOption("newsa6_currency", listCurrency);
	appendOption("newsa7_currency", listCurrency);
	appendOption("newsa8_currency", listCurrency);
	
	//存期@huwence
	appendOption("during", duringData);

	//一级分类@huwence
	appendOption("classout", listCategoryOut);

	//分类
	$("#Delclass select[name='category']").append("<option value='10065' cattype='0' mhvalue='(空)'>(空)</option>");
	$("#Delclass select[name='category']").append("<option value='10066' cattype='1' mhvalue='(空)'>(空)</option>");
	$.each(listCategory, function(i, n) {
		if (n.name2 == "CATA420") {
			$("#Delclass select[name='category']").append("<option value='" + n.id2 + "' cattype='" + n.Type + "' mhvalue='" + n.name1 + "' parentclass='" + n.id1 + "'>" + n.name1 + "</option>");
		} else {
			$("#Delclass select[name='category']").append("<option value='" + n.id2 + "' cattype='" + n.Type + "' mhvalue='" + n.name1 + " : " + n.name2 + "' parentclass='" + n.id1 + "'>" + n.name2 + "</option>");
		}
	});

	//设置收付款人下拉框
	$("#Delsfkf select[name='payee']").append("<option value='0'>(空)</option>");
	$.each(listPayee, function(i, n) {
		$("#Delsfkf select[name='payee']").append("<option value='" + n.id + "'>" + n.Name + "</option>");
	});

	//在页面的任何一个地方点击
	$(document).click(function() {
		$(".tSRSubaccount").hide();
	});
	
	//新建账户按钮
	$(".dSRnewaccount").click(function() {
		subAccount = [];
		renderSubAccountView(2);
		renderSubAccountView(3);
		showAdd("newaccount");
		changetextbg();
	});
	
	//新建账户类型时鼠标滑过动作
	$(".dAccountTypeImage img").mouseleave(function() {
		$(".dAccountTypeBottom").html("");
	});

	//点击新建银行
	$(".iNewBank").click(function() {
		editBank($(this).attr("banktype"), 0);
	});

	//点击三角时的动作	
	$(".iTree").toggle(function() {
		var myTR = $(this).parents(".tSRBrow");
		$(this).attr("src", "../images/tree2.gif");
		myTR.siblings("tr[mhparent='" + myTR.attr("mhclass") + "']").hide();
		myTR.siblings("tr[accountid='" + myTR.attr("accountid") + "'][subaccountid!='0']").hide();
	}, function() {
		var myTR = $(this).parents(".tSRBrow");
		$(this).attr("src", "../images/tree1.gif");
		myTR.siblings("tr[mhparent='" + myTR.attr("mhclass") + "']").show();
		myTR.siblings("tr[accountid='" + myTR.attr("accountid") + "'][subaccountid!='0']").show();
	});

	//创建自定义select
	customizeSelect();

	//自定义单选框
	customizeRadio();

	//切换标签
	tab_change("dSetPage", "h3", "div", "dSetRight");
	
	//日历 @huwence
	createSingleCalendar(".sdate");
	
	//调整屏幕大小
	initSize();
	
	//检查是否有变量需要我们显示
	TabActivated();

	//初始化天数选择器
	DaySelector.setrmDayLimit("newsa5", 10);
	DaySelector.initSeletor("newsa5", 3);//投资类账户
	
	DaySelector.setrmDayLimit("endDay-zd", 10);
	DaySelector.initSeletor("endDay-zd", 3);
	DaySelector.setrmDayLimit("endDay-zhk", 10);
	DaySelector.initSeletor("endDay-zhk", 3);//信用卡类账户	
	
	DaySelector.setrmDayLimit("newsa101", 10);
	DaySelector.initSeletor("newsa101", 3);
	DaySelector.setrmDayLimit("newsa102", 10);
	DaySelector.initSeletor("newsa102", 3);//存折储蓄卡类账户

	$("body").css("top", "0px");
});

//给初始余额赋初始值0.00
function changetextbg(){
	$("#balance").val("0.00");
	$("#1balance").val("0.00");
}



/**IE下select方法无法追加option标签，需要使用Option类进行创建 
*@huwence 
*/
function appendOption(id, list) {
	if (typeof(list) == "object"){
		var select = document.getElementById(id);
		try{
			if (select !== null){
				for (var i in list){
					if (id.indexOf("bank") >= 0) {
						select.options[i] = new Option(list[i].name.replace(/&/g,"&amp;"), list[i].id);
					} else {
						select.options[i] = new Option(list[i].Name, list[i].id);
					}
					//对于分类下拉框，为每个选项增添一个属性，以描述它属于收入还是支出
					if (id == "classout") {
						select.options[i].setAttribute("cattype", list[i].Type + 1);
					}
				}
			}
		} catch (e) { 
            logCatch(e.toString());
			//TODO
		}	   
	} else {
		return false;
	}  
}

/** 窗口被激活时调用
 */
function TabActivated() {
	showAddAccount = "-1";
	showAddCategory = "-1";
	showAddPayee = "-1";
	accountAutoCreated = "-1";
	payeeAutoCreated = "-1";
	balanceChanged = "-1";
	reloadSet = "-1";
	
	try {
		showAddAccount = MoneyHubJSFuc("GetParameter","ShowAddAccount");
		MoneyHubJSFuc("SetParameter","ShowAddAccount", "-1");
		showAddCategory = MoneyHubJSFuc("GetParameter","ShowAddCategory");
		MoneyHubJSFuc("SetParameter","ShowAddCategory", "-1");
		showAddPayee = MoneyHubJSFuc("GetParameter","ShowAddPayee");
		MoneyHubJSFuc("SetParameter","ShowAddPayee", "-1");
		accountAutoCreated = MoneyHubJSFuc("GetParameter","AccountAutoCreated");
		MoneyHubJSFuc("SetParameter","AccountAutoCreated", "-1");
		payeeAutoCreated = MoneyHubJSFuc("GetParameter","PayeeAutoCreated");
		MoneyHubJSFuc("SetParameter","PayeeAutoCreated", "-1");
		balanceChanged = MoneyHubJSFuc("GetParameter","BalanceChanged");
		MoneyHubJSFuc("SetParameter","BalanceChanged", "-1");
		reloadSet = MoneyHubJSFuc("GetParameter","ReloadSet");
		MoneyHubJSFuc("SetParameter","ReloadSet", "-1");
	} catch (e) {
        logCatch(e.toString());
	}

	if (reloadSet != "-1") {
	   window.location.reload();
	}

	if ((showAddAccount != undefined) && (showAddAccount != "-1")) {
		closeAllPopup();
		$(".account").click();
		$(".dSRnewaccount").click();
	}
	if ((showAddCategory != undefined) && (showAddCategory != "-1")) {
		closeAllPopup();
		$(".classification").click();
		addCategory(showAddCategory, 1, 0);
	}
	if ((showAddPayee != undefined) && (showAddPayee != "-1")) {
		closeAllPopup();
		$(".shoufu").click();
		editPayee(0);
	}
	if ((accountAutoCreated != undefined) && (accountAutoCreated != "-1")) {
		//清空旧内容
		for (i=1; i<=8; i++) {
			$("#dAT" + i).hide();
			$("#tAT" + i).empty();
		}
		//获取所有账户
		listAccount = getAccountList();
		//生成账户列表
		createAccountList();
		adjustAccountWidth();
		//点击三角时的动作	
		$(".iTree").unbind().toggle(function() {
			var myTR = $(this).parents(".tSRBrow");
			$(this).attr("src", "../images/tree2.gif");
			myTR.siblings("tr[mhparent='" + myTR.attr("mhclass") + "']").hide();
			myTR.siblings("tr[accountid='" + myTR.attr("accountid") + "'][subaccountid!='0']").hide();
		}, function() {
			var myTR = $(this).parents(".tSRBrow");
			$(this).attr("src", "../images/tree1.gif");
			myTR.siblings("tr[mhparent='" + myTR.attr("mhclass") + "']").show();
			myTR.siblings("tr[accountid='" + myTR.attr("accountid") + "'][subaccountid!='0']").show();
		});
	}
	if ((payeeAutoCreated != undefined) && (payeeAutoCreated != "-1")) {
		//清空旧内容
		
		$("#tPayee").html('<tr class="tSRCrow"><td class="tdSRC">名称</td><td class="tdSRC">联系电话</td><td class="tdSRC">电子邮件</td>'
			+ '<td class="tSRCEdit">&nbsp;</td><td class="tSRCDelete">&nbsp;</td></tr>');
		//获取所有收付款方
		listPayee = getPayeeInfo();
		//生成收付款方列表
		createPayeeList();
		adjustPayeeWidth();
		//设置收付款人下拉框
		$("#Delsfkf select[name='payee']").html("<option value='0'>(空)</option>");
		$.each(listPayee, function(i, n) {
			try{
				//修改了bug2845
				addOption("#Delsfkf", "payee", n.id, n.Name.replace(/&/g,"&amp;"), "", "");
				//$("#Delsfkf select[name='payee']").append("<option value='" + n.id + "'>" + n.Name + "</option>");
			} catch(e){
                logCatch(e.toString());
			}
		});
	}
	if ((balanceChanged != undefined) && (balanceChanged != "-1")) {
		//清空旧内容
		for (i=1; i<=8; i++) {
			$("#dAT" + i).hide();
			$("#tAT" + i).empty();
		}
		//获取所有账户
		listAccount = getAccountList();
		//生成账户列表
		createAccountList();
		adjustAccountWidth();
		//点击三角时的动作	
		$(".iTree").unbind().toggle(function() {
			var myTR = $(this).parents(".tSRBrow");
			$(this).attr("src", "../images/tree2.gif");
			myTR.siblings("tr[mhparent='" + myTR.attr("mhclass") + "']").hide();
			myTR.siblings("tr[accountid='" + myTR.attr("accountid") + "'][subaccountid!='0']").hide();
		}, function() {
			var myTR = $(this).parents(".tSRBrow");
			$(this).attr("src", "../images/tree1.gif");
			myTR.siblings("tr[mhparent='" + myTR.attr("mhclass") + "']").show();
			myTR.siblings("tr[accountid='" + myTR.attr("accountid") + "'][subaccountid!='0']").show();
		});
	}
}

/** 关闭所有弹出框
 */ 
function closeAllPopup() {
	$(".addBox").each(function () {
		cancelAdd($(this).attr("id"), 1);
	});
}

/** 调整账户表格宽度
 */
function adjustAccountWidth() {
	//账户列表表格宽度
	$(".tSRBankcard").width($(".dSetRight").width() - 24);
	var cellWidth = ($(".tSRBankcard").width() - 181) / 3;
	$(".tSRBankcard .tSRBname1").width(cellWidth);
	$(".tSRBankcard .tSRBamount").width(cellWidth);
	$(".tSRBankcard .tSRBamount1").width(cellWidth);
	$(".tSRBankcard .tSRCAdd").width(90);
	$(".tSRBankcard .tSRCEdit").width(30);
	$(".tSRBankcard .tSRCDelete").width(30);
}	

/** 调整分类表格宽度
 */
function adjustPayWidth() {
	$(".tSRC_payout .tSRBname1").width($(".dSRHalf").width() - 110);
	$(".tSRC_payout .tSRBname2").width($(".tSRC_payout").width() - 182);
	$(".tSRC_payout .tSRCEdit").width(30);
	//$(".tSRC_payout .tSRCDelete").width(30);
}

/** 调整收付款方表格宽度
 */
function adjustPayeeWidth() {
	$(".tSRCorporation .tdSRC").width(($(".tSRCorporation").width() - 140) / 3);
	$(".tSRCorporation .tSRCEdit").width(30);
	$(".tSRCorporation .tSRCDelete").width(30);
}

function initSize() {
	try {
		screenSize = MoneyHubJSFuc("GetScreenSize").split("x");
		resWidth = screenSize[0];
		resHeight = screenSize[1] - 30;
	} catch (e) {
        logCatch(e.toString());
		resWidth = 1324;
		resHeight = 468;
	}

    $('#dSetPage').width(resWidth);//做成固定的吧！
	if (resWidth <= 973) {
		$(".dSetRight").width(752);
	} else {
		$(".dSetRight").width(resWidth - 225);
	}

	//标题栏宽度
	$(".dSRHalf").width(($(".dSetRight").width() - 20) / 2);
	$(".dSRCB2").width($(".dSRHalf").width() - 16);
	$(".dSRBB2").width($(".dSetRight").width() - 40);

	adjustAccountWidth();
	adjustPayWidth();

	//收付款方表格宽度
	$(".tSRCorporation").width($(".dSetRight").width() - 24);
	adjustPayeeWidth();

	$(".tSRCclass, .tSRCcontact").width((resWidth - 536)/2);
	
	//分类列表高度
	$(".dSRHalf").height(resHeight - 50);
	$("#dSetAccount").height(resHeight);
	$("#dPayee .customScrollBox").height(resHeight - 50);
	$("#dBank .customScrollBox").height(resHeight - 50);
}

//定期子账户到期日提醒判断
function  enddatejudge1(){
	$("#judge1").unbind("click");
	if($("#newsa101 input[name='sdate']").val() == ""){
	    alert("请选择到期日");
		if ($("#newsa101 .sCheckBox").hasClass("sCheckBox2") == true)
	    $("#newsa101 .sCheckBox").removeClass("sCheckBox2");	       
	}else{
		 if ($("#newsa101 .sCheckBox").hasClass("sCheckBox2") == true){
		 	$("#newsa101 .sCheckBox").removeClass("sCheckBox2");
		 	}else {$("#newsa101 .sCheckBox").addClass("sCheckBox2");}
	}		
}

//理财产品子账户到期日提醒判断
function  enddatejudge2(){
	$("#judge2").unbind("click");
	if($("#newsa102 input[name='sdate']").val() == ""){
	    alert("请选择到期日");
		if ($("#newsa102 .sCheckBox").hasClass("sCheckBox2") == true)
	    $("#newsa102 .sCheckBox").removeClass("sCheckBox2");	       
	}else{
		if ($("#newsa102 .sCheckBox").hasClass("sCheckBox2") == true){
		$("#newsa102 .sCheckBox").removeClass("sCheckBox2");
		}else{$("#newsa102 .sCheckBox").addClass("sCheckBox2");}
	}		
}

//投资账户到期日提醒判断
function  enddatejudge3(){
	$("#judge3").unbind("click");
	if($("#newsa5 input[name='sdate']").val() == ""){
	    alert("请选择到期日");
		if ($("#newsa5 .sCheckBox").hasClass("sCheckBox2") == true)
	    {$("#newsa5 .sCheckBox").removeClass("sCheckBox2");}	       
	}else{	   
	     if($("#newsa5 .sCheckBox").hasClass("sCheckBox2") == true) {
		 	$("#newsa5 .sCheckBox").removeClass("sCheckBox2");
		 }else{
		 	 	$("#newsa5 .sCheckBox").addClass("sCheckBox2");
		 	  }
	
	}		
}

//信用卡账单日的到期日提醒判断
function  zddatejudge(){
	$("#zddate").unbind("click");
	if($("#newsa2 input[name='billdate']").val() == ""){
	    alert("请输入账单日");
		if ($("#zddate").hasClass("sCheckBox2") == true)
	    $("#zddate").removeClass("sCheckBox2");	       
	}else{
		if ($("#zddate").hasClass("sCheckBox2") == true){$("#zddate").removeClass("sCheckBox2");}
		else{$("#zddate").addClass("sCheckBox2");}
	}		
}

//信用卡最后还款日的到期日提醒判断
function  zhkdatejudge(){
	$("#zhkdate").unbind("click");
	if($("#newsa2 input[name='returndate']").val() == ""){
	    alert("请输入最后还款日");
		if ($("#zhkdate").hasClass("sCheckBox2") == true)
	    $("#zhkdate").removeClass("sCheckBox2");	       
	}else{
		if ($("#zhkdate").hasClass("sCheckBox2") == true){$("#zhkdate").removeClass("sCheckBox2");}
		else{$("#zhkdate").addClass("sCheckBox2");}
	}		
}

/** 生成账户列表中的一项
 * @param AccountType 账户类型
 * @param SubAccountType 子账户类型
 * @param AccountId 主账户号
 * @param SubAccountId 子账户号
 * @param accountSonNumber 子账户个数
 * @param AccountName 账户名
 * @param Comment 备注 
 * @param CurrencyId 币种
 * @param AccountBalance 余额
 * @param BankId 银行
 * @param Days 理财期限
 * @param EndDate 到期日   
 * @return 生成的内容   
 */
function GenerateAccount(AccountType, SubAccountType, AccountId, SubAccountId, accountSonNumber, AccountName, Comment, CurrencyId, AccountBalance, BankId, Days, EndDate) {
	
	if (Comment == undefined) Comment = "";
	CurrencyName = getCurrencyDesc(CurrencyId);
	AccountName = AccountName.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;");
    
	if (SubAccountType == 0) {
		//主账户 
		content = '<tr class="tSRBrow" accountid="' + AccountId + '" subaccountid="' + SubAccountId + '" currency="' + CurrencyId + '" bankid="' + BankId + '" accountname="' + AccountName + '" days="' + Days + '" enddate="' + EndDate + '" comment="' + Comment + '"><td class="tSRBname1"><div class="dSRBname1"><nobr>';
	} else {
		content = '<tr class="tSRBrow" accountid="' + AccountId + '" subaccountid="' + SubAccountId + '" currency="' + CurrencyId + '" accountname="' + AccountName + '" days="' + Days + '" enddate="' + EndDate + '" comment="' + Comment + '"><td class="tSRBname1"><div class="dSRBname2"><nobr>';
	}

	//多于一个子账户的
	if (accountSonNumber > 0)
		content += '<img src="../images/tree1.gif" class="iTree" />';
	content += AccountName + '</nobr></div></td>'
		+ '<td class="tSRBamount">' + formatnumber(parseFloat(AccountBalance), 2) + '</td>'
		+ '<td class="tSRBamount1">'+ CurrencyName + '</td>' + '<td class="tSRCAdd">';
	if ((SubAccountId == 0) && ((AccountType == 2) || (AccountType == 3))) {
		content += '<span class="newsubaccount" atid="' + AccountType + '">新增子账户</span>';
	}
	content += "</td>";
	if (SubAccountType == 0) {
		//主账户
		aid = '$(this).parents(\'.tSRBrow\').attr(\'accountid\')';
		bid = '$(this).parents(\'.tSRBrow\').attr(\'subaccountid\')';
		content += '<td class="tSRCEdit"><img class="edit" alt="" src="images/edit.gif" onclick="AddSA(' + AccountType + ', ' + aid + ', ' + bid + ')"></td>'
			+ '<td class="tSRCDelete"><img class="delete" alt="" src="images/delete.gif" onclick="showDeleteAccount(' + AccountType + ', ' + aid + ', 0)"></td>';
	} else {
		//子账户
		aid = '$(this).parents(\'.tSRBrow\').attr(\'accountid\')';
		bid = '$(this).parents(\'.tSRBrow\').attr(\'subaccountid\')';
		content += '<td class="tSRCEdit">'
		if (AccountType == 3) {
			//只有储蓄卡的子账户可以编辑
			content += '<img class="edit" alt="" src="images/edit.gif" onclick="AddSA(' + SubAccountType + ', ' + aid + ', ' + bid + ')">';
		}
		content += '</td><td class="tSRCDelete"><img class="delete" alt="" src="images/delete.gif" onclick="showDeleteAccount('+ AccountType + ', ' + aid + ', ' + bid + ')"></td>';
	}
	content += '</tr>';
	return content;
	
}

/** 生成分类列表中的一项
 * @param CatType 类型
 * @param CatId1 主分类编号
 * @param CatId2 子分类编号
 * @param CatName1 主分类名称
 * @param CatName2 子分类名称
 * @return 生成的内容   
 */
function GenerateCategory(CatType, CatId1, CatId2, CatName1, CatName2) {
	if (CatName2 == "CATA420") {
		//一级分类 
		content = '<tr class="tSRBrow" mhclass="' + CatId1 + '" mhparent="0" catname="' + CatName1 + '">'
			+ '<td class="tSRBname1"><div class="dSRBname1"><nobr><img class="iTree" src="../images/tree1.gif">' + CatName1 + '</nobr></div></td>'
			+ '<td class="tSRCAdd"><img class="add newout2" alt="" src="images/add.gif" onclick="addCategory(' + CatType + ', 2, ' + CatId1 + ', 0);" /></td>'
			+ '<td class="tSRCEdit"><img class="edit" alt="" src="images/edit.gif" onclick="addCategory(' + CatType + ', 1, ' + CatId1 + ', 0);" /></td>'
			+ '<td class="tSRCDelete"><img class="delete" alt="" src="images/delete.gif" onclick="showDeleteCategory(' + CatType + ', 1, ' + CatId1 + ');" /></td>'
			+ '</tr>';
	} else {
		//二级分类
		content = '<tr class="tSRBrow" mhparent="' + CatId1 + '" mhclass="' + CatId2 + '" catname="' + CatName2 + '">'
			+ '<td class="tSRBname1"><div class="dSRBname2"><nobr>' + CatName2 + '</nobr></div></td>'
			+ '<td class="tSRCAdd">&nbsp;</td>'
			+ '<td class="tSRCEdit"><img class="edit" alt="" src="images/edit.gif" onclick="addCategory(' + CatType + ', 2, ' + CatId1 + ', ' + CatId2 + ');" /></td>'
			+ '<td class="tSRCDelete"><img class="delete" alt="" src="images/delete.gif" onclick="showDeleteCategory(' + CatType + ', 2, ' + CatId2 + ');" /></td>'
			+ '</tr>';
	}
	return content;
}

/** 生成收付款方列表中的一项
 * @param PayeeId 编号
 * @param PayeeName 姓名
 * @param PayeeTel 电话
 * @param PayeeEmail 邮件
 * @return 生成的内容   
 */
function GeneratePayee(PayeeId, PayeeName, PayeeTel, PayeeEmail) {
	content = '<tr class="tSRCrow" payeeid="' + PayeeId + '" payeepinyin="' + getGB2312Spell(PayeeName) + '">'
		+ '<td class="tdSRC tSRCname">' + PayeeName + '</td>'
		+ '<td class="tdSRC tSRCclass">' + PayeeTel + '</td>'
		+ '<td class="tdSRC tSRCcontact">' + PayeeEmail + '</td>'
		+ '<td class="tSRCEdit"><img class="edit" src="images/edit.gif" alt="" onclick="editPayee(' + PayeeId + ');" /></td>'
		+ '<td class="tSRCDelete"><img class="delete" src="images/delete.gif" alt="" onclick="showDeletePayee(' + PayeeId + ');" /></td>'
		+ '</tr>';
	return content;
}

/** 生成银行列表中的一项
 * @param BankId 编号
 * @param BankName 姓名
 * @param BankWebsite 联系方式
 * @return 生成的内容   
 */
function GenerateBank(BankId, BankName, BankType, BankWebsite) {
	BankTypeArray = new Array();
	BankTypeArray[classBank] = "银行";
	BankTypeArray[classFinance] = "投资机构";
	BankTypeArray[classPay] = "第三方支付机构";
	BankTypeName = BankTypeArray[BankType];
	content = '<tr class="tSRCrow" bankid="' + BankId + '"  banktype1="' + BankType + '"  BankNamePinyin="' + getGB2312Spell(BankName) + '">'
		+ '<td class="tdSRC tSRCname">' + BankName + '</td>'
		+ '<td class="tdSRC">' + BankTypeName + '</td>'
		+ '<td class="tdSRC">' + BankWebsite + '</td>'
		+ '<td class="tSRCEdit"><img class="edit" src="images/edit.gif" alt="" onclick="editBank(' + BankType + ', ' + BankId + ')" /></td>'
		+ '<td class="tSRCDelete"><img class="delete" src="images/delete.gif" alt="" onclick="handleDeleteBank(' + BankType + ', ' + BankId + ')" /></td>'
		+ '</tr>';
	return content;
}

/** 生成账户列表
 */
function createAccountList() {
	//取得账户与子账户的对应情况
	try {
		result1 = JSON.parse(MoneyHubJSFuc("QuerySQL","SELECT COUNT(DISTINCT(b.id)) AS myNumber, a.id AS aid FROM tbAccount a, tbSubAccount b WHERE a.mark = 0 and b.mark = 0 and a.id=b.tbAccount_id  and a.tbaccountType_id in (2,3) GROUP BY a.id"));//new
	} catch (e) {
        logCatch(e.toString());
		result1 = [{
			"myNumber": 2,
			"aid": 1
		},{
			"myNumber": 1,
			"aid": 8
		},{
			"myNumber": 1,
			"aid": 9
		}];
	}

	//清空数据层
	var aId = "";
	var content = "";
	var accountSonNumber = 0;
	var k = 0;
	var totalAmount = 0;

	$.each(listAccount, function(i, n) {
		//显示相应的账户分类
		$("#dAT" + n.tid).show();

		//判断是否为统一账户
		//判断是否为1对1账户
		if (aId == n.aid) {
			k++;
		} else {
			aId = n.aid;
			k = 0;
		} 
		if ((n.tid == 2) || (n.tid == 3)) {
			//有子账户的
			accountSonNumber = 0;
			$.each(result1, function(j, m) {
				if (m.aid == n.aid) {
					//取得当前的子分类的总数
					accountSonNumber = m.myNumber;
					return false;
				}
			});
			if (k == 0) {
				//新的，第一个
				content = GenerateAccount(n.tid, 0, n.aid, 0, accountSonNumber, n.aname, n.acomment, n.tbCurrency_id, 0, n.tbBank_id);
				$("#tAT" + n.tid).append(content);
			}
			//生成子账户层
			if (n.tid2 == "") n.tid2 = 201;
			content = GenerateAccount(n.tid, n.tid2, n.aid, n.bid, 0, n.bname, n.bcomment, n.tbCurrency_id, n.Balance, 0, n.Days, n.EndDate);
			$("#tAT" + n.tid).append(content);
			content = $(content);
			if (k == (accountSonNumber - 1)) {
				//最后一个
				//计算主账户总金额
				var totalAmount = 0;
				$("#tAT" + n.tid + " tr[accountid='" + n.aid + "'][subaccountid!='0']").each(function () {
					totalAmount += Math.round(getRMBExchangeInfo2($(this).attr("currency")) * parseFloat($(this).children(".tSRBamount").html())) / 100;
				});
				totalAmount = formatnumber(totalAmount, 2);   
				$("#tAT" + n.tid + " tr[accountid='" + n.aid + "'][subaccountid='0']").children(".tSRBamount").html(totalAmount);
				$("#tAT" + n.tid + " tr[accountid='" + n.aid + "'][subaccountid='0']").children(".tSRBamount1").html("人民币");
			}
		} else {
			//无子账户的
			content = GenerateAccount(n.tid, 0, n.aid, n.bid, 0, n.aname, n.acomment, n.tbCurrency_id, n.Balance, n.tbBank_id, n.Days, n.EndDate);
			$("#tAT" + n.tid).append(content);
		}
	});
	
	//新建子账户按钮
	$(".newsubaccount").unbind("click").click(function(event) {
		event.stopPropagation();
		if ($(this).attr("atid") == 2) {
			//显示信用卡子账户窗口
			AddSA(201, $(this).parents(".tSRBrow").attr('accountid'), 0);
		} else {
			//显示借记卡子账户窗口
			$(".tSRSubaccount").find("li").attr("accountid", $(this).parents(".tSRBrow").attr("accountid"));
			$(".tSRSubaccount").css("top", $(this).offset().top + 20);								   
			$(".tSRSubaccount").toggle();
		}								   
	});
	
	//左侧账户列表名字宽度
	$(".sMAName").width($("#accountList").width() - 130);
	$(".sMAName").each(function(i) {
		maxLen = $(".sMAName").width() / 13;
		var finalFullName = $(this).attr("fullname").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		if ($(this).attr("fullname").length > maxLen) {
			$(this).html(finalFullName.substring(0, maxLen - 1) + "…");
		} else {
			$(this).html(finalFullName);
		}
	});
}

/** 生成分类表
 */
function createCategoryList() {
	$.each(listCategory, function(i, n) {
		var legalName1 = n.name1.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;");
		var legalName2 = n.name2.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;");
		content = GenerateCategory(n.Type, n.id1, n.id2, legalName1, legalName2);
		$("#tC" + n.Type).append(content);
	});
}

/** 生成收付款方表
 */
function createPayeeList() {
	$.each(listPayee, function(i, n) {
		content = GeneratePayee(n.id, n.Name, n.tel, n.email);
		$("#tPayee").append(content);
	});
}

/** 生成金融机构表
 */
function createBankList(list, listType) {
	$.each(list, function(i, n) {
		if (n.id >= 10000) {
			if(n.Website == undefined)
			{n.Website="";}
			content = GenerateBank(n.id, n.name, listType, n.Website);
			$("#tBank").append(content);
		}
	});
}

/** 显示添加子账户窗口
 * @param TypeId 账户类型
 * @param AccountId 主账户编号 
 * @param SubAccountId 子账户编号 
 * @param flag 编辑是否清空
 */ 
function AddSA(TypeId, AccountId, SubAccountId, flag) {
	var BoxName = "#newsa" + TypeId + "boxBg";
	$(BoxName + " input[name='balance']").val("0.00");
	if (flag == undefined){
	    $(BoxName + " input").val("");
		$(BoxName + " input[name='balance']").val("0.00");
		$(BoxName + " input[name='1balance']").val("0.00"); 
	    $(BoxName + " .sCheckBox").removeClass("sCheckBox2");
	    $(BoxName + " span[id='rmday']").html(3);//默认为前三天
	}
	$(BoxName + " textarea").val("");
	//编辑时不显示余额框
	if (((TypeId < 100) && (AccountId != 0)) || (SubAccountId != 0)) {
		if (SubAccountId < 999999999999) {//Id变了，现在99999要加长了........
			//以下三行为IE6准备
			$(BoxName + " input[name='balance']").parents(".dEAItem").find(".label").css("background", "url(../images/selectleft.png) no-repeat");
			$(BoxName + " input[name='balance']").parents(".dEAItem").find(".button").css("background", "url(../images/selectarrow.gif) no-repeat");
			$(BoxName + " input[name='balance']").parents(".dRDRInput1").css("background", "url(images/inputa.png) no-repeat");
			$(BoxName + " input[name='balance']").parents(".dEAItem").show();
		} else {
			$(BoxName + " input[name='balance']").parents(".dEAItem").find(".label").css("background", "none");
			$(BoxName + " input[name='balance']").parents(".dEAItem").find(".button").css("background", "none");
			$(BoxName + " input[name='balance']").parents(".dRDRInput1").css("background", "none");
			$(BoxName + " input[name='balance']").parents(".dEAItem").hide();
		}
	} else {
		$(BoxName + " input[name='balance']").parents(".dEAItem").find(".label").css("background", "url(../images/selectleft.png) no-repeat");
		$(BoxName + " input[name='balance']").parents(".dEAItem").find(".button").css("background", "url(../images/selectarrow.gif) no-repeat");
		$(BoxName + " input[name='balance']").parents(".dRDRInput1").css("background", "url(images/inputa.png) no-repeat");
		$(BoxName + " input[name='balance']").parents(".dEAItem").show();
	}
	showAdd("newsa" + TypeId);
	if (TypeId < 100) {
		//主账户
         if (AccountId == 0) {
			//新建
			currentEditType = "add";
			$(BoxName + " h1").html($(BoxName + " h1").html().replace("编辑", "新建"));//若点击编辑后，改变回新建
		    if (TypeId == 4) {
				selectOption(BoxName, "bank", listPay[0].id);
				//初始化时将select组件变为可见
				$("#newsa"+ TypeId +"_form_edit_disable").hide();
				$("#newsa"+ TypeId +"_form_edit").show();
			}
		    if (TypeId == 5) {
				selectOption(BoxName, "bank", listFinance[0].id);
			}
       		if ((TypeId != 2) && (TypeId != 3)) {
       			//设置主账户币种
				selectOption(BoxName, "currency", 1);
			}

			if ((TypeId == 2) || (TypeId == 3)) {
				if(TypeId == 2){
					//初始化时将select组件变为可见
					$("#newsa"+ TypeId +"_form_edit_disable").hide();
					$("#newsa"+ TypeId +"_form_edit").show();
				}
				selectOption(BoxName, "bank", listBank[0].id);
				//添加信用卡或借记卡窗口有一个按钮：下一步
				$(BoxName + ' .boxBg8 .oplist').html("<li><span class='next_btn'></span></li>");
				$(BoxName + ' .boxBg8 .oplist .next_btn').unbind().click( function(){
					if (myFormValidate('#newsa' + TypeId + '_form')) {
						$(BoxName).hide();
						showAdd("suba" + TypeId);
					}
				});
			}
		} else {
			//编辑
			currentEditType = "edit";
			if (TypeId == 2) {
				$(BoxName + " h1").html("编辑信用卡");
			} else {
				$(BoxName + " h1").html("编辑基本信息");
			}

			$(BoxName + " input[name='AccountId']").val(AccountId);

			targetRow = $("#tAT" + TypeId + " tr[accountid='" + AccountId + "']").first();
       		if ((TypeId == 2) || (TypeId == 3) || (TypeId == 4) || (TypeId == 5)) {
       			//有银行的，选银行
       			try{
	       			if((TypeId == 2) || (TypeId == 4)){
	       				var key = "";
	       				var keyObject = getAccountKeyInfo(AccountId);
	       				$.each(keyObject, function(i, n) {
							key = n.key;
						}); 
	       				if(key === undefined){
	       					key = "";
	       				}
	       				if(key.length == 0){
	       					//未绑定卡号
	       					$("#newsa"+ TypeId +"_form_edit_disable").hide();
	       					$("#newsa"+ TypeId +"_form_edit").show();
	       					selectOption(BoxName, "bank", targetRow.attr("bankid"));
	       				} else {
	       					$("#newsa"+ TypeId +"_form_edit_disable").show();
	       					$("#newsa"+ TypeId +"_form_edit").hide();
	       					var current_bankname = "";
	       					if(TypeId == 2){
	       						$.each(listBank, function(i, n) {
									if(n.id == targetRow.attr("bankid")){
										current_bankname = n.name;
										return false;
									} 
								});
	       					} else {
	       						$.each(listPay, function(i, n) {
									if(n.id == targetRow.attr("bankid")){
										current_bankname = n.name;
										return false;
									} 
								});
	       					}
	       					
							$(BoxName + " input[name='bank']").val(targetRow.attr("bankid"));
	       					$("#newsa"+ TypeId +"_form_bank_name").html(current_bankname);
	       				}
	       			} else {
	       				selectOption(BoxName, "bank", targetRow.attr("bankid"));
	       			}
	       		} catch(e){
	       			//alert(e.message);
	       		}
			}

       		if ((TypeId != 2) && (TypeId != 3)) {
       			//没有子账户的，选中其唯一子账户
       			$(BoxName + " input[name='SubAccountId']").val(SubAccountId);
       			//设置主账户币种
				selectOption(BoxName, "currency", targetRow.attr("currency"));
       		}
       		
       		$(BoxName + " input[name='AccountName']").val(targetRow.attr("accountname"));
       		if (targetRow.attr("comment") == "undefined") {
				targetRow.attr("comment", "");	   
			}
       		$(BoxName + " textarea[name='description']").val(targetRow.attr("comment"));
       		//设定事件提醒
			setEditDateAlarm(TypeId, AccountId, SubAccountId);
		}
	} else {
		//子账户
		if (SubAccountId == 0) {
			//新建
			$(BoxName + " h1").html($(BoxName + " h1").html().replace("编辑", "新建"));//若点击编辑后，改变回新建
			$(BoxName + " input[name='subName']").val("");
			//设置子账户币种
			selectOption(BoxName, "currency", 1);
			if (BoxName == "#newsa101boxBg") {
				selectOption(BoxName, "during", 0);
			} else if (BoxName == "#newsa102boxBg") {
				$(BoxName + " input[name='during']").val("");
			}
		} else {
			//编辑
			var subsaId = TypeId;
			TypeId = 3;
			$(BoxName + " h1").html($(BoxName + " h1").html().replace("新建", "编辑"));
			if (SubAccountId < 999999999999) {
				//新建主账户时的表
       			targetRow = $("#suba3 tr[subaccountid='" + SubAccountId + "']");
				selectOption(BoxName, "currency", targetRow.attr("currency"));
			} else {
				//账户大列表
				currentEditType = "edit";
       			targetRow = $("#tAT" + TypeId + " tr[accountid='" + AccountId + "'][subaccountid='" + SubAccountId + "']");
       		}
			//$(BoxName + " input[name='balance']").val(targetRow.attr("balance"));
			$(BoxName + " input[name='subName']").val(targetRow.attr("accountname"));
       		$(BoxName + " textarea[name='description']").val(targetRow.attr("comment"));
			
			//modified by liuchang 12-03-27 修改bug3379
			
			if(targetRow.attr("balance") === undefined ) $(BoxName + " input[name='balance']").val("0.00");
			else $(BoxName + " input[name='balance']").val(targetRow.attr("balance"));
			
			
			
			if (BoxName == "#newsa101boxBg") {
				selectOption(BoxName, "during", targetRow.attr("days"));
			} else if (BoxName == "#newsa102boxBg") {
                var days = targetRow.attr("days") == '0' ? '' : targetRow.attr("days");
				$(BoxName + " input[name='during']").val(days);
			}
			//设定事件提醒
			if ($("#suba3boxBg").css("display") == "none"){
			   setEditDateAlarm(TypeId, AccountId, SubAccountId, subsaId);
			}else{
			   var enddate = targetRow.attr("enddate1") == 'undefined' ? "" :  targetRow.attr("enddate1");
			   $(BoxName + " .sdate").val(enddate);
			   if (targetRow.attr("alarm") != 'undefined' && targetRow.attr("alarm") != ""){
			     $(BoxName + " .sCheckBox").addClass("sCheckBox2");
				 $(BoxName + " .rd").text(targetRow.attr("alarm"));
               }else{
			     $(BoxName + " .sCheckBox").removeClass("sCheckBox2");
				 $(BoxName + " .rd").text("3");
			   }
			}
		}
	}
	$(BoxName + " input[name='AccountId']").val(AccountId);
	$(BoxName + " input[name='SubAccountId']").val(SubAccountId);
	$(BoxName + " input[name='AccountType']").val(TypeId);
}

/** 设定事件提醒
 * @param TypeId 主账户类型
 * @param AccountId 主账户编号
 * @param SubAccountId 子账户编号
 * @param subsaId
 */    
function setEditDateAlarm(TypeId, AccountId, SubAccountId, subsaId){
     var name, subName, eventDescription;
	 var BoxName = "#newsa" + TypeId + "boxBg";
	 
     if (TypeId == 2) {
	    // name = $(BoxName + " input[name='AccountName']").val();
		//subName = $("#tAT" + TypeId + " tr[accountid='" + AccountId + "']").next().attr("accountname");
		// eventDescription = (name + " " + subName + "提醒").replace(/^\s+(.*?)\s+$/, "$1");
	    // var descriptionZ = name + " " + "账单日\t提醒",//账单日事件
		    // descriptionH = name + " " + "账单到期还款\t\t提醒";//还款日事件
	    var alarmEnddateZ = getEventDateAlarm(AccountId, SubAccountId, 21),
		    alarmEnddateH = getEventDateAlarm(AccountId, SubAccountId, 22),
			enddate       = getEnddate(TypeId, AccountId, SubAccountId);
		if (enddate != "" && enddate != undefined){
		    var billdateValue   = enddate.substring(0, 2),
			    returndateValue = enddate.substring(2);
			if (/[0-9]{2}/.test(billdateValue)){
			    $(BoxName + " input[id='billdate']").val(billdateValue);
			}
			if (/[0-9]{2}/.test(returndateValue)){
			    $(BoxName + " input[id='returndate']").val(returndateValue);
			}
        }			
		if (alarmEnddateZ.hasOwnProperty("alarm") && alarmEnddateZ.hasOwnProperty("enddate")){
		    var alarmZ = alarmEnddateZ["alarm"],
			    enddateZ = alarmEnddateZ["enddate"].substring(8, 10),
				enddateZ_ = (enddateZ.indexOf("0") == 0) ? alarmEnddateZ["enddate"].substring(9, 10) : enddateZ;
		        if (alarmZ != undefined && enddateZ != undefined){
					if (alarmZ != 0)  $(BoxName + " span[id='zddate']").addClass("sCheckBox2");		
					else alarmZ = 3;
					$("#endDay-zd span[id='rmday']").html(alarmZ);
			    }
		}	
		if (alarmEnddateH.hasOwnProperty("alarm") && alarmEnddateH.hasOwnProperty("enddate")){
		    var alarmH = alarmEnddateH["alarm"],
			    enddateH = alarmEnddateH["enddate"].substring(8, 10),
				enddateH_ = (enddateH.indexOf("0") == 0) ? alarmEnddateH["enddate"].substring(9, 10) : enddateH;
		        if (alarmH != undefined && enddateH != undefined){
					if (alarmH != 0)  $(BoxName + " span[id='zhkdate']").addClass("sCheckBox2");	
					else alarmH = 3;			
					$("#endDay-zhk span[id='rmday']").html(alarmH);
			    }
		}
	 }else if (TypeId == 3){
	    var alarmEnddate = getEventDateAlarm(AccountId, SubAccountId, TypeId),
		    date         = getEnddate(TypeId, AccountId, SubAccountId),
	        alarm        = alarmEnddate['alarm'],
	        enddate      = alarmEnddate['enddate'];
		if (date != "" && date != undefined){
		    $("#newsa" + subsaId + " input[name='sdate']").val(date);
		}
	    if (subsaId != undefined && alarm != undefined && enddate != undefined){
            if (alarm != 0) $("#newsa" + subsaId + " .sCheckBox").addClass("sCheckBox2");
			else alarm = 3;
		    $("#newsa" + subsaId + " span[id='rmday']").html(alarm);
        }else{
		    $("#newsa" + subsaId + " .sCheckBox").removeClass("sCheckBox2");
		}
	 }else if (TypeId == 5){
		var alarmEnddate = getEventDateAlarm(AccountId, SubAccountId, TypeId),
		    date         = getEnddate(TypeId, AccountId, SubAccountId),
	        alarm        = alarmEnddate['alarm'],
	        enddate      = alarmEnddate['enddate'];
		if (date != "" && date != undefined){
		    $(BoxName + " input[name='sdate']").val(date);
		}
		if (alarm != undefined && enddate != undefined){
			if (alarm != 0)  $(BoxName + " .sCheckBox").addClass("sCheckBox2")
            else alarm = 3;			
			$(BoxName + " span[id='rmday']").html(alarm);
	    }
	 }
}

/** 切换一级分类和二级分类
 */
function switchCatLevel(CatLevel) {
	$("#Newpayout2 input[name='CategoryLevel']").val(CatLevel);
    $("#Newpayout2 .dValidation").html("");
	if (CatLevel == 1) {
		$(".parentclass").hide();
	} else {
		$("#dHideParent").show();
		$(".parentclass").show();
		$("#dHideParent").hide();
	}
}

/** 显示添加分类对话框
 * @param CatType 分类类型，0表示支出，1表示收入
 * @param CatLevel 分类级别
 * @param CatId1 主分类编号
 * @param CatId2 子分类编号 
 */
function addCategory(CatType, CatLevel, CatId1, CatId2) {
	showAdd("Newpayout2");
	$("#Newpayout2 input").val("");
	$("#Newpayout2 input[name='CategoryType']").val(CatType);
	$("#Newpayout2 input[name='CategoryLevel']").val(CatLevel);
	$("#classlevel li:nth-child(" + CatLevel + ")").click();

	$("#Newpayout2 input[name='classout']").siblings(".list").children(".option").hide();
	NewCatType = parseInt(CatType) + 1;
	$("#Newpayout2 input[name='classout']").siblings(".list").children(".option[cattype='" + NewCatType + "']").show();
    $("#Newpayout2 input[name='classout']").change(function() {
		$("#Newpayout2 .dValidation").html("");
	});
	if (((CatLevel == 1) && (CatId1 == 0)) || ((CatLevel == 2) && (CatId2 == 0))) {
		//新建分类
		if (CatType == 1) {
			$("#Newpayout2 h1").html("新建收入分类");
		} else {
			$("#Newpayout2 h1").html("新建支出分类");
		}
		if (CatLevel == 1) {
			//显示级别选择
			$("#dHideLevel").hide();
			$("#dHideParent").hide();
			firstItem = $("#Newpayout2 input[name='classout']").siblings(".list").children(".option[cattype='" + NewCatType + "']").first().attr("val");
			selectOption("#Newpayout2", "classout", firstItem);
		} else {
			//冻结级别选择
			$("#dHideLevel").show();
			$("#dHideParent").show();
			selectOption("#Newpayout2", "classout", CatId1);
		}
	} else {
		//编辑分类
		//冻结级别选择
		$("#dHideLevel").show();
		$("#dHideParent").hide();
		if (CatType == 1) {
			$("#Newpayout2 h1").html("编辑收入分类");
		} else {
			$("#Newpayout2 h1").html("编辑支出分类");
		}
		if (CatLevel == 1) {
			$("#Newpayout2 input[name='CategoryId']").val(CatId1);
			$("#Newpayout2 input[name='CategoryName']").val($("#tC" + CatType + " tr[mhclass='" + CatId1 + "'][mhparent='0']").attr("catname"));
		} else {
			$("#Newpayout2 input[name='CategoryId']").val(CatId2);
			$("#Newpayout2 input[name='CategoryName']").val($("#tC" + CatType + " tr[mhclass='" + CatId2 + "'][mhparent!='0']").attr("catname"));
			selectOption("#Newpayout2", "classout", CatId1);
		}
	}
}

/** 显示编辑收付款方对话框
 * @param PayeeId 收付款方编号
 */
function editPayee(PayeeId) {
	showAdd("Newsfkf");
	if (PayeeId == 0) {
		currentPayeeEditType = "add";
		$("#Newsfkf h1").html("新建收付款方");
		$("#Newsfkf input").val("");
	} else {
		currentPayeeEditType = "edit";
		$("#Newsfkf h1").html("编辑收付款方");
		targetRow = $("#tPayee tr[payeeid='" + PayeeId + "']");
		$("#Newsfkf input[name='PayeeName']").val(targetRow.children(".tSRCname").html());
		$("#Newsfkf input[name='PayeeTel']").val(targetRow.children("td:nth-child(2)").html());
		$("#Newsfkf input[name='PayeeEmail']").val(targetRow.children("td:nth-child(3)").html());
	}
	$("#Newsfkf input[name='PayeeId']").val(PayeeId);
}

/** 显示编辑金融机构对话框
 * @param BankType 金融机构类型
 * @param BankId 金融机构编号
 */
function editBank(BankType, BankId) {
	$("#Newscorporation input").val("");

	//编辑时不显示类型框
	if (BankId == 0) {
		currentBankEditType = "add";
		$("#Newscorporation input").val("");
		if (BankType >= 0) {
			$("#Newscorporation input[name='banktype']").parents(".sRDRInput").css("filter", "gray");
			$("#dHideBankType").show();
		} else {
			BankType = 0;
			$("#Newscorporation input[name='banktype']").parents(".sRDRInput").css("filter", "none");
			$("#dHideBankType").hide();
		}
	} else {
		currentBankEditType = "edit";
		//冻结类型选择
		$("#Newscorporation input[name='banktype']").parents(".sRDRInput").css("filter", "gray");
		$("#dHideBankType").show();
	}
	showAdd("Newscorporation");
	selectOption("#Newscorporation", "banktype", BankType);
	if (BankId == 0) {
		//新建一个银行
		$("#Newscorporation h1").html("新建金融机构");
	} else {
		//编辑一个银行
		$("#Newscorporation h1").html("编辑金融机构");
		targetRow = $("#tBank tr[bankid='" + BankId + "']");
		$("#Newscorporation input[name='BankName']").val(targetRow.children(".tSRCname").html());
		$("#Newscorporation input[name='BankWebsite']").val(targetRow.children("td:nth-child(3)").html());
	}
	$("#Newscorporation input[name='BankId']").val(BankId);
}

/** 显示删除账户对话框
 * @param tid 主账户类型 
 * @param aid 主账户
 * @param bid 子账户
 */
function showDeleteAccount(tid, aid, bid) {
	try{
	var accountName = ""; 
	if(tid == 2 || tid == 3){
		if(bid == 0) accountName = $("#tAT" + tid + " tr[accountid='" + aid + "'][subaccountid='0']").attr("accountname");
		else accountName = $("#tAT" + tid + " tr[accountid='" + aid + "'][subaccountid='" + bid + "']").attr("accountname");
	} else {
		accountName = $("#tAT" + tid + " tr[accountid='" + aid + "']").attr("accountname");
	}
	
	if ( confirm("重要提示：即将删除 '"+accountName+"' 在本机的全部数据。请您谨慎操作。") ) {
		if (bid == 0) {
			//删除主账户
			//handleDeleteAccount(tid, aid, bid);
			mergeAccount(tid, aid, bid);
		} else {
			if ($("#dSetAccount tr[accountid='" + aid + "'][subaccountid!='0']").length <= 1) {
				//只有一个子账户了，需要问用户一下
				if (confirm("删除此子账户后，主账户信息也将一并删除，是否确认？")) {
				    var flag = 1;
					//old
					//handleDeleteAccount(tid, aid, bid, flag);
					mergeAccount(tid, aid, bid);
				}
			} else {
				//有多个子账户，直接删了吧
				mergeAccount(tid, aid, bid);
				//old
				//handleDeleteAccount(tid, aid, bid);
			}
		}
	}
	}catch(e){
        logCatch(e.toString());
		debug(e.message);
	}
}

/** 显示删除分类对话框
 * @param CatType 分类类型，0表示支出，1表示收入
 * @param CatLevel 分类级别
 * @param PayeeId 收付款方编号
 */
function showDeleteCategory(CatType, CatLevel, CatId) {
	showAdd("Delclass");
	$("#Delclass input[name='CategoryType']").val(CatType);
	$("#Delclass input[name='CategoryLevel']").val(CatLevel);
	$("#Delclass input[name='CategoryId']").val(CatId);

	$("#Delclass input[name='category']").siblings(".list").children(".option").hide();
	$("#Delclass input[name='category']").siblings(".list").children(".option[cattype='" + CatType + "']").show();
	//隐藏该分类自身
	if (CatLevel == 1) {
		$("#Delclass input[name='category']").siblings(".list").children("div[parentclass='" + CatId + "']").hide();
	} else {
		$("#Delclass input[name='category']").siblings(".list").children("div[val='" + CatId + "']").hide();
	}
	if (CatLevel == 1) {
		if (CatType == 1) {
			selectOption("#Delclass", "category", 10066);
		} else {
			selectOption("#Delclass", "category", 10065);
		}
	} else {
		//找到它父亲的子分类编号
		parentId = $("#Delclass input[name='category']").siblings(".list").children("div[val='" + CatId + "']").attr("parentclass");
		parentSubId = $("#Delclass input[name='category']").siblings(".list").children("div[parentclass='" + parentId + "']:first").attr("val");
		selectOption("#Delclass", "category", parentSubId);
	}
}

/** 显示删除收付款方对话框
 * @param PayeeId 收付款方编号
 */
function showDeletePayee(PayeeId) {
	$("#Delsfkf input[name='payee']").siblings(".list").children("div").show();
	showAdd("Delsfkf");
	$("#Delsfkf input[name='PayeeId']").val(PayeeId);
	$("#Delsfkf input[name='payee']").siblings(".list").children("div[val='" + PayeeId + "']").hide();
	selectOption("#Delsfkf", "payee", 0);
	debug("debug_for_2 = "+$("#Delsfkf").html());
}

/** 添加子账户
 * @param TypeId 账户类型
 */ 
function handleAddSA(TypeId) {
	var AccountId = $("#newsa" + TypeId + "_form input[name='AccountId']").val();

	if (TypeId < 100) {
		//主账户
		var AccountName = $("#newsa" + TypeId + "_form input[name='AccountName']").val();
		if ((TypeId == 2) || (TypeId == 3) || (TypeId == 4) || (TypeId == 5)) {
			//如果是银行卡或信用卡或支付或者投资，则有机构号
			BankId = $("#newsa" + TypeId + "_form input[name='bank']").val();
		} else {
			BankId = 0;
		}
		//除信用卡和储蓄卡，其余账户皆有一个唯一子账户
		var SubAccountId = 0;
		if ((TypeId != 2) && (TypeId != 3)) {
			SubAccountId = $("#newsa" + TypeId + "_form input[name='SubAccountId']").val();
		}

        var Comment = $("#newsa" + TypeId + "_form textarea[name='description']").val(); 
		if (AccountId == 0) {
			//新建主账户
			//添加进数组
			if (TypeId == 2) {
				//信用卡
				$("#suba2 .dRightTable tr:not(.trNewCreditSub)").each(function () {
					var sign = createTimeRandom();
					var temp = new Array();
					tempCur = $(this).find('#currency').val();
					temp.push(tempCur);
					if ($(this).find("input[name='amount']").val() == "") {
						temp.push("0.00");
					} else {
						temp.push($(this).find("input[name='amount']").val());	
					}
					temp.push("201");
					temp.push("");
					temp.push("");
					//信用卡类型时，子账户名称用币种名称代替
					temp.push(getCurrencyDesc(tempCur));
					temp.push(sign); //没有子账户ID时，生成随机数，这个很害人！
					temp.push("");
					temp.push("");
					subAccount.push(temp);
				});
			}
			//添加进数据库
			AccountId = submitAddAccount(TypeId);
		
			//添加进列表
			if ((TypeId == 2) || (TypeId == 3)) {
				//一个账户可能对应多个子账户的
				content = GenerateAccount(TypeId, 0, AccountId, 0, 1, AccountName, Comment, 1, 0, BankId);
				$("#tAT" + TypeId).append(content);
				$.each(subAccount, function(i, n) {
					if (TypeId == 2) {
						content = GenerateAccount(TypeId, subAccount[i][2], AccountId, subAccount[i][6], 0, subAccount[i][5], subAccount[i][7], subAccount[i][0], formatnumber(0 - parseFloat(subAccount[i][1]), 2), 0, subAccount[i][3], subAccount[i][4]);
					} else {
						content = GenerateAccount(TypeId, subAccount[i][2], AccountId, subAccount[i][6], 0, subAccount[i][5], subAccount[i][7], subAccount[i][0], formatnumber(subAccount[i][1], 2), 0, subAccount[i][3], subAccount[i][4]);
					}
					$("#tAT" + TypeId).append(content);
				});

				//计算主账户总金额
				var totalAmount = 0;
				$("#tAT" + TypeId + " tr[accountid='" + AccountId + "'][subaccountid!='0']").each(function () {
					totalAmount += Math.round(getRMBExchangeInfo2($(this).attr("currency")) * parseFloat($(this).children(".tSRBamount").html())) / 100;
				});
				totalAmount = formatnumber(totalAmount, 2);   
				$("#tAT" + TypeId + " tr[accountid='" + AccountId + "'][subaccountid='0']").children(".tSRBamount").html(totalAmount);
			} else {
				//一个账户只有一个子账户的
				var Balance = $("#newsa" + TypeId + "_form input[name='balance']").val();
				var CurrencyId = $("#newsa" + TypeId + "_form input[name='currency']").val();

				if (TypeId == 7) Balance = -Balance;
				content = GenerateAccount(TypeId, 0, AccountId, newSubAccountId, 0, AccountName, Comment, CurrencyId, Balance, BankId);//此处需要添加期限和到期日
				$("#tAT" + TypeId).append(content);
			}
			$("#dAT" + TypeId).show();
		} else {
			//编辑主账户
			//更新进数据库
			submitEditAccount(TypeId);
			//编辑提醒事件
			editEvent(TypeId);
			//更新进列表
			if ((TypeId != 2) && (TypeId != 3)) {
				//如果不是信用卡或储蓄卡
				Balance = $("#tAT" + TypeId + " tr[accountid='" + AccountId + "'][subaccountid='" + SubAccountId + "']").children(".tSRBamount").html();
				var CurrencyId = $("#newsa" + TypeId + "_form input[name='currency']").val();
				content = GenerateAccount(TypeId, 0, AccountId, SubAccountId, 0, AccountName, Comment, CurrencyId, Balance, BankId);
			} else {
				//如果是信用卡或储蓄卡
				//如果是折叠状态，先打开
				if ($("#tAT" + TypeId + " tr[accountid='" + AccountId + "'][subaccountid='0']").find(".iTree").attr("src").indexOf("tree2.gif") != -1) {
					var myTR = $("#tAT" + TypeId + " tr[accountid='" + AccountId + "'][subaccountid='0']");
					myTR.find(".iTree").attr("src", "../images/tree1.gif");
					myTR.siblings("tr[accountid='" + myTR.attr("accountid") + "'][subaccountid!='0']").show();
				}
				Balance = $("#tAT" + TypeId + " tr[accountid='" + AccountId + "'][subaccountid='0']").children(".tSRBamount").html();
				content = GenerateAccount(TypeId, 0, AccountId, SubAccountId, 1, AccountName, Comment, 1, Balance, BankId);
			}
			$("#tAT" + TypeId + " tr[accountid='" + AccountId + "'][subaccountid='" + SubAccountId + "']").replaceWith(content);
		}

		//新建子账户按钮
		$(".newsubaccount").unbind("click").click(function(event) {
			event.stopPropagation();
			if ($(this).attr("atid") == 2) {
				//显示信用卡子账户窗口
				AddSA(201, $(this).parents(".tSRBrow").attr('accountid'), 0);
			} else {
				//显示借记卡子账户窗口
				$(".tSRSubaccount").find("li").attr("accountid", $(this).parents(".tSRBrow").attr("accountid"));
				$(".tSRSubaccount").css("top", $(this).offset().top + 20);								   
				$(".tSRSubaccount").toggle();
			}								   
		});
	} else {
		//子账户
		var SubAccountId = $("#newsa" + TypeId + "_form input[name='SubAccountId']").val();
		if (SubAccountId == 0) {
			//新建子账户
			if (TypeId == 201) AccountType = 2;
			else AccountType = 3;
			var name = $("#newsa3 input[name = 'AccountName']").val(),
		        subName = $("#newsa" + TypeId + " input[name = 'subName']").val(),
		        enddate = $("#newsa" + TypeId + " input[name = 'sdate']").val(),
			    eventParam = {};
			/*当建立定期和理财账户时，如果是在新建主账户时建立，
			 则此时添加提醒事件，并不加入数据库中，等待提交主张时一并提交提醒事件，
			 此处只更新列表*/
			if (enddate != ""){
                eventParam.enddate = enddate;
				if($("#newsa" + TypeId + " .sCheckBox").hasClass("sCheckBox2") == true && AccountType == 3){	
					var alarm = $("#newsa" + TypeId + " span[id = 'rmday']").text();
					eventParam.name    = name;
					eventParam.subName = subName;
					eventParam.alarm   = alarm;
				}
			}
			//添加进数组
			var SubAccountInfo = addSubAccount(AccountType, TypeId, eventParam);
			viewAddSubAccount(AccountType);
			//添加进数据库
			if (AccountId > 0) {
			    //如果是折叠状态，先打开
			    if ($("#tAT" + AccountType + " tr[accountid='" + AccountId + "'][subaccountid='0']").find(".iTree").attr("src").indexOf("tree2.gif") != -1) {
					var myTR = $("#tAT" + AccountType + " tr[accountid='" + AccountId + "'][subaccountid='0']");
					myTR.find(".iTree").attr("src", "../images/tree1.gif");
					myTR.siblings("tr[accountid='" + myTR.attr("accountid") + "'][subaccountid!='0']").show();
			    }
				if (AccountType == 2) {
					SubAccountId = addAccountSub(AccountId, SubAccountInfo[0], 0-SubAccountInfo[1], 0-SubAccountInfo[1], SubAccountInfo[3], SubAccountInfo[4], SubAccountInfo[2], SubAccountInfo[5], SubAccountInfo[7]);
				} else {
					SubAccountId = addAccountSub(AccountId, SubAccountInfo[0], SubAccountInfo[1], SubAccountInfo[1], SubAccountInfo[3], SubAccountInfo[4], SubAccountInfo[2], SubAccountInfo[5], SubAccountInfo[7]);
				}
			}
			/*当建立定期和理财账户时，如果是在已建立主账户列表上建立，则直接添加提醒事件*/
			if (enddate != ""){
			   addEnddate(TypeId, enddate, AccountId, SubAccountId);
			   if(($("#newsa" + TypeId + " .sCheckBox").hasClass("sCheckBox2")) && (AccountType == 3) && ($("#suba3boxBg").css("display") == "none")) {	
			     name = $("#tAT" + AccountType + " tr[accountid = '" + AccountId + "']").attr("accountname");
				 var result = addInvestEvent(name, subName, enddate, alarm, AccountId, SubAccountId, 3);
			   }
			}
			//添加进列表
			if (AccountType == 2) {
				content = GenerateAccount(AccountType, SubAccountInfo[2], AccountId, SubAccountId, 0, SubAccountInfo[5], SubAccountInfo[7], SubAccountInfo[0], formatnumber(0 - parseFloat(SubAccountInfo[1]), 2), 0, SubAccountInfo[3], SubAccountInfo[4]);
			} else {
				content = GenerateAccount(AccountType, SubAccountInfo[2], AccountId, SubAccountId, 0, SubAccountInfo[5], SubAccountInfo[7], SubAccountInfo[0], SubAccountInfo[1], 0, SubAccountInfo[3], SubAccountInfo[4]);
			}
			$("#tAT" + AccountType + " tr[accountid = '" + AccountId + "']").last().after(content);
		} else {
			//编辑子账户
			if (TypeId == 201) AccountType = 2;
			else AccountType = 3;
            var eventParam = {};
			if (AccountType == 3) {
	            var name = $("#newsa3 input[name = 'AccountName']").val();
				var subName = $("#newsa" + TypeId + " input[name = 'subName']").val();
				var enddate = $("#newsa" + TypeId + " input[name = 'sdate']").val();
				if (enddate != "" && $("#newsa" + TypeId + " .sCheckBox").hasClass("sCheckBox2") == true){
				    var alarm = $("#newsa" + TypeId + " span[id = 'rmday']").text();
					eventParam.name    = name;
					eventParam.subName = subName;
					eventParam.enddate = enddate;
					eventParam.alarm   = alarm;
				}
			}
			//更新进数据库
			var subPosition = 0;
			for (i = 0; i < subAccount.length; i++) {
				if (subAccount[i][6] == SubAccountId) {
					subPosition = i;
				}
			}
			var SubAccountInfo = addSubAccount(AccountType, TypeId, eventParam);
			subAccount.pop();
			subAccount.splice(subPosition, 1, SubAccountInfo);
			viewAddSubAccount(AccountType);
			
			result = editAccountSub(SubAccountId, SubAccountInfo[3], SubAccountInfo[4], SubAccountInfo[2], SubAccountInfo[5], SubAccountInfo[7], AccountType);
			//更新进列表
			var Balance = $("#tAT" + AccountType + " tr[accountid='" + AccountId + "'][subaccountid='" + SubAccountId + "']").children(".tSRBamount").html();
			var Currency = $("#tAT" + AccountType + " tr[accountid='" + AccountId + "'][subaccountid='" + SubAccountId + "']").attr("currency");
			content = GenerateAccount(AccountType, SubAccountInfo[2], AccountId, SubAccountId, 0, SubAccountInfo[5], SubAccountInfo[7], Currency, Balance, 0, SubAccountInfo[3], SubAccountInfo[4]);
            //编辑提醒事件
			editEvent(TypeId);
            $("#tAT" + AccountType + " tr[accountid = '" + AccountId + "'][subaccountid = '" + SubAccountId + "']").replaceWith(content);
		}
		//4.0修改3.1bug,添加完子账户之后进入渲染更新主账户的id
		renderAccountPageAmount(AccountType,AccountId);
	}

	//点击三角时的动作	
	$(".iTree").unbind().toggle(function() {
		var myTR = $(this).parents(".tSRBrow");
		$(this).attr("src", "../images/tree2.gif");
		myTR.siblings("tr[mhparent='" + myTR.attr("mhclass") + "']").hide();
		myTR.siblings("tr[accountid='" + myTR.attr("accountid") + "'][subaccountid!='0']").hide();
	}, function() {
		var myTR = $(this).parents(".tSRBrow");
		$(this).attr("src", "../images/tree1.gif");
		myTR.siblings("tr[mhparent='" + myTR.attr("mhclass") + "']").show();
		myTR.siblings("tr[accountid='" + myTR.attr("accountid") + "'][subaccountid!='0']").show();
	});
	//通知记账页
	try {
		MoneyHubJSFuc("SetParameter","AccountChanged", "1");
	} catch (e) {
        logCatch(e.toString());
	}
	adjustAccountWidth();
}

/** 处理添加或编辑分类
 */
function handleAddMyCategory() {
	var CategoryId = $("#Newpayout2_form input[name='CategoryId']").val();
	var CategoryName = $("#Newpayout2_form input[name='CategoryName']").val();
	var CategoryType = $("#Newpayout2_form input[name='CategoryType']").val();
	var CategoryLevel = $("#Newpayout2_form input[name='CategoryLevel']").val();
    var NewParentName = $("#Newpayout2_form input[name='classout']").siblings(".label").html();
	content = "";
	var id2 = 0;
	if (CategoryId != 0) {
		//编辑态
		//更新数组
		if (CategoryLevel == 1) {
			//更新一级分类
			//如果是折叠状态，先打开
			if ($("#tC" + CategoryType + " tr[mhclass='" + CategoryId + "'][mhparent='0']").find(".iTree").attr("src").indexOf("tree2.gif") != -1) {
				var myTR = $("#tC" + CategoryType + " tr[mhclass='" + CategoryId + "'][mhparent='0']");
				myTR.find(".iTree").attr("src", "../images/tree1.gif");
				myTR.siblings("tr[mhparent='" + myTR.attr("mhclass") + "']").show();
			}

			//更新数据库
			updateCategory(CategoryLevel, CategoryName, CategoryId);
			//更新列表
			content = GenerateCategory(CategoryType, CategoryId, 0, CategoryName, "CATA420");
			$("#tC" + CategoryType + " tr[mhclass='" + CategoryId + "'][mhparent='0']").replaceWith(content);
			id2 = $("#Delclass .select .list .firstCat[parentclass='" + CategoryId + "']").attr("val");
			//更新到下拉框中
			NewCategoryType = parseInt(CategoryType) + 1;
			editOption("#Newpayout2", "classout", CategoryId, CategoryName, "cattype=" + NewCategoryType);
			editOption("#Delclass", "category", id2, CategoryName, "cattype=" + CategoryType + " parentclass='" + CategoryId + "' mhvalue='" + CategoryName + "'", " firstCat");
			$("#Delclass .secondCat[parentclass='" + CategoryId + "']").each(function () {
				var oldName = $(this).attr("mhvalue");
				$(this).attr("mhvalue", CategoryName + " : " + oldName.substr(oldName.indexOf(" : ") + 3));
			});
		} else {
			//更新二级分类
			var NewParent = $("#Newpayout2_form input[name='classout']").val();
			var OldParent = $("#tC" + CategoryType + " tr[mhclass='" + CategoryId + "'][mhparent!='0']").attr("mhparent");
			//更新数据库
			updateCategory(CategoryLevel, CategoryName, CategoryId, NewParent);
			//更新列表
			content = GenerateCategory(CategoryType, NewParent, CategoryId, "", CategoryName);
			if (NewParent == OldParent) {
				$("#tC" + CategoryType + " tr[mhclass='" + CategoryId + "'][mhparent!='0']").replaceWith(content);
				//更新到下拉框中
				editOption("#Delclass", "category", CategoryId, CategoryName, "cattype=" + CategoryType + " parentclass='" + NewParent + "' mhvalue='" + NewParentName + " : " + CategoryName + "'", " secondCat");
			} else {
				$("#tC" + CategoryType + " tr[mhclass='" + CategoryId + "'][mhparent!='0']").remove();
				$("#tC" + CategoryType + " tr[mhclass='" + NewParent + "'][mhparent='0']").after(content);
				//更新到下拉框中
				editOption("#Delclass", "category", CategoryId, CategoryName, "cattype=" + CategoryType + " parentclass='" + NewParent + "' mhvalue='" + NewParentName + " : " + CategoryName + "'", " secondCat", $("#Delclass .select .list .firstCat[parentclass='" + NewParent + "']"));
			}
		}
	} else {
		//新建态
		if (CategoryLevel == 1) {
			//添加一级分类
			//添加到数据库中
			var id1 = addCategory1(CategoryName, CategoryType);
			if (id1) {
				//添加成功
				//开始添加二级分类
				id2 = addCategory2(id1, "CATA420");
				//添加到列表中
				content = GenerateCategory(CategoryType, id1, id2, CategoryName, "CATA420");
				$("#tC" + CategoryType).append(content);
				//添加到下拉框中
				NewCategoryType = parseInt(CategoryType) + 1;
				addOption("#Newpayout2", "classout", id1, CategoryName, "cattype=" + NewCategoryType);
				addOption("#Delclass", "category", id2, CategoryName, "cattype=" + CategoryType + " parentclass='" + id1 + "' mhvalue='" + CategoryName + "'", " firstCat");
			}
		} else {
			//添加二级分类
			var id1 = $("#Newpayout2_form input[name='classout']").val();
			//如果是折叠状态，先打开
			if ($("#tC" + CategoryType + " tr[mhclass='" + id1 + "'][mhparent='0']").find(".iTree").attr("src").indexOf("tree2.gif") != -1) {
				var myTR = $("#tC" + CategoryType + " tr[mhclass='" + id1 + "'][mhparent='0']");
				myTR.find(".iTree").attr("src", "../images/tree1.gif");
				myTR.siblings("tr[mhparent='" + myTR.attr("mhclass") + "']").show();
			}
			//添加到数据库中
			id2 = addCategory2(id1, CategoryName);
			//添加到列表中
			content = GenerateCategory(CategoryType, id1, id2, "", CategoryName);
			if ($("#tC" + CategoryType + " tr[mhparent='" + id1 + "']").length > 0) {
				$("#tC" + CategoryType + " tr[mhparent='" + id1 + "']").last().after(content);
			} else {
				$("#tC" + CategoryType + " tr[mhclass='" + id1 + "'][mhparent='0']").after(content);
			}
			//添加到下拉框中


			addOption("#Delclass", "category", id2, CategoryName, "cattype=" + CategoryType + " parentclass='" + id1 + "' mhvalue='" + NewParentName + " : " + CategoryName + "'", " secondCat", $("#Delclass .select .list .firstCat[parentclass='" + id1 + "']"));
		}
	}
	//点击三角时的动作	
	$(".iTree").unbind().toggle(function() {
		var myTR = $(this).parents(".tSRBrow");
		$(this).attr("src", "../images/tree2.gif");
		myTR.siblings("tr[mhparent='" + myTR.attr("mhclass") + "']").hide();
		myTR.siblings("tr[accountid='" + myTR.attr("accountid") + "'][subaccountid!='0']").hide();
	}, function() {
		var myTR = $(this).parents(".tSRBrow");
		$(this).attr("src", "../images/tree1.gif");
		myTR.siblings("tr[mhparent='" + myTR.attr("mhclass") + "']").show();
		myTR.siblings("tr[accountid='" + myTR.attr("accountid") + "'][subaccountid!='0']").show();
	});
	
	adjustPayWidth();
	try {
		MoneyHubJSFuc("SetParameter","CategoryChanged", "" + id2);
	} catch (e) {
        logCatch(e.toString());
	}
	if ((showAddCategory != undefined) && (showAddCategory != "-1")) {
		//从哪儿来的，回哪儿去
		window.open('index.html');
	}
}

/** 添加,编辑收付款方事件
 */
function handleAddMyPayee() {
	var payeeId = $("input[name='PayeeId']").val();
	var newPayee = $("input[name='PayeeName']").val();
	var payeeMail = $("input[name='PayeeEmail']").val();
	var payeeTel = $("input[name='PayeeTel']").val();
	if (payeeId != 0) {
		//编辑态
		//更新到数据库中
		updatePayee(payeeId, newPayee, payeeMail, payeeTel);
		//更新到列表中
		content = GeneratePayee(payeeId, newPayee, payeeTel, payeeMail);
		$("#tPayee tr[payeeid='" + payeeId + "']").replaceWith(content);
		//更新到下拉框中
		editOption("#Delsfkf", "payee", payeeId, newPayee.replace(/&/g,"&amp;"), "", "");
	} else {
		//新建态
		//添加到数据库中
		payeeId = addNewPayee(newPayee, payeeMail, payeeTel);
		//添加到列表中
		content = GeneratePayee(payeeId, newPayee, payeeTel, payeeMail);
		if ($("#tPayee tr").length == 1) {
			$("#tPayee").append(content);
		} else {
			newPayeePinyin = getGB2312Spell(newPayee);
			var foundPosition = false;
			$("#tPayee tr").each(function () {
				if (newPayeePinyin < $(this).attr("payeepinyin")) {
					$(this).before(content);
					foundPosition = true;
					return false;
				}
			});
			if (!foundPosition) $("#tPayee").append(content);	
		}
		//添加到下拉框中
		addOption("#Delsfkf", "payee", payeeId, newPayee.replace(/&/g,"&amp;"), "", "");
	}
	try {
		MoneyHubJSFuc("SetParameter","PayeeChanged", "" + payeeId);
	} catch (e) {
        logCatch(e.toString());
	}
	if ((showAddPayee != undefined) && (showAddPayee != "-1")) {
		//从哪儿来的，回哪儿去
		window.open('index.html');
	}
}

/** 添加,编辑金融机构事件
 */
function handleAddMyBank() {
	var BankId = $("input[name='BankId']").val();
	var BankName = $("input[name='BankName']").val().substr(0, 30);
	var BankWebsite = $("input[name='BankWebsite']").val();
	var BankType = $("input[name='banktype']").val();
	if (BankId != 0) {
		//编辑态
		//更新数据库
		updateBank(BankId, BankName, BankWebsite);
		//更新列表
		content = GenerateBank(BankId, BankName, BankType, BankWebsite);
	 	$("#tBank tr[bankid='" + BankId + "']").replaceWith(content);
		//更新到下拉框中
		if (BankType == classBank) {
			editOption("#newsa2", "bank", BankId, BankName);
			editOption("#newsa3", "bank", BankId, BankName);
		} else if (BankType == classPay) {
			editOption("#newsa4", "bank", BankId, BankName);
		} else {
			editOption("#newsa5", "bank", BankId, BankName);
		}
	} else {
		//新建态
		//添加到数据库中
		BankId = insertBank(BankName, BankType,BankWebsite);
		//添加到列表中
		content = GenerateBank(BankId, BankName, BankType, BankWebsite);
		if ($("#tBank tr").length == 1) {
			$("#tBank").append(content);
		} else {
			foundPosition = false;
			NewBankNamePinyin = getGB2312Spell(BankName);
			if (BankType == 0) {
				$("#tBank tr").each(function(){
					if (NewBankNamePinyin < $(this).attr("BankNamePinyin") && BankType == $(this).attr("banktype1")) {
						foundPosition = true;
						$(this).before(content);
						return false;
					} else if ($(this).attr("banktype1") == 2) {
						foundPosition = true;
						$(this).before(content);
						return false;
					} else if ($(this).attr("banktype1") == 1) {
			  			foundPosition = true;
						$(this).before(content);
						return false;
					}														
				});
			} else if (BankType == 2) {
				$("#tBank tr").each(function() {
					if (NewBankNamePinyin < $(this).attr("BankNamePinyin") && BankType == $(this).attr("banktype1")){
						foundPosition = true;
						$(this).before(content);
						return false;
					} else if ($(this).attr("banktype1") == 1) {
				  		foundPosition = true;
						$(this).before(content);
				  		return false;
					}														
				});
			} else if (BankType == 1) {
				$("#tBank tr").each(function(){
					if (NewBankNamePinyin < $(this).attr("BankNamePinyin") && BankType == $(this).attr("banktype1")) {
						foundPosition = true;
						$(this).before(content);
						return false;
					}														
				});
			}      
			if (foundPosition == false) {
				$("#tBank").append(content);
			}
		}
		//添加到下拉框中
		if (BankType == classBank) {
			addOption("#newsa2", "bank", BankId, BankName);
			addOption("#newsa3", "bank", BankId, BankName);
			selectOption("#newsa2", "bank", BankId);
			selectOption("#newsa3", "bank", BankId);
		} else if (BankType == classPay) {
			addOption("#newsa4", "bank", BankId, BankName);
			selectOption("#newsa4", "bank", BankId);
		} else {
			addOption("#newsa5", "bank", BankId, BankName);
			selectOption("#newsa5", "bank", BankId);
		}
	}
}

/** 删除账户
 * @param tid 主账户类型 
 * @param aid 主账户
 * @param bid 子账户
 * @param flag 判断是否提醒事件是否删除
 */
function handleDeleteAccount(tid, aid, bid, flag) {
	if (bid == 0) {
		//删除主账户
		//从列表中删除
		var name = $("#tAT" + tid + " tr[accountid='" + aid + "']").attr("accountname");
		$("#tAT" + tid + " tr[accountid='" + aid + "']").remove();
        deleteEvent(aid);
		//从数据库中删除
		deleteAccount(aid);
	} else {
		//删除子账户
		//删除数组中该项
		$.each(listAccount, function(i, n) {
			if (n.bid == bid) {
				listAccount.splice(i, 1);
				return false;
			}
		});
		//从列表中删除
		if (tid == 3){
            deleteEvent(aid, bid);
		}else if (tid == 2){
		    if ((flag != undefined) && (flag == 1))//只有一个子账户时删除提醒事件
			   deleteEvent(aid);
		}
		$("#tAT" + tid + " tr[subaccountid='" + bid + "'][accountid='" + aid + "']").remove();
		if ($("#tAT" + tid + " tr[subaccountid!='0'][accountid='" + aid + "']").length == 0) {
			$("#tAT" + tid + " tr[subaccountid='0'][accountid='" + aid + "']").remove();
		}
		//从数据库中删除
		deleteSubAccount(aid, bid);
		//4.0修改3.1bug，删除子账户时更新主账户余额
		renderAccountPageAmount(tid,aid);
		
	}
	if ($("#tAT" + tid + " tr").length <= 0) $("#dAT" + tid).hide();
	//通知记账页
	try {
		MoneyHubJSFuc("SetParameter","AccountChanged", "1");
	} catch (e) {
        logCatch(e.toString());
	}
}

/** 删除分类
 */
function handleDeleteMyCategory() {
	var CategoryType = $("#Delclass_form input[name='CategoryType']").val();
	var CategoryLevel = $("#Delclass_form input[name='CategoryLevel']").val();
	var CategoryId = $("#Delclass_form input[name='CategoryId']").val();

	if ($("#Delclass_form .radio").attr("status") == 0) {
		//替换分类为
		var newCategory = $("#Delclass_form input[name='category']").val();
		try {
			if (CategoryLevel == 1) {
				MoneyHubJSFuc("ExecuteSQL","UPDATE tbTransaction SET UT = " + getUT() + ", tbCategory2_id=" + newCategory + " WHERE tbCategory2_id IN (SELECT id FROM tbCategory2 WHERE tbcategory1_id=" + CategoryId + ")");//new
			} else {
				MoneyHubJSFuc("ExecuteSQL","UPDATE tbTransaction SET UT = " + getUT() + ", tbCategory2_id=" + newCategory + " WHERE tbCategory2_id=" + CategoryId);//new
			}
		} catch (e) {
            logCatch(e.toString());
		}
	} else {
		//删除所有与此分类相关联的交易
        var lSubAccount = "";
		try {
			if (CategoryLevel == 1) {
				//找出所有与此分类相关联的子账户
		        lSubAccount = JSON.parse(MoneyHubJSFuc("QuerySQL","SELECT DISTINCT tbSubAccount_id AS id FROM tbTransaction WHERE mark = 0 and tbCategory2_id IN (SELECT id FROM tbCategory2 WHERE tbcategory1_id=" + CategoryId + ")"));
				MoneyHubJSFuc("ExecuteSQL","UPDATE tbTransaction SET mark = 1, UT = " + getUT() + " WHERE mark = 0 AND tbCategory2_id IN (SELECT id FROM tbCategory2 WHERE mark = 0 and tbcategory1_id=" + CategoryId + ")");//new
			} else {
		        lSubAccount = JSON.parse(MoneyHubJSFuc("QuerySQL","SELECT DISTINCT tbSubAccount_id AS id FROM tbTransaction WHERE tbCategory2_id=" + CategoryId));
				MoneyHubJSFuc("ExecuteSQL","UPDATE tbTransaction SET mark = 1, UT = " + getUT() + " WHERE mark = 0 and tbCategory2_id=" + CategoryId);//new
			}
		} catch (e) {
            logCatch(e.toString());
		}
		//计算被删除的分类所关联的子账户的余额
		$.each(lSubAccount, function(i, n) {
			modifySubAccountBalance(n.id);
		});
	}

	//删除下拉框中的该选项
	if (CategoryLevel == 1) {
		$("#Newpayout2 input[name='classout']").siblings(".list").children("div[val='" + CategoryId + "']").remove();
		$("#Delclass_form input[name='category']").siblings(".list").children("div[parentclass='" + CategoryId + "']").remove();
	} else {
		$("#Delclass_form input[name='category']").siblings(".list").children("div[val='" + CategoryId + "']").remove();
	}
	//从列表中删除
	if (CategoryLevel == 1) {
		$("#tC" + CategoryType + " tr[mhclass='" + CategoryId + "'][mhparent='0']").remove();
		$("#tC" + CategoryType + " tr[mhparent='" + CategoryId + "']").remove();
	} else {
		$("#tC" + CategoryType + " tr[mhclass='" + CategoryId + "'][mhparent!='0']").remove();
	}
	//从数据库中删除
	deleteCategory(CategoryLevel, CategoryId);
	
	//通知记账页
	try {
		MoneyHubJSFuc("SetParameter","CategoryChanged", "1");
	} catch (e) {
        logCatch(e.toString());
	}
}

/** 删除支付对象
 */
function handleDeleteMyPayee() {
	var payeeId = $("#Delsfkf_form input[name='PayeeId']").val();
	if ($("#Delsfkf_form .radio").attr("status") == 0) {
		//替换收付款人为
		var newPayee = $("#Delsfkf_form input[name='payee']").val();
		try {
			//修改了bug3107，增加了删除payee时的判断条件mark=0
			var UT = getUT();
			MoneyHubJSFuc("ExecuteSQL","UPDATE tbTransaction SET UT = " + UT + ", tbPayee_id=" + newPayee + " WHERE  mark = 0 and tbPayee_id=" + payeeId);//new
		} catch (e) {
            logCatch(e.toString());
		}
	} else {
		//删除所有与此收付款人相关联的交易
		try {
			var UT = getUT();
			MoneyHubJSFuc("ExecuteSQL","UPDATE tbTransaction SET mark = 1, UT = " + UT + " WHERE mark = 0 and tbPayee_id=" + payeeId)//new
			//alert("UPDATE tbTransaction SET mark = 1, UT = " + getUT() + " WHERE mark = 0 and tbPayee_id=" + payeeId);
		} catch (e) {
            logCatch(e.toString());
		}
		$("#dSetAccount tr[subaccountid!=0]").each(function () {
			modifySubAccountBalance($(this).attr("subaccountid"));
		});
	}
	//删除下拉框中的该选项
	$("#payee").siblings(".list").children("div[val='" + payeeId + "']").remove();
	//删除数组中该项
	$.each(listPayee, function(i, n) {
		if (n.id == payeeId) {
			listPayee.splice(i, 1);
			return false;
		}
	});
	//从列表中删除
	$("#tPayee tr[payeeid='" + payeeId + "']").remove();
	//从数据库中删除
	deletePayee(payeeId);

	//通知记账页
	try {
		MoneyHubJSFuc("SetParameter","PayeeChanged", "1");
	} catch (e) {
        logCatch(e.toString());
	}
}

/** 删除金融机构
 * @param BankType 金融机构类型
 * @param BankId 金融机构编号
 */
function handleDeleteBank(BankType, BankId) {
	if ($("#dSetAccount tr[bankid='" + BankId + "']").length > 0) {
		alert("此金融机构已与账户关联，不可删除");
	} else {
		if (confirm("将删除此金融机构，确定要删除吗?")){
			//删除下拉框中的该选项
			$(".addBox input[name='bank']").siblings(".list").children("div[val='" + BankId + "']").remove();
			//从列表中删除
			$("#tBank tr[bankid='" + BankId + "']").remove();
			//从数据库中删除
			deleteBank(BankId);
		}
	}
}

/** 处理子账户的显示区
 * @param id 主账户类型
 */
function viewAddSubAccount(id) {
	//渲染子账户列表
	renderSubAccountView(id);
}

/** 取得截止期限内容
 * @id 编号
 */
function getDuringDesc(id) {
	var result = "";
	$.each(duringData, function(i, n) {
		if(id == n.id) {
			result = n.Name;
		}
	});
	return result;
}

/** 删除信用卡子账户响应事件
 * @param deleteButton 删除按钮节点
 */
function deleteCreditSubAccount(deleteButton) {
	deleteButton.parents('tr').remove();
	$('#suba2 .trNewCreditSub').show();
	if ($("#suba2 tr").length == 3) {
		$("#suba2 .delete").hide();
	} else {
		$("#suba2 .delete").show();
	}
}

/** 根据数据生成子账户列表区
 * @param id 主账户类型
 */
function renderSubAccountView(id) {
	if (id == 2) {
		//信用卡
		$("#suba2 .dRTTable tr").html("<td width='170'>币种</td><td width='90'>初始欠款</td><td>&nbsp;</td>");
		$("#suba2 .dRightTable").html("<tr class='trNewCreditSub'><td width='170'>&nbsp;</td><td width='90'>&nbsp;</td><td>&nbsp;</td></tr>");
		$("#suba2 .trNewCreditSub").click(function () {
			if ($("#suba2 tr").length < 8) {
				content = '<tr mhcontent="true"><td width="170"><div><select name="currency"></select></div></td>'
					+ '<td width="90"><div class="selectCurrency"><div class="dRDRInput"><input type="text" name="amount" value="0.00"/></div></div></td>'
					+ '<td class="tSRCfunction"><div class="dFunction">'
					+ '<img class="delete" onclick="deleteCreditSubAccount($(this));" src="images/delete.gif">'
					+ '</div></td></tr>';
				content = $(content);
				$(this).before(content);
				//设置币种下拉框
				$.each(listCurrency, function(i, n) {
					content.find("select[name='currency']").append("<option value='" + n.id + "'>" + n.Name + "</option>");		
				});
				content.find("input[name='amount']").focusout(function () {
					if (isNaN(parseFloat($(this).val())) || !isFinite($(this).val())) {
						alert("初始欠款输入有误！");
					} else {
						//取数字的前两位小数点
						var numberBeforePoint = 0;
						if ($(this).val().indexOf(".") != -1) {
							numberBeforePoint = $(this).val().substring(0, $(this).val().indexOf("."));
							$(this).val(numberBeforePoint + "." + $(this).val().substr($(this).val().indexOf(".") + 1, 2));
						}
						$(this).val(formatnumber(parseFloat($(this).val()), 2));
					}
				});
				customizeSelect("#suba2");
			}
			if ($("#suba2 tr").length == 8) {
				$("#suba2 .trNewCreditSub").hide();
			}
			if ($("#suba2 tr").length == 3) {
				$("#suba2 .delete").hide();
			} else {
				$("#suba2 .delete").show();
			}
		});
		$("#suba2 .trNewCreditSub").click();
		$("#suba2 .dRightTable").append(generateEmptyLines("#main .dRightTable", 2, "renderEditArea(\"add\", " + id + ", -1);customizeSelect();"));
	} else if (id == 3) {
		//储蓄卡/存折
		desc = "";
		$("#suba3 .dRTTable tr").html("<td>名称</td><td>类型</td><td class='tSRCEdit'>&nbsp;</td>");
		if (subAccount != null || subAccount != "") {
			trClass = "tDetail1";
			for (var i=0; i<subAccount.length; i++) {
				desc += "<tr mhcontent='true' class='" + trClass + "' id='tr" + subAccount[i][6] + "' satype='" + subAccount[i][2] + "' subaccountid='" + subAccount[i][6]
					+ "' accountname='" + subAccount[i][5] + "' days='" + subAccount[i][3] + "' enddate='" + subAccount[i][4] + "' comment='" + subAccount[i][7]
					+ "' balance='" + subAccount[i][1] + "' currency='" + subAccount[i][0] + "' name='" + subAccount[i][8].name + "' subName='" +  subAccount[i][8].subName + "' enddate1='" + subAccount[i][8].enddate
					+ "' alarm='" + subAccount[i][8].alarm + "'>";
				desc += "<td><nobr>" + replaceHtmlStr(subAccount[i][5]) + "</nobr></td>";
				desc += "<td><nobr>" + listSubAccount[subAccount[i][2]] + "</nobr></td>";
				desc += '<td class="tSRCEdit"><img class="edit" onclick="AddSA($(this).parents(\'tr\').attr(\'satype\'), 0, $(this).parents(\'tr\').attr(\'subaccountid\'), 1)" src="images/edit.gif">'
					+ '<img class="delete" onclick="deleteSubInNew($(this).parents(\'tr\').attr(\'subaccountid\'));" src="images/delete.gif"></td>';
				desc += "</tr>";
				if (trClass == "tDetail1") trClass = "tDetail2";
				else trClass = "tDetail1";
			}
		}
		$("#suba3 .dRightTable").html(desc);
		$("#suba3 .dRightTable").append(generateEmptyLines("#suba3 .dRightTable", 3, ""));
		$("#suba3 .dRTTable td:nth-child(1)").width(195);
		$("#suba3 .dRTTable td:nth-child(2)").width(100);



		$("#suba3 .dRightTable td:nth-child(1)").width(195);
		$("#suba3 .dRightTable td:nth-child(2)").width(100);
	}
}

/** 删除子账户
 */
function deleteSubInNew(SubAccountId) {
	var subPosition = 0;
	for (i=0; i<subAccount.length; i++) {
		if (subAccount[i][6] == SubAccountId) {
			subPosition = i;
		}
	}
	subAccount.splice(subPosition, 1);
	$("#suba3 .dRightTable tr[subaccountid='" + SubAccountId + "']").remove();
	$("#suba3 .dRightTable").append(generateEmptyLines("#suba3 .dRightTable", 3, ""));
}

/** 根据当前时间生成随机数
 * @return 随机数
 */ 
function createTimeRandom() {
	var date = new Date();
	var yy = date.getYear();
	var MM = date.getMonth() + 1;
	var dd = date.getDay();
	var hh = date.getHours();
	var mm = date.getMinutes();
	var ss = date.getSeconds();
	var sss = date.getMilliseconds();
	var result = Date.UTC(yy, MM, dd, hh, mm, ss, sss);
	result = Math.floor(result / 1000000 * Math.random());
	return result;
}

/** 添加银行卡子账户响应事件
 * @param id 主账户类型
 * @param sid 子账户类型
 * @return 子账户信息数组  
 */
function addSubAccount(id, sid, eventParam) {
	var sign = createTimeRandom();
	var temp = new Array();
	var tempCur = $('#newsa' + sid + ' input[name="currency"]').val();
	temp.push($('#newsa' + sid + ' input[name="currency"]').val());
	temp.push($('#newsa' + sid + ' input[name="balance"]').val());
	temp.push(sid);
	if (sid == 100) {
		//活期存款不记录
		temp.push("");
		temp.push("");
	} else {
		temp.push($('#newsa' + sid + ' input[name="during"]').val());
		temp.push($('#newsa' + sid + ' input[name="enddate"]').val());
	}
	if (sid == 201) {
		//信用卡子账户以币种命名
		temp.push($('#newsa' + sid + ' input[name="currency"]').siblings(".label").html());
	} else {
		temp.push($('#newsa' + sid + ' input[name="subName"]').val());
	}
	temp.push(sign);
	temp.push($('#newsa' + sid + ' textarea[name="description"]').val());
	if (eventParam != undefined) temp.push(eventParam);
	else temp.push("");
	//更新数据
	subAccount.push(temp);
	return temp;
}

/** 根据主图层名称和编辑状态处理对话框底部按钮的事件
 * @param dialogName 对话框ID
 */
function changeButton(dialogName) {
	var BoxName = "#" + dialogName + "boxBg";
	$(BoxName + ' .boxBg8 .oplist').html("<li><span class='yes_btn'></span></li><li><span class='cancel_btn'></span></li>");
	switch (dialogName) {
		case "suba2": case "suba3":
			//信用卡和储蓄卡子账户窗口有两个按钮：上一步，完成
			$(BoxName + ' .boxBg8 .oplist').html("<li><span class='prev_btn'></span></li><li><span class='finish_btn'></span></li>");
			$(BoxName + ' .boxBg8 .oplist .prev_btn').unbind().click(function () {
				$("#" + dialogName).parent().hide();
				showAdd("newsa" + dialogName.substr(4), 1);
			});
			$(BoxName + ' .boxBg8 .oplist .finish_btn').unbind().click(function() {
				if (myFormValidate('#' + dialogName + '_form')) {
					eval($('#' + dialogName + '_form').attr('function'));
					cancelAdd(dialogName);
				};
			});
			break;

		case "addMyBank":
			$('#addMyBankboxBg .boxBg8 .oplist .del_btn').parent().hide();
			break;
			
		default :
			break;
	}

	$(BoxName + ' .yes_btn').unbind().click( function() {
		
		try{
			if (myFormValidate('#' + dialogName + '_form')) {
				eval($('#' + dialogName + '_form').attr('function'));
				cancelAdd(dialogName);
			}
		} catch(e){
			logCatch(e.toString());
		}
		
	});
	$(BoxName + " .cancel_btn").unbind("click").click(function () {
		cancelAdd(dialogName);
	});
}

/** 数据校验事件
 * @param divId 图层号
 * @return 1表示校验成功，0表示校验失败 
 */
function myFormValidate(divId) {
	var validator = "";
	var valResult = 0;

	//建立验证
	validator = $(divId).validate({
		errorPlacement: function(error, element) {
			element.parents(".dRDRField").children(".dValidation").html(error);
			element.parents(".dEAItem").children(".dValidation").html(error);
		}
	});
	
	//取数字的前两位小数点
	$(divId + " .iMoney").each(function() {
		 if (/^[\+\-]?[\d\.]+$/.test($(this).val())){
		    var numberBeforePoint = 0;
			if ($(this).val() == "") $(this).val("0.00");
			if ($(this).val().indexOf(".") != -1) {
				numberBeforePoint = $(this).val().substring(0, $(this).val().indexOf("."));
				$(this).val(numberBeforePoint + "." + $(this).val().substr($(this).val().indexOf(".") + 1, 2));
			} else {
				numberBeforePoint = $(this).val();
			}
			if (numberBeforePoint.length <= 14) {
				if (!isNaN($(this).val() * 100)) {
					$(this).val(formatnumber(parseFloat($(this).val()), 2));
				}
			}
		}
	});
	//执行验证
	switch (divId) {
		case "#suba3_form": case "#suba2_form":
			if (validator.form()) {
				if ($(divId + " .dRightTable tr[mhcontent='true']").length < 1) {    
					alert("该账户下未建立任何币种的子账户，不允许提交。请至少建立一个子账户。");
					return 0;
				} else {
					if (divId == "#suba2_form") {
						aCurrency = new Array();
						var i = 0;
						$(divId + " .dRightTable input[name='currency']").each(function () {
							aCurrency[i] = $(this).val();
							i++;
						});
						var sorted_arr = aCurrency.sort();
						var results = false;
						for (i = 0; i < aCurrency.length - 1; i += 1) {
							if (sorted_arr[i + 1] == sorted_arr[i]) {
								results = true;
							}
						}
						if (results) {
							alert("该账户下不能有同币种的子账户。");
							return 0;
						} else {
                            var re = /^[\-\+]?[\d\.]+$/,//这样做写有点egg pain
							     value = $(divId + " .dRightTable input[name='amount']").val();
		                     if (!re.test(value)){
			                    alert("初始欠款输入有误！");
				                return 0;
			                 }
							 return 1;
						}
					} else {
						return 1;
					}
				}
			}
			break;
			
		case "#newsa201_form":
			subAccountName = $(divId + ' input[name="currency"]').siblings(".label").html();
			AccountId = $(divId + ' input[name="AccountId"]').val();
			foundSame = false;
			$("#tAT2 tr[accountid=" + AccountId + "][subaccountid!=0]").find(".dSRBname2").each(function () {
				if ($(this).children("nobr").html() == subAccountName) {
					foundSame = true;
				}
			});
			if (foundSame) {
				alert("该账户下不能有同币种的子账户。");
				return 0;
			}else if(validator.form()){
			    return 1;
			}else{
			    return 0;
			}
			break;
			
		default:
			if (validator.form()) {
				valResult = 1;
			}
			break;
	}
	return valResult;
}

/** 建立主账户
 * @param TypeId 主账户类型
 * @return 主账户编号 
 */
function submitAddAccount(TypeId) {
	var name, accountTypeId, bankId, content, tbCurrency_id, openbalance, balance, days, enddate, tbAccountType_id, subName;
 
	name = $("#newsa" + TypeId + " input[name='AccountName']").length > 0 ? $("#newsa" + TypeId + " input[name='AccountName']").val() : "";
	bankId = $("#newsa" + TypeId + " input[name='bank']").length > 0 ? $("#newsa" + TypeId + " input[name='bank']").val() : "";
	tbCurrency_id = $("#newsa" + TypeId + " input[name='currency']").val() != "" ? $("#newsa" + TypeId + " input[name='currency']").val() : "1";
	balance = $("#newsa" + TypeId + " input[name='balance']").length > 0 ? $("#newsa" + TypeId + " input[name='balance']").val() : "";
	days = $("#newsa" + TypeId + " input[name='during']").length > 0 ? $("#newsa" + TypeId + " input[name='during']").val() : "";
	enddate = $("#newsa" + TypeId + " input[name='sdate']").length > 0 ? $("#newsa" + TypeId + " input[name='sdate']").val() : "";
	content = $("#newsa" + TypeId + " textarea[name='description']").val();
	openbalance = balance;
	//赋值结束，执行添加方法
	return addNewAccount(name, TypeId, bankId, content, tbCurrency_id, openbalance, balance, days, enddate);
}

/*添加账户提醒事件*/
function addEvent(eventObj){
    if (eventObj && Object.prototype.hasOwnProperty.call(eventObj, "TypeId")){
	    switch(eventObj.TypeId){
            case 5:
			    if (eventObj.enddate != undefined){
				    addEnddate(eventObj.TypeId, eventObj.enddate, eventObj.account_id, eventObj.subAccount_id);
					if ($("#newsa5 .sCheckBox").hasClass("sCheckBox2") == true){
						var alarm = $("#newsa5 span[id='rmday']").text();
						var result = addInvestEvent(eventObj.name, "", eventObj.enddate, alarm, eventObj.account_id, eventObj.subAccount_id, eventObj.TypeId);//插入日期提醒事件	
                        addNewFeatureForSync(eventObj.account_id, eventObj.subAccount_id, "dq", 1, alarm);
					}
				}
                break;
            case 2:
				var billValue = $("#newsa2 input[name='billdate']").val(),
				    returnValue = $("#newsa2 input[name='returndate']").val(),
					enddate = "zdhk";
				var date = new Date();
				var year = date.getFullYear(),
					month = (date.getMonth() + 1 >= 10) ? date.getMonth() + 1 : "0" + (date.getMonth() + 1);
                var alarm1, alarm2;
                    					
				if (billValue != ""){
				    var billdateValue = /^[0-9][0-9]$/.test(billValue) ? billValue : "0" + billValue;
					var billdate = "2012-01-" + billdateValue;//账单日
					enddate = enddate.replace(/^zd/, billdateValue);
				    if ($("#newsa2 span[id='zddate']").hasClass("sCheckBox2") == true){
						alarm1 = $("#endDay-zd span[id = 'rmday']").text();
						var result = addInvestEvent(eventObj.name, "账单日\t", billdate, alarm1, eventObj.account_id, eventObj.subAccount_id, 21);//插入账单日日期提醒事件,type为21	
                        addNewFeatureForSync(eventObj.account_id, eventObj.subAccount_id, "dq", 1, alarm1);
				    }
				}
				if (returnValue != ""){
					var returndateValue = /^[0-9][0-9]$/.test(returnValue) ? returnValue : "0" + returnValue;
				    var returndate = "2012-01-" + returndateValue;//还款日
					enddate = enddate.replace(/hk$/, returndateValue);
					if ($("#newsa2 span[id='zhkdate']").hasClass("sCheckBox2") == true){
						alarm2 = $("#endDay-zhk span[id = 'rmday']").text();
						var result = addInvestEvent(eventObj.name, "账单到期还款\t\t", returndate, alarm2, eventObj.account_id, eventObj.subAccount_id, 22);//插入还款日日期提醒事件，type为22	
                        addNewFeatureForSync(eventObj.account_id, eventObj.subAccount_id, "hk", 1, alarm2);
					}
				}
				if ($("#newsa2 input[name='billdate']").val() != "" || $("#newsa2 input[name='returndate']").val() != ""){
				    addEnddate(eventObj.TypeId, enddate, eventObj.account_id, eventObj.subAccount_id);
				} 
                break;
            case 3:
				if (eventObj.enddate != ""){
				    addEnddate(eventObj.TypeId, eventObj.enddate, eventObj.account_id, eventObj.subAccount_id);
				    if(eventObj.alarm != ""){
					   try{
						  var result = addInvestEvent(eventObj.name, eventObj.subName, eventObj.enddate, eventObj.alarm, eventObj.account_id, eventObj.subAccount_id, eventObj.TypeId);
                          addNewFeatureForSync(eventObj.account_id, eventObj.subAccount_id, "dq", 1, eventObj.alarm);
					   }catch(e){
                          logCatch(e.toString());
					   }
					}
				}	
                break;
            default:
                break;			
		}
	}
}


/** 实现添加账户功能
 * @param name 账户名称
 * @param accountTypeId 账户类型
 * @param bankId 银行
 * @param content 备注
 * @param tbCurrency_id 币种信息
 * @param openbalance 初始余额
 * @param balance 余额
 * @param days 期限
 * @param enddate 到期日
 * @return 主账户编号 
 */
function addNewAccount(name, accountTypeId, bankId, content, tbCurrency_id, openbalance, balance, days, enddate) {
	//先创建主账户
	var accountId = addAccount(name, accountTypeId, bankId, content);
	if (accountId > 0) {
		//主账户插入成功，处理子账户
		if ((accountTypeId == 2) || (accountTypeId == 3)) {
			//一个账户可能对应多个子账户的
			var subLength = subAccount.length;
			var result = -1;
			for (var i = 0; i < subLength; i ++) {
                var eventObj = {};
				eventObj.name          = name;
				eventObj.subName       = subAccount[i][5];
				eventObj.account_id    = accountId;
				eventObj.TypeId        = accountTypeId;
				eventObj.enddate       = subAccount[i][8].hasOwnProperty("enddate") ? subAccount[i][8].enddate : "";
				eventObj.alarm         = subAccount[i][8].hasOwnProperty("alarm") ? subAccount[i][8].alarm : "";
				if (accountTypeId == 2) {
					result = addAccountSub(accountId, subAccount[i][0], 0-subAccount[i][1], 0-subAccount[i][1], subAccount[i][3], subAccount[i][4], subAccount[i][2], subAccount[i][5], subAccount[i][7]);
                    eventObj.subAccount_id = result;
				    if (i == 0) addEvent(eventObj);
				} else {
					result = addAccountSub(accountId, subAccount[i][0], subAccount[i][1], subAccount[i][1], subAccount[i][3], subAccount[i][4], subAccount[i][2], subAccount[i][5], subAccount[i][7]);
                    eventObj.subAccount_id = result;
                    addEvent(eventObj);
				}
				subAccount[i][6] = result;	
				
				if (result <= 0) {
					break;
				}

				//添加到数组中
				listAccount.push({
					"aname": name,
					"bname": subAccount[i][5],
					"aid": accountId,
					"bid": result,
					"tid": accountTypeId,
					"tid2": subAccount[i][2],
					"tbBank_id": bankId
				});
			}
		} else {
			//一个账户对应一个子账户的
			if (accountTypeId == 7) {
				//如果是信用卡和借入的钱，取负值
				balance = 0 - balance;
				openbalance = balance;
			}
			var subAccountType = 300 + accountTypeId;
			//一个账户只对应一个子账户的，根据币种进行判断账户名
			//12.28 modified by liuchang 增加了子账户名；
			var mySubAccountName = getCurrencyDesc(tbCurrency_id);
			newSubAccountId = addAccountSub(accountId, tbCurrency_id, openbalance, balance, days, enddate, subAccountType, mySubAccountName, "");
			var eventObj = {};
			eventObj.name          = name;
			eventObj.account_id    = accountId;
			eventObj.subAccount_id = newSubAccountId;
			eventObj.TypeId        = accountTypeId;
			eventObj.enddate       = enddate;
			addEvent(eventObj);
			
			//添加到数组中
			listAccount.push({
				"aname": name,
				"bname": "",
				"aid": accountId,
				"bid": 0,
				"tid": accountTypeId,
				"tid2": 0,
				"tbBank_id": bankId
			});
		}
	} else {
		//主账户插入失败
	}
	return accountId;
}

/** 实现编辑主账户功能
 * @param TypeId 主账户类型
 */
function submitEditAccount(TypeId) {
	//赋值
	var name, accountTypeId, bankId, content, tbCurrency_id, openbalance, balance, days, enddate, tbAccountType_id, subName, accountId, alarm;
	if ($("#newsa" + TypeId + " input[name='AccountName']").length > 0)
		name = $("#newsa" + TypeId + " input[name='AccountName']").val();
	else
		name = "";

	accountId = $("#newsa" + TypeId + " input[name='AccountId']").val();

	content = $("#newsa" + TypeId + " textarea[name='description']").val();
	var id = this.currentTbAccountType;
	accountTypeId = this.currentTbAccountType;
	if ($("#newsa" + TypeId + " input[id='bank']").length > 0) {
		bankId = $("#newsa" + TypeId + " input[id='bank']").val();
	} else {
		bankId = "";
	}

	if ($("#newsa" + TypeId + " input[id='during']").length > 0) {
		days = $("#newsa" + TypeId + " input[id='during']").val();
	} else {
		days = "";
	}

	if ($("#newsa" + TypeId + " input[name='sdate']").length > 0) {
		enddate = $("#newsa" + TypeId + " input[name='sdate']").val();
	} else {
		enddate = "";
	}

    if ($("#newsa" + TypeId + " input[name='subName']").length > 0) {
		subName = $("#newsa" + TypeId + " input[name='subName']").val();
	} else {
		subName = "";
	} 
	
	//赋值结束，开始业务逻辑处理
	editAccount(accountId, TypeId, name, bankId, content);
}

/** 编辑账户提醒事件
 * @param TypeId 账户类型
 */
function editEvent(TypeId){
    var AccountId = $("#newsa" + TypeId + "_form input[name='AccountId']").val(),
	    SubAccountId = $("#newsa" + TypeId + " input[name='SubAccountId']").val(),
        oldName = $("#tAT" + TypeId + " tr[accountid='" + AccountId + "'][subaccountid = 0]").attr("accountname"),
	    oldSubName = $("#tAT" + TypeId + " tr[accountid='" + AccountId + "']").next().attr("accountname"),
		enddate = $("#newsa" + TypeId + " input[name='sdate']").length > 0 ? $("#newsa" + TypeId + " input[name='sdate']").val() : "",
        alarm = ($("#newsa" + TypeId + " .sCheckBox").hasClass("sCheckBox2") == true) ? $("#newsa" + TypeId + " span[id='rmday']").text() : "",
		newName = $("#newsa" + TypeId + " input[name='AccountName']").length > 0 ? $("#newsa" + TypeId + " input[name='AccountName']").val() : "",
		newSubName = $("#newsa" + TypeId + " input[name='subName']").length > 0 ? $("#newsa" + TypeId + " input[name='subName']").val() : "";
	if (TypeId == 101 || TypeId == 102) {
		//储蓄卡子账户
		oldName = $("#tAT3" + " tr[accountid='" + AccountId + "'][subaccountid = 0]").attr("accountname"),
		oldSubName = $("#tAT3" + " tr[accountid='" + AccountId + "'][subaccountid = '"+ SubAccountId +"']").attr("accountname");
		if (oldName != undefined){
			if (enddate != "" && enddate != 'undefined'){
				addEnddate(TypeId, enddate, AccountId, SubAccountId);
			    if($("#newsa" + TypeId + " .sCheckBox").hasClass("sCheckBox2") == true){
				    updateEvent(oldName, oldSubName, enddate, alarm, oldName, newSubName, AccountId, SubAccountId, 3);
				}
			}
			if ($("#newsa" + TypeId + " .sCheckBox").hasClass("sCheckBox2") == false){
				var description = oldName + " " + oldSubName + "提醒";
				try{
					MoneyHubJsFuc('ExecuteSQL', "update tbEvent set mark = 1, UT = " + getUT() + " where tbsubaccount_id = " + SubAccountId);
					MoneyHubJsFuc('SetParameter', "eventAlarm", "1");				
                    updateNewFeatureForSync(AccountId, SubAccountId, 1);
				}catch(e){
                    logCatch(e.toString());
					//TODO
				}
			}
		}else{
		   var name = $("#newsa3_form input[name = 'AccountName']").val(),
		       sub = $("#suba3_form .dRightTable tr"),
			   current;
		   //var flag = $("#newsa" + TypeId + " .sCheckBox").hasClass("sCheckBox2");

		    for (var i = 0; i < sub.length; i ++){

			   if (sub[i].getAttribute("accountname") == newSubName){

					if (sub[i].getAttribute("name") == "undefined" || sub[i].getAttribute("name") == undefined)
					   sub[i].setAttribute("name", name);
					if (sub[i].getAttribute("subName") == "undefined" || sub[i].getAttribute("subName") == undefined)
					   sub[i].setAttribute("subName", newSubName);
					if (sub[i].getAttribute("enddate1") == "undefined" || sub[i].getAttribute("enddate1") == undefined){
					   sub[i].setAttribute("enddate1", enddate);
                       subAccount[i][8].enddate = enddate;
					}
					if (sub[i].getAttribute("alarm") == "undefined" || sub[i].getAttribute("alarm") == undefined){
					   sub[i].setAttribute("alarm", alarm);
					   subAccount[i][8].alarm = alarm;
					}
					//if (flag == false){
				       //sub[i].setAttribute("alarm","undefined");
				    //}
			    }
		    }
		}
	} else if (TypeId == 2) {
		//信用卡
		var date = new Date();
		var year = date.getFullYear(),
		    month = (date.getMonth() + 1 >= 10) ? date.getMonth() + 1 : "0" + (date.getMonth() + 1),
			enddateString = "zdhk";
		if ($("#billdate").val() != ""){ 
			alarm = $("#endDay-zd span[id='rmday']").text();
			enddate = $("#newsa" + TypeId + " input[name='billdate']").val();
			var enddate_ = (/^[0-9][0-9]$/.test(enddate)) ? enddate : "0" + enddate,
			    billdate = "2012-01-" + enddate_;//账单日
		    if($("#zddate").hasClass("sCheckBox2") == true) { 
			   updateEvent(oldName, "账单日\t", billdate, alarm, newName, "账单日\t", AccountId, SubAccountId, 21);
			}
			enddateString = enddateString.replace(/zd/, enddate_);
			addEnddate(TypeId, enddateString, AccountId);
		}
		if ($("#zddate").hasClass("sCheckBox2") == false){
		    var description = oldName + " " + "账单日\t提醒";
		    try{
                MoneyHubJsFuc('ExecuteSQL', "update tbEvent set mark = 1, UT = " + getUT() + " where tbaccount_id = " + AccountId + " and type = " + 21);
                MoneyHubJsFuc('SetParameter', "eventAlarm", "1");				
                updateNewFeatureForSync(AccountId, SubAccountId, 1);
			}catch(e){
                logCatch(e.toString());
			    //TODO
			}
		}
		if ($("#returndate").val() != ""){
			alarm = $("#endDay-zhk span[id='rmday']").text();
			enddate = $("#newsa" + TypeId + " input[name='returndate']").val();
			var enddate_ = (/^[0-9][0-9]$/.test(enddate)) ? enddate : "0" + enddate,
			returndate = "2012-01-" + enddate_;//还款日
		    if ($("#zhkdate").hasClass("sCheckBox2") == true) {
			   updateEvent(oldName, "账单到期还款\t\t", returndate, alarm, newName, "账单到期还款\t\t", AccountId, SubAccountId, 22);
			}
			enddateString = enddateString.replace(/hk/, enddate_);
			addEnddate(TypeId, enddateString, AccountId);
		}
		if ($("#zhkdate").hasClass("sCheckBox2") == false){
		    var description = oldName + " " + "账单到期还款\t\t提醒";
		    try{
                MoneyHubJsFuc('ExecuteSQL', "update tbEvent set mark = 1, UT = " + getUT() + " where tbaccount_id = " + AccountId + " and type = " + 22);
                MoneyHubJsFuc('SetParameter', "eventAlarm", "1");				
                updateNewFeatureForSync(AccountId, SubAccountId, 1);
			}catch(e){
                logCatch(e.toString());
			    //TODO
			}
		}
	} else if (TypeId == 3) {
		//储蓄卡
		enddate = "", alarm = "";
		var subNames = $("#tAT" + TypeId + " tr[accountid='" + AccountId + "']").nextAll();
		if (subNames.length >= 1){
		    for (var i = 0; i < subNames.length; i++){
			   updateEvent(oldName, subNames[i].getAttribute("accountname"), enddate, alarm, newName, subNames[i].getAttribute("accountname"), AccountId, SubAccountId, TypeId);
			}
		}
	} else if (TypeId == 5) {
	    var SubAccountId = $("#newsa" + TypeId + " input[name='SubAccountId']").val();
		oldName = $("#tAT5" + " tr[accountid='" + AccountId + "'][subaccountid = '"+ SubAccountId +"']").attr("accountname");
		//投资类账户
		oldSubName = "", newSubName = "";
		if (enddate != ""){ 
		   addEnddate(TypeId, enddate, AccountId, SubAccountId);
		   if($("#newsa" + TypeId + " .sCheckBox").hasClass("sCheckBox2") == true){
			   updateEvent(oldName, oldSubName, enddate, alarm, newName, newSubName, AccountId, SubAccountId, TypeId);
		   }
		}
		if ($("#newsa" + TypeId + " .sCheckBox").hasClass("sCheckBox2") == false){
		    var description = oldName + " " + oldSubName + "提醒";
		    try{
                MoneyHubJsFuc('ExecuteSQL', "update tbEvent set mark = 1, UT = " + getUT() + " where tbsubaccount_id = " + SubAccountId);
                MoneyHubJsFuc('SetParameter', "eventAlarm", "1");				
			}catch(e){
                logCatch(e.toString());
			    //TODO
			}
		}
	}
}

/** 根据账户名和子账户名更新事件
 * @param oldName
 * @param oldSubName
 * @param enddate
 * @param alarm
 * @param newName
 * @param newSubName     
 */
function updateEvent(oldName, oldSubName, enddate, alarm, newName, newSubName, AccountId, SubAccountId, TypeId) {
   if (enddate != "") {
		var eventId = getEvent(AccountId, SubAccountId, TypeId);
		if (eventId){
		    try{//编辑前先将mark置为0
			    MoneyHubJsFuc('ExecuteSQL', "UPDATE tbEvent SET mark = 0 WHERE id = " + eventId);
			}catch(e){
                logCatch(e.toString());
            }
			addInvestEvent(newName, newSubName, enddate, alarm, AccountId, SubAccountId, TypeId, eventId);
		}else{
		    addInvestEvent(newName, newSubName, enddate, alarm, AccountId, SubAccountId, TypeId);
		}
   } else {
        var eventDescription = (oldName + " " + oldSubName + "提醒").replace(/^\s+(.*?)\s+$/, "$1");
        var newEventDescription = (newName + " " + newSubName + "提醒").replace(/^\s+(.*?)\s+$/, "$1");		
		var eventId = getEvent(AccountId, SubAccountId, TypeId);
		try {
		    MoneyHubJsFuc('ExecuteSQL', "update tbEvent set description = '" + newEventDescription + "' where id = " + eventId);
			MoneyHubJsFuc('SetParameter', "eventAlarm", "1");
		}catch(e){
            logCatch(e.toString());
		    //TODO
		}
   }
}

/** 显示弹出对话框
 * @param dialogName 对话框ID
 * @param NCB 是否改变按钮
 * @param    
 */
function showAdd(dialogName, NCB) {
	//首先处理底部按钮事件
	if (NCB == undefined) {
		changeButton(dialogName);
	}
	if ($("#" + dialogName).attr("level") == 2) {
		$("#scover1").show();
		$("#" + dialogName).css("z-index", 350);
		$("#" + dialogName).parent().css("z-index", 300);
	} else {
		$("#scover").show();
	}
	$("#" + dialogName).parent().show();

	//清除所有验证信息
	$("#" + dialogName + " .dValidation .error").replaceWith("");

	//调整列表表格宽度
	$(".dRRBCenter").each(function (index) {
		$(this).width($(this).parent().parent().width() - 18);
	});
	
	//重定义回车事件
	$("#" + dialogName).unbind('keypress').keypress(function (event) {
		event.stopPropagation();
		if (event.keyCode == 13) {
			event.preventDefault();
			$("#" + dialogName).parents(".boxBg").find(".yes_btn").click();
		}
	});
	
	$("#" + dialogName + " .editArea").unbind('keypress').keypress(function (event) {
		event.stopPropagation();
		if (event.keyCode == 13) {
			event.preventDefault();
			$("#" + dialogName + " .editArea .bAdd").click();
		}
	});

	adjustWH(dialogName);
    $("#" + dialogName + " input:visible").first().focus();
}

/** 调整弹出框高度和宽度
 * @param dialogName 弹出框名
 */
function adjustWH(dialogName) {
	if (($("#" + dialogName + " #addAccount_step2").is(":hidden")) || (!$("#" + dialogName + " #addAccount_step2").html())) {
		$("#" + dialogName).boxwidth($("#" + dialogName + " .dStep1").width() + 10);
		$("#" + dialogName).boxheight($("#" + dialogName + " .dStep1").height() + 10);
	} else {
		$("#" + dialogName).boxwidth($("#" + dialogName + " .dStep1").width() + $("#addAccount_step2").width() + 20);
		$("#" + dialogName).boxheight($("#" + dialogName + " #addAccount_step2").height() + 10);
	}
	$("#" + dialogName).parent().center();	
}

/** 关闭添加账户等对话框
 * @param dialogName 对话框ID
 * @param flag 标记是否要跳转至其它页面
 */
function cancelAdd(dialogName, flag) {
	if ($("#" + dialogName).attr("level") == 2) {
		$("#scover1").hide();
	} else {
		$("#scover").hide();
	}
	$("#" + dialogName).parent().hide();
	if (flag == undefined) {
		if ((showAddCategory != undefined) && (showAddCategory != "-1")) {
			//从哪儿来的，回哪儿去
			window.open('index.html');
		}
		if ((showAddPayee != undefined) && (showAddPayee != "-1")) {
			//从哪儿来的，回哪儿去
			window.open('index.html');
		}
	}
}

/** 获得元素
 * @param id 指定ID
 * @param tag 指定某元素下的标签
 */  
function Pid(id, tag){
	if (!tag) {
		return document.getElementById(id);
	} else {
		return document.getElementById(id).getElementsByTagName(tag);
	}
}

/** 切换标签
 * @param id 总容器
 * @param hx 标题栏头部的标签
 * @param box 标签自身的标签
 * @param iClass 标签的类别
 * @param s
 * @param pr
 */      
function tab_change(id, hx, box, iClass, s, pr){
	var hxs = Pid(id, hx);
	var boxs = Pid(id, box);

	if (!iClass) {
		// 如果不指定class，则：
		boxsClass = boxs; // 直接使用box作为容器
	} else {
		// 如果指定class，则：
		var boxsClass = [];
		for(i=0; i<boxs.length; i++){
			if (boxs[i].className.match(/\bdSetRight\b/)) {// 判断容器的class匹配
				boxsClass.push(boxs[i]);
			}
		}
	}
	if (!pr) {
		// 如果不指定预展开容器，则：
		go_to(0); // 默认展开序列
		yy();
	} else {
		go_to(pr);
		yy();
	}

	function yy() {
		for(var i=0; i<hxs.length; i++){
			hxs[i].temp = i;
			if (!s) {
				// 如果不指定事件，则：
				s = "onclick"; // 使用默认事件
				hxs[i][s] = function(){
					go_to(this.temp);
				}
			} else {
				hxs[i][s] = function(){
					go_to(this.temp);
				}
			}
		}
	}

	function go_to(pr){
		for(var i=0; i<hxs.length; i++) {
			if (!hxs[i].tmpClass) {
				hxs[i].tmpClass = hxs[i].className+=" ";
				boxsClass[i].tmpClass = boxsClass[i].className+=" ";
			}
			if (pr==i) {
				hxs[i].className += " up"; // 展开状态：标题
				boxsClass[i].className += " up"; // 展开状态：容器
			} else {
				hxs[i].className = hxs[i].tmpClass;
				boxsClass[i].className = boxsClass[i].tmpClass;
			}
		}
	}
}

/** 取得币种内容
 * @param id 币种编号
 */
function getCurrencyDesc(id) {
	var result = "";
	var list = getCurrencyInfo();//取得币种类型；

	$.each(list, function(i, n) {
		if (id == n.id) {
			result = n.Name;
		}
	});
	return result;
}

/** 入库前的字符串处理
 */
function replaceSQLStr(str) {
	if (str != undefined) {
		//sql保留字替换
		return str.replace(/\'/g,"\'\'");
	} else {
		return "";
	}
}

/** 已选定新建账户类型
 * @param TypeId 类型编号
 */
function NewAccountTypeSelected(TypeId) {
	$("#newaccount").parent().hide();
	AddSA(TypeId, 0, 0);
}

/** 显示html时先替换”&“
 */
function replaceHtmlStr(str) {
	//sql保留字替换
	return str.replace(/&/g,"&amp");
}

/** 生成空白行
 * @param tableId 表格名称
 * @param tdCount 列数
 * @return 生成的HTML代码
 */   
function generateEmptyLines(tableId, tdCount, clickEvent) {
	ELHTML = "";
	tableElement = $(tableId);
	$(tableId + " tr[mhcontent!='true']").remove();
	contentRows = $(tableId + " tr[mhcontent='true']").length;

	totalRows = (tableElement.closest("#dRRDetail").height() - 5) / 30;
	emptyRows = totalRows - contentRows;
	
	if (emptyRows > 0) {
		//需要显示空行
		if (contentRows % 2 == 0) currentClass = "tDetail1";
		else currentClass = "tDetail2";
	
		for (i=0; i<emptyRows; i++) {
			ELHTML += "<tr class='" + currentClass + "' onclick='" + clickEvent + "'>";
			for (j=0; j<tdCount; j++) {
				ELHTML += "<td>&nbsp;</td>";
			}
			ELHTML += "</tr>";
			if(currentClass == "tDetail1")
				currentClass = "tDetail2";
			else
				currentClass = "tDetail1";
		}
	}
	return ELHTML;
}

/** 生成日历事件
 * @param calDivId 日历控件编号
 * @param notNull 如果有值，则显示当前日期，否则显示一个空日历 
 */
function createSingleCalendar(calDivId, notNull) {
	$.datepicker.setDefaults($.datepicker.regional["zh-CN"]);
	$(calDivId).datepicker();
	if (notNull != undefined) {
		$(calDivId).datepicker('setDate', new Date());
	}
	var showOn = $(calDivId).datepicker("option", "showOn");
	$("#ui-datepicker-div").click(function (event) {
		event.stopPropagation();
	});
}

/*
 * 4.0新需求，合并账户
 * aid,主账户id
 * sid，子账户id
 */
function mergeAccount(tid,aid,sid){
	var aid = aid+"";
	var tid = tid+"";
	var sid = sid+"";
	var result = getSameTypeAccountInfo(tid);
	var isSelect = false; 
	var list1 = getAccountSubInfo(aid);
	var oldCurId = list1[0].curId;
	//判断是否要显示合并账户的列表
	//if( tid != "2" && ( list1[0].myKey === undefined || list1[0].myKey == "" || list1[0].myKey.length == 0 )){	
	if( list1[0].myKey === undefined || list1[0].myKey == ""){
		//没绑定账户的
		if ((!(aid === undefined)) && (aid != "")) {
			if(tid!="2"&&tid!="3"){
				//普通类型
				$.each(result, function(i, n) {
			  		if ( n.aid != aid && ( n.keyinfo === undefined || n.keyinfo == "" ) && oldCurId == n.curId ){
			  			isSelect = true;
			  			return false;
			  		}
				});
			} else {
				//信用卡和储蓄卡类型
				$.each(result, function(i, n) {
			  		if(tid=="2"){
			  			//信用卡账户需判断keyInfo
			  			//这部分逻辑有问题
			  			if (n.aid != aid && ( n.keyinfo === undefined || n.keyinfo == "") ){
			  				isSelect = true;
			  				return false;
			  			}
			  		} else {
			  			//储蓄卡类账户
			  			if (n.aid != aid){
			  				isSelect = true;
			  				return false;
			  			}
			  		}
				});
			}
		}
	}
	//根据上面的结果，执行下面的逻辑
	
	try{
		if(isSelect){
			//生成option 只显示主账户
			//清空select框
			$("#DelAccount .list").empty();
			if( sid == "0" ) $("#DelAccount_form input[name='handleType']").val("0");
			else $("#DelAccount_form input[name='handleType']").val("1");
			$("#DelAccount_form input[name='tid']").val(tid);
			$("#DelAccount_form input[name='aid']").val(aid);
			if( sid == "0" ) $("#DelAccount_form input[name='sid']").val("");
			else $("#DelAccount_form input[name='sid']").val(sid);
			var defaultAccountId = "";
			var currentAccountId = "";
			
			$.each(result, function(i,n) { 
				if( n.keyinfo === undefined || n.keyinfo == ""){
					//if(currentAccountId != n.aid && n.aid != aid && n.curId == oldCurId){
					if(tid!="2"&&tid!="3"){
						if(currentAccountId != n.aid && n.aid != aid && n.curId == oldCurId){
							addOption("#DelAccount","account",n.aid,n.aname);
							currentAccountId = n.aid;
							if(defaultAccountId=="") defaultAccountId = n.aid;
						}
					} else {
						if(currentAccountId != n.aid && n.aid != aid ){
							addOption("#DelAccount","account",n.aid,n.aname);
							currentAccountId = n.aid;
							if(defaultAccountId=="") defaultAccountId = n.aid;
						}
					}
				}
			});
			selectOption("#DelAccount","account",defaultAccountId);
			showAdd("DelAccount");

		} else {
			//不显示列表，直接删除,直接执行流程
			if ($("#dSetAccount tr[accountid='" + aid + "'][subaccountid!='0']").length <= 1) {
				//只有一个子账户了，需要问用户一下
			    var flag = 1;
				handleDeleteAccount(tid, aid, sid, flag);
			} else {
				//有多个子账户，直接删了吧
				handleDeleteAccount(tid, aid, sid);
			}
		}
	} catch(e){
        logCatch(e.toString());
		debug(e.message);
	}
	
}

/*
 * 账户合并处理方法
 * tid 账户类型,
 * oldAid 原主账户,
 * oldSid 原子账户,
 * newAid 新主账户,
 * newSid 新子账户,
 * type 合并类型，主账户0，子账户为1.
 */
function mergeAccountAction(tid,oldAid,oldSid,newAid,newSid,type){
	//子账户合并
	//合并账户，先取得修改的转账记录tbsubaccount_id1
	//step1,处理交易
	try{
		if(tid=="2"||tid=="3"){
			//有子账户的合并
			if(type==0){
				//主账户处理
				debug("主账户\n");
				if(tid=="3"){
					//储蓄卡类型 
					//b.id as bid, balance, c.name as cname, b.name as bname, b.tbCurrency_id as curId
					var list = getAccountSubInfo(oldAid);
					$.each(list, function(i, n) {
						//移动子账户
					  	//moveSubAccount(tid,oldAid,oldSid,newAid,newSid)
					  	moveSubAccount(tid,oldAid,n.bid,newAid,"");
					  	//处理界面逻辑和界面数据更新
						renderMergeAccountAndHandleEvent( tid,oldAid,n.bid,newAid,"", 1, 0 );
					});
					//移动主账户
					removeAccount(oldAid);
					//处理界面逻辑和界面数据更新
					renderMergeAccountAndHandleEvent( tid, oldAid, 0, 0, 0, 0, 0 );
				} else {
					//信用卡类型
					var list = getAccountSubInfo(oldAid);
					var list1 = getAccountSubInfo(newAid);
					$.each(list, function(i, n) {
						var isMerge = false;
						var curOldwSid = n.bid;
						var curNewSid = "";
						$.each(list1, function(j, m) {
							if(n.curId == m.curId){
								curNewSid = m.bid;
								isMerge = true;
								return false;
							}
						});
						if(isMerge){
							//处理数据逻辑
							mergeSubAccount(tid,oldAid,curOldwSid,newAid,curNewSid);
							//处理界面逻辑和界面数据更新
							renderMergeAccountAndHandleEvent( tid,oldAid,curOldwSid,newAid,curNewSid, 1, 1 );
						} else {
							//处理数据逻辑
							moveSubAccount(tid,oldAid,curOldwSid,newAid,curNewSid);
							//处理界面逻辑和界面数据更新
							renderMergeAccountAndHandleEvent( tid,oldAid,curOldwSid,newAid,curNewSid, 1, 0 );
						}
					});
					//删除旧的主账户
					removeAccount(oldAid);
					//处理界面逻辑和界面数据更新
					renderMergeAccountAndHandleEvent( tid,oldAid, 0, 0, 0, 0, 0 );
				}
			} else {
				//子账户处理
				debug("子账户\n");
				if(tid=="3"){
					//储蓄卡类型 
					//b.id as bid, balance, c.name as cname, b.name as bname, b.tbCurrency_id as curId
					moveSubAccount(tid,oldAid,oldSid,newAid,"");
					renderMergeAccountAndHandleEvent( tid,oldAid,oldSid,newAid,"", 1, 0 );
					//修改了bug3384，增加了最后一个子账户的逻辑判断
					if ($("#dSetAccount tr[accountid='" + oldAid + "'][subaccountid!='0']").length <= 0){
						removeAccount(oldAid);
					} 
				} else {
					//信用卡类型
					var list1 = getAccountSubInfo(newAid);
					var isMerge = false;
					var curOldwSid = oldSid;
					var curNewSid = "";
					$.each(list1, function(j, m) {
						if(oldSid == m.curId){
							curNewSid = m.bid;
							isMerge = true;
							return false;
						}
					});
					if(isMerge){
						//处理数据逻辑
						mergeSubAccount(tid,oldAid,curOldwSid,newAid,curNewSid);
						//处理界面逻辑和界面数据更新
						renderMergeAccountAndHandleEvent( tid,oldAid,curOldwSid,newAid,curNewSid, 1, 1 );
						//修改了bug3384，增加了最后一个子账户的逻辑判断
						if ($("#dSetAccount tr[accountid='" + oldAid + "'][subaccountid!='0']").length <= 0){
							removeAccount(oldAid);
						}
					} else {
						//处理数据逻辑
						moveSubAccount(tid,oldAid,curOldwSid,newAid,curNewSid);
						//处理界面逻辑和界面数据更新
						renderMergeAccountAndHandleEvent( tid,oldAid,curOldwSid,newAid,curNewSid, 1, 0 );
						//修改了bug3384，增加了最后一个子账户的逻辑判断
						if ($("#dSetAccount tr[accountid='" + oldAid + "'][subaccountid!='0']").length <= 0){
							removeAccount(oldAid);
						}
					}
				}
			}
		} else {
			//普通账户,处理子账户
			debug("oldAid="+oldAid+", newAid="+newAid+"\n");
			debug(tid+":::::::"+oldAid+":::::::"+oldSid+":::::::"+newAid+":::::::"+newSid+"\n");
			var list1 = getAccountSubInfo(oldAid);
			var list2 = getAccountSubInfo(newAid);
			oldSid = list1[0].bid;
			
			newSid = list2[0].bid;
			debug("oldSid="+oldSid+", newSid="+newSid+"\n");
			debug(list1[0].curId +"::::::::"+ list2[0].curId+"\n");
			//处理子账户
				//合并
			mergeSubAccount(tid,oldAid,oldSid,newAid,newSid);
			renderMergeAccountAndHandleEvent( tid,oldAid,oldSid,newAid,newSid, 1, 1 );
			debug("1\n");
			//removeAccount(tid,oldAid,oldSid,newAid,newSid);
			removeAccount(oldAid);
			renderMergeAccountAndHandleEvent( tid,oldAid, 0, 0, 0, 0, 0 );
			debug("2\n");
			//业务逻辑处理完成
		}
	} catch(e){
        logCatch(e.toString());
		debug("mergeAccountAction="+e.message);
	}
}

function handleMergeAccountChoice(){
	var handleType = $("#DelAccount_form input[name='handleType']").val();
	var tid = $("#DelAccount_form input[name='tid']").val();
	var newAid = $("#DelAccount_form input[name='account']").val();
	var newSid = "";
	var oldAid = $("#DelAccount_form input[name='aid']").val();
	var oldSid = $("#DelAccount_form input[name='sid']").val();
	
	if ($("#DelAccount_form .radio").attr("status") == 0) {
		var handleType = $("#DelAccount_form input[name='handleType']").val();
		var newAid = $("#DelAccount_form input[name='account']").val();
		var tid = $("#DelAccount_form input[name='tid']").val();
		var oldAid = $("#DelAccount_form input[name='aid']").val();
		var oldSid = $("#DelAccount_form input[name='sid']").val();
		var newSid = "";
		if( handleType == "1" ){
			if ($("#dSetAccount tr[accountid='" + oldAid + "'][subaccountid!='0']").length <= 1) {
				//只有一个子账户的情况，按主账户处理
				handleType == "0";
			} 
		} 
		mergeAccountAction(tid,oldAid,oldSid,newAid,newSid,handleType);
		if ($("#tAT" + tid + " tr").length <= 0) $("#dAT" + tid).hide();
		//通知记账页
		try {
			MoneyHubJSFuc("SetParameter","AccountChanged", "1");
			//更新report页面
			MoneyHubJSFuc("SetParameter","Report_Changed", "1");
		} catch (e) {
            logCatch(e.toString());
		}
	} else {
		if ($("#dSetAccount tr[accountid='" + oldAid + "'][subaccountid!='0']").length <= 1) {
			//只有一个子账户了，需要问用户一下
			var flag = 1;
			handleDeleteAccount(tid, oldAid, oldSid, flag);
		} else {
			//有多个子账户，直接删了吧
			handleDeleteAccount(tid, oldAid, oldSid);
		}
	}
	
}
/*
 * tid 分类
 * oldAid, 原主账户
 * oldSid, 原子账户
 * newAid, 新主账户
 * newSid, 新子账户
 * type, 0，主账户处理，1子账户处理 
 * handleClass， 0，move处理，1，merge处理
 */
function renderMergeAccountAndHandleEvent( tid, oldAid, oldSid, newAid, newSid, type, handleClass ) {
	debug(tid+":::"+oldAid+":::"+oldSid+":::"+newAid+":::"+newSid+":::"+type+":::"+handleClass+"\n");
	try{
		if ( type == 0 ) {
			//主账户只能处理
			//删除主账户
			//从列表中删除
			var name = $("#tAT" + tid + " tr[accountid='" + oldAid + "']").attr("accountname");
			$("#tAT" + tid + " tr[accountid='" + oldAid + "']").remove();
             deleteEvent(oldAid);
			//删除数组中该项
			$.each(listAccount, function(i, n) {
				if (n.aid == oldAid) {
					listAccount.splice(i, 1);
					return false;
				}
			});
		} else {
			//删除子账户
			//从列表中删除
			if(handleClass == 0){
				//移动
				debug("move_sub\n");
				debug(tid+"::::::::"+oldAid+":::::::::"+oldSid+"\n");
				if (tid == 3){
				    deleteEvent(oldAid, oldSid);
				}else if (tid == 2){
			       if ($("#dSetAccount tr[accountid='" + oldAid + "'][subaccountid!='0']").length <= 1) {
			        deleteEvent(oldAid);
				   }
				}
				$("#tAT" + tid + " tr[subaccountid='" + oldSid + "'][accountid='" + oldAid + "']").clone(true).attr("accountid",newAid).insertAfter($("#tAT" + tid + " tr[subaccountid='0'][accountid='" + newAid + "']"));
				$("#tAT" + tid + " tr[subaccountid='" + oldSid + "'][accountid='" + oldAid + "']").remove();
				if ($("#tAT" + tid + " tr[subaccountid!='0'][accountid='" + oldAid + "']").length == 0) {
					$("#tAT" + tid + " tr[subaccountid='0'][accountid='" + oldAid + "']").remove();
				}
				//删除数组中该项,移动的话，要修改数据表的数据
				$.each(listAccount, function(i, n) {
					if (n.bid == oldSid) {
						listAccount[i].aid=newAid;
						return false;
					}
				});
			} else {
				//合并
				debug("merge_sub\n");
				deleteEvent(oldAid, oldSid);
				$("#tAT" + tid + " tr[subaccountid='" + oldSid + "'][accountid='" + oldAid + "']").remove();
				if ($("#tAT" + tid + " tr[subaccountid!='0'][accountid='" + oldAid + "']").length == 0) {
					$("#tAT" + tid + " tr[subaccountid='0'][accountid='" + oldAid + "']").remove();
				}
				//删除数组中该项
				$.each(listAccount, function(i, n) {
					if (n.bid == oldSid) {
						listAccount.splice(i, 1);
						return false;
					}
				});
				//更新新的子账户的余额
				modifySubAccountBalance(newSid);
				modifyPageSubAccountBalance(tid,newAid,newSid);
			}
		}	
	
	} catch(e) {
        logCatch(e.toString());
		debug("renderMergeAccountAndHandleEvent="+e.message);
	}
	//更新新的主账户总金额
	renderAccountPageAmount(tid,newAid);
}


/*
 * 更新页面的主账户余额方法
 */
function renderAccountPageAmount(tid,aid){
	try{
		var totalAmount = 0;
		if(tid=="2"||tid=="3"){
			 
			$("#tAT" + tid + " tr[accountid='" + aid + "'][subaccountid!='0']").each(function () {
				totalAmount += Math.round(getRMBExchangeInfo2($(this).attr("currency")) * parseFloat($(this).children(".tSRBamount").html())) / 100;
			});
			totalAmount = formatnumber(totalAmount, 2);
			$("#tAT" + tid + " tr[accountid='" + aid + "'][subaccountid='0']").children(".tSRBamount").html(totalAmount);
			$("#tAT" + tid + " tr[accountid='" + aid + "'][subaccountid='0']").children(".tSRBamount1").html("人民币");
		} else {
			var sid = getMySubAccountId( aid );
			totalAmount = getSubAccountBalance( sid );
			$("#tAT" + tid + " tr[accountid='" + aid + "']").children(".tSRBamount").html(totalAmount);
		}
	}catch(e){
        logCatch(e.toString());
		debug("renderAccountPageAmount="+e.message);
	}
}

/*
 * 更新页面子账户余额以及页面数据
 */

function modifyPageSubAccountBalance(tid,aid,sid){
	try{
		if(tid=="2"||tid=="3"){
			var newBalance = getSubAccountBalance( sid );
			$("#tAT" + tid + " tr[accountid='" + aid + "'][subaccountid='" + sid + "']").children(".tSRBamount").html(newBalance);
			//更新页面的子账户数据
			$.each(listAccount, function(i, n) {
				if (n.bid == sid) {
					listAccount[i].Balance=newBalance;
					return false;
				}
			});
		}
	} catch(e){
        logCatch(e.toString());
		debug("modifyPageSubAccountBalance="+e.message);
	}
}
