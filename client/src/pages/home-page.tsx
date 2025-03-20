import { useState } from "react";
import Sidebar from "@/components/chat/sidebar";
import ChatList from "@/components/chat/chat-list";
import ChatArea from "@/components/chat/chat-area";
import MobileNav from "@/components/ui/mobile-nav";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // For smaller screens, show only chat area when a chat is selected
  const isMobileView = typeof window !== 'undefined' && window.innerWidth < 768;
  
  return (
    <div className="h-screen flex flex-col">
      <div className="h-full flex">
        {/* Sidebar - hide on mobile */}
        <Sidebar className="hidden md:flex" />
        
        {/* Main Content - Split View */}
        <div className="flex-grow flex h-full">
          {/* Chat List - hide on mobile when a chat is selected */}
          {(!isMobileView || !selectedChatId) && (
            <ChatList 
              onSelectChat={setSelectedChatId} 
              selectedChatId={selectedChatId} 
            />
          )}
          
          {/* Chat Area */}
          {(isMobileView && selectedChatId) || !isMobileView ? (
            <ChatArea selectedUserId={selectedChatId} />
          ) : null}
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
