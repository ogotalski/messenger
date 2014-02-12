package org.training.messenger.controller.action;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

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

public class MessageAction implements ServletAction {
	private static final int POOL_SIZE = 10;
	private MessageDAO messageDAO;
	private UserDAO userDAO;
	private ScheduledThreadPoolExecutor poolExecutor;
	private static final String JSON_BUILDS_FOOT = "]}";
	private static final String JSON_MESSAGES_HEAD = "{\"builds\":[";
	private static final String JSON_MESSAGE_FORMAT = "{\"id\" : %d,\"user\" : \"%s\",\"message\" : \"%s\",\"date\" : \"%s\",\"outgoing\" : \"%s\"},";

	public MessageAction() {
		messageDAO = DAOFactory.getDAO(MessageDAO.class);
		userDAO = DAOFactory.getDAO(UserDAO.class);
		ScheduledThreadPoolExecutor poolExecutor = new ScheduledThreadPoolExecutor(POOL_SIZE);
	}

	@Override
	public void doAction(HttpServletRequest request,
			HttpServletResponse response) throws IOException {
		User user = (User) request.getSession()
				.getAttribute(Constants.USER_ATR);
		if (user == null) {
			for (Cookie cookie : request.getCookies()) {
				if (cookie.getName().equals(Constants.QID)) {
					user = userDAO.getUserbyQId(cookie.getValue());
					request.getSession().setAttribute(Constants.USER_ATR, user);
				}
			}
		}
		if (user != null) {
			String newMessages = request.getParameter("new");
			List<Message> messages = null;
			final String JSON_CONTENT_TYPE = "application/json";
			response.setContentType(JSON_CONTENT_TYPE);
			if (newMessages != null) {
				AsyncContext asyncContext = request.startAsync();
				ScheduledFuture task = poolExecutor.scheduleWithFixedDelay(new MessageGetter(asyncContext , user), 0, 2, TimeUnit.SECONDS);
				asyncContext.getRequest().setAttribute("task", task);
				messages = messageDAO.getNewMessages(user);
			} else {
				messages = messageDAO.getAllMessages(user);
				messages.addAll(messageDAO.getNewMessages(user));
			}
			PrintWriter out = response.getWriter();
			printJSONMessageList(user, messages, out);
		} else {
			response.sendError(HttpServletResponse.SC_NOT_FOUND);
		}

	}

	public static void printJSONMessageList(User user, List<Message> messages,
			PrintWriter out) {
		StringBuilder sb = new StringBuilder();
		sb.append(JSON_MESSAGES_HEAD);
		String json_user;
		String outgoing;
		for (Message message : messages) {
			if (message.getReceiver().equals(user)) {
				json_user = message.getSender().toString();
				outgoing = "false";
			} else {

				json_user = message.getReceiver().toString();
				outgoing = "true";
			}
			sb.append(String.format(JSON_MESSAGE_FORMAT, message.getId(),
					json_user, message.getText(),
					Formatter.format(message.getDate()), outgoing));
		}
		sb.setLength(sb.length() - 1); // remove last comma
		sb.append(JSON_BUILDS_FOOT);
		out.print(sb.toString());
		out.flush();
		out.close();
	}

}
