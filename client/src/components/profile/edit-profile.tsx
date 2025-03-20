
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";

export default function EditProfile() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
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
      const response = await apiRequest("PATCH", "/api/user/profile", { name, profilePicture });
      toast({ description: "Profile updated successfully!" });
      setShowAvatars(false);
      setIsOpen(false); // Close the dialog
      window.location.reload(); // Refresh to show updated profile
    } catch (error) {
      toast({ description: "Failed to update profile", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Edit Profile</h2>
          <p className="text-muted-foreground">Update your profile information</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <motion.div 
              className="relative w-24 h-24 cursor-pointer group"
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
                    className={`w-16 h-16 rounded-full cursor-pointer border-2 transition-all ${
                      profilePicture === avatar ? "border-primary" : "border-transparent"
                    }`}
                    onClick={() => setProfilePicture(avatar)}
                    whileHover={{ scale: 1.1 }}
                  />
                ))}
              </motion.div>
            )}

            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your display name"
              className="w-full"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowAvatars(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
