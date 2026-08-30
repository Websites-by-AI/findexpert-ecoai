import type { Lang } from './i18n.ts';
import { t } from './i18n.ts';
import type { InlineButton, ReplyButton } from './api.ts';

export function mainKeyboard(lang: Lang): ReplyButton[][] {
  return [
    [{ text: t(lang, 'btnGrant') }, { text: t(lang, 'btnRfp') }],
    [{ text: t(lang, 'btnProposal') }, { text: t(lang, 'btnAnalyze') }],
    [{ text: t(lang, 'btnPatent') }, { text: t(lang, 'btnAcademic') }],
    [{ text: t(lang, 'btnBiz') }, { text: t(lang, 'btnAsk') }],
    [{ text: t(lang, 'btnHf') }, { text: t(lang, 'btnReports') }],
    [{ text: t(lang, 'btnCommunity') }, { text: t(lang, 'btnInvite') }],
    [{ text: t(lang, 'btnAbout') }, { text: t(lang, 'btnLang') }],
  ];
}

export function roleKeyboard(lang: Lang): InlineButton[][] {
  return [
    [
      { text: t(lang, 'roleFamily'), callback_data: 'role:family' },
      { text: t(lang, 'roleMedic'), callback_data: 'role:medic' },
    ],
    [
      { text: t(lang, 'btnInvite'), callback_data: 'inv:new' },
      { text: t(lang, 'btnGroup'), callback_data: 'grp:new' },
    ],
    [
      { text: t(lang, 'btnMyGroup'), callback_data: 'grp:show' },
      { text: t(lang, 'btnLeaveGroup'), callback_data: 'grp:leave' },
    ],
  ];
}

export function cancelKeyboard(lang: Lang): ReplyButton[][] {
  return [[{ text: t(lang, 'btnCancel') }]];
}

export function sectionKeyboard(lang: Lang): InlineButton[][] {
  return [
    [{ text: t(lang, 'secFull'), callback_data: 'sec:full_proposal' }],
    [
      { text: t(lang, 'secSummary'), callback_data: 'sec:summary' },
      { text: t(lang, 'secNeed'), callback_data: 'sec:statement_of_need' },
    ],
    [
      { text: t(lang, 'secGoals'), callback_data: 'sec:goals' },
      { text: t(lang, 'secMethod'), callback_data: 'sec:methodology' },
    ],
    [{ text: t(lang, 'secBudget'), callback_data: 'sec:budget' }],
  ];
}

export function patentSectionKeyboard(lang: Lang): InlineButton[][] {
  return [
    [{ text: t(lang, 'patFull'), callback_data: 'pat:full_draft' }],
    [
      { text: t(lang, 'patSummary'), callback_data: 'pat:summary' },
      { text: t(lang, 'patClaims'), callback_data: 'pat:claims' },
    ],
    [{ text: t(lang, 'patPrior'), callback_data: 'pat:prior_art' }],
  ];
}

export function academicSectionKeyboard(lang: Lang): InlineButton[][] {
  return [
    [{ text: t(lang, 'acadProposal'), callback_data: 'acad:research_proposal' }],
    [
      { text: t(lang, 'acadAbstract'), callback_data: 'acad:abstract' },
      { text: t(lang, 'acadIntro'), callback_data: 'acad:introduction' },
    ],
    [
      { text: t(lang, 'acadMethod'), callback_data: 'acad:methodology' },
      { text: t(lang, 'acadConclusion'), callback_data: 'acad:conclusion' },
    ],
  ];
}

export function bizSectionKeyboard(lang: Lang): InlineButton[][] {
  return [
    [{ text: t(lang, 'bizFull'), callback_data: 'biz:full_plan' }],
    [
      { text: t(lang, 'bizExec'), callback_data: 'biz:executive_summary' },
      { text: t(lang, 'bizMarket'), callback_data: 'biz:market_analysis' },
    ],
    [{ text: t(lang, 'bizFinance'), callback_data: 'biz:financials' }],
  ];
}

export function matchButton(lang: Lang, text: string): string | null {
  const map: Record<string, string> = {
    btnGrant: 'grant',
    btnRfp: 'rfp',
    btnProposal: 'proposal',
    btnAnalyze: 'analyze',
    btnPatent: 'patent',
    btnAcademic: 'academic',
    btnBiz: 'biz',
    btnHf: 'hf',
    btnAsk: 'ask',
    btnReports: 'reports',
    btnAbout: 'about',
    btnLang: 'lang',
    btnCancel: 'cancel',
  };
  const trimmed = text.trim();
  for (const langKey of ['fa', 'en'] as Lang[]) {
    for (const [key, action] of Object.entries(map)) {
      if (t(langKey, key) === trimmed) return action;
    }
  }
  void lang;
  return null;
}
