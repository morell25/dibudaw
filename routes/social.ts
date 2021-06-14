import * as express from 'express';
import * as user from '../models/user';

const router: express.Router = express.Router();

router.post('/acceptFriend', async(req: express.Request, res: express.Response) =>{
    let status = await user.acceptFriend(req.body.id, req.body.pIdFriend)
    if(status)
    {
        res.json(status)
    }
});

router.post('/getFriends',  async(req: express.Request, res: express.Response) => {
    var friends = await user.getFriendOfPerson(req.body.id)
    res.json(friends)
});

router.post('/changeField', async (req: express.Request, res: express.Response) => {
  var changes = await user.changeField(req.body.id, req.body.fieldName, req.body.value, req.body.password)
  if (changes.status)
    res.json({ status: changes.status, reason: changes.reason });
  else
    res.json({ status: changes.status, reason: changes.reason });
});


export default router;
