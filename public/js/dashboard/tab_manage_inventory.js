/*
Function(s) for manage inventory tab
*/

function tab_manage_inventory() {
	setButtonActive(1);
	
	const root = document.getElementById("dynamic-container");
	root.innerHTML = "";

	const html = `
					<div class="options-container">
                        <button onclick="add_medication()">
                            Add Medication
                        </button>
                        <button onclick="in_stock_medications()">
                            In Stock Medications
                        </button>
                        <button onclick="out_of_stock_medications()">
                            Expired/Out of Stock Medications
                        </button>
                        <button onclick="discard_medication()">
                            Discard Medication
                        </button>
                    </div>
				`;

	root.innerHTML = html;

}

function add_medication() {

	const bg = document.getElementsByClassName("main-container")[0];
	bg.style["filter"] = "blur(5px)";
	bg.style["pointer-events"] = "none";

	const root = document.querySelector("main");

	const popup = document.createElement("div");
	popup.classList.add("popup")
	popup.classList.add("prevent-select")

	const html = `
				<div class="add-medication-title">
					<h2>Add Medication</h2>
					<button onclick="close_popup('popup')" title="Close">
						<img src="../images/close.png" alt="Close Popup">
					</button>
				</div>
				<form id="add-medication-form" method="post">
					<div class="row">
						<label for="med-company">Medication Company:</label>
						<input type="text" id="med-company" name="med-company" minlength="1" maxlength="100" required>
					</div>
					<div class="row">
						<label for="med-name">Medication Name:</label>
						<input type="text" id="med-name" name="med-name" minlength="1" maxlength="100" required>
					</div>
					<div class="row">
						<label for="batch-id">Batch Number:</label>
						<input type="text" id="batch-id" name="batch-id" minlength="1" maxlength="10" required>
					</div>
					<div class="row">
						<label for="mfg-date">Manufacture Date:</label>
						<input type="date" id="mfg-date" name="mfg-date" required>
					</div>
					<div class="row">
						<label for="exp-date">Expiry Date:</label>
						<input type="date" id="exp-date" name="exp-date" required>
					</div>
					<div class="row">
						<label for="quantity">Quantity:</label>
						<input type="number" id="quantity" name="quantity" min="1" max="100" onkeydown="return ['ArrowUp','ArrowDown'].includes(event.code)" required>
					</div>
					<div class="row">
						<label for="price">Cost Price:</label>
						<input type="number" id="price" name="price" min="1" required>
					</div>
					<div class="row">
						<label for="mrp">Max Retail Price:</label>
						<input type="number" id="mrp" name="mrp" min="1" required>
					</div>
					<button id="submit" onclick="add_new_medication()" type="button">Submit</button>
				</form>
				`;

	popup.innerHTML = html;
	root.appendChild(popup);
}

async function add_new_medication() {

	const form = document.getElementById("add-medication-form");

	const company = form.querySelector("#med-company").value;
	const name = form.querySelector("#med-name").value;
	const batch = form.querySelector("#batch-id").value;
	const mfg = form.querySelector("#mfg-date").value;
	const exp = form.querySelector("#exp-date").value;
	const quantity = form.querySelector("#quantity").value;
	const price = form.querySelector("#price").value;
	const mrp = form.querySelector("#mrp").value;

	if (!company || !name || !batch || !mfg || !exp || !quantity || !price || !mrp) {
		return;
	}

	const data = {
		"company_name": company,
		"med_name": name,
		"batch_id": batch,
		"mfg_date": mfg,
		"exp_date": exp,
		"quantity": quantity,
		"price": price,
		"mrp": mrp
	}

	console.log(data);
	await fetch('/workspace/manage_inventory_tab/add_medication', {
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


async function in_stock_medications() {

	const bg = document.getElementsByClassName("main-container")[0];
	bg.style["filter"] = "blur(5px)";
	bg.style["pointer-events"] = "none";

	const root = document.querySelector("main");

	const popup = document.createElement("div");
	popup.classList.add("popup")
	popup.classList.add("prevent-select")

	let medication_data;

	await fetch('/workspace/manage_inventory_tab/in_stock_medications', {
		method: 'GET',
	})
		.then(response => response.json())
		.then(data => {
			medication_data = data["results"];
		})
		.catch((error) => {
			console.error('Error:', error);
		});


	const html = `
					<div class="in-stock-medication-title">
						<h2>In Stock Medications</h2>
						<button onclick="close_popup('popup')" title="Close">
							<img src="../images/close.png" alt="Close Popup">
						</button>
					</div>
					<div class="in-stock-medication">
						<div class="sticky-header">
							<table>
								<tr class="header-row">
									<th>Medication Company</th>
									<th>Medication Name</th>
									<th>Batch Number</th>
									<th>Mfg. Date</th>
									<th>Exp. Date</th>
									<th>Quantity Left</th>
								</tr>
							</table>
						</div>
						<table>
						</table>
					</div>
					<div class="in-stock-medication-controls">
						<button onclick="close_popup('popup')">OK</button>
					</div>
				`;

	popup.innerHTML = html;
	root.appendChild(popup);

	const table = document.getElementsByClassName("in-stock-medication")[0].lastElementChild;

	for (let i = 0; i < medication_data.length; i++) {
		const row = document.createElement("tr");
		for (let j = 0; j < medication_data[0].length; j++) {
			const data = document.createElement("td");
			data.innerText = medication_data[i][j];
			row.appendChild(data);
		}
		table.appendChild(row);
	}

}


async function out_of_stock_medications() {

	const bg = document.getElementsByClassName("main-container")[0];
	bg.style["filter"] = "blur(5px)";
	bg.style["pointer-events"] = "none";

	const root = document.querySelector("main");

	const popup = document.createElement("div");
	popup.classList.add("popup")
	popup.classList.add("prevent-select")

	let medication_data;

	await fetch('/workspace/manage_inventory_tab/inactive_medications', {
		method: 'GET',
	})
		.then(response => response.json())
		.then(data => {
			medication_data = data["results"];
		})
		.catch((error) => {
			console.error('Error:', error);
		});


	const html = `
					<div class="out-of-stock-medication-title">
						<h2>Expired/Out Of Stock Medications</h2>
						<button onclick="close_popup('popup')" title="Close">
							<img src="../images/close.png" alt="Close Popup">
						</button>
					</div>
					<div class="out-of-stock-medication">
						<div class="sticky-header">
							<table>
								<tr class="header-row">
									<th>Medication Company</th>
									<th>Medication Name</th>
									<th>Batch Number</th>
									<th>Mfg. Date</th>
									<th>Exp. Date</th>
									<th>Quantity Left</th>
								</tr>
							</table>
						</div>
						<table>
						</table>
					</div>
					<div class="out-of-stock-medication-controls">
						<button onclick="close_popup('popup')">OK</button>
					</div>
				`;

	popup.innerHTML = html;
	root.appendChild(popup);

	const table = document.getElementsByClassName("out-of-stock-medication")[0].lastElementChild;

	for (let i = 0; i < medication_data.length; i++) {
		const row = document.createElement("tr");
		for (let j = 0; j < medication_data[0].length; j++) {
			const data = document.createElement("td");
			data.innerText = medication_data[i][j];
			row.appendChild(data);
		}
		table.appendChild(row);
	}

}

async function discard_medication() {

	const bg = document.getElementsByClassName("main-container")[0];
	bg.style["filter"] = "blur(5px)";
	bg.style["pointer-events"] = "none";

	const root = document.querySelector("main");

	const popup = document.createElement("div");
	popup.classList.add("popup")
	popup.classList.add("prevent-select")

	let medication_data;

	await fetch('/workspace/manage_inventory_tab/expired_medications', {
		method: 'GET',
	})
		.then(response => response.json())
		.then(data => {
			medication_data = data["results"];
		})
		.catch((error) => {
			console.error('Error:', error);
		});


	const html = `
					<div class="discard-medication-title">
						<h2>Discard Medications</h2>
						<button onclick="close_popup('popup')" title="Close">
							<img src="../images/close.png" alt="Close Popup">
						</button>
					</div>
					<div class="discard-medication">
						<div class="sticky-header">
							<table>
								<tr class="header-row">
									<th>Medication Company</th>
									<th>Medication Name</th>
									<th>Batch Number</th>
									<th>Mfg. Date</th>
									<th>Exp. Date</th>
									<th>Quantity Left</th>
									<th>Discard Medication</th>
								</tr>
							</table>
						</div>
						<table>
						</table>
					</div>
					<div class="discard-medication-controls">
						<button onclick="remove_medications()">Confirm</button>
					</div>
				`;

	popup.innerHTML = html;
	root.appendChild(popup);

	const table = document.getElementsByClassName("discard-medication")[0].lastElementChild;

	for (let i = 0; i < medication_data.length; i++) {
		const row = document.createElement("tr");
		for (let j = 0; j < medication_data[0].length; j++) {
			const data = document.createElement("td");
			data.innerText = medication_data[i][j];
			row.appendChild(data);
		}
		const data = document.createElement("td");
		data.setAttribute("onclick", "mark_medication(this)");
		row.appendChild(data);
		table.appendChild(row);
	}


}

function mark_medication(event) {

	if (event.innerHTML == "") {
		event.innerHTML = `<img src="../images/check.png">`;
	}
	else {
		event.innerHTML = "";
	}

}


async function remove_medications() {

	const med_details = [];

	const table = document.getElementsByClassName("discard-medication")[0].lastElementChild;
	const numRows = table.querySelectorAll("tr").length;
	for (let i = 0; i < numRows; i++) {
		const med_row = [];
		const row = table.querySelectorAll("tr")[i];
		if (row.querySelectorAll("td")[6].innerHTML != "") {
			med_row.push(row.querySelectorAll("td")[0].innerText);
			med_row.push(row.querySelectorAll("td")[1].innerText);
			med_row.push(row.querySelectorAll("td")[2].innerText);
			med_details.push(med_row);
		}
	}

	data = { "med_details": med_details };

	await fetch('/workspace/manage_inventory_tab/remove_medications', {
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

