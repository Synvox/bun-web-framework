import { html, js } from "../store";

export default async function () {
  html`<h1>Hello World</h1>`;

  for (let i = 0; i < 3; i++) {
    const id = `id-${i}`;
    countButton(id);
  }
}

function countButton(id: string) {
  html`<button id="${id}">0</button>`;

  js(countButtonJs, id);
}

function countButtonJs(id: string) {
  const button = document.getElementById(id)!;

  button.addEventListener("click", () => {
    button.textContent = String(Number(button.textContent) + 1);
  });
}
