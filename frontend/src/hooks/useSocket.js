import { useEffect, useState } from "react";
import io from "socket.io-client";
import { tokenManager } from "../utils/tokenManager";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = tokenManager.getAccessToken();

    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected");
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return socket;
};
