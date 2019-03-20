var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.delete('/:id', function (req, res) {
  res.send({type: 'DELETE'});
});

module.exports = router;