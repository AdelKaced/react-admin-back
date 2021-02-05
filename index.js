const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');

const mysql = require('./config');

const app = express();

app.use(express.json());
app.use(morgan('tiny'))

app.use(cors({
  exposeHeaders: ['Content-Range','X-Content-Range', 'X-Total-Count'],
  origin: 'http://localhost:3001'
}));

app.use((req,res,next) => {
  const totalCount = req.headers['X-Total-Count'];
  res.set('X-Total-Count', totalCount);
  console.log(res);
  next()
})

app.post('/users', async (req, res) => {
  const body = {
    ...req.body,
    password: bcrypt.hashSync(req.body.password, 10)
  }
  try{
    const data = await mysql.query('INSERT INTO user SET ?', body);
    const result = await mysql.query('SELECT firstname, lastname, email, id FROM user WHERE id = ?', data[0].insertId);
    res.status(200).json(result[0]);
  } catch(e) {
    console.log(e.message);
    res.status(500).send('internal srerver error');
  }

})

app.get('/users', async (req, res) => {
  try{
    const result = await mysql.query('SELECT firstname, lastname, email, id FROM user');
    res.status(200).send(result[0])
  }catch(e) {
    res.status(500).send('Internal server error');
  }
})

app.post('/users/auth', async (req, res) => {
  try {
    console.log(req.body);
    const data = await mysql.query('SELECT * FROM user WHERE email = ?',req.body.email);
    if (!data[0].length) {
      return res.status(400).send('wrong email or password')
    }
    console.log(data[0][0].password, req.body.password);
    const isValid = bcrypt.compareSync(req.body.password, data[0][0].password)
    if(!isValid) {
      return res.status(401).send('Unauthorized')
    }
    jwt.sign({data: { id: data[0][0].id, firstname: data[0][0].firstname}}, 'stayAwhileAndListen', (err, token) => {
      res.status(201).json({auth: true, token});
    });
  } catch(e) {
    console.log(e);
    res.status(500).send('internal server error');
  }
})


app.listen(4000, () => {
  console.log("server listening on port : 4000");
});