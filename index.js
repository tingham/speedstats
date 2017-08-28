let child_process = require("child_process")
let outfile = "./last.log"
let fs = require("fs")
let cmd = "/usr/local/bin/speedtest-cli --json"
let dsn = process.env.SPEEDSTATS_DSN
let app = require("./models/index.js")({})
let ssidCommand = "system_profiler SPAirPortDataType | awk -F':' '/Current Network Information:/ {\n" +
	"    getline\n" +
	"    sub(/^ */, \"\")\n" +
	"    sub(/:$/, \"\")\n" +
	"    print\n" +
	"}'"

app.db.sequelize
	.authenticate()
	.then(() => {
		SSID().then( (ssid) => {
			speedTest(ssid).then( () => {
				process.exit(0)
			})
		})
	})
	.catch((err) => {
		console.error(err)
		fs.appendFile(outfile, err)
	})

function speedTest (ssid) {
	return new Promise(function (resolve, reject) {
		child_process.exec(cmd, (err, stdout, stderr) => {
			if (err) {
				console.log(err)
				fs.appendFile(outfile, err)
				return reject(1)
			}

			let obj = JSON.parse(stdout)
			let graph = {}
			graph.timestamp = obj.timestamp
			graph.ping = obj.ping
			graph.download = obj.download
			graph.upload = obj.upload
			graph.ssid = ssid

			app.db.stat.sync().then(() => {
				app.db.stat.create(graph)
				fs.appendFile(outfile, graph)
				return resolve(0)
			})
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
