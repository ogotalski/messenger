package org.training.messenger.controller.action;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.training.messenger.DAO.DAOFactory;
import org.training.messenger.DAO.MessageDAO;
import org.training.messenger.DAO.UserDAO;
import org.training.messenger.beans.Message;
import org.training.messenger.beans.User;
import org.training.messenger.constants.Constants;

public class LoginAction implements ServletAction {
	UserDAO userDAO;
	MessageDAO messageDAO;
	LoginAction() {
		super();
		userDAO = DAOFactory.getDAO(UserDAO.class);
		messageDAO = DAOFactory.getDAO(MessageDAO.class);
	}

	@Override
	public void doAction(HttpServletRequest request,
			HttpServletResponse response) throws IOException {
		String userName = request.getParameter(Constants.USER_PARAM);
		String password = request.getParameter(Constants.PASS_PARAM);
		User user;
		if (request.getParameter(Constants.ACTION_PARAM).equals(Constants.REG_PARAM) && userName != null && password!=null){
			try{
			user = new User();
			user.setName(userName);
			user.setPassword(password);
			userDAO.addUser(user);
			} catch (IllegalArgumentException e){
				response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
				return;
			}
		}
		
		user = userDAO.getUser(userName, password);
		if (user == null && password==null && userName==null ) {
			if (request.getCookies() != null)
			for (Cookie cookie : request.getCookies()) {
				if (cookie.getName().equals(Constants.QID)) {
					user = userDAO.getUserbyQId(cookie.getValue());
					break;
				}
			}
		}
		if (user != null) {
			HttpSession session = request.getSession();
			session.setAttribute(Constants.USER_ATR, user);
			user.setQId(request.getRequestedSessionId());
			userDAO.updateUserQId(user);
			response.addCookie(new Cookie(Constants.QID, user.getQId()));
			List<Message>messages = messageDAO.getAllMessages(user);
			PrintWriter out = response.getWriter();
			out.print(MessageAction.JSONMessageListToString(user, messages));
			out.close();
		} else {
				response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
		}

	}

}
