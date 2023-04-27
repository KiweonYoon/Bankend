const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const MongoClient = require('mongodb').MongoClient;
app.set('view engin', 'ejs');

var db;
MongoClient.connect(
  'mongodb+srv://dbsrldnjs101:j1481819@cluster0.icgo311.mongodb.net/?retryWrites=true&w=majority',
  (에러, client) => {
    if (에러) return console.log(에러);

    db = client.db('Todoapp');
    // db.collection('post').insertOne(
    //   { 이름: 'John', 나이: 20 },
    //   (에러, 결과) => {
    //     console.log('저장완료');
    //   }
    // );
    app.listen(4000, () => {
      console.log('listening on 4000');
    });
  }
);

// 누군가가 /pet 으로 방문을 하면..
// pet관련된 안내문을 띄워주자

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html'); // : callback 함수, 순차적으로 실행하고플 때 .
});

app.get('/write', (req, res) => {
  res.sendFile(__dirname + '/write.html');
});

app.post('/add', (req, res) => {
  res.send('전송완료');
  console.log(req.body);
  db.collection('counter').findOne({ name: '게시물갯수' }, (error, result) => {
    console.log(result.totalPost);
    const 총게시물갯수 = result.totalPost;
    db.collection('post').insertOne(
      { _id: 총게시물갯수 + 1, 제목: req.body.title, 날짜: req.body.date },
      (에러, 결과) => {
        console.log('저장완료');
        db.collection('counter').updateOne(
          { name: '게시물갯수' },
          { $inc: { totalPost: 1 } },
          (에러, 결과) => {
            if (에러) {
              return console.log(에러);
            }
          }
        );
      }
    );
  });
});

app.get('/list', (req, res) => {
  db.collection('post')
    .find()
    .toArray((에러, 결과) => {
      res.render('list.ejs', { posts: 결과 });
      console.log(결과);
    });
});

app.delete('/delete', (req, res) => {
  console.log(req.body);
});
