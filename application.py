import os

from flask import Flask, jsonify, render_template, request, session
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)

# Configure secret key
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY") or os.urandom(16).__repr__()
socketio = SocketIO(app)

names = ["mzoz", "haha"]
channels = {"general": [], "proj2": []}


# use json or class to represent message data structure
class Message:
	pass


@app.route("/")
def index():
	# socketio.emit("channels", {"channels": channels})
	return render_template("index.html")


@app.route("/channels", methods=["GET"])
def get_channels():
	return jsonify({"channels": list(channels)})


@socketio.on("create")
def vote(data):
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


