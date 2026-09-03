export type MarketingLocale = 'en' | 'he'

export type MarketingPageId =
  | 'home'
  | 'how'
  | 'artists'
  | 'professionals'
  | 'trust'
  | 'faq'
  | 'sample'

type Step = { label: string; title: string; body: string }
type Value = { title: string; body: string }
type Faq = { question: string; answer: string }

export type MarketingCopy = {
  nav: {
    home: string
    how: string
    artists: string
    professionals: string
    trust: string
    faq: string
    earlyAccess: string
    login: string
    openMenu: string
    closeMenu: string
    switchLanguage: string
  }
  common: {
    eyebrow: string
    primaryCta: string
    secondaryCta: string
    privacyLine: string
    disclaimer: string
    earlyTitle: string
    earlyBody: string
  }
  home: {
    kicker: string
    title: string
    lead: string
    problemLabel: string
    problemTitle: string
    problemBody: string
    flowLabel: string
    flowTitle: string
    flow: Step[]
    valueLabel: string
    valueTitle: string
    values: Value[]
    trustLabel: string
    trustTitle: string
    trustBody: string
  }
  how: {
    kicker: string
    title: string
    lead: string
    steps: Step[]
    boundaryTitle: string
    boundaryBody: string
  }
  artists: {
    kicker: string
    title: string
    lead: string
    values: Value[]
    actsTitle: string
    actsBody: string
  }
  professionals: {
    kicker: string
    title: string
    lead: string
    values: Value[]
    boundaryTitle: string
    boundaryBody: string
  }
  trust: {
    kicker: string
    title: string
    lead: string
    values: Value[]
    freshnessTitle: string
    freshnessBody: string
  }
  faq: {
    kicker: string
    title: string
    lead: string
    items: Faq[]
  }
  sample: {
    kicker: string
    title: string
    lead: string
    notice: string
    items: Value[]
  }
  form: {
    kicker: string
    title: string
    lead: string
    email: string
    role: string
    rolePrompt: string
    roles: Array<{ value: string; label: string }>
    consent: string
    submit: string
    sending: string
    successTitle: string
    successBody: string
    duplicateTitle: string
    duplicateBody: string
    error: string
    privacy: string
  }
}

const en: MarketingCopy = {
  nav: {
    home: 'Home',
    how: 'How it works',
    artists: 'Artists & Acts',
    professionals: 'Professionals',
    trust: 'Trust',
    faq: 'FAQ',
    earlyAccess: 'Request early access',
    login: 'Invited login',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    switchLanguage: 'עברית',
  },
  common: {
    eyebrow: 'LOCK SHOW',
    primaryCta: 'Request early access',
    secondaryCta: 'See how it works',
    privacyLine: 'Private by default. Shared by permission. Shown with context.',
    disclaimer: 'LOCK SHOW does not rank artists, predict bookings, or guarantee outcomes.',
    earlyTitle: 'Early access, with expectations kept clear.',
    earlyBody:
      'Tell us your role and email. We will use the request to assess fit and contact you if an appropriate early-access path is available.',
  },
  home: {
    kicker: 'PRIVATE INTELLIGENCE · PERMISSIONED PROOF',
    title: 'Make your professional world easier to understand.',
    lead:
      'LOCK SHOW helps artists and acts organize professional evidence privately, decide what to strengthen, and share a current, contextual PASSPORT with selected recipients.',
    problemLabel: 'THE PROFESSIONAL PROBLEM',
    problemTitle: 'Useful evidence is often scattered, stale, or missing context.',
    problemBody:
      'Show history, source files, confirmations, and practical information can live across different systems and conversations. LOCK SHOW brings that material into one controlled workflow without turning it into a public score.',
    flowLabel: 'THE WORKFLOW',
    flowTitle: 'RADAR → IMPROVE → PASSPORT',
    flow: [
      {
        label: '01 · BACKSTAGE',
        title: 'RADAR',
        body: 'Collect and review evidence in a private workspace. RADAR is not a public profile.',
      },
      {
        label: '02 · SIGNAL',
        title: 'IMPROVE',
        body: 'See what is supported, what needs attention, and choose what to work on next.',
      },
      {
        label: '03 · STAGE',
        title: 'PASSPORT',
        body: 'Create a contextual, permissioned view for a selected recipient. You control what is included.',
      },
    ],
    valueLabel: 'WHO IT SERVES',
    valueTitle: 'One evidence system. Different professional needs.',
    values: [
      {
        title: 'Artists & Acts',
        body: 'Keep each act distinct, understand its evidence, and share only what supports the current conversation.',
      },
      {
        title: 'Representation',
        body: 'Work with artist permission and clearer boundaries across acts, materials, and recipient contexts.',
      },
      {
        title: 'Recipients',
        body: 'Review dated, source-aware context without receiving a ranking or an automated booking decision.',
      },
    ],
    trustLabel: 'TRUST IS A SYSTEM',
    trustTitle: 'Privacy, permission, provenance, and freshness belong in the experience.',
    trustBody:
      'A PASSPORT is not a copy of the private RADAR. It is a chosen view with bounded context. Evidence labels describe its basis where that basis is available; dates help recipients judge relevance for themselves.',
  },
  how: {
    kicker: 'RADAR → IMPROVE → PASSPORT',
    title: 'A controlled path from private work to shared context.',
    lead:
      'LOCK SHOW separates private preparation from external sharing so artists can work honestly without turning every gap into public judgment.',
    steps: [
      {
        label: 'PRIVATE',
        title: 'Build the RADAR',
        body: 'Add professional material, connect it to the right act, and review what the available evidence can support.',
      },
      {
        label: 'ACTIONABLE',
        title: 'Choose what to improve',
        body: 'Use private signals to decide whether to add context, request confirmation, refresh a source, or leave something unpublished.',
      },
      {
        label: 'PERMISSIONED',
        title: 'Prepare a PASSPORT',
        body: 'Select relevant material for a recipient and sharing context. Publication and access remain separate choices.',
      },
      {
        label: 'CURRENT',
        title: 'Keep context fresh',
        body: 'Dates and source labels help show when information was supplied or reviewed, without implying certainty about the future.',
      },
    ],
    boundaryTitle: 'What the workflow does not do',
    boundaryBody:
      'It does not create a public artist ranking, certify talent, set a market price, predict demand, or promise a booking.',
  },
  artists: {
    kicker: 'FOR ARTISTS & ACTS',
    title: 'Build context without turning yourself into a score.',
    lead:
      'Your professional history deserves structure, boundaries, and room to evolve. LOCK SHOW keeps private work private until you choose a sharing context.',
    values: [
      {
        title: 'Separate every act',
        body: 'Evidence belongs to the act it describes. A new act begins with its own context rather than inheriting another project’s history.',
      },
      {
        title: 'Work privately',
        body: 'RADAR can hold supported items, open questions, and next actions without exposing gaps to the public.',
      },
      {
        title: 'Share deliberately',
        body: 'A PASSPORT contains the material you select for a particular professional purpose and recipient.',
      },
      {
        title: 'Stay current',
        body: 'Refresh evidence and context when your work changes. Older information remains dated rather than presented as timeless.',
      },
    ],
    actsTitle: 'One person can have more than one professional identity.',
    actsBody:
      'LOCK SHOW treats each act as its own body of work. Evidence is not automatically transferred between projects, and recipients see only the context you choose to share.',
  },
  professionals: {
    kicker: 'FOR REPRESENTATION & RECIPIENTS',
    title: 'Useful context, with the decision left to people.',
    lead:
      'LOCK SHOW can support professional conversations around an artist or act while preserving role boundaries, permissions, and the recipient’s independent judgment.',
    values: [
      {
        title: 'Representation',
        body: 'Work within the artist’s permissions, keep acts distinct, and prepare relevant material for a specific conversation.',
      },
      {
        title: 'Booking and programming',
        body: 'Review the context an artist chose to share, including available dates and source labels, without receiving a score or recommendation.',
      },
      {
        title: 'Producers and source participants',
        body: 'When invited, respond only to the bounded item you know first-hand. A confirmation does not transfer ownership of the artist’s profile.',
      },
      {
        title: 'Other professional recipients',
        body: 'Receive a contextual view prepared for the purpose at hand, rather than unrestricted access to the artist’s private workspace.',
      },
    ],
    boundaryTitle: 'Bounded value, not automated judgment.',
    boundaryBody:
      'LOCK SHOW organizes and labels context. It does not decide whom to represent, program, hire, or book, and it does not guarantee commercial outcomes.',
  },
  trust: {
    kicker: 'PRIVACY · PERMISSION · PROVENANCE · FRESHNESS',
    title: 'Trust comes from visible boundaries.',
    lead:
      'LOCK SHOW is designed to distinguish private work from shared material and to make the basis and age of evidence easier to understand.',
    values: [
      {
        title: 'Private by default',
        body: 'RADAR is a private workspace. Its contents do not become a public PASSPORT automatically.',
      },
      {
        title: 'Permissioned sharing',
        body: 'The artist or authorized collaborator chooses what to include and the context in which it is shared.',
      },
      {
        title: 'Provenance labels',
        body: 'Where available, an item can show whether it was self-reported, source-linked, counterparty-confirmed, or reviewed through an applicable process.',
      },
      {
        title: 'Human judgment remains',
        body: 'Labels help a recipient interpret evidence. They do not convert it into a score, certification, or decision.',
      },
    ],
    freshnessTitle: 'Freshness is context, not a promise.',
    freshnessBody:
      'Dates indicate when evidence was supplied, confirmed, or reviewed where applicable. Recipients still decide whether it is relevant to the current opportunity.',
  },
  faq: {
    kicker: 'STRAIGHT ANSWERS',
    title: 'What LOCK SHOW is—and what it is not.',
    lead: 'The public explanation stays intentionally bounded while early access and evidence methods continue to develop.',
    items: [
      {
        question: 'What is LOCK SHOW?',
        answer: 'A professional evidence workspace for artists and acts: private RADAR, guided improvement, and permissioned PASSPORT sharing.',
      },
      {
        question: 'Is RADAR public?',
        answer: 'No. RADAR is private. A PASSPORT is a separate, contextual view that the artist or an authorized collaborator chooses to share.',
      },
      {
        question: 'What is a PASSPORT?',
        answer: 'A permissioned view of selected professional evidence prepared for a recipient or professional context. It is not a score or certification.',
      },
      {
        question: 'Does LOCK SHOW rank artists?',
        answer: 'No. There is no public artist ranking, percentile, bookability score, or automated recommendation.',
      },
      {
        question: 'Does it guarantee bookings?',
        answer: 'No. Evidence can support a conversation, but it cannot guarantee demand, suitability, income, or a booking outcome.',
      },
      {
        question: 'Who can receive a PASSPORT?',
        answer: 'A recipient selected for a professional context, such as representation, booking, programming, production, or another bounded collaboration.',
      },
      {
        question: 'How is evidence described?',
        answer: 'Where applicable, items can carry source, method, and date context. The label describes the basis available; it does not claim universal verification.',
      },
      {
        question: 'How does early access work?',
        answer: 'Submit your role and email. LOCK SHOW may contact you if a suitable early-access path is available. Submission is not a promise of timing or admission.',
      },
    ],
  },
  sample: {
    kicker: 'ILLUSTRATIVE PASSPORT',
    title: 'A contextual view—not a public grade.',
    lead: 'This simplified example shows the structure of a PASSPORT without representing a real artist, venue, event, or Product release commitment.',
    notice: 'FICTIONAL EXAMPLE · NO REAL ARTIST OR VENUE DATA',
    items: [
      { title: 'Context', body: 'Prepared for a selected professional conversation and recipient.' },
      { title: 'Evidence basis', body: 'Items can show a source or method label where applicable.' },
      { title: 'Freshness', body: 'Dates help the recipient judge whether the information is current enough for their purpose.' },
      { title: 'Control', body: 'Only selected information is included; private RADAR content remains outside the shared view.' },
    ],
  },
  form: {
    kicker: 'EARLY ACCESS',
    title: 'Request a conversation about early access.',
    lead: 'Share the minimum information we need to understand your role. Submission does not guarantee access or timing.',
    email: 'Email address',
    role: 'Your role',
    rolePrompt: 'Select a role',
    roles: [
      { value: 'artist', label: 'Artist / Act' },
      { value: 'artist_manager', label: 'Representation' },
      { value: 'booking_manager', label: 'Booking / Programming' },
      { value: 'producer', label: 'Producer' },
      { value: 'other', label: 'Other professional role' },
    ],
    consent: 'I ask LOCK SHOW to contact me about this early-access request.',
    submit: 'Request early access',
    sending: 'Sending request…',
    successTitle: 'Request received.',
    successBody: 'Thank you. We will use these details only to assess and respond to this request under the Privacy Policy.',
    duplicateTitle: 'This email is already recorded.',
    duplicateBody: 'There is no need to submit it again. Existing requests remain subject to the same early-access review.',
    error: 'The request could not be recorded. Your entries remain here; please try again.',
    privacy: 'Privacy Policy',
  },
}

const he: MarketingCopy = {
  nav: {
    home: 'בית',
    how: 'איך זה עובד',
    artists: 'אמנים והרכבים',
    professionals: 'אנשי מקצוע',
    trust: 'אמון ופרטיות',
    faq: 'שאלות נפוצות',
    earlyAccess: 'בקשת גישה מוקדמת',
    login: 'כניסה למוזמנים',
    openMenu: 'פתיחת תפריט',
    closeMenu: 'סגירת תפריט',
    switchLanguage: 'EN',
  },
  common: {
    eyebrow: 'LOCK SHOW',
    primaryCta: 'בקשת גישה מוקדמת',
    secondaryCta: 'איך זה עובד',
    privacyLine: 'פרטי כברירת מחדל. משותף בהרשאה. מוצג בהקשר.',
    disclaimer: 'LOCK SHOW אינו מדרג אמנים, חוזה הזמנות או מבטיח תוצאות.',
    earlyTitle: 'גישה מוקדמת, עם ציפיות ברורות.',
    earlyBody: 'ספרו לנו מה תפקידכם והשאירו כתובת דוא״ל. נשתמש בבקשה כדי לבדוק התאמה וליצור קשר אם יהיה מסלול גישה מוקדמת מתאים.',
  },
  home: {
    kicker: 'מודיעין פרטי · הוכחות בהרשאה',
    title: 'להפוך את העולם המקצועי שלכם לברור יותר.',
    lead: 'LOCK SHOW עוזר לאמנים ולהרכבים לארגן הוכחות מקצועיות בפרטיות, לבחור מה לחזק ולשתף PASSPORT עדכני והקשרי עם נמענים נבחרים.',
    problemLabel: 'הבעיה המקצועית',
    problemTitle: 'מידע שימושי מפוזר לעיתים בין מערכות, מתיישן או מאבד הקשר.',
    problemBody: 'היסטוריית הופעות, קובצי מקור, אישורים ומידע מעשי עשויים להישמר במקומות ובשיחות שונות. LOCK SHOW מרכז אותם בתהליך נשלט, בלי להפוך אותם לציון ציבורי.',
    flowLabel: 'התהליך',
    flowTitle: 'RADAR → IMPROVE → PASSPORT',
    flow: [
      { label: '01 · מאחורי הקלעים', title: 'RADAR', body: 'איסוף ובחינה של הוכחות בסביבת עבודה פרטית. RADAR אינו פרופיל ציבורי.' },
      { label: '02 · אות', title: 'IMPROVE', body: 'הבנה של מה נתמך, מה דורש תשומת לב ובחירה במה לעבוד בהמשך.' },
      { label: '03 · במה', title: 'PASSPORT', body: 'יצירת תצוגה הקשרית ובהרשאה לנמען נבחר. אתם שולטים במה שנכלל.' },
    ],
    valueLabel: 'למי זה מיועד',
    valueTitle: 'מערכת הוכחות אחת. צרכים מקצועיים שונים.',
    values: [
      { title: 'אמנים והרכבים', body: 'לשמור כל הרכב בנפרד, להבין את בסיס ההוכחות שלו ולשתף רק מה שמתאים לשיחה הנוכחית.' },
      { title: 'ייצוג', body: 'לעבוד בהרשאת האמן ועם גבולות ברורים יותר בין הרכבים, חומרים והקשרים של נמענים.' },
      { title: 'נמענים מקצועיים', body: 'לעיין במידע מתוארך ובעל מקור, ללא דירוג או החלטת הזמנה אוטומטית.' },
    ],
    trustLabel: 'אמון הוא מערכת',
    trustTitle: 'פרטיות, הרשאה, מקור ועדכניות הם חלק מהחוויה.',
    trustBody: 'PASSPORT אינו עותק של ה‑RADAR הפרטי. זו תצוגה נבחרת ובהקשר מוגדר. תוויות מתארות את בסיס ההוכחה כאשר הוא זמין, ותאריכים מאפשרים לנמען לשפוט את הרלוונטיות בעצמו.',
  },
  how: {
    kicker: 'RADAR → IMPROVE → PASSPORT',
    title: 'מסלול נשלט מעבודה פרטית להקשר משותף.',
    lead: 'LOCK SHOW מפריד בין הכנה פרטית לשיתוף חיצוני, כדי שאמנים יוכלו לעבוד בכנות בלי להפוך כל פער לשיפוט ציבורי.',
    steps: [
      { label: 'פרטי', title: 'בניית ה‑RADAR', body: 'הוספת חומר מקצועי, שיוכו להרכב המתאים ובחינה של מה שההוכחות הזמינות יכולות לתמוך בו.' },
      { label: 'מעשי', title: 'בחירה במה לשפר', body: 'שימוש באותות פרטיים כדי להחליט אם להוסיף הקשר, לבקש אישור, לרענן מקור או להשאיר פריט לא מפורסם.' },
      { label: 'בהרשאה', title: 'הכנת PASSPORT', body: 'בחירת חומר רלוונטי לנמען ולהקשר השיתוף. פרסום וגישה נשארים בחירות נפרדות.' },
      { label: 'עדכני', title: 'שמירת ההקשר רענן', body: 'תאריכים ותוויות מקור מסייעים להראות מתי המידע סופק או נבדק, בלי לרמוז על ודאות לגבי העתיד.' },
    ],
    boundaryTitle: 'מה התהליך אינו עושה',
    boundaryBody: 'הוא אינו יוצר דירוג ציבורי, מסמיך כישרון, קובע מחיר שוק, חוזה ביקוש או מבטיח הזמנה.',
  },
  artists: {
    kicker: 'לאמנים ולהרכבים',
    title: 'לבנות הקשר בלי להפוך את עצמכם לציון.',
    lead: 'ההיסטוריה המקצועית שלכם ראויה למבנה, לגבולות ולמקום להתפתח. LOCK SHOW שומר את העבודה הפרטית בפרטיות עד שתבחרו הקשר שיתוף.',
    values: [
      { title: 'הפרדה בין הרכבים', body: 'הוכחה שייכת להרכב שהיא מתארת. הרכב חדש מתחיל עם הקשר משלו ואינו יורש אוטומטית היסטוריה של פרויקט אחר.' },
      { title: 'עבודה בפרטיות', body: 'RADAR יכול להכיל פריטים נתמכים, שאלות פתוחות וצעדים הבאים בלי לחשוף פערים לציבור.' },
      { title: 'שיתוף מכוון', body: 'PASSPORT כולל את החומר שבחרתם למטרה מקצועית ולנמען מסוימים.' },
      { title: 'שמירה על עדכניות', body: 'רעננו הוכחות והקשר כשהעבודה משתנה. מידע ישן נשאר מתוארך ואינו מוצג כנצחי.' },
    ],
    actsTitle: 'לאדם אחד יכולה להיות יותר מזהות מקצועית אחת.',
    actsBody: 'LOCK SHOW מתייחס לכל הרכב כגוף עבודה נפרד. הוכחות אינן עוברות אוטומטית בין פרויקטים, ונמענים רואים רק את ההקשר שבחרתם לשתף.',
  },
  professionals: {
    kicker: 'לייצוג ולנמענים מקצועיים',
    title: 'הקשר שימושי, כשההחלטה נשארת בידי אנשים.',
    lead: 'LOCK SHOW יכול לתמוך בשיחות מקצועיות סביב אמן או הרכב, תוך שמירה על גבולות תפקיד, הרשאות ושיקול הדעת העצמאי של הנמען.',
    values: [
      { title: 'ייצוג', body: 'לעבוד במסגרת הרשאות האמן, לשמור הרכבים נפרדים ולהכין חומר רלוונטי לשיחה מסוימת.' },
      { title: 'הזמנות ותוכן', body: 'לעיין בהקשר שהאמן בחר לשתף, כולל תאריכים ותוויות מקור זמינים, בלי לקבל ציון או המלצה.' },
      { title: 'מפיקים ומשתתפי מקור', body: 'כאשר מוזמנים, להגיב רק לפריט המוגדר שאתם מכירים ממקור ראשון. אישור אינו מעביר בעלות על פרופיל האמן.' },
      { title: 'נמענים מקצועיים נוספים', body: 'לקבל תצוגה הקשרית שהוכנה למטרה הנוכחית, במקום גישה בלתי מוגבלת לסביבת העבודה הפרטית של האמן.' },
    ],
    boundaryTitle: 'ערך מוגדר, לא שיפוט אוטומטי.',
    boundaryBody: 'LOCK SHOW מארגן ומתייג הקשר. הוא אינו מחליט את מי לייצג, לתכנת, להעסיק או להזמין, ואינו מבטיח תוצאה מסחרית.',
  },
  trust: {
    kicker: 'פרטיות · הרשאה · מקור · עדכניות',
    title: 'אמון נבנה מגבולות גלויים.',
    lead: 'LOCK SHOW נועד להבחין בין עבודה פרטית לחומר משותף, ולהקל על הבנת הבסיס והגיל של הוכחות.',
    values: [
      { title: 'פרטי כברירת מחדל', body: 'RADAR הוא סביבת עבודה פרטית. התוכן שבו אינו הופך אוטומטית ל‑PASSPORT ציבורי.' },
      { title: 'שיתוף בהרשאה', body: 'האמן או משתף פעולה מורשה בוחר מה לכלול ובאיזה הקשר לשתף.' },
      { title: 'תוויות מקור', body: 'כאשר זמין, פריט יכול לציין אם דווח עצמאית, קושר למקור, אושר בידי צד קשור או נבדק בתהליך מתאים.' },
      { title: 'שיקול דעת אנושי', body: 'תוויות עוזרות לנמען לפרש הוכחה. הן אינן הופכות אותה לציון, להסמכה או להחלטה.' },
    ],
    freshnessTitle: 'עדכניות היא הקשר, לא הבטחה.',
    freshnessBody: 'תאריכים מציינים מתי הוכחה סופקה, אושרה או נבדקה כאשר הדבר רלוונטי. הנמען עדיין מחליט אם היא מתאימה להזדמנות הנוכחית.',
  },
  faq: {
    kicker: 'תשובות ברורות',
    title: 'מהו LOCK SHOW—ומה הוא אינו.',
    lead: 'ההסבר הציבורי נשאר מוגדר וזהיר בזמן שמסלולי הגישה המוקדמת ושיטות ההוכחה ממשיכים להתפתח.',
    items: [
      { question: 'מהו LOCK SHOW?', answer: 'סביבת עבודה להוכחות מקצועיות לאמנים ולהרכבים: RADAR פרטי, שיפור מונחה ושיתוף PASSPORT בהרשאה.' },
      { question: 'האם RADAR ציבורי?', answer: 'לא. RADAR הוא פרטי. PASSPORT הוא תצוגה נפרדת והקשרית שהאמן או משתף פעולה מורשה בוחר לשתף.' },
      { question: 'מהו PASSPORT?', answer: 'תצוגה בהרשאה של הוכחות מקצועיות נבחרות, שהוכנה לנמען או להקשר מקצועי. אין מדובר בציון או בהסמכה.' },
      { question: 'האם LOCK SHOW מדרג אמנים?', answer: 'לא. אין דירוג ציבורי, אחוזון, ציון התאמה להזמנה או המלצה אוטומטית.' },
      { question: 'האם המערכת מבטיחה הזמנות?', answer: 'לא. הוכחות יכולות לתמוך בשיחה, אך אינן מבטיחות ביקוש, התאמה, הכנסה או תוצאת הזמנה.' },
      { question: 'מי יכול לקבל PASSPORT?', answer: 'נמען שנבחר להקשר מקצועי, כגון ייצוג, הזמנה, תכנות, הפקה או שיתוף פעולה מוגדר אחר.' },
      { question: 'כיצד מתוארות הוכחות?', answer: 'כאשר מתאים, פריטים יכולים לשאת הקשר של מקור, שיטה ותאריך. התווית מתארת את הבסיס הזמין ואינה טוענת לאימות אוניברסלי.' },
      { question: 'איך עובדת הגישה המוקדמת?', answer: 'שולחים תפקיד ודוא״ל. LOCK SHOW עשוי ליצור קשר אם יהיה מסלול מתאים. השליחה אינה הבטחה למועד או לקבלה.' },
    ],
  },
  sample: {
    kicker: 'PASSPORT להמחשה',
    title: 'תצוגה הקשרית—לא ציון ציבורי.',
    lead: 'הדוגמה הפשוטה מציגה את מבנה ה‑PASSPORT בלי לייצג אמן, מקום, אירוע או התחייבות למוצר אמיתיים.',
    notice: 'דוגמה בדיונית · ללא מידע של אמן או מקום אמיתיים',
    items: [
      { title: 'הקשר', body: 'מוכן לשיחה מקצועית ולנמען נבחרים.' },
      { title: 'בסיס ההוכחה', body: 'פריטים יכולים להציג תווית מקור או שיטה כאשר הדבר מתאים.' },
      { title: 'עדכניות', body: 'תאריכים עוזרים לנמען לשפוט אם המידע עדכני מספיק למטרתו.' },
      { title: 'שליטה', body: 'רק מידע נבחר נכלל; תוכן ה‑RADAR הפרטי נשאר מחוץ לתצוגה המשותפת.' },
    ],
  },
  form: {
    kicker: 'גישה מוקדמת',
    title: 'בקשת שיחה על גישה מוקדמת.',
    lead: 'שתפו רק את המידע המינימלי הדרוש להבנת תפקידכם. השליחה אינה מבטיחה גישה או מועד.',
    email: 'כתובת דוא״ל',
    role: 'התפקיד שלכם',
    rolePrompt: 'בחירת תפקיד',
    roles: [
      { value: 'artist', label: 'אמן / הרכב' },
      { value: 'artist_manager', label: 'ייצוג' },
      { value: 'booking_manager', label: 'הזמנות / תוכן' },
      { value: 'producer', label: 'מפיק' },
      { value: 'other', label: 'תפקיד מקצועי אחר' },
    ],
    consent: 'אני מבקש/ת מ‑LOCK SHOW ליצור איתי קשר בנוגע לבקשת הגישה המוקדמת הזו.',
    submit: 'בקשת גישה מוקדמת',
    sending: 'הבקשה נשלחת…',
    successTitle: 'הבקשה התקבלה.',
    successBody: 'תודה. נשתמש בפרטים רק כדי לבחון ולהשיב לבקשה זו בהתאם למדיניות הפרטיות.',
    duplicateTitle: 'כתובת הדוא״ל הזו כבר רשומה.',
    duplicateBody: 'אין צורך לשלוח שוב. בקשות קיימות כפופות לאותה בחינת גישה מוקדמת.',
    error: 'לא הצלחנו לרשום את הבקשה. הפרטים נשארו בטופס; אפשר לנסות שוב.',
    privacy: 'מדיניות פרטיות',
  },
}

export const marketingCopy: Record<MarketingLocale, MarketingCopy> = { en, he }
