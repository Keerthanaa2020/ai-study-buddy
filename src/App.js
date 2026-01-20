import { useState } from 'react';
import { BookOpen, Brain, CheckCircle, XCircle } from 'lucide-react';

export default function StudyBuddy() {
  const [mode, setMode] = useState('home');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const simplifyTopic = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    setResponse('');
    
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            { 
              role: "user", 
              content: `Explain this topic in simple, easy-to-understand terms for a student: ${topic}. Use clear examples and break it down step by step.`
            }
          ],
        })
      });

      const data = await res.json();
      const text = data.content.find(c => c.type === 'text')?.text || 'Could not generate explanation.';
      setResponse(text);
    } catch (error) {
      setResponse('Error: Could not connect to AI. Please try again.');
    }
    
    setLoading(false);
  };

  const generateQuiz = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    setQuiz(null);
    setUserAnswers({});
    setShowResults(false);
    
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            { 
              role: "user", 
              content: `Generate a 5-question multiple choice quiz about: ${topic}. Return ONLY valid JSON in this exact format with no other text:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0
    }
  ]
}`
            }
          ],
        })
      });

      const data = await res.json();
      const text = data.content.find(c => c.type === 'text')?.text || '';
      const cleaned = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      setQuiz(parsed);
    } catch (error) {
      setResponse('Error generating quiz. Please try again.');
    }
    
    setLoading(false);
  };

  const handleAnswerSelect = (qIndex, optionIndex) => {
    if (showResults) return;
    setUserAnswers({...userAnswers, [qIndex]: optionIndex});
  };

  const checkAnswers = () => {
    setShowResults(true);
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-indigo-600 mb-2">AI Study Buddy</h1>
            <p className="text-gray-600">Simplify topics and test your knowledge</p>
          </div>

          {mode === 'home' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What would you like to study?
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Photosynthesis, Pythagorean theorem, World War 2..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => { setMode('explain'); simplifyTopic(); }}
                  disabled={!topic.trim() || loading}
                  className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  <BookOpen size={20} />
                  Simplify Topic
                </button>

                <button
                  onClick={() => { setMode('quiz'); generateQuiz(); }}
                  disabled={!topic.trim() || loading}
                  className="flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  <Brain size={20} />
                  Generate Quiz
                </button>
              </div>
            </div>
          )}

          {mode === 'explain' && (
            <div className="space-y-4">
              <button
                onClick={() => { setMode('home'); setResponse(''); }}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                ← Back
              </button>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">{topic}</h2>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Simplifying topic...</p>
                </div>
              ) : (
                <div className="bg-indigo-50 rounded-lg p-6 whitespace-pre-wrap">
                  {response}
                </div>
              )}
            </div>
          )}

          {mode === 'quiz' && (
            <div className="space-y-4">
              <button
                onClick={() => { setMode('home'); setQuiz(null); setUserAnswers({}); setShowResults(false); }}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                ← Back
              </button>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">Quiz: {topic}</h2>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Generating quiz...</p>
                </div>
              ) : quiz ? (
                <div className="space-y-6">
                  {quiz.questions.map((q, qIndex) => (
                    <div key={qIndex} className="bg-purple-50 rounded-lg p-6">
                      <p className="font-semibold text-gray-800 mb-4">
                        {qIndex + 1}. {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((option, oIndex) => {
                          const isSelected = userAnswers[qIndex] === oIndex;
                          const isCorrect = q.correct === oIndex;
                          const showCorrect = showResults && isCorrect;
                          const showWrong = showResults && isSelected && !isCorrect;

                          return (
                            <button
                              key={oIndex}
                              onClick={() => handleAnswerSelect(qIndex, oIndex)}
                              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition ${
                                showCorrect
                                  ? 'border-green-500 bg-green-100'
                                  : showWrong
                                  ? 'border-red-500 bg-red-100'
                                  : isSelected
                                  ? 'border-purple-500 bg-purple-100'
                                  : 'border-gray-300 bg-white hover:border-purple-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{option}</span>
                                {showCorrect && <CheckCircle className="text-green-600" size={20} />}
                                {showWrong && <XCircle className="text-red-600" size={20} />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-4">
                    {!showResults ? (
                      <button
                        onClick={checkAnswers}
                        disabled={Object.keys(userAnswers).length !== quiz.questions.length}
                        className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
                      >
                        Check Answers
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={resetQuiz}
                          className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-medium"
                        >
                          Try Again
                        </button>
                        <button
                          onClick={() => { setMode('home'); setQuiz(null); setUserAnswers({}); setShowResults(false); }}
                          className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
                        >
                          New Quiz
                        </button>
                      </>
                    )}
                  </div>

                  {showResults && (
                    <div className="text-center p-6 bg-indigo-100 rounded-lg">
                      <p className="text-2xl font-bold text-indigo-800">
                        Score: {Object.entries(userAnswers).filter(([qIndex, answer]) => quiz.questions[qIndex].correct === answer).length} / {quiz.questions.length}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}