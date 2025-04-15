import express from "express";
import auth from "./auth.routes.js";
import mal from "./mal.routes.js";
import platform from "./platform.routes.js";
import anime from "./anime.routes.js";
import schedule from "./schedule.route.js";

export default (app) => {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.send('Ok');
  })

  router.use('/auth', auth);
  router.use('/mal', mal);
  router.use('/platform', platform);
  router.use('/anime', anime);
  router.use('/schedule', schedule);

  app.use('/api/v1', router);
}