import * as mongoose from 'mongoose';
import * as cryptoJS from 'crypto-js';
import { DBUser, FriendRequest, User, UserEmail, UserID, UserName } from '../types';

const mongooseForUpdates: mongoose.Mongoose = require('mongoose');

export const secretKey = `MIIEpAIBAAKCAQEAqdx/Az84w137KOK`;

const cUserSchema = new mongoose.Schema(
{
    email: { type: String, lowercase: true, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    friends: [{ type: mongooseForUpdates.Types.ObjectId, ref: 'users' }],
    sentRequests: [{ type: mongooseForUpdates.Types.ObjectId, ref: 'users' }],
    receivedRequests: [{ type: mongooseForUpdates.Types.ObjectId, ref: 'users' }]
});

const userModel = mongooseForUpdates.model<DBUser>('users', cUserSchema);
export default userModel;

//AMIGOS
/**
* registro de un nuevo usuario
* parametros → nombreUsuario, Email, Password
* devuelve → 
 *  -true si todo correcto y msg: Usuario registrado correctamente.
 *  -false si algo falla y msg: El usuario no se ha podido registrar.
*/
export async function register(
    pUsername: string, 
    pEmail: string,
    pPassword: string,
    cSecretKey: string
    ): Promise<{status: boolean, reason: string}>
{
  let vUserSearched = await userModel.findOne({ email: pEmail }).exec();
  if (vUserSearched == null)
  {
    let userCreate = new userModel({ 
      email: pEmail.toLowerCase(), 
      name: pUsername, 
      password: cryptoJS.AES.encrypt(pPassword, cSecretKey).toString(),
      friends: [] });
    userCreate.save();
    return {status: true, reason: "Usuario registrado correctamente."};
  }
  return {status: false, reason: "Este email ya está en uso."};
}

/**
* inicio de sesion
* parametros → Email, Password
* devuelve →
 *  -true si credenciales correctas y msg: Credenciales correctas.
 *  -false si algo falla y msg: No hay usuario registrado con esas credenciales.
*/
export async function login(pEmail: string, pPassword: string, cSecretKey: string): Promise<{ status: boolean, reason: string }>
{
  var vUserSearched: any = await userModel.findOne({ email: pEmail });
  if (vUserSearched && vUserSearched.email == pEmail) {
    let vUserPassDes = cryptoJS.AES.decrypt(vUserSearched.password, cSecretKey).toString(cryptoJS.enc.Utf8);
    if (vUserPassDes == pPassword) {
      return {status: true, reason: "Credenciales correctas."}
    }
  }
  return { status: false, reason: "No hay usuario registrado con estas credenciales."};
}

/**
* encontrar alguien pasando la id de mongodb
* parametros → idMongodb
* devuelve →
 *  -true si encuentra el id en la base de datos y msg: Se ha encontrado el usuario con esa id.
 *  -false si no lo encuentra y msg: No se ha encontrado usuario con esa id.
*/
export async function findById(id: UserID): Promise<{ email: UserEmail, name: UserName, id: UserID, friends: Array<UserID>, sentRequests: Array<UserID>, receivedRequests: Array<UserID> } | null>
{
  var userSearched = await userModel.findOne({ _id: id });
  if (userSearched != null)
  {
    return {
        email: userSearched.email,
        name: userSearched.name,
        id: userSearched.id,
        friends: userSearched.friends,
        sentRequests: userSearched.sentRequests,
        receivedRequests: userSearched.receivedRequests
    };
  }
    return null;
}

export async function findByIds(userIds: Array<UserID>) {

  let objectIds = userIds.map((userId) => { return mongoose.Types.ObjectId(userId); });


  return await userModel.find({
    '_id': {
      $in: objectIds   }
  }, function (err, docs) {
    console.log(docs);
  });
  return null;
}

/**
* encontrar alguien pasando el email
* parametros → email
*  devuelve →
 *  -true si encuentra el email en la base de datos y msg: Se ha encontrado el usuario con ese email.
 *  -false si no encuentra el email y msg: Email no encontrado.
*/
export async function findByEmail(email: UserEmail): Promise<{ email: UserEmail, name: UserName, id: UserID } | null>
{
  var userSearched: any = await userModel.findOne({ email: email });
  if (userSearched.email == email)
  {
    return { email: userSearched.email, name: userSearched.name, id: userSearched.id };
  }
    return null;
}

/**
* da la lista de amigos de una persona
* parametros → id de mongodb
* devuelve →
 *  -true y la lista de amigos de la persona y msg: Lista de amigos.
*/
export async function getFriendOfPerson(userId: UserID): Promise<Array<User>>
{
  const userSearched = await findById(userId);
  let friends: Array<User> = [];
  if (userSearched != null)
  {
    for (const idAmigo of userSearched.friends)
    {
      let friendSearched = await findById(idAmigo)
      if (friendSearched != null) {
        friends.push({
          email: friendSearched.email,
          name: friendSearched.name,
          id: friendSearched.id
        })
      }
    }
  }
  return friends;
}

/**
* envia una solicitud de amistad a una persona
* parametros → id de la persona que envia la solicitud y el correo de la persona a la que se le envia la solicitud
* devuelve → unos json que te dan informacion del lo que ha pasado con su solicitud:
 1: correo de la persona a la que envias solicitud no existe
 2: tus array de amigos ya esta lleno (max 20 amigos)
 3: la lista de amigos de la persona y aesta llena (max 20 amigos)
 4: persona a la que le envias la solicitud ya la tienes agregada
 5: persona a la que le envias la solicitud ya se la hais enviado previamente
 6: petición de amistad enviada correctamente
*/
export async function sendFriendRequest(pIdUser: string, pEmailFriend: string): Promise<{ status: boolean, reason: string, friendId?: UserID }> {
  let friend = await userModel.findOne({ email: pEmailFriend })
  
  if (friend != null) {
    if (pIdUser == friend.id) {
      return ({ status: false, reason: "No puedes enviarte una petición a ti mismo."})
    }
  let user = await userModel.findOne({ _id: pIdUser })
    if (user != null) {
      if (user.friends.length >= 20) {
        return ({ status: false, reason: "Tu lsita de amigos ya esta llena." })
      }
      if (friend.friends.length >= 20) {
        return ({ status: false, reason: "La lista de amigos de la persona ya esta llena." })
      }
      let friendId = friend.id
        let found = user.friends.some((friend_id: any) => friend_id == friendId);
        if (found) {
          return ({ status: false, reason: "Esta persona ya esta en tu lista de amigos." })
        }
        else {
          let foundSent = user.sentRequests.some((friend_id: any) => { return (friend_id) == (friendId) });
          if (foundSent) {
            console.log("Peticiones de amist"+user.sentRequests)
            return ({ status: false, reason: "Petición de amistad ya enviada." })
          }
          else {
            await userModel.updateOne({ _id: pIdUser }, { $push: { sentRequests: friend.id } })
            await userModel.updateOne({ _id: friend.id }, { $push: { receivedRequests: user.id  } })
            return ({ status: true, reason: "Petición de amistad enviada correctamente.", friendId: friend.id})
          }
        }
      
    }
  }
  return ({ status: false, reason: "El correo introducido no está registrado." });
}

/**
* da la lista de solicitudes de amistad de una persona
* parametros → id de mongodb
* devuelve → devuelve un array con la lista de personas que le han enviado solicitud
*/
export async function getReceivedRequests(userId: UserID): Promise<Array<FriendRequest>> 
{
  const userSearched = await findById(userId);
  let receivedRequests:Array<FriendRequest> = [];
  if(userSearched != null)
  {
    for (const requestUserId of userSearched.receivedRequests)
    {
      let friendSearched = await findById(requestUserId);
      if (friendSearched != null)
        receivedRequests.push({ name: friendSearched.name, id: friendSearched.id });
    }
  }
  return receivedRequests;
}

/**
* agrega un amigo a la lista de amigos de una persona pasando los ids de las personas
* parametros → id de las ambas personas
* devuelve → true cuando se agrega al amigo
*/
export async function acceptFriend(userId: UserID, friendId: UserID) {
  let userSearched = await findById(userId);
  let friendSearched = await findById(friendId);
  if (userSearched != null && friendSearched != null) {
    if (userSearched.friends.length >= 20) {
      await userModel.findOneAndUpdate({ _id: userId }, { $pull: { receivedRequests: friendId } }, { new: true });
      await userModel.findOneAndUpdate({ _id: friendId }, { $pull: { sentRequests: userId } }, { new: true });
      return { status: false, reason: "Tu lista de amigos ya esta llena." }

    } else if (friendSearched.friends.length >= 20) {
      await userModel.findOneAndUpdate({ _id: userId }, { $pull: { receivedRequests: friendId } }, { new: true });
      await userModel.findOneAndUpdate({ _id: friendId }, { $pull: { sentRequests: userId } }, { new: true });
      return { status: false, reason: "La lista de amigos de la otra persona ya esta llena." }
    } else {
      await userModel.updateOne({ _id: userId }, { $push: { friends: friendId } });
      await userModel.updateOne({ _id: friendId }, { $push: { friends: userId } });
      await userModel.findOneAndUpdate({ _id: userId }, { $pull: { receivedRequests: friendId } }, { new: true });
      await userModel.findOneAndUpdate({ _id: friendId }, { $pull: { sentRequests: userId } }, { new: true });
      return { status: true, reason: "Petición de amistad aceptada." }
    }
  }
  else return { status: false, reason: "No se han encontrado los usuarios."}
}

/**
* rechazas una solicitud de amistad
* parametros → id de las ambas personas
* devuelve → true cuando rechazas correctamente la solicitud
*/
export async function declineFriend(userId: UserID, friendId: UserID)
{
  await userModel.findOneAndUpdate({ _id: userId }, { $pull: { receivedRequests: friendId } }, { new: true });
  await userModel.findOneAndUpdate({ _id: friendId }, { $pull: { sentRequests: userId } },{ new: true });
    return { status: true, reason: "Petición de amistad rechazada." }
}

/**
* Eliminar una amigos de la lista de amigos
* parametros → id de las ambas personas
* devuelve → true cuando rechazas correctamente la solicitud
*/
export async function removeFriend(pIdUser: string, pIdFriend: string) { //eliminar un amigo del array de amigos
    if (pIdFriend.match(/^[0-9a-fA-F]{24}$/)) {
        await userModel.findOneAndUpdate({ _id: pIdUser }, { $pull: { friends: pIdFriend } }, { new: true });
        await userModel.findOneAndUpdate({ _id: pIdFriend }, { $pull: { friends: pIdUser } }, { new: true });
        return { status: true, reason: "Amigo eliminado correctamente." }
    }
    return { status: false, reason: "Amigo eliminado correctamente." }
}

export async function getUsersFromId(arrayId: Array<UserID>)
{
  let listaAmigos: Array<DBUser | null> = await userModel.find({ _id: { $in: arrayId } });
}

export async function changeField(pIdUser: string, pFieldName: string, pNewValue: string, pCurrentPassword = null) {
  switch (pFieldName) {
    case "email":
      var vUserSearched: any = await userModel.findOne({ email: pNewValue }).exec();
      if (vUserSearched == null) {
        await userModel.updateOne({ _id: pIdUser }, { $set: { email: pNewValue } })
        return { status: true, reason: "Email actualizado con exito." }
      }
      else {
        return { status: false, reason: "Este email ya está registrado." }
      }
    case "username":
      await userModel.updateOne({ _id: pIdUser }, { $set: { name: pNewValue } });
      return { status: true, reason: "Nombre de usuario actualizado con éxito." }
    case "password":
      var vUserSearched: any = await userModel.findOne({ _id: pIdUser });
      console.log(JSON.stringify(vUserSearched));
          let vUserPassDes = cryptoJS.AES.decrypt(vUserSearched.password, secretKey).toString(cryptoJS.enc.Utf8);
      if (vUserPassDes == pCurrentPassword) {
        console.log("dentro de la condicion");
        await userModel.updateOne({ _id: pIdUser }, { $set: { password: cryptoJS.AES.encrypt(pNewValue, secretKey).toString() } });
        return { status: true, reason: "Contraseña actualizada correctamente." }
      } else {
        return { status: false, reason: "La contraseña actual no es correcta." }
      }
  }
  return { status: false, reason: "Eliminacion realizada." }
}
