/**
 * 
 */
"use strict";
// -----------utils
var utils = {};

utils.EventSource = function() {

	if (window.EventSource)
		return window.EventSource;

	var reTrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g;

	var EventSource = function(url) {
		var eventsource = this, interval = 500, // polling interval
		lastEventId = null, cache = '';

		if (!url || typeof url != 'string') {
			throw new SyntaxError('Not enough arguments');
		}

		this.URL = url;
		this.readyState = this.CONNECTING;
		this._pollTimer = null;
		this._xhr = null;

		function pollAgain(interval) {
			eventsource._pollTimer = setTimeout(function() {
				poll.call(eventsource);
			}, interval);
		}

		function poll() {
			try { // force hiding of the error message... insane?
				if (eventsource.readyState == eventsource.CLOSED)
					return;

				// NOTE: IE7 and upwards support
				var xhr = new XMLHttpRequest();
				xhr.open('GET', eventsource.URL, true);
				xhr.setRequestHeader('Accept', 'text/event-stream');
				xhr.setRequestHeader('Cache-Control', 'no-cache');
				// we must make use of this on the server side if we're working
				// with Android - because they don't trigger
				// readychange until the server connection is closed
				xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

				if (lastEventId != null)
					xhr.setRequestHeader('Last-Event-ID', lastEventId);
				cache = '';

				xhr.timeout = 50000;
				xhr.onreadystatechange = function() {
					if (this.readyState == 3
							|| (this.readyState == 4 && this.status == 200)) {
						// on success
						if (eventsource.readyState == eventsource.CONNECTING) {
							eventsource.readyState = eventsource.OPEN;
							eventsource.dispatchEvent('open', {
								type : 'open'
							});
						}

						var responseText = '';
						try {
							responseText = this.responseText || '';
						} catch (e) {
						}

						// process this.responseText
						var parts = responseText.substr(cache.length).split(
								"\n"), eventType = 'message', data = [], i = 0, line = '';

						cache = responseText;

						// TODO handle 'event' (for buffer name), retry
						for (; i < parts.length; i++) {
							line = parts[i].replace(reTrim, '');
							if (line.indexOf('event') == 0) {
								eventType = line.replace(/event:?\s*/, '');
							} else if (line.indexOf('retry') == 0) {
								retry = parseInt(line.replace(/retry:?\s*/, ''));
								if (!isNaN(retry)) {
									interval = retry;
								}
							} else if (line.indexOf('data') == 0) {
								data.push(line.replace(/data:?\s*/, ''));
							} else if (line.indexOf('id:') == 0) {
								lastEventId = line.replace(/id:?\s*/, '');
							} else if (line.indexOf('id') == 0) { // this
																	// resets
																	// the id
								lastEventId = null;
							} else if (line == '') {
								if (data.length) {
									var event = new MessageEvent(data
											.join('\n'), eventsource.url,
											lastEventId);
									eventsource.dispatchEvent(eventType, event);
									data = [];
									eventType = 'message';
								}
							}
						}

						if (this.readyState == 4)
							pollAgain(interval);
						// don't need to poll again, because we're long-loading
					} else if (eventsource.readyState !== eventsource.CLOSED) {
						if (this.readyState == 4) { // and some other status
							// dispatch error
							eventsource.readyState = eventsource.CONNECTING;
							eventsource.dispatchEvent('error', {
								type : 'error'
							});
							pollAgain(interval);
						} else if (this.readyState == 0) { // likely aborted
							pollAgain(interval);
						} else {
						}
					}
				};

				xhr.send();

				setTimeout(function() {
					if (true || xhr.readyState == 3)
						xhr.abort();
				}, xhr.timeout);

				eventsource._xhr = xhr;

			} catch (e) { // in an attempt to silence the errors
				eventsource.dispatchEvent('error', {
					type : 'error',
					data : e.message
				}); // ???
			}
		}
		;

		poll(); // init now
	};

	EventSource.prototype = {
		close : function() {
			// closes the connection - disabling the polling
			this.readyState = this.CLOSED;
			clearInterval(this._pollTimer);
			this._xhr.abort();
		},
		CONNECTING : 0,
		OPEN : 1,
		CLOSED : 2,
		dispatchEvent : function(type, event) {
			var handlers = this['_' + type + 'Handlers'];
			if (handlers) {
				for (var i = 0; i < handlers.length; i++) {
					handlers[i].call(this, event);
				}
			}

			if (this['on' + type]) {
				this['on' + type].call(this, event);
			}
		},
		addEventListener : function(type, handler) {
			if (!this['_' + type + 'Handlers']) {
				this['_' + type + 'Handlers'] = [];
			}

			this['_' + type + 'Handlers'].push(handler);
		},
		removeEventListener : function(type, handler) {
			var handlers = this['_' + type + 'Handlers'];
			if (!handlers) {
				return;
			}
			for (var i = handlers.length - 1; i >= 0; --i) {
				if (handlers[i] === handler) {
					handlers.splice(i, 1);
					break;
				}
			}
		},
		onerror : null,
		onmessage : null,
		onopen : null,
		readyState : 0,
		URL : ''
	};

	var MessageEvent = function(data, origin, lastEventId) {
		this.data = data;
		this.origin = origin;
		this.lastEventId = lastEventId || '';
	};

	MessageEvent.prototype = {
		data : null,
		type : 'message',
		lastEventId : '',
		origin : ''
	};

	return EventSource;

}();

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

utils.addListener = function() {
	if (document.documentElement.addEventListener) {
		return function(elem, listener, type) {
			elem.addEventListener(type, listener);
		};

	} else {
		return function(elem, listener, type) {
			elem.attachEvent("on" + type, listener);
		};

	}
	;
}();
utils.removeListener = function() {
	if (document.documentElement.addEventListener) {
		return function(elem, listener, type) {
			elem.removeListener(type, listener);
		};

	} else {
		return function(elem, listener, type) {
			elem.detachEvent("on" + type, listener);
		};

	}
	;
}();

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
utils.Event = function() {
	if (CustomEvent) {
		return function(name, detail) {
			var event = new CustomEvent(name, {
				"detail" : detail
			});
			return event;
		};
	} else {
		return function(name, detail) {
			var event = document.createEvent('Event');
			event.initEvent(name, true, true);
			if (details) {
				event.detail = detail;
			}
			return event;
		};
	}
}();
utils.getComputedStyle = function() {
	if (!window.getComputedStyle) {
		var getComputedStyle = function(elem, pseudo) {
			var cs = {};
			cs.el = elem;

			cs.getPropertyValue = function(prop) {
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
			return cs;
		};
		return getComputedStyle;

	} else {
		return function(elem) {
			return window.getComputedStyle(elem);
		};
	}
}();

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
	}
	;
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
	var getStyleValue = function(cs, propie, propW3C) {
		var re = /\D{1,}/g;
		var propVal;
		propVal = cs.getPropertyValue(propie); // ie
		if (!propVal) {
			propVal = cs.getPropertyValue(propW3C);// w3c
		}
		if (propVal) {
			propVal = propVal.split(re);
			if (propVal.length > 0) {
				var i = parseInt(propVal[0]);
				if (i)
					return i;

			}
			;

		}
		return 0;
	};
	this.bordersY += getStyleValue(cs, "marginBottom", "margin-bottom");
	this.bordersY += getStyleValue(cs, "marginTop", "margin-top");
	this.bordersX += getStyleValue(cs, "marginLeft", "margin-left");
	this.bordersX += getStyleValue(cs, "marginRigth", "margin-rigth");

	this.bordersY += getStyleValue(cs, "paddingBottom", "padding-bottom");
	this.bordersY += getStyleValue(cs, "paddingTop", "padding-top");
	this.bordersX += getStyleValue(cs, "paddingLeft", "padding-left");
	this.bordersX += getStyleValue(cs, "paddingRigth", "padding-rigth");
	var border = element.offsetWidth - element.clientWidth;
	if (border) {
		this.bordersX += border;
		this.bordersY += border;
	}
	;
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
// ------loginBlock
var loginBlock = {
	element : document.getElementById("loginBlock"),
	loginInput : document.getElementById("login"),
	passInput : document.getElementById("password"),
	regButton : document.getElementById("regButton"),
	loginButton : document.getElementById("loginButton"),
	loginError : document.getElementById("loginError")
};
loginBlock.setError = function(er) {
	this.loginError.innerText = er;
};
loginBlock._getQueryString = function() {
	var login = utils.trim(this.loginInput.value);
	var pass = this.passInput.value;
	var qstring = '';
	if (login && pass) {
		qstring += "user=" + encodeURIComponent(login) + "&pass="
				+ encodeURIComponent(pass);
	} else {
		this.setError("User or passwor is empty");
	}
	;
	return qstring;
};

loginBlock.doQuery = function(action, query) {
	var xmlhttp = utils.getXmlHttp();
	xmlhttp.open('POST', 'controller', true);
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4) {
			if (xmlhttp.status == 200) {
				loginBlock.hide();
				loginBlock.element.dispatchEvent(messenger.loginEvent);
				messageService.readMessagesArray(JSON
						.parse(xmlhttp.responseText).message);
			} else if (xmlhttp.status == 401) {
				if (query) {
					loginBlock.element.dispatchEvent(messenger.loginError);
				}
			} else {
				loginBlock.element.dispatchEvent(messenger.serverError);
			}
		}
	};
	xmlhttp.setRequestHeader("Content-type",
			"application/x-www-form-urlencoded");
	xmlhttp.send(query + "&action=" + action);

};
loginBlock.doLogin = function() {
	loginBlock.doQuery("login",loginBlock._getQueryString());
};
loginBlock.doLoginByCID = function() {
	loginBlock.doQuery("login");
};

loginBlock.doReg = function() {
	loginBlock.doQuery("reg",loginBlock._getQueryString());
};

loginBlock.onError = function(ev) {
	if (!ev) {
		ev = window.event;
	}
	this.element.style.display = "block";
	loginBlock.setError(ev.details);
};
loginBlock.hide = function() {
	loginBlock.element.style.display = "none";
};
loginBlock.view = function() {
	loginBlock.element.style.display = "block";
};
// ------messageBlock
var messageBlock = function() {
	var el = {};
	el.RIGHT_SIDE = new utils.Element(document.getElementById("rightSide"));
	el.LEFT_SIDE = new utils.Element(document.getElementById("leftSide"));
	el.USERS_LIST = document.getElementById("usersList");
	el.DELIMITER = new utils.Element(document.getElementById("delemiter"));
	el.MESSAGE_LIST = new utils.Element(document.getElementById("messageList"));
	el.INPUT_BLOCK = new utils.Element(document.getElementById("inputBlock"));
	el.delimiterFullLentgh = el.DELIMITER.getWidth();
	el.leftXoffset = el.LEFT_SIDE.getWidth() + el.delimiterFullLentgh;
	el.rigthXoffset = el.RIGHT_SIDE.getWidth();
	el.INPUT_MESSAGE = new utils.Element(document
			.getElementById("inputMessage"));
	el.SEND_BUTTON = new utils.Element(document.getElementById("sendButton"));
	el.USER_TEMPLATE = document.getElementById("template").querySelector(
			".user");
	el.MESS_TEMPLATE = document.getElementById("template").querySelector(
			".message");
	el.loginedUser = undefined;

	el.viewportHeight = document.documentElement.clientHeight - 1;
	el.viewportWidth = document.documentElement.clientWidth;
	el.ratio = 1 / 4;
	return el;
}();
messageBlock.setWidth = function() {
	var leftSideWidth = this.viewportWidth * this.ratio;
	if (leftSideWidth < this.leftXoffset) {
		leftSideWidth = this.leftXoffset;
	}
	var rigthSideWidth = this.viewportWidth - leftSideWidth;
	if (rigthSideWidth < this.rigthXoffset) {
		rigthSideWidth = this.rigthXoffset;
		leftSideWidth = this.viewportWidth - this.rigthXoffset;
	}
	if (leftSideWidth < this.leftXoffset) {
		leftSideWidth = this.leftXoffset;
	}
	this.RIGHT_SIDE.setFullWidth(rigthSideWidth);
	this.LEFT_SIDE.setFullWidth(leftSideWidth - this.delimiterFullLentgh);
	this.INPUT_MESSAGE.setFullWidth(rigthSideWidth
			- this.SEND_BUTTON.getWidth() - this.INPUT_BLOCK.bordersX);
};
messageBlock.onResize = function(ev) {
	messageBlock.viewportWidth = document.documentElement.clientWidth;
	messageBlock.viewportHeight = document.documentElement.clientHeight - 1;
	messageBlock.setWidth();
	messageBlock.DELIMITER.setFullHeight(messageBlock.viewportHeight);
	messageBlock.RIGHT_SIDE.setFullHeight(messageBlock.viewportHeight);
	messageBlock.MESSAGE_LIST.setFullHeight(messageBlock.viewportHeight
			- messageBlock.INPUT_BLOCK.getHeigth()
			- messageBlock.RIGHT_SIDE.bordersY);

	messageBlock.LEFT_SIDE.setFullHeight(messageBlock.viewportHeight);
};
messageBlock.onMouseMove = function(ev) {
	if (!ev) {
		ev = window.event;
	}
	var clientX = ev.clientX;
	if (messageBlock.leftXoffset < clientX
			&& messageBlock.rigthXoffset < messageBlock.viewportWidth - clientX) {
		ratio = clientX / messageBlock.viewportWidth;
		messageBlock.setWidth();
	}

};

messageBlock.onMouseUp = function(ev) {
	if (!ev) {
		ev = window.event;
	}
	utils.removeListener(document, messageBlock.onMouseMove, "mousemove");
	utils.removeListener(document, messageBlock.onMouseUp, "mouseup");
	document.onselectstart = null;

};
messageBlock.onMouseDown = function(ev) {
	if (!ev) {
		ev = window.event;
	}
	utils.addListener(document, messageBlock.onMouseMove, "mousemove");
	utils.addListener(document, messageBlock.onMouseUp, "mouseup");
	document.onselectstart = function() {
		return false;
	};// canceling selection

};

messageBlock.addUser = function(user) {
	var elem = this.USER_TEMPLATE.cloneNode(true);
	var el = elem.querySelector(".userName");
	elem.setAttribute("data-user", user);
	el.innerText = user;
	this.USERS_LIST.appendChild(elem);
	return elem;
};

messageBlock.addMess = function(mess) {
	var elem = this.MESS_TEMPLATE.cloneNode(true);
	var el;
	if (mess.outgoing) {
		elem.className += " outgoing"; // note the space
		el = elem.querySelector(".userName");
		el.innerText = this.loginedUser;
	} else {
		el = elem.querySelector(".userName");
		el.innerText = mess.user;
	}
	el = elem.querySelector(".mess");
	el.innerText = mess.message;
	el = elem.querySelector(".date");
	el.innerText = mess.date;
	if (mess.id) {
		elem.setAttribute("data-id", mess.id);
	}
	var nextElement = undefined;
	var element = undefined;
	var length = MESSAGE_LIST.element.children.length;
	var id;
	if (mess.id) {
		for (var i = 0; i < length; i++) {
			element = MESSAGE_LIST.element.children[i];
			id = element.getAttribute("data-id");
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
		this.MESSAGE_LIST.element.insertBefore(elem, nextElement);
	} else {
		this.MESSAGE_LIST.element.appendChild(elem);
	}
};

messageBlock.clearMessages = function() {
	messageBlock.MESSAGE_LIST.innerHTML = "";
};
messageBlock.clearUsers = function() {
	messageBlock.USERS_LIST.innerHTML = "";
};
messageBlock.hide = function() {
	messageBlock.RIGHT_SIDE.element.style.display = "none";
	messageBlock.LEFT_SIDE.element.style.display = "none";
	messageBlock.DELIMITER.element.style.display = "none";

};
messageBlock.view = function() {
	messageBlock.onResize();
	utils.addListener(window, messageBlock.onResize, "resize");
	messageBlock.RIGHT_SIDE.element.style.display = "block";
	messageBlock.LEFT_SIDE.element.style.display = "block";
	messageBlock.DELIMITER.element.style.display = "block";

};

// ---messageDAO
var messageService = {
	currentUser : undefined,
	messages : {}
};
messageService.readMessage = function(mess) {
	var user = message.user.toUpperCase();
	if (this.messages[user]) {
		this.messages[user].push(message);
		if (currentUser && currentUser.toUpperCase() === user) {
			messageBlock.addMess(message);
		}

	} else {
		this.messages[user] = new Array(message);
		messageBlock.addUser(message.user);
	}
};

messageService.readMessagesArray = function(arr) {
	var mess;
	var user = undefined;
	if (!this.messages) {
		this.messages = {};
	}

	for ( var i in arr) {
		mess = arr[i];
		user = mess.user;
		this.readMessage(mess);
	}
	if (!this.currentUser && user) {
		window.location.hash = user;
	}
};
messageService.start = function() {
	var event;
	event = new utils.EventSource("controller/?action=get");
	event.onmessage = function(e) {
		messageService.readMessagesArray(JSON.parse(e.data).message);
	};
	event.onerror = function(e) {
		loginBlock.element.dispatchEvent(messenger.serverError);

	};

};
messageService.onlogin = function() {
		messageService.start();
};

// -----workflow
function start() {
	utils.addListener(loginBlock.loginButton, loginBlock.doLogin, "click");
	utils.addListener(loginBlock.regButton,loginBlock.doReg, "click");
	utils.addListener(loginBlock.element, loginBlock.hide, "login");
	utils.addListener(loginBlock.element, messageBlock.view, "login");
	utils.addListener(loginBlock.element, messageService.onlogin, "login");
	
//	utils.addListener(loginBlock.element, loginBlock.view, "loginError");
//	utils.addListener(loginBlock.element, messageBlock.hide, "loginError");

	if (utils.getCookie('cid')) {
           loginBlock.doLoginByCID();
	} 
	
};
start();