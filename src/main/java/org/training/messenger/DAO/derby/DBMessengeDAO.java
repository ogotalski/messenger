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

	private static final int READED_INDEX = 5;
	private static final String UPDATE_READED = "update messages set readed=true where readed = false and receiver = ?";
	private static final String SELECT_MESSENGES = "SELECT id, sender, receiver, text, date_time, readed FROM messages";
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
		final int RECEIVER_INDEX = 3;
		message.setReceiver(userDAO.getUser(rs.getInt(RECEIVER_INDEX)));
		final int SENDER_INDEX = 2;
		message.setSender(userDAO.getUser(rs.getInt(SENDER_INDEX)));
		final int TEXT_INDEX = 4;
		message.setText(rs.getString(TEXT_INDEX));
		final int DATE_INDEX = 5;
		message.setDate(rs.getTimestamp(DATE_INDEX));
		final int READED_INDEX = 6;
		message.setReaded(rs.getBoolean(READED_INDEX));
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
			statement = connection.prepareStatement("INSERT INTO messages ( sender, receiver, text, date_time, readed) VALUES (?,?,?,?,?)");
			final int SENDER_INDEX = 1;
			statement.setInt(SENDER_INDEX, message.getSender().getId());
			final int RECEIVER_INDEX = 2;
			statement.setInt(RECEIVER_INDEX, message.getReceiver().getId());
			final int TEXT_INDEX = 3;
			statement.setString(TEXT_INDEX, message.getText());
			final int DATE_INDEX = 4;
			statement.setTimestamp(DATE_INDEX, message.getDate());
			statement.setBoolean(READED_INDEX, message.isReaded());
			statement.execute();
		} catch (SQLException e){
			throw new ServerException(e);
		} finally{
			DBSource.closeStatement(statement);
			DBSource.closeConnection(connection);
		}
		
	}

}
