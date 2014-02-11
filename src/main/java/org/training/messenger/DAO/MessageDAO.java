package org.training.messenger.DAO;

import java.util.List;

import org.training.messenger.beans.Message;
import org.training.messenger.beans.User;



public interface MessageDAO {
	List<Message> getNewMessages(User user);
	List<Message> getAllMessages(User user);
	void addMessage(Message message);
	
}
