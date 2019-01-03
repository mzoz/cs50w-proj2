document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    let socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);


    function showModal() {
        $('#modal').modal({
            backdrop: 'static',
            keyboard: false
        });
    }


    // Check user has logged in or not
    if (!localStorage.getItem('name')) {
        showModal();
    }


    // Modal form submit by enter key
    $('#modal').keypress(e => {
        if(e.which === 13) {
            $('#create').click();
            return false;
        }
    });


    // Create name
    $('#create').click(function() {
        const name = $('#name').val();
        socket.emit('create name', {'name': name});
        return false;
    });

    socket.on('login', data => {
        let modal = document.querySelector('#modal');
        let title = modal.querySelector('#modalLongTitle');
        if (data.success === 'yes') {
            localStorage.setItem('name', data['name']);
            title.style.color = 'green';
            title.innerHTML = 'Success!';
            modal.querySelector('.modal-body').remove();
            modal.querySelector('.modal-footer').remove();
            setTimeout(() => $('#modal').modal('hide'), 2000);
        } else {
            let message = data.message;
            title.style.color = 'red';
            title.innerHTML = message;
            modal.querySelector('#name').value = '';
        }
    });

    // When connected, configure buttons
    socket.on('connect', () => {

        // Each button should emit a "submit vote" event
        document.querySelectorAll('button').forEach(button => {
            button.onclick = () => {
                const selection = button.dataset.vote;
                socket.emit('submit vote', {'selection': selection});
            };
        });
    });

    // When a new vote is announced, add to the unordered list
    socket.on('vote totals', data => {
        document.querySelector('#yes').innerHTML = data.yes;
        document.querySelector('#no').innerHTML = data.no;
        document.querySelector('#maybe').innerHTML = data.maybe;
    });
});
