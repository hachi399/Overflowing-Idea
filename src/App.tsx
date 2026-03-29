import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Lightbulb, 
  History as HistoryIcon, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  ChevronRight, 
  Plus, 
  X,
  Loader2,
  Sparkles,
  TrendingUp,
  Zap,
  Target,
  Layers,
  Moon,
  Sun,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

import { 
  CreativityLevel, 
  MindNode, 
  BusinessConcept, 
  IdeaHistory,
  LanguageCode
} from './types';
import { 
  generateMindMap, 
  generateConcept, 
  generateConceptImage, 
  generateRequirementsDoc 
} from './services/gemini';
import { translations, TranslationStrings } from './constants/translations';

// --- Components ---

const Header = ({ darkMode, toggleDarkMode, t }: { darkMode: boolean, toggleDarkMode: () => void, t: TranslationStrings }) => (
  <header className="flex items-center justify-between p-6 glass-card mb-8">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-600 rounded-lg text-white">
        <Sparkles size={24} />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.appTitle}</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">{t.appSubtitle}</p>
      </div>
    </div>
    <button 
      onClick={toggleDarkMode}
      className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
    >
      {darkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  </header>
);

const SeedInput = ({ onGenerate, loading, t }: { onGenerate: (seed: string, level: CreativityLevel) => void, loading: boolean, t: TranslationStrings }) => {
  const [seed, setSeed] = useState('');
  const [level, setLevel] = useState<CreativityLevel>('Normal');

  return (
    <div className="glass-card p-8 mb-8">
      <div className="flex flex-col gap-6">
        <div className="relative">
          <input
            type="text"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder={t.seedPlaceholder}
            className="w-full p-4 pl-12 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-transparent focus:border-blue-500 outline-none transition-all text-lg"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-sm font-medium text-slate-500">{t.creativityLevel}</span>
          {(['Normal', 'Creative', 'Quirky'] as CreativityLevel[]).map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                level === l 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {l}
            </button>
          ))}
          
          <button
            onClick={() => onGenerate(seed, level)}
            disabled={!seed || loading}
            className="ml-auto px-8 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Lightbulb size={20} />}
            {t.generateMap}
          </button>
        </div>
      </div>
    </div>
  );
};

const MindMap = ({ 
  seed, 
  nodes, 
  selectedKeywords, 
  onToggleKeyword,
  t
}: { 
  seed: string, 
  nodes: MindNode[], 
  selectedKeywords: string[], 
  onToggleKeyword: (word: string) => void,
  t: TranslationStrings
}) => {
  return (
    <div className="relative min-h-[600px] w-full glass-card p-12 overflow-hidden mb-8">
      <div className="flex flex-col items-center justify-center gap-16">
        {/* Seed Node */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-2xl shadow-2xl shadow-blue-500/40 z-10"
        >
          {seed}
        </motion.div>

        {/* Level 1 Nodes */}
        <div className="flex flex-wrap justify-center gap-8 w-full">
          {nodes.map((node, idx) => (
            <div key={node.id} className="flex flex-col items-center gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => onToggleKeyword(node.word)}
                className={`mind-map-node ${
                  selectedKeywords.includes(node.word)
                    ? 'bg-blue-100 border-blue-500 dark:bg-blue-900/30'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                }`}
              >
                <span className="font-semibold">{node.word}</span>
                {selectedKeywords.includes(node.word) && (
                  <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-0.5">
                    <Plus size={12} />
                  </div>
                )}
              </motion.div>

              {/* Level 2 Nodes */}
              <div className="flex flex-wrap justify-center gap-3 max-w-[200px]">
                {node.children?.map((child, cIdx) => (
                  <motion.div
                    key={child.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 + cIdx * 0.05 }}
                    onClick={() => onToggleKeyword(child.word)}
                    className={`px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      selectedKeywords.includes(child.word)
                        ? 'bg-emerald-100 border-emerald-500 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                    }`}
                  >
                    {child.word}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Selection Counter */}
      <div className="absolute bottom-6 right-6 flex items-center gap-4">
        <div className="text-sm font-medium text-slate-500">
          {t.selected}: <span className="text-blue-600 font-bold">{selectedKeywords.length}</span> / 5
        </div>
      </div>
    </div>
  );
};

const ConceptCard = ({ 
  concept, 
  onGenerateImage, 
  onGenerateDoc, 
  onExportPDF,
  loadingImage,
  loadingDoc,
  t
}: { 
  concept: BusinessConcept, 
  onGenerateImage: () => void, 
  onGenerateDoc: () => void,
  onExportPDF: () => void,
  loadingImage: boolean,
  loadingDoc: boolean,
  t: TranslationStrings
}) => {
  return (
    <div className="glass-card p-8 mb-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Zap size={20} />
            <span className="text-sm font-bold uppercase tracking-wider">{t.innovationConcept}</span>
          </div>
          <h2 className="text-4xl font-black mb-6 leading-tight">{concept.title}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <TrendingUp size={16} />
                <span className="text-xs font-bold">{t.feasibility}</span>
              </div>
              <div className="text-2xl font-black">{concept.evaluation.feasibility}%</div>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <Sparkles size={16} />
                <span className="text-xs font-bold">{t.novelty}</span>
              </div>
              <div className="text-2xl font-black">{concept.evaluation.novelty}%</div>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800">
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                <Target size={16} />
                <span className="text-xs font-bold">{t.marketability}</span>
              </div>
              <div className="text-2xl font-black">{concept.evaluation.marketability}%</div>
            </div>
          </div>

          <div className="space-y-6 text-slate-700 dark:text-slate-300">
            <section>
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <FileText size={18} className="text-slate-400" /> {t.summary}
              </h3>
              <p className="leading-relaxed">{concept.summary}</p>
            </section>
            
            <section>
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Layers size={18} className="text-slate-400" /> {t.structure}
              </h3>
              <p className="leading-relaxed">{concept.structure}</p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <ChevronRight size={18} className="text-slate-400" /> {t.usageScenario}
              </h3>
              <p className="leading-relaxed">{concept.scenario}</p>
            </section>

            <section className="p-6 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <h3 className="text-lg font-bold mb-3">{t.investorEvaluation}</h3>
              <p className="italic text-sm">{concept.evaluation.reason}</p>
            </section>
          </div>
        </div>

        <div className="lg:w-1/3 space-y-6">
          <div className="aspect-video lg:aspect-square bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden relative group">
            {concept.imageUrl ? (
              <img src={concept.imageUrl} alt="Concept" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <ImageIcon size={48} className="mb-4 opacity-20" />
                <p className="text-sm">{t.visualizeIdea}</p>
                <button 
                  onClick={onGenerateImage}
                  disabled={loadingImage}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                  {loadingImage ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                  {t.generateImage}
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={onGenerateDoc}
              disabled={loadingDoc || !!concept.requirements}
              className="w-full p-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
            >
              {loadingDoc ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
              {concept.requirements ? t.requirementsGenerated : t.generateRequirements}
            </button>
            <button 
              onClick={onExportPDF}
              className="w-full p-4 border-2 border-slate-200 dark:border-slate-800 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <Download size={20} />
              {t.exportPdf}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RequirementsView = ({ requirements, t }: { requirements: string, t: TranslationStrings }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(requirements);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <div className="relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-12 mb-8 prose dark:prose-invert max-w-none"
      >
        <Markdown>{requirements}</Markdown>
      </motion.div>
      
      <div className="flex justify-center mb-12 -mt-4">
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
            copied 
              ? 'bg-emerald-600 text-white' 
              : 'bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:scale-105 active:scale-95'
          }`}
        >
          {copied ? <Check size={20} /> : <Copy size={20} />}
          {copied ? t.copied : t.copyRequirements}
        </button>
      </div>
    </div>
  );
};

const HistorySidebar = ({ 
  history, 
  onSelect, 
  onDelete,
  t
}: { 
  history: IdeaHistory[], 
  onSelect: (item: IdeaHistory) => void,
  onDelete: (id: string) => void,
  t: TranslationStrings
}) => (
  <div className="glass-card p-6 h-full overflow-y-auto">
    <div className="flex items-center gap-2 mb-6">
      <HistoryIcon size={20} className="text-slate-400" />
      <h3 className="font-bold">{t.history}</h3>
    </div>
    <div className="space-y-4">
      {history.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-8">{t.noHistory}</p>
      )}
      {history.map((item) => (
        <div 
          key={item.id}
          className="group relative p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-all"
          onClick={() => onSelect(item)}
        >
          <div className="text-xs text-slate-400 mb-1">
            {new Date(item.timestamp).toLocaleDateString()}
          </div>
          <div className="font-bold text-sm line-clamp-1">{item.concept.title}</div>
          <div className="text-xs text-slate-500 mt-1">{t.seedLabel}: {item.seed}</div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingConcept, setLoadingConcept] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [language, setLanguage] = useState<LanguageCode>('en');
  const t = translations[language];

  const [seed, setSeed] = useState('');
  const [nodes, setNodes] = useState<MindNode[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [concept, setConcept] = useState<BusinessConcept | null>(null);
  const [history, setHistory] = useState<IdeaHistory[]>([]);

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem('overflowing_idea_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  // Save history
  const saveToHistory = (newConcept: BusinessConcept) => {
    const newItem: IdeaHistory = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      seed,
      selectedKeywords,
      concept: newConcept,
      language
    };
    const newHistory = [newItem, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('overflowing_idea_history', JSON.stringify(newHistory));
  };

  const handleGenerateMap = async (newSeed: string, level: CreativityLevel) => {
    setLoading(true);
    setConcept(null);
    setSelectedKeywords([]);
    setErrorMessage(null);
    try {
      const result = await generateMindMap(newSeed, level);
      setNodes(result.nodes);
      setLanguage(result.language);
      setSeed(newSeed);
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleKeyword = (word: string) => {
    setSelectedKeywords(prev => {
      if (prev.includes(word)) return prev.filter(w => w !== word);
      if (prev.length >= 5) return prev;
      return [...prev, word];
    });
  };

  const handleGenerateConcept = async () => {
    if (selectedKeywords.length === 0) return;
    setLoadingConcept(true);
    setErrorMessage(null);
    try {
      const result = await generateConcept(seed, selectedKeywords);
      setConcept(result);
      saveToHistory(result);
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoadingConcept(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!concept) return;
    setLoadingImage(true);
    setErrorMessage(null);
    try {
      const imageUrl = await generateConceptImage(concept);
      if (imageUrl) {
        const updatedConcept = { ...concept, imageUrl };
        setConcept(updatedConcept);
        // Update history item if it exists
        const updatedHistory = history.map(h => 
          h.concept.title === concept.title ? { ...h, concept: updatedConcept } : h
        );
        setHistory(updatedHistory);
        localStorage.setItem('overflowing_idea_history', JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoadingImage(false);
    }
  };

  const handleGenerateDoc = async () => {
    if (!concept) return;
    setLoadingDoc(true);
    setErrorMessage(null);
    try {
      const requirements = await generateRequirementsDoc(concept);
      const updatedConcept = { ...concept, requirements };
      setConcept(updatedConcept);
      // Update history
      const updatedHistory = history.map(h => 
        h.concept.title === concept.title ? { ...h, concept: updatedConcept } : h
      );
      setHistory(updatedHistory);
      localStorage.setItem('overflowing_idea_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoadingDoc(false);
    }
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('full-report');
    if (!element) return;
    
    try {
      const dataUrl = await toPng(element, { 
        quality: 0.95,
        backgroundColor: darkMode ? '#020617' : '#f8fafc', // slate-950 or slate-50
        pixelRatio: 2, // Higher quality
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => (img.onload = resolve));
      
      const imgWidth = pdfWidth;
      const imgHeight = (img.height * pdfWidth) / img.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add subsequent pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`${concept?.title || 'idea'}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF', error);
    }
  };

  const handleDeleteHistory = (id: string) => {
    const newHistory = history.filter(h => h.id !== id);
    setHistory(newHistory);
    localStorage.setItem('overflowing_idea_history', JSON.stringify(newHistory));
  };

  const handleSelectHistory = (item: IdeaHistory) => {
    setSeed(item.seed);
    setSelectedKeywords(item.selectedKeywords);
    setConcept(item.concept);
    setLanguage(item.language || 'en');
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans p-4 md:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Header darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} t={t} />
            
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <X className="text-red-600 dark:text-red-400" size={20} />
                  <p className="text-red-800 dark:text-red-200 font-medium">{t.error || 'Error'}</p>
                </div>
                <p className="text-red-700 dark:text-red-300 mt-1">{errorMessage}</p>
                <button 
                  onClick={() => setErrorMessage(null)}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  {t.dismiss || 'Dismiss'}
                </button>
              </motion.div>
            )}
            
            <SeedInput onGenerate={handleGenerateMap} loading={loading} t={t} />

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[600px] flex flex-col items-center justify-center glass-card"
                >
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-blue-600/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-xl font-bold animate-pulse">{t.generatingMap}</p>
                  <p className="text-sm text-slate-500 mt-2">{t.connectingNeurons}</p>
                </motion.div>
              ) : nodes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <MindMap 
                    seed={seed} 
                    nodes={nodes} 
                    selectedKeywords={selectedKeywords} 
                    onToggleKeyword={handleToggleKeyword} 
                    t={t}
                  />
                  
                  <div className="flex justify-center mb-12">
                    <button
                      onClick={handleGenerateConcept}
                      disabled={selectedKeywords.length === 0 || loadingConcept}
                      className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-2xl shadow-blue-500/40 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {loadingConcept ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} />}
                      {t.createInnovation}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {loadingConcept && (
              <div className="h-[400px] flex flex-col items-center justify-center glass-card mb-8">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                <p className="text-xl font-bold">{t.synthesizing}</p>
              </div>
            )}

            {concept && (
              <motion.div
                id="full-report"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-1" // Small padding to avoid clipping shadows
              >
                <ConceptCard 
                  concept={concept} 
                  onGenerateImage={handleGenerateImage}
                  onGenerateDoc={handleGenerateDoc}
                  onExportPDF={handleExportPDF}
                  loadingImage={loadingImage}
                  loadingDoc={loadingDoc}
                  t={t}
                />
                
                {concept.requirements && (
                  <RequirementsView requirements={concept.requirements} t={t} />
                )}
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 h-fit lg:sticky lg:top-8">
            <HistorySidebar 
              history={history} 
              onSelect={handleSelectHistory} 
              onDelete={handleDeleteHistory} 
              t={t}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
