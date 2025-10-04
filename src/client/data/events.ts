import { Position } from "../types/Position";

export const whoOpened = (name: string) => {
    const pName = GetPlayerName(PlayerId());
    console.log(pName);
    emitNet("server:Greet", name);
};

export const getPlayerPosition = (): Position => {
    const playerPed: number = PlayerPedId();
    const [x, y, z]: number[] = GetEntityCoords(playerPed, true);
    const pos: Position = {
        x: x,
        y: y,
        z: z,
    };

    return pos;
};

export const nuiInteraction = () => {
    AddTextEntry("CUSTOM_ENTRY", "nuiClicked");
    BeginTextCommandDisplayHelp("CUSTOM_ENTRY");
    EndTextCommandDisplayHelp(0, false, true, -1);
}

export const doorOpened = (name: string) => {
    AddTextEntry("CUSTOM_ENTRY", "Some door opened nearby");
    BeginTextCommandDisplayHelp("CUSTOM_ENTRY");
    EndTextCommandDisplayHelp(0, false, true, -1);
    whoOpened(name);
    emit("chat:addMessage", {
        args: ["hey, my door fucker"],
    });
}

export const pedRanOver = () => {
    AddTextEntry("CUSTOM_ENTRY", "pedranover");
    BeginTextCommandDisplayHelp("CUSTOM_ENTRY");
    EndTextCommandDisplayHelp(0, false, true, -1);
}