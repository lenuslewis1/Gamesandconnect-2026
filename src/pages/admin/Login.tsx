
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Lock, ArrowLeft, KeyRound } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

const AdminLogin = () => {
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
        if (!authLoading && user?.email === adminEmail) {
            navigate("/admin");
        }
    }, [user, authLoading, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (error) throw error;

            const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
            if (email !== adminEmail) {
                toast.error("You are not authorized to access the admin area.");
                await supabase.auth.signOut();
                return;
            }

            toast.success("Welcome, Admin!");
            navigate("/admin");
        } catch (error: any) {
            toast.error(error.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/admin/login`,
            });

            if (error) throw error;

            toast.success("Password reset email sent! Check your inbox.");
            setIsForgotPassword(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to send reset email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b] p-4 font-inter">
            {/* Background decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
            </div>

            <Card className="w-full max-w-md border-white/5 bg-white/5 backdrop-blur-xl shadow-2xl relative z-10 transition-all duration-500 hover:shadow-primary/10">
                <CardHeader className="space-y-2 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-[#4d7c0f]">
                        {isForgotPassword ? <KeyRound className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight text-white">
                        {isForgotPassword ? "Reset Password" : "Admin Portal"}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        {isForgotPassword
                            ? "Enter your email to receive a password reset link."
                            : "Secure access for Games & Connect administrators."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isForgotPassword ? (
                        <form onSubmit={handleForgotPassword} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="reset-email" className="text-sm font-medium text-slate-200">Email Address</Label>
                                <Input
                                    id="reset-email"
                                    type="email"
                                    placeholder="admin@gamesandconnect.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-primary/50 focus:ring-primary/20 h-11"
                                />
                            </div>
                            <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all" type="submit" disabled={loading}>
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    "Send Reset Link"
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full text-slate-400 hover:text-white"
                                onClick={() => setIsForgotPassword(false)}
                            >
                                Back to login
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-slate-200">Admin Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@gamesandconnect.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-primary/50 focus:ring-primary/20 h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-medium text-slate-200">Password</Label>
                                    <button
                                        type="button"
                                        onClick={() => setIsForgotPassword(true)}
                                        className="text-xs text-[#4d7c0f] hover:underline"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-primary/50 focus:ring-primary/20 h-11"
                                />
                            </div>
                            <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all" type="submit" disabled={loading}>
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    "Sign In to Dashboard"
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    {!isForgotPassword && (
                        <div className="text-center text-sm pb-2">
                            <span className="text-slate-500">Authorized access only.</span>
                        </div>
                    )}
                    <Link to="/" className="inline-flex items-center text-xs text-slate-500 hover:text-white transition-colors">
                        <ArrowLeft className="mr-2 h-3 w-3" /> Back to website
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default AdminLogin;
