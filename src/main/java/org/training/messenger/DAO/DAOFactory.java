package org.training.messenger.DAO;

import java.util.HashMap;
import java.util.Map;

import org.training.messenger.DAO.derby.DBMessengeDAO;
import org.training.messenger.DAO.derby.DBSource;
import org.training.messenger.DAO.derby.DBUserDAO;

public class DAOFactory {
	private static Map<Class<?>, Object> map = new HashMap<Class<?>, Object>();
	static {
		map.put(ISource.class, new DBSource());
		map.put(UserDAO.class, new DBUserDAO());
		map.put(MessageDAO.class, new DBMessengeDAO());
	}

	public static <T> T getDAO(Class<T> type) {
		return type.cast(map.get(type));
	}
}
