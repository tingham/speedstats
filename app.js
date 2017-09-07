let express = require('express')
let path = require('path')
let favicon = require('serve-favicon')
let logger = require('morgan')
let cookieParser = require('cookie-parser')
let bodyParser = require('body-parser')
let moment = require("moment")

let index = require('./routes/index')
let output = require('./routes/output')

let child_process = require("child_process")
let outfile = "./last.log"
let fs = require("fs")
let cmd = "/usr/local/bin/speedtest-cli --json"
let dsn = process.env.SPEEDSTATS_DSN
let ssidCommand = "/usr/sbin/system_profiler SPAirPortDataType | awk -F':' '/Current Network Information:/ {\n" +
	"    getline\n" +
	"    sub(/^ */, \"\")\n" +
	"    sub(/:$/, \"\")\n" +
	"    print\n" +
	"}'"
let schedule = require("node-schedule")

let app = express();
require("./models/index.js")(app)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', index);
app.use('/', output);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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


let job = schedule.scheduleJob("1 * * * *", recordStats)

global["app"] = app

console.log("Running restart capture", moment(new Date()).format("YYYY-MM-DD HH:mm:ss"))
recordStats()

function recordStats () {
  console.log("Beginning job.")
  app.db.sequelize
    .authenticate()
    .then(() => {
      SSID().then( (ssid) => {
	speedTest(ssid).then( () => {
	  console.log("Wrote record.")
	})
      })
    })
    .catch((err) => {
      console.error(err)
      fs.appendFile(outfile, err)
    })
}

function speedTest (ssid) {
  return new Promise(function (resolve, reject) {
    let speedtest = require("speedtest-net")
    let test = speedtest({maxTime: 120000})
    var timestamp = moment().format("YYYY-MM-DD HH:mm:ss")
    console.log(timestamp)

    test.on("downloadspeedprogress", speed => {
      console.log((speed * 125).toFixed(2) + " KB/s")
    })

    test.on("data", data => {
      console.dir(data)
      if (data) {
	let graph = {}
	graph.download = data.speeds.download * 1024 * 1024
	graph.upload = data.speeds.upload * 1024 * 1024
	graph.ping = data.server.ping
	graph.timestamp = timestamp
	graph.ssid = ssid.trim()

	app.db.stat.sync().then(() => {
	  app.db.stat.create(graph)
	  fs.appendFile(outfile, graph)
	  return resolve(0)
	})
      }
    })
  })
}

function SSID () {
  return new Promise(function (resolve, reject) {
    child_process.exec(ssidCommand, (err, stdout, stderr) => {
      if (err) {
	console.log(err)
	fs.appendFile(outfile, err)
	return reject("Uknown SSID")
      }
      return resolve(stdout)
    })
  })
}

module.exports = app;
