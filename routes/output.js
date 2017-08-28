let express = require('express')
let router = express.Router()
let _ = require("lodash")
let moment = require("moment")

// Display ping on an inverted chart (taller values == better.)
let INVERT_PING = true

router.get('/', function(req, res, next) {
  let ssid = req.query.hasOwnProperty("ssid") ? req.query.ssid : ""
  let startDate = (req.query.hasOwnProperty("startDate") ? moment(req.query.startDate) : moment(new Date()).subtract(7, "days")).format("YYYY-MM-DD")
  let endDate = moment(new Date()).add(1, "days").format("YYYY-MM-DD")

  let where = {"timestamp": {$gte: startDate, $lte: endDate}}

  if (!_.isEmpty(ssid)) {
    where.ssid = ssid
  }

  app.db.stat.findAll({where: where}, {order: app.db.sequelize.literal("timestamp ASC")}).then((stats) => {
    let download_data = {
      x: "x",
      xFormat: "%Y-%m-%d %H:%M",
      columns: [
	["x"],
	["data1"],
	["data2"],
	["data3"],
	["data4"]
      ],
      names: {
	data1: "Download",
	data2: "Moving Average",
	data3: "Average",
	data4: "Daily"
      },
      types: {
	data1: "step",
	data2: "spline",
	data3: "area",
	data4: "spline"
      },
      colors: {
	data3: "#ccffcc",
	data2: "#00cc99",
	data1: "#ff9900"
      }
    }
    let upload_data = {
      x: "x",
      xFormat: "%Y-%m-%d %H:%M",
      columns: [
	["x"],
	['data1'],
	["data2"],
	["data3"],
	["data4"]
      ],
      names: {
	data1: "Upload",
	data2: "Moving Average",
	data3: "Average",
	data4: "Daily"
      },
      types: {
	data1: "step",
	data3: "area",
	data2: "spline",
	data4: "spline"
      },
      colors: {
	data3: "#ccffcc",
	data2: "#00cc99",
	data1: "#ff9900"
      }
    }
    let ping_data = {
      x: "x",
      xFormat: "%Y-%m-%d %H:%M",
      columns: [
	["x"],
	["data1"],
	["data2"],
	["data3"],
	["data4"]
      ],
      names: {
	data1: "Ping (ms)",
	data2: "Moving Average",
	data3: "Average",
	data4: "Daily"
      },
      types: {
	data1: "step",
	data2: "spline",
	data3: "area",
	data4: "spline"
      },
      colors: {
	data3: "#ccffcc",
	data2: "#00cc99",
	data1: "#ff9900"
      }
    }

    let dAvg = 0
    let uAvg = 0
    let pAvg = 0

    let dDaily= 0
    let uDaily = 0
    let pDaily = 0

    let index = 0
    let daily = 0

    let day_tag = ""
    stats.forEach(function (stat) {
      index++

      let inst_tag = moment(stat.timestamp).format("YYYY-MM-DD")

      let down = stat.download / 1048576
      let up = stat.upload / 1048576
      let ping = stat.ping * (INVERT_PING ? -1 : 1)

      if (inst_tag != day_tag) {
	dDaily = down
	uDaily = up
	pDaily = ping
	day_tag = inst_tag
	daily = 1
      } else {
	dDaily += down
	uDaily += up
	pDaily += ping
	daily++
      }

      dAvg += down
      uAvg += up
      pAvg += ping

      download_data.columns[0].push(moment(stat.timestamp).format("YYYY-MM-DD HH:mm"))
      download_data.columns[1].push(down)
      download_data.columns[2].push(dAvg / index)
      download_data.columns[4].push(dDaily / daily)

      upload_data.columns[0].push(moment(stat.timestamp).format("YYYY-MM-DD HH:mm"))
      upload_data.columns[1].push(up)
      upload_data.columns[2].push(uAvg / index)
      upload_data.columns[4].push(uDaily / daily)

      ping_data.columns[0].push(moment(stat.timestamp).format("YYYY-MM-DD HH:mm"))
      ping_data.columns[1].push(ping)
      ping_data.columns[2].push(pAvg / index)
      ping_data.columns[4].push(pDaily / daily)
    })

    stats.forEach(function (stat) {
      download_data.columns[3].push(dAvg / stats.length)
      upload_data.columns[3].push(uAvg / stats.length)
      ping_data.columns[3].push(pAvg / stats.length)
    })

    res.render("index", {title: "Speedstats", caption: "Self-hosted bandwidth stats keeper.", download_data: download_data, upload_data: upload_data, ping_data: ping_data})
  })

})

router.get("/ssid/",
  function (req, res, next) {
    app.db.stat.aggregate("ssid", "DISTINCT", {plain: false}).then((names) => {
      res.end(JSON.stringify(names))
    })
  })

module.exports = router
