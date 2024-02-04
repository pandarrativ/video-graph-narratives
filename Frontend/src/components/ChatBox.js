// components/ChatBox.js
import React, { useRef, useState, useEffect } from 'react';
import "../assets/css/ChatBox.css";
// import axios from "axios";
// import { widgetHelperRouter } from '../config/routeConfig';
import SenderIcon from "../assets/icon/icon_message_send.svg";
import axios from 'axios';
import { chatRouter } from '../utils/router';

const ChatBox = (props) => {
    const [messages, setMessages] = useState([]);
    const [msg, setMsg] = useState("");

    // send msg to gpt after user input
    const sendToGPT = () => {
      // setMessages([...messages, {role:"assistant", content:"It is a alpaca with its head looking to the right."}])
      // console.log(JSON.parse(localStorage.getItem("ann-boxes")));
      console.log(messages)
      let image = props.captureScreenshot();

      axios.post(chatRouter, {
        boxes:JSON.parse(localStorage.getItem("ann-boxes")),
        messages:messages,
        image:image,
      })
      .then((resp) => {
        console.log(resp);
        setMessages([...messages, {role:"assistant", content:resp.data.resp.content}])
      })
      .catch((e) => {
        console.log(e);
      })
    }
    // button click
    const sendMessage = (e) => {
        e.preventDefault();
        setMessages([...messages, {role:"user", content:msg}])
        setMsg("");
    }

    const handleMsgChange = (e) => {
        setMsg(e.target.value);
    }

    useEffect(() => {
      if(messages[messages.length-1] && messages[messages.length-1].role === "user"){
        sendToGPT();
      }
    }, [messages, sendToGPT])



      // scroll to bottom
    const messagesEndRef = useRef();
      useEffect(() => {
          // scrollRef.current?.scrollIntoView({ behavior: "smooth" });
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

  return (
    <div className="helper-conversation">
      <div className='helper-conversation-header'>
          Conversation
      </div>

      <div className='helper-conversation-body'>


          {messages.map((item, i) => {
              return (
                  <div className={`helper-conversation-message-box helper-conversation-message-me-${item.role === "user"}`} key={i}>
                      <div>
                          {item.content}
                      </div>
                  </div>

                  );
              })}
                  
              <div ref={messagesEndRef} />
      </div>

      <form className='helper-conversation-bottom' onSubmit={sendMessage}>
          <input className='helper-conversation-message-input' placeholder='Type your message' type='text' onChange={handleMsgChange} value={msg}></input>
          <button type='submit' className="helper-conversation-btn">
                  <img src={SenderIcon} alt="icon for sending message"></img>
          </button>
      </form>
  </div>
  );
};

export default ChatBox;
