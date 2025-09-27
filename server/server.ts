import { addListener } from "process";

// RegisterCommand('greet', (source:number, args: string[]) => {
//     const name = args[0];
//     emitNet('greet', source, name);
// }, false)

onNet('server:Greet', (greeter: string) => {
    console.log(`${greeter} opened the door`)
    emitNet('chat:addMessage', -1, {
        args: [`${greeter} opened the door`]
    })
})

onNet('server:Test', (args:object) => {
    console.log(args)
})

