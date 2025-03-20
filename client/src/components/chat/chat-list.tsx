import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { Chat } from "@shared/schema";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import AvatarWithStatus from "@/components/ui/avatar-with-status";

interface ChatListProps {
  onSelectChat: (chatId: number) => void;
  selectedChatId: number | null;
}

export default function ChatList({ onSelectChat, selectedChatId }: ChatListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: chats, isLoading } = useQuery<Chat[]>({
    queryKey: ["/api/chats"],
  });

  const filteredChats = chats?.filter(chat => 
    chat.username.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: false });
  };

  return (
    <div className="w-full md:w-1/3 border-r border-border bg-background overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Messages</h2>
      </div>
      
      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            type="text"
            placeholder="Search..." 
            className="pl-10 bg-muted" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Chat List */}
      <div className="divide-y divide-border">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">Loading chats...</div>
        ) : filteredChats.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchTerm ? "No chats match your search" : "No chats yet"}
          </div>
        ) : (
          filteredChats.map((chat, index) => (
            <motion.div 
              key={chat.id}
              className={cn(
                "p-4 flex items-center cursor-pointer hover:bg-accent/10",
                selectedChatId === chat.id ? "bg-accent/10" : ""
              )}
              onClick={() => onSelectChat(chat.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              whileHover={{ x: 5 }}
            >
              <AvatarWithStatus
                src={chat.profilePicture}
                name={chat.name}
                username={chat.username}
                isOnline={chat.isOnline}
                size="lg"
              />
              <div className="ml-3 flex-grow">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-sm">{chat.name || chat.username}</h3>
                  <span className="text-xs text-muted-foreground">{formatTimestamp(chat.timestamp)}</span>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground truncate max-w-[180px]">{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <motion.span 
                      className="ml-2 bg-primary text-primary-foreground text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      {chat.unread}
                    </motion.span>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
