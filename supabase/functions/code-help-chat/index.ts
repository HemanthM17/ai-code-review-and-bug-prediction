import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, code, language, analysisResult } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context from code and analysis
    let contextMessage = "You are an expert code assistant helping to fix bugs and improve code quality.";
    
    if (code && language) {
      contextMessage += `\n\nUser's code (${language}):\n\`\`\`${language}\n${code}\n\`\`\``;
    }
    
    if (analysisResult) {
      contextMessage += `\n\nCode Analysis Results:`;
      contextMessage += `\n- Quality Score: ${analysisResult.qualityScore}/100`;
      
      if (analysisResult.issues && analysisResult.issues.length > 0) {
        contextMessage += `\n\nIssues Found:`;
        analysisResult.issues.forEach((issue: any, index: number) => {
          contextMessage += `\n${index + 1}. [${issue.severity}] ${issue.type}: ${issue.message}`;
          if (issue.line) contextMessage += ` (Line ${issue.line})`;
          if (issue.suggestion) contextMessage += `\n   Suggestion: ${issue.suggestion}`;
        });
      }
    }

    console.log("Chat request with context:", { hasCode: !!code, language, hasAnalysis: !!analysisResult });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: contextMessage },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error in code-help-chat:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
