import { useState } from 'react';
import { FileText, Sparkles } from 'lucide-react';
import ResumeUpload from './components/ResumeUpload';
import FeedbackDisplay from './components/FeedbackDisplay';
import ResumeChat from './components/ResumeChat';
import { supabase, AnalysisFeedback } from './lib/supabase';

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<AnalysisFeedback | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [resumeContent, setResumeContent] = useState<string>('');
  const [analysisId, setAnalysisId] = useState<string>('');

  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  };

  const analyzeResume = async (resumeText: string, fileName: string) => {
    setIsAnalyzing(true);
    setCurrentFileName(fileName);
    setResumeContent(resumeText);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-resume`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText,
          fileName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }

      const result = await response.json();

      if (result.success && result.analysis) {
        setFeedback(result.analysis);

        const sessionId = generateSessionId();
        const { data, error: dbError } = await supabase
          .from('resume_analyses')
          .insert({
            file_name: fileName,
            file_content: resumeText,
            overall_score: result.analysis.overallScore,
            feedback: result.analysis,
            user_session: sessionId,
          })
          .select()
          .single();

        if (dbError) {
          console.error('Error saving to database:', dbError);
        } else if (data) {
          setAnalysisId(data.id);
        }
      } else {
        throw new Error('Invalid response from analysis service');
      }
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert('Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resume Strength Analyzer</h1>
              <p className="text-sm text-gray-600">Get instant AI-powered feedback on your resume</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!feedback ? (
          <div className="flex flex-col items-center">
            {/* Hero Section */}
            <div className="text-center mb-12 max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Analysis
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Strengthen Your Resume with AI
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Upload your resume and receive detailed, actionable feedback in seconds.
                Our AI analyzes structure, content, and impact to help you stand out.
              </p>
            </div>

            {/* Upload Component */}
            <ResumeUpload onAnalyze={analyzeResume} isAnalyzing={isAnalyzing} />

            {/* Features */}
            <div className="mt-16 grid md:grid-cols-3 gap-8 w-full max-w-4xl">
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Analysis</h3>
                <p className="text-gray-600 text-sm">
                  AI evaluates 6 key sections including experience, skills, and format
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Feedback</h3>
                <p className="text-gray-600 text-sm">
                  Get detailed scores and suggestions within seconds of uploading
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Actionable Tips</h3>
                <p className="text-gray-600 text-sm">
                  Receive specific recommendations to improve each section
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8 w-full">
            <div className="flex flex-col">
              <FeedbackDisplay feedback={feedback} fileName={currentFileName} />
            </div>
            <div className="lg:sticky lg:top-8 lg:self-start">
              <ResumeChat
                feedback={feedback}
                resumeContent={resumeContent}
                analysisId={analysisId}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600 text-sm">
            Upload your resume to get started. Your data is analyzed securely and privately.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
