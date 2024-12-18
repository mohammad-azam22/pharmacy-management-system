/*
Function(s) to open and close popup
*/

async function close_popup(class_name) {
	const root = document.getElementsByClassName("main-container")[0];
	root.style["filter"] = "none";
	root.style["pointer-events"] = "auto";

	const popup = document.getElementsByClassName(class_name)[0];
	popup.remove();
}