import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  BookOpen,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  HardDrive,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { ISO_KNOWLEDGE_BASE, IsoConceptDefinition, getIsoDefinition } from '../../services/isoKnowledgeBase';

interface IsoContextBadgeProps {
  conceptId: keyof typeof ISO_KNOWLEDGE_BASE | string;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const IsoContextBadge: React.FC<IsoContextBadgeProps> = ({
  conceptId,
  label,
  size = 'sm',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const def = getIsoDefinition(conceptId);

  if (!def) return <span>{label || conceptId}</span>;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        title={`ISO 9241-110 Context: ${def.term} (Click to inspect)`}
        className={`inline-flex items-center gap-1 font-mono font-medium rounded transition-colors group cursor-pointer ${
          size === 'sm'
            ? 'text-[11px] px-1.5 py-0.5 bg-slate-800/80 hover:bg-blue-900/60 text-cyan-300 hover:text-cyan-200 border border-slate-700/60'
            : 'text-xs px-2 py-1 bg-slate-800 hover:bg-blue-900/70 text-cyan-300 hover:text-cyan-200 border border-slate-700'
        } ${className}`}
      >
        <span>{label || def.acronym || def.term}</span>
        <HelpCircle className="w-3 h-3 text-cyan-400 group-hover:text-cyan-200 opacity-80" />
      </button>

      {isOpen && (
        <IsoConceptModal def={def} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
};

interface IsoConceptModalProps {
  def: IsoConceptDefinition;
  onClose: () => void;
}

export const IsoConceptModal: React.FC<IsoConceptModalProps> = ({ def, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-xl w-full p-6 text-slate-100 relative space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                {def.category}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {def.isoStandardRef}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              {def.term}
              {def.acronym && (
                <span className="text-xs font-mono font-normal text-cyan-400">
                  ({def.acronym})
                </span>
              )}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plain English Human Context */}
        <div className="space-y-1.5">
          <h4 className="text-xs uppercase font-bold text-cyan-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            Plain Context for the Operator
          </h4>
          <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            {def.plainEnglishSummary}
          </p>
        </div>

        {/* Mathematical & Formal Engineering Formulation */}
        <div className="space-y-1.5">
          <h4 className="text-xs uppercase font-bold text-purple-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Mathematical &amp; Algorithmic Formulation
          </h4>
          <div className="font-mono text-xs text-purple-200 bg-slate-950 p-3 rounded-xl border border-purple-900/40 overflow-x-auto">
            {def.mathematicalDefinition}
          </div>
        </div>

        {/* Operational Impact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 space-y-1">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Operational Impact
            </div>
            <div className="text-slate-300 text-[11px] leading-relaxed">
              {def.operationalImpact}
            </div>
          </div>

          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 space-y-1">
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5" />
              Actionable Guide
            </div>
            <div className="text-slate-300 text-[11px] leading-relaxed">
              {def.operatorAction}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Standards Compliance: ISO 9241-110 / ISO/IEC 25010</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-sans font-medium transition-colors"
          >
            Acknowledge &amp; Return
          </button>
        </div>
      </div>
    </div>
  );
};

export const IsoGlobalInspectorModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [selectedId, setSelectedId] = useState<string>('WEBGL2_GPGPU');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const concepts = Object.values(ISO_KNOWLEDGE_BASE).filter((c) =>
    c.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.acronym && c.acronym.toLowerCase().includes(searchTerm.toLowerCase())) ||
    c.plainEnglishSummary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeDef = ISO_KNOWLEDGE_BASE[selectedId] || concepts[0] || ISO_KNOWLEDGE_BASE.WEBGL2_GPGPU;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">ISO 9241-110 &amp; ISO/IEC 25010 Systems Inspector</h2>
              <p className="text-xs text-slate-400">
                Authoritative human-centered architectural dictionary &amp; operational context
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Left sidebar index + Right detail panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Index */}
          <div className="w-72 border-r border-slate-800 bg-slate-950/40 flex flex-col">
            <div className="p-3 border-b border-slate-800">
              <input
                type="text"
                placeholder="Filter concepts & standards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {concepts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex flex-col gap-0.5 ${
                    c.id === selectedId
                      ? 'bg-blue-600/20 text-white border border-blue-500/40'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{c.term}</span>
                    {c.acronym && (
                      <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-cyan-400">
                        {c.acronym}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 line-clamp-1">{c.plainEnglishSummary}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Detail Pane */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                  {activeDef.category}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {activeDef.isoStandardRef}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {activeDef.term}
                {activeDef.acronym && (
                  <span className="text-sm font-mono font-normal text-cyan-400">
                    ({activeDef.acronym})
                  </span>
                )}
              </h3>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs uppercase font-bold text-cyan-400 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Plain Human Meaning for Operator
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                {activeDef.plainEnglishSummary}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs uppercase font-bold text-purple-400 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Mathematical &amp; Silicon Specification
              </h4>
              <div className="font-mono text-xs text-purple-200 bg-slate-950 p-4 rounded-xl border border-purple-900/40 leading-relaxed">
                {activeDef.mathematicalDefinition}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1.5">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  Operational Impact
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{activeDef.operationalImpact}</p>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1.5">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <ChevronRight className="w-4 h-4" />
                  Actionable Operator Workflow
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{activeDef.operatorAction}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
