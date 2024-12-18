document.getElementById('reg-form').addEventListener('submit', function (event) {
	event.preventDefault();
	const formData = new FormData(this);
	const data = {};

	formData.forEach((value, key) => {
		data[key] = value;
	});

	fetch('/patient/register', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
		.then(response => response.json())
		.then(data => {
			const container = document.getElementsByClassName("message")[0];
			if (data.message) {
				container.style["color"] = "green";
				container.innerHTML = data.message;
				console.log('Success:', data);
			}
			else if (data.error) {
				container.style["color"] = "red";
				container.innerHTML = "ERROR: " + data.error;
				console.log('Error:', data);
			}
			
		})
		.catch((error) => {
			console.error('Error:', error);
		});
});