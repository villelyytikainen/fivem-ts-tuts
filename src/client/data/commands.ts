import { places } from "../data/places";
import { Delay } from "../utils/utils";

//Helper function for spawning the car
export const waitForCar = async (hash: number) => {
    RequestModel(hash);
    while (!HasModelLoaded(hash)) {
        await Delay(100);
    }
};

export const spawnCar = async (source: number, args: string[], rawCommand: string): Promise<void> => {
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

export const assignWantedLevel = async (source: number, args: string[], rawCommand: string): Promise<void> => {
    const level: number = args.length > 0 ? Number(args[0]) : 0;
    SetPlayerWantedLevel(PlayerId(), level, false);
    SetPlayerWantedLevelNow(PlayerId(), true);
};

export const resetSettings = async (source: number, args: string[], rawCommand: string): Promise<void> => {
    AddTextEntry("CUSTOM_ENTRY", "Settings reseted");
    BeginTextCommandDisplayHelp("CUSTOM_ENTRY");
    EndTextCommandDisplayHelp(0, false, true, -1);
};

export const spawnWeapon = async (source: number, args: string[], rawCommand: string): Promise<void> => {
    const weaponName = `WEAPON_${args[0]}`;
    const weaponHash = GetHashKey(weaponName);
    GiveWeaponToPed(PlayerPedId(), weaponHash, 100, false, true);
};

export const setCameraUndRemoveReticle = async (source: number, args: string[], rawCommand: string): Promise<void> => {
    SetHudComponentSize(14, 0, 0);
    SetPlayerHealthRechargeMultiplier(PlayerId(), 0);
    DisableIdleCamera(true);
    SetFollowPedCamViewMode(4);
};

export const excuseMeWhileIKillMyself = async (source: number, args: string[], rawCommand: string): Promise<void> => {
    SetEntityHealth(PlayerPedId(), 0);
};

export const teleportado = async (source: number, args: string[], rawCommand: string): Promise<void> => {
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
