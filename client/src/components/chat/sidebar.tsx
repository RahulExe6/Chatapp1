import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  MessageSquare, 
  Compass, 
  Bell, 
  Settings, 
  LogOut 
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className={`flex-shrink-0 bg-background border-r border-border h-full flex flex-col items-center py-8 w-20 lg:w-80 ${className}`}>
      {/* Logo */}
      <div className="mb-8">
        <h1 className="hidden lg:block text-2xl font-bold text-primary">InstantChat</h1>
        <i className="lg:hidden fa-solid fa-bolt text-2xl text-primary"></i>
      </div>
      
      {/* Navigation Menu */}
      <nav className="w-full flex flex-col flex-grow">
        <Button 
          variant="ghost" 
          className="flex justify-start items-center px-4 py-3 text-primary"
        >
          <MessageSquare className="h-5 w-5 mr-0 lg:mr-4" />
          <span className="ml-0 hidden lg:block">Messages</span>
        </Button>
        <Button 
          variant="ghost" 
          className="flex justify-start items-center px-4 py-3 text-muted-foreground"
        >
          <Compass className="h-5 w-5 mr-0 lg:mr-4" />
          <span className="ml-0 hidden lg:block">Discover</span>
        </Button>
        <Button 
          variant="ghost" 
          className="flex justify-start items-center px-4 py-3 text-muted-foreground"
        >
          <Bell className="h-5 w-5 mr-0 lg:mr-4" />
          <span className="ml-0 hidden lg:block">Notifications</span>
        </Button>
        <Button 
          variant="ghost" 
          className="flex justify-start items-center px-4 py-3 text-muted-foreground"
        >
          <Settings className="h-5 w-5 mr-0 lg:mr-4" />
          <span className="ml-0 hidden lg:block">Settings</span>
        </Button>
      </nav>
      
      {/* User Profile */}
      <div className="mt-auto w-full px-4 py-3 flex items-center cursor-pointer hover:bg-accent">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
          {user?.username?.charAt(0).toUpperCase()}
        </div>
        <div className="ml-4 hidden lg:block">
          <p className="font-medium text-sm">{user?.username}</p>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="ml-1 text-xs text-muted-foreground">Online</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-auto text-muted-foreground hidden lg:flex"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
