import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Layout } from '../components/Layout.jsx';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { studentService } from '../services/hubServices.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import ReactMarkdown from 'react-markdown';
import { GraduationCap, FileText, Upload, Sparkles, Send, PlayCircle, Award, CheckCircle, RefreshCw, BarChart, Video, VideoOff, CameraOff, Mic, MicOff, Volume2 } from 'lucide-react';
import { Disclaimer } from '../components/Disclaimer.jsx';
import { HubGuide } from '../components/HubGuide.jsx';
import { ResultActions } from '../components/ResultActions.jsx';
import { Feedback } from '../components/Feedback.jsx';

const StudentPage = () => {
  const { t, language } = useLanguage();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'interview'

  // Student Profile Form State
  const [formData, setFormData] = useState({
    cgpa: '',
    skills: '',
    experience: 'Beginner',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Resume Reader State
  const [parsingResume, setParsingResume] = useState(false);

  // Mock Interview State
  const [interviewRole, setInterviewRole] = useState('Software Engineer');
  const [interviewDiff, setInterviewDiff] = useState('Medium');
  const [interviewStatus, setInterviewStatus] = useState('idle'); // 'idle', 'active', 'finished'
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [evalLoading, setEvalLoading] = useState(false);
  const [latestFeedback, setLatestFeedback] = useState(null);
  const [allGrades, setAllGrades] = useState([]); // Array of { question, answer, score, feedback }

  // Live Interview Media Stream states & refs
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      });
      setStream(mediaStream);
      setIsCameraOn(true);
      setIsMicOn(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 150);
    } catch (err) {
      console.error("Camera/Mic access failed:", err);
      addNotification("Camera/Mic access denied or unavailable. Running in text-only mode.", "warning");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsListening(false);
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {}
    }
  };

  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
        addNotification(videoTrack.enabled ? "Camera enabled." : "Camera disabled.", "info");
      }
    }
  };

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
        addNotification(audioTrack.enabled ? "Microphone enabled." : "Microphone disabled.", "info");
      }
    }
  };

  // Web Speech API for transcribing voice responses
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = false;
      recog.lang = language === 'en' ? 'en-US' : 'te-IN';

      recog.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setUserAnswer((prev) => prev ? prev + ' ' + transcript : transcript);
      };

      recog.onerror = (e) => {
        console.error("Speech recognition error:", e);
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognition) {
      addNotification("Speech recognition is not supported in this browser. Try Chrome or Edge.", "warning");
      return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      addNotification("Voice typing stopped.", "info");
    } else {
      recognition.start();
      setIsListening(true);
      addNotification("Voice typing active. Speak clearly into your mic.", "info");
    }
  };

  // Clean up streams when status leaves 'active'
  useEffect(() => {
    if (interviewStatus !== 'active') {
      stopCamera();
    }
  }, [interviewStatus]);

  // Clean up streams on page unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Speak text using browser SpeechSynthesis
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'en' ? 'en-US' : 'te-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Bind video stream to the video element ref robustly when mounted
  useEffect(() => {
    if (videoRef.current && stream && isCameraOn) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isCameraOn]);

  // Clean up SpeechSynthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    addNotification('Synthesizing career advice and calculating skill gaps...', 'info');

    try {
      const data = await studentService.analyze({ ...formData, language });
      setResult(data.advice || data.full_response || data);
      addNotification('Career guidance and roadmap generated!', 'success');
    } catch (error) {
      console.error('Analysis error:', error);
      addNotification('Failed to generate career report.', 'error');
      alert(error.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  // Resume Upload Reader
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setParsingResume(true);
    addNotification(`Reading and parsing resume: ${file.name}...`, 'info');

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);

      // Call endpoints
      const response = await axios.post('/api/student/read_resume', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const parsed = response.data;
      if (parsed.error) {
        addNotification(parsed.error, 'error');
        return;
      }

      // Auto-fill fields
      setFormData({
        cgpa: parsed.cgpa || formData.cgpa,
        skills: parsed.skills || formData.skills,
        experience: parsed.experience || formData.experience,
        bio: parsed.bio || formData.bio,
      });

      addNotification('Resume parsed! Career profile auto-populated.', 'success');
    } catch (error) {
      console.error('Resume reading error:', error);
      addNotification('Failed to parse resume file.', 'error');
    } finally {
      setParsingResume(false);
    }
  };

  // Start Mock Interview
  const handleStartInterview = async () => {
    setEvalLoading(true);
    setInterviewStatus('active');
    setInterviewHistory([]);
    setAllGrades([]);
    setLatestFeedback(null);
    addNotification(`Starting mock interview session for ${interviewRole}...`, 'info');

    try {
      const response = await axios.post('/api/student/mock_interview', {
        role: interviewRole,
        difficulty: interviewDiff,
        history: []
      });

      setCurrentQuestion(response.data.next_question);
      setInterviewHistory([{ role: 'interviewer', content: response.data.next_question }]);
      await startCamera();
      speakText(response.data.next_question);
    } catch (error) {
      console.error(error);
      addNotification('Failed to initialize mock interview.', 'error');
      setInterviewStatus('idle');
      stopCamera();
    } finally {
      setEvalLoading(false);
    }
  };

  // Submit Answer to Interview
  const handleSendAnswer = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    setEvalLoading(true);
    addNotification('Evaluating response...', 'info');

    // Save answer locally
    const currentQ = currentQuestion;
    const answer = userAnswer;
    setUserAnswer('');

    const newHistory = [
      ...interviewHistory,
      { role: 'candidate', content: answer }
    ];
    setInterviewHistory(newHistory);

    try {
      const response = await axios.post('/api/student/mock_interview', {
        role: interviewRole,
        difficulty: interviewDiff,
        history: newHistory
      });

      const feedback = {
        question: currentQ,
        answer: answer,
        score: response.data.score,
        feedback: response.data.feedback
      };

      setLatestFeedback(feedback);
      setAllGrades((prev) => [...prev, feedback]);

      if (response.data.finished) {
        setInterviewStatus('finished');
        addNotification('Mock interview completed! Grade report ready.', 'success');
        speakText("Interview completed. Thank you!");
      } else {
        setCurrentQuestion(response.data.next_question);
        setInterviewHistory([
          ...newHistory,
          { role: 'interviewer', content: response.data.next_question }
        ]);
        addNotification('Response evaluated! Proceed to next question.', 'success');
        speakText(response.data.next_question);
      }
    } catch (error) {
      console.error(error);
      addNotification('Failed to process interview response.', 'error');
    } finally {
      setEvalLoading(false);
    }
  };

  // Helper to split Roadmap & Skill Gap markdown sections
  const parseResultSections = (text) => {
    if (!text) return { roadmap: '', gap: '', resources: '' };

    // Find headers
    const sections = text.split(/(?=#\s+CareerPathwayRoadmap|#\s+Career\s+Pathway\s+Roadmap|#\s+Skill\s+Gap\s+Analysis|#\s+Recommended\s+Resources)/i);
    
    let roadmap = '';
    let gap = '';
    let resources = '';

    sections.forEach((sec) => {
      if (/Pathway\s+Roadmap/i.test(sec)) {
        roadmap = sec;
      } else if (/Skill\s+Gap/i.test(sec)) {
        gap = sec;
      } else if (/Recommended\s+Resources/i.test(sec)) {
        resources = sec;
      }
    });

    // Fallback if split failed
    if (!roadmap && !gap) {
      roadmap = text;
    }

    return { roadmap, gap, resources };
  };

  const parsed = parseResultSections(result);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <div className="flex items-center mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              {t('landing.hubs.student')}
            </h1>
            <HubGuide hub="student" />
          </div>
          <p className="text-white/60">AI-powered career guidance, skill gap analysis, and interactive mock interviews</p>
        </div>

        <Disclaimer />

        {/* Tab Toggle */}
        <div className="flex gap-4 border-b border-white/10 pb-4 mb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                : 'bg-glass border border-white/10 text-white/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              E-Mentor Guidance & Gap Analysis
            </div>
          </button>
          <button
            onClick={() => setActiveTab('interview')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === 'interview'
                ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                : 'bg-glass border border-white/10 text-white/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5" />
              Mock Interview Arena
            </div>
          </button>
        </div>

        {activeTab === 'profile' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-6">
              {/* Profile Card */}
              <Card>
                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                  <h2 className="text-xl font-semibold">Student Career Profile</h2>
                  
                  {/* Resume Upload Button */}
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400 cursor-pointer hover:bg-blue-500/20 transition-all text-xs font-bold">
                    {parsingResume ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        Autofill with Resume
                      </>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.txt"
                      onChange={handleResumeUpload}
                      className="hidden"
                      disabled={parsingResume}
                    />
                  </label>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="CGPA"
                    type="text"
                    name="cgpa"
                    placeholder="e.g., 8.5 / 10"
                    value={formData.cgpa}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    label="Skills"
                    type="text"
                    name="skills"
                    placeholder="e.g., Python, React, Data Analysis"
                    value={formData.skills}
                    onChange={handleChange}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Experience Level</label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className="input-field w-full"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Bio / Career Goal</label>
                    <textarea
                      name="bio"
                      placeholder="e.g., Aspiring Software Development Engineer (SDE) looking to build scalable cloud apps..."
                      value={formData.bio}
                      onChange={handleChange}
                      className="input-field w-full min-h-[120px] resize-none"
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600">
                    {loading ? <LoadingSpinner size="sm" /> : 'Get Career Guidance'}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Structured Guidance Results */}
            <div className="lg:col-span-7">
              <Card className="h-full flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-4">E-Mentor Output</h2>
                  {result ? (
                    <div className="space-y-6 animate-slide-up">
                      <ResultActions content={result} title="Career_Guidance" />

                      {/* Display Roadmap tab/box */}
                      {parsed.roadmap && (
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                          <div className="prose prose-invert max-w-none">
                            <ReactMarkdown>{parsed.roadmap}</ReactMarkdown>
                          </div>
                        </div>
                      )}

                      {/* Display Skill Gap tab/box with special accent */}
                      {parsed.gap && (
                        <div className="p-4 rounded-xl bg-blue-500/[0.03] border border-blue-500/20">
                          <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-1.5">
                            <Award className="w-5 h-5" />
                            Target Skill Gaps & Upgrades
                          </h3>
                          <div className="prose prose-invert max-w-none">
                            <ReactMarkdown>{parsed.gap}</ReactMarkdown>
                          </div>
                        </div>
                      )}

                      {/* Display Resources */}
                      {parsed.resources && (
                        <div className="p-4 rounded-xl bg-emerald-500/[0.02] border border-emerald-500/20">
                          <div className="prose prose-invert max-w-none">
                            <ReactMarkdown>{parsed.resources}</ReactMarkdown>
                          </div>
                        </div>
                      )}

                      <Feedback />
                      <Disclaimer type="footer" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-white/40 border-2 border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                      <GraduationCap className="w-12 h-12 mb-4 opacity-50" />
                      <p className="text-center max-w-[240px]">Fill in your profile or upload a resume to unlock career roadmaps and skill gap checklists.</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        ) : (
          /* Mock Interview Arena Tab */
          <div className="max-w-4xl mx-auto animate-fade-in">
            {interviewStatus === 'idle' && (
              <Card className="p-8 text-center max-w-lg mx-auto">
                <PlayCircle className="w-16 h-16 mx-auto mb-4 text-blue-400 animate-pulse" />
                <h2 className="text-2xl font-bold mb-2 text-white">Mock Interview Simulator</h2>
                <p className="text-sm text-white/60 mb-6">Test your technical readiness. Get immediate answer critiques and grading scores from our AI mentor.</p>

                <div className="space-y-4 text-left mb-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-white/50 font-bold mb-2">Target Job Role</label>
                    <input
                      type="text"
                      value={interviewRole}
                      onChange={(e) => setInterviewRole(e.target.value)}
                      placeholder="e.g. Software Engineer, Data Analyst"
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-white/50 font-bold mb-2">Difficulty</label>
                    <select
                      value={interviewDiff}
                      onChange={(e) => setInterviewDiff(e.target.value)}
                      className="input-field w-full"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <Button
                  onClick={handleStartInterview}
                  disabled={evalLoading}
                  className="w-full bg-blue-500 hover:bg-blue-600 font-bold py-3 text-sm"
                >
                  {evalLoading ? <LoadingSpinner size="sm" /> : 'Start Interview Session'}
                </Button>
              </Card>
            )}

            {interviewStatus === 'active' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left Side: Video Preview & Voice Controls */}
                <div className="lg:col-span-5 flex flex-col justify-between">
                  <Card className="flex flex-col justify-between h-full min-h-[400px] border border-blue-500/10">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                        <Video className="w-5 h-5 text-blue-400" />
                        Live Candidate Console
                      </h3>
                      
                      {/* Video Stream Container */}
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-navy/60 border border-white/10 flex items-center justify-center">
                        {stream && isCameraOn ? (
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover scale-x-[-1]"
                          />
                        ) : (
                          <div className="text-center p-6 space-y-2">
                            <CameraOff className="w-12 h-12 mx-auto text-white/30" />
                            <p className="text-xs text-white/40">Camera stream is offline</p>
                          </div>
                        )}
                        
                        {/* Stream Indicators */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/5">
                          <span className={`w-2 h-2 rounded-full ${stream ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                          <span className="text-[10px] text-white/80 font-bold uppercase tracking-wider">
                            {stream ? 'Live Stream' : 'Disconnected'}
                          </span>
                        </div>
                        
                        {/* Audio activity visualizer overlay */}
                        {stream && isMicOn && (
                          <div className="absolute bottom-3 right-3 flex items-end gap-0.5 h-4 px-1.5 py-1 rounded bg-black/40">
                            <span className={`w-0.5 bg-blue-400 rounded-full animate-[soundWave_1s_infinite_0.1s] ${isListening ? 'h-3' : 'h-1'}`} />
                            <span className={`w-0.5 bg-blue-400 rounded-full animate-[soundWave_1s_infinite_0.3s] ${isListening ? 'h-4' : 'h-1.5'}`} />
                            <span className={`w-0.5 bg-blue-400 rounded-full animate-[soundWave_1s_infinite_0.5s] ${isListening ? 'h-3' : 'h-1'}`} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Media Device Controls */}
                    <div className="mt-6 space-y-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          type="button"
                          onClick={toggleCamera}
                          disabled={!stream}
                          className={`p-3 rounded-xl border transition-all ${
                            isCameraOn 
                              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20' 
                              : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                          }`}
                          title={isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
                        >
                          {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                        </button>
                        
                        <button
                          type="button"
                          onClick={toggleMic}
                          disabled={!stream}
                          className={`p-3 rounded-xl border transition-all ${
                            isMicOn 
                              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20' 
                              : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                          }`}
                          title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
                        >
                          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                        </button>

                        <button
                          type="button"
                          onClick={toggleListening}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all ${
                            isListening 
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 animate-pulse' 
                              : 'bg-glass border-white/10 text-white/70 hover:text-white hover:border-white/20'
                          }`}
                        >
                          <Mic className="w-4 h-4" />
                          {isListening ? "Listening..." : "Voice Answer"}
                        </button>
                      </div>
                      <p className="text-[10px] text-white/40 text-center leading-relaxed">
                        Toggle voice typing to dictate your answer directly using Web Speech transcription.
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Right Side: Conversation Console */}
                <div className="lg:col-span-7">
                  <Card className="flex flex-col h-full min-h-[400px] justify-between p-6">
                    <div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                        <span className="text-xs font-mono font-bold bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full uppercase tracking-wider">
                          Interviewer for {interviewRole} ({interviewDiff})
                        </span>
                        <span className="text-xs text-white/40 font-bold">Round {allGrades.length + 1} of 3</span>
                      </div>

                      {/* Conversation Window */}
                      <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2">
                        {/* Prompt question */}
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <p className="text-xs text-blue-400 font-bold mb-1 uppercase tracking-wider">Question:</p>
                            <p className="text-sm leading-relaxed">{currentQuestion}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => speakText(currentQuestion)}
                            className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all flex-shrink-0"
                            title="Replay Audio"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Latest evaluation feedback (if any) */}
                        {latestFeedback && (
                          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-white leading-normal animate-slide-up">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-xs text-emerald-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Score: {latestFeedback.score} / 10
                              </span>
                            </div>
                            <p className="text-xs text-white/70 italic">{latestFeedback.feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Text area for user response */}
                    <form onSubmit={handleSendAnswer} className="mt-4 pt-3 border-t border-white/5 flex gap-2">
                      <textarea
                        rows="2"
                        placeholder="Type or dictate your answer in detail..."
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        className="input-field w-full text-sm resize-none"
                        disabled={evalLoading}
                        required
                      />
                      <button
                        type="submit"
                        disabled={evalLoading || !userAnswer.trim()}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-3.5 rounded-xl transition-all flex items-center justify-center flex-shrink-0"
                      >
                        {evalLoading ? <LoadingSpinner size="sm" /> : <Send className="w-5 h-5" />}
                      </button>
                    </form>
                  </Card>
                </div>
              </div>
            )}

            {interviewStatus === 'finished' && (
              <Card className="p-6 space-y-6">
                <div className="text-center border-b border-white/5 pb-6">
                  <Award className="w-16 h-16 mx-auto text-yellow-500 mb-2 animate-bounce" />
                  <h2 className="text-2xl font-extrabold text-white">Interview Complete!</h2>
                  <p className="text-sm text-white/60">Excellent effort! Review your diagnostic grade report card below.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-1.5 text-white">
                    <BarChart className="w-5 h-5 text-blue-400" />
                    Grading Performance Report
                  </h3>
                  
                  {allGrades.map((grade, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white/50">Round {idx + 1}</span>
                        <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">Score: {grade.score} / 10</span>
                      </div>
                      <p className="text-sm font-semibold text-white/90">Q: {grade.question}</p>
                      <p className="text-xs text-white/60 bg-white/5 p-2 rounded-lg italic">Your Answer: "{grade.answer}"</p>
                      <p className="text-xs text-blue-300 font-medium">Feedback: {grade.feedback}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={() => setInterviewStatus('idle')}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 font-bold"
                  >
                    Start New Mock Interview
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentPage;
