
function init (Sequelize, sequelize) {
	let model = Sequelize.define("stat", {
		"timestamp": {
			type: sequelize.DATE
		},
		"ping": {
			type: sequelize.DOUBLE
		},
		"download": {
			type: sequelize.DOUBLE
		},
		"upload": {
			type: sequelize.DOUBLE
		},
		"ssid": {
			type: sequelize.STRING
		}
	})

	return model
}

module.exports = function (Sequelize, sequelize) {
	return init(Sequelize, sequelize)
}
