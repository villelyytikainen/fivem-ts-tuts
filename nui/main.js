const nuiElement = document.querySelector(".mynui");
const xPos = document.querySelector(".xpos");
const yPos = document.querySelector(".ypos");
const zPos = document.querySelector(".zpos");
let nuiHidden = false;

window.addEventListener("message", (event) => {
    const data = event.data;

    if (data.type === "position") {
        const { x, y, z } = data;
        xPos.textContent = x.toFixed(5);
        yPos.textContent = y.toFixed(5);
        zPos.textContent = z.toFixed(5);
    }

    if (data.type === "nui") {
        if (!nuiHidden) {
            nuiElement.classList.add("hidden");
        } else {
            nuiElement.classList.remove("hidden");
        }
        nuiHidden = !nuiHidden;
    }
});
