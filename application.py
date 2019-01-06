import os

from datetime import datetime
from flask import Flask, jsonify, render_template, request, session
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)

# Configure secret key
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY") or os.urandom(16).__repr__()
socketio = SocketIO(app)

channels = {}
names = []


@app.route("/")
def index():
	return render_template("index.html")


@app.route("/initialize", methods=["GET"])
def initialize():
	return jsonify({"channels": list(channels), "names": names})


@socketio.on("chat")
def chat(data):
	channel = data["channel"]
	message = {"name": data["name"], "time": datetime.now().isoformat(' ', 'seconds'), "content": data["content"]}
	channels[channel].append(message)
	emit("message-broadcast", {"channel": channel, "message": message}, broadcast=True)


@socketio.on("load-messages")
def load_messages(data):
	channel = data["channel"]
	messages = channels[channel]
	emit("messages-loading", {"messages": messages})


@socketio.on("create")
def create(data):
	name = data["name"]
	purpose = data["purpose"]
	success = False
	message = ""
	if purpose == "name":
		if name == "":
			message = "name can't be empty"
		elif name in names:
			message = "name already exists"
		else:
			success = True
			names.append(name)
			emit("login", {"name": name})
			emit("name", {"name": name}, broadcast=True)
	if purpose == "channel":
		if name == "":
			message = "channel name can't be empty"
		elif name in channels.keys():
			message = "channel name already exists"
		else:
			success = True
			channels[name] = []
			emit("channel", {"name": name}, broadcast=True)
	emit("modal", {"success": success, "message": message, "name": name})


