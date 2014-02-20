package org.training.messenger.controller;

import java.io.IOException;
import java.util.concurrent.ScheduledFuture;

import javax.servlet.AsyncEvent;
import javax.servlet.AsyncListener;
import javax.servlet.annotation.WebListener;

import org.training.messenger.beans.User;
import org.training.messenger.constants.Constants;
import org.training.messenger.controller.action.MessageAction;

public class AsyncMessListener implements AsyncListener {

	@Override
	public void onComplete(AsyncEvent event) throws IOException {
		interuptTask(event);
	}

	@SuppressWarnings("rawtypes")
	private void interuptTask(AsyncEvent event) {
		User  user = (User) event.getSuppliedRequest().getAttribute(Constants.USER_ATR);
		if (user != null){
			MessageAction.usersContext.remove(user);
		}
		try {
			event.getAsyncContext().getResponse().getWriter().close();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	@Override
	public void onTimeout(AsyncEvent event) throws IOException {
		interuptTask(event);

	}

	@Override
	public void onError(AsyncEvent event) throws IOException {
		interuptTask(event);

	}

	@Override
	public void onStartAsync(AsyncEvent event) throws IOException {
		
	}
	

}
