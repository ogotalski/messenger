package org.training.messenger.controller.action;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import javax.servlet.AsyncContext;

import org.training.messenger.DAO.DAOFactory;
import org.training.messenger.DAO.MessageDAO;
import org.training.messenger.beans.Message;
import org.training.messenger.beans.User;

public class MessageGetter implements Runnable {
	private MessageDAO messageDAO;
	private AsyncContext asyncContext;
	private User user;

	public MessageGetter(AsyncContext asyncContext, User user) {
		this.asyncContext = asyncContext;
		this.user = user;
		messageDAO = DAOFactory.getDAO(MessageDAO.class);
	}

	@Override
	public void run() {
		List<Message> list;
		list = messageDAO.getNewMessages(user);
		PrintWriter out;
		try {
			out = asyncContext.getResponse().getWriter();
			MessageAction.printJSONMessageList(user, list, out);
		} catch (IOException e) {
			e.printStackTrace();
		}
				
		
	}
	

}
