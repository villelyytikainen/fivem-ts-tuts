const nuiElement = document.querySelector(".mynui");
const xPos = document.querySelector(".xpos");
const yPos = document.querySelector(".ypos");
const zPos = document.querySelector(".zpos");
const adminPanel = document.querySelector(".admin-panel");
let nuiHidden = false;
let adminPanelToggled = false;

const callbackToGame = async (callbackName, callbackBody) => {
    await fetch(`https://${GetParentResourceName()}/${callbackName}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify(callbackBody),
    })
        .then((resp) => resp.json())
        .then((resp) => {
            console.log(resp);
            return resp;
        });
};

adminPanel.addEventListener("click", (event) => {
    console.log(`adminpanel listener event: ${event}`);
});

document.body.addEventListener("keypress", (event) => {
    if (event.key === "o") {
        adminPanelToggling();
    }
});

window.addEventListener("message", (event) => {
    const data = event.data;

    if (data.type === "position") {
        const { x, y, z } = data;
        xPos.textContent = x.toFixed(5);
        yPos.textContent = y.toFixed(5);
        zPos.textContent = z.toFixed(5);
    }

    if (data.type === "nui") {
        if (data.message === "hide") {
            if (!nuiHidden) {
                nuiElement.classList.add("hidden");
            } else {
                nuiElement.classList.remove("hidden");
            }
            nuiHidden = !nuiHidden;
        }

        if (data.message === "toggle_admin_panel") {
            adminPanelToggling();
        }
    }
});

const adminPanelLoginWait = () => {
    let counter = 1;
    const interval = setInterval(() => {
        console.log("waiting ", counter++);
        if (counter > 10) {
            console.log("login timeout, try again later");
            callbackToGame("timeout", {
                message: "Login timeout, could not login in. Try again.",
            });
            clearInterval(interval);
        }
    }, 1000);

    return interval;
};

const adminPanelToggling = async () => {
    const interval = adminPanelLoginWait();
    try {
        const response = await fetch("http://localhost:3001/auth");
        const auth = await response.json();

        console.log(`my auth: ${JSON.stringify(auth)}`);
        clearInterval(interval);

        if (adminPanel.classList.contains("open-admin-panel")) {
            adminPanel.classList.remove("open-admin-panel");
        } else {
            adminPanel.classList.add("open-admin-panel");
        }
        adminPanelToggled = !adminPanelToggled;

        await callbackToGame("toggleAdminPanel", {
            toggled: adminPanelToggled,
        });

    } catch (err) {
        callbackToGame("loginError", {
            message: "Could not login, please try again.",
        });
    }

};
