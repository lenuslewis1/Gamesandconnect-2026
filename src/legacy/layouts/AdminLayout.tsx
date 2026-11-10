import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";

const AdminLayout = () => {
    const location = useLocation();
    const section = location.pathname.split("/")[2];
    const title = section ? section.replace(/-/g, " ") : "Overview";
    return <div className="flex min-h-screen w-full flex-col bg-[#f5f8f4] md:flex-row">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex h-16 items-center justify-between border-b border-[#dfe8e1] bg-white px-5 sm:px-8"><p className="text-sm font-medium capitalize text-[#597064]">{title}</p><span className="text-xs font-medium text-[#839489]">Games & Connect</span></header>
            <main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10"><Outlet /></main>
        </div>
    </div>;
};
export default AdminLayout;
