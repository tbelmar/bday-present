/*
BirthdayPresent
An NPM module by Tomás Belmar da Costa
Last edited 2023
Designed for use with socket.io, but configurable for any 
*/

class BirthdayPresent {
  static ROOM_SEND = "BDAY_PRESENT_ROOM_SEND";
  static ROOM_RCV = "BDAY_PRESENT_ROOM_RCV";
  static TEST_SIZE = 10;

  emitter = null;
  receiver = null;

  startTimes = {};
  maxLatency = 0;

  constructor(emitter, receiver) {
    // throws error if emitter isn't proper
    if (!emitter || typeof emitter !== "function") {
      throw new Error(
        "Please supply an emitter function. An example in SocketIO would be socket.emit"
      );
    }

    // throws error if receiver isn't proper
    if (!receiver || typeof receiver !== "function") {
      throw new Error(
        "Please supply a receiver function. An example in SocketIO would be socket.on"
      );
    }

    this.emitter = emitter;
    this.receiver = receiver;

    receiver(BirthdayPresent.ROOM_SEND, (identifier) => {
      emitter(BirthdayPresent.ROOM_RCV, identifier);
    });
  }

  // takes in an emitter and a receiver function. For SocketIO you might use calculateLatency like so:
  // calculateLatency(socket.emit, socket.on)
  calculateLatency() {
    this.startTimes = {};
    this.maxLatency = 0;

    receiver(BirthdayPresent.ROOM_RCV, (identifier) => {
      const latency = Date.now() - this.startTimes[identifier];

      if (latency > this.maxLatency) {
        this.maxLatency = latency;
      }
    });

    for (let i = 0; i < BirthdayPresent.TEST_SIZE; i++) {
      const identifier = Math.random();

      this.startTimes[identifier] = Date.now();

      emitter(BirthdayPresent.ROOM_SEND, identifier);
    }
  }

  wrapPresent(message) {}
}

class Present {
  data;
  openDate;

  constructor(data, openDate) {
    this.data = data;
    this.openDate = openDate;
  }

  open(callback) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (callback) callback(this.data);
        resolve(this.data);
      }, this.openDate - Date.now());
    });
  }
}

const emitter = (room, msg) => {};

const receiver = (room, msg) => {};

const p = new Present("woohooo", new Date(2023, 1, 24, 6, 37, 40, 0));

const d = p.open((data) => {
  console.log(data);
});

d.then((data) => {
  console.log(data);
});
