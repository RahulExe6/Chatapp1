import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Message, User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Phone, Video, Info, Image, Smile } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import AvatarWithStatus from "@/components/ui/avatar-with-status";

interface ChatAreaProps {
  selectedUserId: number | null;
}

export default function ChatArea({ selectedUserId }: ChatAreaProps) {
  const { user: currentUser } = useAuth();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get selected user details
  const { data: selectedUserDetails } = useQuery<User | null>({
    queryKey: ["/api/users", selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return null;
      const allUsers = await queryClient.fetchQuery({
        queryKey: ["/api/users"],
      }) as User[];
      return allUsers.find(u => u.id === selectedUserId) || null;
    },
    enabled: !!selectedUserId,
  });
  
  // Get messages between current user and selected user
  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedUserId],
    enabled: !!selectedUserId,
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedUserId) throw new Error("No recipient selected");
      const res = await apiRequest("POST", "/api/messages", {
        receiverId: selectedUserId,
        content
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
    }
  });
  
  // Handle send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(messageText);
      setMessageText("");
    }
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Group messages by date
  const groupedMessages: Record<string, Message[]> = {};
  messages?.forEach(message => {
    const date = new Date(message.timestamp);
    const dateKey = format(date, "yyyy-MM-dd");
    
    if (!groupedMessages[dateKey]) {
      groupedMessages[dateKey] = [];
    }
    
    groupedMessages[dateKey].push(message);
  });
  
  const formatMessageTime = (timestamp: Date) => {
    return format(new Date(timestamp), "h:mm a");
  };
  
  const formatDateLabel = (dateKey: string) => {
    const date = new Date(dateKey);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
      return "Today";
    } else if (format(date, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")) {
      return "Yesterday";
    } else {
      return format(date, "MMMM d, yyyy");
    }
  };
  
  if (!selectedUserId) {
    return (
      <div className="hidden md:flex md:w-2/3 flex-col bg-background items-center justify-center text-center p-6">
        <div className="max-w-sm">
          <MessageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
          <p className="text-muted-foreground">
            Select a chat to start messaging
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full md:w-2/3 flex flex-col bg-background">
      {/* Chat Header */}
      <motion.div 
        className="p-4 border-b border-border flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center">
          <AvatarWithStatus
            src={selectedUserDetails?.profilePicture}
            name={selectedUserDetails?.name}
            username={selectedUserDetails?.username || ""}
            isOnline={selectedUserDetails?.isOnline}
            size="md"
          />
          <div className="ml-3">
            <h3 className="font-semibold">{selectedUserDetails?.name || selectedUserDetails?.username}</h3>
            <div className="flex items-center">
              <span className="text-xs text-muted-foreground">
                {selectedUserDetails?.isOnline ? "Active now" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" size="icon">
              <Phone className="h-5 w-5 text-muted-foreground" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" size="icon">
              <Video className="h-5 w-5 text-muted-foreground" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" size="icon">
              <Info className="h-5 w-5 text-muted-foreground" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Chat Messages */}
      <div className="flex-grow p-4 overflow-y-auto bg-muted/30 space-y-4">
        {messagesLoading ? (
          <div className="flex justify-center my-4">
            <span className="text-muted-foreground">Loading messages...</span>
          </div>
        ) : messages?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center mb-4">
              <MessageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No messages yet</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          Object.keys(groupedMessages).map(dateKey => (
            <div key={dateKey}>
              {/* Date Separator */}
              <div className="flex justify-center mb-4">
                <div className="px-4 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                  {formatDateLabel(dateKey)}
                </div>
              </div>
              
              {/* Messages for this date */}
              <div className="space-y-4">
                {groupedMessages[dateKey].map((message, index) => (
                  <motion.div 
                    key={message.id} 
                    className={cn(
                      "flex items-end max-w-xs",
                      message.senderId === currentUser?.id ? "justify-end ml-auto" : ""
                    )}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    {message.senderId !== currentUser?.id && (
                      <AvatarWithStatus
                        src={selectedUserDetails?.profilePicture}
                        name={selectedUserDetails?.name}
                        username={selectedUserDetails?.username || ""}
                        size="sm"
                        showStatus={false}
                      />
                    )}
                    <div>
                      <motion.div 
                        className={cn(
                          "p-3 mb-1",
                          message.senderId === currentUser?.id 
                            ? "bg-primary text-primary-foreground rounded-2xl rounded-br-none" 
                            : "bg-secondary/10 text-foreground rounded-2xl rounded-bl-none"
                        )}
                        whileHover={{ scale: 1.02 }}
                      >
                        <p className="text-sm">{message.content}</p>
                      </motion.div>
                      <p className={cn(
                        "text-xs text-muted-foreground",
                        message.senderId === currentUser?.id ? "text-right" : ""
                      )}>
                        {formatMessageTime(message.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <motion.div
        className="p-4 border-t border-border bg-background"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <form className="flex items-center" onSubmit={handleSendMessage}>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button type="button" variant="ghost" size="icon">
              <Image className="h-5 w-5 text-muted-foreground" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button type="button" variant="ghost" size="icon">
              <Smile className="h-5 w-5 text-muted-foreground" />
            </Button>
          </motion.div>
          <Input 
            type="text" 
            placeholder="Type a message..." 
            className="flex-grow mx-2 bg-muted border-none rounded-full"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
          <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button 
              type="submit" 
              variant={messageText.trim() ? "default" : "ghost"}
              size="icon" 
              className={messageText.trim() ? "bg-primary text-primary-foreground" : "text-muted-foreground"}
              disabled={sendMessageMutation.isPending || !messageText.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}

function MessageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
