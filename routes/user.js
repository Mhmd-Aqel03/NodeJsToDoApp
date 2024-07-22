const express = require("express");
const router = express.Router();
const User = require("../Model/User");
const bcrypt = require('bcryptjs')
const passport = require('passport')
//login page
router.get("/login", (req, res) => {
  res.render("login");
});

//SignUp page
router.get("/signup", (req, res) => {
  res.render("signup");
});

//Login action
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/todo",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

//SignUp action
router.post("/signup", async (req, res) => {
  const {name, username, password} = req.body

  if(await User.exists({username:username})){
    // console.log(await User.exists({username:username}))
    req.flash('error_msg', 'User already exsists')
    res.redirect('/users/signup')
  }else{
    const newUser  = new User ({
      name,
      username,
      password
    })

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
    res.redirect('/users/login')
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
