import React, { useState } from 'react';
import { Layout } from '../components/Layout.jsx';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { medicalService } from '../services/hubServices.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import ReactMarkdown from 'react-markdown';
import { Upload, Activity, FileText, CheckCircle, Stethoscope, Image as ImageIcon } from 'lucide-react';
import { Disclaimer } from '../components/Disclaimer.jsx';
import { HubGuide } from '../components/HubGuide.jsx';
import { ResultActions } from '../components/ResultActions.jsx';
import { Feedback } from '../components/Feedback.jsx';
import { GeneralHealthInput } from '../components/GeneralHealthInput.jsx';
import { GeneralHealthResponse } from '../components/GeneralHealthResponse.jsx';

const MedicalPage = () => {
  const { t, language } = useLanguage();
  const [mode, setMode] = useState('imaging'); // 'imaging' or 'general'

  // Imaging State
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [modelType, setModelType] = useState('lungs');
  const [userNotes, setUserNotes] = useState('');

  // General Health State
  const [symptoms, setSymptoms] = useState('');
  const [healthResult, setHealthResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const models = [
    { id: 'lungs', label: 'Lungs', icon: Activity },
    { id: 'heart', label: 'Heart', icon: Activity },
    { id: 'brain', label: 'Brain', icon: Activity },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('language', language);
      formData.append('user_notes', userNotes);

      const data = await medicalService.predict(modelType, formData);
      setResult(data);
    } catch (error) {
      console.error('Analysis error:', error);
      alert(error.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleHealthAnalyze = async () => {
    if (!symptoms.trim()) return;

    setLoading(true);
    setHealthResult(null);

    try {
      const data = await medicalService.consult({
        symptoms: symptoms,
        language: language
      });
      setHealthResult(data);
    } catch (error) {
      console.error("Consultation Error:", error);
      alert(error.response?.data?.error || "Failed to analyze symptoms");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <div className="flex items-center mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              {t('landing.hubs.medical')}
            </h1>
            <HubGuide hub="medical" />
          </div>
          <p className="text-white/60">AI-powered medical image analysis and health assistance</p>
        </div>

        <Disclaimer />

        {/* Mode Toggle */}
        <div className="flex gap-4 border-b border-white/10 pb-4 mb-4 overflow-x-auto">
          <button
            onClick={() => { setMode('imaging'); setResult(null); }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${mode === 'imaging'
              ? 'bg-red-500/20 border border-red-500/30 text-red-400'
              : 'bg-glass border border-white/10 text-white/60'
              }`}
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              {t('health.modeImage')}
            </div>
          </button>
          <button
            onClick={() => { setMode('general'); setHealthResult(null); }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${mode === 'general'
              ? 'bg-red-500/20 border border-red-500/30 text-red-400'
              : 'bg-glass border border-white/10 text-white/60'
              }`}
          >
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              {t('health.modeGeneral')}
            </div>
          </button>
        </div>

        {mode === 'imaging' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Model Selection */}
            <Card>
              <h2 className="text-xl font-semibold mb-4">Select Model</h2>
              <div className="space-y-2">
                {models.map((model) => {
                  const Icon = model.icon;
                  return (
                    <button
                      key={model.id}
                      onClick={() => setModelType(model.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${modelType === model.id
                        ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                        : 'bg-glass border border-white/10 text-white/60 hover:text-white'
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{model.label}</span>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Upload Section */}
            <Card>
              <h2 className="text-xl font-semibold mb-4">Upload Image</h2>
              <div className="space-y-4">
                <label className="block">
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-red-500/50 transition-all">
                    {preview ? (
                      <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 mx-auto mb-4 text-white/40" />
                        <p className="text-white/60">Click to upload or drag and drop</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <textarea
                  placeholder="Additional notes (optional)"
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  className="input-field w-full min-h-[100px] resize-none"
                />

                <Button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || loading}
                  className="w-full"
                >
                  {loading ? <LoadingSpinner size="sm" /> : t('common.analyze')}
                </Button>
              </div>
            </Card>

            {/* Results */}
            <Card>
              <h2 className="text-xl font-semibold mb-4">Results</h2>
              {result ? (
                <div className="space-y-4 animate-slide-up">
                  <ResultActions content={`${result.prediction}\n\n${result.guidance}`} title="Medical_Analysis" />

                  {result.prediction && (
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="font-semibold text-green-400">Prediction</span>
                      </div>
                      <p className="text-white">{result.prediction}</p>
                    </div>
                  )}
                  {result.guidance && (
                    <div className="prose prose-invert max-w-none">
                      <ReactMarkdown>{result.guidance}</ReactMarkdown>
                    </div>
                  )}
                  {result.confidence && (
                    <div className="text-sm text-white/60">
                      Confidence: {(result.confidence * 100).toFixed(1)}%
                    </div>
                  )}

                  <Feedback />
                  <Disclaimer type="footer" />
                </div>
              ) : (
                <div className="text-center py-12 text-white/60">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Upload an image to analyze</p>
                </div>
              )}
            </Card>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Side */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Stethoscope className="w-6 h-6 text-red-400" />
                    {t('health.title')}
                  </h2>
                  <p className="text-white/60 mb-6">
                    Use this assistant to get general guidance on common health issues.
                    This is not a substitute for professional medical advice.
                  </p>
                  <GeneralHealthInput
                    value={symptoms}
                    onChange={setSymptoms}
                    onSubmit={handleHealthAnalyze}
                    loading={loading}
                  />
                </div>

                {/* Result Side */}
                <div className="border-l border-white/10 pl-0 md:pl-8 pt-8 md:pt-0">
                  <h2 className="text-xl font-semibold mb-4">Analysis & Suggestions</h2>
                  {healthResult ? (
                    <GeneralHealthResponse result={healthResult} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-white/40 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                      <Activity className="w-12 h-12 mb-4 opacity-50" />
                      <p className="text-center max-w-[200px]">Describe your symptoms to receive an AI health summary</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MedicalPage;
