'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useToast } from '../Toast';
import { canDirectPublish } from '@/lib/rbac';
import { UserRole } from '@goalmills/types';
import EnterpriseNewsEditor from './EnterpriseNewsEditor';
import {
  FiUploadCloud,
  FiFileText,
  FiStar,
  FiZap,
  FiTag,
  FiLayers,
  FiImage,
  FiAward,
  FiShield,
  FiUser,
  FiCompass,
  FiPlus,
  FiExternalLink,
  FiCheck,
} from 'react-icons/fi';
import { ArticleType } from '@goalmills/types';

interface CategoryOption {
  _id: string;
  name: string;
  slug: string;
  color?: string;
}

interface EcosystemEntityItem {
  _id: string;
  type: 'sport' | 'competition' | 'club' | 'player';
  name: string;
  slug: string;
  shortName?: string;
  sportSlug?: string;
  sportName?: string;
  competitionSlug?: string;
  competitionName?: string;
  clubSlug?: string;
  clubName?: string;
  country?: string;
  logo?: string;
  photo?: string;
  position?: string;
  nationality?: string;
  isCustom?: boolean;
}

export default function CreateNewsForm() {
  const { data: session } = useSession();
  const toast = useToast();
  const userRole = (session?.user?.role as UserRole) || undefined;
  const isDirectPublisher = canDirectPublish(userRole);

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [source, setSource] = useState('');
  const [category, setCategory] = useState('Premier League');
  const [customCategory, setCustomCategory] = useState('');

  // 4-Level Content Ecosystem Selectors & Custom States
  const [ecosystemEntities, setEcosystemEntities] = useState<EcosystemEntityItem[]>([]);
  const [ecosystemLoading, setEcosystemLoading] = useState(true);

  // Level 1: Sport
  const [sportSlug, setSportSlug] = useState('football');
  const [customSportName, setCustomSportName] = useState('');
  const [customSportSlug, setCustomSportSlug] = useState('');

  // Level 2: Competition
  const [competitionSlug, setCompetitionSlug] = useState('premier-league');
  const [customCompetitionName, setCustomCompetitionName] = useState('');
  const [customCompetitionSlug, setCustomCompetitionSlug] = useState('');
  const [customCompetitionCountry, setCustomCompetitionCountry] = useState('');
  const [customCompetitionLogo, setCustomCompetitionLogo] = useState('');

  // Level 3: Club
  const [selectedClubSlug, setSelectedClubSlug] = useState('arsenal');
  const [customClubName, setCustomClubName] = useState('');
  const [customClubSlug, setCustomClubSlug] = useState('');
  const [customClubShortName, setCustomClubShortName] = useState('');
  const [customClubLogo, setCustomClubLogo] = useState('');

  // Level 4: Player
  const [selectedPlayerSlug, setSelectedPlayerSlug] = useState('victor-osimhen');
  const [customPlayerName, setCustomPlayerName] = useState('');
  const [customPlayerSlug, setCustomPlayerSlug] = useState('');
  const [customPlayerPosition, setCustomPlayerPosition] = useState('Forward');
  const [customPlayerNationality, setCustomPlayerNationality] = useState('');
  const [customPlayerPhoto, setCustomPlayerPhoto] = useState('');

  // Article Type
  const [articleType, setArticleType] = useState<ArticleType | '__custom__'>('news');
  const [customArticleType, setCustomArticleType] = useState('');

  const [tags, setTags] = useState('');
  const [relatedTeam, setRelatedTeam] = useState('');
  const [isBreaking, setIsBreaking] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingEntity, setSavingEntity] = useState<string | null>(null);

  // Fetch categories & ecosystem entities
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      })
      .catch((err) => console.error('Error fetching categories:', err));

    fetch('/api/ecosystem')
      .then((res) => res.json())
      .then((json) => {
        if (json.data && Array.isArray(json.data)) {
          setEcosystemEntities(json.data);
        }
      })
      .catch((err) => console.error('Error fetching ecosystem:', err))
      .finally(() => setEcosystemLoading(false));
  }, []);

  // Filtered dropdown lists based on selections
  const sportsList = useMemo(() => {
    return ecosystemEntities.filter((e) => e.type === 'sport');
  }, [ecosystemEntities]);

  const competitionsList = useMemo(() => {
    return ecosystemEntities.filter(
      (e) =>
        e.type === 'competition' &&
        (sportSlug === '__custom__' || !e.sportSlug || e.sportSlug === sportSlug)
    );
  }, [ecosystemEntities, sportSlug]);

  const clubsList = useMemo(() => {
    return ecosystemEntities.filter(
      (e) =>
        e.type === 'club' &&
        (sportSlug === '__custom__' || !e.sportSlug || e.sportSlug === sportSlug) &&
        (competitionSlug === '__custom__' ||
          competitionSlug === '' ||
          !e.competitionSlug ||
          e.competitionSlug === competitionSlug)
    );
  }, [ecosystemEntities, sportSlug, competitionSlug]);

  const playersList = useMemo(() => {
    return ecosystemEntities.filter(
      (e) =>
        e.type === 'player' &&
        (selectedClubSlug === '__custom__' ||
          selectedClubSlug === '' ||
          !e.clubSlug ||
          e.clubSlug === selectedClubSlug)
    );
  }, [ecosystemEntities, selectedClubSlug]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setImage(data.url);
        toast.success('Cover image uploaded successfully');
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch (error) {
      toast.error('An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  // Quick save custom entity to DB so it persists for future articles
  const handleQuickSaveEntity = async (type: 'sport' | 'competition' | 'club' | 'player') => {
    setSavingEntity(type);
    try {
      let payload: any = { type };
      if (type === 'sport') {
        if (!customSportName.trim()) {
          toast.error('Please enter a custom sport name');
          return;
        }
        payload.name = customSportName.trim();
        payload.slug =
          customSportSlug.trim() ||
          customSportName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
      } else if (type === 'competition') {
        if (!customCompetitionName.trim()) {
          toast.error('Please enter a competition name');
          return;
        }
        payload.name = customCompetitionName.trim();
        payload.slug =
          customCompetitionSlug.trim() ||
          customCompetitionName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        payload.country = customCompetitionCountry.trim();
        payload.logo = customCompetitionLogo.trim();
        payload.sportSlug = sportSlug === '__custom__' ? customSportSlug : sportSlug;
      } else if (type === 'club') {
        if (!customClubName.trim()) {
          toast.error('Please enter a club/team name');
          return;
        }
        payload.name = customClubName.trim();
        payload.slug =
          customClubSlug.trim() ||
          customClubName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        payload.shortName = customClubShortName.trim() || customClubName.trim();
        payload.logo = customClubLogo.trim();
        payload.sportSlug = sportSlug === '__custom__' ? customSportSlug : sportSlug;
        payload.competitionSlug =
          competitionSlug === '__custom__' ? customCompetitionSlug : competitionSlug;
      } else if (type === 'player') {
        if (!customPlayerName.trim()) {
          toast.error('Please enter a player name');
          return;
        }
        payload.name = customPlayerName.trim();
        payload.slug =
          customPlayerSlug.trim() ||
          customPlayerName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        payload.position = customPlayerPosition.trim();
        payload.nationality = customPlayerNationality.trim();
        payload.photo = customPlayerPhoto.trim();
        payload.sportSlug = sportSlug === '__custom__' ? customSportSlug : sportSlug;
        payload.competitionSlug =
          competitionSlug === '__custom__' ? customCompetitionSlug : competitionSlug;
        payload.clubSlug = selectedClubSlug === '__custom__' ? customClubSlug : selectedClubSlug;
      }

      const res = await fetch('/api/ecosystem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        toast.success(`Custom ${type} saved to ecosystem registry!`);
        // Add to local state and select it
        setEcosystemEntities((prev) => [data.data, ...prev]);
        if (type === 'sport') {
          setSportSlug(data.data.slug);
        } else if (type === 'competition') {
          setCompetitionSlug(data.data.slug);
        } else if (type === 'club') {
          setSelectedClubSlug(data.data.slug);
        } else if (type === 'player') {
          setSelectedPlayerSlug(data.data.slug);
        }
      } else {
        toast.error(data.message || `Failed to save ${type}`);
      }
    } catch (err) {
      toast.error('Error saving entity to registry');
    } finally {
      setSavingEntity(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const finalCategory = category === '__custom__' ? customCategory.trim() : category;
    if (!finalCategory) {
      toast.error('Please select or specify a category');
      setLoading(false);
      return;
    }

    if (!content.trim() || content === '<p><br></p>') {
      toast.error('Please enter article content');
      setLoading(false);
      return;
    }

    // 1. Resolve Final Sport
    let finalSport = 'Football';
    let finalSportSlug = 'football';
    if (sportSlug === '__custom__') {
      finalSport = customSportName.trim() || 'Custom Sport';
      finalSportSlug = (
        customSportSlug.trim() || customSportName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      ).replace(/^-|-$/g, '');
    } else {
      const foundSport = ecosystemEntities.find((e) => e.type === 'sport' && e.slug === sportSlug);
      if (foundSport) {
        finalSport = foundSport.name;
        finalSportSlug = foundSport.slug;
      }
    }

    // 2. Resolve Final Competition
    let finalCompName: string | undefined = undefined;
    let finalCompSlug: string | undefined = undefined;
    if (competitionSlug === '__custom__') {
      if (customCompetitionName.trim()) {
        finalCompName = customCompetitionName.trim();
        finalCompSlug = (
          customCompetitionSlug.trim() ||
          customCompetitionName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        ).replace(/^-|-$/g, '');
      }
    } else if (competitionSlug) {
      const foundComp = ecosystemEntities.find(
        (e) => e.type === 'competition' && e.slug === competitionSlug
      );
      if (foundComp) {
        finalCompName = foundComp.name;
        finalCompSlug = foundComp.slug;
      }
    }

    // 3. Resolve Final Teams / Club
    const teams: any[] = [];
    let clubShortName = '';
    if (selectedClubSlug === '__custom__') {
      if (customClubName.trim()) {
        const cSlug = (
          customClubSlug.trim() || customClubName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        ).replace(/^-|-$/g, '');
        teams.push({
          id: cSlug,
          name: customClubName.trim(),
          slug: cSlug,
          logo: customClubLogo.trim() || undefined,
        });
        clubShortName = customClubShortName.trim() || customClubName.trim();
      }
    } else if (selectedClubSlug) {
      const foundClub = ecosystemEntities.find(
        (e) => e.type === 'club' && e.slug === selectedClubSlug
      );
      if (foundClub) {
        teams.push({
          id: foundClub.slug,
          name: foundClub.name,
          slug: foundClub.slug,
          logo: foundClub.logo || undefined,
        });
        clubShortName = foundClub.shortName || foundClub.name;
      }
    }

    // 4. Resolve Final Players
    const players: any[] = [];
    if (selectedPlayerSlug === '__custom__') {
      if (customPlayerName.trim()) {
        const pSlug = (
          customPlayerSlug.trim() || customPlayerName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        ).replace(/^-|-$/g, '');
        players.push({
          id: pSlug,
          name: customPlayerName.trim(),
          slug: pSlug,
          photo: customPlayerPhoto.trim() || undefined,
        });
      }
    } else if (selectedPlayerSlug) {
      const foundPlayer = ecosystemEntities.find(
        (e) => e.type === 'player' && e.slug === selectedPlayerSlug
      );
      if (foundPlayer) {
        players.push({
          id: foundPlayer.slug,
          name: foundPlayer.name,
          slug: foundPlayer.slug,
          photo: foundPlayer.photo || undefined,
        });
      }
    }

    // 5. Resolve Final Article Type
    const finalArticleType =
      articleType === '__custom__'
        ? (customArticleType.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_') as ArticleType) || 'news'
        : articleType;

    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          image,
          source,
          category: finalCategory,
          sport: finalSport,
          sportSlug: finalSportSlug,
          competition: finalCompName,
          competitionSlug: finalCompSlug,
          teams,
          players,
          articleType: finalArticleType,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          relatedTeam: clubShortName || relatedTeam.trim(),
          isBreaking,
          isFeatured,
          status: isDirectPublisher ? 'published' : 'pending_approval',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (isDirectPublisher) {
          toast.success('News story published & cross-distributed across custom ecosystem hubs!');
        } else {
          toast.success('Article submitted for editorial approval!');
        }
        setTitle('');
        setExcerpt('');
        setContent('');
        setImage('');
        setSource('');
        setTags('');
        setRelatedTeam('');
        setCustomSportName('');
        setCustomSportSlug('');
        setCustomCompetitionName('');
        setCustomCompetitionSlug('');
        setCustomCompetitionCountry('');
        setCustomCompetitionLogo('');
        setCustomClubName('');
        setCustomClubSlug('');
        setCustomClubShortName('');
        setCustomClubLogo('');
        setCustomPlayerName('');
        setCustomPlayerSlug('');
        setCustomPlayerPosition('Forward');
        setCustomPlayerNationality('');
        setCustomPlayerPhoto('');
        setCustomArticleType('');
        setIsBreaking(false);
        setIsFeatured(false);
      } else {
        toast.error(data.message || 'Failed to create news article.');
      }
    } catch (error) {
      toast.error('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-4 sm:p-7 rounded-3xl h-fit space-y-6 max-w-full">
      <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>⚡</span> Entity-First Publishing Engine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Content is auto-mapped across customizable sports, leagues, clubs, and player profiles.
          </p>
        </div>
        <Link
          href="/admin/ecosystem"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold border border-blue-500/20 text-xs transition-colors"
        >
          <FiCompass /> Manage Ecosystem Registry <FiExternalLink />
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title & Source */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FiFileText className="text-blue-400" /> Article Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-3 text-white text-base font-semibold focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g. Victor Osimhen Scores Twice in Thrilling Match..."
            />
          </div>
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              Editorial Source
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g. GoalMills Desk, Sky Sports"
            />
          </div>
        </div>

        {/* 4-Level Content Ecosystem Mapping Grid (Customizable) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5">
              <FiCompass /> Content Ecosystem Mapping (Auto-Distribution)
            </span>
            <span className="text-[11px] text-slate-400 font-semibold">
              Select presets or type custom values
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Level 1: Sport Selector */}
            <div>
              <label className="block text-slate-400 text-[11px] font-bold uppercase mb-1 flex items-center justify-between">
                <span>Level 1: Sport</span>
                {sportSlug === '__custom__' && (
                  <span className="text-[10px] text-amber-400 font-mono">Custom Mode</span>
                )}
              </label>
              <select
                value={sportSlug}
                onChange={(e) => setSportSlug(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
              >
                {sportsList.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name} {s.isCustom ? '(Custom)' : ''}
                  </option>
                ))}
                <option value="__custom__">+ Custom Sport...</option>
              </select>

              {/* Inline Custom Sport Input */}
              {sportSlug === '__custom__' && (
                <div className="mt-2 p-2.5 bg-slate-950/80 border border-amber-500/30 rounded-xl space-y-2">
                  <input
                    type="text"
                    placeholder="Custom Sport Name (e.g. Formula 1)"
                    value={customSportName}
                    onChange={(e) => {
                      setCustomSportName(e.target.value);
                      setCustomSportSlug(
                        e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
                      );
                    }}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs"
                  />
                  <div className="flex items-center justify-between gap-1">
                    <input
                      type="text"
                      placeholder="Slug (e.g. formula-1)"
                      value={customSportSlug}
                      onChange={(e) => setCustomSportSlug(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-slate-300 text-[11px] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleQuickSaveEntity('sport')}
                      disabled={savingEntity === 'sport'}
                      className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[10px] font-bold shrink-0 flex items-center gap-1 transition-colors"
                      title="Save to database registry for future articles"
                    >
                      <FiPlus /> {savingEntity === 'sport' ? '...' : 'Save'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Level 2: Competition Selector */}
            <div>
              <label className="block text-slate-400 text-[11px] font-bold uppercase mb-1 flex items-center justify-between">
                <span>Level 2: Competition</span>
                {competitionSlug === '__custom__' && (
                  <span className="text-[10px] text-emerald-400 font-mono">Custom Mode</span>
                )}
              </label>
              <select
                value={competitionSlug}
                onChange={(e) => setCompetitionSlug(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="">None / General</option>
                {competitionsList.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name} {c.isCustom ? '(Custom)' : ''}
                  </option>
                ))}
                <option value="__custom__">+ Custom Competition...</option>
              </select>

              {/* Inline Custom Competition Input */}
              {competitionSlug === '__custom__' && (
                <div className="mt-2 p-2.5 bg-slate-950/80 border border-emerald-500/30 rounded-xl space-y-2">
                  <input
                    type="text"
                    placeholder="Competition Name (e.g. CAF Champions League)"
                    value={customCompetitionName}
                    onChange={(e) => {
                      setCustomCompetitionName(e.target.value);
                      setCustomCompetitionSlug(
                        e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
                      );
                    }}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs"
                  />
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      placeholder="Country / Region"
                      value={customCompetitionCountry}
                      onChange={(e) => setCustomCompetitionCountry(e.target.value)}
                      className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-slate-300 text-[11px]"
                    />
                    <input
                      type="url"
                      placeholder="Logo URL"
                      value={customCompetitionLogo}
                      onChange={(e) => setCustomCompetitionLogo(e.target.value)}
                      className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-slate-300 text-[11px]"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <input
                      type="text"
                      placeholder="Slug (e.g. caf-champions-league)"
                      value={customCompetitionSlug}
                      onChange={(e) => setCustomCompetitionSlug(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-slate-300 text-[11px] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleQuickSaveEntity('competition')}
                      disabled={savingEntity === 'competition'}
                      className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-[10px] font-bold shrink-0 flex items-center gap-1 transition-colors"
                      title="Save to database registry for future articles"
                    >
                      <FiPlus /> {savingEntity === 'competition' ? '...' : 'Save'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Level 3: Club Selector */}
            <div>
              <label className="block text-slate-400 text-[11px] font-bold uppercase mb-1 flex items-center justify-between">
                <span>Level 3: Primary Club</span>
                {selectedClubSlug === '__custom__' && (
                  <span className="text-[10px] text-purple-400 font-mono">Custom Mode</span>
                )}
              </label>
              <select
                value={selectedClubSlug}
                onChange={(e) => setSelectedClubSlug(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="">None / General</option>
                {clubsList.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name} {c.isCustom ? '(Custom)' : ''}
                  </option>
                ))}
                <option value="__custom__">+ Custom Club / Team...</option>
              </select>

              {/* Inline Custom Club Input */}
              {selectedClubSlug === '__custom__' && (
                <div className="mt-2 p-2.5 bg-slate-950/80 border border-purple-500/30 rounded-xl space-y-2">
                  <input
                    type="text"
                    placeholder="Club / Team Name (e.g. Al Ahly SC)"
                    value={customClubName}
                    onChange={(e) => {
                      setCustomClubName(e.target.value);
                      setCustomClubSlug(
                        e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
                      );
                      if (!customClubShortName) setCustomClubShortName(e.target.value);
                    }}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs"
                  />
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      placeholder="Short Name (e.g. Al Ahly)"
                      value={customClubShortName}
                      onChange={(e) => setCustomClubShortName(e.target.value)}
                      className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-slate-300 text-[11px]"
                    />
                    <input
                      type="url"
                      placeholder="Logo URL"
                      value={customClubLogo}
                      onChange={(e) => setCustomClubLogo(e.target.value)}
                      className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-slate-300 text-[11px]"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <input
                      type="text"
                      placeholder="Slug (e.g. al-ahly-sc)"
                      value={customClubSlug}
                      onChange={(e) => setCustomClubSlug(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-slate-300 text-[11px] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleQuickSaveEntity('club')}
                      disabled={savingEntity === 'club'}
                      className="px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-[10px] font-bold shrink-0 flex items-center gap-1 transition-colors"
                      title="Save to database registry for future articles"
                    >
                      <FiPlus /> {savingEntity === 'club' ? '...' : 'Save'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Level 4: Player Selector */}
            <div>
              <label className="block text-slate-400 text-[11px] font-bold uppercase mb-1 flex items-center justify-between">
                <span>Level 4: Featured Player</span>
                {selectedPlayerSlug === '__custom__' && (
                  <span className="text-[10px] text-cyan-400 font-mono">Custom Mode</span>
                )}
              </label>
              <select
                value={selectedPlayerSlug}
                onChange={(e) => setSelectedPlayerSlug(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="">None / General Squad</option>
                {playersList.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name} {p.nationality ? `(${p.nationality})` : ''} {p.isCustom ? '(Custom)' : ''}
                  </option>
                ))}
                <option value="__custom__">+ Custom Player / Athlete...</option>
              </select>

              {/* Inline Custom Player Input */}
              {selectedPlayerSlug === '__custom__' && (
                <div className="mt-2 p-2.5 bg-slate-950/80 border border-cyan-500/30 rounded-xl space-y-2">
                  <input
                    type="text"
                    placeholder="Player Name (e.g. Percy Tau)"
                    value={customPlayerName}
                    onChange={(e) => {
                      setCustomPlayerName(e.target.value);
                      setCustomPlayerSlug(
                        e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
                      );
                    }}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs"
                  />
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      placeholder="Nationality (e.g. South Africa)"
                      value={customPlayerNationality}
                      onChange={(e) => setCustomPlayerNationality(e.target.value)}
                      className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-slate-300 text-[11px]"
                    />
                    <input
                      type="text"
                      placeholder="Position (e.g. Forward)"
                      value={customPlayerPosition}
                      onChange={(e) => setCustomPlayerPosition(e.target.value)}
                      className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-slate-300 text-[11px]"
                    />
                  </div>
                  <input
                    type="url"
                    placeholder="Photo URL (https://...)"
                    value={customPlayerPhoto}
                    onChange={(e) => setCustomPlayerPhoto(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-slate-300 text-[11px]"
                  />
                  <div className="flex items-center justify-between gap-1">
                    <input
                      type="text"
                      placeholder="Slug (e.g. percy-tau)"
                      value={customPlayerSlug}
                      onChange={(e) => setCustomPlayerSlug(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-slate-300 text-[11px] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleQuickSaveEntity('player')}
                      disabled={savingEntity === 'player'}
                      className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg text-[10px] font-bold shrink-0 flex items-center gap-1 transition-colors"
                      title="Save to database registry for future articles"
                    >
                      <FiPlus /> {savingEntity === 'player' ? '...' : 'Save'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Article Type & Category Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-slate-400 text-[11px] font-bold uppercase mb-1 flex items-center justify-between">
                <span>Article Type</span>
                {articleType === '__custom__' && (
                  <span className="text-[10px] text-indigo-400 font-mono">Custom Mode</span>
                )}
              </label>
              <select
                value={articleType}
                onChange={(e) => setArticleType(e.target.value as any)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="news">Breaking News / Standard Story</option>
                <option value="transfer">Transfer News / Rumour / Done Deal</option>
                <option value="tactical_analysis">Tactical Match Analysis</option>
                <option value="player_analysis">Player Scouting Deep Dive</option>
                <option value="match_report">Official Match Report</option>
                <option value="feature">Editorial Feature / Long Read</option>
                <option value="interview">Exclusive Interview</option>
                <option value="prediction">Match Preview & Prediction</option>
                <option value="__custom__">+ Custom Article Type...</option>
              </select>

              {articleType === '__custom__' && (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Custom Article Type (e.g. press_release, live_coverage)"
                    value={customArticleType}
                    onChange={(e) => setCustomArticleType(e.target.value)}
                    className="w-full bg-slate-950/80 border border-indigo-500/40 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-400"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] font-bold uppercase mb-1 flex items-center justify-between">
                <span>Category</span>
                {category === '__custom__' && (
                  <span className="text-[10px] text-blue-400 font-mono">Custom Mode</span>
                )}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
                <option value="__custom__">+ Custom Category...</option>
              </select>

              {category === '__custom__' && (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Custom Category (e.g. World Cup 2026, CAF Super Cup)"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full bg-slate-950/80 border border-blue-500/40 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-400"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Keywords & Tags */}
        <div>
          <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <FiTag className="text-blue-400" /> Keywords & Entity Tags (Comma separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="e.g. Victor Osimhen, Arsenal, Champions League, Done Deal"
          />
        </div>

        {/* Lead Excerpt */}
        <div>
          <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
            Lead Excerpt / Social Meta Summary *
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            required
            rows={2}
            className="w-full bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors leading-relaxed"
            placeholder="Brief punchy summary of the story for SEO meta tags and social embeds..."
          />
        </div>

        {/* Cover Hero Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end bg-slate-900/40 p-4 rounded-2xl border border-white/5">
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FiImage className="text-blue-400" /> Cover Image URL
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="https://images.unsplash.com/..."
            />
          </div>
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              Or Upload Cover File
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 transition-all cursor-pointer"
            />
          </div>
        </div>
        {uploading && (
          <div className="text-xs text-blue-400 animate-pulse font-bold">
            Uploading cover image...
          </div>
        )}

        {/* Flags & Toggles */}
        <div className="flex flex-wrap items-center gap-6 py-3 border-t border-b border-white/5">
          <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-white">
            <input
              type="checkbox"
              checked={isBreaking}
              onChange={(e) => setIsBreaking(e.target.checked)}
              className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-white/10 border-white/20"
            />
            <span className="flex items-center gap-1">
              <FiZap className="text-red-500" /> Mark as Breaking News
            </span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-white">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-white/10 border-white/20"
            />
            <span className="flex items-center gap-1">
              <FiStar className="text-amber-400" /> Feature on Top Picks
            </span>
          </label>
        </div>

        {/* Enterprise Rich News Editor */}
        <div>
          <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Article Body (Enterprise Studio) *</span>
            <span className="text-[11px] text-blue-400 font-normal">
              Copy-paste formatted docs or attach media
            </span>
          </label>
          <EnterpriseNewsEditor
            value={content}
            onChange={setContent}
            placeholder="Paste your story from Word/Google Docs or start typing here..."
            minHeight="380px"
          />
        </div>

        {/* Publish Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-wider py-4 rounded-2xl transition-all hover:scale-[1.005] shadow-xl shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <span>
              {loading
                ? 'Processing Submission...'
                : isDirectPublisher
                  ? 'Publish to Sports Network'
                  : 'Submit for Editorial Approval'}
            </span>
          </button>
          {!isDirectPublisher && (
            <p className="text-[11px] text-amber-400 text-center mt-2 font-medium">
              ℹ️ Your role submits drafts for review. An Editor, Manager, or Super Admin will review
              and publish.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
