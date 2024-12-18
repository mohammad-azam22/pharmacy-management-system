document.getElementById('login-form').addEventListener('submit', function (event) {
	event.preventDefault();
	const formData = new FormData(this);
	const data = {};

	formData.forEach((value, key) => {
		data[key] = value;
	});

	fetch('/user/login', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
		.then(response => response.json())
		.then(data => {
			if (data.success) {
				window.location.href = '/workspace';
			} 
			else {
				const container = document.getElementsByClassName("message")[0];
				container.style["color"] = "red";
				container.innerHTML = "ERROR: " + data.message;
				console.log('Error:', data.message);
			}
		})
		.catch((error) => {
			console.error('Error:', error);
		});
});
