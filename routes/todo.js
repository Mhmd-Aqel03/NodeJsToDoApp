const express = require("express");
const router = express.Router();
const todos = require("../Model/ToDo");
const auth = require('../config/auth')

router.get("/", auth.ensureAuthenticated ,async (req, res) => {
  Data = await todos.find({user_id: req.user._id});

  // console.log(Data)
  res.render("todo", {
    todos: Data,
  });
});

//Create task
router.post("/", auth.ensureAuthenticated, async (req, res) => {
  try{ 
  const taskAlreadyExsists = await todos.findOne({user_id:req.user._id, task:req.body.task})

  if(taskAlreadyExsists){
    req.flash('error_msg', 'Task already exsists')
    return res.redirect('/todo')
  }
  }catch (err){
    console.log(err);
    return res.status(500).json({ msg: "Something went wrong" });
  }
  const newTask = new todos({
    task: req.body.task,
    user_id: req.user._id
  });
  try {
    req.flash('success_msg', 'Task created succesfully')
    await newTask.save();
    // console.log(newTask)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ msg: "Something went wrong" });
  }

  res.redirect("/todo/");
});

//Check task
router.post("/check", async (req, res) => {
  let task;
  try {
    // console.log(req.body.task);
    task = await todos.findOne({ user_id:req.user._id, task: req.body.task });

    task.status = false;

    await task.save();
  } catch (err) {
    console.log(err)
    return res.status(500).json({ msg: "Something went wrong" });
  }

  res.redirect("/todo/");
});
//Reset Handler (delete all user tasks)
router.get('/reset',async (req,res) =>{
  try{
    const numOfDeletedTasks = await todos.deleteMany({user_id: req.user._id})

    // console.log(numOfDeletedTasks.deletedCount);

    req.flash("success_msg", `deleted ${numOfDeletedTasks.deletedCount} Tasks`);

    res.redirect('/todo')
  }catch(err){
      console.log(err);
      return res.status(500).json({ msg: "Something went wrong" });
  }
})
router.post('/delete', async (req,res) => {
  try {
    await todos.deleteOne({user_id:req.user._id, task:req.body.task})

    req.flash("success_msg", `succesfully deleted ${req.body.task}`);

    res.redirect("/todo");
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Something went wrong" });
  }
})
module.exports = router;
