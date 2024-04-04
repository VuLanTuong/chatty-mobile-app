import { createContext, useContext, useEffect } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

const BASE_URL = "http://ec2-52-221-252-41.ap-southeast-1.compute.amazonaws.com:8555"

const SocketContext = createContext()

let socket = io(BASE_URL)
export const SocketProvider = ({ children }) => {
    const currentUser = useSelector(state => state.user.user);
    console.log(currentUser);
    useEffect(() => {

        // socket = io(BASE_URL)
        if (currentUser._id) {
            const { email, avatar, name, _id } = currentUser;

            socket.emit('user_connected', { userId: _id })

        }
        return () => {
            // socket.disconnect()
        }

    }, [currentUser])
    return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>
}

export const useSocket = () => {
    return useContext(SocketContext);
}