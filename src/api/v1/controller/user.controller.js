import * as services from '../services/user.service.js';

export const getUserDetail = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id)
    const data = await services.getUserDetail(userId);
    res.status(200).json({ ...data });
  } catch(err) {
    console.log("Error in the getUserDetail controller", err);
    next(err);
  }
}

export const getAnimeList = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const { status, sort } = req.query;
    const data = await services.getAnimeList(userId, status, sort);
    res.status(200).json(data);
  } catch(err) {
    console.log('Error in the getAnimeList controller');
    next(err);
  }
}

export const importAnimeList = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const { isSyncedWithMAL, type } = req.body;
    const data = await services.importAnimeList(userId, isSyncedWithMAL, type);
    res.status(200).json(data);
  } catch(err) {
    console.log('Error in the importAnimeList controller');
    next(err);
  }
}