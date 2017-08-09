let child_process = require("child_process")
let outfile = "./last.log"
let fs = require("fs")
let cmd = "/usr/local/bin/speedtest-cli --json"
let dsn = process.env.SPEEDSTATS_DSN
let Sequelize = require("sequelize")
let sequelize = new Sequelize(dsn)
let Stat = sequelize.define("stat", {
	"timestamp": {
		type: Sequelize.DATE
	},
	"ping": {
		type: Sequelize.DOUBLE
	},
	"download": {
		type: Sequelize.DOUBLE
	},
	"upload": {
		type: Sequelize.DOUBLE
	}
})

sequelize
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

			Stat.sync().then(() => {
				Stat.create(obj)
				fs.appendFile(outfile, obj)
				return resolve(0)
			})
		})
	})
}

