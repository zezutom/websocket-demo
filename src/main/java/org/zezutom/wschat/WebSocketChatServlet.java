package org.zezutom.wschat;

import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

import javax.servlet.http.HttpServletRequest;

import org.eclipse.jetty.websocket.WebSocket;
import org.eclipse.jetty.websocket.WebSocketServlet;

public class WebSocketChatServlet extends WebSocketServlet {

	private static final long serialVersionUID = 1L;

	private Set<ChatWebSocket> users = new CopyOnWriteArraySet<ChatWebSocket>();
	
	public WebSocket doWebSocketConnect(HttpServletRequest request, String arg) {
		return new ChatWebSocket(users);
	}

}
