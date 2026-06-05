import React, { useState } from 'react';
import { Layout } from '../components/Layout.jsx';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { agricultureService } from '../services/hubServices.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import ReactMarkdown from 'react-markdown';
import { Upload, Sprout, FileText, CheckCircle, Map as MapIcon, Info, Tractor } from 'lucide-react';
import { Disclaimer } from '../components/Disclaimer.jsx';
import { HubGuide } from '../components/HubGuide.jsx';
import { ResultActions } from '../components/ResultActions.jsx';
import { Feedback } from '../components/Feedback.jsx';
import { MapVisualizer } from '../components/MapVisualizer.jsx';

const AgriculturePage = () => {
  const { t, language } = useLanguage();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [userNotes, setUserNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState('analyze'); // 'analyze' or 'recommend'

  // Recommendation Form State
  const [recForm, setRecForm] = useState({
    location: '',
    soil_type: 'Loamy',
    season: 'Kharif',
    water: 'Medium',
    ph: '6.5',
    land_size: '',
    duration: '',
    budget: '',
    goal: 'Profit',
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleRecChange = (e) => {
    setRecForm({ ...recForm, [e.target.name]: e.target.value });
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

      const data = await agricultureService.analyzeCrop(formData);
      setResult(data.result || data);
    } catch (error) {
      console.error('Analysis error:', error);
      alert(error.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRecommend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const data = await agricultureService.recommend({ ...recForm, language });
      setResult(data.result || data);
    } catch (error) {
      console.error('Recommendation error:', error);
      alert(error.response?.data?.error || 'Recommendation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <div className="flex items-center mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              {t('landing.hubs.agriculture')}
            </h1>
            <HubGuide hub="agriculture" />
          </div>
          <p className="text-white/60">AI-powered crop disease detection and agricultural insights</p>
        </div>

        <Disclaimer />

        {/* Mode Toggle */}
        <div className="flex gap-4 border-b border-white/10 pb-4 mb-4 overflow-x-auto">
          <button
            onClick={() => { setMode('analyze'); setResult(null); }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${mode === 'analyze'
                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                : 'bg-glass border border-white/10 text-white/60'
              }`}
          >
            <div className="flex items-center gap-2">
              <Sprout className="w-5 h-5" />
              Disease Detection
            </div>
          </button>
          <button
            onClick={() => { setMode('recommend'); setResult(null); }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${mode === 'recommend'
                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                : 'bg-glass border border-white/10 text-white/60'
              }`}
          >
            <div className="flex items-center gap-2">
              <Tractor className="w-5 h-5" />
              Crop Recommendation
            </div>
          </button>
        </div>

        {mode === 'analyze' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            <Card>
              <h2 className="text-xl font-semibold mb-4">Upload Crop Image</h2>
              <div className="space-y-4">
                <label className="block">
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-green-500/50 transition-all">
                    {preview ? (
                      <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 mx-auto mb-4 text-white/40" />
                        <p className="text-white/60">Click to upload crop image</p>
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
                  placeholder="Additional notes about the crop (optional)"
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

            <Card>
              <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
              {result ? (
                <div className="space-y-4 animate-slide-up">
                  <ResultActions content={result.gemini || JSON.stringify(result)} title="Crop_Analysis" />

                  {result.gemini && (
                    <div className="prose prose-invert max-w-none">
                      <ReactMarkdown>{result.gemini}</ReactMarkdown>
                    </div>
                  )}
                  {result.roboflow && (
                    <div className="p-4 rounded-xl bg-glass border border-white/10">
                      <p className="text-sm text-white/60 mb-2">Detection Model</p>
                      <p className="font-semibold">{result.roboflow.predictions?.[0]?.class || 'Detected'}</p>
                    </div>
                  )}

                  <Feedback />
                  <Disclaimer type="footer" />
                </div>
              ) : (
                <div className="text-center py-12 text-white/60">
                  <Sprout className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Upload an image to analyze</p>
                </div>
              )}
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            <div className="space-y-6">
              <Card>
                <h2 className="text-xl font-semibold mb-4">Farming Details</h2>
                <form onSubmit={handleRecommend} className="space-y-4">
                  <Input
                    label={t('crop.location')}
                    name="location"
                    value={recForm.location}
                    onChange={handleRecChange}
                    placeholder="e.g., Guntur, Andhra Pradesh"
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">{t('crop.soil')}</label>
                      <select name="soil_type" value={recForm.soil_type} onChange={handleRecChange} className="input-field w-full">
                        <option value="Loamy">{t('crop.types.loamy')}</option>
                        <option value="Clay">{t('crop.types.clay')}</option>
                        <option value="Sandy">{t('crop.types.sandy')}</option>
                        <option value="Black Cotton">{t('crop.types.black')}</option>
                        <option value="Red Soil">{t('crop.types.red')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">{t('crop.season')}</label>
                      <select name="season" value={recForm.season} onChange={handleRecChange} className="input-field w-full">
                        <option value="Kharif">Kharif (Monsoon)</option>
                        <option value="Rabi">Rabi (Winter)</option>
                        <option value="Zaid">Zaid (Summer)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">{t('crop.water')}</label>
                      <select name="water" value={recForm.water} onChange={handleRecChange} className="input-field w-full">
                        <option value="High">High (Rainy/Canal)</option>
                        <option value="Medium">Medium (Well/Pump)</option>
                        <option value="Low">Low (Dry/Rainfed)</option>
                      </select>
                    </div>
                    <Input label={t('crop.ph')} name="ph" value={recForm.ph} onChange={handleRecChange} />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? <LoadingSpinner size="sm" /> : t('crop.recommendbtn')}
                  </Button>
                </form>
              </Card>

              <MapVisualizer location={recForm.location} />
            </div>

            <Card>
              <h2 className="text-xl font-semibold mb-4">Recommended Crops</h2>
              {result ? (
                <div className="animate-slide-up">
                  <ResultActions content={result} title={`Crop_Rec_${recForm.location}`} />
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                  <div className="mt-8 pt-4 border-t border-white/10">
                    <h4 className="text-green-400 font-medium mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      {t('crop.why')}
                    </h4>
                    <p className="text-sm text-white/60">
                      Results are based on the matching of <strong>{recForm.soil_type}</strong> soil in <strong>{recForm.location}</strong> during <strong>{recForm.season}</strong> season.
                    </p>
                  </div>
                  <Feedback />
                  <Disclaimer type="footer" />
                </div>
              ) : (
                <div className="text-center py-12 text-white/60">
                  <Tractor className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Enter details to get AI crop advice</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AgriculturePage;
