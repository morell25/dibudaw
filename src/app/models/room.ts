export class Room {
  public name: string | null;
  public inGame: boolean;
  public members: { name: string, email: string, id: string, team:number, isOwner: boolean }[];
  

  constructor(params: { name: string, inGame: boolean,  members: any }) {
    this.name = params.name;
    this.inGame = params.inGame;
    this.members = params.members;
  };

  public toJSON() {
    return {
      name: this.name,
      inGame: this.inGame,
      members: this.members
    };
  }

  public setInGame(inGame: boolean) {
    this.inGame = inGame;
    
  }
  public setMembers(members: { name: string, email: string, id:string, team: number, isOwner: boolean}[]) {
    this.members = members;
  }



}
