package org.training.messenger.controller;

import java.io.IOException;
import java.util.concurrent.ScheduledFuture;

import javax.servlet.AsyncEvent;
import javax.servlet.AsyncListener;
import javax.servlet.annotation.WebListener;
@WebListener
public class AsyncMessListener implements AsyncListener {

	@Override
	public void onComplete(AsyncEvent event) throws IOException {
		interuptTask(event);
	}

	@SuppressWarnings("rawtypes")
	private void interuptTask(AsyncEvent event) {
		ScheduledFuture task = (ScheduledFuture) event.getSuppliedRequest().getAttribute("task");
		task.cancel(true);
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
