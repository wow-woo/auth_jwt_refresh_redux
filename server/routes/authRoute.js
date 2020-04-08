const router = require("express").Router();
const User = require("../database/models/User");
const jwt = require("jsonwebtoken");
const auth = require("../utils/auth");

//register user
//public
//path:  api/auth/register
router.post("/register", async (req, res) => {
  try {
    const isMatched = await User.findOne({ email: req.body.email });

    if (isMatched) return res.redirect("http://localhost:3000/register");

    await User.create(req.body);

    return res.redirect("http://localhost:3000/login");
  } catch (err) {
    console.log(err.message);
    return res.redirect("http://localhost:3000/");
  }
});

//log user in
//public
//path:  api/auth/login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.redirect("http://localhost:3000/login");

    const validPassword = await user.comparePW(req.body.password);

    if (!validPassword) return res.redirect("http://localhost:3000/login");

    const accessToken = await jwt.sign(
      { id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "5s",
      }
    );
    const refreshToken = await jwt.sign(
      { email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      }
    );

    console.log("log tokens issued");

    await res.cookie("refresh", refreshToken, {
      httpOnly: true,
    });
    res.json({ accessToken });
  } catch (err) {
    console.log(err.message);
  }
});

//refresh token
//public
//path:  api/auth/refresh_access_token
router.get("/refresh_access_token", async (req, res) => {
  try {
    const refreshToken = await req.cookies["refresh"];
    console.log("old refresh token", refreshToken);

    const payload = await jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    if (!payload) return res.redirect("http://localhost:3000/login");

    const user = await User.findOne({ email: payload.email });
    if (!user) return res.json({ success: false, msg: "invalid token" });

    const newAccessToken = await jwt.sign(
      { id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "5s" }
    );

    const newRefreshToken = await jwt.sign(
      { email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // res.clearCookie("refresh");
    res.cookie("refresh", newRefreshToken, {
      httpOnly: true,
    });
    res.json({ success: true, accessToken: newAccessToken });
  } catch (err) {
    console.log(err.message);
    return res.sendStatus(500);
  }
});

// my page info
//private
//path:  api/auth/mypage
router.get("/user", auth, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id }).select("-password");

    if (!user) return res.json({ success: false, msg: "no data for token" });

    res.status(200).json({ success: true, user });
  } catch (err) {
    if (err) {
      console.log(err.message);
      return res.sendStatus(500);
    }
  }
});

// log user out
//private
//path:  api/auth/logout
router.get("/logout", auth, async (req, res) => {
  try {
    res.clearCookie("refresh");
    return res.sendStatus(200);
  } catch (err) {
    if (err) {
      console.log(err.message);
      return res.sendStatus(500);
    }
  }
});

module.exports = router;
