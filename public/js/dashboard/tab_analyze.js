/*
Function(s) for analyze tab
*/

function tab_analyze() {
	setButtonActive(3);

	const root = document.getElementById("dynamic-container");
	root.innerHTML = "";
	root.innerHTML = `
						<div class="controls-container">
							<div class="control-col">
								<label for="metric">Metric:</label>
								<select name="metric" id="metric">
									<option value="NA">Select Metric</option>
									<option value="sales">Sales</option>
								</select>
							</div>
							<div class="control-col">
								<label for="aggregate">Aggregate:</label>
								<select name="aggregate" id="aggregate">
									<option value="NA">Select Aggregate</option>
									<option value="avg">Average</option>
									<option value="sum">Sum</option>
								</select>
							</div>
							<div class="control-col">
								<label for="granularity">Granularity:</label>
								<select name="granularity" id="granularity">
									<option value="NA">Select Granularity</option>
									<option value="yearly">Yearly</option>
									<option value="monthly">Monthly</option>
									<option value="daily">Daily</option>
								</select>
							</div>
							<div class="control-col">
								<button type="submit" onclick="fetch_chart_data()">Generate Chart</button>
							</div>
						</div>
						<div class="chart-container">
							<canvas id="myChart" style="display: block; max-width: 75%; max-height: 100%;"></canvas>
						</div>
					`;

}


async function fetch_chart_data() {

	const cols = document.getElementsByClassName("control-col");

	const metric = cols[0].querySelector("select").value;
	const aggregate = cols[1].querySelector("select").value;
	const granularity = cols[2].querySelector("select").value;

	if (metric == 'NA' || aggregate == 'NA' || granularity == 'NA') {
		return;
	}

	data = {
		"metric": metric,
		"aggregate": aggregate,
		"granularity": granularity
	};

	await fetch('/workspace/analyze_tab/chart_data', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
		.then(response => response.json())
		.then(data => {
			generate_chart(data, metric, aggregate, granularity);
		})
		.catch((error) => {
			console.error('Error:', error);
		});


}

function generate_chart(data, metric, aggregate, granularity) {

	let title;
	let unit;
	let xLabel;
	let yLabel;
	const labels = [];
	const dataPoints = [];

	if (aggregate == 'sum' && granularity == 'daily') {
		title = 'Total ' + metric + " per Day";
		unit = 'day';
		xLabel = "Days";
		yLabel = "Total " + metric;
	}
	else if (aggregate == 'sum' && granularity == 'monthly') {
		title = 'Total ' + metric + " per Month";
		unit = 'month';
		xLabel = "Months";
		yLabel = "Total " + metric;

	}
	else if (aggregate == 'sum' && granularity == 'yearly') {
		title = 'Total ' + metric + " per Year";
		unit = 'year';
		xLabel = "Years";
		yLabel = "Total " + metric;
	}
	else if (aggregate == 'avg' && granularity == 'daily') {
		title = 'Average ' + metric + " per Day";
		unit = 'day';
		xLabel = "Days";
		yLabel = "Avg. " + metric;
	}
	else if (aggregate == 'avg' && granularity == 'monthly') {
		title = 'Average ' + metric + " per Month";
		unit = 'month';
		xLabel = "Months";
		yLabel = "Avg. " + metric;
	}
	else {
		title = 'Average ' + metric + " per Year";
		unit = 'year';
		xLabel = "Years";
		yLabel = "Avg. " + metric;
	}

	console.log(xLabel);
	console.log(yLabel);

	for (let i = 0; i < data["results"].length; i++) {
		labels.push(String(data["results"][i]["label"]).substring(0, 10));
		dataPoints.push(parseFloat(data["results"][i]["value"]));
	}

	const ctx = document.getElementById('myChart').getContext('2d');

	const plotData = {
		labels: labels,
		datasets: [{
			label: title,
			data: dataPoints,
			borderColor: 'rgb(17, 181, 88)',
			backgroundColor: 'rgb(255, 255, 255)',
			fill: false,
			tension: 0.1
		}]
	};

	const config = {
		type: 'line',
		data: plotData,
		options: {
			scales: {
				x: {
					title: {
						display: true,
						text: xLabel
					},
					type: 'time',
					time: {
						unit: unit
					}
				},
				y: {
					title: {
						display: true,
						text: yLabel
					},
					beginAtZero: true
				}
			},
			plugins: {
				customCanvasBackgroundColor: {
					color: '#ffffff', // Set the background color to white 
				},
				title: {
					display: true,
					text: title
				}
			}
		},
		plugins: [{
			id: 'customCanvasBackgroundColor',
			beforeDraw: (chart, args, options) => {
				const { ctx } = chart; ctx.save();
				ctx.globalCompositeOperation = 'destination-over';
				ctx.fillStyle = options.color || '#ffffff';
				ctx.fillRect(0, 0, chart.width, chart.height);
				ctx.restore();
			}
		}]
	}

	const myChart = new Chart(ctx, config);

}
