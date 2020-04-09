const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  const headers = await req.headers["auth_token"];
  console.log("auth", headers);

  if (!headers) return res.sendStatus(401);

  const token = await headers.split(" ")[1];

  await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
    if (err) {
      console.log(err.message);

      if (err.message === "jwt expired") {
        return res.json({ err: err.message });
      }
      return res.redirect("http://localhost:3000/login");
    }

    req.user = payload;
    return next();
  });
};
