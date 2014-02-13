package org.training.messenger.DAO.derby;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import org.training.messenger.DAO.UserDAO;
import org.training.messenger.beans.User;
import org.training.messenger.exceptions.ServerException;

public class DBUserDAO implements UserDAO {

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
			statement.setString(1, name);
			statement.setString(2, password);
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
		user.setId(rs.getInt(1));
		user.setName(rs.getString(2));
		user.setIp(rs.getString(3));
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
			statement.setString(1, name);
			rs = statement.executeQuery();
			if (rs.next()) {
				getUser(rs);
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
			statement.setInt(1, id);
			rs = statement.executeQuery();
			if (rs.next()) {
				getUser(rs);
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
			statement.setString(1, qid);
			rs = statement.executeQuery();
			if (rs.next()) {
				getUser(rs);
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
			statement.setString(1, user.getName());
			statement.setString(2, user.getPassword());
			statement.setString(3, user.getIp());
			statement.execute();
		} catch (SQLException e) {
			throw new ServerException(e);
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
			statement.setString(1, user.getIp());
			statement.setInt(2, user.getId());
			statement.execute();
		} catch (SQLException e) {
			throw new ServerException(e);
		} finally {
			DBSource.closeStatement(statement);
			DBSource.closeConnection(connection);
		}
	
	}

}
