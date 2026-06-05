import React, { useState } from 'react';
import { Layout } from '../components/Layout.jsx';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { studentService } from '../services/hubServices.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import ReactMarkdown from 'react-markdown';
import { GraduationCap, FileText } from 'lucide-react';
import { Disclaimer } from '../components/Disclaimer.jsx';
import { HubGuide } from '../components/HubGuide.jsx';
import { ResultActions } from '../components/ResultActions.jsx';
import { Feedback } from '../components/Feedback.jsx';

const StudentPage = () => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    cgpa: '',
    skills: '',
    experience: 'Beginner',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const data = await studentService.analyze({ ...formData, language });
      setResult(data.advice || data.full_response || data);
    } catch (error) {
      console.error('Analysis error:', error);
      alert(error.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-white/60">AI-powered career guidance and educational insights</p>
        </div>

        <Disclaimer />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-semibold mb-4">Student Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="CGPA"
                type="text"
                name="cgpa"
                placeholder="e.g., 8.5"
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
                <label className="block text-sm font-medium text-white/70 mb-2">Bio</label>
                <textarea
                  name="bio"
                  placeholder="Tell us about your career goals and interests..."
                  value={formData.bio}
                  onChange={handleChange}
                  className="input-field w-full min-h-[120px] resize-none"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <LoadingSpinner size="sm" /> : 'Get Career Guidance'}
              </Button>
            </form>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4">Career Guidance</h2>
            {result ? (
              <div className="animate-slide-up">
                <ResultActions content={result} title="Career_Guidance" />
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
                <Feedback />
                <Disclaimer type="footer" />
              </div>
            ) : (
              <div className="text-center py-12 text-white/60">
                <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Fill in your profile to get career guidance</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default StudentPage;
