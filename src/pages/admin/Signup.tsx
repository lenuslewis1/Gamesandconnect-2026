import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AdminSignup = () => {
    const navigate = useNavigate();

    useEffect(() => {
        toast.error("Admin registration is closed.");
        navigate("/admin/login");
    }, [navigate]);

    return null;
};

export default AdminSignup;
