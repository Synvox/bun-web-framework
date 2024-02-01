import { html, component, css } from "../store";

export const countButton = component(
  (text: string, speed: number) =>
    html`<div class="count-button">
      ${text} (${speed}ms)
      <button>0</button>
    </div>`,

  function (this: HTMLButtonElement, _text, speed = 500) {
    const button = this.querySelector("button")!;
    let interval: null | ReturnType<typeof setInterval> = null;
    button.addEventListener("click", () => {
      if (interval) {
        this.style.fontWeight = "normal";
        clearInterval(interval);
        interval = null;
      } else {
        this.style.fontWeight = "bold";
        interval = setInterval(() => {
          button.textContent = String(Number(button.textContent) + 1);
        }, speed);
      }
    });
  },

  css`
    @scope (.count-button) {
      :scope {
        font-family: sans-serif;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        box-shadow: 1px solid #00000020;
        background: #0080ff;
        border-radius: 7px;
        padding: 10px;
        color: white;
      }
      button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        box-shadow: 1px solid #00000020;
        background: #0080ff;
        color: white;
        border-radius: 7px;
        cursor: pointer;
      }
    }
  `
);
