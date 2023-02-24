/*
BirthdayPresent
An NPM module by Tomás Belmar da Costa
Last edited 2023
Designed for use with socket.io, but configurable for any 
*/

module.exports = {
  DeliveryService,
  Present,
};

class DeliveryService {
  static ROOM_SEND = "BDAY_PRESENT_ROOM_SEND";
  static ROOM_RCV = "BDAY_PRESENT_ROOM_RCV";

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

    receiver(DeliveryService.ROOM_SEND, (identifier) => {
      emitter(DeliveryService.ROOM_RCV, identifier);
    });
  }

  calculateLatency({ testSize = 10, persistent = false, interval = 1000 }) {
    const work = () => {
      this.startTimes = {};
      this.maxLatency = 0;

      receiver(DeliveryService.ROOM_RCV, (identifier) => {
        const latency = Date.now() - this.startTimes[identifier];

        if (latency > this.maxLatency) {
          this.maxLatency = latency;
        }
      });

      for (let i = 0; i < testSize; i++) {
        const identifier = Math.random();

        this.startTimes[identifier] = Date.now();

        emitter(DeliveryService.ROOM_SEND, identifier);
      }
    };

    if (persistent) {
      setInterval(work, interval);
    } else {
      work();
    }
  }

  wrap(message) {
    return new Present(message, new Date() + this.maxLatency);
  }
}

class Present {
  message;
  openDate;
  dateWrapped;

  constructor(data, openDate) {
    this.data = data;
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

  rewrap() {
    this.openDate = Date.now() + (this.openDate - this.dateWrapped);
    this.dateWrapped = Date.now();
  }
}
