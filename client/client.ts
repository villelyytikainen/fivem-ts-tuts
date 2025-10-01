import { once } from "events";
import { places } from "./data/places";

const Delay = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

const waitForCar = async (hash: number) => {
    RequestModel(hash);
    let count = 0;
    while (!HasModelLoaded(hash)) {
        await Delay(100);
        console.log(count++);
    }
};

const focusOnNui = async (source: number, args: string[], rawCommand: string) => {
    SetNuiFocus(true, true);
    await Delay(5000);
    SetNuiFocus(false, false);
};

const spawnCar = async (source: number, args: string[], rawCommand: string): Promise<void> => {
    const [model] = args;
    const modelHash = GetHashKey(model);

    if (!IsModelAVehicle(modelHash)) return;
    await waitForCar(modelHash);
    const [x, y, z] = GetEntityCoords(PlayerPedId(), true);
    const h = GetEntityHeading(PlayerPedId());
    const veh = CreateVehicle(modelHash, x, y, z, h, true, true);

    while (!DoesEntityExist(veh)) await Delay(100);

    SetPedIntoVehicle(PlayerPedId(), veh, -1);
};

const assignWantedLevel = async (source: number, args: string[], rawCommand: string): Promise<void> => {
    const level: number = args.length > 0 ? Number(args[0]) : 0;
    SetPlayerWantedLevel(PlayerId(), level, false);
    SetPlayerWantedLevelNow(PlayerId(), true);
};

const resetSettings = async (source: number, args: string[], rawCommand: string): Promise<void> => {
    AddTextEntry("CUSTOM_ENTRY", "Settings reseted");
    BeginTextCommandDisplayHelp("CUSTOM_ENTRY");
    EndTextCommandDisplayHelp(0, false, true, -1);
};

const spawnWeapon = async (source: number, args: string[], rawCommand: string): Promise<void> => {
    const weaponName = `WEAPON_${args[0]}`;
    const weaponHash = GetHashKey(weaponName);
    GiveWeaponToPed(PlayerPedId(), weaponHash, 100, false, true);
};

const setCameraUndRemoveReticle = async (source: number, args: string[], rawCommand: string): Promise<void> => {
    SetHudComponentSize(14, 0, 0);
    SetPlayerHealthRechargeMultiplier(PlayerId(), 0);
    DisableIdleCamera(true);
    SetFollowPedCamViewMode(4);
};

const excuseMeWhileIKillMyself = async (source: number, args: string[], rawCommand: string): Promise<void> => {
    SetEntityHealth(PlayerPedId(), 0);
};

const teleportado = async (source: number, args: string[], rawCommand: string): Promise<void> => {
    args[0] = args[0].split(" ").join("");

    const p = places.find((place) => place.name === args[0]) ?? null;
    if (p) {
        StartPlayerTeleport(PlayerId(), p.x, p.y, p.z, 1, true, true, true);
    } else {
        const [x = 0, y = 0, z = 0] = (args[0] || "").split(",");
        const pos = { x, y, z };

        StartPlayerTeleport(PlayerId(), Number(pos.x), Number(pos.y), Number(pos.z), 1, true, true, true);
    }
};

RegisterCommand("nui", focusOnNui, false);
RegisterCommand("c", spawnCar, false);
RegisterCommand("want", assignWantedLevel, false);
RegisterCommand("reset", resetSettings, false);
RegisterCommand("g", spawnWeapon, false);
RegisterCommand("dz", setCameraUndRemoveReticle, false);
RegisterCommand("kys", excuseMeWhileIKillMyself, false);
RegisterCommand("tp", teleportado, false);
//RegisterCommand("acr", acr??? wtd was this supposed to be?, false);



RegisterNuiCallbackType("nuiClicked");
RegisterNuiCallbackType("gameClicked");

on("__cfx_nui:nuiClicked", () => {
    AddTextEntry("CUSTOM_ENTRY", "nuiClicked");
    BeginTextCommandDisplayHelp("CUSTOM_ENTRY");
    EndTextCommandDisplayHelp(0, false, true, -1);

    SetNuiFocus(true, true);
});

on("gameClicked", () => {
    SetNuiFocus(false, false);
});

// let lastCamMode = 1;
// let wasAiming = false;
const camHandle = GetRenderingCam();
const freecam = CreateCam("DEFAULT_SCRIPTED_CAMERA", false);

setTick(() => {
    DisableControlAction(26, 0, true);
    DisableControlAction(0, 0, true);

    if (GetFollowPedCamViewMode() != 4) {
        SetFollowPedCamViewMode(4);
    }

    if (IsControlPressed(0, 38) && !IsPedInAnyVehicle(PlayerPedId(), true)) {
        SetCamActive(freecam, true);
        RenderScriptCams(true, true, 2, true, true);
        console.log(freecam);
        SetCamRot(camHandle, 0, 200, 0, 5);
    } else if (IsControlPressed(0, 44) && !IsPedInAnyVehicle(PlayerPedId(), true)) {
        console.log("q");
        SetCamRot(camHandle, 0, -200, 0, 5);
    }

    // if (IsControlPressed(0)) SetCamRot(0, 0, 0, 0, 1);
});

// ------VEHICLE PLAYGROUND -----

// IsVehicleStolen();

const currentVehicle = GetVehiclePedIsIn(PlayerPedId(), false);
SetVehicleCanBreak(currentVehicle, true);
SetVehicleReduceTraction(currentVehicle, 100);

// on("INPUT_LOOK_RIGHT_ONLY", () => {
//     if (IsAimCamThirdPersonActive()) {
//         AddTextEntry("CUSTOM_ENTRY", "aiming babyy");
//         BeginTextCommandDisplayHelp("CUSTOM_ENTRY");
//         EndTextCommandDisplayHelp(0, false, true, -1);
//         SetPlayerForcedAim(PlayerId(), true);
//     }
// })

//Detect when player enters vehicle
//Check vehicle ownership
//IF vehicle is NOT owned -- Needs DB to check??
//Disable the vehicle
//Open NUI for vehicle minigame
//Invent some kind of game that is FUNFUNFUN to play

on("CEventVehicleDamage", (name: string) => {
    AddTextEntry("CUSTOM_ENTRY", "vehicle damage");
    BeginTextCommandDisplayHelp("CUSTOM_ENTRY");
    EndTextCommandDisplayHelp(0, false, true, -1);
});

const whoOpened = (name: string) => {
    const pName = GetPlayerName(PlayerId());
    console.log(pName);
    emitNet("server:Greet", name);
};

on("CEventOpenDoor", (name: string) => {
    AddTextEntry("CUSTOM_ENTRY", "Some door opened nearby");
    BeginTextCommandDisplayHelp("CUSTOM_ENTRY");
    EndTextCommandDisplayHelp(0, false, true, -1);
    whoOpened(name);
    emit("chat:addMessage", {
        args: ["hey, my door fucker"],
    });
});

on("pedranover", () => {
    AddTextEntry("CUSTOM_ENTRY", "pedranover");
    BeginTextCommandDisplayHelp("CUSTOM_ENTRY");
    EndTextCommandDisplayHelp(0, false, true, -1);
});

on("CEventRanOverPed", (...args: any[]) => {
    console.log(args);

    emit("pedranover");
});

setImmediate(() => {
    emit("chat:addSuggestion", "/greet", "Run this to say yo to other player", [
        {
            name: "name",
            help: "name of the player you wanna oi at",
        },
    ]);
    emit("chat:addSuggestion", "/tp", "Teleport to a wanted location", [
        {
            name: "name",
            help: "location to teleport to [ls, pl, ch, gs, sa]",
        },
    ]);
});
