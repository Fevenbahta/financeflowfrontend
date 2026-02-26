import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  TrendingUp, 
  Sparkles, 
  User, 
  Mail, 
  Shield,
  ArrowRight,
  Gem,
  Leaf,
  Flame,
  Heart,
  Target
} from "lucide-react";

const COLORS = {
  primaryDark: "#6E3F25",      // Deep Brown
  secondaryBeige: "#C9A87B",    // Soft Beige
  accentWarmGold: "#C5904A",    // Warm Gold
  softAccent: "#C39D8A",        // Dusty Rose
  neutralOlive: "#89836D",      // Olive Grey
};

const Login = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const validateGmail = (email: string) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(email);
  };

  const validateUsername = (username: string): string => {
    if (!username) return "";
    
    const hasLetter = /[a-zA-Z]/.test(username);
    const onlyNumbersAndSymbols = /^[^a-zA-Z]*$/.test(username);
    
    if (onlyNumbersAndSymbols) {
      return "Username must contain at least one letter";
    }
    
    if (username.length < 3) {
      return "Username must be at least 3 characters long";
    }
    
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
    
    if (isRegister) {
      if (!validateGmail(email)) {
        toast.error("Only Gmail addresses are allowed for registration");
        return;
      }
      
      const usernameValidationError = validateUsername(username);
      if (usernameValidationError) {
        toast.error(usernameValidationError);
        return;
      }
    }
    
    setLoading(true);
    try {
      if (isRegister) {
        // Always set monthly_income to 0
        await register({ username, email, monthly_income: 0 });
        toast.success("🎉 Welcome to WealthFlow! Your financial journey begins!");
      } else {
        await login(email);
        toast.success("✨ Welcome back! Ready to grow your wealth?");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: COLORS.primaryDark }}
    >
      {/* Animated background with floating orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large gradient orbs with parallax */}
        <motion.div 
          animate={{ 
            x: mousePosition.x * 2,
            y: mousePosition.y * 2,
          }}
          transition={{ type: "spring", damping: 50 }}
          className="absolute top-20 -left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          style={{ backgroundColor: COLORS.secondaryBeige }}
        />
        <motion.div 
          animate={{ 
            x: mousePosition.x * -1.5,
            y: mousePosition.y * -1.5,
          }}
          transition={{ type: "spring", damping: 50 }}
          className="absolute bottom-20 -right-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          style={{ backgroundColor: COLORS.accentWarmGold }}
        />
        
        {/* Animated particles grid */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${(i * 7) % 100}%`,
                top: `${(i * 13) % 100}%`,
                backgroundColor: i % 3 === 0 ? COLORS.accentWarmGold : i % 3 === 1 ? COLORS.secondaryBeige : COLORS.softAccent,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + (i % 5),
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>

        {/* Decorative curved lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <motion.path
            d="M0,200 Q150,100 300,200 T600,200"
            stroke={COLORS.accentWarmGold}
            fill="none"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M0,400 Q200,500 400,400 T800,400"
            stroke={COLORS.secondaryBeige}
            fill="none"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }}
          />
        </svg>
      </div>

      {/* Main content with enhanced glass morphism */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md mx-4 relative z-10"
      >
        {/* Decorative corner elements */}
        <div className="absolute -top-4 -left-4 w-20 h-20 border-l-4 border-t-4 rounded-tl-2xl" style={{ borderColor: COLORS.accentWarmGold }} />
        <div className="absolute -bottom-4 -right-4 w-20 h-20 border-r-4 border-b-4 rounded-br-2xl" style={{ borderColor: COLORS.accentWarmGold }} />

        <motion.div 
          className="backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-8 border relative overflow-hidden"
          style={{ 
            background: `linear-gradient(135deg, ${COLORS.primaryDark}CC, ${COLORS.primaryDark}E6)`,
            borderColor: `${COLORS.secondaryBeige}30`,
            boxShadow: `0 25px 50px -12px ${COLORS.primaryDark}`,
          }}
          whileHover={{ boxShadow: `0 30px 60px -12px ${COLORS.accentWarmGold}40` }}
          transition={{ duration: 0.3 }}
        >
          {/* Inner glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />

          {/* Logo with animated rings */}
          <div className="text-center space-y-4 relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative inline-block"
            >
              {/* Animated rings */}
              <motion.div
                className="absolute inset-0 rounded-2xl"
                animate={{
                  boxShadow: [
                    `0 0 0 0 ${COLORS.accentWarmGold}`,
                    `0 0 0 10px ${COLORS.accentWarmGold}00`,
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
              
              {/* Logo container */}
              <div 
                className="relative w-24 h-24 rounded-2xl mx-auto flex items-center justify-center shadow-2xl overflow-hidden"
                style={{ 
                  background: `linear-gradient(135deg, ${COLORS.accentWarmGold}, ${COLORS.softAccent})`,
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
                <TrendingUp className="w-12 h-12 relative z-10" style={{ color: COLORS.primaryDark }} />
              </div>

              {/* Floating gem icons */}
              <motion.div
                animate={{ y: [-10, 0, -10], rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-2 -right-2"
              >
                <Gem className="w-5 h-5" style={{ color: COLORS.accentWarmGold }} />
              </motion.div>
              <motion.div
                animate={{ y: [0, -10, 0], rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-2 -left-2"
              >
                <Leaf className="w-5 h-5" style={{ color: COLORS.secondaryBeige }} />
              </motion.div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl font-bold"
              style={{ 
                background: `linear-gradient(135deg, ${COLORS.secondaryBeige}, ${COLORS.accentWarmGold})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              WealthFlow
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-3"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4" style={{ color: COLORS.accentWarmGold }} />
              </motion.div>
              <span className="text-sm font-medium tracking-wide" style={{ color: COLORS.secondaryBeige }}>
                Where Dreams Meet Numbers
              </span>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4" style={{ color: COLORS.accentWarmGold }} />
              </motion.div>
            </motion.div>
          </div>

          {/* Enhanced security badge with animation */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center"
          >
            <motion.div 
              className="flex items-center gap-3 rounded-full px-5 py-2 border"
              style={{ 
                backgroundColor: `${COLORS.neutralOlive}30`,
                borderColor: `${COLORS.secondaryBeige}30`,
              }}
              whileHover={{ scale: 1.05, backgroundColor: `${COLORS.neutralOlive}50` }}
            >
              <Shield className="w-4 h-4" style={{ color: COLORS.accentWarmGold }} />
              <span className="text-xs font-medium" style={{ color: COLORS.secondaryBeige }}>Bank-Grade Security</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: COLORS.accentWarmGold }}
              />
            </motion.div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6 relative">
            {/* Username field - only shown for registration */}
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-2"
                onHoverStart={() => setHoveredField('username')}
                onHoverEnd={() => setHoveredField(null)}
              >
                <Label htmlFor="username" className="text-sm font-medium flex items-center gap-2" style={{ color: COLORS.secondaryBeige }}>
                  <User className="w-4 h-4" style={{ color: COLORS.accentWarmGold }} />
                  Choose your identity
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    placeholder="e.g., Feven123"
                    value={username}
                    onChange={handleUsernameChange}
                    required
                    className="h-14 rounded-xl border-2 transition-all duration-300 pl-12 pr-12 text-lg"
                    style={{ 
                      backgroundColor: `${COLORS.primaryDark}80`,
                      borderColor: hoveredField === 'username' ? COLORS.accentWarmGold : usernameError ? '#ef4444' : `${COLORS.secondaryBeige}30`,
                      color: COLORS.secondaryBeige,
                    }}
                  />
                  <User className="absolute left-4 top-4 w-5 h-5" style={{ color: `${COLORS.secondaryBeige}80` }} />
                  {username && !usernameError && isRegister && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-4 top-4"
                    >
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.accentWarmGold }}>
                        <span className="text-xs text-white">✓</span>
                      </div>
                    </motion.div>
                  )}
                </div>
                {usernameError && isRegister && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-400 mt-1 flex items-center gap-1"
                  >
                    <span>⚠️</span> {usernameError}
                  </motion.p>
                )}
              </motion.div>
            )}

            {/* Email field - shown for both login and register */}
            <motion.div 
              className="space-y-2"
              onHoverStart={() => setHoveredField('email')}
              onHoverEnd={() => setHoveredField(null)}
            >
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2" style={{ color: COLORS.secondaryBeige }}>
                <Mail className="w-4 h-4" style={{ color: COLORS.accentWarmGold }} />
                Your email address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="your.name@gmail.com"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  className="h-14 rounded-xl border-2 transition-all duration-300 pl-12 pr-12 text-lg"
                  style={{ 
                    backgroundColor: `${COLORS.primaryDark}80`,
                    borderColor: hoveredField === 'email' ? COLORS.accentWarmGold : emailError ? '#ef4444' : `${COLORS.secondaryBeige}30`,
                    color: COLORS.secondaryBeige,
                  }}
                />
                <Mail className="absolute left-4 top-4 w-5 h-5" style={{ color: `${COLORS.secondaryBeige}80` }} />
                {email && !emailError && isRegister && validateGmail(email) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-4 top-4"
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.accentWarmGold }}>
                      <span className="text-xs text-white">✓</span>
                    </div>
                  </motion.div>
                )}
              </div>
              {emailError && isRegister && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400 mt-1 flex items-center gap-1"
                >
                  <span>⚠️</span> {emailError}
                </motion.p>
              )}
            </motion.div>

            {/* Enhanced submit button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="pt-4"
            >
              <Button
                type="submit"
                disabled={loading || (isRegister && (!!emailError || !!usernameError))}
                className="w-full h-14 rounded-xl text-lg font-semibold text-white transition-all duration-300 border-0 shadow-xl relative overflow-hidden group"
                style={{ 
                  background: `linear-gradient(135deg, ${COLORS.accentWarmGold}, ${COLORS.softAccent})`,
                  boxShadow: `0 10px 25px -5px ${COLORS.accentWarmGold}`,
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Magic is happening...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <span>{isRegister ? "Begin Your Journey" : "Welcome Back"}</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </div>
                )}
              </Button>
            </motion.div>

            {/* Decorative elements */}
            <div className="flex justify-center gap-2 pt-2">
              {[Heart, Flame, Target].map((Icon, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ 
                    duration: 2,
                    delay: i * 0.3,
                    repeat: Infinity,
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: `${COLORS.secondaryBeige}60` }} />
                </motion.div>
              ))}
            </div>
          </form>

          {/* Toggle between sign in/up with animation */}
          <motion.p 
            className="text-center text-sm pt-4"
            style={{ color: `${COLORS.secondaryBeige}80` }}
            whileHover={{ scale: 1.05 }}
          >
            {isRegister ? "Already part of our family?" : "New to WealthFlow?"}{" "}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setEmailError("");
                setUsernameError("");
                setUsername("");
                setEmail("");
              }}
              className="font-semibold hover:underline transition-all duration-300 relative group"
              style={{ color: COLORS.accentWarmGold }}
            >
              {isRegister ? "Sign in here" : "Create account"}
              <motion.span 
                className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                style={{ backgroundColor: COLORS.accentWarmGold }}
              />
            </button>
          </motion.p>

          {/* Enhanced feature badges with animations */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-3 gap-4 pt-6 mt-4 border-t"
            style={{ borderColor: `${COLORS.secondaryBeige}20` }}
          >
            {[
              { icon: "", text: "Smart Goals", color: COLORS.accentWarmGold },
              { icon: "", text: "AI Assistant", color: COLORS.secondaryBeige },
              { icon: "", text: "Fort Knox", color: COLORS.softAccent }
            ].map((feature, index) => (
              <motion.div 
                key={index} 
                className="text-center group"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="text-2xl mb-2"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    duration: 3,
                    delay: index * 0.5,
                    repeat: Infinity,
                  }}
                >
                  {feature.icon}
                </motion.div>
                <p className="text-xs font-medium tracking-wide" style={{ color: feature.color }}>{feature.text}</p>
                <motion.div 
                  className="w-0 h-0.5 mx-auto group-hover:w-full transition-all duration-300"
                  style={{ backgroundColor: feature.color }}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Motivational quote */}
          <motion.div 
            className="text-center text-xs italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            style={{ color: `${COLORS.secondaryBeige}50` }}
          >
            "Your financial freedom starts with a single step"
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(5deg); }
          75% { transform: translateY(20px) rotate(-5deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;