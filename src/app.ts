import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import compressFilter from './utils/compressFilter.util';
import config from './config/config';
import { xssMiddleware } from './middleware/xssMiddleware';
import routes from "./routes";
import {Application} from "express";
import path from 'path';

export const initApp = (app: Application) => {
  // Helmet is used to secure this app by configuring the http-header
  app.use(helmet());

  // parse json request body
  app.use(express.json());

  // parse urlencoded request body
  app.use(express.urlencoded({ extended: true }));

  app.use(xssMiddleware());

  app.use(cookieParser());

// Compression is used to reduce the size of the response body
  app.use(compression({ filter: compressFilter }));


  app.use(
    cors({
      // origin is given a array if we want to have multiple origins later
      origin: String(config.cors.cors_origin).split('|'),
      credentials: true
    })
  );

  app.use("/api", routes)


  app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
      res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
      res.json({ error: '404 Not Found' });
    } else {
      res.type('txt').send('404 Not Found');
    }
  });

}
