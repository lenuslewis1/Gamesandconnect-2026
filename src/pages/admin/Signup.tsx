
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, UserPlus, ArrowLeft } from "lucide-react";

const AdminSignup = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (email !== "gamesandconnectgh@gmail.com") {
            toast.error("This email is not authorized for admin registration.");
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            // If signup was successful, try to log in automatically
            if (data.user) {
                const { error: loginError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (loginError) {
                    // If auto-login fails (e.g., email confirmation required), redirect to login
                    toast.success("Registration successful! Please check your email for verification, then log in.");
                    navigate("/admin/login");
                    return;
                }

                toast.success("Welcome, Admin! You're now logged in.");
                navigate("/admin");
                return;
            }

            toast.success("Registration successful! Please check your email for verification.");
            navigate("/admin/login");
        } catch (error: any) {
            toast.error(error.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b] p-4 font-inter">
            {/* Background decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
            </div>

            <Card className="w-full max-w-md border-white/5 bg-white/5 backdrop-blur-xl shadow-2xl relative z-10 transition-all duration-500 hover:shadow-primary/10">
                <CardHeader className="space-y-2 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <UserPlus className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight text-white">Create Admin Account</CardTitle>
                    <CardDescription className="text-slate-400">
                        Authorized registration for Games & Connect administrators.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignup} className="space-y-5">
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
                            <Label htmlFor="password" className="text-sm font-medium text-slate-200">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-primary/50 focus:ring-primary/20 h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-200">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-primary/50 focus:ring-primary/20 h-11"
                            />
                        </div>
                        <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold transition-all mt-2" type="submit" disabled={loading}>
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                "Register Admin"
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <div className="text-center text-sm">
                        <span className="text-slate-500">Already have an account? </span>
                        <Link to="/admin/login" className="text-primary hover:underline font-medium">Log in</Link>
                    </div>
                    <Link to="/" className="inline-flex items-center text-xs text-slate-500 hover:text-white transition-colors">
                        <ArrowLeft className="mr-2 h-3 w-3" /> Back to website
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default AdminSignup;
