package org.training.messenger.controller;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebListener;

import org.training.messenger.DAO.DAOFactory;
import org.training.messenger.DAO.ISource;
import org.training.messenger.DAO.derby.DBSource;

@WebListener
public class ContextListener implements ServletContextListener {

	@Override
	public void contextDestroyed(ServletContextEvent arg0) {
		ISource init = DAOFactory.getDAO(ISource.class);
		init.close();
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	@Override
	public void contextInitialized(ServletContextEvent arg0) {
		ISource init = DAOFactory.getDAO(ISource.class);
		Map config = new HashMap();
		config.put(DBSource.DB_NAME_PARAM, "DB");
		config.put(ISource.REAL_PATH_PARAM, arg0.getServletContext()
				.getRealPath(""));

		try {
			init.init(config);
			
		} catch (ServletException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

}
