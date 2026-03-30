const { io } = require("../config/socketapi");

function socketEmitRoom(room, event, data) {

    if (!room || !event) {
        console.error("Room and event are required");
        return;
    }

    io.to(room).emit(event, data);
    console.log(`Event "${event}" emitted to room "${room}"`);
}

function socketEmitGlobal(event, data) {
    if (!event) {
        console.error("Event name is required");
        return;
    }

    io.emit(event, data);
    console.log(`Event "${event}" emitted globally`);
}

module.exports = {socketEmitRoom, socketEmitGlobal};
