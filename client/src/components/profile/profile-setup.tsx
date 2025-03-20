
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

export default function ProfileSetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const defaultAvatar = `https://api.dicebear.com/7.x/micah/svg?seed=${Date.now()}`;
  const [profilePicture, setProfilePicture] = useState(defaultAvatar);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await apiRequest.patch("/api/user", { name, profilePicture });
      toast({ description: "Profile updated successfully!" });
      setLocation("/");
    } catch (error) {
      toast({ description: "Failed to update profile", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    setLocation("/");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Complete Your Profile</h2>
        <p className="text-muted-foreground">Add a name and profile picture to help people recognize you</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center">
          <motion.div 
            className="relative w-24 h-24 mb-4 cursor-pointer group"
            whileHover={{ scale: 1.05 }}
          >
            <img 
              src={profilePicture} 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover border-2 border-primary/20"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          <p className="text-sm text-muted-foreground">Tap to change your profile picture</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Display Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your display name"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleSkip} className="w-full">
            Skip for now
          </Button>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Setup
          </Button>
        </div>
      </form>
    </div>
  );
}
