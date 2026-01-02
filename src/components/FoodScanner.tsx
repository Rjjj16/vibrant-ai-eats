import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, Loader2, X, RotateCcw, Sparkles, Lock, Crown } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import MealSelector from "./MealSelector";

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  servingSize: string;
}

interface NutritionResult {
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  confidence: "high" | "medium" | "low";
  notes: string;
}

interface ScanInfo {
  currentCount: number;
  limit: number;
  plan: string;
}

const FoodScanner = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<NutritionResult | null>(null);
  const [scanInfo, setScanInfo] = useState<ScanInfo | null>(null);
  const [showMealSelector, setShowMealSelector] = useState(false);
  const [scanLimitReached, setScanLimitReached] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if user is logged in
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please login to scan your food.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setScanLimitReached(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeFood = async () => {
    if (!image) return;

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to analyze your food.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setIsAnalyzing(true);
    setScanLimitReached(false);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-food", {
        body: { imageBase64: image },
      });

      if (error) {
        throw error;
      }

      // Check for scan limit error
      if (data.error === "scan_limit_reached") {
        setScanLimitReached(true);
        setScanInfo({
          currentCount: data.currentCount,
          limit: data.limit,
          plan: data.plan,
        });
        toast({
          title: "Scan Limit Reached",
          description: data.message,
          variant: "destructive",
        });
        return;
      }

      if (data.success) {
        setResult(data.data);
        setScanInfo(data.scanInfo);
        
        // Refresh profile to get updated scan count
        await refreshProfile();

        toast({
          title: "Analysis Complete!",
          description: `Found ${data.data.foods.length} food item(s)`,
        });

        // Show meal selector after successful scan
        setShowMealSelector(true);
      } else {
        throw new Error(data.error || "Failed to analyze food");
      }
    } catch (error) {
      console.error("Error analyzing food:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setScanInfo(null);
    setScanLimitReached(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  const handleUpgradeClick = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="scanner" className="min-h-screen py-20 px-4">
      <div className="container max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered Analysis
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display mb-4">
            Scan Your <span className="gradient-text">Food</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Upload or take a photo of your meal to get instant nutritional breakdown
          </p>
          
          {/* Login prompt for non-authenticated users */}
          {!user && (
            <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/20 max-w-md mx-auto">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium text-foreground">Login to Start Scanning</p>
                  <p className="text-sm text-muted-foreground">Free users get 3 scans per day</p>
                </div>
              </div>
              <Button 
                variant="gradient" 
                className="w-full mt-3"
                onClick={() => navigate('/auth')}
              >
                Login to Scan
              </Button>
            </div>
          )}

          {/* Scan count indicator for authenticated users */}
          {user && scanInfo && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm">
              <span className="text-muted-foreground">Today's scans:</span>
              <span className="font-bold text-foreground">
                {scanInfo.currentCount}/{scanInfo.plan === 'pro' ? '∞' : scanInfo.limit}
              </span>
            </div>
          )}
        </motion.div>

        {/* Scan Limit Reached UI */}
        {scanLimitReached && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="p-6 bg-destructive/10 border-destructive/20 text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Daily Limit Reached</h3>
              <p className="text-muted-foreground mb-4">
                You've used all {scanInfo?.limit} scans for today on your {scanInfo?.plan} plan.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="gradient" onClick={handleUpgradeClick}>
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade for More Scans
                </Button>
                <Button variant="outline" onClick={reset}>
                  Try Again Tomorrow
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Upload Area */}
        <AnimatePresence mode="wait">
          {!image && !scanLimitReached ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <Card className={`relative border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors ${user ? 'cursor-pointer' : 'opacity-50'} p-12`}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className={`absolute inset-0 w-full h-full opacity-0 ${user ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  disabled={!user}
                />
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <p className="text-lg font-semibold mb-2">Upload Food Photo</p>
                  <p className="text-sm text-muted-foreground">
                    {user ? "Drag & drop or click to select an image" : "Login to upload photos"}
                  </p>
                </div>
              </Card>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <Card className={`relative bg-accent/10 hover:bg-accent/20 transition-colors ${user ? 'cursor-pointer' : 'opacity-50'} p-8`}>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className={`absolute inset-0 w-full h-full opacity-0 ${user ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  disabled={!user}
                />
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3">
                    <Camera className="w-8 h-8 text-accent" />
                  </div>
                  <p className="font-semibold">Take a Photo</p>
                  <p className="text-sm text-muted-foreground">
                    {user ? "Use your camera to capture food" : "Login to use camera"}
                  </p>
                </div>
              </Card>
            </motion.div>
          ) : image && !scanLimitReached ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              {/* Image Preview */}
              <Card className="relative overflow-hidden">
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur"
                  onClick={reset}
                >
                  <X className="w-4 h-4" />
                </Button>
                <img
                  src={image}
                  alt="Food"
                  className="w-full h-64 md:h-80 object-cover"
                />
              </Card>

              {/* Analyze Button */}
              {!result && (
                <Button
                  variant="gradient"
                  size="lg"
                  className="w-full h-14 text-lg gap-2"
                  onClick={analyzeFood}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Analyze Food
                    </>
                  )}
                </Button>
              )}

              {/* Results */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Total Macros */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold font-display">
                        Nutrition Summary
                      </h2>
                      <span
                        className={`text-sm font-medium ${getConfidenceColor(
                          result.confidence
                        )}`}
                      >
                        {result.confidence.charAt(0).toUpperCase() +
                          result.confidence.slice(1)}{" "}
                        Confidence
                      </span>
                    </div>

                    {/* Calorie Circle */}
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <svg className="w-36 h-36 -rotate-90">
                          <circle
                            cx="72"
                            cy="72"
                            r="64"
                            stroke="hsl(var(--muted))"
                            strokeWidth="10"
                            fill="none"
                          />
                          <circle
                            cx="72"
                            cy="72"
                            r="64"
                            stroke="url(#calorieGradient)"
                            strokeWidth="10"
                            fill="none"
                            strokeDasharray={2 * Math.PI * 64}
                            strokeDashoffset={
                              2 * Math.PI * 64 * (1 - Math.min(result.totalCalories / 2000, 1))
                            }
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient
                              id="calorieGradient"
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="0%"
                            >
                              <stop
                                offset="0%"
                                stopColor="hsl(var(--gradient-start))"
                              />
                              <stop
                                offset="100%"
                                stopColor="hsl(var(--gradient-end))"
                              />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold font-display">
                            {result.totalCalories}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            kcal
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Macro Bars */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <MacroCard
                        label="Protein"
                        value={result.totalProtein}
                        unit="g"
                        color="bg-protein"
                      />
                      <MacroCard
                        label="Carbs"
                        value={result.totalCarbs}
                        unit="g"
                        color="bg-carbs"
                      />
                      <MacroCard
                        label="Fat"
                        value={result.totalFat}
                        unit="g"
                        color="bg-fat"
                      />
                      <MacroCard
                        label="Fiber"
                        value={result.totalFiber}
                        unit="g"
                        color="bg-primary"
                      />
                    </div>
                  </Card>

                  {/* Add to Meal CTA */}
                  <Card className="p-4 bg-primary/10 border-primary/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Save this meal?</p>
                        <p className="text-sm text-muted-foreground">Track your daily intake</p>
                      </div>
                      <Button variant="gradient" onClick={() => setShowMealSelector(true)}>
                        Add to Meal
                      </Button>
                    </div>
                  </Card>

                  {/* Food Items */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Food Items Detected
                    </h3>
                    <div className="space-y-3">
                      {result.foods.map((food, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                        >
                          <div>
                            <p className="font-semibold">{food.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {food.servingSize}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold gradient-text">
                              {food.calories} kcal
                            </p>
                            <p className="text-xs text-muted-foreground">
                              P: {food.protein}g | C: {food.carbs}g | F:{" "}
                              {food.fat}g
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </Card>

                  {/* Notes */}
                  {result.notes && (
                    <Card className="p-4 bg-primary/5 border-primary/20">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-primary">
                          Note:
                        </span>{" "}
                        {result.notes}
                      </p>
                    </Card>
                  )}

                  {/* Reset Button */}
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full gap-2"
                    onClick={reset}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Scan Another Food
                  </Button>
                </motion.div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Meal Selector Modal */}
      {result && (
        <MealSelector
          isOpen={showMealSelector}
          onClose={() => setShowMealSelector(false)}
          nutritionData={result}
          onSuccess={() => {
            refreshProfile();
          }}
        />
      )}
    </section>
  );
};

const MacroCard = ({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) => (
  <div className="text-center p-4 rounded-xl bg-muted/50">
    <div className={`w-3 h-3 rounded-full ${color} mx-auto mb-2`} />
    <p className="text-2xl font-bold font-display">{value}</p>
    <p className="text-xs text-muted-foreground">
      {unit} {label}
    </p>
  </div>
);

export default FoodScanner;
