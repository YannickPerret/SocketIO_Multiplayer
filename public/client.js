const socket = io();
const ioClient = io.connect("http://localhost:8080")

let currentRoom = {}

let isAdmin = false;
let isOnServeur = false

// ERROR ON LOBBIE
socket.on('room/error', (msg) => {
    setTimeout(() => {
        document.getElementById('room/error').innerHTML = ''
    }, 10000)
    document.getElementById('room/error').innerHTML = msg
})



// FUNCTION UTILS
const closeCreateEditor = () => {
    let form = document.getElementById('multiplayer/addRoom')
    form.style.display = 'none'
    form.reset()
}
const openCreateEditor = () => {
    let form = document.getElementById('multiplayer/addRoom')
    form.style.display = 'block'
}




// CREATE NEW ROOM
window.multiplayerAddEditorRoom = () => {
    openCreateEditor()
}
window.multiplayerRemoveEditorRoom = () => {

    closeCreateEditor()
    //ne pas oublier de vider les champs du formulaire
}



document.getElementById('multiplayer/addRoom').addEventListener('submit', (e) => {
    e.preventDefault()

    const newLobby = {
        title : document.getElementById('roomCreatedTitle').value,
        description : document.getElementById('roomCreatedDescription').value,
        maxPlayer :  document.getElementById('roomCreatedMaxPlayer').value,
        isPublic : document.querySelector('input[name=roomCreatedIsPublic]:checked').value,
    } 
    if(newLobby) {
        socket.emit("room/create", (newLobby))
        closeCreateEditor()
    }
})


//JOIN LOBBY
socket.on('room/join', (rooms) => {

    currentRoom = rooms
    let serverListDisplay = document.querySelector('.multiplayer__room__listRoom')
    let currentDisplayServer = document.querySelector('.multiplayer__room__Waiting')

    serverListDisplay.style.display = 'none';
    currentDisplayServer.style.display = 'flex';

    document.getElementById('multiplayer/room/title').innerHTML = rooms.title
    document.getElementById('multiplayer/room/description').innerHTML = rooms.description
})

socket.on('room/refreshPlayer', (_currentRoom) => {
    currentRoom.listPlayer = _currentRoom.listPlayer
    currentRoom.currentPlayer = _currentRoom.currentPlayer

    document.getElementById('multiplayer/room/currentPlayerInServer').innerHTML = `connecté : ${currentRoom.currentPlayer} / ${currentRoom.maxPlayer}`
    
    document.getElementById('mulltiplayer/room/playerlist').innerHTML = ''

    currentRoom.listPlayer.map((element) => {
        document.getElementById('mulltiplayer/room/playerlist').innerHTML += `<tr>
            <td>${element}</td>
        </tr>`;
    })
})


window.multiplayerJoinRoom = (roomId) => {
    if(roomId){
        socket.emit("room/join", roomId)
    }
}

//LEAVE LOBBIE
window.multiplayerLeaveRoom = () => {
    socket.emit('room/leave', currentRoom.id)
    currentRoom = {}
}

socket.on('room/leave', () => {
    let serverListDisplay = document.querySelector('.multiplayer__room__listRoom')
    let currentDisplayServer = document.querySelector('.multiplayer__room__Waiting')

    serverListDisplay.style.display = 'flex';
    currentDisplayServer.style.display = 'none';
})

window.multiplayerDeleteRoom = () => {
    let confirmation = confirm("Êtes-vous sur de vouloir supprimer ce serveur ?")
    if(confirmation !== ''){
        socket.emit('room/delete', currentRoom.id, confirmation)
    }
}
socket.on('room/deleteRoom', () => {

    let serverListDisplay = document.querySelector('.multiplayer__room__listRoom')
    let currentDisplayServer = document.querySelector('.multiplayer__room__Waiting')

    serverListDisplay.style.display = 'flex';
    currentDisplayServer.style.display = 'none';

    currentRoom = {}
})



//REFRESH LOBBY LIST

socket.on('room/refreshList', (room) => {
    let tableRoom = document.getElementById('multiplayer/roomList')

    if(room.length > 0){
        tableRoom.innerHTML = `<tr>
            <th>Title</th>
            <th>Description</th>
            <th>Player</th>
            <th>Visibility</th>
            <th>Region</th>
        </tr>`;

        room.map(element => {
            tableRoom.innerHTML += `
            <tr class="multiplayer__lobbie__item" onclick="multiplayerJoinRoom('${element.id}')">
                <td>${element.title}</td>
                <td>${element.description}</td>
                <td>${element.currentPlayer} / ${element.maxPlayer}</td>
                <td>${element.isPublic ? 'Public' : 'Private'}</td>
                <td>${element.region}</td>
           </tr>`;
        })

    }else{
        tableRoom.innerHTML = "<p>Malheureusement aucun serveur n'est disponible ! Commencez par en créer un</p>"
    }
    
})


window.multiplayerRefreshRoom = () => {
    socket.emit('room/refreshList')
}

window.addEventListener('load', () => {
    socket.emit('room/refreshList')
})

//rafraichissement auto du serveur via le client