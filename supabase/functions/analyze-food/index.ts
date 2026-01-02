import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Plan limits
const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  basic: 20,
  pro: 999999,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!imageBase64) {
      throw new Error("No image provided");
    }

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let userPlan = "free";
    let dailyScanCount = 0;

    if (authHeader && SUPABASE_URL && SUPABASE_ANON_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false },
        global: { headers: { Authorization: authHeader } }
      });

      // Get user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (user && !userError) {
        userId = user.id;

        // Get user profile with plan info
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("plan, daily_scan_count, last_scan_date")
          .eq("id", userId)
          .single();

        if (profile && !profileError) {
          userPlan = profile.plan || "free";
          
          // Check if we need to reset the count (new day)
          const today = new Date().toISOString().split("T")[0];
          const lastScanDate = profile.last_scan_date;
          
          if (lastScanDate !== today) {
            dailyScanCount = 0;
          } else {
            dailyScanCount = profile.daily_scan_count || 0;
          }

          // Check scan limit
          const limit = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free;
          
          if (dailyScanCount >= limit) {
            console.log(`User ${userId} has reached scan limit: ${dailyScanCount}/${limit}`);
            return new Response(
              JSON.stringify({ 
                success: false,
                error: "scan_limit_reached",
                message: `You've reached your daily scan limit (${limit} scans). Upgrade your plan for more scans!`,
                currentCount: dailyScanCount,
                limit: limit,
                plan: userPlan
              }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      }
    }

    // Proceed with AI analysis
    console.log(`Analyzing food for user ${userId || "anonymous"}, plan: ${userPlan}, scans: ${dailyScanCount}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a nutrition analysis AI. Analyze food images and provide accurate nutritional information.
            
When you receive a food image, identify the food items and estimate their nutritional content.
You MUST respond with ONLY a valid JSON object (no markdown, no code blocks, no explanations) in this exact format:
{
  "foods": [
    {
      "name": "Food name",
      "calories": number,
      "protein": number (in grams),
      "carbs": number (in grams),
      "fat": number (in grams),
      "fiber": number (in grams),
      "servingSize": "estimated serving size"
    }
  ],
  "totalCalories": number,
  "totalProtein": number,
  "totalCarbs": number,
  "totalFat": number,
  "totalFiber": number,
  "confidence": "high" | "medium" | "low",
  "notes": "Any relevant notes about the food or estimation"
}

Be accurate with Indian cuisine items like dal, roti, rice dishes, curries, etc.
If you cannot identify the food clearly, still provide your best estimate and set confidence to "low".`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this food image and provide nutritional information. Respond with ONLY the JSON object, no other text."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response, handling potential markdown code blocks
    let nutritionData;
    try {
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      nutritionData = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse nutrition data");
    }

    // Update scan count for authenticated users
    if (userId && SUPABASE_URL && SUPABASE_ANON_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false },
        global: { headers: { Authorization: authHeader! } }
      });

      const today = new Date().toISOString().split("T")[0];
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          daily_scan_count: dailyScanCount + 1,
          last_scan_date: today,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating scan count:", updateError);
      } else {
        console.log(`Updated scan count for user ${userId}: ${dailyScanCount + 1}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: nutritionData,
        scanInfo: {
          currentCount: dailyScanCount + 1,
          limit: PLAN_LIMITS[userPlan] || PLAN_LIMITS.free,
          plan: userPlan
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing food:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to analyze food" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
