package org.training.messenger.controller;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.training.messenger.controller.action.ActionFactory;
import org.training.messenger.controller.action.ServletAction;

public class DefaultController extends HttpServlet{

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		String actionStr = request.getParameter("action");
		ServletAction  action = ActionFactory.getAction(actionStr);
		if (action != null) {
			action.doAction(request, response);
		} else {
			response.sendError(HttpServletResponse.SC_NOT_FOUND);
		}
		
	}

	
	
	

}
