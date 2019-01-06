document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    let socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    let modal = $('#modal');
    let channels = [];
    let names = [];
    let messages = [];


    // Initialize channels and names
    let purpose;
    const request = new XMLHttpRequest();
    request.open('GET', '/initialize');
    request.onload = () => {
        const data = JSON.parse(request.responseText);
        channels = data.channels;
        names = data.names;
        renderChannels();
        renderNames();
        if (localStorage.getItem('channel')) {
            highlight();
        }
    };


    request.send();
    // Initial visit
    if (!localStorage.getItem('name')) {
        purpose = 'name';
        modal.modal({backdrop: 'static', keyboard: false});
    } else { // Revisit or refresh page
        renderName();
    }


    function renderName() {
        $('#user-name').html(localStorage.getItem('name'));
    }


    function renderChannels() {
        console.log('rendering channels...');
        let list = document.querySelector('#channels');
        list.innerHTML = '';
        for (let channel of channels) {
            const item = document.createElement('li');
            item.setAttribute('onmouseover', '');
            item.innerHTML = '# ' + channel;
            item.addEventListener('click', () => {
                console.log('channel ' + channel + ' clicked!')
                localStorage.setItem('channel', channel);
                highlight();
            });
            console.log('display ' + channel);
            list.append(item);
        }
    }


    function highlight() {
        let list = document.querySelectorAll('#channels li');
        let channel = localStorage.getItem('channel');
        for (let item of list) {
            if (item.innerHTML === '# ' + channel) {
                item.style.backgroundColor = '#4F9689';
                console.log('channel highlighted and emitted!');
                socket.emit('load-messages', {'channel': channel});
            } else {
                item.removeAttribute('style');
            }
        }
    }


    socket.on('messages-loading', data => {
        messages = data['messages'];
        renderMessages();
    });


    function renderNames() {
        console.log('rendering names...');
        let list = document.querySelector('#names');
        list.innerHTML = '';
        for (let name of names) {
            const item = document.createElement('li');
            item.innerHTML = name;
            list.append(item);
        }
    }


    function renderMessages() {
        console.log('rendering messages...');
        let list = document.querySelector('#messages');
        list.innerHTML = '';
        for (let message of messages) {
            const item = document.createElement('li');
            item.innerHTML = message['name'] + ' ' + message['time'] + '\n' + message['content'];
            list.append(item);
        }
    }


    // Add new channel
    $('#add-channel').click( () => {
        console.log('click add channel');
        purpose = 'channel';
        $('#modalLongTitle').html('Create new channel: ');
        $('.modal-body').show();
        $('.modal-footer').show();
        modal.modal();
    });


    // Modal form submit by enter key
    modal.keypress(e => {
        if(e.which === 13) {
            $('#create').click();
            return false;
        }
    });


    // Create name or channel
    $('#create').click(function() {
        const name = $('#name').val();
        socket.emit('create', {'name': name, 'purpose': purpose});
        return false;
    });



    socket.on('modal', data => {
        let title = $('#modalLongTitle');
        $('#name').val('');
        if (data.success) {
            title.css('color', 'green');
            title.html('Success!');
            $('.modal-body').hide();
            $('.modal-footer').hide();
            setTimeout(() => modal.modal('hide'), 1000);
        } else {
            title.css('color', 'red');
            title.html(data.message);
        }
    });


    // Display user name
    socket.on('login', data => {
        localStorage.setItem('name', data['name']);
        renderName();
    });


    // Display updated channels
    socket.on('channel', data => {
        channels.push(data.name);
        renderChannels();
        highlight();
    });

    // Display updated names
    socket.on('name', data => {
        names.push(data.name);
        renderNames();
    });


    // Chat
    $('#message-form').submit(() => {
        let channel = localStorage.getItem(('channel'));
        let name = localStorage.getItem('name');
        let content = $('#message').val();
        socket.emit('chat', {"channel": channel, "name": name, "content": content});
    });


    socket.on('message-broadcast', data => {
        if (localStorage.getItem('channel') === data['channel']) {
            messages.push(data['message']);
            renderMessages();
        }
    });
});

