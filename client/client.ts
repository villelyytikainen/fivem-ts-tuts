import { places } from "./data/places";

const Delay = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

RegisterCommand(
    "c",
    async (source: number, args: string[], rawCommand: string) => {
        const [model] = args;
        const modelHash = GetHashKey(model);

        if (!IsModelAVehicle(modelHash)) return;
        RequestModel(modelHash);
        while (!HasModelLoaded) await Delay(100);

        const [x, y, z] = GetEntityCoords(PlayerPedId(), true);
        const h = GetEntityHeading(PlayerPedId());
        const veh = CreateVehicle(modelHash, x, y, z, h, true, true);

        while (!DoesEntityExist(veh)) await Delay(100);

        SetPedIntoVehicle(PlayerPedId(), veh, -1);
    },
    false
);



RegisterCommand(
    "tp",
    async (source: number, args: string[], rawCommand: string) => {
        places.forEach((p) => {
            if (args[0] === p.name) {
                StartPlayerTeleport(PlayerId(), p.x, p.y, p.z, 1, true, true, true);
                return;
            }
        });

        AddTextEntry("CUSTOM_ENTRY", "No position found! Check input");
        BeginTextCommandDisplayHelp("CUSTOM_ENTRY");
        EndTextCommandDisplayHelp(0, false, true, -1);
    },
    false
);

// on("CEventOpenDoor", (name:string) => {
//     AddTextEntry("CUSTOM_ENTRY", "Some door opened nearby");
//     BeginTextCommandDisplayHelp("CUSTOM_ENTRY");
//     EndTextCommandDisplayHelp(0, false, true, -1);
//     whoOpened(name);
// });

on("CEventOpenDoor", (entity: number, object_hash: number, object_name: string) => {
    AddTextEntry("CUSTOM_ENTRY", "Some door opened nearby");
    BeginTextCommandDisplayHelp("CUSTOM_ENTRY");
    EndTextCommandDisplayHelp(0, false, true, -1);

    const args = {
        entity,
        object_hash,
        object_name
    }

    test(args)
});


const whoOpened = (name: string) => {
    const pName = GetPlayerName(PlayerId());
    emitNet("server:Greet", name);
};

const test = (...args: any[]) => {
    emitNet("server:Test", args);
};

setImmediate(() => {
    emit("chat:addSuggestion", "/greet", "Run this to say yo to other player", [
        {
            name: "name",
            help: "name of the player you wanna yoyo",
        },
    ]);
    emit("chat:addSuggestion", "/tp", "Teleport to a wanted location", [
        {
            name: "name",
            help: "location to teleport to [ls, pl, ch, gs, sa]",
        },
    ]);
});
