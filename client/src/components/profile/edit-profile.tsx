import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function EditProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const defaultAvatar = `https://api.dicebear.com/7.x/micah/svg?seed=${user?.username || 'default'}`;
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || defaultAvatar);
  const [showAvatars, setShowAvatars] = useState(false);

  const avatarOptions = Array.from({ length: 9 }, (_, i) =>
    `https://api.dicebear.com/7.x/micah/svg?seed=${i + 1}`
  );

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; profilePicture: string }) => {
      return apiRequest.patch("/api/user/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast({ description: "Profile updated successfully!" });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({ description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ name, profilePicture });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full p-2 flex flex-col items-center justify-center gap-2">
          <div className="relative group">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name || user.username}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-semibold">{user?.username?.[0]?.toUpperCase()}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-5 w-5 text-white" />
            </div>
          </div>
          <span className="text-sm font-medium">Edit Profile</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Edit Profile</DialogTitle>
          <DialogDescription className="text-center">
            Customize how others see you on InstantChat
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <motion.div
              className="relative w-24 h-24 cursor-pointer group"
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowAvatars(!showAvatars)}
            >
              <img
                src={profilePicture}
                alt={name || user?.username}
                className="w-24 h-24 rounded-full object-cover border-2 border-primary/20"
              />
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-8 w-8 text-white" />
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

          <DialogFooter className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}