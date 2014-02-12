/**
 * 
 */
"use strict"
//-----------utils
var utils = {};
utils.getXmlHttp = function() {
	var xmlhttp;
	try {
		xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
	} catch (e) {
		try {
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		} catch (E) {
			xmlhttp = false;
		}
	}
	if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
		xmlhttp = new XMLHttpRequest();
	}
	return xmlhttp;
};
utils.getCookie = function(name) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
};

if (!String.prototype.trim) {
	utils.trim = function(st) {
		return st.replace(/^\s+|\s+$/g, "");
	};
} else {
	utils.trim = function(st){
		return st.trim();
	};
};
var MyEvent
//------loginBlock
var loginBlock = {
		element:document.getElementById("loginArea"),
		loginInput: document.getElementById("login"),
		passInput:document.getElementById("password"),
		regButton: document.getElementById("regButton"),
		loginButton: document.getElementById("loginButton"),
		loginError: document.getElementById("loginError")
};
loginBlock.setError = function(er){
	loginError.innerText = er;
};
loginBlock._getQueryString = function(){
	var login =utils.trim(loginInput.value);
	var pass =passInput.value;
	var qstring='';
	if (login && pass){
		qstring +="user="+encodeURIComponent(login)+"&pass="+encodeURIComponent(pass); 
	} else {
		this.setError("User or passwor is empty")
	}
}

loginBlock.doLogin= function(){
	var xmlhttp = getXmlHttp();
	xmlhttp.open('POST', '/controller', true);
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4) {
            if(xmlhttp.status == 200) {
            	
			 } else if(xmlhttp.status == 401){
				 loginBlock.element.dispatchEvent(loginError);
			 }	else {
				 loginBlock.element.dispatchEvent(serverError);
			 }
		}
	};
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.send(this._getQueryString());
	
}
loginBlock.onError = function(){
	element.style.display = "block";
}
loginBlock.hide = function(){
	element.style.display = "none";
}
//-----workflow
if (utils.getCookie('cid')){
	
} else {
	
}