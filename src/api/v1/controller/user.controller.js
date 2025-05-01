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