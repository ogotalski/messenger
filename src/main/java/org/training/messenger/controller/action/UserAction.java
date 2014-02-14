package org.training.messenger.controller.action;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.training.messenger.DAO.DAOFactory;
import org.training.messenger.DAO.UserDAO;
import org.training.messenger.beans.User;
import org.training.messenger.beans.User;
import org.training.messenger.constants.Constants;
import org.training.messenger.utils.Formatter;

public class UserAction implements ServletAction{
	UserDAO userDAO;
	
	public UserAction() {
		userDAO = DAOFactory.getDAO(UserDAO.class);
	}
	private static final String JSON_USERS_FOOT = "]}";
	private static final String JSON_USERS_HEAD = "{\"users\": [";
	private static final String JSON_USER_FORMAT = "{\"id\" : %d,\"user\" : \"%s\"},";

	@Override
	public void doAction(HttpServletRequest request,
			HttpServletResponse response) throws IOException {
		String userName = request.getParameter("searchUser");
		if (userName != null){
			User user= (User) request.getSession().getAttribute(Constants.USER_ATR);
			List<User> users = userDAO.getUsers(userName, user);
			PrintWriter out = response.getWriter();
			out.write(JSONUsersListToString(users));
			out.close();
		}else {
			response.sendError(HttpServletResponse.SC_NOT_FOUND);
		}
		
	}
	public static String JSONUsersListToString(List<User> users) {
		StringBuilder sb = new StringBuilder();
		sb.append(JSON_USERS_HEAD);

		if (!users.isEmpty()) {
			for (User user : users) {
					sb.append(String.format(JSON_USER_FORMAT, user.getId(),
						user.getName()));
			}
			sb.setLength(sb.length() - 1); // remove last comma
		}
		sb.append(JSON_USERS_FOOT);
		return sb.toString();
	}
}
