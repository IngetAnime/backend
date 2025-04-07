import express from "express";
import auth from "./auth.routes.js";

export default (app) => {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.send('Ok');
  })

  router.use('/auth', auth);

  app.use('/api/v1', router);
}