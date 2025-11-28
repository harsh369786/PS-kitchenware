import Link from "next/link";
import { LayoutDashboard, ShoppingBag } from "lucide-react";
import Logo from "@/components/logo";

export default function AdminSidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="border-b p-4">
            <Logo />
        </div>
        <nav className="flex flex-col gap-1 p-4">
            <Link href="/admin/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
            </Link>
            <Link href="/admin/content" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                <ShoppingBag className="h-4 w-4" />
                Content Management
            </Link>
        </nav>
    </aside>
  );
}
