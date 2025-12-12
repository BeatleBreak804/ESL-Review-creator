
import React, { useState } from 'react';
import { ReviewType, ReviewFormData, GeneratedReview } from './types';
import { generateReview } from './geminiService';
import { 
  RefreshCcw, 
  Send, 
  User, 
  BookOpen, 
  MessageSquare, 
  Sparkles,
  CheckCircle2,
  Trash2,
  Copy,
  Star,
  Activity,
  Type
} from 'lucide-react';

const App: React.FC = () => {
  const [formData, setFormData] = useState<ReviewFormData>({
    studentName: '',
    lessonContent: '',
    phonicsInfo: '',
    sessionNotes: '',
    type: ReviewType.IDS,
    focusRating: 5
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedReview | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [history, setHistory] = useState<GeneratedReview[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const setFocusRating = (rating: number) => {
    setFormData(prev => ({ ...prev, focusRating: rating }));
  };

  const handleTypeChange = (type: ReviewType) => {
    setFormData(prev => ({ ...prev, type }));
  };

  const handleGenerate = async () => {
    if ((formData.type !== ReviewType.G_REVIEW) && !formData.studentName.trim()) {
      alert("Please enter at least the student name.");
      return;
    }
    
    setLoading(true);
    try {
      const content = await generateReview(formData);
      const newReview: GeneratedReview = {
        content,
        timestamp: new Date(),
        type: formData.type,
        studentName: formData.type !== ReviewType.G_REVIEW ? formData.studentName : undefined
      };
      setResult(newReview);
      setHistory(prev => [newReview, ...prev].slice(0, 10));
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const clearForm = () => {
    setFormData({
      studentName: '',
      lessonContent: '',
      phonicsInfo: '',
      sessionNotes: '',
      type: ReviewType.IDS,
      focusRating: 5
    });
    setResult(null);
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-slate-800 text-slate-100 placeholder-slate-500 shadow-sm";

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center py-8 px-4 md:px-8 text-slate-100">
      <header className="w-full max-w-6xl mb-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-900/40">
            <Sparkles className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            ESL Review <span className="text-indigo-400">Pro</span>
          </h1>
        </div>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
          Detailed, unique, and personal one-on-one feedback for your stars.
        </p>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Form */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-800">
            <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              Class Details
            </h2>

            <div className="mb-8">
              <label className="block text-xs font-black text-slate-500 mb-3 uppercase tracking-widest">Select Format</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(ReviewType).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    className={`py-3 rounded-xl text-xs font-black transition-all border ${
                      formData.type === type
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              {formData.type !== ReviewType.G_REVIEW && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-tight flex items-center gap-1">
                      <User className="w-3 h-3" /> Student Name
                    </label>
                    <input
                      type="text"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      placeholder="e.g. Madison"
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-tight flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> Topic <span className="text-slate-600 font-normal ml-1">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="lessonContent"
                      value={formData.lessonContent}
                      onChange={handleInputChange}
                      placeholder="e.g. Daily Routines"
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-tight flex items-center gap-1">
                      <Type className="w-3 h-3" /> Phonics & Key Words
                    </label>
                    <input
                      type="text"
                      name="phonicsInfo"
                      value={formData.phonicsInfo}
                      onChange={handleInputChange}
                      placeholder="e.g. -ad: dad, mad, sad"
                      className={inputClasses}
                    />
                  </div>
                </>
              )}

              {/* Engagement / Focus Rating */}
              <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                <label className="block text-xs font-black text-amber-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                  <Star className="w-4 h-4" /> Student Focus
                </label>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setFocusRating(star)}>
                        <Star 
                          className={`w-9 h-9 transition-all active:scale-90 ${
                            star <= formData.focusRating 
                              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]' 
                              : 'text-slate-700 fill-slate-700'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xl font-black text-amber-500">{formData.focusRating}/5</span>
                </div>
              </div>

              {formData.type !== ReviewType.G_REVIEW && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-tight flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Notes / Transcript
                  </label>
                  <textarea
                    name="sessionNotes"
                    value={formData.sessionNotes}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Paste notes. Focus stars and notes drive the review tone."
                    className={`${inputClasses} resize-none leading-relaxed`}
                  />
                </div>
              )}
              
              {formData.type === ReviewType.G_REVIEW && (
                <div className="p-6 bg-indigo-900/20 rounded-2xl border border-indigo-800 border-dashed text-center">
                  <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">G-Review Mode</p>
                  <p className="text-xs text-indigo-300/70 leading-relaxed">
                    Personalized 1:1 review based strictly on focus rating. Fresh and unique every time.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:text-slate-500 font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] text-white"
              >
                {loading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Generate</>}
              </button>
              <button
                onClick={clearForm}
                className="p-4 rounded-2xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Right Side: Result */}
        <section className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col min-h-[600px]">
            <div className="p-6 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight">Review Result</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase">{formData.type} &bull; {formData.focusRating} Stars</p>
              </div>
              
              {result && (
                <button
                  onClick={() => copyToClipboard(result.content)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all shadow-lg ${
                    copySuccess ? 'bg-green-600 text-white shadow-green-900/20' : 'bg-indigo-600 text-white hover:bg-indigo-500'
                  }`}
                >
                  {copySuccess ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copySuccess ? 'COPIED!' : 'COPY REVIEW'}
                </button>
              )}
            </div>

            <div className="p-8 flex-1">
              {!result && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-slate-700">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-700">
                    <MessageSquare className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-center italic font-semibold max-w-xs text-slate-500">Fill class details on the left to see the AI magic.</p>
                </div>
              )}

              {loading && (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 border-4 border-indigo-900 border-t-indigo-500 rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(99,102,241,0.2)]"></div>
                  <p className="text-indigo-400 font-black animate-pulse uppercase text-xs tracking-widest">Crafting personalized {formData.type}...</p>
                  <p className="text-[10px] text-slate-600 mt-2">Adjusting tone for {formData.focusRating}-star focus...</p>
                </div>
              )}

              {result && !loading && (
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap leading-relaxed text-slate-100 text-lg font-medium bg-slate-800/40 p-8 rounded-2xl border border-slate-800 shadow-inner min-h-[400px]">
                    {result.content}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* History */}
          {history.length > 1 && (
            <div className="bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Recent Reviews</h3>
              <div className="space-y-2">
                {history.slice(1, 4).map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setResult(item)}
                    className="group p-4 rounded-2xl border border-slate-800 bg-slate-800/30 hover:bg-slate-800 hover:border-indigo-900 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-300">
                        {item.studentName ? `${item.studentName}'s ${item.type}` : item.type}
                      </span>
                      <span className="text-[10px] text-slate-600 font-bold uppercase">{item.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <RefreshCcw className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:rotate-45 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="mt-16 text-slate-700 text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
        AI Teacher's Assistant &bull; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;
