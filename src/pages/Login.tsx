import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { TrendingUp, Sparkles } from "lucide-react";

const Login = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [income, setIncome] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const validateGmail = (email: string) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(email);
  };

  const validateUsername = (username: string): string => {
    if (!username) return ""; // Empty is handled by required attribute
    
    // Check if username contains at least one letter
    const hasLetter = /[a-zA-Z]/.test(username);
    
    // Check if username contains only numbers and symbols (no letters)
    const onlyNumbersAndSymbols = /^[^a-zA-Z]*$/.test(username);
    
    if (onlyNumbersAndSymbols) {
      return "Username must contain at least one letter";
    }
    
    // Check for minimum length
    if (username.length < 3) {
      return "Username must be at least 3 characters long";
    }
    
    // Check for valid characters (letters, numbers, underscores, hyphens)
    const validChars = /^[a-zA-Z0-9_-]+$/.test(username);
    if (!validChars) {
      return "Username can only contain letters, numbers, underscores, and hyphens";
    }
    
    return "";
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    if (isRegister && newEmail && !validateGmail(newEmail)) {
      setEmailError("Only Gmail addresses are allowed");
    } else {
      setEmailError("");
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    
    if (isRegister && newUsername) {
      const error = validateUsername(newUsername);
      setUsernameError(error);
    } else {
      setUsernameError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate for registration
    if (isRegister) {
      // Validate Gmail
      if (!validateGmail(email)) {
        toast.error("Only Gmail addresses are allowed for registration");
        return;
      }
      
      // Validate username
      const usernameValidationError = validateUsername(username);
      if (usernameValidationError) {
        toast.error(usernameValidationError);
        return;
      }
    }
    
    setLoading(true);
    try {
      if (isRegister) {
        await register({ username, email, monthly_income: income ? Number(income) : undefined });
        toast.success("Account created!");
      } else {
        await login(email);
        toast.success("Welcome back!");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute bottom-[-150px] left-[-150px] w-[400px] h-[400px] rounded-full bg-secondary/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md mx-4"
      >
        <div className="glass-card p-8 space-y-8">
          {/* Logo */}
          <div className="text-center space-y-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 rounded-2xl gradient-warm mx-auto flex items-center justify-center shadow-glow"
            >
              <TrendingUp className="w-8 h-8 text-accent-foreground" />
            </motion.div>
            <h1 className="text-3xl font-display font-bold text-foreground">WealthFlow</h1>
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-body">AI-Powered Personal Finance</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                <Label htmlFor="username" className="text-sm font-medium text-foreground">Username</Label>
                <Input
                  id="username"
                  placeholder="Feven123"
                  value={username}
                  onChange={handleUsernameChange}
                  required
                  className={`h-12 rounded-xl bg-background border-border focus:ring-accent ${
                    usernameError ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                />
                {usernameError && isRegister && (
                  <p className="text-sm text-red-500 mt-1">{usernameError}</p>
                )}
                {isRegister && !usernameError && username && (
                  <p className="text-xs text-green-500 mt-1">✓ Username is valid</p>
                )}
                {isRegister && !username && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Username must contain at least one letter and be 3+ characters
                  </p>
                )}
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="feven@gmail.com"
                value={email}
                onChange={handleEmailChange}
                required
                className={`h-12 rounded-xl bg-background border-border focus:ring-accent ${
                  emailError ? 'border-red-500 focus:ring-red-500' : ''
                }`}
              />
              {emailError && isRegister && (
                <p className="text-sm text-red-500 mt-1">{emailError}</p>
              )}
              {isRegister && !emailError && email && validateGmail(email) && (
                <p className="text-xs text-green-500 mt-1">✓ Gmail address is valid</p>
              )}
              {isRegister && !email && (
                <p className="text-xs text-muted-foreground mt-1">
                  Only Gmail addresses (@gmail.com) are allowed
                </p>
              )}
            </div>

            {isRegister && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                <Label htmlFor="income" className="text-sm font-medium text-foreground">Monthly Income (Optional)</Label>
                <Input
                  id="income"
                  type="number"
                  placeholder="50000"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="h-12 rounded-xl bg-background border-border focus:ring-accent"
                />
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={loading || (isRegister && (!!emailError || !!usernameError))}
              className="w-full h-12 rounded-xl text-base font-semibold gradient-warm text-accent-foreground hover:opacity-90 transition-opacity border-0"
            >
              {loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setEmailError(""); // Clear error when switching modes
                setUsernameError(""); // Clear username error when switching modes
                setUsername(""); // Clear username when switching modes
                setEmail(""); // Clear email when switching modes
                setIncome(""); // Clear income when switching modes
              }}
              className="text-accent font-medium hover:underline"
            >
              {isRegister ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;