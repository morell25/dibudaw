import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import * as user from 'models/user';
import * as mongoose from 'mongoose';
import * as cryptoJS from 'crypto-js';
import { secretKey } from 'models/user';
import * as nodemailer from 'nodemailer';
var userMailer:string = "dibudaw@gmail.com";
var userPass:string = "Acho123456.";

const transportes = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: userMailer,
    pass: userPass
  }
});

function welcomeMail(pReceiver:string, pUsername:string){
  return {
  from: userMailer,
  to: pReceiver ,
  subject: 'Bienvenido a dibudaw ' +  pUsername,
  html: `<h1>Bienvenido a dibudaw</h1>
  <p>Vamos a jugar un raton <a href="http://localhost:4200/main/home">dibudaw</a></p>
  <p>  Esta pagina esta realizada por alumnos de un grado superior si tiene algun bug  es lo que hay</p>`
}
}
const RSA_PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAqdx/Az84w137KOKpNMsanIxqH6RUq8Kc/N3Cmv3L8zGBAHyU
myat0+UyAJ+aYRr7KZpr8A47NcegAO07JXFrs4F1IRk3IFgpKQ0OzibxsrRvqRKs
EbLcX1HSAWDMfymM59ZYVkI4AmdLYphBrtrl2bSS1cO13AFXZ6DEcLC1acfSyURs
Lkmlt810+95AuhK0vWp6ouWdc5Nfb/IyHjL7bJF4dfWumMhtx/jza+fkiow9bfQq
m2/62W0cj/UiiNeGbLDe5UEss6WCCYYesraib0FlArNuBzAyoF8VJcIVWdXmhhLJ
zZSN9NEp0792QKaHFsHMFAkcoEDQ0b4NcYfSRwIDAQABAoIBAGHIQ/m7iFK3JGGJ
8bwpe31JO8JRWEi0NKlAg8mzdpfeFJQSI34ZSxHjK+C+ACIMZS+y7JX5q04vR8Wg
y16np0djq+jM2jYtaixujupP8u1b/7eFvzZFD6VztYADmFVPtwSzGJE3d4Syr+vn
GFCvRIgJ8klKa8NlpkpKeysgHp7wb8jQfszvnkvWYyiasrerg65VDDZ2J1AiROeg
24/QwnhCbM2Kdi/OjDFfiZ2FjP4S074ZcTk1PkVD30IAXQJMglYlLFQt0qtTPIka
BkMlQZWtSgL05JHvzE3HEtBLOLSwZZzvnoWCGGBHoWUoQ+GTmyaS7x75jycUIQSY
KXOu41kCgYEA3JZuqmjGGWPlhp02sFc0OpRYfu9dVSXID1eJHGAHcMuetjbj9pd8
dphdqBQrGsrePDSDNN6/7ocG8EUhfBWfhZLM9gsYCiWjHqGTsIRr2B60BgSj8JbQ
Z6or2OH1h4z/+xH5c7Jpy81Z56yqiffHyq/QTAQcmx9rrARYx5Q19+UCgYEAxSFY
vCnpHr6Aw1XorSXYO2iH63ywT+pVdeDTFNQ6VQk1qFGgQj1DR68YnFXLr41YbRht
l5Gp85CIp2I/FGECbv2Li11dqA9rALGZzSMiFB1908++IkvKYtN9QWKuFiu3xPFp
58WD3hn53qL5sTCkZu353nNNDqOkCSjibs2U5rsCgYB2MDu3HlAVxopyJ8XnkbGw
OU95I3MUbhvU7IfQJjuWWeL9qkdWFjBfsp9rsPKvdkbAZzptl3Oqr7ot/jxEqalA
/jjHE4ab2TKe9N+W0jyeHUVDfDUCcSvUfz7jA550ND3rHeRT8yHwSmSDVuZA6fuo
Q68NK57QFnOwRNv0gxqvaQKBgQCsf5WqcfIwmPsL8yz79tXUhpAJnL6b766AzA9p
dpzktH5jn6ngzMMHA01B4EGwiLsMHAgqTaiuHZe3AN2583mxreRiO30tBvDXVpID
U+8KMxRcOLlkQXYELJS6lqNHe1H/4FCQI+JUg96G144vYyU5fJzd739KhB+SdFhQ
JU1a6QKBgQCW02MxXLnkXX8mjCC8/qBbpUfI8G1DrDUvIPkTYsW7jp/wtXVDH+3K
pm8Kpls/3kc6ZdXoV/SydZxVIQmXYP+o1W3PWFd1rUymBI7gg+KNVm/Y0xo5DyMo
BhkJc3S3176Py1hOU9ZkOQVjx/Pj94MtzcyLP7SWfBegj0F14GZPDw==
-----END RSA PRIVATE KEY-----`;
const router: express.Router = express.Router();

router.post('/login', async (req: express.Request, res: express.Response) => {
  let loginResult = await user.login(req.body.email, req.body.password, secretKey);
  if (loginResult.status) {
    let vUser = await user.findByEmail(req.body.email);
    if (vUser != null) {
      const jwtBearerToken = jwt.sign({}, RSA_PRIVATE_KEY, {
        algorithm: 'RS256',
        expiresIn: '365d',
        subject: vUser.id.toString()
      });
      var now = new Date();
      res.cookie('session', jwtBearerToken, {
        expires: new Date(now.getFullYear() + 1, now.getMonth(), 0), httpOnly: true
      });
      res.json({ status: 'valid', reason: loginResult.reason });
    }
    else {
      res.json({ status: 'invalid credentials', reason: loginResult.reason });
    }
  }
  else {
    res.json({ status: 'invalid credentials', reason: loginResult.reason });
  }
});


router.get('/logout', (req: express.Request, res: express.Response) => {
  res.cookie('session', {}, { expires: new Date() });
  res.json({ status: 'logged out', reason: 'Se ha cerrado sesión correctamente.' });
});

router.post('/register', async (req: express.Request, res: express.Response) => {
  let registerResult = await user.register(req.body.username, req.body.email, req.body.password, secretKey);
  if (registerResult.status) {
    res.json({ status: "registered", reason: registerResult.reason });
    transportes.sendMail(welcomeMail(req.body.email, req.body.username));
  } else {
    res.json({ status: "no registered", reason: registerResult.reason });
  }
});

router.get('/status', async (req: express.Request, res: express.Response) => {

  if (req.cookies['session']) {
    await jwt.verify(req.cookies['session'], RSA_PRIVATE_KEY, {
      algorithms: ['RS256']
    }, async (err: any, decoded: any) => {
      if (err) {
        console.log(err);
        res.json({ status: 'error',  })
      }
      else {
        res.json({ status: 'connected', user: await user.findById(decoded.sub) });
      }
    });
  }
  else {
    res.json({ status: 'disconnected' })
  }
});





export default router;
