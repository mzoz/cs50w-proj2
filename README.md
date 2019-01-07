# Project 2

## UI design
- basically copies Slack design and colors
- welcome page modal can't be closed so forces user name creation

## App
- `application.py` contains all socket communication and routing requests

## Javascript
- `index.js` contains all front-end js functions
- on page loading/refreshing it makes ajax request for channels and users and save to local copies
- whenever user clicks certain channel it's been saved to local storage along with the current user name
- clicked channel is highlighted and at the same time an socket emit asks for messages on this particular channel to display, and saved to a local copy
- there're three local copies `channels`, `users` and `messages`, when broadcast event is received new channel/user/message is added to these local copies rather than requesting mostly duplicate data again and again
- when channel is switched the local copy of `messages` is re-initialized

## TODO
- personal touch is not implemented yet
