$(document).ready(function () {
	console.log("Bob");
	var download = c3.generate({
		bindto: "#download",
		data: download_data,
		type: "spline",
		subchart: {
			show: true
		},
		axis: {
			x: {
				type: "timeseries",
				tick: {
					count: 20,
					format: "%Y-%m-%d %H:%M"
				}
			}
		}
	});
	var upload = c3.generate({
		bindto: "#upload",
		data: upload_data,
		type: "spline",
		axis: {
			x: {
				type: "timeseries",
				tick: {
					count: 20,
					format: "%Y-%m-%d %H:%M"
				}
			}
		}
	});
	var upload = c3.generate({
		bindto: "#ping",
		data: ping_data,
		type: "spline",
		axis: {
			x: {
				type: "timeseries",
				tick: {
					count: 20,
					format: "%Y-%m-%d %H:%M"
				}
			}
		}
	});
});
