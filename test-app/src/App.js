import io from "socket.io-client";
import { Packager, Present } from "bday-present";

import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [socket, setSocket] = useState();
  const [packager, setPackager] = useState();

  let connected = false;

  const sendPresent = () => {
    /*const present = new Present(
      "hello there",
      new Date(2023, 1, 24, 18, 50, 20)
    );*/
    const present = packager.wrap("hello there this is a message");

    console.log(present);

    socket.emit("send_delivery", present);
  };

  useEffect(() => {
    if (!connected) {
      setSocket(io.connect("http://localhost:5000/"));
      connected = true;
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("receive_delivery", (delivery) => {
      const p = Present.rewrap(delivery);
      p.openDate = new Date(p.openDate);
      p.open((data) => {
        console.log("Message Received:", data);
        console.log("At time:", Date.now());
      });
    });

    const p = new Packager(socket);
    p.calculateLatency();

    setPackager(p);
  }, [socket]);

  return (
    <div className="App">
      <button onClick={sendPresent}>Send Message</button>
    </div>
  );
}

export default App;
