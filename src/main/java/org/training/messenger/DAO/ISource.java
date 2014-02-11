package org.training.messenger.DAO;

import java.util.Map;

import javax.servlet.ServletException;

public interface ISource {
       public static final String REAL_PATH_PARAM = "RealPath";
	public static final String RESOURCE_PATH = "/WEB-INF/classes/";

	@SuppressWarnings("rawtypes")
	void init(Map config) throws ServletException;
	void close();
}
