import React, { useState } from 'react';
import axios from 'axios';
import { Layout } from '../components/Layout.jsx';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { medicalService } from '../services/hubServices.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import ReactMarkdown from 'react-markdown';
import { Upload, Activity, FileText, CheckCircle, Stethoscope, Image as ImageIcon, MapPin, Search, Navigation } from 'lucide-react';
import { Disclaimer } from '../components/Disclaimer.jsx';
import { HubGuide } from '../components/HubGuide.jsx';
import { ResultActions } from '../components/ResultActions.jsx';
import { Feedback } from '../components/Feedback.jsx';
import { GeneralHealthInput } from '../components/GeneralHealthInput.jsx';
import { GeneralHealthResponse } from '../components/GeneralHealthResponse.jsx';

const MedicalPage = () => {
  const { t, language } = useLanguage();
  const { addNotification } = useNotifications();
  const [mode, setMode] = useState('imaging'); // 'imaging' or 'general'

  // Imaging State
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [modelType, setModelType] = useState('lungs');
  const [userNotes, setUserNotes] = useState('');

  // Location/Doctors State
  const [locationInput, setLocationInput] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [fetchingDocs, setFetchingDocs] = useState(false);

  // General Health State
  const [symptoms, setSymptoms] = useState('');
  const [healthResult, setHealthResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const models = [
    { id: 'lungs', label: 'Lungs (Pulmonology)', icon: Activity },
    { id: 'heart', label: 'Heart (Cardiology)', icon: Activity },
    { id: 'brain', label: 'Brain (Neurology)', icon: Activity },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setDoctors([]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setResult(null);
    setDoctors([]);
    addNotification(`Analyzing ${modelType.toUpperCase()} scan using hybrid visual models...`, 'info');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('language', language);
      formData.append('user_notes', userNotes);

      const data = await medicalService.predict(modelType, formData);
      setResult(data);
      addNotification('Diagnostic scan analysis completed!', 'success');
    } catch (error) {
      console.error('Analysis error:', error);
      addNotification(error.response?.data?.error || 'Analysis failed', 'error');
      alert(error.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleHealthAnalyze = async () => {
    if (!symptoms.trim()) return;

    setLoading(true);
    setHealthResult(null);
    addNotification('Running consultation models on symptoms...', 'info');

    try {
      const data = await medicalService.consult({
        symptoms: symptoms,
        language: language
      });
      setHealthResult(data);
      addNotification('Consultation feedback generated!', 'success');
    } catch (error) {
      console.error("Consultation Error:", error);
      addNotification("Failed to analyze symptoms", "error");
      alert(error.response?.data?.error || "Failed to analyze symptoms");
    } finally {
      setLoading(false);
    }
  };

  // Geolocation & Live Doctor Fetching
  const fetchDoctors = async (lat, lon, regionName) => {
    setFetchingDocs(true);
    setDoctors([]);
    addNotification(`Searching for specialist clinics in ${regionName}...`, 'info');

    try {
      const response = await axios.post('/api/medical/suggest_doctors', {
        specialty: modelType,
        region: regionName
      });
      setDoctors(response.data);
      addNotification(`Found ${response.data.length} local healthcare centers!`, 'success');
    } catch (err) {
      console.error('Failed to suggest doctors:', err);
      addNotification('Failed to fetch specialists from LLM.', 'error');
    } finally {
      setFetchingDocs(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      addNotification('Geolocation is not supported by your browser.', 'error');
      return;
    }

    setFetchingDocs(true);
    addNotification('Querying browser GPS coordinates...', 'info');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Reverse geocoding via Nominatim
          const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
          const address = response.data.address || {};
          const city = address.city || address.town || address.village || address.municipality || address.county || address.state_district || address.state || 'My Location';
          setLocationInput(city);
          await fetchDoctors(latitude, longitude, city);
        } catch (e) {
          console.error(e);
          setLocationInput('Current Location');
          await fetchDoctors(latitude, longitude, 'Current Location');
        }
      },
      (err) => {
        setFetchingDocs(false);
        addNotification(`GPS lock failed: ${err.message}`, 'error');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleManualLocationSearch = async (e) => {
    e.preventDefault();
    if (!locationInput.trim()) return;

    setFetchingDocs(true);
    addNotification(`Locating '${locationInput}' using global geographic indices...`, 'info');

    try {
      // Forward geocoding via Nominatim with address details
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationInput)}&limit=1&addressdetails=1`);
      if (response.data && response.data.length > 0) {
        const place = response.data[0];
        const lat = parseFloat(place.lat);
        const lon = parseFloat(place.lon);
        const address = place.address || {};
        const city = address.city || address.town || address.village || address.municipality || address.county || address.state_district || place.display_name.split(',')[0];
        setLocationInput(city);
        await fetchDoctors(lat, lon, city);
      } else {
        addNotification(`Region '${locationInput}' not found. Check spelling.`, 'warning');
        setFetchingDocs(false);
      }
    } catch (e) {
      console.error(e);
      addNotification('Geocoding search failed. Using fallback simulation.', 'warning');
      await fetchDoctors(15.9129, 79.7400, locationInput); // Fallback to Guntur coordinates
    }
  };

  const handleRedirectToMaps = (doc) => {
    addNotification(`Opening maps redirection to ${doc.name}...`, 'info');
    const mapsQuery = encodeURIComponent(`${doc.name} ${doc.address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`, '_blank');
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
            onClick={() => { setMode('imaging'); setResult(null); setDoctors([]); }}
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
            onClick={() => { setMode('general'); setHealthResult(null); setDoctors([]); }}
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
                      onClick={() => { setModelType(model.id); setDoctors([]); }}
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

        {/* Real-time Location Based Doctors Section */}
        {result && mode === 'imaging' && (
          <div className="animate-fade-in mt-8">
            <Card className="border border-red-500/10 bg-navy-light/10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-red-400" />
                    Real-time Specialist Doctors & Clinics
                  </h3>
                  <p className="text-sm text-white/60">Find clinical support for your scan results ({modelType}) in your area.</p>
                </div>

                {/* Geolocation Controls */}
                <form onSubmit={handleManualLocationSearch} className="flex flex-wrap gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:flex-none">
                    <input
                      type="text"
                      placeholder="Enter city or zip code"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      className="input-field pl-9 pr-4 py-2 text-xs w-full md:w-48"
                    />
                    <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <Button type="submit" disabled={fetchingDocs} className="px-3 py-2 text-xs flex items-center gap-1 bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30">
                    <Search className="w-3.5 h-3.5" />
                    Locate
                  </Button>
                  <Button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={fetchingDocs}
                    className="px-3 py-2 text-xs flex items-center gap-1 bg-neon-cyan/10 border-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/20"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    GPS
                  </Button>
                </form>
              </div>

              {fetchingDocs ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="md" />
                </div>
              ) : doctors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {doctors.map((doc) => (
                    <div key={doc.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between h-full">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-white leading-snug">{doc.name}</h4>
                          <span className="text-xs font-bold bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full">★ {doc.rating}</span>
                        </div>
                        <p className="text-xs font-semibold text-red-400">{doc.specialist}</p>
                        <p className="text-xs text-white/50 leading-relaxed">{doc.address}</p>
                        <p className="text-xs text-white/40 leading-relaxed italic">{doc.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">{doc.distance}</span>
                        <div className="flex items-center gap-2">
                          <a href={`tel:${doc.contact}`} className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1.5 rounded-lg text-white/70 font-semibold transition-colors">
                            Call
                          </a>
                          <button
                            onClick={() => handleRedirectToMaps(doc)}
                            className="text-xs bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 px-3 py-1.5 rounded-lg text-red-400 font-bold transition-all flex items-center gap-1"
                          >
                            <Navigation className="w-3 h-3" />
                            Directions
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-white/40 border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                  <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Enter your location or use GPS to fetch clinical support.</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MedicalPage;
