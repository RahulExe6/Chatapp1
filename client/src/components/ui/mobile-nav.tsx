import { MessageSquare, Compass, Bell, User } from "lucide-react";
import { Link } from "wouter";

export default function MobileNav() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-3 flex justify-around">
      <Link href="/">
        <a className="text-primary text-center flex flex-col items-center">
          <MessageSquare className="h-5 w-5" />
          <p className="text-xs mt-1">Messages</p>
        </a>
      </Link>
      <a href="#" className="text-muted-foreground text-center flex flex-col items-center">
        <Compass className="h-5 w-5" />
        <p className="text-xs mt-1">Discover</p>
      </a>
      <a href="#" className="text-muted-foreground text-center flex flex-col items-center">
        <Bell className="h-5 w-5" />
        <p className="text-xs mt-1">Alerts</p>
      </a>
      <Link href="/profile">
        <a className="text-muted-foreground text-center flex flex-col items-center">
          <User className="h-5 w-5" />
          <p className="text-xs mt-1">Profile</p>
        </a>
      </Link>
    </div>
  );
}
