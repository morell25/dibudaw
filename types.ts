import { Document } from 'mongoose';
/*
 *SUCIO
 * -Las puntuaciones se guardarán por equipo, no por jugador
 * -Cada equipo tiene un array de miembros
 * -Todos los clientes tienen la lista con todas las palabras de primeras
 *
 * EVENTOS DE CLIENTE a tener en cuenta:
 *  directos
 * al dibujar
 * al escribir en el chat
 * al perder la conexión
 * al darle al botón de terminar partida
 *  indirectos
 * al acertar algun carácter
 * al acertar la palabra
 *
 *
 *
 * EVENTOS DE SERVIDOR:
 * al empezar la partida (con el array de palabras)
 * al empezar una ronda (con los puntos de la ronda anterior ya sumados)
 * al terminar una ronda (acabarse el tiempo o acertar la palabra)(para parar el tiempo y que dejen de pintar)
 *
 *
 *TENER UN TAMAÑO FIJO DE CANVAS AL QUE SE REESCALA TODO LO QUE DIBUJAS EN EL 
 *
*/

export interface DBUser extends Document {
  email: UserEmail,
  name: UserName,
  password: string,
  friends: Array<UserID>,
  sentRequests: Array<UserID>,
  receivedRequests: Array<UserID>;
}

  export declare type User = { readonly id: UserID, email: UserEmail, name: UserName };
  export declare type UserID = string;
  export declare type UserEmail = string;
  export declare type UserName = string;
  export declare type SocketID = string;



  export declare type FriendRequest = { name: UserName, id: UserID };


  //----------PARA USAR EN EL LOBBY COMPONENT----------
  export declare type Team = Set<UserID>;
  export declare type BufferedTeam = Array<User>;
  export declare type TeamNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6;
  export function isTeamNumber(number: number): number is TeamNumber {
  return (number >= 0 && number <= 6);
  }

  export declare type RoomName = string;
  export declare type Room = { name: RoomName, owner: UserID, teams: Array<Team> };
  export declare type BufferedRoom = { owner: UserID, teams: Array<BufferedTeam> }

  export declare type TeamSwitch = { user: UserID, previousTeam: TeamNumber, currentTeam: TeamNumber };

  //----------PARA USAR EN EL GAME COMPONENT----------
  export declare type RoundNumber = TeamNumber;
  export declare type Score = Array<number>;
  export declare type Message = { sender: UserName | undefined, color: Color, content: string }
export declare type Chat = Array<Message>;
export declare type Scoreboard = Array<{ number: TeamNumber, members: BufferedTeam, score: number }>;
  //información adjunta a una sala en la que se está jugando una partida
export declare type Game = { config: GameConfig, data: GameData, dynamicData: DynamicGameData };
export function isGameProperty(key: string): key is keyof Game {

  if (key == 'config' || key == 'data' || key == 'dynamicData')
    return true;
  return false;
}

  export declare type GameConfig = { roundDuration: number, brushSwapTime: number, roundsPerTeam: number, maxWordsPerRound: number }


  //Se envía a todos cuando empieza la partida o a alguno que se conecta a la mitad:

  export declare type GameData = {
    drawingOrder: Array<TeamNumber>,
    words: string[][]
  };

//Se envía a todos al empezar cada ronda o a alguno que se conecta a la mitad:
export declare type DynamicGameData = {
  secondsToNextPainter: number,
  secondsToNextRound: number,
  currentRound: RoundNumber,
  currentWord: string,
  wordStatus: string,
  currentlyDrawingUser: UserID,
  currentlyDrawingTeam: TeamNumber,
  score: Score
}

/**
 * Datos que se envían cada segundo durante el juego
 *
 * @property i Si la partida se encuentra en un interludio entre rondas
 * @property t El tiempo restante actual para la siguiente fase
 */
export declare type TimeData = {
  i: boolean,
  t: number
}


export declare type TimerStatus = {
  interval?: NodeJS.Timer,
  status: Promise<void>
}

//Se envía constantemente cuando alguien está pintando: (NOMBRES CORTOS PARA MAYOR EFICIENCIA)
export declare type CoursorPosition = { x: number, y: number };
export declare type Color = string;
export declare type BrushSize = number;
/**
 * Datos necesarios para realizar una trazada en el lienzo.
 * 
 * @property pp Posición de inicio de la trazada.
 * @property cp Posición final de la trazada.
 */
  export declare type Stroke = {
    pp: CoursorPosition,//PREVIOUS POSITION
    cp: CoursorPosition,//CURRENT POSITION
    c: Color,
    s: BrushSize
  }

