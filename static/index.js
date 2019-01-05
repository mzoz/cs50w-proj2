document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    let socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    let purpose;
    let modal = $('#modal');
    let channels = [];

    const request = new XMLHttpRequest();
    request.open('GET', '/channels');
    console.log('make request!');
    request.onload = () => {
        const data = JSON.parse(request.responseText);
        channels = data.channels;
        console.log('channels received!');
        renderChannels();
    };
    request.send();


    // socket.on('channels', data => {
    //     console.log('channels received!');
    //     channels = data.channels;
    // });


    // Initial visit
    if (!localStorage.getItem('name')) {
        purpose = 'name';
        modal.modal({backdrop: 'static', keyboard: false});
    } else {
        // Revisit or refresh page
        renderName();
        if (localStorage.getItem('channel')) {
            renderMessages();
        }
    }


    function renderName() {
        $('#user-name').html(localStorage.getItem('name'));
    }


    function renderChannels() {
        console.log('rendering channels...');
        let channelList = document.querySelector('#channels');
        channelList.innerHTML = '';
        for (let channel of channels) {
            const ch = document.createElement('li');
            ch.innerHTML = '# ' + channel;
            ch.classList.add('channel');
            channelList.append(ch);
        }
    }


    function renderMessages() {

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


    // Render name
    socket.on('login', data => {
        localStorage.setItem('name', data['name']);
        renderName();
    });


    // Render channels
    socket.on('channel', data => {
        channels.push(data.name);
        renderChannels();
    });
});

