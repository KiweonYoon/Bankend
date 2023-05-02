const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const MongoClient = require('mongodb').MongoClient;
app.set('view engin', 'ejs');
app.use('/public', express.static('public'));
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
require('dotenv').config();

var db;
MongoClient.connect(process.env.DB_URL, (에러, client) => {
  if (에러) return console.log(에러);

  db = client.db('Todoapp');
  // db.collection('post').insertOne(
  //   { 이름: 'John', 나이: 20 },
  //   (에러, 결과) => {
  //     console.log('저장완료');
  //   }
  // );
  app.listen(process.env.PORT, () => {
    console.log('listening on 4000');
  });
});

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
          //.updateOne({어떤데이터를 수정할지},{수정 값},function(){})
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
  console.log(req.body); //요청시 요청자가 함께 보낸 데이터 확인
  req.body._id = parseInt(req.body._id); //정수로 변환
  db.collection('post').deleteOne(req.body, (에러, 결과) => {
    console.log('삭제완료');
    res.status(200).send({ message: '성공했습니다.' });
  });
});

app.get('/detail/:id', (req, res) => {
  db.collection('post').findOne(
    { _id: parseInt(req.params.id) },
    (에러, 결과) => {
      console.log(결과);
      res.render('detail.ejs', { data: 결과 });
    }
  );
});

app.get('/edit/:id', (req, res) => {
  db.collection('post').findOne(
    { _id: parseInt(req.params.id) },
    (에러, 결과) => {
      console.log(결과, '결과');
      res.render('edit.ejs', { post: 결과 });
    }
  );
});

app.put('/edit', (req, res) => {
  // 폼에 담긴 제목데이터, 날짜데이터를 가지고 db.collection에다가 업데이트함
  db.collection('post').updateOne(
    { _id: parseInt(req.body.id) },
    { $set: { 제목: req.body.title, 날짜: req.body.date } },
    (에러, 결과) => {
      console.log('수정완료');
      res.redirect('/list'); //res에 대한 액션 반드시 필요
    }
  );
});

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
app.use(
  session({ secret: '비밀코드', resave: true, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', (req, res) => {
  res.render('login.ejs');
});
app.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/fail',
  }),
  (req, res) => {
    res.redirect('/');
  }
);
app.get('/mypage', 로그인했니, (req, res) => {
  console.log(req.user);
  res.render('mypage.ejs', { 사용자: req.user });
});

function 로그인했니(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.send('로그인안하셨는데요?');
  }
}

passport.use(
  new LocalStrategy(
    {
      usernameField: 'id',
      passwordField: 'pw',
      session: true,
      passReqToCallback: false,
    },
    function (입력한아이디, 입력한비번, done) {
      //console.log(입력한아이디, 입력한비번);
      db.collection('login').findOne(
        { id: 입력한아이디 },
        function (에러, 결과) {
          if (에러) return done(에러);

          if (!결과)
            return done(null, false, { message: '존재하지않는 아이디요' });
          if (입력한비번 == 결과.pw) {
            return done(null, 결과);
          } else {
            return done(null, false, { message: '비번틀렸어요' });
          }
        }
      );
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((아이디, done) => {
  db.collection('login').findOne({ id: 아이디 }, (에러, 결과) => {
    done(null, 결과);
  });
});
