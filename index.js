/*
BirthdayPresent
An NPM module by Tomás Belmar da Costa
Last edited 2023
Designed for use with socket.io
*/

const ROOM_SEND = "BDAY_PRESENT_ROOM_SEND";
const ROOM_RCV = "BDAY_PRESENT_ROOM_RCV";

class Present {
  message;
  openDate;
  dateWrapped;

  constructor(message, openDate) {
    this.message = message;
    this.openDate = openDate;
    this.dateWrapped = Date.now();
  }

  open(callback) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (callback) callback(this.message);
        resolve(this.message);
      }, this.openDate - Date.now());
    });
  }

  setMessage(message) {
    this.message = message;
  }

  setDate(date) {
    this.openDate = date;
    this.dateWrapped = Date.now();
  }

  static rewrap({ message, openDate }) {
    return new Present(message, openDate);
  }
}

class Packager {
  static ROOM_SEND = ROOM_SEND;
  static ROOM_RCV = ROOM_RCV;

  startTimes = {};
  maxLatency = 0;

  constructor(socket) {
    if (!socket) {
      throw new Error("Please supply a socket");
    }

    this.socket = socket;

    this.calculateLatency();
  }

  calculateLatency({
    testSize = 10,
    persistent = false,
    interval = 1000,
  } = {}) {
    const work = () => {
      this.startTimes = {};
      this.maxLatency = 0;

      this.socket.on(Packager.ROOM_SEND, (identifier) => {
        this.socket.emit(Packager.ROOM_RCV, identifier);
      });

      this.socket.on(Packager.ROOM_RCV, (identifier) => {
        const latency = Date.now() - this.startTimes[identifier];

        if (latency > this.maxLatency) {
          this.maxLatency = latency;
        }
      });

      for (let i = 0; i < testSize; i++) {
        const identifier = Math.random();

        this.startTimes[identifier] = Date.now();

        this.socket.emit(Packager.ROOM_SEND, identifier);
      }
    };

    if (persistent) {
      setInterval(work, interval);
    } else {
      work();
    }
  }

  wrap(message) {
    return new Present(message, new Date(Date.now() + this.maxLatency));
  }
}

class Deliverer {
  static ROOM_SEND = ROOM_SEND;
  static ROOM_RCV = ROOM_RCV;

  static setup(room, socket) {
    if (!room || !room.emit) {
      throw new Error(
        "Please supply a room object with an [emit] function parameter"
      );
    }

    if (!socket || !socket.on) {
      throw new Error(
        "Please supply a socket object with an [on] function parameter"
      );
    }

    this.socket = socket;
    this.room = room;

    socket.on(ROOM_RCV, (data) => {
      room.emit(ROOM_RCV, data);
    });

    socket.on(ROOM_SEND, (data) => {
      room.emit(ROOM_SEND, data);
    });
  }
}

module.exports = {
  Packager,
  Deliverer,
  Present,
};
