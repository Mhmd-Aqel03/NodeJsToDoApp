const express = require("express");
const router = express.Router();
const todos = require("../Model/ToDo");
const auth = require("../config/auth");

router.get("/:board", auth.ensureAuthenticated, async (req, res) => {
  Data = await todos.find({ board_name: req.params.board });

  // console.log(Data)
  req.session.board = req.params.board;
  await req.session.save();
  // console.log(req.session.board, req.params.board);
  res.render("todo", {
    todos: Data,
  });
});

//Create task
router.post("/", auth.ensureAuthenticated, async (req, res) => {
  console.log(req.session.board);
  // req.session.board = req.params.board;

  try {
    const taskAlreadyExsists = await todos.findOne({
      board_name: req.session.board,
      task: req.body.task,
    });

    if (taskAlreadyExsists) {
      req.flash("error_msg", "Task already exsists");
      return res.redirect("/todo");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Something went wrong" });
  }
  const newTask = new todos({
    task: req.body.task,
    board_name: req.session.board,
  });
  try {
    req.flash("success_msg", "Task created succesfully");
    await newTask.save();
    // console.log(newTask)
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Something went wrong" });
  }

  res.redirect(`/todo/${req.session.board}`);
});

//Check task
router.post("/check", async (req, res) => {
  let task;
  try {
    // console.log(req.body.task);
    task = await todos.findOne({
      board_name: req.session.board,
      task: req.body.task,
    });

    task.status = false;

    await task.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Something went wrong" });
  }

  res.redirect(`/todo/${req.session.board}`);
});
//Reset Handler (delete all user tasks)
router.get("/reset", async (req, res) => {
  try {
    const numOfDeletedTasks = await todos.deleteMany({
      board_name: req.session.board,
    });

    // console.log(numOfDeletedTasks.deletedCount);

    req.flash("success_msg", `deleted ${numOfDeletedTasks.deletedCount} Tasks`);

    res.redirect(`/todo/${req.session.board}`);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Something went wrong" });
  }
});
router.post("/delete", async (req, res) => {
  try {
    await todos.deleteOne({
      board_name: req.session.board,
      task: req.body.task,
    });

    req.flash("success_msg", `succesfully deleted ${req.body.task}`);

    res.redirect(`/todo/${req.session.board}`);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Something went wrong" });
  }
});
module.exports = router;
