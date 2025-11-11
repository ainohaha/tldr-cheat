(function(){
  /* * ==================================================================
   * === USER CONFIGURATION: You MUST edit these to match your content!
   * ==================================================================
   */

  /**
   * (1) CANON: Maps all your heading text (and common variations) to a single "canonical" slug.
   * Format: ['heading text', 'slug']
   */
  const CANON = new Map([
    ['context','context'],['the context','context'],
    ['purpose','purpose'],['the purpose','purpose'],
    ['research','research'],
    ['approach','approach'],
    ['results','results'],['the results','results']
  ]);

  /**
   * (2) LINK_ALIASES: Maps anchor links (from navs) to a canonical slug.
   * Useful if your nav link is `href="#why"` but your heading is "Purpose".
   * Format: ['link slug', 'canonical slug']
   */
  const LINK_ALIASES = new Map([
    ['why','purpose'],
    ['method','approach'],['methods','approach'],['process','approach'],
    ['outcome','results'],['outcomes','results'],['result','results']
  ]);

  /**
   * (3) ALLOWED: A "safelist" of all your canonical slugs from (1).
   * This prevents the script from trying to scroll to unknown anchors.
   */
  const ALLOWED = new Set(['context','purpose','research','approach','results']);

  /**
   * (4) VALID_MODES: A "safelist" of all your reading modes.
   * This must match your HTML: `data-read-mode-btn="..."` and `data-read-section="..."`
   */
  const VALID_MODES = new Set(['short','mid','full']);

  /**
   * (5) ALIAS_MODES: (Optional) Maps URL param aliases to a valid mode.
   * e.g., `?read=quick` becomes `short`.
   */
  const ALIAS_MODES = new Map([['quick','short'],['med','mid'],['medium','mid'],['standard','mid'],['long','full']]);

  /* * ==================================================================
   * === END OF CONFIGURATION
   * ==================================================================
   */

  const prefersReduced=()=>window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const slugify=s=>String(s||'').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9\s-]/g,'').trim()
    .replace(/\s+/g,'-').replace(/-+/g,'-');

  const canonFromText=t=>{
    const raw=String(t||'').toLowerCase().trim();
    const trimmed=raw.replace(/^[\s:–—-]+|[\s:–—-]+$/g,'');
    const noArticle=trimmed.replace(/^(the|a|an)\s+/,'');
    return CANON.get(trimmed)||CANON.get(noArticle)||slugify(noArticle);
  };

  // --- Use generic data-attributes to find elements ---
  const seg = document.querySelector('[data-read-control]');
  const buttons = seg ? Array.from(seg.querySelectorAll('[data-read-mode-btn]')) : [];
  const indicator = seg ? seg.querySelector('[data-read-indicator]') : null;
  const sections = Array.from(document.querySelectorAll('[data-read-section]'));
  
  if(!seg||!buttons.length||!sections.length) {
    console.warn('Reading mode script: Missing required elements (control, buttons, or sections).');
    return;
  }

  /* Tag headings for anchors */
  sections.forEach(sec=>{
    // Get mode from the section's data-attribute, e.g., data-read-section="short"
    const mode = sec.dataset.readSection || ''; 
    sec.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h=>{
      const base = canonFromText(h.textContent||''); 
      if(!base) return;
      h.dataset.anchor = base; 
      h.id = `${base}--${mode}`;
    });
  });

  function showSection(mode){
    let tgt=null;
    sections.forEach(s=>{
      const on = s.dataset.readSection === mode;
      s.setAttribute('aria-hidden', on ? 'false' : 'true');
      s.toggleAttribute('inert', !on);
      if(on) tgt = s;
    });
    return tgt;
  }
  
  function visibleSection(){
    return document.querySelector('[data-read-section][aria-hidden="false"]') || sections[0];
  }

  function moveIndicator(){
    if(!indicator) return;
    const active = seg.querySelector('[data-read-mode-btn][aria-pressed="true"] .seg-label'); 
    if(!active) return;
    const segR = seg.getBoundingClientRect(), labR = active.getBoundingClientRect();
    indicator.style.width = labR.width+'px';
    indicator.style.transform = `translateX(${Math.round(labR.left-segR.left)}px)`;
  }

  const keyQ='read', keyLS='read_pref';
  const norm = m => { 
    if(!m) return ''; 
    const k = (ALIAS_MODES.get(String(m).toLowerCase()) || String(m).toLowerCase()); 
    return VALID_MODES.has(k) ? k : ''; 
  };
  const getParam=n=>new URL(location.href).searchParams.get(n);
  const setParam=(n,v)=>{const u=new URL(location.href); u.searchParams.set(n,v); history.replaceState(null,'',u.toString());};

  function selectMode(mode, fromUser){
    mode = norm(mode) || norm(buttons[0].dataset.readModeBtn) || 'mid'; // Default to first button or 'mid'
    buttons.forEach(b => b.setAttribute('aria-pressed', b.dataset.readModeBtn === mode ? 'true' : 'false'));
    const tgt = showSection(mode);

    // Scroll to start of the chosen block on user action
    if(tgt && fromUser){
      const y = tgt.getBoundingClientRect().top + window.pageYOffset - 24;
      window.scrollTo({ top:y, behavior: prefersReduced()?'auto':'smooth' });
    }

    localStorage.setItem(keyLS, mode);
    setParam(keyQ, mode);
    requestAnimationFrame(moveIndicator);

    if(fromUser){
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({event:'read_mode_change', read_mode:mode});
    }
  }

  function navigateToAnchor(raw){
    if(!raw) return;
    const slug = (LINK_ALIASES.get(slugify(raw)) || slugify(raw));
    if(!ALLOWED.has(slug)) return;

    const vis = visibleSection();
    if (!vis) return; // No visible section
    
    // Find the heading by its data-anchor or generated ID
    const el = vis.querySelector(`[data-anchor="${slug}"]`) || vis.querySelector(`#${slug}--${vis.dataset.readSection}`);
    if(!el) return;

    el.scrollIntoView({ block:'start', inline:'nearest', behavior: prefersReduced()?'auto':'smooth' });
    const u = new URL(location.href); u.hash = slug; history.replaceState(null,'',u.toString());
  }

  // Wire
  buttons.forEach(btn => btn.addEventListener('click', e => { 
    e.preventDefault(); 
    selectMode(btn.dataset.readModeBtn, true); 
  }));
  
  if(location.hash){ 
    history.replaceState(null,'',location.pathname+location.search); 
    window.scrollTo(0,0); 
  }

  const start = norm(getParam(keyQ)) || norm(localStorage.getItem(keyLS)) || norm(buttons[0].dataset.readModeBtn) || 'mid';
  showSection(start);
  buttons.forEach(b => b.setAttribute('aria-pressed', b.dataset.readModeBtn === start ? 'true' : 'false'));
  selectMode(start, false);

  window.addEventListener('resize', moveIndicator);
  if(document.fonts && document.fonts.ready) {
    document.fonts.ready.then(moveIndicator);
  } else {
    window.addEventListener('load', moveIndicator);
  }

  // Intercept only external left-nav anchors (not inside the RTE or control)
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); 
    if(!a || !a.getAttribute('href').startsWith('#') || a.getAttribute('href') === '#') return;
    // Do not intercept if inside the content or the control
    if(a.closest('[data-read-section]') || a.closest('[data-read-control]')) return;
    
    e.preventDefault();
    navigateToAnchor((a.getAttribute('href')||'').slice(1));
  });
})();
