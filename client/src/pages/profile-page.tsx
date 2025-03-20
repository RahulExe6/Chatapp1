import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, Settings, BookmarkIcon, GridIcon, TagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import EditProfile from "@/components/profile/edit-profile";
import AvatarWithStatus from "@/components/ui/avatar-with-status";

// Simple Starry Background Component (Replace with more sophisticated implementation if needed)
const StarryBackground = () => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundImage: "linear-gradient(to bottom, #000000, #111111), url('/starry-night.jpg')", //replace with actual image path
      backgroundSize: "cover",
      backgroundPosition: "center",
      opacity: 0.8,
      zIndex: -1,
      borderRadius: "50%"
    }}
  />
);


export default function ProfilePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      setLocation("/auth");
    }
  }, [user, setLocation]);

  if (!user) return null;


  return (
    <div className="flex flex-col min-h-screen bg-background overflow-y-auto relative">
      <StarryBackground /> {/* Added starry background */}
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border p-4 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/")}
          className="mr-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold flex-1">{user.name || user.username}</h1>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </header>

      {/* Profile Info */}
      <motion.div
        className="p-6 pb-8 bg-black" // Changed background to black
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-32 h-32 md:w-40 md:h-40 scale-100"
          >
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900 animate-[pulse_4s_ease-in-out_infinite]">
                <div className="absolute inset-0 bg-[url('/stars.png')] opacity-50"></div>
              </div>
            </div>
            <AvatarWithStatus
              src={user.profilePicture}
              username={user.username}
              name={user.name}
              isOnline={true}
              size="lg"
              showStatus={false}
              className="relative z-10 w-full h-full aspect-square rounded-full border-4 border-white/30"
            />
          </motion.div>

          {/* Profile Info */}
          <div className="flex flex-col text-center md:text-left flex-1 text-white">
            <motion.h2
              className="text-2xl font-bold mb-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {user.name || user.username}
            </motion.h2>

            <motion.p
              className="text-sm text-white/80 mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              @{user.username}
            </motion.p>

            <motion.div
              className="flex flex-wrap justify-center md:justify-start gap-4 mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex flex-col items-center md:items-start">
                <span className="font-bold">0</span>
                <span className="text-xs text-white/80">Posts</span>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <span className="font-bold">0</span>
                <span className="text-xs text-white/80">Followers</span>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <span className="font-bold">0</span>
                <span className="text-xs text-white/80">Following</span>
              </div>
            </motion.div>

            <motion.div
              className="mt-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <EditProfile />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Content Tabs */}
      <div className="flex-1 bg-background">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="posts" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <GridIcon className="h-5 w-5" />
              <span className="sr-only md:not-sr-only md:ml-2">Posts</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <BookmarkIcon className="h-5 w-5" />
              <span className="sr-only md:not-sr-only md:ml-2">Saved</span>
            </TabsTrigger>
            <TabsTrigger value="tagged" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <TagIcon className="h-5 w-5" />
              <span className="sr-only md:not-sr-only md:ml-2">Tagged</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="p-4 min-h-[200px] flex flex-col items-center justify-center text-center">
            <div className="p-6 max-w-sm">
              <GridIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Posts Yet</h3>
              <p className="text-muted-foreground text-sm">
                Your posts will appear here once you start sharing.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="saved" className="p-4 min-h-[200px] flex flex-col items-center justify-center text-center">
            <div className="p-6 max-w-sm">
              <BookmarkIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Saved Items</h3>
              <p className="text-muted-foreground text-sm">
                Save posts to find them easily later.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="tagged" className="p-4 min-h-[200px] flex flex-col items-center justify-center text-center">
            <div className="p-6 max-w-sm">
              <TagIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Tagged Posts</h3>
              <p className="text-muted-foreground text-sm">
                Posts you're tagged in will appear here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}