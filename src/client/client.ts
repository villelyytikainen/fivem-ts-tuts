import { Position } from "./types/Position";
import { spawnCar, assignWantedLevel, resetSettings, spawnWeapon, setCameraUndRemoveReticle, excuseMeWhileIKillMyself, teleportado } from "./data/commands";
import { whoOpened, getPlayerPosition, nuiInteraction, doorOpened, pedRanOver } from "./data/events";

RegisterCommand("c", spawnCar, false);
RegisterCommand("want", assignWantedLevel, false);
RegisterCommand("reset", resetSettings, false);
RegisterCommand("g", spawnWeapon, false);
RegisterCommand("dz", setCameraUndRemoveReticle, false);
RegisterCommand("kys", excuseMeWhileIKillMyself, false);
RegisterCommand("tp", teleportado, false);

RegisterCommand(
    "toggle_admin_panel",
    () => {
        SendNUIMessage({
            type: "nui",
            message: "toggle_admin_panel",
        });
    },
    false
);

RegisterNuiCallbackType("toggleAdminPanel");
RegisterNuiCallbackType("timeout");

on("__cfx_nui:toggleAdminPanel", async (data: any) => {
    const { toggled } = data;

    toggled ? SetNuiFocus(true, true) : SetNuiFocus(false, false);
});

on("__cfx_nui:timeout", (data: any) => {
    const { message } = data;
    AddTextEntry("CUSTOM_ENTRY", message);
    BeginTextCommandDisplayHelp("CUSTOM_ENTRY");
    EndTextCommandDisplayHelp(0, false, true, -1);
});

RegisterKeyMapping("toggle_admin_panel", "Toggle admin panel", "keyboard", "o");

on("CEventOpenDoor", doorOpened);
on("CEventRanOverPed", pedRanOver);

// ------VEHICLE PLAYGROUND -----

// IsVehicleStolen();

//Detect when player enters vehicle
//Check vehicle ownership
//IF vehicle is NOT owned
//Disable the vehicle
//Open NUI for vehicle minigame
//Invent some kind of game that is FUNFUNFUN to play

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

const freecam = CreateCam("DEFAULT_SCRIPTED_CAMERA", false);

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

    if (IsControlJustPressed(0, 26)) {
        SendNUIMessage({
            type: "nui",
            message: "hide",
        });
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

// ------ EVENTS ------
