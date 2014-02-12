/**
 * 
 */
"use strict";
// -----------utils
var utils = {};

if (document.documentElement.addEventListener){
	utils.addListener = function(elem,listener,type){
		elem.addEventListener(type,listener);
	};
	utils.removeListener=function(elem,listener,type){
		elem.removeListener(type,listener);
	};
} else {
	utils.addListener = function(elem,listener,type,useCapture){
		elem.attachEvent("on"+type,listener);
	};	
	utils.removeListener= function(elem, listener, type){
		elem.detachEvent("on"+type,listener);
	};
};

utils.getXmlHttp = function() {
	var xmlhttp;
	try {
		xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
	} catch (e) {
		try {
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		} catch (E) {
			xmlhttp = false;
		};
	}
	if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
		xmlhttp = new XMLHttpRequest();
	}
	return xmlhttp;
};
utils.getCookie = function(name) {
	var matches = document.cookie
			.match(new RegExp("(?:^|; )"
					+ name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1')
					+ "=([^;]*)"));
	return matches ? decodeURIComponent(matches[1]) : undefined;
};

if (!String.prototype.trim) {
	utils.trim = function(st) {
		return st.replace(/^\s+|\s+$/g, "");
	};
} else {
	utils.trim = function(st) {
		return st.trim();
	};
};
if (CustomEvent) {
	utils.Event = function(name, detail) {
		var event = new CustomEvent(name, {"detail":detail});
		return event;
	};
} else {
	utils.Event = function(name, detail) {
		var event = document.createEvent('Event');
		event.initEvent(name, true, true);
		if (details) {
			event.detail = detail;
		}
		return event;
	};
};
if (!window.getComputedStyle) {
	utils.getComputedStyle = function(el, pseudo) {
		this.el = el;
		this.getPropertyValue = function(prop) {
			var re = /(\-([a-z]){1})/g;
			if (prop == "float")
				prop = "styleFloat";
			if (re.test(prop)) {
				prop = prop.replace(re, function() {
					return arguments[2].toUpperCase();
				});
			}
			return el.currentStyle[prop] ? el.currentStyle[prop] : null;
		};
		return this;
	};
} else {
	utils.getComputedStyle = window.getComputedStyle;
}
// ------------utils.Storage
utils.Storage = function() {
	if (localStorage) {
		this.st = localStorage;
	} else {
		this.st = {
			getItem : function(sKey) {
				if (!sKey || !this.hasOwnProperty(sKey)) {
					return null;
				}
				return unescape(document.cookie.replace(new RegExp(
						"(?:^|.*;\\s*)"
								+ escape(sKey).replace(/[\-\.\+\*]/g, "\\$&")
								+ "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
			},
			key : function(nKeyId) {
				return unescape(document.cookie
						.replace(/\s*\=(?:.(?!;))*$/, "").split(
								/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
			},
			setItem : function(sKey, sValue) {
				if (!sKey) {
					return;
				}
				document.cookie = escape(sKey) + "=" + escape(sValue)
						+ "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
				this.length = document.cookie.match(/\=/g).length;
			},
			length : 0,
			removeItem : function(sKey) {
				if (!sKey || !this.hasOwnProperty(sKey)) {
					return;
				}
				document.cookie = escape(sKey)
						+ "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
				this.length--;
			},
			hasOwnProperty : function(sKey) {
				return (new RegExp("(?:^|;\\s*)"
						+ escape(sKey).replace(/[\-\.\+\*]/g, "\\$&")
						+ "\\s*\\=")).test(document.cookie);
			}
		};
	};
};
utils.Storage.prototype.setObj = function(key, obj) {
	return this.st.setItem(key, JSON.stringify(obj));
};
utils.Storage.prototype.getObj = function(key) {
	return JSON.parse(this.st.getItem(key));
};
utils.storage = new utils.Storage();
// ------------utils.Element
utils.Element = function(element) {
	this.element = element;
	this.bordersX = 0;
	this.bordersY = 0;
	var cs = utils.getComputedStyle(element);
	this.bordersY += utils.getStyleValue(cs, "marginBottom", "margin-bottom");
	this.bordersY += utils.getStyleValue(cs, "marginTop", "margin-top");
	this.bordersX += utils.getStyleValue(cs, "marginLeft", "margin-left");
	this.bordersX += utils.getStyleValue(cs, "marginRigth", "margin-rigth");

	this.bordersY += utils.getStyleValue(cs, "paddingBottom", "padding-bottom");
	this.bordersY += utils.getStyleValue(cs, "paddingTop", "padding-top");
	this.bordersX += utils.getStyleValue(cs, "paddingLeft", "padding-left");
	this.bordersX += utils.getStyleValue(cs, "paddingRigth", "padding-rigth");
	var border = element.offsetWidth - element.clientWidth;
	if (border) {
		this.bordersX += border;
		this.bordersY += border;
	};
};
utils.getStyleValue = function(cs, propie, propW3C) {
	var re = /\D{1,}/g;
	var margin;
	margin = cs.getPropertyValue(propie); // ie
	if (!margin) {
		margin = cs.getPropertyValue(propW3C);// w3c
	}
	if (margin) {
		margin = margin.split(re);
		if (margin.length > 0) {
			var i = parseInt(margin[0]);
			if (i)
				return i;

		};

	}
	return 0;
};

utils.Element.prototype.setFullWidth = function(width) {
	this.element.style.width = width - this.bordersX + "px";
};
utils.Element.prototype.setFullHeight = function(height) {
	this.element.style.height = height - this.bordersY + "px";
};
utils.Element.prototype.getWidth = function() {
	return this.element.offsetWidth;
};
utils.Element.prototype.getHeigth = function() {
	return this.element.clientHeight;
};

// ------messenger
var messenger = {};
messenger.loginError = new utils.Event("loginError",
		"Incorrect login or password");
messenger.serverError = new utils.Event("serverError", "Server error");
messenger.loginEvent = new utils.Event("login");
// ------messenger.loginBlock
messenger.loginBlock = {
	element : document.getElementById("loginArea"),
	loginInput : document.getElementById("login"),
	passInput : document.getElementById("password"),
	regButton : document.getElementById("regButton"),
	loginButton : document.getElementById("loginButton"),
	loginError : document.getElementById("loginError")
};
messenger.loginBlock.setError = function(er) {
	loginError.innerText = er;
};
messenger.loginBlock._getQueryString = function() {
	var login = utils.trim(loginInput.value);
	var pass = passInput.value;
	var qstring = '';
	if (login && pass) {
		qstring += "user=" + encodeURIComponent(login) + "&pass="
				+ encodeURIComponent(pass);
	} else {
		this.setError("User or passwor is empty");
	}
	;
};

messenger.loginBlock.doQuery = function(action) {
	var xmlhttp = getXmlHttp();
	xmlhttp.open('POST', '/controller', true);
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4) {
			if (xmlhttp.status == 200) {
				messenger.loginBlock.hide();
				messenger.loginBlock.element.dispatchEvent(messenger.login);
			} else if (xmlhttp.status == 401) {
				messenger.loginBlock.element
						.dispatchEvent(messenger.loginError);
			} else {
				messenger.loginBlock.element
						.dispatchEvent(messenger.serverError);
			}
		}
	};
	xmlhttp.setRequestHeader("Content-type",
			"application/x-www-form-urlencoded");
	xmlhttp.send(this._getQueryString() + "&action=" + action);

};
messenger.loginBlock.doLogin = function() {
	this.doQuery("login");
};
messenger.loginBlock.doLogin = function() {
	this.doQuery("registration");
};

messenger.loginBlock.onError = function(ev) {
	if (!ev) {
		ev = window.event;
	}
	element.style.display = "block";
	loginBlock.setError(ev.details);
};
messenger.loginBlock.hide = function() {
	element.style.display = "none";
};
messenger.loginBlock.view = function() {
	element.style.display = "block";
};
// ------messenger.messageBlock
messenger.messageBlock = {
	RIGHT_SIDE : new Element(document.getElementById("rightSide")),
	LEFT_SIDE : new Element(document.getElementById("leftSide")),
	USERS_LIST : document.getElementById("usersList"),
	DELIMITER : new Element(document.getElementById("delemiter")),
	MESSAGE_LIST : new Element(document.getElementById("messageList")),
	INPUT_BLOCK : new Element(document.getElementById("inputBlock")),
	delimiterFullLentgh : DELIMITER.getWidth(),
	leftXoffset : LEFT_SIDE.getWidth() + delimiterFullLentgh,
	rigthXoffset : RIGHT_SIDE.getWidth(),
	INPUT_MESSAGE : new Element(document.getElementById("inputMessage")),
	SEND_BUTTON : new Element(document.getElementById("sendButton")),
	USER_TEMPLATE : document.getElementById("template").querySelector(".user"),
	MESS_TEMPLATE : document.getElementById("template").querySelector(
			".message"),
	currentUser : undefined,
	viewportHeight : document.documentElement.clientHeight - 1,
	viewportWidth : document.documentElement.clientWidth,
	ratio : 1 / 4
};
messenger.messageBlock.setWidth = function() {
	var leftSideWidth = viewportWidth * ratio;
	if (leftSideWidth < leftXoffset) {
		leftSideWidth = leftXoffset;
	}
	var rigthSideWidth = viewportWidth - leftSideWidth;
	if (rigthSideWidth < rigthXoffset) {
		rigthSideWidth = rigthXoffset;
		leftSideWidth = viewportWidth - rigthXoffset;
	}
	if (leftSideWidth < leftXoffset) {
		leftSideWidth = leftXoffset;
	}
	RIGHT_SIDE.setFullWidth(rigthSideWidth);
	LEFT_SIDE.setFullWidth(leftSideWidth - delimiterFullLentgh);
	INPUT_MESSAGE.setFullWidth(rigthSideWidth - SEND_BUTTON.getWidth()
			- INPUT_BLOCK.bordersX);
};
messenger.messageBlock.onResize = function(ev) {
	viewportWidth = document.documentElement.clientWidth;
	viewportHeight = document.documentElement.clientHeight - 1;
	setWidth();
	DELIMITER.setFullHeight(viewportHeight);
	RIGHT_SIDE.setFullHeight(viewportHeight);
	MESSAGE_LIST.setFullHeight(viewportHeight - INPUT_BLOCK.getHeigth()
			- RIGHT_SIDE.bordersY);

	LEFT_SIDE.setFullHeight(viewportHeight);
};
messenger.messageBlock.onMouseMove = function(ev) {
	if (!ev) {
		ev = window.event;
	}
	var clientX = ev.clientX;
	if (leftXoffset < clientX && rigthXoffset < viewportWidth - clientX) {
		ratio = clientX / viewportWidth;
		setWidth();
	}

};

messenger.messageBlock.onMouseUp = function(ev) {
	if (!ev) {
		ev = window.event;
	}
	utils.removeListener(document, onMouseMove, "mousemove");
	utils.removeListener(document, onMouseUp, "mouseup");
	document.onselectstart = null;

};
messenger.messageBlock.onMouseDown = function(ev) {
	if (!ev) {
		ev = window.event;
	}
	utils.addListener(document, onMouseMove, "mousemove");
	utils.addListener(document, onMouseUp, "mouseup");
	document.onselectstart = function() {
		return false;
	};// canceling selection

};


// -----workflow
if (utils.getCookie('cid')) {

} else {

}