import { motion } from "framer-motion";
import { Camera, Zap, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Zap className="w-4 h-4" />
              AI-Powered Nutrition Tracking
            </motion.div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-tight mb-6">
              Snap. Scan.{" "}
              <span className="gradient-text">Stay Healthy.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
              Just take a photo of your food and get instant calories, protein, carbs & fat breakdown. Works for Indian & global cuisines!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                variant="gradient" 
                size="lg" 
                className="gap-2"
                onClick={() => document.getElementById('scanner')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Camera className="w-5 h-5" />
                Start Scanning Free
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See How It Works
              </Button>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center lg:justify-start gap-8 mt-10"
            >
              <div className="text-center lg:text-left">
                <p className="text-2xl md:text-3xl font-bold font-display gradient-text">10K+</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="text-center lg:text-left">
                <p className="text-2xl md:text-3xl font-bold font-display gradient-text">1M+</p>
                <p className="text-sm text-muted-foreground">Foods Scanned</p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="text-center lg:text-left">
                <p className="text-2xl md:text-3xl font-bold font-display gradient-text">98%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex justify-center"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 gradient-primary rounded-[3rem] blur-2xl opacity-30 scale-105" />
              
              {/* Phone frame */}
              <div className="relative bg-card rounded-[3rem] p-3 shadow-2xl border-4 border-muted/50">
                <div className="w-[280px] md:w-[320px] h-[560px] md:h-[640px] rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-muted to-background relative">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-foreground/90 rounded-b-2xl z-10" />
                  
                  {/* App Content */}
                  <div className="h-full flex flex-col pt-10 pb-8 px-5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-xs text-muted-foreground">Good Morning!</p>
                        <p className="font-semibold">Today's Progress</p>
                      </div>
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-primary-foreground" />
                      </div>
                    </div>

                    {/* Calorie Circle */}
                    <div className="flex-1 flex items-center justify-center">
                      <div className="relative">
                        <svg className="w-44 h-44 -rotate-90">
                          <circle
                            cx="88"
                            cy="88"
                            r="78"
                            stroke="hsl(var(--muted))"
                            strokeWidth="12"
                            fill="none"
                          />
                          <circle
                            cx="88"
                            cy="88"
                            r="78"
                            stroke="url(#gradient)"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={2 * Math.PI * 78}
                            strokeDashoffset={2 * Math.PI * 78 * 0.35}
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="hsl(var(--gradient-start))" />
                              <stop offset="100%" stopColor="hsl(var(--gradient-end))" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-bold font-display">1,320</span>
                          <span className="text-sm text-muted-foreground">/ 2,000 kcal</span>
                        </div>
                      </div>
                    </div>

                    {/* Macro bars */}
                    <div className="space-y-3 mb-4">
                      <MacroBar label="Protein" current={65} max={120} color="bg-protein" />
                      <MacroBar label="Carbs" current={180} max={250} color="bg-carbs" />
                      <MacroBar label="Fat" current={45} max={65} color="bg-fat" />
                    </div>

                    {/* Scan Button */}
                    <Button 
                      variant="gradient" 
                      className="w-full rounded-2xl h-14 text-base gap-2"
                      onClick={() => document.getElementById('scanner')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      <Camera className="w-5 h-5" />
                      Scan Food
                    </Button>
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-12 top-32 glass rounded-2xl p-4 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                    <span className="text-2xl">🥗</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Caesar Salad</p>
                    <p className="text-xs text-muted-foreground">320 kcal</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -right-8 bottom-32 glass rounded-2xl p-4 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <span className="text-2xl">🍛</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Dal Chawal</p>
                    <p className="text-xs text-muted-foreground">450 kcal</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const MacroBar = ({ label, current, max, color }: { label: string; current: number; max: number; color: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{current}g / {max}g</span>
    </div>
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-500`}
        style={{ width: `${(current / max) * 100}%` }}
      />
    </div>
  </div>
);

export default Hero;