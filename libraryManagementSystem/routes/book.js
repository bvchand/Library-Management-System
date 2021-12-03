var express = require('express');
var router = express.Router();
var cassandra = require('cassandra-driver');
var client = new cassandra.Client({ contactPoints: ['127.0.0.1'], localDataCenter: 'datacenter1' });

client.connect(function (err, result) {
  console.log('got into index.js');
});

router.post('/insertBook', function (req, res, next) {
  const book = req.body;
  const id = cassandra.types.uuid();
  const insertBookQuery = 'insert into lms.books(book_id, author_first_name, author_last_name,availability,  price,  title) values (?,?,?,?,?,?)'
  const queries = [
    {
      query: insertBookQuery, params: [id, book.firstName, book.lastName, true, book.price, book.title]
    }
  ]
  client.batch(queries, { prepare: true })
    .then(function () {
      res.send({ message: book.title + " inserted" })
    }).catch(function (err) {
      res.send({ error: err })
    })
});


router.post('/issue', function (req, res, next) {
  const issue = req.body;
  const getMemberRow = "select * from lms.member where email = ? allow filtering";
  client.execute(getMemberRow, [issue.email])
    .then(result => {
      if (result.rows.length == 0) {
        res.send({ error: "Member doesn't exist" });
      }
      memberDetail = result.rows[0];
      memberExpiryDate = memberDetail.expiry_date.date;
      curDate = new Date();
      if (curDate >= memberExpiryDate) {
        res.send({ error: "Member has expired" });
      }
      const bookTitle = issue.title;
      const getBookRow = "select * from lms.books where title = ? allow filtering";
      client.execute(getBookRow, [bookTitle])
        .then(result => {
          if (result.rows.length == 0) {
            res.send({ error: "book doesn't exist" });
          }
          bookDetail = result.rows[0];
          if (!bookDetail.availability) {
            res.send({ error: "Book not available." })
          }
          const date = new Date();
          const id = cassandra.types.uuid();
          const insertIssueQuery = 'insert into lms.issues(issue_id,book_id,mem_id, issue_date, due_date, return_date) values (?,?,?,?,?,?)';
          const updateBookAvailability = 'update lms.books set availability = ?  where book_id = ?';
          console.log("bookDetail.book_id.buffer:", bookDetail.book_id.buffer.toString());
          console.log("id:", typeof (id));
          console.log("memberDetail.mem_id:", memberDetail.mem_id.toString());
          console.log("\n\n\nbook detials:", bookDetail);
          const queries = [
            {
              query: insertIssueQuery, params: [id, bookDetail.book_id.toString(), memberDetail.mem_id.toString(), new Date(), new Date(date.setMonth(date.getMonth() + 1)), null]
            },
            {
              query: updateBookAvailability, params: [false, bookDetail.book_id]
            }
          ]
          client.batch(queries, { prepare: true })
            .then(function () {
              res.send({ message: 'book issued' })
            }).catch(function (err) {
              console.log("\n\n error:", err);
              res.send({ error: err })
            })
        }).catch(function (err) {
          console.log("\n\n error:", err);
          res.send({ error: err });
        });
    }).catch(function (err) {
      console.log("\n\n error:", err);
      res.send({ error: err })
    });
});



router.post('/returnBook', function (req, res, next) {
  const issue = req.body;
  const getMemberRow = "select * from lms.member where email = ? allow filtering";
  client.execute(getMemberRow, [issue.email])
    .then(result => {
      if (result.rows.length == 0) {
        res.send({ error: "Member doesn't exist" });
      }
      memberDetail = result.rows[0];
      console.log(memberDetail);

      const bookTitle = issue.title;
      const getBookRow = "select * from lms.books where title = ? allow filtering";
      client.execute(getBookRow, [bookTitle])
        .then(result => {
          if (result.rows.length == 0) {
            res.send({ error: "book doesn't exist" });
          }
          bookDetail = result.rows[0];
          console.log(bookDetail);

          const getIssueRows = "select * from lms.issues where book_id = ? and mem_id= ?  allow filtering";
          client.execute(getIssueRows, [bookDetail.book_id.toString(), memberDetail.mem_id.toString()])
            .then(result => {
              if (result.rows.length == 0) {
                res.send({ error: "book wasn't issued" });
              }

              issueDetail = result.rows[result.rows.length - 1];
              console.log(issueDetail);
              var queries;
              if (!issueDetail.return_date) {
                const date = new Date();
                const id = cassandra.types.uuid();
                const updateIssues = 'update lms.issues set return_date = ? where issue_id = ?';
                const updateBookAvailability = 'update lms.books set availability = ?  where book_id = ?';
                queries = [
                  {
                    query: updateIssues, params: [new Date(), issueDetail.issue_id]
                  },
                  {
                    query: updateBookAvailability, params: [true, bookDetail.book_id]
                  }
                ]
              }
              client.batch(queries, { prepare: true })
                .then(function () {
                  res.send({ message: 'book returned' })
                }).catch(function (err) {
                  console.log("\n\n error:", err);
                  res.send({ error: "book was not issued" })
                })
            }).catch(function (err) {
              console.log("\n\n error:", err);
              res.send({ error: err });
            });
        }).catch(function (err) {
          console.log("\n\n error:", err);
          res.send({ error: err })
        });
    });
});

router.get('/getAllBooks', function (req, res, next) {
  const allBooks = req.body;
  const getBooks = 'SELECT author_first_name, author_last_name, availability, price, title from lms.books';

  client.execute(getBooks, function (err, result, fields) {
    if (err) {
      res.status(404).send({ message: err });
    }
    res.end(JSON.stringify(result.rows));
  });

});

router.post('/getMemberHistory', function (req, res, next) {
  const getHistory = req.body;
  const getUserDetails = 'SELECT mem_id FROM lms.member WHERE email = ? allow filtering';
  client.execute(getUserDetails, [getHistory.email])
    .then(result => {
      if (result.rows.length == 0) {
        res.send({ error: "Member doesn't exist!" });
      }
      const memberDetail = result.rows[0];
      console.log(memberDetail);
      const member_id = memberDetail.mem_id.toString();
      console.log(member_id);

      const getRelatedIssues = 'SELECT * FROM lms.issues WHERE mem_id = ? allow filtering';
      client.execute(getRelatedIssues, [member_id])
        .then(result => {
          if (result.rows.length == 0) {
            res.send({ error: "Member doesn't have any history yet!" });
          }
          else {
            res.end(JSON.stringify(result.rows));
          } 
        }).catch(function (err) {
          console.log("\n\n error:", err);
          res.send({ error: err })
        });
    }).catch(function (err) {
      console.log("\n\n error:", err);
      res.send({ error: err })
    });
});


module.exports = router;