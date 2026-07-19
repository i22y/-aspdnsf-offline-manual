function HighlightPage(pageid,pagename){try{if(parent.document.getElementById("fra_contents")!=null){docObj=parent.fra_contents.findObj(pageid);docObj.forceOpeningOfAncestorFolders();parent.fra_contents.highlightObjLink(docObj)}
if(parent.document.getElementById("VarPageName")!=null){parent.document.getElementById("VarPageName").innerHTML=pagename;}}
catch(err){}}
function MenuItemSelected(pageid){if(document.getElementById("tdmenu_"+pageid)!=null){var container=document.getElementById("tablemenu_container");if(container.getElementsByClassName){var SelectedTags=container.getElementsByClassName("menu_selected");for(var i=0;i<SelectedTags.length;i++){var SelectedTag=SelectedTags[i];SelectedTag.className="menu_notselected";}}
document.getElementById("tdmenu_"+pageid).className="menu_selected";}}
function HighlightSearchText(){sCriteria=getURLvalue("criteria");sSearchText=getURLvalue("searchTxt");if(sSearchText!=""){if(sCriteria=="phrase"){highlightSearchTerms(sSearchText,true);}
else{highlightSearchTerms(sSearchText,false);}}}
function getURLvalue(getName){var i,pos,argname,argvalue,queryString,pairs;queryString=location.href.substring(location.href.indexOf("?")+1);pairs=queryString.split("&");for(i=0;i<pairs.length;i++){pos=pairs[i].indexOf('=');if(pos==-1){continue;}
argname=pairs[i].substring(0,pos);argvalue=pairs[i].substring(pos+1);if(argname==getName){return unescape(argvalue.replace(/\+/," "));}}
return false;}
function doHighlight(bodyText,searchTerm,highlightStartTag,highlightEndTag){if((!highlightStartTag)||(!highlightEndTag)){highlightStartTag="<font style='background-color:yellow;'>";highlightEndTag="</font>";}
var newText="";var i=-1;var lcSearchTerm=searchTerm.toLowerCase();var lcBodyText=bodyText.toLowerCase();while(bodyText.length>0){i=lcBodyText.indexOf(lcSearchTerm,i+1);if(i<0){newText+=bodyText;bodyText="";}else{if(bodyText.lastIndexOf(">",i)>=bodyText.lastIndexOf("<",i)){if(lcBodyText.lastIndexOf("/script>",i)>=lcBodyText.lastIndexOf("<script",i)){newText+=bodyText.substring(0,i)+highlightStartTag+bodyText.substr(i,searchTerm.length)+highlightEndTag;bodyText=bodyText.substr(i+searchTerm.length);lcBodyText=bodyText.toLowerCase();i=-1;}}}}
return newText;}
function highlightSearchTerms(searchText,treatAsPhrase,warnOnFailure,highlightStartTag,highlightEndTag){if(treatAsPhrase){searchArray=[searchText];}else{searchArray=searchText.split(" ");}
if(!document.body||typeof(document.body.innerHTML)=="undefined"){if(warnOnFailure){alert("Sorry, for some reason the text of this page is unavailable. Searching will not work.");}
return false;}
var bodyText=document.body.innerHTML;for(var i=0;i<searchArray.length;i++){bodyText=doHighlight(bodyText,searchArray[i],highlightStartTag,highlightEndTag);}
document.body.innerHTML=bodyText;return true;}
function AC_AX_RunContent(){var ret=AC_AX_GetArgs(arguments);AC_Generateobj(ret.objAttrs,ret.params,ret.embedAttrs);}
function AC_AX_GetArgs(args){var ret=new Object();ret.embedAttrs=new Object();ret.params=new Object();ret.objAttrs=new Object();for(var i=0;i<args.length;i=i+2){var currArg=args[i].toLowerCase();switch(currArg){case "pluginspage":case "type":case "src":ret.embedAttrs[args[i]]=args[i+1];break;case "data":case "codebase":case "classid":case "id":case "onafterupdate":case "onbeforeupdate":case "onblur":case "oncellchange":case "onclick":case "ondblClick":case "ondrag":case "ondragend":case "ondragenter":case "ondragleave":case "ondragover":case "ondrop":case "onfinish":case "onfocus":case "onhelp":case "onmousedown":case "onmouseup":case "onmouseover":case "onmousemove":case "onmouseout":case "onkeypress":case "onkeydown":case "onkeyup":case "onload":case "onlosecapture":case "onpropertychange":case "onreadystatechange":case "onrowsdelete":case "onrowenter":case "onrowexit":case "onrowsinserted":case "onstart":case "onscroll":case "onbeforeeditfocus":case "onactivate":case "onbeforedeactivate":case "ondeactivate":ret.objAttrs[args[i]]=args[i+1];break;case "width":case "height":case "align":case "vspace":case "hspace":case "class":case "title":case "accesskey":case "name":case "tabindex":ret.embedAttrs[args[i]]=ret.objAttrs[args[i]]=args[i+1];break;default:ret.embedAttrs[args[i]]=ret.params[args[i]]=args[i+1];}}
return ret;}
function AC_AddExtension(src,ext){if(src.indexOf('?')!=-1)
return src.replace(/\?/,ext+'?');else
return src+ext;}
function AC_Generateobj(objAttrs,params,embedAttrs){var str='<object ';for(var i in objAttrs)
str+=i+'="'+objAttrs[i]+'" ';str+='>';for(var i in params)
str+='<param name="'+i+'" value="'+params[i]+'" /> ';str+='<embed ';for(var i in embedAttrs)
str+=i+'="'+embedAttrs[i]+'" ';str+=' ></embed></object>';document.write(str);}
function AC_FL_RunContent(){var ret=AC_GetArgs
(arguments,".swf","movie","clsid:d27cdb6e-ae6d-11cf-96b8-444553540000","application/x-shockwave-flash");AC_Generateobj(ret.objAttrs,ret.params,ret.embedAttrs);}
function AC_SW_RunContent(){var ret=AC_GetArgs
(arguments,".dcr","src","clsid:166B1BCA-3F9C-11CF-8075-444553540000",null);AC_Generateobj(ret.objAttrs,ret.params,ret.embedAttrs);}
function AC_GetArgs(args,ext,srcParamName,classid,mimeType){var ret=new Object();ret.embedAttrs=new Object();ret.params=new Object();ret.objAttrs=new Object();for(var i=0;i<args.length;i=i+2){var currArg=args[i].toLowerCase();switch(currArg){case "classid":break;case "pluginspage":ret.embedAttrs[args[i]]=args[i+1];break;case "src":case "movie":args[i+1]=AC_AddExtension(args[i+1],ext);ret.embedAttrs["src"]=args[i+1];ret.params[srcParamName]=args[i+1];break;case "onafterupdate":case "onbeforeupdate":case "onblur":case "oncellchange":case "onclick":case "ondblClick":case "ondrag":case "ondragend":case "ondragenter":case "ondragleave":case "ondragover":case "ondrop":case "onfinish":case "onfocus":case "onhelp":case "onmousedown":case "onmouseup":case "onmouseover":case "onmousemove":case "onmouseout":case "onkeypress":case "onkeydown":case "onkeyup":case "onload":case "onlosecapture":case "onpropertychange":case "onreadystatechange":case "onrowsdelete":case "onrowenter":case "onrowexit":case "onrowsinserted":case "onstart":case "onscroll":case "onbeforeeditfocus":case "onactivate":case "onbeforedeactivate":case "ondeactivate":case "type":case "codebase":ret.objAttrs[args[i]]=args[i+1];break;case "width":case "height":case "align":case "vspace":case "hspace":case "class":case "title":case "accesskey":case "name":case "id":case "tabindex":ret.embedAttrs[args[i]]=ret.objAttrs[args[i]]=args[i+1];break;default:ret.embedAttrs[args[i]]=ret.params[args[i]]=args[i+1];}}
ret.objAttrs["classid"]=classid;if(mimeType)ret.embedAttrs["type"]=mimeType;return ret;}
function hidepopup(id){setTimeout("hidepopup2('"+id+"')",300);}
function hidepopup2(id){document.getElementById(id).style.display="none";}
function ShowPopup(event,PopupID,PopupType){var docwidth=document.documentElement.clientWidth;var docheight=document.documentElement.clientHeight;var boxwidth=302;var boxheight=102;var scrollX=document.documentElement.scrollLeft+document.body.scrollLeft;if(document.documentElement.scrollTop==document.body.scrollTop){var scrollY=document.documentElement.scrollTop;}
else{var scrollY=document.documentElement.scrollTop+document.body.scrollTop;}
if(docwidth-event.clientX<boxwidth){document.getElementById(PopupID).style.left=event.clientX+scrollX-boxwidth+"px";}
else{document.getElementById(PopupID).style.left=event.clientX+scrollX+15+"px";}
if(docheight-event.clientY<boxheight){document.getElementById(PopupID).style.top=event.clientY+scrollY-boxheight+"px";}
else{document.getElementById(PopupID).style.top=event.clientY+scrollY+8+"px";}
document.getElementById(PopupID).style.display=""
document.getElementById(PopupID).focus();}
function ShowMouseoverPopup(event,PopupID){var docwidth=document.documentElement.clientWidth;var docheight=document.documentElement.clientHeight;var boxwidth=313;var boxheight=177;var scrollX=document.documentElement.scrollLeft+document.body.scrollLeft;if(document.documentElement.scrollTop==document.body.scrollTop){var scrollY=document.documentElement.scrollTop;}
else{var scrollY=document.documentElement.scrollTop+document.body.scrollTop;}
if(docwidth-event.clientX<boxwidth){document.getElementById(PopupID).style.left=event.clientX+scrollX-boxwidth+"px";}
else{document.getElementById(PopupID).style.left=event.clientX+scrollX+5+"px";}
if(docheight-event.clientY<boxheight){document.getElementById(PopupID).style.top=event.clientY+scrollY-boxheight-70+"px";}
else{document.getElementById(PopupID).style.top=event.clientY+scrollY+8+"px";}
document.getElementById(PopupID).style.display=""}
function HideMouseoverPopup(event,PopupID){document.getElementById(PopupID).style.display="none"}
function ClickTab(obj){for(var i=0;i<obj.parentNode.parentNode.childNodes[0].childNodes.length;i++){tabnode=obj.parentNode.parentNode.childNodes[0].childNodes[i];bodynode=obj.parentNode.parentNode.childNodes[1].childNodes[i];tabnode.className="TabNotSelected";if(obj==tabnode){bodynode.className="TabBodySelected"}
else{bodynode.className="TabBodyNotSelected";}}
obj.className="TabSelected";}
function expand_Toggle_Panels(){var TDs=document.getElementsByTagName("TD");for(var no=0;no<TDs.length;no++){if(TDs[no].className=="TogglePanel_Heading"){TDs[no].parentNode.parentNode.rows.item(1).style.display="";TDs[no].style.backgroundImage="url(images/exp.gif)";}}
document.getElementById("Link_Expand_All").style.display="none";document.getElementById("Link_Collapse_All").style.display="";}
function collapse_Toggle_Panels(){var TDs=document.getElementsByTagName("TD");for(var no=0;no<TDs.length;no++){if(TDs[no].className=="TogglePanel_Heading"){TDs[no].parentNode.parentNode.rows.item(1).style.display="none";TDs[no].style.backgroundImage="url(images/col.gif)";}}
document.getElementById("Link_Expand_All").style.display="";document.getElementById("Link_Collapse_All").style.display="none";}