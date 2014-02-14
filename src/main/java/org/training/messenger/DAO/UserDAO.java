package org.training.messenger.DAO;

import java.util.List;

import org.training.messenger.beans.User;

public interface UserDAO {
      User getUser(String name, String password);
      User getUser(String name);
      User getUser(int id);
      User getUserbyQId(String qid);
      void addUser(User user);
      void updateUserQId(User user);
      List<User> getUsers(String name, User user);
      
}
