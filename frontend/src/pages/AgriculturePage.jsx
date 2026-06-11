import React, { useState } from 'react';
import axios from 'axios';
import { Layout } from '../components/Layout.jsx';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { agricultureService } from '../services/hubServices.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import ReactMarkdown from 'react-markdown';
import { Upload, Sprout, FileText, CheckCircle, Map as MapIcon, Info, Tractor, MapPin, Search, Navigation } from 'lucide-react';
import { Disclaimer } from '../components/Disclaimer.jsx';
import { HubGuide } from '../components/HubGuide.jsx';
import { ResultActions } from '../components/ResultActions.jsx';
import { Feedback } from '../components/Feedback.jsx';
import { MapVisualizer } from '../components/MapVisualizer.jsx';

const AgriculturePage = () => {
  const { t, language } = useLanguage();
  const { addNotification } = useNotifications();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [userNotes, setUserNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState('analyze'); // 'analyze' or 'recommend'

  // Pest Shops State
  const [locationInput, setLocationInput] = useState('');
  const [shops, setShops] = useState([]);
  const [fetchingShops, setFetchingShops] = useState(false);

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
      setShops([]);
    }
  };

  const handleRecChange = (e) => {
    setRecForm({ ...recForm, [e.target.name]: e.target.value });
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setResult(null);
    setShops([]);
    addNotification('Uploading crop image and running disease detection models...', 'info');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('language', language);
      formData.append('user_notes', userNotes);

      const data = await agricultureService.analyzeCrop(formData);
      setResult(data.result || data);
      addNotification('Crop health analysis complete!', 'success');
    } catch (error) {
      console.error('Analysis error:', error);
      addNotification('Failed to analyze crop image.', 'error');
      alert(error.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRecommend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setShops([]);
    addNotification('Calculating optimal crop yields and soil matches...', 'info');

    try {
      const data = await agricultureService.recommend({ ...recForm, language });
      setResult(data.result || data);
      addNotification('Crop recommendation generated!', 'success');
    } catch (error) {
      console.error('Recommendation error:', error);
      addNotification('Crop recommendation failed.', 'error');
      alert(error.response?.data?.error || 'Recommendation failed');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Live Pest & Agri Input Shops
  const fetchPestShops = async (lat, lon, regionName) => {
    setFetchingShops(true);
    setShops([]);
    addNotification(`Searching for agricultural input & pest shops in ${regionName}...`, 'info');

    try {
      const response = await axios.post('/api/agriculture/suggest_pest_shops', {
        region: regionName
      });
      setShops(response.data);
      addNotification(`Located ${response.data.length} agricultural pest shops!`, 'success');
    } catch (err) {
      console.error('Failed to suggest pest shops:', err);
      addNotification('Failed to fetch agricultural shops from LLM.', 'error');
    } finally {
      setFetchingShops(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      addNotification('Geolocation is not supported by your browser.', 'error');
      return;
    }

    setFetchingShops(true);
    addNotification('Querying browser GPS coordinates...', 'info');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
          const address = response.data.address || {};
          const city = address.city || address.town || address.village || address.municipality || address.county || address.state_district || address.state || 'My Location';
          setLocationInput(city);
          await fetchPestShops(latitude, longitude, city);
        } catch (e) {
          console.error(e);
          setLocationInput('Current Location');
          await fetchPestShops(latitude, longitude, 'Current Location');
        }
      },
      (err) => {
        setFetchingShops(false);
        addNotification(`GPS lock failed: ${err.message}`, 'error');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleManualLocationSearch = async (e) => {
    e.preventDefault();
    if (!locationInput.trim()) return;

    setFetchingShops(true);
    addNotification(`Locating '${locationInput}' Rythu markets...`, 'info');

    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationInput)}&limit=1&addressdetails=1`);
      if (response.data && response.data.length > 0) {
        const place = response.data[0];
        const lat = parseFloat(place.lat);
        const lon = parseFloat(place.lon);
        const address = place.address || {};
        const city = address.city || address.town || address.village || address.municipality || address.county || address.state_district || place.display_name.split(',')[0];
        setLocationInput(city);
        await fetchPestShops(lat, lon, city);
      } else {
        addNotification(`Region '${locationInput}' not found. Check spelling.`, 'warning');
        setFetchingShops(false);
      }
    } catch (e) {
      console.error(e);
      addNotification('Geocoding search failed. Using fallback coordinates.', 'warning');
      await fetchPestShops(16.2997, 80.4424, locationInput); // Guntur coordinates fallback
    }
  };

  const handleRedirectToMaps = (shop) => {
    addNotification(`Redirecting to Google Maps directions for ${shop.name}...`, 'info');
    const mapsQuery = encodeURIComponent(`${shop.name} ${shop.address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`, '_blank');
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
            onClick={() => { setMode('analyze'); setResult(null); setShops([]); }}
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
            onClick={() => { setMode('recommend'); setResult(null); setShops([]); }}
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

        {/* Real-time Pest Shops recommendations based on location */}
        {(result || mode === 'recommend') && (
          <div className="animate-fade-in mt-8">
            <Card className="border border-green-500/10 bg-navy-light/10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <MapIcon className="w-5 h-5 text-green-400" />
                    Real-time Pesticide Dealers & Pest Shops
                  </h3>
                  <p className="text-sm text-white/60">Find agricultural inputs, quality checks, and shop coordinates in your region.</p>
                </div>

                <form onSubmit={handleManualLocationSearch} className="flex flex-wrap gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:flex-none">
                    <input
                      type="text"
                      placeholder="Enter district / village"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      className="input-field pl-9 pr-4 py-2 text-xs w-full md:w-48"
                    />
                    <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <Button type="submit" disabled={fetchingShops} className="px-3 py-2 text-xs flex items-center gap-1 bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30">
                    <Search className="w-3.5 h-3.5" />
                    Locate
                  </Button>
                  <Button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={fetchingShops}
                    className="px-3 py-2 text-xs flex items-center gap-1 bg-neon-cyan/10 border-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/20"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    GPS
                  </Button>
                </form>
              </div>

              {fetchingShops ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="md" />
                </div>
              ) : shops.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {shops.map((shop) => (
                    <div key={shop.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between h-full">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-white leading-snug">{shop.name}</h4>
                          <span className="text-xs font-bold bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full">★ {shop.rating}</span>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">{shop.address}</p>
                        <p className="text-xs text-green-400 font-semibold">{shop.services}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">{shop.distance}</span>
                        <div className="flex items-center gap-2">
                          <a href={`tel:${shop.contact}`} className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1.5 rounded-lg text-white/70 font-semibold transition-colors">
                            Call
                          </a>
                          <button
                            onClick={() => handleRedirectToMaps(shop)}
                            className="text-xs bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 px-3 py-1.5 rounded-lg text-green-400 font-bold transition-all flex items-center gap-1"
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
                  <Sprout className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Select or enter location to discover pest shops nearby.</p>
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
