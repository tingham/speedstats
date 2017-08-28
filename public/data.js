var startDate = null
var selectedSSID = null

$(document).ready(function () {
	console.log("Bob");
	var download = c3.generate({
		bindto: "#download",
		data: download_data,
		type: "spline",
		// subchart: {
		// 	show: true
		// },
		axis: {
			x: {
				type: "timeseries",
				tick: {
					count: 10,
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
					count: 10,
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
					count: 10,
					format: "%Y-%m-%d %H:%M"
				}
			}
		}
	});
	initSelects();
});

function initSelects() {
	$("select").each(function (index, obj) {
		var control = $(obj);
		var remote = control.attr("remote");
		console.log("Fetching", remote);
		$.ajax({url: remote, dataType: "json"}).then(function (json, success, response) {
			if (json.length > 0 && json[0].DISTINCT) {
				_.each(json, function (item) {
						var key = item.DISTINCT;
						var option = $("<option></option>");
						option.text(key);
						option.val(key);
						control.append(option);
				});

				control.change(function () {
					var ssid = control.val();
					document.location.href = document.URL.split("?")[0] + "?ssid=" + ssid;
				});
			}
		});
	});
}
