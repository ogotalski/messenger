package org.training.messenger.controller.action;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import javax.servlet.AsyncContext;
import javax.servlet.AsyncListener;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.training.messenger.DAO.DAOFactory;
import org.training.messenger.DAO.MessageDAO;
import org.training.messenger.DAO.UserDAO;
import org.training.messenger.beans.Message;
import org.training.messenger.beans.User;
import org.training.messenger.constants.Constants;
import org.training.messenger.controller.AsyncMessListener;
import org.training.messenger.utils.Formatter;

public class MessageAction implements ServletAction {
	private static final String LRCF_LRCF = "\n\n";
	private static final String DATA_HEAD = "data: ";
	private static final String MESSAGE_EV = "message";
	private static final String EVENT_HEAD = "event: ";
	private static final String KEEP_ALIVE = "Keep-alive";
	private static final String NO_CACHE = "no-cache";
	private static final String CONNECTION = "Connection";
	private static final String CACHE_CONTROL = "Cache-control";
	private static final String UTF_8 = "UTF-8";
	private static final int POOL_SIZE = 10;
	private MessageDAO messageDAO;
	private UserDAO userDAO;
	public static Map<User, AsyncContext> usersContext;
	private AsyncListener asyncListener;
	public MessageAction() {
		messageDAO = DAOFactory.getDAO(MessageDAO.class);
		userDAO = DAOFactory.getDAO(UserDAO.class);
		usersContext = new ConcurrentHashMap<User, AsyncContext>();
		asyncListener = new AsyncMessListener();
	}

	@Override
	public void doAction(HttpServletRequest request,
			HttpServletResponse response) throws IOException {
		User user = (User) request.getSession()
				.getAttribute(Constants.USER_ATR);
		if (user == null && request.getCookies() !=null) {
			
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
		if (user != null) {
			request.setAttribute(Constants.USER_ATR, user);
			AsyncContext asyncContext = request.startAsync();
			asyncContext.setTimeout(5000);
			List<Message> list = messageDAO.getNewMessages(user);
			response.setCharacterEncoding(UTF_8);
			response.setHeader(CACHE_CONTROL, NO_CACHE);
			response.setHeader(CONNECTION, KEEP_ALIVE);
			final String JSON_CONTENT_TYPE = "text/event-stream";
			response.setContentType(JSON_CONTENT_TYPE);
			PrintWriter out = response.getWriter();
			out.println(EVENT_HEAD+ MESSAGE_EV);
			out.println(DATA_HEAD + MessageAction.JSONMessageListToString(user, list)+LRCF_LRCF);
			out.flush();
			asyncContext.addListener(asyncListener);
			usersContext.put(user, asyncContext);
		} else {
			response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
		}

	}

	public static String JSONMessageListToString(User user,
			List<Message> messages) {
		JSONObject sb = new JSONObject();
		sb.put("user", user.getName());
		JSONArray mesArr = new JSONArray();
		JSONObject mess;
		for (Message message : messages) {
			mess = new JSONObject();
			mess.put("sender", message.getSender().getName());
			mess.put("receiver", message.getReceiver().getName());
			mess.put("text", message.getText());
			mess.put("date", Formatter.format(message.getDate()));
			mess.put("readed", message.isReaded());
			mesArr.add(mess);
		}
		sb.put(MESSAGE_EV, mesArr);
		String st = sb.toJSONString();
		return sb.toJSONString();
	}

	public static String JSONMessageToString(User user, Message message) {
		JSONObject mess;
		mess = new JSONObject();
		mess.put("sender", message.getSender().getName());
		mess.put("receiver", message.getReceiver().getName());
		mess.put("text", message.getText());
		mess.put("date", Formatter.format(message.getDate()));
		mess.put("readed", message.isReaded());
		return mess.toJSONString();
	}

}
