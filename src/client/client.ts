import { places } from "./data/places";

const Delay = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

//Set chat suggestions and help for commands
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

// Disable buttons and force viewmode to 1st person
// And maybe leaning at some point??

type Position = { x: number; y: number; z: number };

const getPlayerPosition = (): Position => {
    const playerPed: number = PlayerPedId();
    const [x, y, z]: number[] = GetEntityCoords(playerPed, true);
    const pos: Position = {
        x: x,
        y: y,
        z: z,
    };

    return pos;
};

let count = 0;
let outCount = 0;

const freecam = CreateCam("DEFAULT_SCRIPTED_CAMERA", false);

type Rotation = {
    roll: number;
    pitch: number;
    yaw: number;
};

setTick(() => {
    if (!IsPedInAnyVehicle(PlayerPedId(), true)) {
        SetFollowPedCamViewMode(4);
        DisableControlAction(0, 0, true);
        DisableControlAction(0, 26, true);
    } else {
        SetFollowPedCamViewMode(2);
        EnableControlAction(0, 0, true);
        DisableControlAction(0, 79, true);

        if (GetFollowPedCamViewMode() != 4) {
            ClampGameplayCamPitch(-20, 20);
            ClampGameplayCamYaw(-20, 20);
        }
    }

    if(IsControlJustPressed(0, 26)){
        console.log("pressed")
        SendNUIMessage({
            type: "nui",
            message: "hide"
        })
    }

});
const tolerance = 0.1;
let lastPosition: Position = getPlayerPosition();

setInterval(() => {
    const newPosition = getPlayerPosition();
    if (
        Math.abs(newPosition.x - lastPosition.x) > tolerance ||
        Math.abs(newPosition.y - lastPosition.y) > tolerance ||
        Math.abs(newPosition.z - lastPosition.z) > tolerance
    ) {
        SendNUIMessage({
            type: "position",
            ...newPosition,
        });
        lastPosition = newPosition;
    }
}, 1000);

const waitForCar = async (hash: number) => {
    RequestModel(hash);
    while (!HasModelLoaded(hash)) {
        await Delay(100);
    }
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

RegisterCommand("c", spawnCar, false);
RegisterCommand("want", assignWantedLevel, false);
RegisterCommand("reset", resetSettings, false);
RegisterCommand("g", spawnWeapon, false);
RegisterCommand("dz", setCameraUndRemoveReticle, false);
RegisterCommand("kys", excuseMeWhileIKillMyself, false);
RegisterCommand("tp", teleportado, false);

// ------VEHICLE PLAYGROUND -----

// IsVehicleStolen();

const currentVehicle = GetVehiclePedIsIn(PlayerPedId(), false);
SetVehicleCanBreak(currentVehicle, true);
SetVehicleReduceTraction(currentVehicle, 100);

//Detect when player enters vehicle
//Check vehicle ownership
//IF vehicle is NOT owned
//Disable the vehicle
//Open NUI for vehicle minigame
//Invent some kind of game that is FUNFUNFUN to play

// ------ EVENTS ------

RegisterNuiCallbackType("nuiClicked");
RegisterNuiCallbackType("gameClicked");

on("__cfx_nui:nuiClicked", () => {
    AddTextEntry("CUSTOM_ENTRY", "nuiClicked");
    BeginTextCommandDisplayHelp("CUSTOM_ENTRY");
    EndTextCommandDisplayHelp(0, false, true, -1);
});

on("gameClicked", () => {
    SetNuiFocus(false, false);
});

// let lastCamMode = 1;
// let wasAiming = false;

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
