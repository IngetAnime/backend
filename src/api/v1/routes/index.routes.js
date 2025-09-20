import express from "express";
import auth from "./auth.routes.js";
import mal from "./mal.routes.js";
import platform from "./platform.routes.js";
import animeList from "./animeList.routes.js"
import anime from "./anime.routes.js";
import user from "./user.routes.js";

export default (app) => {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.send('Ok');
  })

  router.use('/auth', auth);
  router.use('/anime', platform);
  router.use('/anime', animeList);
  router.use('/anime', anime);
  router.use('/anime', mal);
  router.use('/user', user);

  app.use('/api/v1', router);
}