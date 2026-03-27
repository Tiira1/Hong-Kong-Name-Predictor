import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, User, UserPlus, HelpCircle, Loader2, ChevronRight, Info } from 'lucide-react';
import { predictHKName, type NamePrediction } from './services/gemini';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [pinyin, setPinyin] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Unknown'>('Unknown');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NamePrediction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinyin.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await predictHKName(pinyin, gender);
      setResult(data);
    } catch (err) {
      setError('Prediction failed. Please check your input or try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF0] text-[#2C3E50] font-sans selection:bg-[#E0F2F1]">
      {/* Header */}
      <header className="border-b border-[#E0DCC8] bg-white/90 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00796B] rounded-xl flex items-center justify-center shadow-lg shadow-[#00796B]/20">
              <span className="text-[#FDFCF0] font-bold text-sm">HK</span>
            </div>
            <h1 className="font-serif italic font-bold text-xl text-[#004D40]">HK Name Predictor</h1>
          </div>
          <div className="text-[10px] uppercase tracking-widest font-bold text-[#00796B] opacity-60">
            Cantonese Pinyin to Hanzi
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Input Section */}
          <div className="lg:col-span-5 space-y-8">
            <section className="bg-white p-8 rounded-3xl border border-[#E0DCC8] shadow-sm">
              <h2 className="text-2xl font-serif italic mb-2 text-[#004D40]">Input Details</h2>
              <p className="text-sm text-[#546E7A] mb-8">
                Enter the Cantonese Pinyin as it appears on a Hong Kong ID or passport.
              </p>

              <form onSubmit={handlePredict} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-[#00796B] block">
                    Cantonese Pinyin Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={pinyin}
                      onChange={(e) => setPinyin(e.target.value)}
                      placeholder="e.g. Wong Siu Ming"
                      className="w-full bg-[#FDFCF0]/50 border border-[#E0DCC8] rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-[#00796B]/10 focus:border-[#00796B] transition-all"
                      required
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00796B] opacity-40" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-[#00796B] block">
                    Gender
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Male', icon: User, label: 'Male' },
                      { id: 'Female', icon: UserPlus, label: 'Female' },
                      { id: 'Unknown', icon: HelpCircle, label: 'Unknown' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setGender(item.id as any)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 py-3 border rounded-xl transition-all text-sm",
                          gender === item.id
                            ? "bg-[#00796B] border-[#00796B] text-white shadow-md shadow-[#00796B]/20"
                            : "bg-white border-[#E0DCC8] text-[#546E7A] hover:border-[#00796B]/40"
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !pinyin.trim()}
                  className="w-full bg-[#00796B] text-white py-4 rounded-xl font-bold tracking-wide hover:bg-[#00695C] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00796B]/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Predicting...
                    </>
                  ) : (
                    'Predict Name'
                  )}
                </button>
              </form>
            </section>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex gap-3">
                <Info className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Result Section */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {!result && !loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] border-2 border-dashed border-[#E0DCC8] rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-white/40"
                >
                  <div className="w-16 h-16 bg-[#E0F2F1] rounded-full flex items-center justify-center mb-4">
                    <Search className="w-6 h-6 text-[#00796B] opacity-40" />
                  </div>
                  <h3 className="font-serif italic text-xl mb-2 text-[#004D40]">Awaiting Input</h3>
                  <p className="text-sm text-[#546E7A] max-w-xs">
                    Enter a name and select a gender to see the most likely Chinese characters.
                  </p>
                </motion.div>
              ) : loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  <div className="h-8 w-48 bg-[#E0DCC8] animate-pulse rounded" />
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-48 bg-[#E0DCC8] animate-pulse rounded-2xl" />
                    ))}
                  </div>
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <div key={i} className="h-24 bg-[#E0DCC8] animate-pulse rounded-2xl" />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-12"
                >
                  {/* Syllable Breakdown */}
                  <section>
                    <h2 className="text-2xl font-serif italic mb-6 text-[#004D40]">Character Analysis</h2>
                    <div className="flex flex-wrap gap-4">
                      {result?.syllables.map((s, idx) => (
                        <div key={idx} className="flex-1 min-w-[140px] bg-white border border-[#E0DCC8] rounded-2xl p-4 shadow-sm hover:border-[#00796B] transition-colors">
                          <div className="text-[10px] uppercase tracking-widest font-bold text-[#00796B] opacity-60 mb-3">
                            {s.pinyin}
                          </div>
                          <div className="space-y-3">
                            {s.suggestions.map((suggest, sIdx) => (
                              <div key={sIdx} className="flex items-center justify-between group">
                                <span className="text-2xl font-medium text-[#2C3E50]">{suggest.char}</span>
                                {suggest.meaning && (
                                  <span className="text-[10px] text-[#00796B] opacity-0 group-hover:opacity-100 transition-opacity text-right max-w-[60px] leading-tight font-medium">
                                    {suggest.meaning}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Full Name Suggestions */}
                  <section>
                    <h2 className="text-2xl font-serif italic mb-6 text-[#004D40]">Predicted Combinations</h2>
                    <div className="space-y-4">
                      {result?.fullNames.map((name, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-white border border-[#E0DCC8] rounded-2xl p-6 shadow-sm hover:border-[#00796B] hover:shadow-md transition-all group cursor-default"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-baseline gap-4">
                              <span className="text-4xl font-bold tracking-tighter text-[#2C3E50]">{name.chinese}</span>
                              <span className="font-mono text-xs text-[#00796B] bg-[#E0F2F1] px-2 py-1 rounded font-bold">
                                {name.jyutping}
                              </span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-[#00796B] opacity-0 group-hover:opacity-40 transition-opacity" />
                          </div>
                          <p className="text-sm text-[#546E7A] leading-relaxed">
                            {name.explanation}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E0DCC8] py-12 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#00796B] opacity-40">
            Powered by Gemini AI • Hong Kong Cultural Context
          </p>
        </div>
      </footer>
    </div>
  );
}
