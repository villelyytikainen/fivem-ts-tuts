"use strict";(()=>{onNet("server:Greet",e=>{console.log(`${e} opened the door`),emitNet("chat:addMessage",-1,{args:[`${e} opened the door`]})});onNet("server:Test",e=>{console.log(e)});})();
