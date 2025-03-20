import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, UserRound } from "lucide-react";
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
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="h-full w-full p-0 flex flex-col items-center justify-center">
          {user?.profilePicture ? (
            <img 
              src={user.profilePicture} 
              alt={user.name || user.username} 
              className="h-12 w-12 rounded-full object-cover mb-1"
            />
          ) : (
            <div className={cn("h-12 w-12 rounded-full flex items-center justify-center text-white mb-1", avatar.bgColor)}>
              {avatar.initials}
            </div>
          )}
          <span className="text-xs font-medium">Edit Profile</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update your profile information here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your display name"
            />
          </div>

          <div className="space-y-3">
            <Label>Profile Picture</Label>
            <div className="grid grid-cols-3 gap-2">
              {/* First option: No profile picture (use initials) */}
              <motion.button
                type="button"
                className={cn(
                  "aspect-square rounded-md flex items-center justify-center border-2",
                  !profilePicture ? "border-primary" : "border-transparent hover:border-gray-300"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setProfilePicture("")}
              >
                <div className={cn("h-12 w-12 rounded-full flex items-center justify-center text-white", avatar.bgColor)}>
                  {avatar.initials}
                </div>
                {!profilePicture && (
                  <div className="absolute bottom-1 right-1 bg-green-500 text-white rounded-full p-0.5">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </motion.button>

              {/* Avatar options */}
              {avatarOptions.map((avatarUrl, index) => (
                <motion.button
                  key={index}
                  type="button"
                  className={cn(
                    "aspect-square rounded-md flex items-center justify-center border-2 relative",
                    profilePicture === avatarUrl ? "border-primary" : "border-transparent hover:border-gray-300"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setProfilePicture(avatarUrl)}
                >
                  <img src={avatarUrl} alt={`Avatar option ${index + 1}`} className="h-12 w-12 rounded-full" />
                  {profilePicture === avatarUrl && (
                    <div className="absolute bottom-1 right-1 bg-green-500 text-white rounded-full p-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateProfileMutation.isPending}
              className="flex items-center gap-1"
            >
              {updateProfileMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}