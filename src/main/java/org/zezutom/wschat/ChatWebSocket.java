package org.zezutom.wschat;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArrayList;

import org.eclipse.jetty.websocket.WebSocket.OnTextMessage;

public class ChatWebSocket implements OnTextMessage {

	private Connection connection;
	
	private Set<ChatWebSocket> users;
	
	private static final List<String> history = new CopyOnWriteArrayList<String>();
	
	public ChatWebSocket(Set<ChatWebSocket> users) {
		this.users = users;
	}
	
	public void onClose(int closeCode, String message) {
		users.remove(this);		
	}

	public void onOpen(Connection connection) {
		this.connection = connection;
		users.add(this);	
		
		for (String data : history) {
			try {
				this.connection.sendMessage(data);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		
	}

	public void onMessage(String data) {
		history.add(data);
		for (ChatWebSocket user : users) {
			try {
				user.connection.sendMessage(data);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}	
	}
}
