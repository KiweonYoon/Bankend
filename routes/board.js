var router = require('express').Router();

function 로그인했니(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.send('로그인안하셨는데요?');
  }
}

router.use(['/sports', '/game'], 로그인했니);
router.get('/sports', (req, res) => {
  res.send('스포츠 게시판');
});

router.get('/game', (req, res) => {
  res.send('게임 게시판');
});

module.exports = router;
