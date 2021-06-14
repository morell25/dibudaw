export class User {
  public name: string;
  public email: string;
  public id: string;
  public team: number;
  public isOwner: boolean;
  //public friends: Array<{id: string, name:string}>;

  constructor(params: { name: string, email: string, id: string, team:number, isOwner: boolean/*friends: Array<{ id: string, name: string }>*/}) {
    this.name = params.name;
    this.email = params.email;
    this.id = params.id;
    this.team = (params.team != undefined) ? params.team : 0;
    this.isOwner = (params.isOwner != undefined) ? params.isOwner : false;
    //this.friends = params.friends;
  };

  public toJSON() {
    return {
      name: this.name,
      email: this.email,
      id: this.id,
      team: this.team,
      isOwner: this.isOwner

    };
  }


}
