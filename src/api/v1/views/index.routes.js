import express from 'express';
import mal from './mal/mal.routes.js';
import google from './google/google.routes.js';

export default (app) => {
  const router = express.Router();

  router.use('/mal', mal);
  router.use('/google', google);
  
  app.get('/', (req, res) => {
    res.render('index', { 
      title: 'Dashboard', message: `Selamat datang di ${process.env.APP_NAME}` 
    });
  })
  app.use('/', router);
}