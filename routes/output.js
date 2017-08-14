let express = require('express')
let router = express.Router()
let _ = require("lodash")
let moment = require("moment")

router.get('/', function(req, res, next) {

  app.db.stat.findAll({order: app.db.sequelize.literal("timestamp ASC")}).then((stats) => {
    let download_data = {
      x: "x",
      xFormat: "%Y-%m-%d %H:%M",
      columns: [
	["x"],
	["data1"],
	["data2"],
	["data3"]
      ],
      names: {
	data1: "Download",
	data2: "Moving Average",
	data3: "Average"
      },
      types: {
	data3: "area",
	data2: "spline",
	data1: "area-spline"
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
	["data3"]
      ],
      names: {
	data1: "Upload",
	data2: "Moving Average",
	data3: "Average"
      },
      types: {
	data3: "area",
	data2: "spline",
	data1: "area-spline"
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
	["data3"]
      ],
      names: {
	data1: "Ping (ms)",
	data2: "Moving Average",
	data3: "Average"
      },
      types: {
	data3: "area",
	data2: "spline",
	data1: "area-spline"
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
    let index = 0
    stats.forEach(function (stat) {

      index++


      let down = stat.download / 1048576
      let up = stat.upload / 1048576

      dAvg += down
      uAvg += up
      pAvg += stat.ping

      download_data.columns[0].push(moment(stat.timestamp).format("YYYY-MM-DD HH:mm"))
      download_data.columns[1].push(down)
      download_data.columns[2].push(dAvg / index)

      upload_data.columns[0].push(moment(stat.timestamp).format("YYYY-MM-DD HH:mm"))
      upload_data.columns[1].push(up)
      upload_data.columns[2].push(uAvg / index)

      ping_data.columns[0].push(moment(stat.timestamp).format("YYYY-MM-DD HH:mm"))
      ping_data.columns[1].push(stat.ping)
      ping_data.columns[2].push(pAvg / index)
    })

    stats.forEach(function (stat) {
      download_data.columns[3].push(dAvg / stats.length)
      upload_data.columns[3].push(uAvg / stats.length)
      ping_data.columns[3].push(pAvg / stats.length)
    })

    res.render("index", {title: "Speedstats", download_data: download_data, upload_data: upload_data, ping_data: ping_data})
  })

})

module.exports = router
