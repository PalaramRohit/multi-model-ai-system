import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout.jsx';
import { Card } from '../components/Card.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { dashboardService } from '../services/dashboardService.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import ReactMarkdown from 'react-markdown';
import { Clock, Filter, X } from 'lucide-react';

import { ResultActions } from '../components/ResultActions.jsx';

const HistoryPage = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await dashboardService.getHistory();
        setHistory(data);
        if (location.state?.selectedItemId) {
          const item = data.find(i => i.id === location.state.selectedItemId);
          if (item) {
            setSelectedItem(item);
          }
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [location.state]);

  const filteredHistory = filter === 'all'
    ? history
    : history.filter(item => item.domain === filter);

  const domains = ['all', 'medical', 'agriculture', 'finance', 'student'];

  const formatPrediction = (prediction) => {
    if (prediction === null || prediction === undefined) return 'Processed';
    
    let parsed = prediction;
    if (typeof prediction === 'string') {
      try {
        parsed = JSON.parse(prediction);
      } catch (e) {
        // Not a JSON string
        return prediction.length > 120 ? prediction.substring(0, 120) + '...' : prediction;
      }
    }
    
    if (parsed && typeof parsed === 'object') {
      if (parsed.gemini) {
        let cleanText = parsed.gemini.replace(/[#*`_-]/g, '').trim();
        const lines = cleanText.split('\n').filter(Boolean);
        const firstLine = lines[0] || '';
        return firstLine.length > 120 ? firstLine.substring(0, 120) + '...' : firstLine;
      }
      if (parsed.roboflow && Array.isArray(parsed.roboflow)) {
        const classes = parsed.roboflow.map(p => p.predictions?.map(pred => pred.class)).flat().filter(Boolean);
        if (classes.length > 0) {
          return `Detected: ${[...new Set(classes)].join(', ')}`;
        }
      }
      if (parsed.recommendation) {
        return parsed.recommendation;
      }
      if (parsed.prediction) {
        return typeof parsed.prediction === 'string' ? parsed.prediction : JSON.stringify(parsed.prediction);
      }
      return JSON.stringify(parsed).substring(0, 120) + '...';
    }
    
    return String(prediction);
  };

  const renderDetails = (details) => {
    if (!details) return null;
    
    let parsedPrediction = null;
    if (typeof details.prediction === 'string') {
      try {
        parsedPrediction = JSON.parse(details.prediction);
      } catch (e) {
        // Not a JSON string
      }
    } else if (details.prediction && typeof details.prediction === 'object') {
      parsedPrediction = details.prediction;
    }
    
    const displayData = parsedPrediction || details;
    
    const hasSpecialFields = 
      displayData.guidance || 
      displayData.gemini || 
      displayData.full_response || 
      displayData.report ||
      displayData.recommendation ||
      displayData.response ||
      displayData.predictions ||
      displayData.roboflow;
      
    if (hasSpecialFields) {
      return (
        <div className="space-y-4">
          {displayData.guidance && (
            <div>
              <h4 className="text-sm font-semibold text-white/60 mb-1">Guidance</h4>
              <div className="prose prose-invert max-w-none bg-white/5 p-4 rounded-xl border border-white/5">
                <ReactMarkdown>{displayData.guidance}</ReactMarkdown>
              </div>
            </div>
          )}
          {displayData.gemini && (
            <div>
              <h4 className="text-sm font-semibold text-white/60 mb-1">Analysis</h4>
              <div className="prose prose-invert max-w-none bg-white/5 p-4 rounded-xl border border-white/5">
                <ReactMarkdown>{displayData.gemini}</ReactMarkdown>
              </div>
            </div>
          )}
          {displayData.full_response && (
            <div>
              <h4 className="text-sm font-semibold text-white/60 mb-1">Full Response</h4>
              <div className="prose prose-invert max-w-none bg-white/5 p-4 rounded-xl border border-white/5">
                <ReactMarkdown>{displayData.full_response}</ReactMarkdown>
              </div>
            </div>
          )}
          {displayData.report && (
            <div>
              <h4 className="text-sm font-semibold text-white/60 mb-1">Report</h4>
              <div className="prose prose-invert max-w-none bg-white/5 p-4 rounded-xl border border-white/5">
                <ReactMarkdown>{displayData.report}</ReactMarkdown>
              </div>
            </div>
          )}
          {displayData.recommendation && (
            <div>
              <h4 className="text-sm font-semibold text-white/60 mb-1">Recommendation</h4>
              <div className="prose prose-invert max-w-none bg-white/5 p-4 rounded-xl border border-white/5">
                <ReactMarkdown>{displayData.recommendation}</ReactMarkdown>
              </div>
            </div>
          )}
          {displayData.response && (
            <div>
              <h4 className="text-sm font-semibold text-white/60 mb-1">Response</h4>
              <div className="prose prose-invert max-w-none bg-white/5 p-4 rounded-xl border border-white/5">
                {typeof displayData.response === 'string' ? (
                  <ReactMarkdown>{displayData.response}</ReactMarkdown>
                ) : (
                  <pre className="text-xs text-white/80 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(displayData.response, null, 2)}</pre>
                )}
              </div>
            </div>
          )}
          {(displayData.roboflow || displayData.predictions) && (
            <div>
              <h4 className="text-sm font-semibold text-white/60 mb-1">Detections</h4>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-sm">
                <pre className="text-xs text-white/80 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(displayData.roboflow || displayData.predictions, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // Default fallback: stringify
    const cleanString = typeof details.prediction === 'string' ? details.prediction : JSON.stringify(details, null, 2);
    return (
      <div>
        <h4 className="text-sm font-semibold text-white/60 mb-1">Details</h4>
        <div className="prose prose-invert max-w-none bg-white/5 p-4 rounded-xl border border-white/5">
          {cleanString.startsWith('{"') || cleanString.startsWith('[') ? (
            <pre className="text-xs text-white/80 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(JSON.parse(cleanString), null, 2)}</pre>
          ) : (
            <ReactMarkdown>{cleanString}</ReactMarkdown>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">{t('nav.history')}</h1>
            <p className="text-white/60">View all your AI interactions and predictions</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {domains.map((domain) => (
            <button
              key={domain}
              onClick={() => setFilter(domain)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${filter === domain
                  ? 'bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan'
                  : 'bg-glass border border-white/10 text-white/60 hover:text-white'
                }`}
            >
              {domain === 'all' ? 'All' : domain.charAt(0).toUpperCase() + domain.slice(1)}
            </button>
          ))}
        </div>

        {/* History List */}
        {filteredHistory.length > 0 ? (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <Card
                key={item.id}
                hover
                className="cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neon-cyan/10 text-neon-cyan capitalize">
                        {item.domain}
                      </span>
                      <span className="text-sm text-white/60">
                        {item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}
                      </span>
                    </div>
                    <p className="font-semibold mb-1">
                      {formatPrediction(item.prediction)}
                    </p>
                    <p className="text-sm text-white/60">Model: {item.model}</p>
                  </div>
                  <Clock className="w-5 h-5 text-white/40" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-12 text-white/60">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No history found</p>
            </div>
          </Card>
        )}

        {/* Detail Modal */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card className="max-w-3xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Details</h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <ResultActions
                  content={selectedItem.details || selectedItem.prediction}
                  title={`History_${selectedItem.domain}`}
                />

                <div>
                  <p className="text-sm text-white/60 mb-1">Domain</p>
                  <p className="font-semibold capitalize">{selectedItem.domain}</p>
                </div>

                {selectedItem.details && (
                  <div className="border-t border-white/10 pt-4 mt-4">
                    {renderDetails(selectedItem.details)}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HistoryPage;
