"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Search, Send, ShieldCheck, User, Loader2, ChevronLeft } from "lucide-react";
import api from "@/lib/api";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";

export default function AdminSupportInbox() {
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const q = query(collection(db, "support_chats"), orderBy("updatedAt", "desc"), limit(50));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChats(chatList);
      setIsLoading(false);
    }, (error) => {
      console.error("Chat list sync error:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!activeChat) return;
    
    const messagesRef = collection(db, "support_chats", activeChat.userId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      
      // Auto-scroll on new message
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    }, (error) => {
      console.error("Messages sync error:", error);
    });

    return () => unsubscribe();
  }, [activeChat]);


  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeChat) return;

    const text = replyText;
    setReplyText("");
    setIsSending(true);

    try {
      await api.post(`/chat/admin/chats/${activeChat.userId}/send`, { text });
    } catch (error) {
      toast.error("Failed to send reply");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-dark-900 dark:text-cream-50">Support <span className="text-gold-400 italic">Inbox.</span></h1>
          <p className="text-gray-500 mt-2">Manage all live customer and seller inquiries.</p>
        </div>
      </div>

      <div className="glass-ultra crystal-border rounded-[32px] md:rounded-[40px] overflow-hidden flex h-[75vh] md:h-[70vh] shadow-xl relative">
        {/* Left: Chat List */}
        <div className={`w-full lg:w-1/3 border-r border-gold-400/10 bg-white/50 dark:bg-dark-900/50 flex flex-col ${showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 md:p-6 border-b border-gold-400/10">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search users..." 
                className="w-full bg-cream-50 dark:bg-dark-800 rounded-xl py-3 pl-10 pr-4 text-sm outline-none border border-gold-400/10 focus:border-gold-400 transition-all"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-none divide-y divide-gold-400/5">
            {chats.length === 0 ? (
               <div className="p-10 text-center text-gray-400 text-sm">No active chats.</div>
            ) : (
              chats.map(chat => (
                <button 
                  key={chat.id}
                  onClick={() => {
                    setActiveChat(chat);
                    setShowMobileChat(true);
                  }}
                  className={`w-full p-4 md:p-6 text-left hover:bg-gold-400/5 transition-all flex items-start gap-3 md:gap-4 ${activeChat?.id === chat.id ? 'bg-gold-400/10 border-l-4 border-gold-400' : 'border-l-4 border-transparent'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-gold-400/20 text-gold-500 flex items-center justify-center shrink-0 font-bold uppercase">
                    {chat.userName?.[0] || <User className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-dark-900 dark:text-cream-50 truncate">{chat.userName}</h4>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-1">{chat.lastMessage}</p>
                    <p className="text-[9px] text-gold-400 uppercase tracking-widest font-bold mt-2">{chat.userRole}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Active Chat Window */}
        <div className={`w-full lg:w-2/3 flex flex-col bg-cream-50/30 dark:bg-black/20 ${!showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 md:p-6 border-b border-gold-400/10 bg-white/50 dark:bg-dark-900/50 flex items-center gap-3 md:gap-4">
                <button 
                  onClick={() => setShowMobileChat(false)}
                  className="lg:hidden p-2 -ml-2 text-gold-400 hover:bg-gold-400/10 rounded-xl"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gold-400/20 text-gold-500 flex items-center justify-center shrink-0 font-bold uppercase text-base md:text-lg">
                  {activeChat.userName?.[0] || <User className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-dark-900 dark:text-cream-50">{activeChat.userName}</h3>
                  <p className="text-xs text-gold-400 font-bold uppercase tracking-widest">{activeChat.userRole} • ID: {activeChat.userId.slice(-6)}</p>
                </div>
              </div>

              {/* Messages Area */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6 scrollbar-none">
                {messages.map((msg) => {
                  const isAdmin = msg.senderId === user?.id || msg.senderRole === 'ADMIN';
                  return (
                    <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-4 rounded-3xl text-sm shadow-sm ${
                        isAdmin 
                        ? 'bg-gold-400 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-dark-800 border border-gold-400/10 rounded-tl-none'
                      }`}>
                        {msg.text}
                        <p className={`text-[9px] mt-2 font-bold uppercase tracking-widest ${isAdmin ? 'text-white/60' : 'text-gray-400'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input Area */}
              <div className="p-4 md:p-6 bg-white dark:bg-dark-950 border-t border-gold-400/10">
                <form onSubmit={handleSend} className="relative flex items-center">
                  <input 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${activeChat.userName}...`}
                    className="w-full bg-cream-50 dark:bg-dark-900 h-14 rounded-2xl pl-6 pr-16 text-sm outline-none border border-gold-400/20 focus:border-gold-400 transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={!replyText.trim() || isSending}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gold-400 text-white rounded-xl flex items-center justify-center disabled:opacity-50 hover:scale-105 active:scale-95 transition-all shadow-gold"
                  >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 px-10">
               <ShieldCheck className="w-16 h-16 text-gold-400" />
               <div>
                 <h3 className="font-bold text-xl">Neural Support Center</h3>
                 <p className="text-sm mt-2">Select a user from the left pane to view their chat history and respond.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
