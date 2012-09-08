var SERVER_URL = 'ws://localhost:8080/wschat/wschat';
var MESSAGE = '{"from":"[from]","text":"[text]", "chat":[chat]}';
var NEW_ENTRY = '<div><span class="author">[time] - [from]</span> [text]</div>';
var TIME_FORMAT = 'h:m:s';

var _chatbox = null;
var _messagebox = null;
var _username = null;
var _statusbox = null;
var _joinbtn = null;
var _leavebtn = null;
var _ws = null;

var _doLeave = false;

var chat = {
		init: function() {
			this._initFields();
			this._bindEvents();	
			this._onleave();
		},
		sendMessage: function() {	
			_ws.send(chat._expand(MESSAGE, _username.val(), _messagebox.val(), true));
			_messagebox.val('');			
		},
		_initFields: function() {
			_chatbox = $('#chatbox'); 
			_messagebox = $('#message');
			_username = $('#username');
			_statusbox = $('#statusbox');
			_joinbtn = $('#join');
			_leavebtn = $('#leave');			
		},
		_bindEvents: function() {
			_messagebox.keypress(function(e) {
				if (e.which == 13) {
					chat.sendMessage();
					e.preventDefault();
				}					
			});
			
			_joinbtn.on('click', function() {
				_ws = new WebSocket(SERVER_URL);

				_ws.onopen = function(event) {	
					chat._addStatusLog(true);
				};

				_ws.onclose = function(event) {
					chat._onleave();
				};			

				_ws.onmessage = function(event) {
					var data = chat._parseData(event.data);
					var target = (data.chat === true) ? _chatbox : _statusbox;
					chat._addEntry(target, data);
					
					if (_doLeave) {
						_ws.close();
						_doLeave = false;
					}
				};
				chat._onjoin();
			});

			_leavebtn.on('click', function() {
				chat._addStatusLog(false);
				_doLeave = true;											
			});			
		},
		_onjoin: function() {
			_joinbtn.hide();
			_leavebtn.show();
			chat._enableField(_messagebox, true);
			chat._enableField(_username, false);
		},
		_onleave: function() {
			_joinbtn.show();
			_leavebtn.hide();
			chat._enableField(_messagebox, false);
			chat._enableField(_username, true);
		},
		_enableField: function(field, enabled) {
			field.attr('disabled', !enabled);
		},
		_addEntry: function(container, data) {
			var entry = $(chat._expand(NEW_ENTRY, data.from, data.text));
			entry.appendTo(container);
			container.animate({scrollTop:container.height()}, 1000);
			entry.effect('pulsate');			
		},
		_addStatusLog: function(enabled) {			
			_ws.send(chat._expand(MESSAGE, _username.val(), (enabled) ? 'has joined!' : 'has left!', false));			
		},
		_parseData: function(data) {
			return jQuery.parseJSON(data);
		},
		_expand: function(message, from, text, add2chat) {
			return message
					.replace(/\[from\]/g, from)
					.replace(/\[text\]/g, text)
					.replace(/\[chat\]/g, add2chat)
					.replace(/\[time\]/g, chat._now());	
		},
		_now: function() {
			var date = new Date();
			
			var formatTime = function(unit) {
				if (unit < 10) {
					unit = '0' + unit;
				}
				return unit;
			};
			
			return TIME_FORMAT
					.replace(/h/, formatTime(date.getHours()))
					.replace(/m/, formatTime(date.getMinutes()))
					.replace(/s/, formatTime(date.getSeconds()));
		}
};