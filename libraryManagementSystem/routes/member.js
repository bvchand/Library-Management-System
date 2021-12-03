var express = require('express');
var router = express.Router();
var cassandra = require('cassandra-driver');
var client = new cassandra.Client({ contactPoints: ['127.0.0.1'], localDataCenter: 'datacenter1' });

client.connect(function (err, result) {
  if (err) {
    res.status(404).send({ message: err });
  }

  console.log("Connected to the DB");
});

router.post('/createMember', function (req, res, next) {
  // console.log("\n\n insdie member:");
  const member = req.body;
  // console.log("member: ",member.name);
  const date = new Date();
  const id = cassandra.types.uuid();
  const checkEmail = 'SELECT * FROM lms.member where email = ? ALLOW FILTERING';
  client.execute(checkEmail, [member.email])
    .then(result => {
      if (result.rows.length != 0) {
        res.send({ error: "Member/Email ID already exists!" });
      }
      else {
        const insertMemberQuery = 'insert into lms.member(mem_id,mem_name,mem_address, mem_date, expiry_date, email) values (?,?,?,?,?,?)';
        const queries = [
          {
            query: insertMemberQuery, params: [id, member.name, member.address, new Date(), new Date(date.setMonth(date.getMonth() + 6)), member.email]
          }
        ]
        client.batch(queries, { prepare: true })
          .then(function () {
            console.log("\n\n member ", member.name, "inserted");
            res.send({ member: "member inserted " + member.name })
          }).catch(function (err) {
            console.log("\n\n error:", err);
            res.send({ error: err });
          })
      }
    }).catch(function (err) {
      res.send({ error: err });
    });
});



module.exports = router;