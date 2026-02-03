
import { Outlet } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";

const AdminLayout = () => {
    return (
        <div className="flex min-h-screen w-full bg-muted/20">
            <AdminSidebar />
            <div className="flex-1 flex flex-col">
                <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-6 lg:h-[60px]">
                    <div className="flex-1">
                        {/* Header content like breadcrumbs or search could go here */}
                        <h1 className="text-lg font-semibold">Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* User Profile dropdown could go here */}
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            A
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
