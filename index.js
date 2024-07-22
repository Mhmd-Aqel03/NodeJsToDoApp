const express = require("express");
const exphdb = require("express-handlebars");
const mongoose = require("mongoose");
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const path = require('path')
const app = express();
const MongoStore = require('connect-mongo')
require("dotenv").config();
const log = (req, res, next) => {
  console.log("API called");
  next();
};

//passport config
require("./config/passport")(passport);
//db conn
mongoose.connect(
  process.env.DB_CON
);

const db = mongoose.connection;

db.on("error", (error) => {
  console.log(error);
});
db.once("open", () => {
  console.log("connected to db");
});
//Hanadle bars middleware
const hbs = exphdb.create({
  defaultLayout: "main",
  partialsDir: 'views/partials',
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
});


app.set("views", path.join(__dirname, "views"));
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

app.use(express.json());
//Web forms body parser
app.use(express.urlencoded({ extended: false }));
//todo route
// app.use(log);

//express session
// app.use(
//   session({
//     secret: "keyboard cat",
//     resave: true,
//     saveUninitialized: true,
//     cookie: {
//       maxAge:99999999999
//     }
//   })
// );
app.use(
  session({
    secret: "Bannaa",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.DB_CON,
      collectionName: "sessions",
    }),
  })
);

//connect flash
app.use(flash())
//Set Global vars using flash
app.use((req,res,next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    next()
})

//passport stuff
app.use(passport.initialize())
app.use(passport.session())

//To do route
app.use("/todo", require("./routes/todo"));
//User route
app.use('/users', require('./routes/user'))
//JSON body parser middleware

const PORT = process.env.PORT || 8000;

console.log(`Web server running on Port: ${PORT}`)

app.listen(PORT);
