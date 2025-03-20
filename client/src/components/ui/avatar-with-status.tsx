import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AvatarWithStatusProps {
  src?: string | null;
  name?: string | null;
  username: string;
  isOnline?: boolean;
  size?: "sm" | "md" | "lg";
  showStatus?: boolean;
  className?: string;
}

export default function AvatarWithStatus({
  src,
  name,
  username,
  isOnline = false,
  size = "md",
  showStatus = true,
  className,
}: AvatarWithStatusProps) {
  // Get initials from name or username
  const getInitials = () => {
    if (name) return name.charAt(0).toUpperCase();
    return username.charAt(0).toUpperCase();
  };

  // Generate a consistent background color based on username
  const generateBackgroundColor = () => {
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
    const index = username.length % colors.length;
    return colors[index];
  };

  // Size classes
  const sizeClasses = {
    sm: {
      avatar: "h-8 w-8",
      status: "h-2 w-2 right-0 bottom-0",
    },
    md: {
      avatar: "h-10 w-10",
      status: "h-2.5 w-2.5 right-0 bottom-0",
    },
    lg: {
      avatar: "h-14 w-14",
      status: "h-3 w-3 right-0.5 bottom-0.5",
    },
  };

  return (
    <div className={cn("relative", className)}>
      {src ? (
        <img
          src={src}
          alt={name || username}
          className={cn(
            "rounded-full object-cover w-full h-full",
            sizeClasses[size].avatar
          )}
        />
      ) : (
        <div
          className={cn(
            "rounded-full flex items-center justify-center text-white",
            generateBackgroundColor(),
            sizeClasses[size].avatar
          )}
        >
          {getInitials()}
        </div>
      )}

      {showStatus && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "absolute border-2 border-white rounded-full",
            isOnline ? "bg-green-500" : "bg-gray-400",
            sizeClasses[size].status
          )}
        />
      )}
    </div>
  );
}