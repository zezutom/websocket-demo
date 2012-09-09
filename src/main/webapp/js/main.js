var SERVER_URL = 'ws://83.251.163.61:8080/wschat/wschat';
var MESSAGE = '{"from":"[from]","text":"[text]", "chat":[chat]}';
var NEW_ENTRY = '<div class="entry" style="color:[color]"><span class="author">[time] - [from]:</span> [text]</div>';
var WELCOME = 'Welcome [username]';
var TIME_FORMAT = 'h:m:s';

var _chatbox = null;
var _statusbox = null;
var _messagebox = null;
var _joinas = null;
var _welcome = null;
var _prompt = null;
var _promptsearch = null;
var _username = null;
var _search = null;
var _leavebtn = null;
var _ws = null;

var _doLeave = false;
var _entryCount = 0;

var _defaultEntryColor = '#FFF';
var _colorScheme = ['#66CCFF', '#9CEB00', '#FFE666', '#FF4775', '#33CC00', '#FF8FFF', '#FF4D00'];
var _participants = new Array();

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
			_leavebtn = $('#leave');
			_joinas = $('#join-as');
			_welcome = $('#welcome');
			_prompt = $('#prompt');
			_promptsearch = $('#prompt-search');
			_search = $('#search');
		},
		_bindEvents: function() {
			_messagebox.keypress(function(e) {
				if (e.which == 13) {
					chat.sendMessage();
					e.preventDefault();
				}					
			});
			
			_search.keyup(function(e) {
				var text = _search.val();
				
			});
			
			_username.keypress(function(e) {
				if (e.which == 13) {
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
					
					e.preventDefault();
				}
			});
			
			_leavebtn.on('click', function() {
				chat._addStatusLog(false);
				_doLeave = true;											
			});			
		},
		_onjoin: function() {
			_joinas.hide();
			_username.hide();
			_welcome.html(WELCOME.replace(/\[username\]/g, _username.val()));
			_welcome.show();
			_prompt.show();
			_promptsearch.show();
			_search.show();
			_leavebtn.show();
			_messagebox.show();	
			_messagebox.focus();
		},
		_onleave: function() {
			_leavebtn.hide();
			_prompt.hide();
			_promptsearch.hide();
			_search.hide();
			_welcome.hide();
			_messagebox.hide();
			_joinas.show();
			_username.show();
			_username.focus();
		},
		_enableField: function(field, enabled) {
			field.attr('disabled', !enabled);
		},
		_addEntry: function(container, data) {						
			var entry = $(chat._expand(NEW_ENTRY, data.from, data.text));						
			entry.appendTo(container);			
			_entryCount++;
			container.animate({scrollTop: (entry.height() * _entryCount)}, 50);
			entry.effect('pulsate', {times: 1}, 1500);			
		},
		_addStatusLog: function(enabled) {			
			_ws.send(chat._expand(MESSAGE, _username.val(), (enabled) ? 'has joined!' : 'has left!', false));			
		},
		_parseData: function(data) {
			return jQuery.parseJSON(data);
		},
		_expand: function(message, from, text, add2chat) {			
			var color = _defaultEntryColor;
		
			if (from != _username.val()) {
				var index = _participants.indexOf(from);
				
				if (index < 0) {
					_participants.push(from);
					index = _participants.length - 1;
				}
				
				if (index < _colorScheme.length) {
					color = _colorScheme[index];
				} else {
					color = _colorScheme[0];
				}				
			}
			
			return message
					.replace(/\[color\]/g, color)
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