package org.training.messenger.controller.action;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public interface ServletAction {
	void doAction(HttpServletRequest request, HttpServletResponse response) throws IOException;
}
