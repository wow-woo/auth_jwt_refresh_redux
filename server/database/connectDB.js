const mongoose = require("mongoose");

module.exports = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useCreateIndex: true,
      useNewUrlParser: true,
      useFindAndModify: true,
    });

    console.log("mongoDB connected");
  } catch (err) {
    console.log(err.message);
  }
};
