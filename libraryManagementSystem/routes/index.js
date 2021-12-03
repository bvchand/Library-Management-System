var express = require('express');
var router = express.Router();
var cassandra = require('cassandra-driver');
var cors = require('cors')
var app = express()
app.use(cors())
var client = new cassandra.Client({contactPoints: ['127.0.0.1'],localDataCenter:'datacenter1'});

// const cors = require('cors');

// Add headers
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  // Pass to next layer of middleware
  next();
});

app.options('*', cors({
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Headers', 'Allow'],
  methods: ['POST', 'DELETE', 'GET', 'PUT', 'OPTIONS']
}));

client.connect(function(err, result){
  console.log('got into index.js');
});

// express().listen(process.env.PORT || 3000, () => console.log('App available on http://localhost:3000'));

var getAllSubs = 'Select * from lms.Books';

/* GET home page. */
router.get('/', function(req, res, next) {
  client.execute(getAllSubs,[],function(err,result){
    // console.log("\n\n err:", err);
    // console.log("\n\n result:", result);
    if(err){
      res.status(404).send({message: err});
    } else {
      res.send({Books: result.rows});
    }
  });
});



module.exports = router;
