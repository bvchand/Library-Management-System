var express = require('express');
var router = express.Router();
var cassandra = require('cassandra-driver');
var client = new cassandra.Client({contactPoints: ['127.0.0.1'],localDataCenter:'datacenter1'});

client.connect(function(err, result){
    if(err) {
        res.status(404).send({message: err});
      }
  });

var createMemberTableQuery = 'CREATE TABLE lms.member(mem_id uuid PRIMARY KEY, mem_name text, mem_address text, \
                         mem_date date, expiry_date date)';

var createPublisherTableQuery = 'CREATE TABLE lms.publisher(pub_id uuid PRIMARY KEY, auth_name text)';
    

var createIssuesTableQuery = 'CREATE TABLE lms.issues(issue_id uuid PRIMARY KEY,book_id uuid, mem_id uuid,\
                                issue_date date,due_date date, return_date date)';
// const createTablesQueries = [{query: createMemberTable},{query: createPublisherTable}];

/* GET home page. */
// router.get('/createTables', function(req, res, next) {
//   client.execute(createMemberTable,[],function(err,result){
//     console.log("\n\n err:", err);
//     console.log("\n\n result:", result);
//     if(err){
//       res.status(404).send({message: err});
//     } else {
//       res.send({Books: result.rows});
//     }
//   });
// });

const createMemberTable = async () => {
    client.execute(createMemberTableQuery)
    .then(function(){
        console.log("\n\n ALL TABLES CREATED");
        return true;
    }).catch(function(err){
        console.log("\n\n error while creating table:",err);
        return false;
    })
}

const createPublisherTable = async () => {
    client.execute(createPublisherTableQuery)
    .then(function(){
        console.log("\n\n ALL TABLES CREATED");
        return true;
    }).catch(function(err){
        console.log("\n\n error while creating table:",err);
        return false;
    })
}

const createIssuesTable = async () => {
    client.execute(createIssuesTableQuery)
    .then(function(){
        console.log("\n\n ALL TABLES CREATED");
        return true;
    }).catch(function(err){
        console.log("\n\n error while creating table:",err);
        return false;
    })
}

router.get('/createTables', function(req, res, next) {
    if(createMemberTable() && createPublisherTable() && createIssuesTable()){
        res.send({message:"Created all tables"});
    } else {
        res.send({ error: err});
    }
});

module.exports = router;