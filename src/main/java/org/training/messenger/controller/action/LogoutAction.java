package org.training.messenger.controller.action;

import java.io.IOException;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.training.messenger.constants.Constants;



public class LogoutAction implements ServletAction {

	private static final String EMPTY_STRING = "";

	@Override
	public void doAction(HttpServletRequest request,
			HttpServletResponse response) throws IOException {
		HttpSession session = request.getSession(false);

		if (session != null) {
			session.invalidate();
		}
		Cookie cookie = new Cookie(Constants.QID,EMPTY_STRING);
		cookie.setMaxAge(0);
		response.addCookie(cookie);
		response.flushBuffer();
	}

}
