import express from "express";
import auth from "./auth.routes.js";
import mal from "./mal.routes.js";

export default (app) => {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.send('Ok');
  })

  router.use('/auth', auth);
  router.use('/mal', mal);

  app.use('/api/v1', router);
}