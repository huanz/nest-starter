import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import * as passport from 'passport';
import * as ejs from 'ejs';

import { AppModule } from './app.module';
import Config from './config';
import { TypeormStore } from './utils/session.store';

(async () => {
  const app = await NestFactory.create(AppModule);
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(compression());
  app.set('trust proxy', true);
  app.use(cookieParser(Config.cookie));
  const sessionOptions: session.SessionOptions = Object.assign(Config.session);
  if (Config.isProd) {
    sessionOptions.store = new TypeormStore({
      repository: 'session',
    });
  }
  app.use(session(sessionOptions));
  app.use(passport.initialize());
  app.use(passport.session());

  app.useStaticAssets(join(__dirname, 'public'));
  app.setBaseViewsDir(join(__dirname, 'views'));
  app.engine('html', ejs.__express);
  app.setViewEngine('html');

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(Config.port);
})();
