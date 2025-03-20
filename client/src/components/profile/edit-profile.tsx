import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, UserRound, Pencil, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function EditProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || "");

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name?: string; profilePicture?: string }) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return await res.json() as Omit<User, "password">;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
        variant: "default",
      });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Simple avatars with different colors
  const generateAvatar = (name: string = "") => {
    const initials = name ? name.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || "";
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-green-500",
      "bg-teal-500",
      "bg-indigo-500",
    ];
    const colorIndex = (name || user?.username || "").length % colors.length;
    
    return {
      initials,
      bgColor: colors[colorIndex]
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: { name?: string; profilePicture?: string } = {};
    
    if (name !== user?.name) updates.name = name;
    if (profilePicture !== user?.profilePicture) updates.profilePicture = profilePicture;
    
    if (Object.keys(updates).length > 0) {
      updateProfileMutation.mutate(updates);
    } else {
      setOpen(false);
    }
  };

  // Avatar options for the user to choose from
  const avatarOptions = [
    "https://api.dicebear.com/7.x/micah/svg?seed=1",
    "https://api.dicebear.com/7.x/micah/svg?seed=2",
    "https://api.dicebear.com/7.x/micah/svg?seed=3",
    "https://api.dicebear.com/7.x/micah/svg?seed=4",
    "https://api.dicebear.com/7.x/micah/svg?seed=5",
    "https://api.dicebear.com/7.x/micah/svg?seed=6",
    "https://api.dicebear.com/7.x/micah/svg?seed=7",
    "https://api.dicebear.com/7.x/micah/svg?seed=8",
    "https://api.dicebear.com/7.x/micah/svg?seed=9",
  ];

  const avatar = generateAvatar(user?.name || "");

  // Update state when user changes
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setProfilePicture(user.profilePicture || "");
    }
  }, [user]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="h-full w-full p-0 flex flex-col items-center justify-center">
          <div className="relative group">
            {user?.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt={user.name || user.username} 
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className={cn("h-14 w-14 rounded-full flex items-center justify-center text-white", avatar.bgColor)}>
                {avatar.initials}
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Pencil className="h-5 w-5 text-white" />
            </div>
          </div>
          <span className="text-xs font-medium mt-2">Edit Profile</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-center pb-4 border-b">
          <DialogTitle className="text-xl font-bold">Edit Profile</DialogTitle>
          <DialogDescription>
            Customize how others see you on InstantChat
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          {/* Profile picture selection with preview */}
          <div className="flex flex-col items-center mb-6">
            <motion.div 
              className="relative w-24 h-24 mb-4 cursor-pointer group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {profilePicture ? (
                <img 
                  src={profilePicture} 
                  alt={name || user?.username} 
                  className="w-24 h-24 rounded-full object-cover border-2 border-primary/20"
                />
              ) : (
                <div className={cn("w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold", avatar.bgColor)}>
                  {avatar.initials}
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-8 w-8 text-white" />
              </div>
            </motion.div>
            <p className="text-sm text-muted-foreground">Tap to change your profile picture</p>
          </div>

          {/* Display name field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Display Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your display name"
              className="focus-visible:ring-primary"
            />
            <p className="text-xs text-muted-foreground">
              This is how people will see you in the app
            </p>
          </div>

          {/* Avatar options grid */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Choose an Avatar</Label>
            <div className="grid grid-cols-3 gap-3">
              {/* First option: No profile picture (use initials) */}
              <motion.button
                type="button"
                className={cn(
                  "aspect-square rounded-lg flex items-center justify-center border-2 relative overflow-hidden",
                  !profilePicture ? "border-primary" : "border-transparent hover:border-primary/50"
                )}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setProfilePicture("")}
              >
                <div className={cn("h-16 w-16 rounded-full flex items-center justify-center text-white text-lg", avatar.bgColor)}>
                  {avatar.initials}
                </div>
                <AnimatePresence>
                  {!profilePicture && (
                    <motion.div 
                      className="absolute bottom-1 right-1 bg-primary text-primary-foreground rounded-full p-1"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Check className="h-3 w-3" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Avatar options */}
              {avatarOptions.map((avatarUrl, index) => (
                <motion.button
                  key={index}
                  type="button"
                  className={cn(
                    "aspect-square rounded-lg flex items-center justify-center border-2 relative overflow-hidden",
                    profilePicture === avatarUrl ? "border-primary" : "border-transparent hover:border-primary/50"
                  )}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setProfilePicture(avatarUrl)}
                >
                  <img src={avatarUrl} alt={`Avatar option ${index + 1}`} className="h-full w-full object-cover" />
                  <AnimatePresence>
                    {profilePicture === avatarUrl && (
                      <motion.div 
                        className="absolute bottom-1 right-1 bg-primary text-primary-foreground rounded-full p-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Check className="h-3 w-3" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t gap-3 flex-col sm:flex-row">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full sm:w-auto" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateProfileMutation.isPending}
              className="w-full sm:w-auto flex items-center justify-center gap-2"
            >
              {updateProfileMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}