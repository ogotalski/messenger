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
	private int id;
	public MessageGetter(AsyncContext asyncContext, User user) {
		this.asyncContext = asyncContext;
		this.user = user;
		messageDAO = DAOFactory.getDAO(MessageDAO.class);
		id = 1;
	}

	@Override
	public void run() {
		List<Message> list;
		list = messageDAO.getNewMessages(user);
		PrintWriter out;
		try {
			out = asyncContext.getResponse().getWriter();
			//out.println("id: " + id++);
			out.println("event: "+ "message");
			out.println("data: " + MessageAction.JSONMessageListToString(user, list)+"\n\n");
		
			System.out.println("id: " + id++);
			System.out.println(MessageAction.JSONMessageListToString(user, list));
			out.flush();
		} catch (IOException e) {
			e.printStackTrace();
		}
				
		
	}
	

}
