"use strict";

if (!String.prototype.trim) {
	String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g, "");
	};
};
var getComputedStyleFlag = true;
if (!window.getComputedStyle) {
	getComputedStyleFlag = false;
	window.getComputedStyle = function(el, pseudo) {
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
}
var getCurrDate = function() {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth() + 1; // January is 0!

	var yyyy = today.getFullYear();
	if (dd < 10) {
		dd = '0' + dd;
	}
	if (mm < 10) {
		mm = '0' + mm;
	}
	today = yyyy + '-' + mm + '-' + dd;
	return today;
};
var getXmlHttp = function() {
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

// classes
var Element = function(element) {
	this.element = element;
	this.bordersX = 0;
	this.bordersY = 0;
	var cs = window.getComputedStyle(element);
	var margin = cs.getPropertyValue("margin");
	var re = /\D{1,}/g;

	if (margin) {
		margin = margin.split(re);
		if (getComputedStyleFlag) {
			margin.pop();
		} // for ie8

		if (margin.length === 1) {
			this.bordersX += 2 * margin[0];
			this.bordersY += 2 * margin[0];
		} else if (margin.length === 2) {
			this.bordersX += 2 * margin[1];
			this.bordersY += 2 * margin[0];
		} else if (margin.length === 3) {
			this.bordersX += 2 * margin[1];
			this.bordersY += margin[0] + margin[2];

		} else if (margin.length === 4) {
			this.bordersX += margin[1] + margin[3];
			this.bordersY += margin[0] + margin[2];
		}
	} else {
		this.bordersY += setValue(cs, "marginBottom", "margin-bottom");
		this.bordersY += setValue(cs, "marginTop", "margin-top");
		this.bordersX += setValue(cs, "marginLeft", "margin-left");
		this.bordersX += setValue(cs, "marginRigth", "margin-rigth");

	}
	var padding = cs.getPropertyValue("padding");
	if (padding) {
		padding = padding.split(re);
		if (getComputedStyleFlag) {
			padding.pop();
		} // for ie8

		if (padding.length === 1) {
			this.bordersX += 2 * padding[0];
			this.bordersY += 2 * padding[0];
		} else if (padding.length === 2) {
			this.bordersX += 2 * padding[1];
			this.bordersY += 2 * padding[0];
		} else if (padding.length === 3) {
			this.bordersX += 2 * padding[1];
			this.bordersY += padding[0] + padding[2];

		} else if (padding.length = 4) {
			this.bordersX += padding[1] + padding[3];
			this.bordersY += padding[0] + padding[2];
		}
	} else {
		this.bordersY += setValue(cs, "paddingBottom", "padding-bottom");
		this.bordersY += setValue(cs, "paddingTop", "padding-top");
		this.bordersX += setValue(cs, "paddingLeft", "padding-left");
		this.bordersX += setValue(cs, "paddingRigth", "padding-rigth");
	}
	var border = element.offsetWidth - element.clientWidth;
	if (border) {
		this.bordersX += border;
		this.bordersY += border;
	}
};
function setValue(cs, propie, propW3C) {
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

		}

	}
	return 0;
}

Element.prototype.setFullWidth = function(width) {
	this.element.style.width = width - this.bordersX + "px";
};
Element.prototype.setFullHeight = function(height) {
	this.element.style.height = height - this.bordersY + "px";
};
Element.prototype.getWidth = function() {
	return this.element.offsetWidth;
};
Element.prototype.getHeigth = function() {
	return this.element.clientHeight;
};

var MyStorage = function() {
	if (localStorage){
		this.st = localStorage;
	} else {
		this.st = {
			    getItem: function (sKey) {
			        if (!sKey || !this.hasOwnProperty(sKey)) { return null; }
			        return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
			      },
			      key: function (nKeyId) {
			        return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, "").split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
			      },
			      setItem: function (sKey, sValue) {
			        if(!sKey) { return; }
			        document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
			        this.length = document.cookie.match(/\=/g).length;
			      },
			      length: 0,
			      removeItem: function (sKey) {
			        if (!sKey || !this.hasOwnProperty(sKey)) { return; }
			        document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
			        this.length--;
			      },
			      hasOwnProperty: function (sKey) {
			        return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
			      }
			    };
	}
};
MyStorage.prototype.setObj = function(key, obj) {
	return this.st.setItem(key, JSON.stringify(obj));
};
MyStorage.prototype.getObj = function(key) {
	return JSON.parse(this.st.getItem(key));
};

var mystorage = new MyStorage();

var MessageDAO = function() {
	this.messages = undefined;
};
MessageDAO.prototype.getUsers = function() {
	if (!this.messages) {
		this.getMessageFromServer();
	}
	if (Object.getOwnPropertyNames) {
		return Object.getOwnPropertyNames(this.messages);
	} else {
		var users = new Array();
		for ( var name in this.messages) {
			if (this.messages.hasOwnProperty(name)) {
				users.push(name);
			}
		}
		return users;
	}

};
MessageDAO.prototype.getMessages = function(user) {
	if (!this.messages) {
		this.getMessageFromServer();
	}
	return this.messages[user];
};
MessageDAO.prototype.sendMessage = function(message) {
	var messArr = mystorage.getObj(message.user);
	if (!messArr) {
		messArr = new Array();

	}
	;
	messArr.push(message);
	mystorage.setObj(message.user, messArr);
	this.readMessage(message);
};

MessageDAO.prototype.readMessage = function(message) {
	var user = message.user.toUpperCase();
	if (this.messages[user]) {
		this.messages[user].push(message);
		if (currentUser && currentUser.toUpperCase() === user) {
			addMess(message);
		}

	} else {
		this.messages[user] = new Array(message);
		addUser(message.user);
	}
};
MessageDAO.prototype.readMessages = function(messArr) {
	var mess;
	var user = undefined;
	if (!this.messages) {
		this.messages = {};
	}

	for ( var i in messArr) {
		mess = messArr[i];
		user = mess.user;
		this.readMessage(mess);
	}
	if (!currentUser && user) {
		window.location = '#' + user;
	}
};
MessageDAO.prototype.getMessageFromServer = function() {
	var xmlhttp = getXmlHttp();
	xmlhttp.open('GET', 'messages.json', true);
	var messageDAO = this;
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4) {
			// if(xmlhttp.status == 200) {
			messageDAO.readMessages(JSON.parse(xmlhttp.responseText).message);
			// }
		}
	};
	xmlhttp.send(null);
};
MessageDAO.prototype.getMessageFromStorage = function() {
	for ( var key in mystorage.st) {
		this.readMessages(mystorage.getObj(key));
	}
};

// constants
var RIGHT_SIDE = new Element(document.getElementById("rightSide"));
var LEFT_SIDE = new Element(document.getElementById("leftSide"));
var USERS_LIST = document.getElementById("usersList");
var DELIMITER = new Element(document.getElementById("delemiter"));
var MESSAGE_LIST = new Element(document.getElementById("messageList"));
var INPUT_BLOCK = new Element(document.getElementById("inputBlock"));
var delimiterFullLentgh = DELIMITER.getWidth();
var leftXoffset = LEFT_SIDE.getWidth() + delimiterFullLentgh;
var rigthXoffset = RIGHT_SIDE.getWidth();
var INPUT_MESSAGE = new Element(document.getElementById("inputMessage"));
var SEND_BUTTON = new Element(document.getElementById("sendButton"));
var USER_TEMPLATE = document.getElementById("template").querySelector(".user");
var MESS_TEMPLATE = document.getElementById("template").querySelector(
		".message");
// variables
var currentUser = undefined;
var viewportHeight = document.documentElement.clientHeight - 1;
var viewportWidth = document.documentElement.clientWidth;
var ratio = 1 / 2;

// resize part
var setWidth = function() {
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

var onResize = function(ev) {
	viewportWidth = document.documentElement.clientWidth;
	viewportHeight = document.documentElement.clientHeight - 1;
	setWidth();
	DELIMITER.setFullHeight(viewportHeight);
	RIGHT_SIDE.setFullHeight(viewportHeight);
	MESSAGE_LIST.setFullHeight(viewportHeight - INPUT_BLOCK.getHeigth()
			- RIGHT_SIDE.bordersY);

	LEFT_SIDE.setFullHeight(viewportHeight);
};

onResize();
window.onresize = onResize;
var mouseMove = function(ev) {
	if (!ev) {
		ev = window.event;
	}

	var clientX = ev.clientX;
	if (leftXoffset < clientX && rigthXoffset < viewportWidth - clientX) {
		ratio = clientX / viewportWidth;
		setWidth();
	}

};

var onMouseUp = function(ev) {
	if (!ev) {
		ev = window.event;
	}
	document.onmousemove = null;
	document.onmouseup = null;
	document.onselectstart = null;

};
var onMouseDown = function(ev) {
	if (!ev) {
		ev = window.event;
	}
	document.onmousemove = mouseMove;
	document.onmouseup = onMouseUp;
	document.onselectstart = function() {
		return false;
	};// canceling selection

};
delemiter.onmousedown = onMouseDown;
// message part
var addUser = function(user) {
	var elem = USER_TEMPLATE.cloneNode(true);
	var el = elem.querySelector(".userName");
	el.innerText = user;
	elem.onclick = onUserClicked;
	USERS_LIST.appendChild(elem);
	return elem;
};

var addMess = function(mess) {
	var elem = MESS_TEMPLATE.cloneNode(true);
	var el;
	if (mess.outgoing) {
		elem.className += " outgoing"; // note the space
		el = elem.querySelector(".userName");
		el.innerText = "me";
	} else {
		el = elem.querySelector(".userName");
		el.innerText = mess.user;
	}
	el = elem.querySelector(".mess");
	el.innerText = mess.message;
	el = elem.querySelector(".date");
	el.innerText = mess.date;
	el = elem.querySelector(".id");
	if (mess.id) {
		el.innerText = mess.id;
	}
	var nextElement = undefined;
	var element = undefined;
	var length = MESSAGE_LIST.element.children.length;
	var id;
	if (mess.id) {
		for (var i = 0; i < length; i++) {
			element = MESSAGE_LIST.element.children[i];
			el = element.querySelector(".id");
			id = el.innerText;
			if (!id) {
				id = undefined;
			}
			if (id > mess.id || !id) {
				nextElement = element;
				break;
			}
		}
	}
	if (nextElement) {
		MESSAGE_LIST.element.insertBefore(elem, nextElement);
	} else {
		MESSAGE_LIST.element.appendChild(elem);

	}

};

var selectCurrentUser = function(user) {
	var elem = USERS_LIST.querySelector(".selected");
	if (elem) {
		elem.className = "user";
	}
	if (user) {
		user.className += " selected";
		currentUser = user.innerText;
	}
};

var onUserClicked = function(ev) {

	if (!ev) {
		ev = window.event;
	}
	if (!ev.currentTarget) {
		ev.currentTarget = this;

	}
	var elem = ev.currentTarget.querySelector(".userName");

	if (elem) {
		window.location = '#' + elem.innerText;

	}
};
function viewMessages(user) {
	var messArr = messageDAO.getMessages(user);
	MESSAGE_LIST.element.innerHTML = "";
	for ( var i in messArr) {
		addMess(messArr[i]);
	}
}

var hashChange = function(ev) {
	var hash = window.location.hash;
	if (hash) {
		hash = hash.substring(1); // remove '#'
		viewUser(hash);
	}
};
var viewUser = function(user) {
	var userElem = undefined;
	var elem = undefined;
	var length = USERS_LIST.children.length;
	user = user.toUpperCase();
	for (var i = 0; i < length; i++) {
		userElem = USERS_LIST.children[i];
		elem = userElem.querySelector(".userName");
		if (elem && elem.innerText.toUpperCase() === user) {
			selectCurrentUser(userElem);
			viewMessages(user);
			break;
		};
	}
	;
};

var onSendButtonClick = function() {
	var message = INPUT_MESSAGE.element.value.trim();
	INPUT_MESSAGE.element.value = "";
	if (message) {
		var mess = {};
		mess.user = currentUser;
		mess.message = message;
		mess.outgoing = true;
		mess.date = getCurrDate();
		messageDAO.sendMessage(mess);
	};
};
SEND_BUTTON.element.onclick = onSendButtonClick;

var messageDAO = new MessageDAO();
messageDAO.getMessageFromServer();
messageDAO.getMessageFromStorage();
window.onhashchange = hashChange;
hashChange();