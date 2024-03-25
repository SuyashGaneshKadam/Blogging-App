const AccessSchema = require("../Schemas/AccessSchema");

const rateLimiting = async (req, res, next) => {
  const sessionId = req.session.id;
  try {
    const accessDb = await AccessSchema.findOne({ sessionId });
    if (!accessDb) {
      const accessObj = new AccessSchema({
        sessionId,
        time: Date.now(),
      });
      await accessObj.save();
      next();
      return;
    }
    const diff = Date.now() - accessDb.time;
    if (diff < 5000) {
      return res.send({
        status: 400,
        message: "Too many requests, please try after some time!",
      });
    }
    await AccessSchema.findOneAndUpdate({ sessionId }, { time: Date.now() });
    next();
  } catch (err) {
    return res.send({
      status: 500,
      message: "Database error",
      err,
    });
  }
};

module.exports = rateLimiting;
