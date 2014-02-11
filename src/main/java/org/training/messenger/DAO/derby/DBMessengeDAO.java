package org.training.messenger.DAO.derby;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.training.messenger.DAO.DAOFactory;
import org.training.messenger.DAO.MessageDAO;
import org.training.messenger.DAO.UserDAO;
import org.training.messenger.beans.Message;
import org.training.messenger.beans.User;
import org.training.messenger.exceptions.ServerException;

public class DBMessengeDAO implements MessageDAO {

	private static final String UPDATE_READED = "update messages set readed=true from messages where readed = false and receiver = ?";
	private static final String SELECT_MESSENGES = "SELECT id, sender, receiver, text, date FROM users";
	UserDAO userDAO;
	
	
	public DBMessengeDAO() {
		userDAO = DAOFactory.getDAO(UserDAO.class);
	}

	@Override
	public List<Message> getNewMessages(User user) {
		final String SELECT_QUERY = SELECT_MESSENGES+" WHERE receiver = ? AND readed = false";
		final int RECEIVER_ID = 1;
		
		Connection connection =null;
		PreparedStatement statement =null;
		ResultSet rs = null;
		List<Message> list = new ArrayList<Message>();
		try{
			connection = DBSource.getConnection();
			statement = connection.prepareStatement(SELECT_QUERY);
			statement.setInt(RECEIVER_ID, user.getId());
			rs = statement.executeQuery();
			while (rs.next()){
				list.add(getMessage(rs));
			}
			DBSource.closeResultSet(rs);
			DBSource.closeStatement(statement);
			setReaded(user, connection);
		} catch (SQLException e){
			throw new ServerException(e);
		} finally{
			DBSource.closeResultSet(rs);
			DBSource.closeStatement(statement);
			DBSource.closeConnection(connection);
		}
		return list;
	}

	private void setReaded(User user, 
			Connection connection) throws SQLException {
		final int RECEIVER_ID = 1;
		PreparedStatement statement;
		statement = connection.prepareStatement(UPDATE_READED);
		statement.setInt(RECEIVER_ID, user.getId());
		statement.execute();
		DBSource.closeStatement(statement);
	}

	private Message getMessage(ResultSet rs) throws SQLException {
		Message message = new Message();
		final int ID_INDEX = 1;
		message.setId(rs.getInt(ID_INDEX));
		message.setReceiver(userDAO.getUser(rs.getInt(3)));
		message.setSender(userDAO.getUser(rs.getInt(2)));
		message.setText(rs.getString(4));
		message.setDate(rs.getTimestamp(5));
		return message;
	}

	@Override
	public List<Message> getAllMessages(User user) {
		final String SELECT_QUERY = SELECT_MESSENGES+" WHERE receiver = ? OR sender = ?";
		final int RECEIVER_ID = 1;
		final int SENDER_INDEX = 2;
		
		Connection connection =null;
		PreparedStatement statement =null;
		ResultSet rs = null;
		List<Message> list = new ArrayList<Message>();
		try{
			connection = DBSource.getConnection();
			statement = connection.prepareStatement(SELECT_QUERY);
			statement.setInt(RECEIVER_ID, user.getId());
			statement.setInt(SENDER_INDEX, user.getId());
			rs = statement.executeQuery();
			while (rs.next()){
				list.add(getMessage(rs));
			}
			DBSource.closeResultSet(rs);
			DBSource.closeStatement(statement);
			setReaded(user, connection);
		} catch (SQLException e){
			throw new ServerException(e);
		} finally{
			DBSource.closeResultSet(rs);
			DBSource.closeStatement(statement);
			DBSource.closeConnection(connection);
		}
		return list;
	}

	@Override
	public void addMessage(Message message) {
		Connection connection =null;
		PreparedStatement statement =null;
		List<Message> list = new ArrayList<Message>();
		try{
			connection = DBSource.getConnection();
			statement = connection.prepareStatement("INSERT INTO messages ( sender, receiver, text, date, readed) VALUES (?,?,?,?,false)");
			statement.setInt(1, message.getSender().getId());
			statement.setInt(2, message.getReceiver().getId());
			statement.setString(3, message.getText());
			statement.setTimestamp(4, message.getDate());
			statement.execute();
		} catch (SQLException e){
			throw new ServerException(e);
		} finally{
			DBSource.closeStatement(statement);
			DBSource.closeConnection(connection);
		}
		
	}

}
