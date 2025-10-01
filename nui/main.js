const nuiElement = document.querySelector(".mynui");

nuiElement.addEventListener("click", () => {
    fetch(`https://${GetParentResourceName()}/nuiClicked`);
});
