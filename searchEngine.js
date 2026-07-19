//This generic function will return the value of a QueryString
function getQueryString(Val) {
	thisURLparamStr = document.location.search;
	//chop "?" off thisURLparamStr
	if (thisURLparamStr.charAt(0) == "?") thisURLparamStr = thisURLparamStr.substring(1, thisURLparamStr.length);
	returnStr = "";
	if (thisURLparamStr != "") {
		//Build array out of thisURLparamStr using "&" as delimiter
		divide1=(thisURLparamStr.split("&"))
		for (i=0; i < divide1.length; i++) {
			divide2 = divide1[i].split("=")
			if (unescape(divide2[0]) == Val) {
				//returnStr = unescape(divide2[1]);
				returnStr = decodeURIComponent(divide2[1]);
				
			}
		}
	}
	return returnStr;
}


// This function merges title, brief description, page content, keywords 
function mergeStrings(str1, str2) {

	var mergeStr = "";
	var mergeString = "";
	//alert(str3)
	// join str2 (rest of page text)
	// if page content is longer than brief description length,
	// then str2 ends "..."
	// if str2 ends "..." remove dots
	if ((str2.length > 0) && (str2.charAt(0) != " ")) str2 = " " + str2;
	if (str2.substring(str2.length - 3, str2.length) == "...") {
			mergeString = str2.substring(0, str2.length - 3);
	} else {
			mergeString = str2;
	}
	mergeString = str1 + mergeString
	return mergeString

}


//this function builds brief description object
function briefDescrip(posStart, posEnd, posTerm, termTxt, isBegin, isEnd) {


	//get workable substring from termTxt characters
	var subStrStart = (isBegin)? 0:termTxt.indexOf(" ");
	var subStrEnd = (isEnd)? termTxt.length:termTxt.lastIndexOf(" ");
	termTxt = termTxt.substring(subStrStart, subStrEnd);
	//adjust position properties to new termTxt substring
	var termStrStart = posStart + subStrStart;
	var termStrEnd = termStrStart + termTxt.length;
	var posTerm = posTerm - subStrStart;
	
	//alert(termTxt + ", " + termStrStart + ", " + termStrEnd + ", " + posTerm)

	this.posStart = termStrStart;
	this.posEnd = termStrEnd;
	this.posTerm = posTerm;
	this.termTxt= termTxt;
}


//This function ensures that the brief description string does not contain repeats
function noPreviousOccur(thisArray, thisIndex) {
	returnStr = true;

	if (thisIndex > refineAllString.length) {
		returnStr = false;
	} else {
		//if thisIndex is contained in an existing substring return false
		for (x=0; x < thisArray.length; x++) {
			if ((thisIndex > thisArray[x].posStart) && (thisIndex < thisArray[x].posEnd)) {
				returnStr = false;
				break;
			}
		}
	}
	return returnStr;
}


// This function will parse the URL search string and change a name/value pair
function changeParam(whichParam, newVal) {
	newParamStr = "";
	thisURLstr = document.location.href.substring(0, document.location.href.indexOf("?"));
	thisURLparamStr = document.location.href.substring(document.location.href.indexOf("?") + 1, document.location.href.length);
	//Build array out of thisURLparamStr using "&" as delimiter
	divide1=(thisURLparamStr.split("&"))
	for (cnt=0; cnt < divide1.length; cnt++) {
		divide2 = divide1[cnt].split("=")
		if (divide2[0] == whichParam) {
			// if we find whichParam in thisURLparamStr replace whichParam's value with newVal
			newParamStr = newParamStr + divide2[0] + "=" + escape(newVal) + "&";
		} else {
			//leave other parameters intact
			newParamStr = newParamStr + divide2[0] + "=" + divide2[1] + "&";
		}
	}
	//strip off trailing ampersand
	if (newParamStr.charAt(newParamStr.length - 1) == "&") newParamStr = newParamStr.substring(0, newParamStr.length - 1);
	//return new URL
 	return(thisURLstr + "?" + newParamStr);
}


// Sorts search results based on 1.Number of hits 2.alphabetically
function compare(a, b) {
	if (parseInt(a) - parseInt(b) != 0) {
		return parseInt(a) - parseInt(b)
	}else {
		var aComp = a.substring(a.indexOf("|") + 1, a.length)
		var bComp = b.substring(b.indexOf("|") + 1, b.length)
		if (aComp < bComp) {return -1}
		if (aComp > bComp) {return 1}
		return 0
	}
}


function cleanUp(inputStr) {
	var returnStr = "";
	//myRE = new RegExp(/(\*|\/|\?|\[|\])/g)
	var myRegExp = new RegExp();
	myREgExp = /\+/g;
	returnStr = inputStr.replace(myREgExp, " ");
	//clean up spaces at beginning of string
	while (returnStr.charAt(0) == ' ') {					
		returnStr = returnStr.substring(1,returnStr.length);
	}
	//clean up spaces at end of string
	while (returnStr.charAt(returnStr.length - 1) == ' ') {
		returnStr = returnStr.substring(0,returnStr.length - 1);
	}

	//alert(returnStr)
	return returnStr;
}

//customized by James Dean. Determine what the target will be
//if the fra_contents frame doesn't exist then display the search results on the current page
try {
    var basefrm = parent.document.getElementById("basefrm");
}
catch (err) {
    var basefrm = null 
}

//if (parent.document.getElementById("basefrm") != null)
if (basefrm != null)
	{
    target="basefrm";
	}
else
    {
    target="_self";
    }


//retrieve form submission, declare globals
    var preview = getQueryString("chkpreview")   //customized by James Dean
    var LineCount = 0;
var searchTerm = cleanUp(getQueryString("searchField"));
var srcCrit = getQueryString("srcriteria");
var srcRange = (getQueryString("range") != "")? parseInt(getQueryString("range")):1;
var maxPages = 100;  //customized by James Dean. Changed from 10 to 100
var OccurNum = 0;
var beginPhrase = 0;
var splitline = new Array();
var searchArray = new Array();
var matchArray = new Array();
var descripStrArray = new Array();
var DescripStr = "";
var allConfirmation = true;
var atBegin = false;
var atEnd = false;
var REsearchTerm = searchTerm;
var myRegExp = new RegExp();
//var specialChars = new Array("*", "/", "?", "[", "]", ".")
var specialChars = new Array("*", "/", "?", "[", "]", ".", "(", ")")
for (i=0; i<specialChars.length; i++) {
	eval("myREgExp = /\\" + specialChars[i] + "/g");
	REsearchTerm = REsearchTerm.replace(myREgExp, "\\" + specialChars[i]);
}


function doSearch() {
	for (cnt1=0; cnt1<profiles.length; cnt1++) {
	
		OccurNum = 0;
		MatchesPerTerm = 0;
		splitline = profiles[cnt1].split("|");
		refineAllString = mergeStrings(splitline[0], splitline[1])
		pgKeyWds = " " + cleanUp(splitline[2]);
		descripStrArray = new Array();
		DescripStr = "";

		switch (srcCrit) {
	
			case "all":    //user requests ALL WORDS
			allConfirmation = true;
			searchArray = REsearchTerm.split(" ");
			//determine how many terms get a phrase in the description
			MatchesPerTerm = (parseInt(4/searchArray.length) > 0)? parseInt(4/searchArray.length):1;
			// loop through all search terms
			for (cnt2 = 0; cnt2 < searchArray.length; cnt2++) {
				TotalMatches = 0;    //reset to zero for every new word
				eval("myRE = /" + searchArray[cnt2] + "/gi");
				OccurTest = myRE.test(refineAllString + pgKeyWds);

				if (OccurTest) {    // matches are found
					OccurArray = myRE.exec(refineAllString + pgKeyWds);
					myRE.firstIndex = 0;
					myRE.lastIndex = 0;
					beginPhrase = 0;
					while (OccurArray = myRE.exec(refineAllString + pgKeyWds)) {
					//while (refineAllString.match(myRE)) {
						OccurNum++;
						
						if ((TotalMatches < MatchesPerTerm) && (descripStrArray.length < 4)) {
							// if index for this term is not already contained in descripStrArray items then
							// build description object with four properties:
							// start index, end index, term position index, matching substring.
							beginPhrase = myRE.lastIndex - myRE.source.length;
							if (noPreviousOccur(descripStrArray, beginPhrase)) {

								//is substring beginning of refineAllString?
								if (beginPhrase - 35 > 0) {
									startPos = beginPhrase - 35;
									atBegin = false;
									
								} else {
									startPos = 0;
									atBegin = true;
								}
								//is substring end of refineAllString?
								if (myRE.lastIndex + 35 < refineAllString.length) {
									endPos =  myRE.lastIndex + 35;
									atEnd = false;
									
								} else {
									endPos = refineAllString.length;
									atEnd = true;
								}
								descripStrArray[descripStrArray.length] = new briefDescrip(startPos, endPos, beginPhrase, refineAllString.substring(startPos, endPos), atBegin, atEnd)
								TotalMatches++;
							}
							
						} else {
							break;
						}

					}    //end while


				} else {    //no match on this term
					allConfirmation = false;
					break;
				}


			} // end cnt2 loop
			
			if (allConfirmation) {

				//build brief description
				DescripStr = "";
				for (cnt2 = 0; cnt2 < descripStrArray.length; cnt2++) {
					DescripStr += descripStrArray[cnt2].termTxt + "&#8230;";
				}
				//buildNode(OccurNum, cnt1, DescripStr);
				matchArray[matchArray.length] = (0 - OccurNum) + "|" + splitline[0] + "|" + DescripStr + "|" + splitline[3]
			}
			break;


			case "phrase":	//user requests EXACT PHRASE
			TotalMatches = 0;
			MatchesPerTerm = 4;
			var myRE = new RegExp("\\b" + REsearchTerm + "\\b", "gi");
			OccurTest = myRE.test(refineAllString + pgKeyWds);
			if (OccurTest) {
				OccurArray = myRE.exec(refineAllString + pgKeyWds);
				myRE.firstIndex = 0;
				myRE.lastIndex = 0;
				beginPhrase = 0;
				while (OccurArray = myRE.exec(refineAllString + pgKeyWds)) {
					OccurNum++;
					if ((TotalMatches < MatchesPerTerm) && (descripStrArray.length < 4)) {

						beginPhrase = myRE.lastIndex - myRE.source.length;
						if (noPreviousOccur(descripStrArray, beginPhrase)) {
						
							//is substring beginning of refineAllString?
							if (beginPhrase - 35 > 0) {
								startPos = beginPhrase - 35;
								atBegin = false;
							
							} else {
								startPos = 0;
								atBegin = true;
							}
							//is substring end of refineAllString?
							if (myRE.lastIndex + 35 < refineAllString.length) {
								endPos =  myRE.lastIndex + 35;
								atEnd = false;
								
							} else {
								endPos = refineAllString.length;
								atEnd = true;
							}
							descripStrArray[descripStrArray.length] = new briefDescrip(startPos, endPos, beginPhrase, refineAllString.substring(startPos, endPos), atBegin, atEnd)
							TotalMatches++;
						}
					}
				}
				DescripStr = "";
				for (cnt2 = 0; cnt2 < descripStrArray.length; cnt2++) {
					DescripStr += descripStrArray[cnt2].termTxt + "&#8230;";
				}
				//buildNode(OccurNum, cnt1, DescripStr);
				matchArray[matchArray.length] = (0 - OccurNum) + "|" + splitline[0] + "|" + DescripStr + "|" + splitline[3]
			}
			break;
			

			default:		//user requests nothing or ANY WORDS
			searchArray = REsearchTerm.split(" ");
			MatchesPerTerm = (parseInt(4/searchArray.length) > 0)? parseInt(4/searchArray.length):1;
			for (cnt2 = 0; cnt2 < searchArray.length; cnt2++) {
				
				TotalMatches = 0;    //reset to zero for every new word
				eval("myRE = /" + searchArray[cnt2] + "/gi");
				OccurTest = myRE.test(refineAllString + pgKeyWds);

				if (OccurTest) {    // matches are found
					OccurArray = myRE.exec(refineAllString + pgKeyWds);
					myRE.firstIndex = 0;
					myRE.lastIndex = 0;
					beginPhrase = 0;
					while (OccurArray = myRE.exec(refineAllString + pgKeyWds)) {
						OccurNum++;
						if ((TotalMatches < MatchesPerTerm) && (descripStrArray.length < 4)) {
							// if index for this term is not already contained in descripStrArray items then
							// build description object with four properties:
							// start index, end index, term position index, matching substring.
							beginPhrase = myRE.lastIndex - myRE.source.length;
							if (noPreviousOccur(descripStrArray, beginPhrase)) {

								//is substring beginning of refineAllString?
								if (beginPhrase - 35 > 0) {
									startPos = beginPhrase - 35;
									atBegin = false;
									
								} else {
									startPos = 0;
									atBegin = true;
								}
								//is substring end of refineAllString?
								if (myRE.lastIndex + 35 < refineAllString.length) {
									endPos =  myRE.lastIndex + 35;
									atEnd = false;
								
								} else {
									endPos = refineAllString.length;
									atEnd = true;
								}
								descripStrArray[descripStrArray.length] = new briefDescrip(startPos, endPos, beginPhrase, refineAllString.substring(startPos, endPos), atBegin, atEnd);
								TotalMatches++;
							}
							
						} else {
							break;
						}
					}
				}
			}
			if (OccurNum > 0) {
				//build brief description
				DescripStr = "";
				for (cnt3 = 0; cnt3 < descripStrArray.length; cnt3++) {
					DescripStr += descripStrArray[cnt3].termTxt + "&#8230;";
				}
				//buildNode(OccurNum, cnt1, DescripStr);
				matchArray[matchArray.length] = (0 - OccurNum) + "|" + splitline[0] + "|" + DescripStr + "|" + splitline[3]
			}
			break;

		} //end switch


	} //end cnt1



	//for (i=0; i<matchArray.length; i++) {
	//	divide = matchArray[i].split("|");
	//	document.write("<br>" + "<b>" + divide[1] + "</b> (" + divide[0] + ") " + "<br>" + divide[2] + "<br>")
	//}

	//results = passedArray;
	//pgRange = (getQueryString("range") != "")? parseInt(getQueryString("range")):1;
	//document.writeln("<a name=\"top_of_page\"></a><h3>Search Results</h3>");
	//document.writeln("<h4><hr size=\"1\">Search Query: " + searchTerm + "<br>");
	//Customized by James Dean
	//document.writeln("<div class='StaticSearchMatchesFound'><strong>" + matchArray.length + " matches found for '" + searchTerm + "'</strong></div>");
	document.writeln("<div class='StaticSearchMatchesFound'><strong>Search Results</strong><br/> Your search for '" + searchTerm + "', found the following pages. Displaying " + matchArray.length + " pages, with the best matches first:</div>");
	
	
	thisPg = 1;
	endPg = matchArray.length;
	if (matchArray.length > maxPages) {
		thisPg = (maxPages * srcRange) - (maxPages - 1);
		endPg = (parseInt(thisPg + (maxPages - 1)) < matchArray.length)? parseInt(thisPg + (maxPages - 1)):matchArray.length;
		document.writeln(thisPg + " - " + endPg + " of " + matchArray.length);
	}
	document.writeln("<dl class='searchresults'>");
	matchArray.sort(compare);
	wrdArray = (srcCrit != "phrase")? REsearchTerm.split(" "):new Array(REsearchTerm);

	
	for (i = (thisPg - 1); i < endPg; i++) {
		divide = matchArray[i].split("|"); 			// Print each profile result as a unit of a definition list
		
		// begin hilite terms in red
		for (j=0; j<wrdArray.length; j++) {
			eval("myRE1 = /" + wrdArray[j] + "/gi");
			regArr = null;
			regArr = divide[2].match(myRE1);
			if (regArr != null) {
				//look for uniqueness in regArr
				beenThere = new Array();
				for (k=0; k<regArr.length; k++) {
					beenhere = 0; 
					for (l=0; l<beenThere.length; l++) {
						if (beenThere[l] == regArr[k]) {
							beenhere = 1;
							//break;
						}
					}
					if (beenhere == 0) {
						beenThere[beenThere.length] = regArr[k];
						//escape RegExp special chars for RegExp
						var specialChars = new Array("*", "/", "?", "[", "]", "(", ")")
						tmpRegArr = regArr[k];
						for (l=0; l<specialChars.length; l++) {
							eval("myRE1a = /\\" + specialChars[l] + "/g");
							regArr[k] = regArr[k].replace(myRE1a, "\\" + specialChars[l]);
						}
						eval("myRE2 = /"+regArr[k]+"/g");
						divide[2] = divide[2].replace(myRE2, "<\|>" + tmpRegArr + "<\/\|>");
					}
				}
			}
		}

		myRE3 = /\<\|\>/g;
		myRE4 = /\<\/\|\>/g;
		divide[2] = divide[2].replace(myRE3, "<font color=green>");
		//divide[2] = divide[2].replace(myRE3, "<font color=orange>");
		divide[2] = divide[2].replace(myRE4, "</font>");
		// end hilite terms in red
		//customized by James Dean so that preview only shows if the option is checked.
		//document.writeln("<dt><a href=\""+divide[3]+"\" target=\"_self\"><b>" + divide[1] + "</b></a><\dt>");
		//document.writeln("<dt><a href=\""+divide[3]+"?searchTxt=" + searchTerm + "\" target=\""+target+"\">" + divide[1] + "</a><\dt>");
		if (preview=="on")
		    {
	        //document.writeln("<dt><a href=\"" + divide[3] + "?searchTxt=" + searchTerm + "&criteria=" + srcCrit + "\" target=\"" + target + "\" style=\"font-weight:bold\">" + divide[1] + "</a><\dt>");
		        LineCount = LineCount + 1;
		        document.writeln("<dt><div style='padding-bottom:3px'><a href=\"" + divide[3] + "?searchTxt=" + searchTerm + "&criteria=" + srcCrit + "\" target=\"" + target + "\" >" + divide[1] + "</a></div><\dt>");
		        //document.writeln("<dt><strong>" + LineCount + ". <a href=\"" + divide[3] + "?searchTxt=" + searchTerm + "&criteria=" + srcCrit + "\" target=\"" + target + "\" >" + divide[1] + "</a></strong><\dt>");
		        //document.writeln("<dd>" + divide[2] + "</dd><br><br>");
		        document.writeln("<span class=\"StaticSearchResultsDesc\">" + divide[2] + "</span></br></br>");
		    }
		else {
		    //document.writeln("<dt><a href=\""+divide[3]+"?searchTxt=" + searchTerm + "\" target=\""+target+"\">" + divide[1] + "</a><\dt>");
		    document.writeln("<dt><a href=\"" + divide[3] + "?searchTxt=" + searchTerm + "&criteria=" + srcCrit + "\" target=\"" + target + "\">" + divide[1] + "</a><\dt>");
		    }
	}
	
	document.writeln("</dl>");				// Finish the HTML document

	//write results page numbers
	if (matchArray.length > maxPages) {
		pgNum = parseInt(matchArray.length/maxPages);
		if (matchArray.length/maxPages > pgNum) pgNum++;
		pgLinks = "go to page: ";
		for (i=0; i < pgNum; i ++) {
			locationStr = (location.href.indexOf("&range=") > -1)? changeParam("range", parseInt(i + 1)):location.href + "&range=" + parseInt(i + 1);
			pgLinks += (parseInt(i + 1) != srcRange)? "<a href=\"" + locationStr + "\">" + (i + 1) + "</a> ":"<b>" + (i + 1) + "</b> ";
		}
		document.writeln(pgLinks + "<hr size=\"1\">");
	}

	//After the search is complete, hide the loading image
//	parent.document.getElementById("div_javascript_contents").style.backgroundImage = "";
}

