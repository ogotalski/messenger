package org.training.messenger.controller.action;

import java.util.HashMap;
import java.util.Map;

public class ActionFactory {

	
	private static Map<String, ServletAction> map = new HashMap<String, ServletAction>();
	static {
	//	map.put(ISSUE, new IssueViewAction());
		map.put("login", new LoginAction());
		map.put("reg", new LoginAction());
		map.put("loguot", new LogoutAction());
		map.put("get", new MessageAction());
		map.put("send", new SendMessageAction());
	}

	public static ServletAction getAction(String actionName) {
		return map.get(actionName);
	}
}
