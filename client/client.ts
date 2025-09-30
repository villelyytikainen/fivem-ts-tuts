import { log } from "node:console";
import { places } from "./data/places";
import { isNumberObject } from "node:util/types";

const Delay = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

const waitForCar = async (hash: number) => {
    RequestModel(hash);

    AddTextEntry("CUSTOM_ENTRY", "come on boyyy, lets wait for the car boyyy");
    BeginTextCommandDisplayHelp("CUSTOM_ENTRY");
    EndTextCommandDisplayHelp(0, false, true, -1);
    let count = 0;
    while (!HasModelLoaded(hash)) {
        await Delay(100);
        console.log(count++);
    }
};

RegisterCommand(
    "c",
    async (source: number, args: string[], rawCommand: string) => {
        const [model] = args;
        const modelHash = GetHashKey(model);

        if (!IsModelAVehicle(modelHash)) return;
        await waitForCar(modelHash);
        const [x, y, z] = GetEntityCoords(PlayerPedId(), true);
        const h = GetEntityHeading(PlayerPedId());
        const veh = CreateVehicle(modelHash, x, y, z, h, true, true);

        while (!DoesEntityExist(veh)) await Delay(100);

        SetPedIntoVehicle(PlayerPedId(), veh, -1);
    },
    false
);

RegisterCommand(
    "killme",
    () => {
        // PlayEntityAnim(PlayerPedId(),"idle","mp_sleep", 2,false,false,true, 2,0);
        ClearPedTasks(PlayerPedId());
        TaskPlayAnim(PlayerPedId(), "mp_suicide", "pill", 8.0, 8.0, -1, 128, 1, false, false, false);
        // SetEntityHealth(PlayerPedId(), 0);
    },
    false
);

RegisterCommand(
    "tp",
    async (source: number, args: string[], rawCommand: string) => {
        args[0] = args[0].split(" ").join("");

        const p = places.find((place) => place.name === args[0]) ?? null;
        if (p) {
            StartPlayerTeleport(PlayerId(), p.x, p.y, p.z, 1, true, true, true);
        } else {

            const [x = 0, y = 0, z = 0] = (args[0] || "").split(",");
            const pos = { x, y, z };

            // AddTextEntry("CUSTOM_ENTRY", `Position is now: ${JSON.stringify(pos)}`);
            // BeginTextCommandDisplayHelp("CUSTOM_ENTRY");
            // EndTextCommandDisplayHelp(0, false, true, -1);

            console.log(pos);

            StartPlayerTeleport(PlayerId(), Number(pos.x), Number(pos.y), Number(pos.z), 1, true, true, true);
        }
    },
    false
);

on("CEventVehicleDamage", () => {
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

RegisterCommand(
    "st",
    async (source: number, args: string[], rawCommand: string) => {
        SetGpsActive(true);
        SetPlayerMaxStamina(PlayerId(), 1000);
        0x733a643b5b0c53c1;
    },
    false
);

RegisterCommand(
    "want",
    async (source: number, args: string[], rawCommand: string) => {
        GetPlayerFakeWantedLevel(PlayerId());
        console.log(args);
        const level: number = args.length > 0 ? Number(args[0]) : 0;
        SetPlayerWantedLevel(PlayerId(), level, false);
    },
    false
);

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
