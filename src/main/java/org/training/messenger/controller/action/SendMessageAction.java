package org.training.messenger.controller.action;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Timestamp;

import javax.servlet.AsyncContext;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.training.messenger.DAO.DAOFactory;
import org.training.messenger.DAO.MessageDAO;
import org.training.messenger.DAO.UserDAO;
import org.training.messenger.beans.Message;
import org.training.messenger.beans.User;
import org.training.messenger.constants.Constants;
import org.training.messenger.utils.Formatter;

public class SendMessageAction implements ServletAction {

	private UserDAO userDAO;
	private MessageDAO messageDAO;

	public SendMessageAction() {
		messageDAO = DAOFactory.getDAO(MessageDAO.class);
		userDAO = DAOFactory.getDAO(UserDAO.class);
	}

	@Override
	public void doAction(HttpServletRequest request,
			HttpServletResponse response) throws IOException {
		User user = (User) request.getSession()
				.getAttribute(Constants.USER_ATR);
		String receiver = request.getParameter(Constants.USER_PARAM);
		String text = request.getParameter("text");
		String date = request.getParameter("date");

		if (user == null) {
			for (Cookie cookie : request.getCookies()) {
				if (cookie.getName().equals(Constants.QID)) {
					user = userDAO.getUserbyQId(cookie.getValue());
					break;
				}
			}
			if (user != null) {
				request.getSession().setAttribute(Constants.USER_ATR, user);
			}
		}
		if (user != null && receiver != null && text != null && date != null) {
			User receiveUser = userDAO.getUser(receiver);
			Timestamp messDate = Formatter.parse(date);
			Message message = new Message();
			message.setReceiver(receiveUser);
			message.setSender(user);
			message.setDate(messDate);
			message.setText(text);
			message.setReaded(false);
			AsyncContext asyncContext = MessageAction.usersContext
					.get(receiveUser);

			if (asyncContext != null) {
				try {
					Integer eventId =(Integer) asyncContext.getRequest().getAttribute("eventId");
					if (eventId == null) {
						eventId = 1;
					}
					PrintWriter out = asyncContext.getResponse().getWriter();
					out.println("id: " + eventId++);
					out.println("event: " + "message");
					out.println("data: "
							+ MessageAction.JSONMessageToString(user, message)
							+ "\n\n");
					out.flush();
					asyncContext.getRequest().setAttribute("eventId", eventId);
					message.setReaded(true);
					
				} catch (IllegalStateException e){
					
				}
			}
			messageDAO.addMessage(message);
		} else {
			response.sendError(HttpServletResponse.SC_UNAUTHORIZED);

		}
	}
}
