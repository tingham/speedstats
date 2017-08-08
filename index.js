let child_process = require("child_process")
let cmd = "speedtest-cli --json"
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
	})

function speedTest () {
	return new Promise(function (resolve, reject) {
		child_process.exec(cmd, (err, stdout, stderr) => {
			if (err) {
				console.log(err)
				return reject(1)
			}

			let obj = JSON.parse(stdout)

			Stat.sync().then(() => {
				Stat.create(obj)
				return resolve(0)
			})
		})
	})
}

