import { CheckCircle2, AlertCircle, TrendingUp, Target, Award } from 'lucide-react';
import { AnalysisFeedback } from '../lib/supabase';

interface FeedbackDisplayProps {
  feedback: AnalysisFeedback;
  fileName: string;
}

export default function FeedbackDisplay({ feedback, fileName }: FeedbackDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 border-green-300';
    if (score >= 60) return 'bg-yellow-100 border-yellow-300';
    if (score >= 40) return 'bg-orange-100 border-orange-300';
    return 'bg-red-100 border-red-300';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full max-w-4xl space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Resume Analysis Complete</h2>
            <p className="text-gray-600">{fileName}</p>
          </div>
          <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 ${getScoreBgColor(feedback.overallScore)}`}>
            <span className={`text-3xl font-bold ${getScoreColor(feedback.overallScore)}`}>
              {feedback.overallScore}
            </span>
            <span className="text-xs text-gray-600 font-medium">/ 100</span>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${getScoreBgColor(feedback.overallScore)}`}>
          <p className={`text-sm font-medium ${getScoreColor(feedback.overallScore)}`}>
            {feedback.summary}
          </p>
        </div>
      </div>

      {/* Strengths and Improvements */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold text-gray-900">Strengths</h3>
          </div>
          {feedback.strengths.length > 0 ? (
            <ul className="space-y-3">
              {feedback.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">No major strengths identified yet. Keep improving!</p>
          )}
        </div>

        {/* Areas for Improvement */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">Priority Improvements</h3>
          </div>
          {feedback.improvements.length > 0 ? (
            <ul className="space-y-3">
              {feedback.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Target className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{improvement}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">Great job! No critical improvements needed.</p>
          )}
        </div>
      </div>

      {/* Detailed Section Analysis */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Detailed Section Analysis</h3>
        <div className="space-y-6">
          {feedback.sections.map((section, index) => (
            <div key={index} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-900">{section.title}</h4>
                <span className={`text-lg font-bold ${getScoreColor(section.score)}`}>
                  {section.score}/100
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(section.score)}`}
                  style={{ width: `${section.score}%` }}
                />
              </div>

              {/* Comments */}
              {section.comments.length > 0 && (
                <div className="mb-3">
                  <ul className="space-y-2">
                    {section.comments.map((comment, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{comment}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {section.suggestions.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-xs font-semibold text-blue-800 mb-2">Suggestions:</p>
                  <ul className="space-y-2">
                    {section.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-blue-800">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-8 text-white">
        <h3 className="text-2xl font-bold mb-3">Ready to Improve Your Resume?</h3>
        <p className="text-blue-100 mb-4">
          Use the feedback above to strengthen your resume. Focus on the priority improvements and enhance each section based on our suggestions.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200"
        >
          Analyze Another Resume
        </button>
      </div>
    </div>
  );
}
