const express = require("express");
const router = express.Router();
const User = require("../Model/User");
const Board = require("../Model/board");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const auth = require("../config/auth");

//login page
router.get("/login", (req, res) => {
  res.render("login");
});

//SignUp page
router.get("/signup", (req, res) => {
  res.render("signup");
});

//Get baords
router.get("/boards", auth.ensureAuthenticated, async (req, res) => {
  userBoards = await Board.find({ user_id: req.user._id });

  res.render("boards", {
    boards: userBoards,
  });
});

//Create board
router.post("/createboard", auth.ensureAuthenticated, async (req, res) => {
  try {
    const boardAlreadyExsists = await Board.findOne({
      user_id: req.user._id,
      name: req.body.name,
    });

    if (boardAlreadyExsists) {
      req.flash("error_msg", "baord already exsists");
      return res.redirect("/users/boards");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Something went wrong" });
  }
  const newboard = new Board({
    name: req.body.name,
    user_id: req.user._id,
  });
  try {
    req.flash("success_msg", "board created succesfully");
    await newboard.save();
    // console.log(newTask)
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Something went wrong" });
  }
  console.log("Mohanned the ponderer")
  res.redirect("/users/boards");
});

//Login action
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/users/boards",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

//SignUp action
router.post("/signup", async (req, res) => {
  const { name, username, password } = req.body;

  if (await User.exists({ username: username })) {
    // console.log(await User.exists({username:username}))
    req.flash("error_msg", "User already exsists");
    res.redirect("/users/signup");
  } else {
    const newUser = new User({
      name,
      username,
      password,
    });

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;

        newUser.password = hash;

        newUser
          .save()
          .then((user) => {
            req.flash("success_msg", "Successfulyy logged in");
            res.redirect("/users/login");
          })
          .catch((err) => {
            console.log(err);
          });
      });
    });
    req.flash("success_msg", "User created successfully, please log in");
    res.redirect("/users/login");
  }
});

//get User
async function getUser(req, res, next) {
  let user;
  try {
    user = await User.findOne({
      UserName: req.body.UserName,
      Password: req.body.password,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ msg: "Something went wrong" });
  }

  next();
}
//Logout handle
router.get("/logout", (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success_msg", "successfully logged out");
    res.redirect("/users/login");
  });
});
module.exports = router;
