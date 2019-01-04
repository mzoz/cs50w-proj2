import os

from flask import Flask, jsonify, render_template, request, session
from flask_socketio import SocketIO, emit

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
	return render_template("index.html")


@socketio.on("create name")
def vote(data):
	name = data["name"]
	message = ""
	if name == "":
		message = "name can't be empty"
		success = "no"
	elif name in names:
		message = "name already exists"
		success = "no"
	else:
		success = "yes"
		names.append(name)
	socketio.emit("login", {"success": success, "message": message, "name": name})
