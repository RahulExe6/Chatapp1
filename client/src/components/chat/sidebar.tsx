import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  MessageSquare, 
  Compass, 
  Bell, 
  Settings, 
  LogOut,
  Users,
  Home,
  UserRound
} from "lucide-react";
import { motion } from "framer-motion";
import AvatarWithStatus from "@/components/ui/avatar-with-status";
import EditProfile from "@/components/profile/edit-profile";

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
        {[
          { icon: Home, label: "Home", path: "/", active: location === "/" },
          { icon: MessageSquare, label: "Messages", path: "/", active: location === "/" },
          { icon: UserRound, label: "Profile", path: "/profile", active: location === "/profile" },
          { icon: Users, label: "Connections", path: "/", active: false },
          { icon: Bell, label: "Notifications", path: "/", active: false },
          { icon: Settings, label: "Settings", path: "/", active: false }
        ].map((item, index) => (
          <motion.div 
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ x: 5 }}
          >
            <Button 
              variant="ghost" 
              className={`flex justify-start items-center px-4 py-3 w-full ${item.active ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={() => setLocation(item.path)}
            >
              <item.icon className="h-5 w-5 mr-0 lg:mr-4" />
              <span className="ml-0 hidden lg:block">{item.label}</span>
              {item.active && (
                <motion.div 
                  className="h-6 w-1 bg-primary absolute right-0 rounded-l-full"
                  layoutId="activeNav"
                />
              )}
            </Button>
          </motion.div>
        ))}
      </nav>
      
      {/* User Profile and Edit Profile */}
      <div className="mt-auto w-full flex flex-col">
        <motion.div 
          className="px-4 py-3 flex items-center hover:bg-accent/50 transition-colors rounded-md mx-2 cursor-pointer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          onClick={() => setLocation("/profile")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <AvatarWithStatus 
            src={user?.profilePicture}
            name={user?.name}
            username={user?.username || ""}
            isOnline={true}
            size="md"
          />
          <div className="ml-3 hidden lg:block">
            <p className="font-medium text-sm">{user?.name || user?.username}</p>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="ml-1 text-xs text-muted-foreground">Online</span>
            </div>
          </div>
          <motion.div
            className="ml-auto hidden lg:block"
            whileHover={{ rotate: 15 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the parent click
                handleLogout();
              }}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
        
        {/* Edit Profile Button */}
        <motion.div
          className="pt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <EditProfile />
        </motion.div>
      </div>
    </div>
  );
}
