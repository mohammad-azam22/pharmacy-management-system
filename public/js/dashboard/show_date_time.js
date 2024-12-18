/*
Function(s) to display data and time on the top right corner in dashboard
*/

function updateDateTime() {
	const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	const now = new Date();
	const currentDate = now.getDate();
	const currentMonth = now.getMonth();
	const currentYear = now.getFullYear();
	const currentTime = now.toTimeString().substring(0, 8);

	document.querySelector('#date').textContent = `${currentDate} ${months[currentMonth]} ${currentYear}`;
	document.querySelector('#time').textContent = `${currentTime}`
}

setInterval(updateDateTime, 1000);