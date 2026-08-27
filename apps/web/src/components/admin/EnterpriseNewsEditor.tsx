'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiList,
  FiLink,
  FiImage,
  FiMaximize2,
  FiMinimize2,
  FiEye,
  FiEdit3,
  FiUploadCloud,
  FiCheckCircle,
  FiRotateCcw,
  FiRotateCw,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiAlignJustify,
  FiMinus,
  FiGrid,
  FiFileText,
  FiShield,
  FiClock,
  FiX,
  FiExternalLink,
} from 'react-icons/fi';
import { FaQuoteLeft, FaStrikethrough, FaHighlighter, FaLinkSlash } from 'react-icons/fa6';
import { useToast } from '../Toast';

interface EnterpriseNewsEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
}

interface SignedImageOptions {
  url: string;
  alt: string;
  caption: string;
  signature: string;
  badge: string;
  alignment: 'full' | 'center' | 'left' | 'right';
  aspectRatio: string;
}

const BADGE_OPTIONS = [
  { label: 'GoalMills Verified', color: 'from-blue-600 to-indigo-600' },
  { label: 'Matchday Live', color: 'from-emerald-600 to-teal-600' },
  { label: 'Exclusive Story', color: 'from-amber-500 to-orange-600' },
  { label: 'Press & Media', color: 'from-purple-600 to-pink-600' },
  { label: 'Official Photo', color: 'from-slate-700 to-slate-900' },
  { label: 'None', color: '' },
];

const HIGHLIGHT_COLORS = [
  { id: 'highlight-gold', label: 'Gold', bg: 'bg-amber-400', class: 'highlight-gold' },
  { id: 'highlight-blue', label: 'Blue', bg: 'bg-blue-400', class: 'highlight-blue' },
  { id: 'highlight-green', label: 'Green', bg: 'bg-emerald-400', class: 'highlight-green' },
  { id: 'highlight-purple', label: 'Purple', bg: 'bg-purple-400', class: 'highlight-purple' },
  { id: 'highlight-red', label: 'Red', bg: 'bg-red-400', class: 'highlight-red' },
];

export default function EnterpriseNewsEditor({
  value,
  onChange,
  placeholder = 'Write or paste your news story here...',
  minHeight = '360px',
}: EnterpriseNewsEditorProps) {
  const toast = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'split'>('edit');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isHighlightDropdownOpen, setIsHighlightDropdownOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Link state
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [linkTargetBlank, setLinkTargetBlank] = useState(true);
  const [isExistingLink, setIsExistingLink] = useState(false);

  // Table state
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // Signed Image Attachment State
  const [imageOptions, setImageOptions] = useState<SignedImageOptions>({
    url: '',
    alt: '',
    caption: '',
    signature: 'GoalMills Media Desk',
    badge: 'GoalMills Verified',
    alignment: 'full',
    aspectRatio: '16/9',
  });

  // Editor metrics
  const [metrics, setMetrics] = useState({
    words: 0,
    chars: 0,
    readingTime: 0,
    paragraphs: 0,
    imagesCount: 0,
  });

  // Saved selection range for restoring after modal close
  const savedSelectionRef = useRef<Range | null>(null);

  // Calculate metrics whenever value changes
  useEffect(() => {
    const text = (value || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const words = text.length === 0 ? 0 : text.split(/\s+/).length;
    const chars = text.length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    const paragraphs = (value || '').match(/<p>/gi)?.length || 0;
    const imagesCount = (value || '').match(/<img|<figure/gi)?.length || 0;

    setMetrics({ words, chars, readingTime, paragraphs, imagesCount });
  }, [value]);

  // Synchronize content to editor div without destroying caret position
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      if (value === '' && editorRef.current.innerHTML === '<p><br></p>') return;
      editorRef.current.innerHTML = value || '<p><br></p>';
    }
  }, [value]);

  // Save current caret selection
  const saveSelection = () => {
    if (typeof window === 'undefined') return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  // Restore caret selection
  const restoreSelection = () => {
    if (typeof window === 'undefined') return;
    const sel = window.getSelection();
    if (sel && savedSelectionRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
  };

  // Execute standard rich text command
  const execCmd = (cmd: string, val: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(cmd, false, val);
    handleContentChange();
  };

  // Triggered on any input in the editable div
  const handleContentChange = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    onChange(html);
  }, [onChange]);

  // Keyboard shortcut handler (e.g., Ctrl+K for links)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openLinkModal();
    }
  };

  // ----------------------------------------------------
  // Document Paste Handler (Word / Google Docs Clean-up)
  // Strips black text colors and white background boxes
  // ----------------------------------------------------
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    // 1. Check if files/images are pasted directly from clipboard
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            uploadAndOpenSignedModal(file);
            return;
          }
        }
      }
    }

    // 2. Handle Rich Text / HTML paste from Google Docs, Word, Web
    const html = e.clipboardData.getData('text/html');
    if (html) {
      e.preventDefault();
      const cleaned = cleanPastedDocumentHtml(html);
      document.execCommand('insertHTML', false, cleaned);
      handleContentChange();
      toast.success('Document formatted cleanly into white text!');
      return;
    }
  };

  // Cleans messy Word / Google Docs / Web HTML into clean, semantic SEO-friendly white-text markup
  const cleanPastedDocumentHtml = (rawHtml: string): string => {
    let clean = rawHtml;

    // Remove comments and meta tags
    clean = clean.replace(/<!--[\s\S]*?-->/g, '');
    clean = clean.replace(/<meta[^>]*>/gi, '');
    clean = clean.replace(/<link[^>]*>/gi, '');
    clean = clean.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    // Strip out MS Word specific namespace tags (o:p, etc)
    clean = clean.replace(/<\/?\w+:[^>]*>/gi, '');

    // Strip font tags (<font color="#000">...</font> -> ...)
    clean = clean.replace(/<\/?font[^>]*>/gi, '');

    // Remove MSO attributes and noisy inline styles
    clean = clean.replace(/class="Mso[^"]*"/gi, '');
    clean = clean.replace(/style="[^"]*mso-[^"]*"/gi, '');

    // Strip hardcoded dark text colors (color: #000, color: rgb(0,0,0), color: black, etc.)
    clean = clean.replace(/color:\s*(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\)|black|windowtext);?/gi, '');

    // Strip background-colors from pasted elements (background-color: #fff, rgb(255,255,255), transparent, white)
    clean = clean.replace(
      /background(-color)?:\s*(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\)|white|transparent);?/gi,
      ''
    );

    // Strip hardcoded font families and font sizes from docs
    clean = clean.replace(/font-family:\s*[^;"]+;?/gi, '');
    clean = clean.replace(/font-size:\s*[^;"]+;?/gi, '');
    clean = clean.replace(/line-height:\s*[^;"]+;?/gi, '');

    // Replace span wrappers that only had bold/italic with semantic tags
    clean = clean.replace(
      /<span style="font-weight:\s*bold;?">(.*?)<\/span>/gi,
      '<strong>$1</strong>'
    );
    clean = clean.replace(/<span style="font-style:\s*italic;?">(.*?)<\/span>/gi, '<em>$1</em>');

    // Remove empty style attributes: style="" or style="  "
    clean = clean.replace(/style="\s*"/gi, '');

    // Strip useless spans that have no attributes
    clean = clean.replace(/<span>(.*?)<\/span>/gi, '$1');

    // Retain clean table tags and structure
    clean = clean.replace(/<table[^>]*>/gi, '<table class="article-table">');

    // Wrap bare pasted blockquotes nicely
    clean = clean.replace(/<blockquote[^>]*>/gi, '<blockquote class="article-blockquote">');

    return clean;
  };

  // Direct image upload from drop or file dialog
  const uploadImageFile = async (file: File): Promise<string | null> => {
    setUploading(true);
    setUploadProgress(10);
    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadProgress(40);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      setUploadProgress(80);
      const data = await res.json();
      setUploadProgress(100);

      if (res.ok && data.url) {
        return data.url;
      } else {
        toast.error(data.message || 'Image upload failed');
        return null;
      }
    } catch (err) {
      toast.error('Network error during image upload');
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Helper when image is pasted directly
  const uploadAndOpenSignedModal = async (file: File) => {
    saveSelection();
    toast.info('Uploading pasted image...');
    const url = await uploadImageFile(file);
    if (url) {
      setImageOptions((prev) => ({
        ...prev,
        url,
        alt: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        caption: '',
      }));
      setIsMediaModalOpen(true);
    }
  };

  // Handle file input change from modal
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImageFile(file);
    if (url) {
      setImageOptions((prev) => ({
        ...prev,
        url,
        alt: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      }));
      toast.success('Image uploaded! Configure signature & caption below.');
    }
  };

  // ----------------------------------------------------
  // Insert Signed Image Figure into Article Body
  // ----------------------------------------------------
  const handleInsertSignedImage = () => {
    if (!imageOptions.url) {
      toast.error('Please upload or provide an image URL');
      return;
    }

    restoreSelection();
    if (!editorRef.current) return;
    editorRef.current.focus();

    const alignClass =
      imageOptions.alignment === 'full'
        ? 'w-full my-6'
        : imageOptions.alignment === 'center'
          ? 'max-w-2xl mx-auto my-6'
          : imageOptions.alignment === 'left'
            ? 'sm:float-left sm:mr-6 sm:max-w-sm w-full my-4'
            : 'sm:float-right sm:ml-6 sm:max-w-sm w-full my-4';

    const badgeHtml =
      imageOptions.badge && imageOptions.badge !== 'None'
        ? `<span class="signed-image-badge inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-black tracking-wider uppercase bg-gradient-to-r ${
            BADGE_OPTIONS.find((b) => b.label === imageOptions.badge)?.color ||
            'from-blue-600 to-indigo-600'
          } text-white shadow-md backdrop-blur-md">
            <span>🛡️</span> ${imageOptions.badge}
          </span>`
        : '';

    const signatureHtml = imageOptions.signature
      ? `<span class="caption-sig text-xs font-semibold text-blue-400"> • Photo: ${imageOptions.signature}</span>`
      : '';

    const captionHtml =
      imageOptions.caption || signatureHtml
        ? `<figcaption class="signed-image-caption mt-2.5 px-3 py-2 rounded-lg bg-slate-900/60 border border-white/5 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
            <span class="caption-text font-normal italic text-slate-200">${imageOptions.caption || ''}</span>
            ${signatureHtml}
          </figcaption>`
        : '';

    // Semantic HTML5 Figure Markup with SEO attributes
    const figureHtml = `
      <figure class="signed-image-figure group relative my-6 rounded-2xl overflow-hidden border border-white/10 bg-[#0E1522] shadow-xl ${alignClass}" data-align="${imageOptions.alignment}">
        <div class="signed-image-wrapper relative overflow-hidden">
          <img 
            src="${imageOptions.url}" 
            alt="${imageOptions.alt || imageOptions.caption || 'GoalMills Sports News'}" 
            title="${imageOptions.caption || imageOptions.alt || 'GoalMills Sports'}"
            loading="lazy" 
            decoding="async"
            class="w-full h-auto object-cover rounded-t-2xl transition-transform duration-500 hover:scale-[1.02]"
          />
          <div class="absolute top-3 left-3 z-10">
            ${badgeHtml}
          </div>
          <div class="absolute bottom-2 right-3 z-10 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold text-slate-300 tracking-wider">
            GOALMILLS MEDIA
          </div>
        </div>
        ${captionHtml}
      </figure>
      <p><br></p>
    `;

    document.execCommand('insertHTML', false, figureHtml);
    handleContentChange();
    setIsMediaModalOpen(false);

    // Reset options
    setImageOptions({
      url: '',
      alt: '',
      caption: '',
      signature: 'GoalMills Media Desk',
      badge: 'GoalMills Verified',
      alignment: 'full',
      aspectRatio: '16/9',
    });

    toast.success('Signed image inserted successfully!');
  };

  // ----------------------------------------------------
  // Text Highlighting Tool (Gold, Blue, Green, Purple, Red)
  // ----------------------------------------------------
  const handleApplyHighlight = (colorClass: string) => {
    saveSelection();
    if (!editorRef.current) return;
    editorRef.current.focus();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      toast.info('Please select some text first to highlight it');
      setIsHighlightDropdownOpen(false);
      return;
    }

    const selectedText = selection.toString();
    if (colorClass === 'clear') {
      // Remove highlight: replace with bare text
      document.execCommand('insertHTML', false, selectedText);
      toast.success('Highlight removed');
    } else {
      const highlightHtml = `<mark class="article-highlight ${colorClass}">${selectedText}</mark>`;
      document.execCommand('insertHTML', false, highlightHtml);
      toast.success('Text highlighted!');
    }

    handleContentChange();
    setIsHighlightDropdownOpen(false);
  };

  // ----------------------------------------------------
  // Open Link Modal (Captures selected text automatically)
  // ----------------------------------------------------
  const openLinkModal = () => {
    saveSelection();
    const selection = window.getSelection();
    let selectedText = '';
    let existingHref = '';

    if (selection && selection.rangeCount > 0) {
      selectedText = selection.toString();

      // Check if selection is already inside an anchor
      let node: Node | null = selection.anchorNode;
      while (node && node !== editorRef.current) {
        if (node.nodeName === 'A') {
          existingHref = (node as HTMLAnchorElement).getAttribute('href') || '';
          break;
        }
        node = node.parentNode;
      }
    }

    setLinkText(selectedText);
    setLinkUrl(existingHref);
    setIsExistingLink(Boolean(existingHref));
    setIsLinkModalOpen(true);
  };

  // Attach / Apply Link to Selected or Highlighted Text
  const handleInsertLink = () => {
    if (!linkUrl.trim()) {
      toast.error('Please provide a URL (e.g. https://...)');
      return;
    }

    let formattedUrl = linkUrl.trim();
    if (
      !formattedUrl.startsWith('http://') &&
      !formattedUrl.startsWith('https://') &&
      !formattedUrl.startsWith('/') &&
      !formattedUrl.startsWith('#')
    ) {
      formattedUrl = `https://${formattedUrl}`;
    }

    restoreSelection();
    if (!editorRef.current) return;
    editorRef.current.focus();

    const target = linkTargetBlank ? ' target="_blank" rel="noopener noreferrer"' : '';
    const displayText = linkText.trim() || formattedUrl;
    const linkHtml = `<a href="${formattedUrl}" class="text-blue-400 hover:text-blue-300 underline font-medium"${target}>${displayText}</a>`;

    document.execCommand('insertHTML', false, linkHtml);
    handleContentChange();
    setIsLinkModalOpen(false);
    setLinkUrl('');
    setLinkText('');
    toast.success('Link attached to text!');
  };

  // Remove Link from Selected Text
  const handleRemoveLink = () => {
    restoreSelection();
    if (!editorRef.current) return;
    editorRef.current.focus();

    document.execCommand('unlink', false);
    handleContentChange();
    setIsLinkModalOpen(false);
    setLinkUrl('');
    setLinkText('');
    toast.success('Link removed');
  };

  // Insert Table
  const handleInsertTable = () => {
    restoreSelection();
    if (!editorRef.current) return;
    editorRef.current.focus();

    let tableHtml =
      '<div class="overflow-x-auto my-6"><table class="article-table w-full border-collapse rounded-xl overflow-hidden border border-white/10 bg-slate-900/50 text-sm text-slate-200"><thead><tr class="bg-blue-600/20 text-white font-bold border-b border-white/10">';
    for (let c = 0; c < tableCols; c++) {
      tableHtml += `<th class="p-3 text-left">Header ${c + 1}</th>`;
    }
    tableHtml += '</tr></thead><tbody>';

    for (let r = 0; r < tableRows; r++) {
      tableHtml += `<tr class="border-b border-white/5 hover:bg-white/[0.02]">`;
      for (let c = 0; c < tableCols; c++) {
        tableHtml += `<td class="p-3">Data ${r + 1}, ${c + 1}</td>`;
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table></div><p><br></p>';

    document.execCommand('insertHTML', false, tableHtml);
    handleContentChange();
    setIsTableModalOpen(false);
    toast.success('Table inserted!');
  };

  // Insert Callout Box
  const handleInsertCallout = () => {
    saveSelection();
    if (!editorRef.current) return;
    editorRef.current.focus();

    const calloutHtml = `
      <div class="article-callout my-6 p-5 rounded-2xl bg-gradient-to-r from-blue-900/30 to-indigo-900/20 border-l-4 border-blue-500 shadow-lg text-slate-200">
        <div class="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-wider mb-2">
          <span>⚡</span> Key Tactical Takeaway
        </div>
        <p class="text-slate-300 leading-relaxed text-base italic">Enter highlighted key fact, match stat, or breaking quote here...</p>
      </div>
      <p><br></p>
    `;

    document.execCommand('insertHTML', false, calloutHtml);
    handleContentChange();
    toast.success('Callout box inserted!');
  };

  return (
    <div
      className={`enterprise-editor-container bg-[#0B111E] rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 flex flex-col ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none h-screen p-4 sm:p-6 bg-[#070D18]'
          : 'relative w-full'
      }`}
    >
      {/* ----------------- Top Master Bar & Mode Toggles ----------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-white/10 bg-slate-900/70 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-black tracking-widest text-slate-200 uppercase flex items-center gap-1.5">
            <FiFileText className="text-blue-400" /> Enterprise News Studio
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            SEO & Mobile-First
          </span>
        </div>

        {/* View mode switches & Fullscreen */}
        <div className="flex items-center gap-1.5">
          <div className="flex bg-slate-800/80 p-0.5 rounded-xl border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'edit'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FiEdit3 size={13} />
              <span>Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'preview'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FiEye size={13} />
              <span>Live Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('split')}
              className={`hidden md:flex px-3 py-1.5 rounded-lg font-bold items-center gap-1.5 transition-all ${
                activeTab === 'split'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FiGrid size={13} />
              <span>Split</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white border border-white/10 hover:border-white/20 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Distraction Free'}
          >
            {isFullscreen ? <FiMinimize2 size={15} /> : <FiMaximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* ----------------- Touch-Friendly Responsive Toolbar ----------------- */}
      <div className="px-3 py-2 border-b border-white/5 bg-slate-950/60 overflow-x-auto no-scrollbar flex items-center gap-1 sm:gap-1.5">
        {/* History Group */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => execCmd('undo')}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <FiRotateCcw size={14} />
          </button>
          <button
            type="button"
            onClick={() => execCmd('redo')}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <FiRotateCw size={14} />
          </button>
        </div>

        {/* Headings Dropdown */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-white/10 shrink-0">
          <select
            onChange={(e) => {
              if (e.target.value === 'p') execCmd('formatBlock', '<p>');
              else execCmd('formatBlock', `<${e.target.value}>`);
              e.target.value = '';
            }}
            defaultValue=""
            className="bg-slate-900 border border-white/10 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="" disabled>
              Heading Style
            </option>
            <option value="p">Paragraph (Normal)</option>
            <option value="h2">Heading 2 (Main Section)</option>
            <option value="h3">Heading 3 (Sub Section)</option>
            <option value="h4">Heading 4 (Minor)</option>
          </select>
        </div>

        {/* Inline Formatting */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => execCmd('bold')}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 font-bold"
            title="Bold (Ctrl+B)"
          >
            <FiBold size={14} />
          </button>
          <button
            type="button"
            onClick={() => execCmd('italic')}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 italic"
            title="Italic (Ctrl+I)"
          >
            <FiItalic size={14} />
          </button>
          <button
            type="button"
            onClick={() => execCmd('underline')}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5"
            title="Underline (Ctrl+U)"
          >
            <FiUnderline size={14} />
          </button>
          <button
            type="button"
            onClick={() => execCmd('strikeThrough')}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            title="Strikethrough"
          >
            <FaStrikethrough size={13} />
          </button>

          {/* Text Highlighter Dropdown Tool */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsHighlightDropdownOpen(!isHighlightDropdownOpen)}
              className="p-2 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 flex items-center gap-1"
              title="Highlight Selected Text"
            >
              <FaHighlighter size={13} />
            </button>

            {isHighlightDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 z-30 bg-slate-900 border border-white/15 rounded-xl p-2 shadow-2xl flex items-center gap-1.5 animate-fade-in">
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleApplyHighlight(c.class)}
                    className={`w-6 h-6 rounded-full ${c.bg} hover:scale-125 transition-transform shadow-md`}
                    title={`${c.label} Highlight`}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => handleApplyHighlight('clear')}
                  className="px-2 py-1 rounded text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/10"
                  title="Remove Highlight"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Link & Attachment Tools */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-white/10 shrink-0">
          <button
            type="button"
            onClick={openLinkModal}
            className="p-2 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 flex items-center gap-1"
            title="Attach Link to Selected Text (Ctrl+K)"
          >
            <FiLink size={14} />
            <span className="text-[11px] font-bold hidden sm:inline">Link</span>
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => execCmd('justifyLeft')}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            title="Align Left"
          >
            <FiAlignLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => execCmd('justifyCenter')}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            title="Align Center"
          >
            <FiAlignCenter size={14} />
          </button>
          <button
            type="button"
            onClick={() => execCmd('justifyRight')}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            title="Align Right"
          >
            <FiAlignRight size={14} />
          </button>
          <button
            type="button"
            onClick={() => execCmd('justifyFull')}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            title="Justify"
          >
            <FiAlignJustify size={14} />
          </button>
        </div>

        {/* Lists & Quotes */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => execCmd('insertUnorderedList')}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            title="Bullet List"
          >
            <FiList size={14} />
          </button>
          <button
            type="button"
            onClick={() => execCmd('insertOrderedList')}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-xs font-bold"
            title="Numbered List"
          >
            1.
          </button>
          <button
            type="button"
            onClick={() => execCmd('formatBlock', '<blockquote>')}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            title="Blockquote"
          >
            <FaQuoteLeft size={12} />
          </button>
        </div>

        {/* Media & Advanced Inserters */}
        <div className="flex items-center gap-1.5 shrink-0 pl-1">
          {/* Click to Attach Signed Image Button */}
          <button
            type="button"
            onClick={() => {
              saveSelection();
              setIsMediaModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            <FiImage size={14} />
            <span>Attach Signed Image</span>
          </button>

          {/* Table Modal */}
          <button
            type="button"
            onClick={() => {
              saveSelection();
              setIsTableModalOpen(true);
            }}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5"
            title="Insert Structured Table"
          >
            <FiGrid size={14} />
          </button>

          {/* Highlight Callout Box */}
          <button
            type="button"
            onClick={handleInsertCallout}
            className="p-2 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
            title="Insert Highlight Box"
          >
            ⚡
          </button>

          {/* Horizontal Rule */}
          <button
            type="button"
            onClick={() => execCmd('insertHorizontalRule')}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            title="Horizontal Divider"
          >
            <FiMinus size={14} />
          </button>
        </div>
      </div>

      {/* ----------------- Main Work Area: Editor / Split / Live Preview ----------------- */}
      <div
        className={`flex-1 grid ${activeTab === 'split' ? 'grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10' : 'grid-cols-1'} overflow-hidden`}
      >
        {/* Rich Editable Content Canvas - Strictly enforced white text & clean dark background */}
        {(activeTab === 'edit' || activeTab === 'split') && (
          <div className="relative flex flex-col h-full bg-[#050A14]/90">
            <div
              ref={editorRef}
              contentEditable
              onInput={handleContentChange}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              onBlur={saveSelection}
              onKeyUp={saveSelection}
              onMouseUp={saveSelection}
              style={{ minHeight }}
              className="enterprise-editable-body flex-1 p-5 sm:p-7 text-white text-base leading-relaxed focus:outline-none overflow-y-auto max-w-full break-words prose prose-invert
                [&_*]:text-white [&_*]:bg-transparent
                [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-slate-100
                [&_span]:text-slate-100
                [&_div]:text-slate-100
                [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:text-white [&_h2]:mt-6 [&_h2]:mb-3
                [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-white [&_h3]:mt-5 [&_h3]:mb-2
                [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-200 [&_blockquote]:my-4
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:my-3 [&_ul]:text-slate-100
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol]:my-3 [&_ol]:text-slate-100
                [&_li]:text-slate-100
                [&_a]:text-blue-400 [&_a]:underline
                [&_table]:w-full [&_table]:my-4"
              data-placeholder={placeholder}
            />
          </div>
        )}

        {/* Live Reader Preview Screen (Matches Public Site Styling Exactly) */}
        {(activeTab === 'preview' || activeTab === 'split') && (
          <div className="flex-1 p-5 sm:p-7 bg-[#020617] overflow-y-auto">
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                  <FiEye size={13} /> Mobile & Web Reader Live View
                </span>
                <span className="text-[11px] text-slate-400">{metrics.readingTime} min read</span>
              </div>

              {/* Public article prose container */}
              <div
                className="prose prose-invert max-w-full text-slate-100 leading-relaxed text-sm sm:text-base break-words [word-break:break-word]
                  [&_*]:text-slate-100
                  [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-slate-100
                  [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:break-words
                  [&_h3]:text-lg sm:[&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-white [&_h3]:mt-4 [&_h3]:mb-2
                  [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-200 [&_blockquote]:my-4
                  [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:my-3
                  [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol]:my-3
                  [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:my-4
                  [&_table]:w-full [&_table]:overflow-x-auto [&_table]:block [&_table]:my-4
                  [&_a]:text-blue-400 [&_a]:underline [&_a]:break-all"
                dangerouslySetInnerHTML={{
                  __html: value || '<p class="text-slate-400 italic">No content yet...</p>',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ----------------- Bottom Enterprise Editorial Metrics Bar ----------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-950 border-t border-white/10 rounded-b-2xl text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-slate-200 font-bold">{metrics.words}</span> words
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-slate-200 font-bold">{metrics.chars}</span> characters
          </div>
          <div className="flex items-center gap-1.5 font-medium text-blue-400">
            <FiClock size={12} />
            <span>~{metrics.readingTime} min read</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 font-medium">
            <span className="text-slate-200 font-bold">{metrics.imagesCount}</span> media figures
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
            <FiCheckCircle size={11} /> Auto-Formatted
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ----------------- Signed Image Attachment Modal / Drawer ---------------- */}
      {/* ========================================================================= */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0D1524] border border-white/10 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <FiShield size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Attach Signed Media</h3>
                  <p className="text-xs text-slate-400">
                    Official photo credit & verification badge
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Upload Drop Area or Direct URL */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Image Source *
                </label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/15 hover:border-blue-500/50 rounded-2xl p-5 text-center cursor-pointer bg-white/[0.02] hover:bg-blue-500/5 transition-all group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                      <FiUploadCloud size={24} />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                        Click to Upload or Drag & Drop Image
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, WEBP up to 10MB</p>
                    </div>
                  </div>
                </div>

                {uploading && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-blue-400 font-bold">
                      <span>Uploading to Cloudinary...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="flex-1 h-px bg-white/10" />
                  <span>OR PASTE IMAGE URL</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <input
                  type="url"
                  value={imageOptions.url}
                  onChange={(e) => setImageOptions({ ...imageOptions, url: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Preview if image URL exists */}
              {imageOptions.url && (
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black aspect-video max-h-48">
                  <img
                    src={imageOptions.url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  {imageOptions.badge && imageOptions.badge !== 'None' && (
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-600 text-white shadow-lg">
                        🛡️ {imageOptions.badge}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Alt Text (SEO Crucial) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Alt Text (SEO & Accessibility) *
                </label>
                <input
                  type="text"
                  value={imageOptions.alt}
                  onChange={(e) => setImageOptions({ ...imageOptions, alt: e.target.value })}
                  placeholder="e.g. Bukayo Saka scoring against Manchester City"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Image Caption / Story Context
                </label>
                <input
                  type="text"
                  value={imageOptions.caption}
                  onChange={(e) => setImageOptions({ ...imageOptions, caption: e.target.value })}
                  placeholder="e.g. The forward celebrates his stoppage time winner at Emirates Stadium."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Photographer / Agency Signature */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Photo Signature / Credit
                  </label>
                  <input
                    type="text"
                    value={imageOptions.signature}
                    onChange={(e) =>
                      setImageOptions({ ...imageOptions, signature: e.target.value })
                    }
                    placeholder="e.g. GoalMills / Reuters / Getty"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Verification Badge
                  </label>
                  <select
                    value={imageOptions.badge}
                    onChange={(e) => setImageOptions({ ...imageOptions, badge: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {BADGE_OPTIONS.map((b) => (
                      <option key={b.label} value={b.label}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Layout Alignment */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Layout Alignment (Auto-reflows on mobile)
                </label>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'full', label: 'Full Width' },
                    { id: 'center', label: 'Centered' },
                    { id: 'left', label: 'Left Float' },
                    { id: 'right', label: 'Right Float' },
                  ].map((align) => (
                    <button
                      key={align.id}
                      type="button"
                      onClick={() =>
                        setImageOptions({ ...imageOptions, alignment: align.id as any })
                      }
                      className={`py-2 px-1 rounded-xl font-bold border transition-all text-center ${
                        imageOptions.alignment === align.id
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-900/60 text-slate-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {align.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-slate-900/60">
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertSignedImage}
                disabled={!imageOptions.url || uploading}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <FiCheckCircle size={14} />
                <span>Insert Signed Media</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- Attach Link to Selected/Highlighted Text Modal ----------------- */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0D1524] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FiLink className="text-blue-400" />
                <span>{isExistingLink ? 'Edit Link' : 'Attach Link to Text'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs text-slate-300 font-bold uppercase tracking-wider mb-1.5">
                  Destination URL *
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://goalmills.com/matches/... or https://..."
                  autoFocus
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-bold uppercase tracking-wider mb-1.5">
                  Anchor / Selected Text
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Highlighted text or custom display text..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={linkTargetBlank}
                  onChange={(e) => setLinkTargetBlank(e.target.checked)}
                  className="rounded text-blue-600 bg-white/10 border-white/20"
                />
                <span>Open in new tab (rel="noopener noreferrer")</span>
              </label>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              {isExistingLink ? (
                <button
                  type="button"
                  onClick={handleRemoveLink}
                  className="px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <FaLinkSlash size={13} />
                  <span>Remove Link</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInsertLink}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-500/25 transition-all"
                >
                  <FiLink size={14} />
                  <span>{isExistingLink ? 'Update Link' : 'Attach Link'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- Table Modal ----------------- */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D1524] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FiGrid className="text-blue-400" /> Insert Data Table
              </h3>
              <button
                type="button"
                onClick={() => setIsTableModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <FiX size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 font-bold uppercase mb-1">
                  Rows
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 font-bold uppercase mb-1">
                  Columns
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={tableCols}
                  onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsTableModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertTable}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
              >
                Create Table
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
