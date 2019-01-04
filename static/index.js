document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    let socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);


    // Check name in web storage
    if (localStorage.getItem('name')) {
        renderPage();
        document.querySelector('#inner-left').removeAttribute('hidden');
        document.querySelector('#inner-right').removeAttribute('hidden');
    } else {
        document.querySelector('#modal').modal({backdrop: 'static', keyboard: false});
    }


    // Render page content
    function renderPage() {
        console.log('show page!');
        // Render name
        document.querySelector('#user-name').innerHTML = localStorage.getItem('name');

        // Render channels
    }


    // Update local storage for channels and messages
    function updateStorage() {

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
            setTimeout(() => $('#modal').modal('hide'), 1000);
            setTimeout(showPage, 1500);
        } else {
            let message = data.message;
            title.style.color = 'red';
            title.innerHTML = message;
            modal.querySelector('#name').value = '';
        }
    });
});

