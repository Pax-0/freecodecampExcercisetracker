const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const moment = require('moment');

let users = []
app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
function isBefore(targetDate, log){
  let cutoffDate = moment(targetDate);
  return moment(log.date).isBefore(moment(cutoffDate));
}
function isAfter(targetDate, log){
  let cutoffDate = moment(targetDate);
  return moment(log.date).isAfter(moment(cutoffDate));
}
app.post('/api/users', (req, res) => {
  let user = new Object({username: req.body.username, _id: new String(users.length)});
  users.push(user);
  return res.json(user);
});

app.post('/api/users/:_id/exercises', (req, res) => {  
  let user = users[req.params._id]
  if(!user)return res.json({error: 'user not found'});
  let exercise = { username: user.username, description: req.body.description, duration: parseInt(req.body.duration), _id: user.exercises ? user.exercises.length : 0};
  exercise.date = req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString();
  if(user.exercises){
    user.exercises.push(exercise)
  }else{
    user.exercises = [exercise]
  }
  //user.exercises = user.exercises ? ) : ;

  let index = users.indexOf(user);
  users[index] = user;

  return res.json({
    "_id": user._id,
    "username": user.username,
    "date": exercise.date,
    "duration": exercise.duration,
    "description": exercise.description
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  
  let user = users[req.params._id]
  if(!user)return res.json({error: 'user not found'});
  //user.exercises = user.exercises ? ) : ;

  let index = users.indexOf(user);
  users[index] = user;
  let filteredLogs = user.exercises
  if(req.query.from) filteredLogs = filteredLogs.filter(l => isAfter(req.query.from, l));
  if(req.query.to) filteredLogs = filteredLogs.filter(l => isBefore(req.query.to, l));

  if(req.query.limit) filteredLogs = filteredLogs.slice(0, req.query.limit);

  return res.json({
    username: user.username,
    count: user.exercises.length,
    _id: user._id,
    log: filteredLogs
  });
});
app.get('/api/users', (req, res) => {
  console.log(req.query)

  let limit = req.query.limit
  let formattedUsers = users.map( (u) => {
    return {username: u.username, _id: u._id}
  });
  if(limit){
    let wantedNumberOfUsers = formattedUsers.slice(0,limit);
    return res.json(wantedNumberOfUsers);
  }
  return res.json(formattedUsers);

});

app.get('/api/users/:user_id', (req, res) => {  
  let user = users[req.params.user_id];

  if(user){
    return res.json(user);
  }
  
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
