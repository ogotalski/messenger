package org.training.messenger.controller.action;

import java.io.IOException;
import java.sql.Timestamp;

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

		if (user != null && receiver != null && text != null && date != null) {
			User receiveUser = userDAO.getUser(receiver);
			Timestamp messDate = Formatter.parse(date);
			Message message = new Message();
			message.setReceiver(receiveUser);
			message.setSender(user);
			message.setDate(messDate);
			message.setText(text);
			message.setReaded(false);
			messageDAO.addMessage(message);
		} else {
			response.sendError(HttpServletResponse.SC_NOT_FOUND);

		}
	}
}
