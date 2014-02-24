package org.training.messenger.DAO.derby;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.training.messenger.DAO.UserDAO;
import org.training.messenger.beans.User;
import org.training.messenger.exceptions.ServerException;

public class DBUserDAO implements UserDAO {

	private static final String ILLEGAL_EMAIL_OR_PASSWORD = "Illegal email or password";
	private static final String SELECT_USERS = "SELECT id,name,cid FROM users ";

	@Override
	public User getUser(String name, String password) {
		Connection connection = null;
		PreparedStatement statement = null;
		ResultSet rs = null;
		User user = null;
		try {
			connection = DBSource.getConnection();
			statement = connection.prepareStatement(SELECT_USERS
					+ "WHERE name = ? and password = ? ");
			final int NAME_INDEX = 1;
			statement.setString(NAME_INDEX, name);
			final int PASS_INDEX = 2;
			statement.setString(PASS_INDEX, password);
			rs = statement.executeQuery();
			if (rs.next()) {
				user = getUser(rs);
			}
		} catch (SQLException e) {
			throw new ServerException(e);
		} finally {
			DBSource.closeResultSet(rs);
			DBSource.closeStatement(statement);
			DBSource.closeConnection(connection);
		}
		return user;
	}

	private User getUser(ResultSet rs) throws SQLException {
		User user;
		user = new User();
		final int ID_INDEX = 1;
		user.setId(rs.getInt(ID_INDEX));
		final int NAME_INDEX = 2;
		user.setName(rs.getString(NAME_INDEX));
		final int QID_INDEX = 3;
		user.setQId(rs.getString(QID_INDEX));
		return user;
	}

	@Override
	public User getUser(String name) {
		Connection connection = null;
		PreparedStatement statement = null;
		ResultSet rs = null;
		User user = null;
		try {
			connection = DBSource.getConnection();
			statement = connection.prepareStatement(SELECT_USERS
					+ "WHERE name = ? ");
			final int NAME_INDEX = 1;
			statement.setString(NAME_INDEX, name);
			rs = statement.executeQuery();
			if (rs.next()) {
				user = getUser(rs);
			}
		} catch (SQLException e) {
			throw new ServerException(e);
		} finally {
			DBSource.closeResultSet(rs);
			DBSource.closeStatement(statement);
			DBSource.closeConnection(connection);
		}
		return user;
	}

	@Override
	public User getUser(int id) {
		Connection connection = null;
		PreparedStatement statement = null;
		ResultSet rs = null;
		User user = null;
		try {
			connection = DBSource.getConnection();
			statement = connection.prepareStatement(SELECT_USERS
					+ "WHERE id = ? ");
			final int ID_INDEX = 1;
			statement.setInt(ID_INDEX, id);
			rs = statement.executeQuery();
			if (rs.next()) {
				user = getUser(rs);
			}
		} catch (SQLException e) {
			throw new ServerException(e);
		} finally {
			DBSource.closeResultSet(rs);
			DBSource.closeStatement(statement);
			DBSource.closeConnection(connection);
		}
		return user;
	}

	@Override
	public User getUserbyQId(String qid) {
		Connection connection = null;
		PreparedStatement statement = null;
		ResultSet rs = null;
		User user = null;
		try {
			connection = DBSource.getConnection();
			statement = connection.prepareStatement(SELECT_USERS
					+ "WHERE cid = ? ");
			final int QID_INDEX = 1;
			statement.setString(QID_INDEX, qid);
			rs = statement.executeQuery();
			if (rs.next()) {
				user = getUser(rs);
			}
		} catch (SQLException e) {
			throw new ServerException(e);
		} finally {
			DBSource.closeResultSet(rs);
			DBSource.closeStatement(statement);
			DBSource.closeConnection(connection);
		}
		return user;
	}

	@Override
	public void addUser(User user) {
		Connection connection = null;
		PreparedStatement statement = null;
		try {
			connection = DBSource.getConnection();
			statement = connection.prepareStatement("INSERT INTO users (name,password,cid) VALUES (?,?,?)");
			final int NAME_INDEX = 1;
			statement.setString(NAME_INDEX, user.getName());
			final int PASS_INDEX = 2;
			statement.setString(PASS_INDEX, user.getPassword());
			final int QID_INDEX = 3;
			statement.setString(QID_INDEX, user.getQId());
			statement.execute();
		} catch (SQLException e) {
			final int UNIQUE_ERROR_CODE = 30000;
			final String UNIQUE_SQL_STATE = "23505";
			if (!((e.getErrorCode() == UNIQUE_ERROR_CODE) && (UNIQUE_SQL_STATE
					.equals(e.getSQLState())))) {
				throw new ServerException(e);
			} else {
				throw new IllegalArgumentException(ILLEGAL_EMAIL_OR_PASSWORD);
			}
		} finally {
			DBSource.closeStatement(statement);
			DBSource.closeConnection(connection);
		}
	}

	@Override
	public void updateUserQId(User user) {
		Connection connection = null;
		PreparedStatement statement = null;
		try {
			connection = DBSource.getConnection();
			statement = connection.prepareStatement("update users set cid=? where id = ?");
			final int QID_INDEX = 1;
			statement.setString(QID_INDEX, user.getQId());
			final int ID_INDEX = 2;
			statement.setInt(ID_INDEX, user.getId());
			statement.execute();
		} catch (SQLException e) {
			throw new ServerException(e);
		} finally {
			DBSource.closeStatement(statement);
			DBSource.closeConnection(connection);
		}
	
	}

	@Override
	public List<User> getUsers(String name, User user) {
		Connection connection = null;
		PreparedStatement statement = null;
		ResultSet rs = null;
		List<User> users = new ArrayList<User>();
		try {
			connection = DBSource.getConnection();
			String sql = SELECT_USERS
					+ "WHERE name like ?";
			if (user!= null){
				sql+=" and id != ?";
			}
			statement = connection.prepareStatement(sql);
			final int SEARCH_INDEX = 1;
			statement.setString(SEARCH_INDEX, "%"+name+"%");
			if (user != null){
				final int ID_INDEX = 2;
				statement.setInt(ID_INDEX, user.getId());
			}
			rs = statement.executeQuery();
			while (rs.next()) {
				users .add( getUser(rs));
			}
		} catch (SQLException e) {
			throw new ServerException(e);
		} finally {
			DBSource.closeResultSet(rs);
			DBSource.closeStatement(statement);
			DBSource.closeConnection(connection);
		}
		return users;
	}

}
