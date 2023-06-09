const fs = require('fs')
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const exec = require('child-process-promise').exec
const archiver = require('archiver')
const multer  = require('multer')

const upload = multer({ dest: 'uploads/' })


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


function callFontnameScript(cmd) {
  return exec(cmd)
    .then(function (result) {
        // var stdout = result.stdout;
        // var stderr = result.stderr;
    })
    .catch(function (err) {
        console.error('ERROR: ', err);
    });
}


function zipFiles(files, outPath) {
  const archive = archiver('zip', { zlib: { level: 9 }});
  const stream = fs.createWriteStream(outPath);

  return new Promise((resolve, reject) => {
    archive
      .on('error', err => reject(err))
      .pipe(stream)
    ;

    for (var i = 0; i < files.length; i++) {
      const file1 = __dirname + '/' + files[i].path;
      archive.append(fs.createReadStream(file1), { name: files[i].originalname });
    }

    stream.on('close', () => resolve());
    archive.finalize();
  });
}

app.post('/upload', upload.array('fonts', 32), function (req, res, next) {
  const nyttnavn = req.body.nyttnavn
  let cmd = 'python ./fontname.py ' + nyttnavn
  let toZip = [];
  if (req.files.length < 1 || nyttnavn.length < 1)
    res.end('No files or new name provided')
  req.files.forEach(file => {
    toZip.push(file);
    cmd += ' ' + file.path
  })
  const stdout = callFontnameScript(cmd)
    .then(_ => {
      const newZipFile = __dirname + '/public/zips/' + nyttnavn + '.zip';
      zipFiles(toZip, newZipFile)
        .then(_ => res.download(newZipFile))
    })
  // TODO cleanup?
})

app.get('/zips', function (req, res) {
  fs.readdir(__dirname + '/public/zips', function(err, files) {
    res.json(files);
  })
})


app.use('/', indexRouter);
// app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
