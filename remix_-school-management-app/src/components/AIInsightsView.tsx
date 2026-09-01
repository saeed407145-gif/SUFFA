import React, { useState } from 'react';
import { Student, StudentResult, StudentFeedback, UserSession } from '../types';
import { Sparkles, Brain, Award, MessageSquare, AlertCircle, RefreshCw, BookOpen, Bot, Send, User } from 'lucide-react';
import Markdown from 'react-markdown';

interface AIInsightsViewProps {
  students: Student[];
  results: StudentResult[];
  feedbacks: StudentFeedback[];
  userSession: UserSession | null;
  appearanceMode: 'dark' | 'light';
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export const AIInsightsView: React.FC<AIInsightsViewProps> = ({
  students,
  results,
  feedbacks,
  userSession,
  appearanceMode,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'chatbot' | 'feedback' | 'trajectory' | 'quiz'>('chatbot');
  
  // State for AI Chatbot
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Hello! I am your Al-Suffa AI Chatbot Assistant powered by Gemini 3.6 Flash. How can I assist you with lesson planning, student analytics, or school administration today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [loadingChat, setLoadingChat] = useState<boolean>(false);

  // State for Feedback Summary
  const [feedbackSummary, setFeedbackSummary] = useState<string>('');
  const [loadingFeedback, setLoadingFeedback] = useState<boolean>(false);
  const [feedbackError, setFeedbackError] = useState<string>('');

  // State for Trajectory Prediction
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('');
  const [trajectoryResult, setTrajectoryResult] = useState<string>('');
  const [loadingTrajectory, setLoadingTrajectory] = useState<boolean>(false);
  const [trajectoryError, setTrajectoryError] = useState<string>('');

  // State for Quiz Generator
  const [quizTopic, setQuizTopic] = useState<string>('');
  const [quizClass, setQuizClass] = useState<string>('Class 9');
  const [quizSubject, setQuizSubject] = useState<string>('General Science');
  const [generatedQuiz, setGeneratedQuiz] = useState<string>('');
  const [loadingQuiz, setLoadingQuiz] = useState<boolean>(false);
  const [quizError, setQuizError] = useState<string>('');

  // Handle Chatbot Submit
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || loadingChat) return;

    const userMsgText = chatInput.trim();
    setChatInput('');
    const userMessage: ChatMessage = {
      sender: 'user',
      text: userMsgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMessage]);
    setLoadingChat(true);

    try {
      const historyContext = chatMessages.slice(-6).map(m => `${m.sender === 'user' ? 'Teacher' : 'AI'}: ${m.text}`).join('\n');
      const prompt = `Conversation history:
${historyContext}

Teacher's new message: "${userMsgText}"

Respond as the Al-Suffa School AI Chatbot Assistant. Be helpful, professional, encouraging, and provide clear educational insights or administrative recommendations in markdown format.`;

      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemInstruction: "You are the AI Chatbot Assistant at Al-Suffa Science & Grammar High Schools, Lahore. Provide structured, knowledgeable, and polite responses to faculty questions in clean markdown format."
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const aiMessage: ChatMessage = {
        sender: 'ai',
        text: data.text || 'I am here to help you with any school inquiries.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        sender: 'ai',
        text: `⚠️ Error: ${err.message || 'Failed to generate chatbot response.'}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errMsg]);
    } finally {
      setLoadingChat(false);
    }
  };

  // Generate feedback analysis
  const handleGenerateFeedbackAnalysis = async () => {
    setLoadingFeedback(true);
    setFeedbackError('');
    try {
      if (feedbacks.length === 0) {
        throw new Error("No student feedback has been logged yet to analyze.");
      }

      const feedbackContext = feedbacks.map((f, i) => 
        `Feedback ${i + 1}: Rating Teaching: ${f.teachingRating}/5, Rating Environment: ${f.environmentRating}/5. Comments: "${f.comments}"`
      ).join('\n');

      const prompt = `Analyze the following anonymous student feedback records from Al-Suffa Science & Grammar High Schools, Lahore campus.
Provide:
1. An overall sentiment analysis (Teaching Quality vs School Environment).
2. Key strengths identified by students.
3. Critical areas of concern and proposed corrective plans.
4. Actionable board recommendations.

Feedback Records:
${feedbackContext}`;

      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemInstruction: "You are Al-Suffa's Senior AI Institutional Analyst. Analyze the student feedback comments objectively, identify bottlenecks, and suggest clear structural action items in elegant, readable markdown format."
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFeedbackSummary(data.text || 'No response generated.');
    } catch (err: any) {
      setFeedbackError(err.message || 'Error communicating with Gemini');
    } finally {
      setLoadingFeedback(false);
    }
  };

  // Generate trajectory prediction
  const handleGenerateTrajectory = async () => {
    if (!selectedStudentId) return;
    setLoadingTrajectory(true);
    setTrajectoryError('');
    try {
      const student = students.find(s => s.id === Number(selectedStudentId));
      if (!student) throw new Error("Student record not found.");

      const studentResult = results.find(r => r.studentId === student.id);
      const studentFeedbacks = feedbacks.filter(f => f.studentId === student.id);

      const prompt = `Student Name: ${student.name}
Class/Section: ${student.className}
Roll Number: ${student.rollNo}
Current GPA: ${studentResult?.gpa || 'N/A'}
Exam remarks: "${studentResult?.remarks || 'None'}"
Subject Scores:
${studentResult?.subjectScores?.map(s => `- ${s.subject}: ${s.marks}/${s.totalMarks} (${s.grade})`).join('\n') || 'No scores posted.'}
Student Feedback left:
${studentFeedbacks.map(f => `- ${f.comments}`).join('\n') || 'None'}

Provide:
1. A brief predictive career and subject-strength evaluation.
2. Areas of potential academic risk (where marks or engagement are sub-par).
3. A personalized 4-week study routine and roadmap to improve or maintain GPA.
4. Suggestions for the class teacher on how to assist this student in lecture halls.`;

      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemInstruction: "You are the Head Academic Psychologist and Counselor of Al-Suffa Schools. Provide a hyper-personalized, encouraging, and highly specific grade trajectory prediction and studying routine in clean markdown format."
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTrajectoryResult(data.text || 'No prediction generated.');
    } catch (err: any) {
      setTrajectoryError(err.message || 'Error communicating with Gemini');
    } finally {
      setLoadingTrajectory(false);
    }
  };

  // Generate quiz
  const handleGenerateQuiz = async () => {
    if (!quizTopic.trim()) return;
    setLoadingQuiz(true);
    setQuizError('');
    try {
      const prompt = `Draft a modern, interactive, and aligned daily classroom quiz for ${quizClass} students.
Subject: ${quizSubject}
Topic/Chapter: "${quizTopic}"

Provide:
1. A structured Lesson Plan overview (2-3 sentences).
2. 5 Multi-Choice Questions (MCQs) with option letters (A, B, C, D) and the correct answers explained.
3. 2 Short Answer conceptual questions to test higher-order reasoning.
4. A quick study resource draft or reference tip for the teacher to write on the blackboard.`;

      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemInstruction: "You are a master curriculum designer at Al-Suffa Board of Education. Draft extremely clear, age-appropriate, and syllabus-aligned quizzes and teaching guidelines in structured markdown."
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGeneratedQuiz(data.text || 'No quiz drafted.');
    } catch (err: any) {
      setQuizError(err.message || 'Error communicating with Gemini');
    } finally {
      setLoadingQuiz(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome & System Badge */}
      <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/10 to-transparent border border-blue-500/20 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-[#1f538d] to-indigo-500 text-white rounded-xl shadow-md">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Gemini AI Insights Hub
            </h1>
            <p className="text-xs text-blue-400 font-semibold mt-1">
              Smart Academic Counseling, Lesson Planning, & Feedback Analytics
            </p>
          </div>
        </div>
        <div className="bg-gray-800/80 border border-gray-700/50 px-3 py-1.5 rounded-xl text-xs font-mono text-gray-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          <span>Powered by Gemini 3.6 Flash</span>
        </div>
      </div>

      {/* Sub tabs selector */}
      <div className="flex border-b border-gray-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('chatbot')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition border-b-2 whitespace-nowrap ${
            activeSubTab === 'chatbot'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Bot size={14} />
          AI Chatbot Assistant
        </button>
        <button
          onClick={() => setActiveSubTab('feedback')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition border-b-2 whitespace-nowrap ${
            activeSubTab === 'feedback'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <MessageSquare size={14} />
          Feedback Sentiment Analyser
        </button>
        <button
          onClick={() => setActiveSubTab('trajectory')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition border-b-2 whitespace-nowrap ${
            activeSubTab === 'trajectory'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Brain size={14} />
          Grade Predictor & Study Roadmap
        </button>
        <button
          onClick={() => setActiveSubTab('quiz')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition border-b-2 whitespace-nowrap ${
            activeSubTab === 'quiz'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <BookOpen size={14} />
          AI Quiz & Lesson Plan Generator
        </button>
      </div>

      {/* Main viewport */}
      <div className="space-y-4">
        
        {/* Sub-tab 0: AI Chatbot Assistant */}
        {activeSubTab === 'chatbot' && (
          <div className="bg-gray-800/20 border border-gray-700/30 rounded-2xl p-6 flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Bot size={18} className="text-blue-400" />
                  Al-Suffa AI Chatbot Assistant
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Chat in real time with Gemini 3.6 Flash for instant teaching assistance, classroom management tips, and student counseling.
                </p>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setChatMessages([{
                    sender: 'ai',
                    text: 'Hello! I am your Al-Suffa AI Chatbot Assistant powered by Gemini 3.6 Flash. How can I assist you with lesson planning, student analytics, or school administration today?',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }])}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-xl font-medium transition"
                >
                  Clear Chat
                </button>
              </div>
            </div>

            {/* Chat Messages List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2 custom-scrollbar">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 max-w-2xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.sender === 'user' ? 'bg-[#1f538d] text-white' : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
                  }`}>
                    {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`space-y-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#1f538d] text-white rounded-tr-none'
                        : 'bg-gray-900 border border-gray-800 text-gray-200 rounded-tl-none shadow-md'
                    }`}>
                      {msg.sender === 'ai' ? (
                        <div className="prose prose-invert prose-xs max-w-none">
                          <Markdown>{msg.text}</Markdown>
                        </div>
                      ) : (
                        <p>{msg.text}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500 px-1 font-mono">{msg.time}</span>
                  </div>
                </div>
              ))}

              {loadingChat && (
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                    <Bot size={14} />
                  </div>
                  <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl text-xs text-gray-400 flex items-center gap-2">
                    <RefreshCw size={14} className="animate-spin text-blue-400" />
                    <span>Gemini is thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="flex gap-2 py-2 overflow-x-auto text-[11px] shrink-0">
              <button
                onClick={() => setChatInput("How can I handle disruptive students during class?")}
                className="px-3 py-1 bg-gray-800/80 hover:bg-gray-700 text-gray-300 rounded-lg whitespace-hidden sm:whitespace-nowrap transition border border-gray-700/50"
              >
                💡 Handling classroom discipline
              </button>
              <button
                onClick={() => setChatInput("Give me 5 interactive science experiments for Class 9.")}
                className="px-3 py-1 bg-gray-800/80 hover:bg-gray-700 text-gray-300 rounded-lg whitespace-nowrap transition border border-gray-700/50"
              >
                🔬 Science experiments
              </button>
              <button
                onClick={() => setChatInput("Draft a welcome speech for the new academic term.")}
                className="px-3 py-1 bg-gray-800/80 hover:bg-gray-700 text-gray-300 rounded-lg whitespace-nowrap transition border border-gray-700/50"
              >
                📝 Term welcome speech
              </button>
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendChatMessage} className="pt-3 border-t border-gray-800 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask your AI chatbot assistant anything..."
                className="flex-1 bg-gray-900 border border-gray-750 text-xs text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={loadingChat || !chatInput.trim()}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition shadow-lg disabled:opacity-50 shrink-0"
              >
                <Send size={14} />
                Send
              </button>
            </form>
          </div>
        )}

        {/* Sub-tab 2: Trajectory Prediction */}
        {activeSubTab === 'trajectory' && (
          <div className="bg-gray-800/20 border border-gray-700/30 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Select Student to Analyze
                </label>
                <select
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-gray-900 border border-gray-750 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Choose a Student --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.className})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleGenerateTrajectory}
                disabled={loadingTrajectory || !selectedStudentId}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition shadow-lg disabled:opacity-50 h-fit"
              >
                {loadingTrajectory ? <RefreshCw size={14} className="animate-spin" /> : <Brain size={14} />}
                Generate Study Routine
              </button>
            </div>

            {trajectoryError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{trajectoryError}</span>
              </div>
            )}

            {trajectoryResult ? (
              <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-850 overflow-y-auto max-h-[480px] text-xs leading-relaxed text-gray-300 custom-scrollbar">
                <div className="prose prose-invert prose-xs max-w-none">
                  <Markdown>{trajectoryResult}</Markdown>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-gray-800 p-12 text-center rounded-2xl text-gray-500 text-xs">
                Select a student from the registry to request a custom study routing guide.
              </div>
            )}
          </div>
        )}

        {/* Sub-tab 3: Quiz & Lesson Plan Generator */}
        {activeSubTab === 'quiz' && (
          <div className="bg-gray-800/20 border border-gray-700/30 rounded-2xl p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Class</label>
                <select
                  value={quizClass}
                  onChange={e => setQuizClass(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-750 text-xs text-white rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Syllabus Subject</label>
                <select
                  value={quizSubject}
                  onChange={e => setQuizSubject(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-750 text-xs text-white rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="General Science">General Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Islamic Studies">Islamic Studies</option>
                  <option value="English Grammar">English Grammar</option>
                  <option value="Urdu Literature">Urdu Literature</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quiz Chapter / Topic</label>
                <input
                  type="text"
                  value={quizTopic}
                  onChange={e => setQuizTopic(e.target.value)}
                  placeholder="e.g. Newton's Laws of Motion"
                  className="w-full bg-gray-900 border border-gray-750 text-xs text-white rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleGenerateQuiz}
                disabled={loadingQuiz || !quizTopic.trim()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition shadow-lg disabled:opacity-50"
              >
                {loadingQuiz ? <RefreshCw size={14} className="animate-spin" /> : <BookOpen size={14} />}
                Draft Aligned Quiz
              </button>
            </div>

            {quizError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{quizError}</span>
              </div>
            )}

            {generatedQuiz ? (
              <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-850 overflow-y-auto max-h-[480px] text-xs leading-relaxed text-gray-300 custom-scrollbar">
                <div className="prose prose-invert prose-xs max-w-none">
                  <Markdown>{generatedQuiz}</Markdown>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-gray-800 p-12 text-center rounded-2xl text-gray-500 text-xs">
                Provide a syllabus topic to let Gemini draft lesson plans and quizzes.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
