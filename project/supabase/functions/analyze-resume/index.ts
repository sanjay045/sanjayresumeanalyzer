import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ResumeAnalysisRequest {
  resumeText: string;
  fileName: string;
}

interface FeedbackSection {
  title: string;
  score: number;
  comments: string[];
  suggestions: string[];
}

interface AnalysisResult {
  overallScore: number;
  sections: FeedbackSection[];
  strengths: string[];
  improvements: string[];
  summary: string;
}

function analyzeResume(resumeText: string): AnalysisResult {
  const text = resumeText.toLowerCase();
  const sections: FeedbackSection[] = [];
  const strengths: string[] = [];
  const improvements: string[] = [];
  
  let totalScore = 0;
  let sectionCount = 0;

  // 1. Contact Information Analysis
  const hasEmail = /@/.test(text);
  const hasPhone = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
  const hasLinkedIn = /linkedin/.test(text);
  const hasLocation = /(city|state|country|[A-Z]{2}\s\d{5})/.test(text);
  
  let contactScore = 0;
  const contactComments = [];
  const contactSuggestions = [];
  
  if (hasEmail) { contactScore += 30; contactComments.push("Email address found"); }
  else { contactSuggestions.push("Add a professional email address"); }
  
  if (hasPhone) { contactScore += 25; contactComments.push("Phone number included"); }
  else { contactSuggestions.push("Include a phone number for easy contact"); }
  
  if (hasLinkedIn) { contactScore += 25; contactComments.push("LinkedIn profile present"); }
  else { contactSuggestions.push("Add your LinkedIn profile URL"); }
  
  if (hasLocation) { contactScore += 20; contactComments.push("Location information provided"); }
  else { contactSuggestions.push("Include your city and state/country"); }
  
  sections.push({
    title: "Contact Information",
    score: contactScore,
    comments: contactComments,
    suggestions: contactSuggestions
  });
  totalScore += contactScore;
  sectionCount++;

  // 2. Professional Summary Analysis
  const hasSummary = /(summary|profile|about|objective)/.test(text);
  const summaryLength = hasSummary ? resumeText.length : 0;
  
  let summaryScore = 0;
  const summaryComments = [];
  const summarySuggestions = [];
  
  if (hasSummary) {
    summaryScore += 40;
    summaryComments.push("Professional summary section detected");
    if (summaryLength > 200) {
      summaryScore += 30;
      summaryComments.push("Good length for summary");
    } else {
      summarySuggestions.push("Expand your summary to 3-5 sentences highlighting key achievements");
    }
    if (/(years|experience|expert|senior|lead|manager)/.test(text)) {
      summaryScore += 30;
      summaryComments.push("Experience level mentioned");
    }
  } else {
    summarySuggestions.push("Add a professional summary at the top of your resume");
    summarySuggestions.push("Highlight 3-5 key skills and years of experience");
  }
  
  sections.push({
    title: "Professional Summary",
    score: summaryScore,
    comments: summaryComments,
    suggestions: summarySuggestions
  });
  totalScore += summaryScore;
  sectionCount++;

  // 3. Work Experience Analysis
  const hasExperience = /(experience|employment|work history)/.test(text);
  const bulletPoints = (resumeText.match(/[•\-*]|^\s*\d+\./gm) || []).length;
  const hasMetrics = /(\d+%|\$\d+|\d+\+|increased|decreased|improved|reduced|grew|generated)/.test(text);
  const hasActionVerbs = /(led|managed|developed|created|implemented|designed|analyzed|coordinated|achieved|delivered)/.test(text);
  
  let experienceScore = 0;
  const experienceComments = [];
  const experienceSuggestions = [];
  
  if (hasExperience) {
    experienceScore += 20;
    experienceComments.push("Work experience section present");
  } else {
    experienceSuggestions.push("Add a work experience section with your job history");
  }
  
  if (bulletPoints >= 3) {
    experienceScore += 25;
    experienceComments.push(`${bulletPoints} bullet points found - good structure`);
  } else {
    experienceSuggestions.push("Use bullet points to describe your responsibilities and achievements");
  }
  
  if (hasMetrics) {
    experienceScore += 30;
    experienceComments.push("Quantifiable achievements detected");
    strengths.push("Uses numbers and metrics to demonstrate impact");
  } else {
    experienceSuggestions.push("Add quantifiable metrics (%, $, numbers) to show your impact");
    improvements.push("Include specific numbers and results in your achievements");
  }
  
  if (hasActionVerbs) {
    experienceScore += 25;
    experienceComments.push("Strong action verbs used");
  } else {
    experienceSuggestions.push("Start bullet points with strong action verbs (Led, Managed, Developed)");
  }
  
  sections.push({
    title: "Work Experience",
    score: experienceScore,
    comments: experienceComments,
    suggestions: experienceSuggestions
  });
  totalScore += experienceScore;
  sectionCount++;

  // 4. Skills Analysis
  const hasSkills = /(skills|technologies|tools|proficiencies)/.test(text);
  const technicalSkills = (resumeText.match(/(javascript|python|java|react|node|sql|aws|azure|git|docker|kubernetes|typescript|html|css|angular|vue|c\+\+|c#|\.net)/gi) || []).length;
  
  let skillsScore = 0;
  const skillsComments = [];
  const skillsSuggestions = [];
  
  if (hasSkills) {
    skillsScore += 30;
    skillsComments.push("Skills section identified");
  } else {
    skillsSuggestions.push("Create a dedicated skills section");
  }
  
  if (technicalSkills >= 5) {
    skillsScore += 40;
    skillsComments.push(`${technicalSkills} technical skills listed`);
    strengths.push("Strong technical skills portfolio");
  } else if (technicalSkills > 0) {
    skillsScore += 20;
    skillsComments.push(`${technicalSkills} technical skills found`);
    skillsSuggestions.push("List more relevant technical skills");
  } else {
    skillsSuggestions.push("Include relevant technical skills for your target role");
  }
  
  if (/(certification|certified|certificate)/.test(text)) {
    skillsScore += 30;
    skillsComments.push("Certifications mentioned");
    strengths.push("Has professional certifications");
  }
  
  sections.push({
    title: "Skills & Technologies",
    score: skillsScore,
    comments: skillsComments,
    suggestions: skillsSuggestions
  });
  totalScore += skillsScore;
  sectionCount++;

  // 5. Education Analysis
  const hasEducation = /(education|degree|university|college|bachelor|master|phd)/.test(text);
  const hasGPA = /(gpa|grade point average|\d\.\d\s*(gpa|average))/.test(text);
  
  let educationScore = 0;
  const educationComments = [];
  const educationSuggestions = [];
  
  if (hasEducation) {
    educationScore += 60;
    educationComments.push("Education section present");
    
    if (/(bachelor|bs|ba|master|ms|ma|mba|phd)/.test(text)) {
      educationScore += 20;
      educationComments.push("Degree type specified");
    }
    
    if (hasGPA) {
      educationScore += 20;
      educationComments.push("GPA included");
    }
  } else {
    educationSuggestions.push("Add your educational background");
  }
  
  sections.push({
    title: "Education",
    score: educationScore,
    comments: educationComments,
    suggestions: educationSuggestions
  });
  totalScore += educationScore;
  sectionCount++;

  // 6. Format & Structure Analysis
  const wordCount = resumeText.split(/\s+/).length;
  let formatScore = 0;
  const formatComments = [];
  const formatSuggestions = [];
  
  if (wordCount >= 200 && wordCount <= 800) {
    formatScore += 40;
    formatComments.push("Appropriate resume length");
  } else if (wordCount < 200) {
    formatScore += 15;
    formatSuggestions.push("Resume seems short - add more details about your experience");
  } else {
    formatScore += 25;
    formatSuggestions.push("Resume is lengthy - consider condensing to 1-2 pages");
  }
  
  if (bulletPoints >= 5) {
    formatScore += 30;
    formatComments.push("Good use of bullet points for readability");
  } else {
    formatSuggestions.push("Use more bullet points to improve readability");
  }
  
  const hasDates = /(20\d{2}|19\d{2}|present|current)/.test(text);
  if (hasDates) {
    formatScore += 30;
    formatComments.push("Timeline information included");
  } else {
    formatSuggestions.push("Include dates for your experience and education");
  }
  
  sections.push({
    title: "Format & Structure",
    score: formatScore,
    comments: formatComments,
    suggestions: formatSuggestions
  });
  totalScore += formatScore;
  sectionCount++;

  // Calculate overall score
  const overallScore = Math.round(totalScore / sectionCount);
  
  // Generate overall strengths and improvements
  if (strengths.length === 0) {
    if (hasMetrics) strengths.push("Includes quantifiable achievements");
    if (technicalSkills >= 5) strengths.push("Strong technical skill set");
    if (bulletPoints >= 8) strengths.push("Well-structured with clear bullet points");
    if (contactScore === 100) strengths.push("Complete contact information");
  }
  
  if (improvements.length === 0) {
    if (!hasMetrics) improvements.push("Add quantifiable metrics to demonstrate impact");
    if (technicalSkills < 5) improvements.push("Expand technical skills section");
    if (!hasSummary) improvements.push("Include a professional summary");
    if (bulletPoints < 5) improvements.push("Use more bullet points for better readability");
  }
  
  // Generate summary
  let summary = "";
  if (overallScore >= 80) {
    summary = "Excellent resume! Your resume demonstrates strong professional presentation with clear achievements and comprehensive information. Minor refinements could make it even stronger.";
  } else if (overallScore >= 60) {
    summary = "Good foundation! Your resume has solid content but could benefit from additional details, metrics, and structural improvements to stand out to recruiters.";
  } else if (overallScore >= 40) {
    summary = "Needs improvement. Your resume has basic information but lacks key elements that recruiters look for. Focus on adding quantifiable achievements and expanding critical sections.";
  } else {
    summary = "Significant work needed. Your resume is missing several critical components. Consider adding more detailed work experience, skills, and ensuring all standard sections are present.";
  }

  return {
    overallScore,
    sections,
    strengths,
    improvements,
    summary
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { resumeText, fileName }: ResumeAnalysisRequest = await req.json();

    if (!resumeText || resumeText.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Resume text is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Perform AI analysis
    const analysis = analyzeResume(resumeText);

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        fileName
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error analyzing resume:", error);
    return new Response(
      JSON.stringify({ error: "Failed to analyze resume", details: error.message }),
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