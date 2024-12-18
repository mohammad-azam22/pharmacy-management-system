/*
Function(s) for dispense medication tab
*/

function updateMedicationStatus() {
	fetch('/workspace/dispense_medication_tab/update_medication_status', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	})
		.then(response => response.json())
		.then(data => {
			console.log(data);
		})
		.catch((error) => {
			console.error('Error:', error);
		});
}

updateMedicationStatus();

function tab_dispense_medication() {
	setButtonActive(2);

	const root = document.getElementById("dynamic-container");
	root.innerHTML = "";

	const html = `
					<form id="dispense-form">
                        <fieldset id="checkup-info">
                            <legend>Checkup Information</legend>
                            <label for="pat_id">Patient's ID:</label>
                            <input type="text" id="pat_id" name="pat_id" required>
                            <label for="doc_id">Doctor's ID:</label>
                            <input type="text" id="doc_id" name="doc_id" required>
                        </fieldset>
                        <fieldset id="med-info">
                            <legend>Medication Information</legend>
                            <datalist id="med_suggestions"></datalist>
							<datalist id="batch_suggestions"></datalist>
                            <div class="row" id="row-1">
                                <div class="left">
									<div class="top">
										<label for="med_name">Medication Name:</label>
                                    	<input type="text" id="med_name" name="med_name" list="med_suggestions" required oninput=fetch_medication_names(this)>
									</div>
									<div class="mid">
										<label for="batch_num">Batch Number:</label>
                                    	<input type="text" id="batch_num" name="batch_num" list="batch_suggestions" required onfocus=fetch_batch_nums(this)>
									</div>
									<div class="bottom">
										<label for="quantity">Quantity:</label>
										<input type="number" id="quantity" name="quantity" min="1" onkeydown="return ['ArrowUp','ArrowDown'].includes(event.code)" required onchange=fetch_quantity(this)>
									</div>
                                </div>
                                <div class="right">
                                    <button class="del-row" onclick="del_row('row-1')" title="Delete medication" type="button">
                                    	<img src="../images/delete.png" alt="delete row">
                                	</button>
                                </div>
                            </div>
                            <button id="add-row" onclick=add_row() title="Add medication" type="button"><img src="../images/add.png" alt="add row"></button>
                        </fieldset>
                        <button id="submit" onclick=generate_bill() type="button">Proceed</button>
                    </form>
				`;
	root.innerHTML = html;

}

function fetch_medication_names(event) {
	const data = { "queryString": event.value.toUpperCase() };
	if (event.value && event.value.length > 3) {
		const suggestions = document.getElementById("med_suggestions");
		suggestions.innerHTML = "";
		fetch('/workspace/dispense_medication_tab/medication_names', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
			.then(response => response.json())
			.then(data => {
				for (let i = 0; i < data["results"].length; i++) {
					const option = `<option>${data["results"][i]["med_name"]}</option>`;
					suggestions.innerHTML += option;
				}
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	}
}

function fetch_batch_nums(event) {
	const suggestions = document.getElementById("batch_suggestions");
	suggestions.innerHTML = "";
	const gParentNode = event.parentNode.parentNode;
	const medName = gParentNode.querySelector("#med_name").value;
	const data = { "med_name": medName.toUpperCase() };
	if (medName) {
		fetch('/workspace/dispense_medication_tab/batch_nums', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
			.then(response => response.json())
			.then(data => {
				for (let i = 0; i < data["results"].length; i++) {
					const option = `<option>${data["results"][i]["batch_num"]}</option>`;
					suggestions.innerHTML += option;
				}
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	}
}

function fetch_quantity(event) {
	const gParentNode = event.parentNode.parentNode;
	const medName = gParentNode.querySelector("#med_name").value;
	const batchNum = gParentNode.querySelector("#batch_num").value;
	data = { "med_name": medName, "batch_num": batchNum }
	if (medName && batchNum) {
		fetch('/workspace/dispense_medication_tab/quantity', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
			.then(response => response.json())
			.then(data => {
				event.setAttribute("max", data["results"][0]["quantity"]);
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	}
}

function add_row() {
	const root = document.getElementById("med-info");
	const lastChild = document.getElementById("add-row");

	const rows = document.getElementsByClassName("row");
	lastRow = rows[rows.length - 1]
	const id = `row-` + (parseInt(lastRow.getAttribute("id").substring(4)) + 1)

	const newNode = document.createElement("div");
	newNode.classList.add("row");
	newNode.setAttribute("id", id)

	const html = `
					<div class="left">
						<div class="top">
							<label for="med_name">Medication Name:</label>
							<input type="text" id="med_name" name="med_name" list="med_suggestions" required oninput=fetch_medication_names(this)>
						</div>
						<div class="mid">
							<label for="batch_num">Batch Number:</label>
							<input type="text" id="batch_num" name="batch_num" list="batch_suggestions" required onfocus=fetch_batch_nums(this)>
						</div>
						<div class="bottom">
							<label for="quantity">Quantity:</label>
							<input type="number" id="quantity" name="quantity" min="1" onkeydown="return ['ArrowUp','ArrowDown'].includes(event.code)" required onchange=fetch_quantity(this)>
						</div>
					</div>
					<div class="right">
						<button class="del-row" onclick="del_row('${id}')" title="Delete medication" type="button">
							<img src="../images/delete.png" alt="delete row">
						</button>
					</div>
				`;

	newNode.innerHTML = html;

	root.insertBefore(newNode, lastChild);
}

function del_row(parameter) {
	const rows = document.getElementsByClassName("row").length;
	if (rows > 1) {
		const delRow = document.getElementById(parameter);
		delRow.remove()
	}
}

async function generate_bill() {
	const form = document.getElementById("dispense-form");
	const inputs = form.getElementsByTagName("input")

	for (let input of inputs) {
		if (input.value == "") {
			return;
		}
	}

	const bg = document.getElementsByClassName("main-container")[0];
	bg.style["filter"] = "blur(5px)";
	bg.style["pointer-events"] = "none";

	const root = document.querySelector("main");

	const popup = document.createElement("div");
	popup.classList.add("popup")
	popup.classList.add("prevent-select")

	const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	const now = new Date();
	const currentDate = now.getDate();
	const currentMonth = now.getMonth();
	const currentYear = now.getFullYear();

	const patientId = document.getElementById("pat_id").value;
	const doctorId = document.getElementById("doc_id").value;

	let patientName = "";
	let doctorName = "";
	let patientBal = 0;

	data = { "patient_id": patientId };
	await fetch('/workspace/dispense_medication_tab/checkup_pat_details', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
		.then(response => response.json())
		.then(data => {
			patientName = data["results"][0]["p_fname"] + " " + data["results"][0]["p_lname"];
			patientBal = parseInt(data["results"][0]["p_balance"]);
		})
		.catch((error) => {
			console.error('Error:', error);
		});

	data = { "doctor_id": doctorId };
	await fetch('/workspace/dispense_medication_tab/checkup_doc_details', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
		.then(response => response.json())
		.then(data => {
			doctorName = data["results"][0]["d_fname"] + " " + data["results"][0]["d_lname"];
		})
		.catch((error) => {
			console.error('Error:', error);
		});

	const html = `
					<div class="title">
						<img src="../images/logo1.png" alt="logo">
						<p>Bill</p>
						<button onclick="close_popup('popup')" title="Close">
							<img src="../images/close.png" alt="Close Popup">
						</button>
					</div>
					<div class="scrollable-page">
						<div class="header">
							<span><b>Doctor's Name: </b></span><span>${doctorName}</span><br>
							<span><b>Patient's Name: </b></span><span>${patientName}</span><br>
							<span><b>Date: </b></span><span>${currentDate} ${months[currentMonth]} ${currentYear}</span>
						</div>
						<div class="med-info">
							<table>
								<tr class="header-row">
									<th>Medication Name</th>
									<th>Unit Price (Rs.)</th>
									<th>Quantity</th>
									<th>Total Price (Rs.)</th>
								</tr>
								<tr class="separator">
									<td colspan="4" style="border: none;"></td>
								</tr>
								<tr class="total-row">
									<td colspan="3">Total:</td>
									<td></td>
								</tr>
								<tr class="tax-row">
									<td colspan="3">Tax (Rs.):</td>
									<td></td>
								</tr>
								<tr class="discount-row">
									<td colspan="3">Discount (Rs.):</td>
									<td></td>
								</tr>
								<tr class="grand-total-row">
									<td colspan="3">Grand Total:</td>
									<td></td>
								</tr>
								<tr class="prev-balance-row">
									<td colspan="3">Previous Balance:</td>
									<td></td>
								</tr>
								<tr class="amt-payable-row">
									<td colspan="3">Amount Payable:</td>
									<td></td>
								</tr>
								<tr class="amt-paid-row">
									<td colspan="3">Amount Paid:</td>
									<td style="padding: 0;">
										<input type="number" name="amt-paid" min="0" id="amt-paid" value=0
											onkeydown="return event.keyCode !== 69 && event.keyCode !== 101" onchange="generate_balance()"
											style="border: none; height: 100%; width: 100%; padding:0.5em;">
									</td>
								</tr>
								<tr class="balance-row">
									<td colspan="3">Balance:</td>
									<td></td>
								</tr>
							</table>
						</div>
					</div>
					<div class="controls">
						<button onclick="print_bill()">Print Bill</button>
						<button onclick="execute_transaction()">Confirm</button>
					</div>
				`;

	popup.innerHTML = html;
	root.appendChild(popup);

	let totalPrice = 0;

	const rows = document.getElementsByClassName("row")

	// const names = [];
	// const batch_nums = [];
	// const quantities = [];

	// for (let i = 0; i < rows.length; i++) {
	// 	names.push(rows[i].getElementsByClassName("top")[0].querySelector("input").value.toUpperCase());
	// 	batch_nums.push(rows[i].getElementsByClassName("mid")[0].querySelector("input").value.toUpperCase());
	// 	quantities.push(rows[i].getElementsByClassName("bottom")[0].querySelector("input").value);
	// }

	for (let row of rows) {
		const name = row.getElementsByClassName("top")[0].querySelector("input").value.toUpperCase();
		const batch_num = row.getElementsByClassName("mid")[0].querySelector("input").value.toUpperCase();
		let unitPrice = 0.0    // fetch from DB

		// The Following query can be optimized. instead of sending a separate request for each medicine send a collective request to the server.
		// this way we can get rid of async and await on the client side. async/await will be required on the server side.

		data = { "med_name": name, "batch_num": batch_num };
		await fetch('/workspace/dispense_medication_tab/unit_price', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
			.then(response => response.json())
			.then(data => {
				unitPrice = data["results"][0]["unit_price"];
			})
			.catch((error) => {
				console.error('Error:', error);
			});

		const quantity = row.getElementsByClassName("bottom")[0].querySelector("input").value;

		const medRow = document.createElement("tr")
		medRow.setAttribute("class", "medication-row")

		const medName = document.createElement("td")
		medName.innerText = name;

		const medUnitPrice = document.createElement("td")
		medUnitPrice.innerText = unitPrice;

		const medQuantity = document.createElement("td")
		medQuantity.innerText = quantity;

		const medTotal = document.createElement("td")
		const totalMedPrice = parseFloat(unitPrice) * parseFloat(quantity);
		medTotal.innerText = totalMedPrice.toFixed(2);
		totalPrice = totalPrice + totalMedPrice;

		medRow.appendChild(medName)
		medRow.appendChild(medUnitPrice)
		medRow.appendChild(medQuantity)
		medRow.appendChild(medTotal)

		const sepRow = document.getElementsByClassName("separator")[0];
		const parentNode = sepRow.parentNode;
		parentNode.insertBefore(medRow, sepRow)

	}

	// (+ve balance means patient will give money to the pharmacy)

	popup.getElementsByClassName("total-row")[0].lastElementChild.innerText = totalPrice.toFixed(2);

	const taxPrice = (totalPrice * 0.12).toFixed(2);
	popup.getElementsByClassName("tax-row")[0].lastElementChild.innerText = taxPrice;

	const discount = ((totalPrice + parseFloat(taxPrice)) * 0.1).toFixed(2);
	popup.getElementsByClassName("discount-row")[0].lastElementChild.innerText = (-1) * discount;

	popup.getElementsByClassName("grand-total-row")[0].lastElementChild.innerText = (totalPrice + parseFloat(taxPrice) - parseFloat(discount)).toFixed(0);

	popup.getElementsByClassName("prev-balance-row")[0].lastElementChild.innerText = (patientBal).toFixed(0);

	popup.getElementsByClassName("amt-payable-row")[0].lastElementChild.innerText = (totalPrice + parseFloat(taxPrice) - parseFloat(discount) + parseFloat(patientBal)).toFixed(0);

	popup.getElementsByClassName("balance-row")[0].lastElementChild.innerText = (totalPrice + parseFloat(taxPrice) - parseFloat(discount) + parseFloat(patientBal)).toFixed(0);

}

function generate_balance() {
	const popup = document.getElementsByClassName("popup")[0];

	const amt_payable = popup.getElementsByClassName("amt-payable-row")[0].lastElementChild.innerText;
	let amt_paid = popup.getElementsByClassName("amt-paid-row")[0].lastElementChild.querySelector("input").value;
	amt_paid = amt_paid === "" ? 0 : amt_paid;
	popup.getElementsByClassName("balance-row")[0].lastElementChild.innerText = (parseFloat(amt_payable) - parseFloat(amt_paid)).toFixed(0);

}

function print_bill() {
	window.print();
}

async function execute_transaction() {

	// modify patient balance
	const newBalance = document.getElementsByClassName("balance-row")[0].querySelectorAll("td")[1].innerText;

	// modify medicine quantity
	const rows = document.getElementsByClassName("row");
	const purchased_names = [];
	const purchased_batch_nums = [];
	const purchased_quantities = [];
	for (let row of rows) {
		purchased_names.push(row.getElementsByClassName("top")[0].querySelector("input").value.toUpperCase());
		purchased_batch_nums.push(row.getElementsByClassName("mid")[0].querySelector("input").value.toUpperCase());
		purchased_quantities.push(row.getElementsByClassName("bottom")[0].querySelector("input").value);
	}

	// const user_id;
	const patient_id = document.getElementById("pat_id").value;
	const doctor_id = document.getElementById("doc_id").value;
	const sales_amt = document.getElementsByClassName("amt-payable-row")[0].querySelectorAll("td")[1].innerText;

	data = {
		"new_balance": newBalance,
		"sales_amt": sales_amt,
		"med_names": purchased_names,
		"batch_nums": purchased_batch_nums,
		"med_quantities": purchased_quantities,
		"patient_id": patient_id,
		"doctor_id": doctor_id
	};

	await fetch('/workspace/dispense_medication_tab/execute_transaction', {
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