var dragMode=false;var obj=""
function toDragMode(){dragMode=true;obj=document.getElementById("tdcontentswrapper");if(document.getElementById("basefrm")!=null){document.getElementById("tdpage").style.display="none";document.getElementById("fra_contents").style.display="none";}}
function startMoving(e){if(!dragMode)return false;var iWidth=(e.clientX-1)-document.getElementById("tblmain").offsetLeft-document.getElementById("tbldetailwrapper").offsetLeft-document.getElementById("tdcontentswrapper").offsetLeft;if(iWidth<10){iWidth=10}
obj.style.width=iWidth+"px";}
function stopMoving(){dragMode=false;obj="";if(document.getElementById("basefrm")!=null){document.getElementById("tdpage").style.display="";document.getElementById("fra_contents").style.display="";}
if(document.getElementById("basefrm")!=null){window_resize();}}
function window_resize(){var tableHeight=getBrowserHeight()-4;var headerHeight=GetTagHeight("tdheader");var footerHeight=GetTagHeight("tdfooter");var pageheaderHeight=GetTagHeight("tdpageheader");var pagefooterHeight=GetTagHeight("tdpagefooter");var contentsheaderHeight=GetTagHeight("tdcontentsheader");var contentsfooterHeight=GetTagHeight("tdcontentsfooter");var pageHeight=tableHeight-headerHeight-footerHeight-pageheaderHeight-pagefooterHeight
var contentsHeight=tableHeight-headerHeight-footerHeight-contentsheaderHeight-contentsfooterHeight
var pageWidth=document.getElementById("tdpage").offsetWidth;document.getElementById("tblmain").style.height=tableHeight+"px";document.getElementById("tdcontents").style.height=contentsHeight+"px";document.getElementById("tdpage").style.height=pageHeight+"px";document.getElementById("basefrm").style.height=pageHeight+"px";}
function getBrowserHeight(){var myHeight=0;if(typeof(window.innerHeight)=='number'){myHeight=window.innerHeight;}
else{myHeight=document.documentElement.clientHeight;}
return myHeight;}
function GetTagHeight(TagID){var thisHeight=document.getElementById(TagID).offsetHeight;return thisHeight;}
function SearchKeyPress(searchtext,e){var key;if(window.event){key=window.event.keyCode;}
else{key=e.which;}
if(key==13){DisplaySearch(searchtext);return false;}
else{return true;}}
function CopytoClipboard(){Copied=txtPageURL.createTextRange();Copied.execCommand("Copy");document.getElementById("tdlinkmessage").innerHTML="URL Copied...<br/><br/>"}
function DisplaySearch(stext,sPageName){if(sPageName==""||sPageName==null){var sSearchPage="_search.htm";}
else{var sSearchPage="_search_"+sPageName+".htm";}
if(document.getElementById("basefrm")!=null){window.open(sSearchPage+"?searchField="+stext+"&type=noframes&chkpreview=on","basefrm");}
else{location.href=sSearchPage+"?searchField="+stext+"&type=noframes&chkpreview=on";}}
function DisplaySearchTab(){if(document.getElementById("fra_contents")!=null){}
else{document.getElementById("div_javascript_index").style.display="none";}
document.getElementById("div_javascript_contents").style.display="none";document.getElementById("divStaticSearchTab").style.display="";document.getElementById("tdcontentslabel").style.display="none";document.getElementById("tdindexlabel").style.display="none";document.getElementById("tdsearchtablabel").style.display="";document.getElementById("tdCloseContentsWindow").style.display="";if(document.getElementById("tab_contents_up")!=null){ClickContentsTab("search");}}
function DisplayIndex(){if(document.getElementById("fra_contents")!=null){window.open("_keywordindex.htm","fra_contents");document.getElementById("div_javascript_contents").style.display="";}
else if(document.getElementById("basefrm")!=null){window.open("_keywordindex.htm","basefrm");}
else if(document.getElementById("div_javascript_contents")!=null){document.getElementById("div_javascript_index").style.display="";document.getElementById("div_javascript_contents").style.display="none";}
else{location.href="_index.htm";}
document.getElementById("tdcontentslabel").style.display="none";document.getElementById("tdindexlabel").style.display="";document.getElementById("tdsearchtablabel").style.display="none";document.getElementById("tdCloseContentsWindow").style.display="";document.getElementById("divStaticSearchTab").style.display="none";if(document.getElementById("tab_contents_up")!=null){ClickContentsTab("index");}}
function showpageurl(){var sPageURL=String(window.basefrm.location.href);if(sPageURL.toLowerCase().indexOf("?")!=-1){sPageURL=sPageURL.substr(0,sPageURL.lastIndexOf("?"))}
var sPageName=sPageURL.substr(sPageURL.lastIndexOf("/")+1)
sPageURL=sPageURL.substr(0,sPageURL.lastIndexOf("/"))
var sPageURL=sPageURL+"/default.htm?"+sPageName;parent.window.location.href=sPageURL;}
function DisplayContents(){if(document.getElementById("fra_contents")!=null){window.open("contents.htm","fra_contents");}
else if(document.getElementById("basefrm")!=null){window.open("contents.htm","basefrm");}
else if(document.getElementById("div_javascript_contents")!=null){document.getElementById("div_javascript_index").style.display="none";}
else{location.href="contents.htm";}
document.getElementById("tdcontentslabel").style.display="";document.getElementById("tdindexlabel").style.display="none";document.getElementById("tdsearchtablabel").style.display="none";document.getElementById("tdCloseContentsWindow").style.display="none";document.getElementById("div_javascript_contents").style.display="";document.getElementById("divStaticSearchTab").style.display="none";if(document.getElementById("tab_contents_up")!=null){ClickContentsTab("contents");}}
function ClickContentsTab(tabname){if(tabname=="contents"){document.getElementById("tab_contents_up").style.display="none";document.getElementById("tab_contents_down").style.display="";document.getElementById("tab_index_up").style.display="";document.getElementById("tab_index_down").style.display="none";document.getElementById("tab_search_up").style.display="";document.getElementById("tab_search_down").style.display="none";}
else if(tabname=="index"){document.getElementById("tab_contents_up").style.display="";document.getElementById("tab_contents_down").style.display="none";document.getElementById("tab_index_up").style.display="none";document.getElementById("tab_index_down").style.display="";document.getElementById("tab_search_up").style.display="";document.getElementById("tab_search_down").style.display="none";}
else if(tabname=="search"){document.getElementById("tab_contents_up").style.display="";document.getElementById("tab_contents_down").style.display="none";document.getElementById("tab_index_up").style.display="";document.getElementById("tab_index_down").style.display="none";document.getElementById("tab_search_up").style.display="none";document.getElementById("tab_search_down").style.display="";}}
function addtofav(){if(document.getElementById("basefrm")==null){var sFavURL=String(location.href);var sPageName=sFavURL.substr(sFavURL.lastIndexOf("/")+1)}
else{var sPageURL=String(window.basefrm.location);var sPageName=sPageURL.substr(sPageURL.lastIndexOf("/")+1)
var sFavURL=window.location.href}
if(sFavURL.indexOf("?")!=-1){sFavURL=sFavURL.substr(0,sFavURL.lastIndexOf("?"))}
if(sPageName.indexOf("?")!=-1){sPageName=sPageName.substr(0,sPageName.lastIndexOf("?"))}
sPageName=sPageName.replace(/%20/g," ");var sTitle=sPageName;if(document.getElementById("basefrm")==null){AddBookmark(sFavURL,sTitle)}
else{AddBookmark(sFavURL+"?"+sPageName,sTitle)}}
function AddBookmark(url,title){if(window.sidebar){window.sidebar.addPanel(title,url,"");}else if(document.all){window.external.AddFavorite(url,title);}else if(window.opera&&window.print){alert('Press ctrl+D to bookmark (Command+D for macs) after you click Ok');}else{alert('Press ctrl+D to bookmark (Command+D for macs) after you click Ok');}}
function printpage(){if(document.getElementById("basefrm")!=null){printframe();}
else{if(navigator.userAgent.toLowerCase().indexOf("ie")==-1){window.print();}
else{print_noframes();}}}
function printframe(){window.frames['basefrm'].focus();window.frames['basefrm'].print();}
function print_noframes(){var printIframe=document.createElement("IFRAME");document.body.appendChild(printIframe);var printDocument=printIframe.contentWindow.document;printDocument.designMode="on";printDocument.open();var currentLocation=document.location.href;currentLocation=currentLocation.substring(0,currentLocation.lastIndexOf("/")+1);try{if(document.all){var htmlcontent=document.getElementById("tdpage")
printDocument.write("<html><head></head><body>"+htmlcontent.innerHTML+"</body></html>");printDocument.close();var oLink=printDocument.createElement("link");oLink.setAttribute("href",currentLocation+"pagestyles.css",0);oLink.setAttribute("type","text/css");oLink.setAttribute("rel","stylesheet",0);printDocument.getElementsByTagName("head")[0].appendChild(oLink);printDocument.execCommand("Print");}
else{printDocument.body.innerHTML="<link rel='stylesheet' type='text/css' href='"+currentLocation+"pagestyles.css'></link>"+printDocument.body.innerHTML;printIframe.contentWindow.print();}}
catch(ex){}
document.body.removeChild(printIframe);}
function loadStartupPage(){if(top.location.href.lastIndexOf("?")>0){var sPage=top.location.href.substring(top.location.href.lastIndexOf("?")+1,top.location.href.length);if(sPage.toLowerCase().lastIndexOf(".htm")>0){var myframe=document.getElementById("basefrm");if(myframe==null){location.href=sPage;}
else{document.getElementById("basefrm").src=sPage;}}
else if(sPage.toLowerCase()=="index"){ShowIndex();}}}
function loadpage(pageid,sfile){if(sfile!=null&&sfile!="undefined"&&sfile!=""){var pageurl=sfile}
else{var pageurl=pageid+".htm"}
if(pageid!=null&&pageid!=""&&pageid!="undefined"){var myframe=document.getElementById("basefrm");if(myframe==null){location.href=pageurl;}
else{document.getElementById("basefrm").src=pageurl;}}}
function previouspage(){onclick=history.back()}
function nextpage(){onclick=history.forward()}
function showhomepage(homepage){if(document.getElementById("basefrm")!=null){window.open(homepage,"basefrm");}
else{location.href=homepage;}}
function browse(){if(document.getElementById("basefrm")!=null){window.open("contents.htm","basefrm");}
else{location.href="contents.htm";}}
function showaskpage(){if(document.getElementById("basefrm")!=null){window.open("ask.htm","basefrm");}
else{location.href="ask.htm";}}
function showoptions(){if(document.getElementById("tbloptions").style.display==""){document.getElementById("tbloptions").style.display="none";}
else{document.getElementById("tbloptions").style.display="";document.getElementById("tbloptions").focus();document.getElementById("tbloptions").style.top=document.getElementById("imgoptions").offsetTop+document.getElementById("imgoptions").offsetHeight;document.getElementById("tbloptions").style.left=document.getElementById("imgoptions").offsetLeft+document.getElementById("imgoptions").offsetWidth-198;}}