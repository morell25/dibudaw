import * as express from 'express';
import * as socketIO from 'socket.io';
import * as http from 'http';
import * as fs from 'fs';
import * as readline from 'readline';

import { BufferedRoom, BufferedTeam, Game, GameConfig, isTeamNumber, Message, Room, RoomName, SocketID, Stroke, Team, TeamNumber, TeamSwitch, TimeData, TimerStatus, User, UserID } from 'types';
import * as EventEmitter from 'events';
const defaultGameConfig: GameConfig = { roundDuration: 120, brushSwapTime: 15, roundsPerTeam: 1, maxWordsPerRound: 10 };//LA FUNCIÓN DE GENERAR PALABRAS NO ESTÁ HECHA PARA MÁS DE 1 RONDA POR EQUIPO!!!!!!!!!!!!!!


const nthline = require('nthline');
const wordsFilePath = 'words.txt';
const wordsFileStream = fs.createReadStream('words.txt');
const rl = readline.createInterface({
  input: wordsFileStream,
  crlfDelay: Infinity
});



export function socketApp(): http.Server {
  const server = express();

/**
 *Mapa encargado de adjuntar a cada socket cliente, la información del usuario que usa ese socket
 */
  let clientsData: WeakMap<socketIO.Socket, User> = new WeakMap<socketIO.Socket, User>();

  /**
   * Mapa que permite relacionar a cada id de usuario (UserID) con un socket(SocketID)
   */
  let membersData: Map<UserID, SocketID> = new Map<UserID, SocketID>();


  /**
   * Mapa que permite relacionar una sala (Room) con su nombre (RoomName);
   */
  let roomsData: Map<RoomName, Room> = new Map<RoomName, Room>();

  /**
   * Mapa que permite relacionar una partida (Game) con una sala (Room) de tal manera que al borrarse la sala (Room), también se borrará la partida (Game);
   */
  let gamesData: WeakMap<Room, Game> = new WeakMap<Room, Game>();

  /**
   * Mapa para guardar el emisor que permite recibir información de la partida
   */
  let gameDataEmitters: WeakMap<Game, EventEmitter> = new WeakMap <Game, EventEmitter>();





  const httpServer: http.Server = http.createServer(server);
  const io: socketIO.Server = require('socket.io')(httpServer, {
    cors: {
      origin: true,
      methods: ["GET","POST"]
    }
  });



/*
  setInterval(async () => {
    console.log("datos de clientes actuales:");
    Array.from(await io.allSockets()).forEach((socketId: any) => {
      console.log(clientsData.get(io.sockets.sockets.get(socketId)));
    })
  }, 4000);
*/



  io.on('connect', async (socket: socketIO.Socket) => {
    let ROOM_NAME!: RoomName;

    //STATUS LOGS:
    console.log(`Bienvenido {id: ${socket.id}}`);
    socket.on("connect_error", () => {
      console.log(`Ha habido un error cuando el cliente {id: ${socket.id}} se intentaba conectar`);
    });
    socket.on("disconnect", (reason) => {
      console.log(`El cliente {id: ${socket.id}} se ha desconectado (${reason})`);



    });
    socket.on("disconnecting", (reason) => {

      /* hay acceso a las salas en las que está el sokcet*/
      if (ROOM_NAME != undefined) {
        let room: Room | undefined = roomsData.get(ROOM_NAME);
        if (room != undefined) {

          if (leaveRoom(room, socket)) {
            console.log("se ha salido alguien de la sala " + ROOM_NAME);
            if (roomSize(room) < 1) roomsData.delete(ROOM_NAME);
          }
          else
            console.log("alguien ha intentado salir de la sala " + ROOM_NAME);
          io.to(ROOM_NAME).emit('roomData', bufferedRoom(room));


        }
      }
    });
    socket.on("setCredentials", (user: User) => {
      clientsData.set(socket, user);
      membersData.set(user.id, socket.id);
    });



    //ROOM HANDLERS:
    socket.on('wannaCreate', async (roomName: RoomName, user: User) => {
      ROOM_NAME = roomName;
      let room: Room | undefined = roomsData.get(roomName);
      if (room !== undefined && roomSize(room)) {
        if (findMember(user.id, room)) {
          socket.emit('roomStatus', { status: false, reason: "No te puedes unir a una sala en la que ya estas." });
        }
        else {

          socket.emit('roomStatus', { status: false, reason: "Ya existe una sala con este código" });
        }
      }
      else {

        socket.emit('roomStatus', { status: true, roomName: ROOM_NAME, reason: "Sala creada con éxito." });
        await socket.join(roomName)
        let newRoom: Room = {
          name: roomName,
          owner: user.id, teams: [
            new Set([user.id]),
            new Set(),
            new Set(),
            new Set(),
            new Set(),
            new Set(),
            new Set()
          ]
        }
        roomsData.set(roomName, newRoom);
        let bufferedRoom: BufferedRoom = { owner: user.id, teams: bufferedTeams(newRoom.teams) };
        io.to(roomName).emit('roomData', bufferedRoom);

      }
    });

    socket.on('wannaJoin', async (roomName: RoomName, user: User) => {
      ROOM_NAME = roomName;
      let room: Room | undefined = roomsData.get(roomName);
      if (room !== undefined) {
        if (!findMember(user.id, room)) {
          await socket.join(roomName);
          roomsData.get(roomName)?.teams[0].add(user.id);
          socket.emit('roomStatus', { status: true, roomName: ROOM_NAME, reason: "Te has unido a la sala." });
          io.to(roomName).emit('roomData', bufferedRoom(room));
        }
        else {
          socket.emit('roomStatus', { status: false, reason: "Ya estás en esta sala." })
        }
      } else {
          socket.emit('roomStatus', { status: false, reason: "No existe sala con este código." })
      }
    });

      socket.on('wannaJoinFriend', async (user: User, friendId: string) => {
          let friendSocketId: SocketID | undefined = membersData.get(friendId);
          if (friendSocketId !== undefined) {
              let friendSocket = io.sockets.sockets.get(friendSocketId)
              if (friendSocket !== undefined) {
                  for (let roomId of Array.from(friendSocket.rooms)) {
                      if (roomId != friendSocketId) {
                          ROOM_NAME = roomId;
                          let room: Room | undefined = roomsData.get(ROOM_NAME);
                        if (room !== undefined) {
                          if (!findMember(user.id, room)) {
                            await socket.join(ROOM_NAME);
                            roomsData.get(ROOM_NAME)?.teams[0].add(user.id);
                            socket.emit('roomStatus', { status: true, roomName: ROOM_NAME, reason: "Te has unido a la sala." });
                            io.to(ROOM_NAME).emit('roomData', bufferedRoom(room));
                          }
                          else {
                            socket.emit('roomStatus', { status: false, reason: "Ya estás en esta sala." })
                          }
                        } else {
                          socket.emit('roomStatus', { status: false, reason: "Esta sala no existe." })
                        }
                          break;
                      }
                  }
              }
              else {
                  socket.emit('roomStatus', { status: false, reason: "Amigo no conectado o sala no creada." })
              }
          }
          else {
              socket.emit('roomStatus', { status: false, reason: "Amigo no conectado o sala no creada." })
          }
      });

    socket.on('wannaLeave', async (roomName: RoomName) => {
      ROOM_NAME = '';
      let room: Room | undefined = roomsData.get(roomName);
      if (room !== undefined) {
        if (leaveRoom(room, socket)) {
          if (roomSize(room) < 1) roomsData.delete(roomName);
        }
        else
          console.log("alguien ha intentado salir de la sala " + roomName);
        io.to(roomName).emit('roomData', bufferedRoom(room));


      } else {
        console.log("Esta sala no existe");
      }
    });

    socket.on('teamSwitch', async (roomName: RoomName, teamSwitches: Array<TeamSwitch>) => {
      let room: Room | undefined = roomsData.get(roomName);


      if (room !== undefined) {
        while (room.teams.length < 7) {
          room.teams.push(new Set());
        }
        for (let teamSwitch of teamSwitches) {
          room.teams[teamSwitch.previousTeam].delete(teamSwitch.user);
          room.teams[teamSwitch.currentTeam].add(teamSwitch.user);
        }
        io.to(roomName).emit('roomData', bufferedRoom(room));


      } else console.log("Esta sala no existe");
    });


    //GAME HANDLERS
    socket.on('wannaStart', async (roomName: RoomName) => {
      let room: Room | undefined = roomsData.get(roomName);
      if (room != undefined) {


        let tooLargeTeam: boolean = false;
        let polishedTeams: Array<Team> = [room.teams[0]];
        for (let team of room.teams.slice(1)) {
          if (team.size > 0) {
            polishedTeams.push(team);
            if (team.size > 2) {
              tooLargeTeam = true;
            }
          }
          
        }
        if (polishedTeams.slice(1).length < 3) {
          socket.emit('gameStarted', { status: false, reason: "Hacen falta al menos 3 equipos para empezar la partida" });
        }
        else if (tooLargeTeam) {
          socket.emit('gameStarted', { status: false, reason: "No puede haber un equipo con más de 2 miembros" });
        }
        else {
          room.teams = polishedTeams;
          let order: Array<TeamNumber> = drawingOrder(room.teams.length -1);
          let words: Array<Array<string>> = await randomWords(room.teams.length, defaultGameConfig.maxWordsPerRound);
          //let score = new Array(room.teams.length);
          let score = new Array();

          for (let i = 1; i < room.teams.length; i++) {
            score.push(0);
          }

          let game: Game = {
            config: defaultGameConfig,
            data: {
              drawingOrder: order,
              //chat: [{ sender: undefined, content: `Bienvenidos, esperemos que disfrutéis de la partida, ahora a jugar!` }],
              words: words
            },
            dynamicData: {
              secondsToNextPainter: 15,
              secondsToNextRound: defaultGameConfig.roundDuration,
              currentRound: 1,
              currentlyDrawingTeam: order[0],
              currentlyDrawingUser: room.teams[order[0]].values().next().value,
              currentWord: words[order[0]-1][0],
              wordStatus: words[order[0]-1][0].replace(/[^!¡.]/g, '_'),
              score: score

            }
          }
          roomsData.set(roomName, room);
          gamesData.set(room, game);

          let gameDataEmitter = new EventEmitter();
          gameDataEmitters.set(game, gameDataEmitter);
          let goodRoom = bufferedRoom(room);
          io.to(roomName).emit('gameStarted', { status: true, reason: "alguien le ha dado a empezar partida" + new Date().getTime() / 1000, data: { room: goodRoom, game: game } });
          io.to(roomName).emit('gameStatus', { status: true, game: game, room: goodRoom,  reason: "empezando partida!" + new Date().getTime() / 1000 });
          io.to(roomName).emit('roomStatus', {status: true, roomName: roomName})
          io.to(roomName).emit('gameData', game, goodRoom);

          startGame(room, game, gameDataEmitter);

        }
      } else console.log("Esta sala no existe");



    });

    socket.on('wannaEnd', async (roomName: RoomName) => {

      const room: Room | undefined = roomsData.get(roomName);
      if (room != undefined) {
        const game: Game | undefined = gamesData.get(room);
        if (game != undefined) {

          while (room.teams.length < 7) {
            room.teams.push(new Set());
          }
          gameDataEmitters.get(game)?.emit('end');
          io.to(roomName).emit('gameEnded', bufferedRoom(room), game);
          io.to(roomName).emit('roomStatus', { status: true, roomName: roomName, reason: "La partida ha finalizado." });
          io.to(roomName).emit('roomData', bufferedRoom(room));
        }
      }
    });

    socket.on('wannaStroke', async ( stroke: Stroke) => {

      socket.broadcast.to(ROOM_NAME).emit('stroke', stroke);

    });
    socket.on('wannaClear', async () => {
      socket.broadcast.to(ROOM_NAME).emit('canvasClear');
    });

    socket.on('wannaChat', async (roomName: RoomName,message: Message) => {
      console.log(message);
      console.log(roomName);
      //comprobar si es la palabra correcta o si ha acertado alguna palabra;

      let room: Room | undefined = roomsData.get(roomName);
      if (room != undefined) {
        let game: Game | undefined = gamesData.get(room);
        if (game != undefined) {

          let checkedWord = wordCheck(game.dynamicData.currentWord, message.content);
          if (checkedWord == true) {
            gameDataEmitters.get(game)?.emit('correctWord', clientsData.get(socket)?.id);
          }
          else {
            if (checkedWord == false) {
              io.to(roomName).emit('message', message);
            }
            else {
              io.to(roomName).emit('gameData', { dynamicData: { wordStatus: checkedWord } });
            }
          }

        }
      }
    });
    




  });



  async function startGame(room: Room, game: Game, gameDataEmitter: EventEmitter) {
    let gameEnded = false;
    gameDataEmitter.once('end', () => { gameEnded = true });
    console.log("empieza partida");

    //Tiempo antes de que comience la partida.
    let roundTimer: TimerStatus = setRoundCountdown(room,  gameDataEmitter, { i: true, rt: 5 });
    await roundTimer.status;
    let turnChronometer: TimerStatus;
    let index:number = 0;
    for (let teamNumber of game.data.drawingOrder) {
      
      if (gameEnded) break;


      //Tiempo pre-ronda
      if (index != 0) {
        roundTimer = setRoundCountdown(room, gameDataEmitter, { i: true, rt: 3 });
        await roundTimer.status;
      }
      if (gameEnded) break;




      game.dynamicData.currentlyDrawingTeam = teamNumber;
      //game.dynamicData.currentlyDrawingUser = room.teams[teamNumber].keys().next().value;
      io.to(room.name).emit('gameData', {
        dynamicData: {
          currentlyDrawingTeam: game.dynamicData.currentlyDrawingTeam,
          //currentlyDrawingUser: game.dynamicData.currentlyDrawingUser
        }
      })


      //Tiempo de la ronda
      roundTimer = setRoundCountdown(room, gameDataEmitter, { i: false, rt: 60, tt: 15 }, game, teamNumber);
      await roundTimer.status;


      index++;
    }
    

    gameDataEmitter.removeAllListeners();

    while (room.teams.length < 7) {
      room.teams.push(new Set());
    }
    gameDataEmitters.get(game)?.emit('end');
    io.to(room.name).emit('gameEnded', bufferedRoom(room), game);
    io.to(room.name).emit('roomStatus', { status: true, roomName: room.name });
    io.to(room.name).emit('roomData', bufferedRoom(room));

    console.log("Acaba partida");


    //EMIT la partida va a empezar(cuenta atrás);
    //EMIT cada ronda DynamicGameData actualizado;
    //EMIT cada 15s DynamicGameData.currentlyDrawingUser;
    //EMIT cada 1s DynamicGameData.secondsToNextPainter; INEFICIENTE?
    //EMIT cada 1s DynamicGameData.secondsToNextRound; INEFICIENTE?

    //UPDATE la palabra cuando alguien acierte un caracter
    
    //RESET secondsToNextPainter cuando alguien acierte la palabra / termine la ronda;
    //RESET secondsToNextRound cuando se acabe el tiempo / acierten las 10 palabras;

    
    /**
     * HANDLE cuando alguien abandona la partida:
     * si quedan menos de 3 equipos se acaba la partida,
     * si el equipo que pintaba se queda sin jugadores, se borran los datos del equipo en Game
     * si era el último equipo, y era el que estaba pintando, se acaba la partida
     * 
     */

    

  }

  function setRoundCountdown(room: Room, gameDataEmitter: EventEmitter, startingTime: TimeData, game?: Game, teamNumber?: TeamNumber): TimerStatus {
    let countdown: NodeJS.Timer | undefined;
    let resolver: (value: void | PromiseLike<void>) => void | undefined;
    let wordNumber: number = 0;
    let oneTeamMember: boolean = true;
    let startingTurnTime: number | undefined = startingTime.tt;
    let turnIterator: Iterator<string> | undefined;

    if (game != undefined && teamNumber != undefined) {
      oneTeamMember = (room.teams[teamNumber].size == 1);
      if (oneTeamMember) {
        startingTime.tt = undefined;
        startingTurnTime = undefined;
      }
      turnIterator = room.teams[teamNumber].values();
      game.dynamicData.currentWord = game.data.words[teamNumber - 1][wordNumber];
      game.dynamicData.wordStatus = game.dynamicData.currentWord.replace(/[^!¡.]/g, '_');
      game.dynamicData.currentlyDrawingUser = turnIterator.next().value;
      io.to(room.name).emit('gameData', {
        dynamicData: {
          currentlyDrawingTeam: game.dynamicData.currentlyDrawingTeam,
          currentWord: game.dynamicData.currentWord,
          wordStatus: game.dynamicData.wordStatus,
          currentlyDrawingUser: game.dynamicData.currentlyDrawingUser
        }
      });
    }else {
      io.to(room.name).emit('gameData', {
        dynamicData:{
          currentlyDrawingTeam: -1,
          currentWord: "",
          wordStatus: "",
          currentlyDrawingUser: -1//esto va?
        }
      });
    }

    let endCallback = () => {
      console.log("evento end");
      gameDataEmitter.off('correctWord', correctWordCallback);
      if (countdown)
        clearInterval(countdown);
      if(resolver)
        resolver();
    };
    let correctWordCallback = (senderId: UserID) => {
      console.log('palabra acertada');
      wordNumber++;
      if (game != undefined && teamNumber != undefined && wordNumber < 10) {
        let senderTeam = getMemberTeamIndex(senderId, room);
        if (senderTeam != -1)
          game.dynamicData.score[senderTeam - 1] += 60;
        game.dynamicData.score[teamNumber - 1] += (50 + (wordNumber*5));
        game.dynamicData.currentWord = game.data.words[teamNumber - 1][wordNumber];
        game.dynamicData.wordStatus = game.dynamicData.currentWord.replace(/[^!¡.]/g, '_');

        io.to(room.name).emit('gameData', {
          dynamicData: {
            score: game.dynamicData.score,
            currentWord: game.dynamicData.currentWord,
            wordStatus: game.dynamicData.wordStatus,

          },
          wordHasBeenAccepted: true
        });
        
        gameDataEmitter.once('correctWord', correctWordCallback);
      } else {
        gameDataEmitter.off('end', endCallback);
        if (countdown)
          clearInterval(countdown);
        if (resolver)
          resolver();
      }


      
    };

    
    console.log("comienza temporizador");
    let roundStatus = new Promise<void>((resolve, reject) => {
      resolver = resolve;
      gameDataEmitter.once('end', endCallback);
      if (teamNumber != undefined) {
        gameDataEmitter.once('correctWord', correctWordCallback);
      }
      countdown = setInterval(() => {
        if (startingTime.rt >= 0) {

          if (oneTeamMember) {
            startingTime.tt = startingTime.rt;
          } else if (startingTurnTime != undefined && startingTime.tt != undefined) {
            if (startingTime.tt < 0) {
              if (teamNumber != undefined) {
                let nextDrawingUser = turnIterator?.next().value;
                if (nextDrawingUser == undefined) {
                  turnIterator = room.teams[teamNumber].values();
                  nextDrawingUser = turnIterator.next().value;
                }
                  io.to(room.name).emit('gameData', {
                    dynamicData: {
                      currentlyDrawingUser: nextDrawingUser
                }
                  });
                startingTime.tt = startingTurnTime;
              }
            }
            
          }

          io.to(room.name).emit('roundTime', startingTime);
          console.log(startingTime.rt);
          console.log(startingTime.tt);
          startingTime.rt--;
          if (startingTime.tt != undefined)
          startingTime.tt--;




        }
        else {
          console.log("acaba cuenta atrás");
          if(countdown != undefined)
            clearInterval(countdown);
          gameDataEmitter.off('end', endCallback);
          gameDataEmitter.off('correctWord', correctWordCallback);
          resolve();
        }
        
      }, 1000);
      
    });
    return { interval: countdown, status: roundStatus };
  };

  function setTurnCountdown(roomName: RoomName, startingTime: number = defaultGameConfig.brushSwapTime): TimerStatus {
    let countdown: NodeJS.Timer | undefined;
    let turnStatus = new Promise<void>((resolve, reject) => {
      countdown = setInterval(() => {
        if (startingTime >= 0) {
          startingTime--;
        }
        else {
          if(countdown != undefined)
            clearInterval(countdown);
          resolve();
        }
        io.to(roomName).emit('turnTime', startingTime);
      }, 1000);
    });
    return { interval: countdown, status: turnStatus }
  }

  function nextRound() {

  }

  function nextTurn() {

  }


  /**
   * Transforma un array de equipos normal (cada equipo tiene las IDs de mongo de los miembros)
   *  a un array de equpios preparado para mandar al front (cada equipo tiene los datos de los miembros).
   * @param teams
   */
  function bufferedTeams(teams: Array<Team>): Array<BufferedTeam> {
    let bufferedTeams: Array<BufferedTeam> = [[],[],[],[],[],[],[]];

    teams.forEach((team, teamNumber) => {
      for (let memberId of team) {
        let socketId: SocketID | undefined = membersData.get(memberId);
        if (socketId !== undefined) {
          let socket: socketIO.Socket | undefined = io.sockets.sockets.get(socketId);
          if (socket !== undefined) {
            let user: User | undefined = clientsData.get(socket);
            if (user)
              bufferedTeams[teamNumber].push(user);
          }
        }
      }
    });
    return bufferedTeams;
  }


  /**
   * Transforma los datos de una sala en datos preparados para mandar al front.
   * @param room
   */
  function bufferedRoom(room: Room): BufferedRoom {

    return { owner: room.owner, teams: bufferedTeams(room.teams) };
  }


  /**
   * Devuelve el número de usuarios que hay dentro de la sala introducida por parámetro.
   * @param room
   */
  function roomSize(room: Room): number {
    let roomSize: number = 0;
    room.teams.forEach((team: Team) => { roomSize += team.size });
    return roomSize;
  }
  /**
   * Borra la id del usuario de los datos de la sala.
   * @param room
   * @param socket
   */
  function leaveRoom(room: Room,  socket: socketIO.Socket): boolean {
 let userId: any = clientsData.get(socket)?.id;
    
    if (userId !== undefined && room.teams.some((team) => team.delete(userId))) {
      
      if (roomSize(room) >= 1) {
        let userId: UserID | undefined = clientsData.get(socket)?.id;
        if (room.owner == userId) {
          return setOwner(room);
        }
      }
      return true;
    }
    return false;
  }

  /**
   * Comprueba si la id de un usuario está en los datos de la sala
   * @param userId
   * @param room
   */
  function findMember(userId: UserID, room: Room): boolean {
    for (let teamIndex in room.teams)
      for (let memberId of room.teams[teamIndex])
        if (memberId == userId)
          return true;
      
    return false;
  }

  function getMemberTeamIndex(userId: UserID, room: Room): number {
    for (let teamIndex in room.teams) {
      for (let memberId of room.teams[teamIndex])
        if (memberId == userId)
          return +teamIndex;
    }
    return -1;
  }

  /**
   * Expulsa a todos los miembros de una sala y borra los datos de la sala.
   * @param roomName
   */
  function deleteRoom(roomName: RoomName): boolean {
    io.socketsLeave(roomName);
    return roomsData.delete(roomName);
  }

  function setOwner(room: Room, newOwner: UserID | null = null): boolean {

    //cambiar room.owner a newOwner o al primero que encuentre en los equipos


    return false;
  }


  function drawingOrder(numberOfTeams: number) {
    console.log(numberOfTeams);
    let drawingOrder: Array<TeamNumber> = [];
    while (numberOfTeams > 0) {
      if (isTeamNumber(numberOfTeams))
      drawingOrder.push(numberOfTeams);
      numberOfTeams--;

    }

    return drawingOrder;
  }

  return httpServer;
}


function wordCheck(goodWord: string, word: string): boolean | string {
  //Falta devolver false si no ha acertado ningún caracter nuevo!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  if (goodWord.length != word.length)
    return false;
  if (goodWord == word)
    return true;
  let newWord = '';
  for (let i = 0; i < word.length; i++) {
    if (goodWord.charAt(i) == ' ') {
      newWord = newWord + ' ';
      continue;
    }
    if (goodWord.charAt(i) == word.charAt(i))
      newWord = newWord + goodWord.charAt(i);
    else
      newWord = newWord + '_';
  }
  return newWord;

}     







async function randomWords(numberOfTeams: number, wordsPerTeam: number): Promise<string[][]> {
  let randomWords: Array<Array<string>> = [];

  for (let i = 1; i < numberOfTeams; i++) {
    randomWords.push([]);
    for (let j = 0; j < wordsPerTeam; j++) {
      randomWords[i - 1].push(await nthline(Math.floor(Math.random() * 3096), wordsFilePath));
    }
  }
  return randomWords;
}

