import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [message, setMessage] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  const getUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("/api/messages/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendMessage = async (messageData) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`,messageData,
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          })
      if (data.success) {
        setMessage((prevMessages) => [...prevMessages, data.newMessage]);
      } else {
        toast.error(error.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getMessages = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      
      const { data } = await axios.get(`/api/messages/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success) {
        setMessage(data.messages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const subscribeToMessage = async () => {  
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      if (selectedUser && String(newMessage.senderId) === String(selectedUser._id)){
        newMessage.seen = true;
        setMessage((prev) => [...prev, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`,{},{  
          headers:{
            Authorization:`Bearer ${localStorage.getItem("token")}`
          }
         });
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1
        }));
      }
    });
  };

  const unsubscribeToMessage = async () => {
    if (socket) socket.off("newMessage");
  };
  useEffect(() => {
    subscribeToMessage();
    return () => unsubscribeToMessage();
  }, [socket, selectedUser]);


  const value = {
    message,
    users,
    selectedUser,
    getUser,
    sendMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    getMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
