/// <reference path="./html-docking-window.ts" />

const CreateText = function (text: string): HTMLSpanElement {
	const span = document.createElement("span");
	span.innerText = text;
	return span;
}

const MakeDummyInnor = function (caption: string) {
	const innor = document.createElement("div");
	innor.appendChild(CreateText(caption));
	innor.style.height = "120px";
	return innor;
}

const Initialize = function () {
	const demo_area = document.getElementById("demo");
	const window_a = new UiParts.HtmlDockingWindow("Test A", MakeDummyInnor("AAAAAAAAAAAAAAAA"));
	const window_b = new UiParts.HtmlDockingWindow("Test B", MakeDummyInnor("BBBBBBBBBBBBBBBB"));
	const window_c = new UiParts.HtmlDockingWindow("Test C", MakeDummyInnor("CCCCCCCCCCCCCCCC"));
	const window_d = new UiParts.HtmlDockingWindow("Test D", MakeDummyInnor("DDDDDDDDDDDDDDDD"));

	const container_a = new UiParts.HtmlWindowContainer(window_a);
	const container_b = new UiParts.HtmlWindowContainer(window_c);
	//	container.Enter(window_a, 0, "horizontal");
	container_a.Enter(window_b, 1, "horizontal");
	container_b.Enter(window_d, 1, "vertical");
	window_b.interior = container_b.root;
	demo_area?.appendChild(container_a.root);

	const button_a = document.createElement("button");
	button_a.innerText = "++++";
	button_a.addEventListener("click", (event) => {
		window_a.root.style.width = (parseInt(window_a.root.style.width) + 50).toString();
		window_b.root.style.width = (parseInt(window_b.root.style.width) - 50).toString();
	});
	const button_b = document.createElement("button");
	button_b.innerText = "----";
	button_b.addEventListener("click", (event) => {
		window_a.root.style.width = (parseInt(window_a.root.style.width) - 50).toString();
		window_b.root.style.width = (parseInt(window_b.root.style.width) + 50).toString();
	});
	document.getElementById("command")?.append(button_a);
	document.getElementById("command")?.append(button_b);
};

Initialize();
