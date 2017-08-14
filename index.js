let child_process = require("child_process")
let outfile = "./last.log"
let fs = require("fs")
let cmd = "/usr/local/bin/speedtest-cli --json"
let dsn = process.env.SPEEDSTATS_DSN
let app = require("./models/index.js")({})

app.db.sequelize
	.authenticate()
	.then(() => {
		speedTest().then(() => {
			process.exit(0)
		})
	})
	.catch((err) => {
		console.error(err)
		fs.appendFile(outfile, err)
	})

function speedTest () {
	return new Promise(function (resolve, reject) {
		child_process.exec(cmd, (err, stdout, stderr) => {
			if (err) {
				console.log(err)
				fs.appendFile(outfile, err)
				return reject(1)
			}

			let obj = JSON.parse(stdout)

			app.db.stat.sync().then(() => {
				app.db.stat.create(obj)
				fs.appendFile(outfile, obj)
				return resolve(0)
			})
		})
	})
}

