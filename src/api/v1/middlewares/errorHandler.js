import customError from "../utils/customError.js";

export default (err, req, res, next) => {
  if (err instanceof customError) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...(err.error && { error: err.error })
    });
  } else {
    console.log(err);
    return res.status(500).json({
      message: "Internal server error",
      error: err
    })
  }
}