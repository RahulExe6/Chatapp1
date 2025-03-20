
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function ProfileSetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const defaultAvatar = `https://api.dicebear.com/7.x/micah/svg?seed=${Date.now()}`;
  const [profilePicture, setProfilePicture] = useState(defaultAvatar);
  const [showAvatars, setShowAvatars] = useState(false);

  const avatarOptions = Array.from({ length: 9 }, (_, i) => 
    `https://api.dicebear.com/7.x/micah/svg?seed=${i + 1}`
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await apiRequest.patch("/api/user/profile", { name, profilePicture });
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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6 space-y-6 bg-card rounded-lg shadow-lg">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Complete Your Profile</h2>
          <p className="text-muted-foreground">Add a name and profile picture to help people recognize you</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <motion.div 
              className="relative w-24 h-24 mb-4 cursor-pointer group"
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowAvatars(!showAvatars)}
            >
              <img 
                src={profilePicture} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </motion.div>

            {showAvatars && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 gap-3 p-3 bg-muted rounded-lg"
              >
                {avatarOptions.map((avatar, index) => (
                  <motion.img
                    key={index}
                    src={avatar}
                    alt={`Avatar option ${index + 1}`}
                    className={cn(
                      "w-16 h-16 rounded-full cursor-pointer border-2 transition-all",
                      profilePicture === avatar ? "border-primary" : "border-transparent"
                    )}
                    onClick={() => {
                      setProfilePicture(avatar);
                      setShowAvatars(false);
                    }}
                    whileHover={{ scale: 1.1 }}
                  />
                ))}
              </motion.div>
            )}

            <div className="w-full space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your display name"
                className="w-full"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleSkip}
            >
              Skip for now
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
