
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const AdminRoute = () => {
    const { user, loading } = useAuth();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        if (!loading) {
            if (user && user.email === "gamesandconnectgh@gmail.com") {
                setIsAuthorized(true);
            } else {
                if (user) {
                    toast.error("Unauthorized access");
                }
                setIsAuthorized(false);
            }
        }
    }, [user, loading]);

    if (loading || isAuthorized === null) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0b]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return isAuthorized ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default AdminRoute;
