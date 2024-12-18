/*
Function(s) to set sidebar button active on click
*/

function setButtonActive(index) {
	const buttons = document.getElementsByClassName("dashboard-tab");

	for (let i = 0; i < buttons.length; i++) {
		const button = buttons[i];
		if (i === index) {
			button.classList.add("button-hover");
			button.children[0].classList.add("invert-color")
		}
		else {
			button.classList.remove("button-hover")
			button.children[0].classList.remove("invert-color")
		}
	}
}