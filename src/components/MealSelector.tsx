import { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Sun, Sunset, Cookie, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
  confidence: 'high' | 'medium' | 'low';
  notes: string;
}

interface MealSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  nutritionData: NutritionResult;
  onSuccess: () => void;
}

const mealTypes = [
  { id: 'breakfast', label: 'Breakfast', icon: Coffee, color: 'from-amber-500 to-orange-500' },
  { id: 'lunch', label: 'Lunch', icon: Sun, color: 'from-green-500 to-emerald-500' },
  { id: 'dinner', label: 'Dinner', icon: Sunset, color: 'from-purple-500 to-pink-500' },
  { id: 'snacks', label: 'Snacks', icon: Cookie, color: 'from-blue-500 to-cyan-500' },
];

const MealSelectorContent = forwardRef<HTMLDivElement, MealSelectorProps & { onMealSelect: (mealType: string) => Promise<void>; isLoading: boolean; selectedMeal: string | null }>(
  ({ onClose, nutritionData, onMealSelect, isLoading, selectedMeal }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-foreground">Add to Meal</h3>
            <p className="text-sm text-muted-foreground">
              {nutritionData.totalCalories} cal • {nutritionData.foods.length} item(s)
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isLoading}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Food summary */}
        <div className="bg-muted/50 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-foreground mb-2">Foods detected:</p>
          <div className="flex flex-wrap gap-2">
            {nutritionData.foods.map((food, index) => (
              <span
                key={index}
                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
              >
                {food.name}
              </span>
            ))}
          </div>
        </div>

        {/* Meal type buttons */}
        <div className="grid grid-cols-2 gap-3">
          {mealTypes.map((meal) => (
            <Button
              key={meal.id}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-muted transition-all"
              disabled={isLoading}
              onClick={() => onMealSelect(meal.id)}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meal.color} flex items-center justify-center`}>
                {isLoading && selectedMeal === meal.id ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <meal.icon className="w-5 h-5 text-white" />
                )}
              </div>
              <span className="font-medium">
                {isLoading && selectedMeal === meal.id ? 'Saving...' : meal.label}
              </span>
            </Button>
          ))}
        </div>

        {/* Skip button */}
        <Button
          variant="ghost"
          className="w-full mt-4 text-muted-foreground"
          onClick={onClose}
          disabled={isLoading}
        >
          Skip for now
        </Button>
      </motion.div>
    );
  }
);

MealSelectorContent.displayName = 'MealSelectorContent';

const MealSelector = ({ isOpen, onClose, nutritionData, onSuccess }: MealSelectorProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAddToMeal = async (mealType: string) => {
    if (!user) {
      toast({
        title: 'Please login',
        description: 'You need to be logged in to save meals.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setSelectedMeal(mealType);

    try {
      // Insert each food item
      const foodLogs = nutritionData.foods.map(food => ({
        user_id: user.id,
        meal_type: mealType,
        food_name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber,
        serving_size: food.servingSize,
        confidence: nutritionData.confidence,
        notes: nutritionData.notes,
      }));

      console.log('Saving food logs:', foodLogs);

      const { data, error } = await supabase
        .from('food_logs')
        .insert(foodLogs)
        .select();

      if (error) {
        console.error('Error saving food log:', error);
        throw error;
      }

      console.log('Food logs saved:', data);

      toast({
        title: 'Meal saved!',
        description: `Added ${nutritionData.foods.length} item(s) to ${mealType}.`,
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: 'Failed to save',
        description: err instanceof Error ? err.message : 'Could not save your meal. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setSelectedMeal(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <MealSelectorContent
            isOpen={isOpen}
            onClose={onClose}
            nutritionData={nutritionData}
            onSuccess={onSuccess}
            onMealSelect={handleAddToMeal}
            isLoading={isLoading}
            selectedMeal={selectedMeal}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MealSelector;
