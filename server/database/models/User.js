const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    trim: true,
  },
  displayname: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    trim: true,
  },
});

UserSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(this.password, salt);

  return (this.password = hashed);
});

UserSchema.method("comparePW", async function (password) {
  const result = await bcrypt.compare(password, this.password);

  return result;
});

module.exports = mongoose.model("User", UserSchema);
