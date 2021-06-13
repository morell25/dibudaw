import * as express from 'express';
import * as socketIO from 'socket.io';
import * as http from 'http';
import * as user from 'models/user';
import { SocketID, User, UserID } from './types';



export function socialApp(): http.Server {
    const server = express();
    const httpServer: http.Server = http.createServer(server);
    const io: socketIO.Server = require('socket.io')(httpServer, {
        cors: {
            origin: true,
            methods: ['GET', 'POST'],
        },
    });
    let membersData: Map<UserID, SocketID> = new Map<UserID, SocketID>();
    let clientsData: WeakMap<socketIO.Socket, User> = new WeakMap<socketIO.Socket, User>();
    io.on('connect', async (socket: socketIO.Socket) => {

        console.log(`Amigos socker: {id: ${socket.id}}`);
        socket.on('connect_error', () => {
            console.log(
                `Ha habido un error cuando el cliente {id: ${socket.id}} se intentaba conectar`
            );
        });
        socket.on('disconnect', (reason) => {
            console.log(
                `El cliente {id: ${socket.id}} se ha desconectado (${reason})`
            );
        });

    //---INICIO DE SOLICITUDES DE AMISTAD---

      socket.on('wannaSendFriendRequest', async (pIdUser, pEmailFriend, pUsername) => {
        let result = await user.sendFriendRequest(pIdUser, pEmailFriend)
        console.log("Social server" + JSON.stringify(result));
        //borrar!:::
                      
            let resultadito = undefined;
            if (result.friendId != undefined)
            {
                
                let friendSocketId: SocketID | undefined = membersData.get(result.friendId);
              console.log(membersData);
              console.log("FriendSocket id"+friendSocketId);
                if (friendSocketId != undefined)
                {
                    let friendSocket: socketIO.Socket | undefined = io.sockets.sockets.get(friendSocketId);
                    if (friendSocket != undefined)
                    {

                      //estoy hay que borralo!!!!!!
                      let amiguito = await user.findById(result.friendId);
                      if(amiguito)
                      resultadito = await user.findByIds(amiguito.friends);

                      friendSocket.emit('friendRequestReceived', { name: pUsername, id: pIdUser})
                    }
                }
        }
        socket.emit('status', result, (resultadito));
        })

        socket.on('wannaGetFriendRequest', async (pIdUser) => {
            let status = await user.getReceivedRequests(pIdUser);
            socket.emit('friendRequests', status)
        })

        socket.on('wannaDeclineFriendRequest', async (pIdUser, pIdUserFriend) => {
            await user.declineFriend(pIdUser, pIdUserFriend)
        })

        socket.on('wannaAcceptFriendRequest', async (pIdUser, pIdUserFriend) => {
            await user.acceptFriend(pIdUser, pIdUserFriend)
            let status = await user.getFriendOfPerson(pIdUser)
            socket.emit('friendList', status)
            let friendSocketId: SocketID | undefined = membersData.get(pIdUserFriend)
            if (friendSocketId != undefined) {
                let friendSocket: socketIO.Socket | undefined = io.sockets.sockets.get(friendSocketId)
                if (friendSocket != undefined) {
                    let statusFriend = await user.getFriendOfPerson(pIdUserFriend)
                    friendSocket.emit('friendList', statusFriend)
                }
            }
        })
    //---FIN DE SOLICITUDES DE AMISTAD---

    //---INICIO DE LISTA DE AMIGOS---
        socket.on('wannaGetListFriend', async (pIdUser) => {
            let status = await user.getFriendOfPerson(pIdUser)
            socket.emit('friendList', status)
        })

        socket.on('deleteFriend', async (pIdUser, pIdUserFriend) => {
            await user.removeFriend(pIdUser, pIdUserFriend)
            let status = await user.getFriendOfPerson(pIdUser)
            socket.emit('friendList', status)
            let friendSocketId: SocketID | undefined = membersData.get(pIdUserFriend)
            if (friendSocketId != undefined) {
                let friendSocket: socketIO.Socket | undefined = io.sockets.sockets.get(friendSocketId)
                if (friendSocket != undefined) {
                    let statusFriend = await user.getFriendOfPerson(pIdUserFriend)
                    friendSocket.emit('friendList', statusFriend)
                }
            }
        })


    //---FIN DE LISTA DE AMIGOS---

    //---INICIO DE INVITACIONES A PARTIDA---
      socket.on('wannaSendInvitation', async (pIdUser, friendData, roomName, pFriendName) => {
          console.log(JSON.stringify(pIdUser));
        let sendtInvitation: any = await user.findById(pIdUser);
        if (friendData.id == undefined) {
          let friend = await user.findByEmail(friendData.email);
          if (friend != null) {
            pFriendName = friend.name;
            friendData.id = friend.id;
          }
        }
        let friendSocketId: SocketID | undefined = membersData.get(friendData.id)
        if (friendSocketId != undefined) {
          let friendSocket: socketIO.Socket | undefined = io.sockets.sockets.get(friendSocketId);
          if (friendSocket != undefined) {
            friendSocket.emit('InvitationReceived', { id: roomName, name: sendtInvitation.name });
            socket.emit('status', { status: true, reason: 'Invitación enviada a ' + pFriendName });
          }
        } else {
          socket.emit('status', { status: false, reason: 'Usuario no conectado' });
        }
      })
    //---FIN DE INVITACIONES A PARTIDA---

        socket.on('setCredentials', (user: User) => {
            clientsData.set(socket, user);
            membersData.set(user.id, socket.id);
        });

    });
    return httpServer;
}
