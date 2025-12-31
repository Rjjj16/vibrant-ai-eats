import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, Loader2, X, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

const FoodScanner = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<NutritionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeFood = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-food", {
        body: { imageBase64: image },
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        setResult(data.data);
        toast({
          title: "Analysis Complete!",
          description: `Found ${data.data.foods.length} food item(s)`,
        });
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
        </motion.div>

        {/* Upload Area */}
        <AnimatePresence mode="wait">
          {!image ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <Card className="relative border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer p-12">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <p className="text-lg font-semibold mb-2">Upload Food Photo</p>
                  <p className="text-sm text-muted-foreground">
                    Drag & drop or click to select an image
                  </p>
                </div>
              </Card>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <Card className="relative bg-accent/10 hover:bg-accent/20 transition-colors cursor-pointer p-8">
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3">
                    <Camera className="w-8 h-8 text-accent" />
                  </div>
                  <p className="font-semibold">Take a Photo</p>
                  <p className="text-sm text-muted-foreground">
                    Use your camera to capture food
                  </p>
                </div>
              </Card>
            </motion.div>
          ) : (
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
          )}
        </AnimatePresence>
      </div>
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
