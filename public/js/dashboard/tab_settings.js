async function tab_settings() {
	setButtonActive(4);

	const root = document.getElementById("dynamic-container");
	root.innerHTML = "";

	html = `
			<div class="top-container">
				<div class="inner-row">
					<span><b>Username: </b></span><span></span>
				</div>
				<div class="inner-row">
					<span><b>Name: </b></span><span></span>
				</div>
				<div class="inner-row">
					<span><b>Authorization: </b></span><span></span>
				</div>
			</div>
			<div class="bottom-container">
				<!--<button>
					Update Information
				</button>-->
				<button onclick=logout_user()>
					Log Out
				</button>
			</div>
			`;
	root.innerHTML = html;

	let isAdmin = false;

	await fetch('/workspace/settings_tab', {
		method: 'GET',
	})
		.then(response => response.json())
		.then(data => {
			const rows = document.getElementsByClassName("inner-row");
			for (let i = 0; i < data["results"].length; i++) {
				if (data["results"][i] == "Admin") {
					isAdmin = true;
				}
				rows[i].querySelectorAll("span")[1].innerText = data["results"][i];
			}
		})
		.catch((error) => {
			console.error('Error:', error);
		});

	const container = document.getElementsByClassName("bottom-container")[0];
	if (isAdmin == true) {
		container.innerHTML = `
								<button onclick=add_new_user()>
									Add New User
								</button>
								<button onclick=manage_authorizations()>
									Manage Authorizations
								</button>
							`
			+ container.innerHTML;
	}
}

function add_new_user() {
	const bg = document.getElementsByClassName("main-container")[0];
	bg.style["filter"] = "blur(5px)";
	bg.style["pointer-events"] = "none";

	const root = document.querySelector("main");

	const popup = document.createElement("div");
	popup.classList.add("popup")
	popup.classList.add("prevent-select")

	const html = `
				<div class="add-user-title">
					<h2>Add New User</h2>
					<button onclick="close_popup('popup')" title="Close">
						<img src="../images/close.png" alt="Close Popup">
					</button>
				</div>
				<form id="add-user-form" method="post">
					<!--<div class="row">
						<label for="username">Username:</label>
						<input type="text" id="username" name="username" minlength="8" maxlength="20" required>
					</div>-->
					<div class="row">
						<label for="fname">First Name:</label>
						<input type="text" id="fname" name="fname" maxlength="20" required>
					</div>
					<div class="row">
						<label for="lname">Last Name:</label>
						<input type="text" id="lname" name="lname" maxlength="20" required>
					</div>
					<div class="row">
						<label for="mobile">Mobile No:</label>
						<input type="tel" id="mobile" name="mobile" minlength="10" maxlength="10" required>
					</div>
					<div class="row">
						<label for="email">Email ID:</label>
						<input type="email" id="email" name="email" required>
					</div>
					<div class="row">
						<label for="gender">Gender:</label>
						<select name="gender" id="gender">
							<option value="male">Male</option>
							<option value="female">Female</option>
						</select>
					</div>
					<div class="row">
						<label for="dob">Date Of Birth:</label>
						<input type="date" id="dob" name="dob" required>
					</div>
					<div class="row">
						<label for="addr">Address:</label>
						<input type="text" id="addr" name="addr" maxlength="200" required>
					</div>
					<button id="submit" onclick="add_user()" type="button">Submit</button>
				</form>
				`;

	popup.innerHTML = html;
	root.appendChild(popup);
}

async function manage_authorizations() {
	const bg = document.getElementsByClassName("main-container")[0];
	bg.style["filter"] = "blur(5px)";
	bg.style["pointer-events"] = "none";

	const root = document.querySelector("main");

	const popup = document.createElement("div");
	popup.classList.add("popup")
	popup.classList.add("prevent-select")

	let user_data;

	await fetch('/workspace/settings_tab/authorizations', {
		method: 'GET',
	})
		.then(response => response.json())
		.then(data => {

			user_data = data["results"];
		})
		.catch((error) => {
			console.error('Error:', error);
		});

	// 0 = admin, 1 = user, 2 = inactive
	const html = `
					<div class="manage-user-title">
						<h2>Manage Users</h2>
						<button onclick="close_popup('popup')" title="Close">
							<img src="../images/close.png" alt="Close Popup">
						</button>
					</div>
					<div class="user-authorization">
						<div class="sticky-header">
							<table>
								<tr class="header-row">
									<th>User ID</th>
									<th>Username</th>
									<th>First Name</th>
									<th>Last Name</th>
									<th colspan="3">Authorization</th>
								</tr>
								<tr class="header-row">
									<th colspan="4"></th>
									<th>Admin</th>
									<th>User</th>
									<th>Inactive</th>
								</tr>
							</table>
						</div>
						<table>
						</table>
					</div>
					<div class="manage-user-controls">
						<button onclick="update_authorizations()">Save Changes</button>
					</div>
				`;

	popup.innerHTML = html;
	root.appendChild(popup);

	const table = document.getElementsByClassName("user-authorization")[0].lastElementChild;

	for (let i = 0; i < user_data.length; i++) {
		const row = document.createElement("tr");
		for (let j = 0; j < 7; j++) {
			const data = document.createElement("td");
			if (j < 4) {
				data.innerText = user_data[i][j];
			}
			else if (parseInt(user_data[i][4]) + 4 === j) {
				data.setAttribute("class", "radio_btn");
				data.setAttribute("onclick", 'select_authorization(this)');
				data.innerHTML = `<img src="../images/check.png" alt="check-mark" style="width:2em; height:2em; display:block; margin: auto;">`;
			}
			else {
				data.setAttribute("class", "radio_btn");
				data.setAttribute("onclick", 'select_authorization(this)');
			}
			row.appendChild(data);

		}
		table.appendChild(row);
	}
}

function select_authorization(event) {
	const root = event.parentNode;
	const cols = root.getElementsByClassName(event.getAttribute("class"));
	for (let col of cols) {
		if (col === event) {
			col.innerHTML = `<img src="../images/check.png" alt="check-mark" style="width:2em; height:2em; display:block; margin: auto;">`;
		}
		else {
			col.innerHTML = "";
		}
	}
}

async function update_authorizations() {

	const rows = document.getElementsByClassName("user-authorization")[0].lastElementChild.querySelectorAll("tr");

	const data = [];

	for (let row of rows) {
		const tds = row.querySelectorAll("td");
		if (tds[4].innerHTML != "") {
			data.push({ "user_id": tds[0].innerText, "role": "Admin" });
		}
		else if (tds[5].innerHTML != "") {
			data.push({ "user_id": tds[0].innerText, "role": "User" });
		}
		else {
			data.push({ "user_id": tds[0].innerText, "role": "Inactive" });
		}
	}

	await fetch('/workspace/settings_tab/update_authorizations', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
		.then(response => response.json())
		.then(data => {
			console.log(data);
			close_popup('popup');
		})
		.catch((error) => {
			console.error('Error:', error);
		});
}



async function add_user() {

	const form = document.getElementById("add-user-form");

	const fname = form.querySelector("#fname").value;
	const lname = form.querySelector("#lname").value;
	const mobile = form.querySelector("#mobile").value;
	const email = form.querySelector("#email").value;
	const gender = form.querySelector("#gender").value;
	const dob = form.querySelector("#dob").value;
	const address = form.querySelector("#addr").value;

	const data = {
		"fname": fname,
		"lname": lname,
		"mobile": mobile,
		"email": email,
		"gender": gender,
		"dob": dob,
		"address": address
	}

	console.log(data);
	await fetch('/workspace/settings_tab/add_new_user', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
		.then(response => response.json())
		.then(data => {
			console.log(data);
			close_popup('popup');
		})
		.catch((error) => {
			console.error('Error:', error);
		});
}

function logout_user() {
	fetch('/user/logout', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	})
		.then(response => {
			if (response.redirected) {
				window.location.href = response.url; // Redirect to the login page
			} else {
				console.log('Error:', 'Failed to logout');
			}
		})
		.catch((error) => {
			console.error('Error:', error);
		});
}
