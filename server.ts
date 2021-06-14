import 'zone.js/dist/zone-node';
import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { join } from 'path';
import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';


import * as sockets from 'socket-server';
import * as social from 'social-server';
import * as morgan from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import * as cors from 'cors';
import routes from 'routes/main';

mongoose.connect('mongodb+srv://alcansoler:Acho.123456@cluster0.prnfy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});




export function app(): express.Express {
  const server = express();

  //Middlewares:
  server.use(morgan('combined'));
  server.use(cookieParser());
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(cors({ origin: true, credentials: true, exposedHeaders: ['Set-Cookie', 'set-cookie'] }));
  
  //Routes:
  server.use('/api', routes);



  //Angular SSR config:
  const distFolder = join(process.cwd(), 'dist/dibudaw/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
  }));
  server.set('view engine', 'html');
  server.set('views', distFolder);
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));
  server.get('*', (req, res) => {
    res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
  });


  return server;
}




function run(): void {


  const expressPort = process.env.PORT;
  const expressServer = app();
  expressServer.listen(expressPort, () => {
    console.log(`expressServer escuchando en el puerto ${expressPort}`);
  });


}





declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';
