// var createError = require('http-errors');
var express = require('express');
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

const app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// app.use(logger('dev'));
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
// app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

// process.env.JWT_SECRET = 'gfg_jwt_secret_key';
// process.env.TOKEN_HEADER_KEY = 'gfg_token_header_key';

console.log(process.env.JWT_SECRET);

var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost', 
  user: 'root', 
  password: 'root',
  database: 'softsuave'
});

// var sql;
// var values;

// connection.connect(function(err) {
//   if(err) throw err;
//   console.log('connected');
//   sql = "SELECT * FROM informations";
//   values = [
//     ['1', 'abcd', 'xyz', '20'], 
//     ['2', 'ajb', 'abc', '20'], 
//     ['3', 'abjbc', 'afaf', '25'], 
//     ['5', 'ddsvdsv', 'sdvdv', '56']
//   ]
//   connection.query(sql, (err, result) => {
//     if(err) throw err;
//     console.log(result);
//   })
// });

// var sql = `ALTER TABLE informations ADD COLUMN id INT PRIMARY KEY AUTO_INCREMENT UNIQUE`;
// connection.query(sql, (err, result) => {
//   if(err) throw err;
//   console.log(result);
// });

app.post('/user/generateToken', (req, res) => {
  let jwtSecretKey = process.env.JWT_SECRET_KEY;
  let data = {
    time: Date(),
    userId: 12
  }
  const token = jwt.sign(data, jwtSecretKey);
  res.send(token);
});

app.get('/user/validateToken', (req, res) => {
  let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
  let jwtSecretKey = process.env.JWT_SECRET_KEY;

  try {
    const token = req.header(tokenHeaderKey);
    const verified = jwt.verify(token, jwtSecretKey);
    if(verified) {
      return res.send('successfully verified');
    } else {
      return res.status(401).send(error);
    }
  } catch(error) {
    return res.status(401).send(error);
  }
});

app.get('read/:id', (req, res) => {
  try {
    let sql = "SELECT * FROM informations WHERE id = ";
    let value = req.params.id;
    connection.query(`${sql} ${value}`, (err, result) => {
      if(err) throw err;
      if(result.length === 0) {
        return res.send(`id:${value} not found`);
      }
      return res.send(result);
    });
  } catch(err) {
    return res.send(err);
  }
});
 
let printCommment = (req, res, next) => {
  console.log("all the columns in the table is as follows: ");
  next();
}

app.use(printCommment);

app.get('/read', printCommment, (req, res) => {
  try {
    let sql = "SELECT * FROM informations ORDER BY id";
    connection.query(sql, (err, result) => {
      if(err) throw err;
      return res.send(result);
    });
  } catch(err) {
    return res.send(err);
  }
});


//get specific id
//try to return error if id is not found



// app.post('/post', (req, res) => {
//   let {id, name, occupation, age} = req.body;
//   let sql = id != undefined? `INSERT INTO informations(id, name, occupation, age) VALUES(${id}, '${name}', '${occupation}', ${age})` : `INSERT INTO informations(name, occupation, age) VALUES('${name}', '${occupation}', ${age})`;
//   connection.query(`${sql}`,[12,'fsdf'], (err, result) => {
//     if(err) throw err;
//   });
//   return res.send(req.body);
// });

app.post('/post', (req, res) => {
  let arr = [req.body];
  let { name, occupation, age} = req.body;
  let sql =`INSERT INTO informations( name, occupation, age) VALUES (?, ?, ?)`; 
  connection.query(`${sql}`,[name, occupation, age], (err, result) => {
    if(err) throw err;
  });
  return res.send(req.body);
});

// app.patch('/update', (req, res) => {
//   let {id, name, occupation} = req.body;
//   let sql = `UPDATE informations SET name = '${name}', occupation = '${occupation}' WHERE id = ${id}`;
//   connection.query(sql, (err, result) => {
//     if(err) 
//       throw err;
//   });
//   return res.send(req.body);
// });

app.patch('/update', (req, res) => {
  let {id} = req.body;
  for(let [k, v] of Object.entries(req.body)) {
    console.log(k + " " + v);
    if(v != undefined) {
      console.log(k + " " + v);
      let sql = `UPDATE informations SET ${k} = '${v}', WHERE id = ${id}`;
      connection.query(sql, (err, result) => {
        if(err) 
          throw err;
      });
    } else if(v === undefined) {
      continue;
    }
  }
  return res.send(req.body);
});


app.delete('/delete/:id', (req, res) => {
  let sql = 'DELETE FROM informations WHERE';
  let value = req.params.id;
  connection.query(`${sql} id = ${value}`, (err, result) => {
    if(err) throw err;
    return res.send(value);
  });
});

app.delete('/deleteAll', (req, res) => {
  let sql = 'DELETE FROM informations';
  connection.query(sql, (err, result) => {
    if(err) throw err;
    return res.send('all deleted');
  });
});



connection.connect((err) => {
  var server = app.listen(8000, 'localhost', function() {
      var host = server.address().address
      var port = server.address().port
      console.log("Example app listening at http://%s:%s", host, port);
  });
});
// module.exports = app;
//table : informations
//CREATE TABLE informations(id INT, name VARCHAR(200), occupation VARCHAR(200), age INT)
//INSERT INTO informations VALUES ?