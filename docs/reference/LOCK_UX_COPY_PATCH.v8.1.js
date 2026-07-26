(function installLockUxCopyPatchV85() {
  const exactReplacements = new Map([
    ['What brings you to LOCK?', 'What do you want to do first?'],
    ['Choose the goal you want to move forward first.', 'Choose one starting point. You can add another workspace later.'],
    ['Advance my artist career', 'Build my artist profile'],
    ["Turn everything you've built into bookings.", 'Bring your music, links and live activity into one private Radar.'],
    ['Advance my career →', 'Start with my artist profile →'],
    ['Move my artists forward', 'Manage my artists'],
    ["One clear view of every artist's next move.", 'Track approved proof, open requests and next actions for each artist.'],
    ['Shape a stronger event or lineup', 'Plan an event or lineup'],
    ['Fit, availability, and production — one view.', 'Review artist fit, missing information and the next request.'],
    ['Start your universe', 'Start your artist profile'],
    ['Your name plus one link or one profile is enough. LOCK does the digging.', 'Add the act name and one reliable profile. Nothing is shared until you publish.'],
    ['Act / stage name', 'Act or stage name'],
    ['One link or profile', 'Starting profile or source link'],
    ['Your genre', 'Main context'],
    ['Find my footprint', 'Find my profiles'],
    ['Everything LOCK finds stays private until you say otherwise.', 'Everything stays private until you choose a Passport view.'],
    ['YOUR WORKSPACES', 'Workspaces'],
    ['Artist — SHIDAPU', 'Artist workspace — SHIDAPU'],
    ['Admin / operator', 'Operations workspace'],
    ['Buyers arrive by link — never through this hub.', 'Shared Passport links open outside this private workspace.'],
    ['DEMO', 'Prototype'],
    ['FREE BETA', 'Beta access'],
    ['Design system', 'LOCK visual language'],
    ['Every component, every state — all token-driven. Swap the skin and this whole page follows.', 'One governed visual system for surfaces, text, states, controls and process screens.'],
    ['FULL PALETTE · STATUS & BRAND', 'COLOR MEANING · DO NOT DUPLICATE'],
    ['TYPOGRAPHY', 'TYPE SCALE'],
    ['Forest ink #18221A', 'Core ink #18221A'],
    ['Forest ink #18221A · 70% for secondary — no status tints here', 'Core ink #18221A · 70% for secondary — no status tints here'],
    ['SOURCE CONFIRMER · FROZEN ❄', 'SOURCE CONFIRMATION'],
    ['❄ FROZEN ENTITY — kept in the prototype for reference, not part of the current build scope.', 'Source request from Roy — review one claim only.'],
    ['20-SECOND FAVOR · NO ACCOUNT NEEDED', 'ONE CLAIM TO REVIEW'],
    ["You're only being asked about one detail", 'Can you confirm this specific detail?'],
    ['Roy Sason (SHIDAPU) says:', 'Request from Roy Sason (SHIDAPU):'],
    ["Yes, that's correct", 'Confirm this detail'],
    ["Confirmations carry weight only from a verified profile — you'll verify via the platform you were contacted on.", 'Your answer updates only this claim. It does not create an account or publish anything new.'],
    ['Confirmations carry weight only from a verified profile', 'Your answer updates only this claim. It does not create an account or publish anything new.'],
    ['Partly correct — let me fix a detail', 'Correct one detail'],
    ["No, this isn't right", 'This is not correct'],
    ['Not you? Tell us once', 'This is not me'],
    ["Can't assess this", "I can't confirm"],
    ['You already answered this', 'Already answered'],
    ['Thank you — nothing else is needed.', 'Your previous answer is saved. No further action is needed.'],
    ["Got it — we'll stop asking", 'Request closed'],
    ["You won't receive this request again.", 'This does not affect your account or create a LOCK profile.']
  ]);

  const inputNames = [
    ['Email', 'Email address'],
    ['Password', 'Password'],
    ['SHIDAPU', 'Act or stage name'],
    ['https://open.spotify.com/artist/2dyHRCN7XKy', 'Starting source link']
  ];

  function textOf(el) {
    return (el?.innerText || el?.textContent || '').trim().replace(/\s+/g, ' ');
  }

  function replaceTextNode(node) {
    let raw = node.nodeValue;
    const normalizedRaw = raw
      .split('ג€”').join('—')
      .split('ג€“').join('–')
      .split('ג†’').join('→')
      .split('ג†‘').join('↑')
      .split('ג€¦').join('…')
      .split('ג‰¥').join('≥')
      .split('ג“').join('✓')
      .split('ג').join('✎')
      .split('ג‹').join('⌕')
      .split('ג—').join('●')
      .split('ג—').join('◐')
      .split('ג—‹').join('○')
      .split('ג—¾').join('▾')
      .split('ג–¾').join('▾')
      .split('ג•').join('×')
      .split('ג„').join('')
      .split('ן¼‹').join('+')
      .split('ֲ·').join('·')
      .split('ֳ—').join('×')
      .split('ֳ¶').join('o')
      .split('N.Söf').join('N.Sof')
      .split('N.Sֳ¶f').join('N.Sof');
    if (normalizedRaw !== raw) {
      node.nodeValue = normalizedRaw;
      raw = normalizedRaw;
    }
    const trimmed = raw.trim();
    if (!trimmed) return;

    if (exactReplacements.has(trimmed)) {
      node.nodeValue = raw.replace(trimmed, exactReplacements.get(trimmed));
      return;
    }

    for (const [from, to] of exactReplacements.entries()) {
      if (raw.includes(from)) node.nodeValue = raw.split(from).join(to);
    }

    const simplified = trimmed
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .toLowerCase();

    if (simplified.includes('source confirmer') && simplified.includes('frozen')) {
      node.nodeValue = raw.replace(trimmed, 'SOURCE CONFIRMATION');
    }
    if (simplified.includes('full palette') && simplified.includes('status') && simplified.includes('brand')) {
      node.nodeValue = raw.replace(trimmed, 'COLOR MEANING · DO NOT DUPLICATE');
    }
    if (simplified === 'design system') {
      node.nodeValue = raw.replace(trimmed, 'LOCK visual language');
    }
    if (simplified.includes('every component') && simplified.includes('token driven') && simplified.includes('swap')) {
      node.nodeValue = raw.replace(trimmed, 'One governed visual system for surfaces, text, states, controls and process screens.');
    }
  }

  function walkText(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(replaceTextNode);
  }

  function patchControls(root) {
    root.querySelectorAll('input, textarea').forEach((el) => {
      const value = el.value || el.getAttribute('placeholder') || '';
      const match = inputNames.find(([needle]) => value.includes(needle));
      if (match && !el.getAttribute('aria-label')) el.setAttribute('aria-label', match[1]);
      el.setAttribute('autocomplete', el.type === 'password' ? 'current-password' : 'off');
    });

    root.querySelectorAll('button').forEach((button) => {
      const label = textOf(button);
      if (!button.getAttribute('aria-label') && label) button.setAttribute('aria-label', label);
    });
  }

  function patchShellLabels(root) {
    root.querySelectorAll('div, span').forEach((el) => {
      const label = textOf(el);
      const simple = label.toLowerCase();
      if (simple.includes('source confirmer') && simple.includes('frozen') && label.length < 60) {
        el.textContent = 'SOURCE CONFIRMATION';
      }
    });
  }

  function installDesignLanguageBoard(root) {
    if (!root.innerText.includes('LOCK visual language')) return;
    if (root.querySelector('.lock-v82-brand-board')) return;
    const title = Array.from(root.querySelectorAll('div')).find((el) => textOf(el) === 'LOCK visual language');
    if (!title || !title.parentElement) return;
    const intro = title.nextElementSibling;
    const board = document.createElement('section');
    board.className = 'lock-v82-brand-board';
    board.setAttribute('aria-label', 'LOCK visual language rules');
    board.innerHTML = [
      '<div class="lock-v82-brand-board__title">Graphic language rules</div>',
      '<div class="lock-v82-brand-board__grid">',
      '<div class="lock-v82-brand-rule"><strong>No border</strong><span>Use for pure reading sections when spacing already separates the content.</span></div>',
      '<div class="lock-v82-brand-rule"><strong>8px controls</strong><span>Buttons, tabs, fields and chips. Sharp, usable, never bubbly.</span></div>',
      '<div class="lock-v82-brand-rule"><strong>10–12px cards</strong><span>Evidence cards, menus and sheets only when a surface needs containment.</span></div>',
      '<div class="lock-v82-brand-rule"><strong>One meaning per color</strong><span>Lime action, mint evidence, amber review, red danger. No duplicate signals.</span></div>',
      '</div>'
    ].join('');
    (intro || title).insertAdjacentElement('afterend', board);
  }

  function installReducedColorSystem(root) {
    if (!root.innerText.includes('LOCK visual language')) return;
    const heading = Array.from(root.querySelectorAll('div')).find((el) => textOf(el) === 'COLOR MEANING · DO NOT DUPLICATE');
    if (!heading) return;

    let current = heading.nextElementSibling;
    while (current && current.classList && current.classList.contains('lock-v83-color-system')) return;

    const system = document.createElement('section');
    system.className = 'lock-v83-color-system';
    system.setAttribute('aria-label', 'LOCK reduced color system');
    system.innerHTML = [
      '<div class="lock-v83-color-row">',
      '<div class="lock-v83-color-card lock-v83-color-card--dark"><strong>Core dark</strong><span>Main product background, nav and high-trust stage.</span></div>',
      '<div class="lock-v83-color-card lock-v83-color-card--paper"><strong>Paper</strong><span>Readable public proof, review, export and shell surfaces.</span></div>',
      '</div>',
      '<div class="lock-v83-color-row">',
      '<div class="lock-v83-color-card lock-v83-color-card--lime"><strong>Lime · action</strong><span>One primary CTA or selected priority per view.</span></div>',
      '<div class="lock-v83-color-card lock-v83-color-card--mint"><strong>Mint · supported</strong><span>Evidence recognized, confirmed or source-backed.</span></div>',
      '</div>',
      '<div class="lock-v83-color-row">',
      '<div class="lock-v83-color-card lock-v83-color-card--amber"><strong>Amber · review</strong><span>Needs decision, stale item, conflict or missing proof.</span></div>',
      '<div class="lock-v83-color-card lock-v83-color-card--danger"><strong>Red · danger</strong><span>Error, destructive action, decline or irreversible risk.</span></div>',
      '</div>',
      '<div class="lock-v83-color-note"><strong>Reserved:</strong> chart colors are not interface colors. Use extra chart colors only when several data series must be separated, and never reuse them as product states.</div>'
    ].join('');

    const oldGrid = heading.nextElementSibling;
    if (oldGrid) oldGrid.replaceWith(system);
    else heading.insertAdjacentElement('afterend', system);
  }

  function installUnifiedSurfaceTextTokens(root) {
    if (!root.innerText.includes('LOCK visual language')) return;
    const heading = Array.from(root.querySelectorAll('div')).find((el) => {
      const text = textOf(el);
      return text === 'TOKENS · SURFACES & TEXT' || text === 'TOKENS ֲ· SURFACES & TEXT';
    });
    if (!heading) return;

    const existing = heading.nextElementSibling;
    if (existing && existing.classList && existing.classList.contains('lock-v86-surface-text-system')) return;

    const system = document.createElement('section');
    system.className = 'lock-v86-surface-text-system';
    system.setAttribute('aria-label', 'LOCK surface and text token contracts');
    system.innerHTML = [
      '<div class="lock-v86-token-group">',
      '<div class="lock-v86-token-group__label">Foundation surfaces</div>',
      '<div class="lock-v86-token-list">',
      '<div class="lock-v86-token-row"><span class="lock-v86-token-swatch lock-v86-token-swatch--app"></span><strong>App background</strong><em>One dark stage behind the phone and navigation.</em></div>',
      '<div class="lock-v86-token-row"><span class="lock-v86-token-swatch lock-v86-token-swatch--surface"></span><strong>Surface</strong><em>Default card, menu, modal or workflow container.</em></div>',
      '<div class="lock-v86-token-row"><span class="lock-v86-token-swatch lock-v86-token-swatch--sheet"></span><strong>Sheet</strong><em>Focused task layer: forms, drawers and decision panels.</em></div>',
      '<div class="lock-v86-token-row"><span class="lock-v86-token-swatch lock-v86-token-swatch--paper"></span><strong>Paper</strong><em>Public Passport, export, receipt or proof preview.</em></div>',
      '</div>',
      '</div>',
      '<div class="lock-v86-token-group">',
      '<div class="lock-v86-token-group__label">Text hierarchy</div>',
      '<div class="lock-v86-token-list">',
      '<div class="lock-v86-token-row"><span class="lock-v86-type-sample lock-v86-type-sample--main">Aa</span><strong>Primary text</strong><em>Titles, decisions and readable body copy.</em></div>',
      '<div class="lock-v86-token-row"><span class="lock-v86-type-sample lock-v86-type-sample--soft">Aa</span><strong>Secondary text</strong><em>Support copy, helper notes and descriptions.</em></div>',
      '<div class="lock-v86-token-row"><span class="lock-v86-type-sample lock-v86-type-sample--meta">Aa</span><strong>Metadata</strong><em>Source labels, timestamps and method tags only.</em></div>',
      '<div class="lock-v86-token-row"><span class="lock-v86-type-sample lock-v86-type-sample--disabled">Aa</span><strong>Disabled</strong><em>Unavailable actions; never used for real content.</em></div>',
      '</div>',
      '</div>',
      '<div class="lock-v86-token-note">Rule: screens use meaning-based tokens only. No tint behind paragraphs or labels; color appears as a controlled marker, swatch, border or primary action.</div>'
    ].join('');

    if (existing) existing.replaceWith(system);
    else heading.insertAdjacentElement('afterend', system);
  }

  function installUnifiedContrastRules(root) {
    if (!root.innerText.includes('LOCK visual language')) return;
    const heading = Array.from(root.querySelectorAll('div')).find((el) => {
      const text = textOf(el);
      return text.includes('CONTRAST RULES') && text.length < 80;
    });
    if (!heading) return;

    const existing = heading.nextElementSibling;
    if (existing && existing.classList && existing.classList.contains('lock-v86-contrast-system')) return;

    const system = document.createElement('section');
    system.className = 'lock-v86-contrast-system';
    system.setAttribute('aria-label', 'LOCK approved contrast rules');
    system.innerHTML = [
      '<div class="lock-v86-contrast-row"><strong>Dark app surfaces</strong><span>Primary text, secondary text and metadata only. Metadata must stay 11px or larger.</span></div>',
      '<div class="lock-v86-contrast-row lock-v86-contrast-row--action"><strong>Lime action</strong><span>Use dark on-accent text only. Never place white or gray text on lime.</span></div>',
      '<div class="lock-v86-contrast-row"><strong>Status color</strong><span>Use as a marker, border or icon. Do not place a tint panel behind readable text.</span></div>',
      '<div class="lock-v86-contrast-row lock-v86-contrast-row--paper"><strong>Paper</strong><span>Use core ink for primary and softened core ink for secondary. No status backgrounds.</span></div>',
      '<div class="lock-v86-contrast-row lock-v86-contrast-row--danger"><strong>Danger</strong><span>Use red for destructive or rejection states only, with a clear escape route.</span></div>',
      '<div class="lock-v86-contrast-row"><strong>Inputs</strong><span>Values stay high contrast; placeholders stay visibly secondary, never disabled-gray.</span></div>'
    ].join('');

    if (existing) existing.replaceWith(system);
    else heading.insertAdjacentElement('afterend', system);
  }

  function installPlatformLogoAppendix(root) {
    if (!root.innerText.includes('LOCK visual language')) return;
    const anchor = Array.from(root.querySelectorAll('div')).find((el) => textOf(el) === 'TOKENS · SURFACES & TEXT');
    if (!anchor) return;
    if (root.querySelector('.lock-v812-platform-logo-appendix')) return;

    const appendix = document.createElement('section');
    appendix.className = 'lock-v812-platform-logo-appendix';
    appendix.setAttribute('aria-label', 'Artist universe platform logo appendix');
    appendix.innerHTML = [
      '<div class="lock-v812-platform-logo-appendix__head">',
      '<span>PLATFORM LOGOS · ARTIST UNIVERSE</span>',
      '<strong>Use real platform marks. Use state, not lemon fill.</strong>',
      '<em>Found sources appear active. Missing sources stay passive. Navigation never borrows the primary CTA color.</em>',
      '</div>',
      '<div class="lock-v812-platform-logo-grid">',
      '<span data-platform="spotify" data-state="active">Spotify</span>',
      '<span data-platform="instagram" data-state="active">Instagram</span>',
      '<span data-platform="youtube" data-state="active">YouTube</span>',
      '<span data-platform="tiktok" data-state="passive">TikTok</span>',
      '<span data-platform="apple-music" data-state="passive">Apple Music</span>',
      '<span data-platform="soundcloud" data-state="active">SoundCloud</span>',
      '<span data-platform="beatport" data-state="passive">Beatport</span>',
      '<span data-platform="bandcamp" data-state="passive">Bandcamp</span>',
      '<span data-platform="discogs" data-state="passive">Discogs</span>',
      '<span data-platform="mixcloud" data-state="passive">Mixcloud</span>',
      '<span data-platform="songkick" data-state="passive">Songkick</span>',
      '<span data-platform="bandsintown" data-state="passive">Bandsintown</span>',
      '<span data-platform="resident-advisor" data-state="passive">Resident Advisor</span>',
      '<span data-platform="ticketing" data-state="passive">Ticketing</span>',
      '</div>',
      '<div class="lock-v812-platform-logo-rule">Rule: official logo asset + platform name + state. Active means source found or connected. Passive means searched, unavailable, or not connected yet. Never use platform chips as CTA buttons.</div>'
    ].join('');

    const surfaceSystem = root.querySelector('.lock-v86-surface-text-system');
    if (surfaceSystem) surfaceSystem.insertAdjacentElement('afterend', appendix);
    else anchor.insertAdjacentElement('afterend', appendix);
  }

  function activateSourceConfirmation(root) {
    const sourceScreens = ['SOURCE CONFIRMATION', 'ONE CLAIM TO REVIEW', 'Can you confirm this specific detail?', 'Already answered', 'Request closed'];
    if (!sourceScreens.some((text) => root.innerText.includes(text))) return;

    root.querySelectorAll('div').forEach((el) => {
      const text = textOf(el);
      const rect = el.getBoundingClientRect();
      const style = el.getAttribute('style') || '';

      if (text.includes('FROZEN ENTITY') && text.length < 160) {
        el.textContent = 'Source request from Roy — review one claim only.';
        el.classList.add('lock-v87-source-kicker');
      }
      if (text === 'Source confirmation request — answer one bounded detail. No account needed.') {
        el.textContent = 'Source request from Roy — review one claim only.';
        el.classList.remove('lock-v84-source-banner');
        el.classList.add('lock-v87-source-kicker');
      }
      if (text === 'Source confirmation request — one detail, no account needed.') {
        el.textContent = 'Source request from Roy — review one claim only.';
        el.classList.add('lock-v87-source-kicker');
      }
      if (text === 'Request from Roy Sason (SHIDAPU):') {
        el.classList.add('lock-v84-source-request-label');
      }
      if (text.includes('"I performed a live set on the radiOzora Lunar 604 series in 2023."')) {
        const isActualClaimCard =
          text.length < 230 &&
          rect.width >= 300 &&
          rect.width <= 370 &&
          rect.height >= 80 &&
          rect.height <= 150 &&
          (style.includes('border-radius') || style.includes('border:'));
        if (isActualClaimCard) {
          el.classList.add('lock-v84-source-claim-card', 'lock-v87-source-claim-card');
        } else {
          el.classList.remove('lock-v84-source-claim-card', 'lock-v87-source-claim-card');
        }
      }
      if (
        text.includes('Confirmations carry weight') &&
        (el.getAttribute('style') || '').includes('font-size: 11px') &&
        (el.getAttribute('style') || '').includes('text-align: center')
      ) {
        el.textContent = 'Your answer updates only this claim. It does not create an account or publish anything new.';
        el.classList.add('lock-v84-source-privacy-note');
      }
      if (text === 'Your answer updates only this claim. It does not create an account or publish anything new.') {
        el.classList.add('lock-v84-source-privacy-note', 'lock-v87-source-privacy-note');
      }
      if (
        text.includes('Confirm this detail') &&
        text.includes('Correct one detail') &&
        text.includes("I can't confirm") &&
        text.length < 360 &&
        rect.width >= 300 &&
        rect.width <= 370
      ) {
        el.classList.add('lock-v87-source-action-stack');
      }
      if (
        text.includes('This is not me') &&
        text.includes("I can't confirm") &&
        text.length < 60 &&
        rect.width < 220
      ) {
        el.classList.add('lock-v87-source-paired-row');
      }
    });

    root.querySelectorAll('button').forEach((button) => {
      const label = textOf(button);
      if (label === 'Confirm this detail') button.classList.add('lock-v84-source-primary');
      if (label === 'Correct one detail') button.classList.add('lock-v84-source-secondary');
      if (label === 'This is not correct' || label === 'This is not me' || label === "I can't confirm") button.classList.add('lock-v84-source-safe-secondary');
      if (label === 'This is not correct') button.classList.add('lock-v87-danger-full');
    });
  }

  function refineSourceConfirmationScreen(root) {
    const phone = document.querySelector('#dc-root > .sc-host > div > div:nth-child(2) > div:nth-child(2) > div');
    if (!phone || !phone.innerText.includes('Can you confirm this specific detail?')) return;
    phone.classList.add('lock-v87-source-flow-screen');

    phone.querySelectorAll('div').forEach((el) => {
      const text = textOf(el);
      const rect = el.getBoundingClientRect();
      if (el.classList.contains('lock-v84-source-claim-card') && (text.length > 240 || rect.width > 370 || rect.height > 160)) {
        el.classList.remove('lock-v84-source-claim-card', 'lock-v87-source-claim-card');
      }
      if (text === 'ONE CLAIM TO REVIEW') {
        el.classList.add('lock-v87-source-eyebrow');
      }
      if (text === 'Can you confirm this specific detail?') {
        el.classList.add('lock-v87-source-title');
      }
    });
  }

  function tagProcessSheets(root) {
    root.querySelectorAll('div').forEach((el) => {
      const style = el.getAttribute('style') || '';
      const text = textOf(el);
      const looksLikeBottomSheet = style.includes('22px 22px 0px 0px') || style.includes('22px 22px 0 0');
      const isTaskSheet =
        looksLikeBottomSheet &&
        text.includes('New event') &&
        text.includes('Create event') &&
        text.length < 900;
      if (isTaskSheet) el.classList.add('lock-v85-process-sheet');
    });
  }

  function tagDetectedSourceChips(root) {
    const phone = document.querySelector('#dc-root > .sc-host > div > div:nth-child(2) > div:nth-child(2) > div');
    if (phone && root.innerText.includes("We're reading your public footprint")) {
      phone.classList.add('lock-v85-empty-scan-screen');
    }
    const sourceWords = ['Spotify', 'Instagram', 'SoundCloud', 'YouTube', 'Discogs', 'Beatport'];
    root.querySelectorAll('div').forEach((chip) => {
      const chipText = textOf(chip);
      if (!sourceWords.some((source) => chipText.includes(source))) return;

      const style = chip.getAttribute('style') || '';
      const rect = chip.getBoundingClientRect();
      const isActualChip =
        style.includes('border-radius: 999px') &&
        style.includes('display: flex') &&
        rect.width >= 70 &&
        rect.width <= 150 &&
        rect.height >= 30 &&
        rect.height <= 52;
      if (!isActualChip) return;

      chip.classList.remove('lock-v85-detected-source-chip', 'lock-v85-source-chip-found', 'lock-v85-source-chip-passive');
      const foundInCurrentMock = chipText.includes('Spotify') || chipText.includes('Instagram');
      const isFound = chip.dataset.lockSourceState === 'found' ||
        (!chip.dataset.lockSourceState && (foundInCurrentMock || style.includes('brand2-rgb') || style.includes('rgba(var(--brand2-rgb')));
      chip.dataset.lockSourceState = isFound ? 'found' : 'passive';
      chip.classList.add(isFound ? 'lock-v85-source-chip-found' : 'lock-v85-source-chip-passive');
      chip.style.borderRadius = '8px';
      chip.style.boxShadow = 'none';
      if (isFound) {
        chip.style.background = 'rgba(119, 231, 178, .14)';
        chip.style.border = '1px solid rgba(119, 231, 178, .36)';
        chip.style.color = 'var(--lock-text-main, #f6f8f2)';
      } else {
        chip.style.background = 'rgba(246, 248, 242, .045)';
        chip.style.border = '0';
        chip.style.color = 'var(--lock-text-muted, #8f9f92)';
      }

      chip.querySelectorAll('span').forEach((span) => {
        const spanStyle = span.getAttribute('style') || '';
        span.style.boxShadow = 'none';
        if (spanStyle.includes('width: 24px')) {
          span.style.background = isFound ? 'rgba(119, 231, 178, .20)' : 'rgba(246, 248, 242, .08)';
          span.style.color = isFound ? 'var(--lock-mint, #77e7b2)' : 'var(--lock-text-muted, #8f9f92)';
        } else if (textOf(span).length > 1) {
          span.style.background = 'transparent';
        }
      });
    });
  }

  function tagNavigationControls(root) {
    const phoneNavLabels = new Set(['Radar', 'Passport', 'Requests']);
    const stateMatch = root.innerText.match(/State\s+(\d+)\s+of\s+39/);
    const state = stateMatch ? Number(stateMatch[1]) : 0;
    const activeLabel = [4, 5, 6, 7, 8, 22, 26, 32].includes(state)
      ? 'Radar'
      : ([9, 10].includes(state) ? 'Passport' : ([11, 24].includes(state) ? 'Requests' : ''));
    root.querySelectorAll('button').forEach((button) => {
      const label = textOf(button);
      if (phoneNavLabels.has(label)) {
        button.classList.add('lock-v812-phone-nav-item');
        button.classList.toggle('lock-v812-phone-nav-item--active', label === activeLabel);
      }
    });
  }

  function tagLockBrandElements(root) {
    const phone = document.querySelector('#dc-root > .sc-host > div > div:nth-child(2) > div:nth-child(2) > div');
    if (!phone) return;
    phone.querySelectorAll('div, span').forEach((el) => {
      const text = textOf(el);
      const rect = el.getBoundingClientRect();
      if (text === 'L' && rect.width <= 42 && rect.height <= 42) {
        el.classList.add('lock-v815-brand-mark');
      }
      if (text === 'LOCK' && rect.width <= 90 && rect.height <= 34) {
        el.classList.add('lock-v815-brand-word');
      }
    });
  }

  function tagNoTintTextElements(root) {
    const noTintLabels = new Set(['SOON', "TODAY'S READ", 'SH']);
    const phone = document.querySelector('#dc-root > .sc-host > div > div:nth-child(2) > div:nth-child(2) > div');
    if (!phone) return;
    phone.querySelectorAll('div, span, p, small, label, h1, h2, h3, h4, h5, h6').forEach((el) => {
      const text = textOf(el);
      const style = getComputedStyle(el);
      const bg = style.backgroundColor || '';
      if (noTintLabels.has(text)) {
        el.classList.add('lock-v815-no-tint-text');
      }
      const hasDecorativeTint =
        bg.includes('119, 231, 178') ||
        bg.includes('111, 217, 154') ||
        bg.includes('255, 177, 94') ||
        bg.includes('201, 79, 63');
      const isReadableTextContainer = text && text.length <= 260;
      if (hasDecorativeTint && isReadableTextContainer) {
        el.classList.add('lock-v819-no-tint-leaf-text');
      }
      if (bg.includes('255, 177, 94')) {
        el.classList.add('lock-v819-no-orange-drift');
      }
    });
  }

  function normalizeRemainingEncodingGlyphs(root) {
    const replacements = [
      [/ג€”/g, '—'],
      [/ג€"/g, '—'],
      [/ג/g, '✎'],
      [/ג‹/g, '⌕'],
      [/ג€¹/g, '‹'],
      [/ג•/g, '×'],
      [/ג¨/g, 'Keyboard:'],
      [/N\.Söf/g, 'N. Sof']
    ];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      let value = node.nodeValue;
      let next = value;
      replacements.forEach(([pattern, replacement]) => {
        next = next.replace(pattern, replacement);
      });
      if (next !== value) node.nodeValue = next;
    }
  }

  function tagMetricCardButtons(root) {
    const phone = document.querySelector('#dc-root > .sc-host > div > div:nth-child(2) > div:nth-child(2) > div');
    if (!phone) return;
    phone.querySelectorAll('button').forEach((button) => {
      const label = textOf(button);
      const rect = button.getBoundingClientRect();
      const looksLikeMetricCard =
        rect.height >= 96 &&
        /%/.test(label) &&
        /(Confirmed|Developing|Found|Needs Review|Supported)/.test(label);
      if (!looksLikeMetricCard) return;
      button.classList.remove('lock-v85-btn-primary', 'lock-v85-btn-secondary', 'lock-v85-btn-quiet');
      button.classList.add('lock-v819-metric-card-button');
    });
  }

  function tagIntentChoiceCards(root) {
    const phone = document.querySelector('#dc-root > .sc-host > div > div:nth-child(2) > div:nth-child(2) > div');
    if (!phone || !phone.innerText.includes('What do you want to do first?')) return;
    const patterns = [
      ['Build my artist profile', 'artist'],
      ['Manage my artists', 'manager'],
      ['Plan an event or lineup', 'producer']
    ];
    phone.querySelectorAll('button').forEach((button) => {
      const text = textOf(button);
      const match = patterns.find(([label]) => text.includes(label));
      if (!match) return;
      button.classList.remove('lock-v85-btn-primary', 'lock-v85-btn-secondary', 'lock-v85-btn-quiet');
      button.classList.add('lock-v817-intent-card');
      button.setAttribute('data-lock-intent', match[1]);
    });
  }

  function classifyButtons(root) {
    const phone = document.querySelector('#dc-root > .sc-host > div > div:nth-child(2) > div:nth-child(2) > div');
    if (!phone) return;

    const primaryTexts = [
      'Continue',
      'Start with my artist profile',
      'Find my profiles',
      'Share Passport',
      'Copy link + promo card',
      'Track reactions',
      'Create event & get artist invite link',
      'Add this source',
      'Confirm this detail'
    ];
    const secondaryTexts = [
      'Continue with Google',
      'Share to WhatsApp',
      'Preview exactly',
      'Correct one detail',
      'Unpublish',
      'Share event link with an artist'
    ];
    const quietTexts = [
      'Skip',
      'Forgot password',
      'Radar',
      'Requests',
      'Slot detail',
      'New event'
    ];
    const optionTexts = [
      'Booker',
      'Producer',
      'Private event',
      'Representative',
      'Booking manager',
      'Production',
      'Festival',
      'Club night',
      'Party',
      'Private',
      'Corporate',
      'Psytrance',
      'Techno',
      'House',
      'Mixed',
      'Shown'
    ];
    const dangerTexts = [
      'This is not correct',
      'This is not me',
      "I can't confirm",
      'Danger'
    ];

    phone.querySelectorAll('button').forEach((button) => {
      const label = textOf(button);
      const rect = button.getBoundingClientRect();
      button.classList.remove(
        'lock-v85-btn-primary',
        'lock-v85-btn-secondary',
        'lock-v85-btn-quiet',
        'lock-v85-btn-icon',
        'lock-v85-btn-option',
        'lock-v85-btn-option-selected',
        'lock-v85-btn-danger'
      );

      if (!label) return;
      const isTiny = rect.width <= 48 && rect.height <= 48;
      const isIconLike = isTiny || ['‹', '✕', '4', 'RS'].includes(label);
      const isDanger = dangerTexts.some((text) => label.includes(text));
      const isPrimary = primaryTexts.some((text) => label.includes(text)) && !label.includes('Google') && !label.includes('Facebook');
      const isSecondary = secondaryTexts.some((text) => label.includes(text)) || label.includes('Facebook');
      const isQuiet = quietTexts.some((text) => label.includes(text));
      const isOption = optionTexts.some((text) => label === text || label.includes(text));
      const isSelectedOption = isOption && (
        (button.getAttribute('style') || '').includes('var(--select-bg') ||
        (button.getAttribute('style') || '').includes('brand2-rgb')
      );
      const isInlineUtilityAction =
        label.includes('Add link / file') ||
        label.includes('New event') ||
        label.includes('Track reactions');

      if (isIconLike) button.classList.add('lock-v85-btn-icon');
      else if (isDanger) button.classList.add('lock-v85-btn-danger');
      else if (isPrimary) button.classList.add('lock-v85-btn-primary');
      else if (isSecondary) button.classList.add('lock-v85-btn-secondary');
      else if (isQuiet) button.classList.add('lock-v85-btn-quiet');
      else if (isSelectedOption) button.classList.add('lock-v85-btn-option-selected');
      else if (isOption) button.classList.add('lock-v85-btn-option');

      if (isInlineUtilityAction) button.classList.add('lock-v88-inline-action');
    });
  }

  function applySourceConfirmationV89(root) {
    const phone = document.querySelector('#dc-root > .sc-host > div > div:nth-child(2) > div:nth-child(2) > div');
    const scope = phone || root;
    const visibleText = scope.innerText || '';
    const isSourceFlow =
      visibleText.includes('SOURCE CONFIRMATION') ||
      visibleText.includes('Source confirmation request') ||
      visibleText.includes('Confirm one specific detail') ||
      visibleText.includes('Confirmation already received') ||
      visibleText.includes('Already answered') ||
      visibleText.includes('Request closed');
    if (!isSourceFlow) return;

    if (phone) phone.classList.add('lock-v87-source-flow-screen', 'lock-v89-source-confirmation-screen');

    const isOpenSourceRequest =
      visibleText.includes('Confirm one specific detail') ||
      visibleText.includes('Can you confirm this specific detail?') ||
      visibleText.includes('Request from Roy Sason');
    let sourceLabelCount = 0;

    scope.querySelectorAll('div, span, p, h1, h2, h3, button').forEach((el) => {
      const text = textOf(el);
      if (!text) return;
      const hasTextChild = Array.from(el.children || []).some((child) => textOf(child));
      if (hasTextChild && el.tagName !== 'BUTTON') return;

      if (
        text.length < 190 &&
        (text.includes('Source confirmation request') || text.includes('FROZEN ENTITY'))
      ) {
        el.textContent = 'Source request from Roy — review one claim only.';
        el.classList.remove('lock-v84-source-banner');
        el.classList.add('lock-v87-source-kicker');
        return;
      }

      if (
        text.length < 120 &&
        (text.includes('SOURCE CONFIRMATION') || text.includes('20-SECOND FAVOR') || text.includes('NO ACCOUNT NEEDED'))
      ) {
        sourceLabelCount += 1;
        if (isOpenSourceRequest && sourceLabelCount === 1) {
          el.textContent = 'Source request from Roy — review one claim only.';
          el.classList.add('lock-v87-source-kicker');
        } else {
          el.textContent = 'ONE CLAIM TO REVIEW';
          el.classList.add('lock-v87-source-eyebrow');
        }
        return;
      }

      if (text === 'Confirm one specific detail' || text.includes("You're only being asked about one detail")) {
        el.textContent = 'Can you confirm this specific detail?';
        el.classList.add('lock-v87-source-title');
      }

      if (text === 'Confirmation already received' || text === 'You already answered this') {
        el.textContent = 'Already answered';
        el.classList.add('lock-v87-source-eyebrow');
      }

      if (text.length < 180 && text.includes('Thank you') && (text.includes('nothing else') || text.includes('no further action'))) {
        el.textContent = 'Your previous answer is saved. No further action is needed.';
        el.classList.add('lock-v89-source-state-note');
      }

      if (text === 'We will not send this source request again.' || text === "You won't receive this request again.") {
        el.textContent = 'This does not affect your account or create a LOCK profile.';
        el.classList.add('lock-v89-source-state-note');
      }

      if (text === 'Request closed') {
        el.textContent = 'Request closed';
        el.classList.add('lock-v87-source-eyebrow');
      }
    });
  }

  function run() {
    const root = document.querySelector('#dc-root');
    if (!root) return;
    walkText(root);
    normalizeRemainingEncodingGlyphs(root);
    patchShellLabels(root);
    patchControls(root);
    installDesignLanguageBoard(root);
    installReducedColorSystem(root);
    installUnifiedContrastRules(root);
    installUnifiedSurfaceTextTokens(root);
    installPlatformLogoAppendix(root);
    activateSourceConfirmation(root);
    refineSourceConfirmationScreen(root);
    applySourceConfirmationV89(root);
    tagProcessSheets(root);
    tagDetectedSourceChips(root);
    classifyButtons(root);
    tagMetricCardButtons(root);
    tagNavigationControls(root);
    tagLockBrandElements(root);
    tagNoTintTextElements(root);
    tagIntentChoiceCards(root);
  }

  run();
  const observer = new MutationObserver(run);
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
})();
