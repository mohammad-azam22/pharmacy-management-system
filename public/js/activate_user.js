// document.getElementById("otp_btn").addEventListener("click", (event) => {
//     event.preventDefault();
//     const email = document.getElementById("email");
//     fetch('/user/otp', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ "email": email.value })
//       })
//       .then(response => response.json())
// 		.then(data => {
// 			const container = document.getElementsByClassName("message")[0];
// 			if (data.message) {
// 				container.style["color"] = "green";
// 				container.innerHTML = "";
// 				container.innerHTML = data.message;
// 				console.log('Success:', data);
// 			}
// 			else if (data.error) {
// 				container.style["color"] = "red";
// 				container.innerHTML = "";
// 				container.innerHTML = "ERROR: " + data.error;
// 				console.log('Error:', data);
// 			}

// 		})
// 		.catch((error) => {
// 			console.error('Error:', error);
// 		});
// });

// Uncomment the above to add OTP verification functionality.

document.getElementById('activate-form').addEventListener('submit', function (event) {
	event.preventDefault();
	const formData = new FormData(this);
	const data = {};

	formData.forEach((value, key) => {
		data[key] = value;
	});

	fetch('/user/activate', {
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
