package org.training.messenger.DAO.derby;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Map;

import javax.servlet.ServletException;
import javax.sql.DataSource;

import org.apache.derby.jdbc.EmbeddedDataSource;
import org.training.messenger.DAO.ISource;
import org.training.messenger.exceptions.ServerException;

public class DBSource implements ISource {
	private static final String PARAMETER_NOT_FOUND = "parameter not found";
	public static final String DB_NAME_PARAM = "dbName";
	private static DataSource source;

	public static Connection getConnection() throws SQLException {
		return source.getConnection();
	}

	@SuppressWarnings("rawtypes")
	@Override
	public void init(Map config) throws ServletException {

		verifyConfigParametr(config, DB_NAME_PARAM);
		verifyConfigParametr(config, REAL_PATH_PARAM);

		String dbName = (String) config.get(DB_NAME_PARAM);
		String resoursePath = (String) config.get(REAL_PATH_PARAM)
				+ RESOURCE_PATH;
		EmbeddedDataSource ds = new EmbeddedDataSource();
		ds.setDatabaseName(resoursePath + dbName);
		try {
			ds.getConnection().close();
		} catch (SQLException e) {
			throw new ServletException(e);
		}
		source = ds;

	}

	@SuppressWarnings("rawtypes")
	public void verifyConfigParametr(Map config, String param) {
		if (!config.containsKey(param)) {
			throw new IllegalArgumentException(param + PARAMETER_NOT_FOUND);
		}
	}

	public static void closeStatement(PreparedStatement statement) {
		if (statement != null) {
			try {
				statement.close();
			} catch (SQLException e) {
				throw new ServerException(e);
			}
		}
	}

	public static void closeResultSet(ResultSet rs) {
		if (rs != null) {
			try {
				rs.close();
			} catch (SQLException e) {
				throw new ServerException(e);
			}
		}
	}

	public static void closeConnection(Connection connection) {
		if (connection != null) {
			try {
				connection.close();
			} catch (SQLException e) {
				throw new ServerException(e);
			}
		}
	}

	@Override
	public void close() {
		EmbeddedDataSource ds = (EmbeddedDataSource) source;
		ds.setShutdownDatabase("shutdown");
		try {
			ds.getConnection();

		} catch (SQLException e) {
			final int SHUTDOWN_ERROR_CODE = 45000;
			final String SHUTDOWN_SQL_STATE = "08006";
			if (!((e.getErrorCode() == SHUTDOWN_ERROR_CODE) && (SHUTDOWN_SQL_STATE
					.equals(e.getSQLState())))) {
				throw new ServerException(e);
			} else {
				System.out.println("shut down successfully");
			}
		}

	}

}
