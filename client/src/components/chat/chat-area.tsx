import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Message, User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Phone, Video, Info } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

interface ChatAreaProps {
  selectedUserId: number | null;
}

export default function ChatArea({ selectedUserId }: ChatAreaProps) {
  const { user: currentUser } = useAuth();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get selected user details
  const { data: selectedUserDetails } = useQuery<User>({
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
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            {selectedUserDetails?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <h3 className="font-semibold">{selectedUserDetails?.username}</h3>
            <div className="flex items-center">
              <div className={cn(
                "w-2 h-2 rounded-full",
                selectedUserDetails?.isOnline ? "bg-green-500" : "bg-gray-400"
              )}></div>
              <span className="ml-1 text-xs text-muted-foreground">
                {selectedUserDetails?.isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex">
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon">
            <Info className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </div>
      
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
                {groupedMessages[dateKey].map((message) => (
                  <div 
                    key={message.id} 
                    className={cn(
                      "flex items-end max-w-xs",
                      message.senderId === currentUser?.id ? "justify-end ml-auto" : ""
                    )}
                  >
                    {message.senderId !== currentUser?.id && (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mr-2">
                        {selectedUserDetails?.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div 
                        className={cn(
                          "p-3 mb-1",
                          message.senderId === currentUser?.id 
                            ? "bg-primary text-primary-foreground rounded-2xl rounded-br-none" 
                            : "bg-secondary/10 text-foreground rounded-2xl rounded-bl-none"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className={cn(
                        "text-xs text-muted-foreground",
                        message.senderId === currentUser?.id ? "text-right" : ""
                      )}>
                        {formatMessageTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <div className="p-4 border-t border-border bg-background">
        <form className="flex items-center" onSubmit={handleSendMessage}>
          <Button type="button" variant="ghost" size="icon">
            <svg className="h-5 w-5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </Button>
          <Button type="button" variant="ghost" size="icon">
            <svg className="h-5 w-5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
          </Button>
          <Input 
            type="text" 
            placeholder="Type a message..." 
            className="flex-grow mx-2 bg-muted border-none rounded-full"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
          <Button 
            type="submit" 
            variant="ghost" 
            size="icon" 
            className="text-primary"
            disabled={sendMessageMutation.isPending || !messageText.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
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
