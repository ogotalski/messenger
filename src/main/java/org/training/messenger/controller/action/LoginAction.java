package org.training.messenger.controller.action;

import java.io.IOException;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.training.messenger.DAO.DAOFactory;
import org.training.messenger.DAO.UserDAO;
import org.training.messenger.beans.User;
import org.training.messenger.constants.Constants;

public class LoginAction implements ServletAction {
	UserDAO userDAO;

	
	LoginAction() {
		super();
		userDAO = DAOFactory.getDAO(UserDAO.class);
	}


	@Override
	public void doAction(HttpServletRequest request,
			HttpServletResponse response) throws IOException {
		String userName = request.getParameter(Constants.USER_PARAM);
		String password = request.getParameter("password");
		User user = userDAO.getUser(userName, password);
		if (user != null) {
			HttpSession session = request.getSession();
			session.setAttribute(Constants.USER_ATR, user);
			response.addCookie(new Cookie(Constants.QID, user.getQId()));
		} else {
			response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
		}

	}

}
