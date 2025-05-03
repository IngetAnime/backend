import customError from "../utils/customError.js";

export default (err, req, res, next) => {
  console.log(err);
  if (err instanceof customError) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...(err.error && { error: err.error })
    });
  } else {
    return res.status(500).json({
      message: "Internal server error",
      error: err
    })
  }
}