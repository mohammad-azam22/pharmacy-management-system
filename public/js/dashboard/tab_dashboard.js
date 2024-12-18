function tab_dashboard() {
	setButtonActive(0);

	const root = document.getElementById("dynamic-container");
	root.innerHTML = "";

	const results = [
		{ "text": "Total Registered Patients", "value": 0 },
		{ "text": "Patients Visited Today", "value": 0 },
		{ "text": "Total Sales Today", "value": 0 },
		{ "text": "In Stock Medications", "value": 0 },
		{ "text": "Out of Stock Medications", "value": 0 },
		{ "text": "Expired Medications", "value": 0 }
	]

	for (let i = 0; i < results.length; i++) {

		const card = `
					<div class="card">
						<span class="left">${results[i].text}</span>
						<div class="vr"></div>
						<span class="right">${results[i].value}</span>
					</div>
					`;

		root.innerHTML += card;
	}

	fetch('/workspace/dashboard_tab', {
		method: 'GET',
	})
		.then(response => response.json())
		.then(data => {
			console.log(data["results"]);
			for (let i = 0; i < data["results"].length; i++) {
				cards = document.getElementsByClassName("card");
				cards[i].getElementsByClassName("right")[0].innerText = data["results"][i];
			}
		})
		.catch((error) => {
			console.error('Error:', error);
		});
}

tab_dashboard();