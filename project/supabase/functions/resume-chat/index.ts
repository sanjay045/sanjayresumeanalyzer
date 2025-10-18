import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatRequest {
  question: string;
  resumeContent: string;
  feedback: any;
}

function generateAIResponse(question: string, resumeContent: string, feedback: any): string {
  const lowerQuestion = question.toLowerCase();
  
  // Greeting responses
  if (/(hi|hello|hey|greetings)/i.test(question)) {
    return "Hello! I'm here to help you with questions about your resume. Feel free to ask me about specific sections, scores, or how to improve your resume.";
  }
  
  // Overall score questions
  if (/(overall|total|final).*score/i.test(lowerQuestion) || /how.*did.*do/i.test(lowerQuestion)) {
    const score = feedback.overallScore;
    let assessment = "";
    
    if (score >= 80) {
      assessment = "excellent! Your resume is very strong";
    } else if (score >= 60) {
      assessment = "good, but there's room for improvement";
    } else if (score >= 40) {
      assessment = "fair, with several areas needing attention";
    } else {
      assessment = "below average and needs significant work";
    }
    
    return `Your overall resume score is ${score}/100, which is ${assessment}. ${feedback.summary}`;
  }
  
  // Strengths questions
  if (/(strength|good|strong|positive|what.*well)/i.test(lowerQuestion)) {
    if (feedback.strengths && feedback.strengths.length > 0) {
      return `Great question! Here are the key strengths I identified in your resume:\n\n${feedback.strengths.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}\n\nThese are the aspects you should definitely keep and potentially highlight even more.`;
    }
    return "While I identified some areas for improvement, building on your experience section with quantifiable achievements would create strong points to highlight.";
  }
  
  // Improvement questions
  if (/(improve|fix|change|weak|better|enhance)/i.test(lowerQuestion)) {
    if (feedback.improvements && feedback.improvements.length > 0) {
      return `Here are the priority improvements for your resume:\n\n${feedback.improvements.map((i: string, idx: number) => `${idx + 1}. ${i}`).join('\n')}\n\nFocusing on these areas will have the biggest impact on your resume's effectiveness.`;
    }
    return "Your resume has a solid foundation. Consider adding more quantifiable metrics to your achievements and ensuring all sections are complete.";
  }
  
  // Contact information
  if (/(contact|email|phone|linkedin)/i.test(lowerQuestion)) {
    const contactSection = feedback.sections?.find((s: any) => s.title === "Contact Information");
    if (contactSection) {
      let response = `Your Contact Information section scored ${contactSection.score}/100. `;
      
      if (contactSection.comments.length > 0) {
        response += `\n\nWhat you have: ${contactSection.comments.join(', ')}.`;
      }
      
      if (contactSection.suggestions.length > 0) {
        response += `\n\nSuggestions:\n${contactSection.suggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}`;
      }
      
      return response;
    }
  }
  
  // Professional summary
  if (/(summary|objective|profile|about)/i.test(lowerQuestion)) {
    const summarySection = feedback.sections?.find((s: any) => s.title === "Professional Summary");
    if (summarySection) {
      let response = `Your Professional Summary section scored ${summarySection.score}/100. `;
      
      if (summarySection.score < 50) {
        response += "This is a critical section that appears at the top of your resume. ";
      }
      
      if (summarySection.suggestions.length > 0) {
        response += `\n\nTo improve:\n${summarySection.suggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}`;
      }
      
      response += "\n\nA strong summary should be 3-5 sentences highlighting your key skills, years of experience, and notable achievements.";
      
      return response;
    }
  }
  
  // Experience questions
  if (/(experience|work|job|employment)/i.test(lowerQuestion)) {
    const expSection = feedback.sections?.find((s: any) => s.title === "Work Experience");
    if (expSection) {
      let response = `Your Work Experience section scored ${expSection.score}/100. `;
      
      if (expSection.comments.length > 0) {
        response += `\n\nPositive aspects: ${expSection.comments.join(', ')}.`;
      }
      
      if (expSection.suggestions.length > 0) {
        response += `\n\nKey improvements:\n${expSection.suggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}`;
      }
      
      response += "\n\nRemember to use strong action verbs (Led, Managed, Developed) and include quantifiable metrics (increased sales by 25%, managed team of 10, etc.).";
      
      return response;
    }
  }
  
  // Skills questions
  if (/(skill|technology|technical|tools|proficienc)/i.test(lowerQuestion)) {
    const skillsSection = feedback.sections?.find((s: any) => s.title === "Skills & Technologies");
    if (skillsSection) {
      let response = `Your Skills & Technologies section scored ${skillsSection.score}/100. `;
      
      if (skillsSection.comments.length > 0) {
        response += `\n\nCurrent status: ${skillsSection.comments.join(', ')}.`;
      }
      
      if (skillsSection.suggestions.length > 0) {
        response += `\n\nRecommendations:\n${skillsSection.suggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}`;
      }
      
      response += "\n\nMake sure to list both technical skills and soft skills relevant to your target position. Include proficiency levels if relevant.";
      
      return response;
    }
  }
  
  // Education questions
  if (/(education|degree|university|college|school)/i.test(lowerQuestion)) {
    const eduSection = feedback.sections?.find((s: any) => s.title === "Education");
    if (eduSection) {
      let response = `Your Education section scored ${eduSection.score}/100. `;
      
      if (eduSection.comments.length > 0) {
        response += `\n\nWhat's included: ${eduSection.comments.join(', ')}.`;
      }
      
      if (eduSection.suggestions.length > 0) {
        response += `\n\nTo enhance this section:\n${eduSection.suggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}`;
      }
      
      return response;
    }
  }
  
  // Format questions
  if (/(format|structure|layout|length|organize)/i.test(lowerQuestion)) {
    const formatSection = feedback.sections?.find((s: any) => s.title === "Format & Structure");
    if (formatSection) {
      let response = `Your Format & Structure scored ${formatSection.score}/100. `;
      
      if (formatSection.comments.length > 0) {
        response += `\n\nPositive points: ${formatSection.comments.join(', ')}.`;
      }
      
      if (formatSection.suggestions.length > 0) {
        response += `\n\nFormatting tips:\n${formatSection.suggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}`;
      }
      
      return response;
    }
  }
  
  // Metrics/numbers questions
  if (/(metric|number|quantif|measur|percent|achievement)/i.test(lowerQuestion)) {
    return "Great question! Quantifiable metrics are crucial for a strong resume. Examples include:\n\n• Increased sales by 35% over 6 months\n• Managed a team of 12 developers\n• Reduced costs by $50K annually\n• Improved customer satisfaction scores from 3.2 to 4.7\n• Delivered 15+ projects on time and under budget\n\nNumbers make your achievements concrete and impressive. Try to add at least 2-3 metrics to each job position.";
  }
  
  // Action verbs questions
  if (/(action verb|start|begin|bullet)/i.test(lowerQuestion)) {
    return "Excellent question! Strong action verbs make your resume more impactful. Here are powerful verbs by category:\n\n**Leadership:** Led, Directed, Managed, Coordinated, Supervised\n**Achievement:** Achieved, Delivered, Exceeded, Generated, Improved\n**Creation:** Developed, Created, Designed, Built, Implemented\n**Analysis:** Analyzed, Researched, Evaluated, Assessed, Investigated\n**Collaboration:** Collaborated, Partnered, Facilitated, Coordinated\n\nStart each bullet point with one of these verbs instead of 'Responsible for' or 'Worked on'.";
  }
  
  // Resume length questions
  if (/(how long|length|pages|word count)/i.test(lowerQuestion)) {
    const wordCount = resumeContent.split(/\s+/).length;
    return `Your resume is approximately ${wordCount} words. For best results:\n\n• Entry-level (0-5 years): 1 page (400-600 words)\n• Mid-level (5-10 years): 1-2 pages (600-800 words)\n• Senior-level (10+ years): 2 pages (800-1000 words)\n\nFocus on quality over quantity. Every sentence should add value and demonstrate your impact.`;
  }
  
  // ATS questions
  if (/(ats|applicant tracking|keyword|scan)/i.test(lowerQuestion)) {
    return "Great question about ATS (Applicant Tracking Systems)! Here are key tips:\n\n1. Use standard section headings (Experience, Education, Skills)\n2. Include keywords from the job description\n3. Avoid tables, images, and complex formatting\n4. Use standard fonts (Arial, Calibri, Times New Roman)\n5. Save as .docx or PDF (check job posting preference)\n6. Spell out acronyms at least once\n7. Use both long-form and abbreviated skill names (e.g., 'Search Engine Optimization (SEO)')\n\nYour resume will be scanned by ATS before a human sees it, so optimization is crucial!";
  }
  
  // Specific section score
  if (/score.*section/i.test(lowerQuestion) || /section.*score/i.test(lowerQuestion)) {
    const scores = feedback.sections?.map((s: any) => `• ${s.title}: ${s.score}/100`).join('\n');
    return `Here's the breakdown of scores by section:\n\n${scores}\n\nFocus on the lowest-scoring sections for maximum improvement impact.`;
  }
  
  // Resume tips
  if (/(tip|advice|suggest|recommend|help)/i.test(lowerQuestion)) {
    return "Here are my top tips for resume improvement:\n\n1. **Quantify Everything**: Add numbers, percentages, and metrics to every achievement\n2. **Tailor for Each Job**: Customize your resume for each application\n3. **Use Action Verbs**: Start bullet points with strong verbs (Led, Developed, Achieved)\n4. **Keep It Concise**: Aim for 1 page if you have <10 years experience\n5. **Show Impact**: Focus on results and outcomes, not just responsibilities\n6. **Proofread Carefully**: No typos or grammatical errors\n7. **Update Regularly**: Add new skills and achievements as you gain them\n\nWould you like specific advice on any of these areas?";
  }
  
  // Default response with context
  return `I can help you with specific questions about your resume! Here's what you can ask me about:\n\n• Overall score and assessment\n• Specific sections (Contact, Summary, Experience, Skills, Education, Format)\n• Strengths and areas for improvement\n• How to add metrics and achievements\n• ATS optimization tips\n• Resume best practices\n\nYour current overall score is ${feedback.overallScore}/100. What would you like to know more about?`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { question, resumeContent, feedback }: ChatRequest = await req.json();

    if (!question || question.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Question is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const answer = generateAIResponse(question, resumeContent, feedback);

    return new Response(
      JSON.stringify({
        success: true,
        answer
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error processing chat:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process question", details: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});