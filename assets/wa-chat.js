/* =====================================================================
   WHATSAPP CHAT BOX — the card the WhatsApp button opens
   =====================================================================
   See wa-chat.css for why this is a shared file and why it looks like
   WhatsApp rather than like the site.

   THE BUTTON IS STILL A LINK, AND THAT IS THE FALLBACK. #waFab is an <a>
   to wa.me in every page's markup. This script only intercepts a plain
   click; with the script missing, or on a ctrl/cmd/shift/middle click, the
   button does exactly what it did before — opens WhatsApp directly.

   THE NUMBER IS NEVER WRITTEN HERE. "Start chat" copies #waFab's href,
   which the page's SITE SETTINGS block repoints from the CMS through
   waHref(). So the Studio edit that moves the button and the footer icon
   moves this too, with nothing to keep in step — it is watched with a
   MutationObserver, because the CMS answer can land after the card opens.
   ===================================================================== */
(function () {
  'use strict';

  /* ---- the words — edit here, once, for all thirteen pages ---- */
  var NAME     = 'Raajlaxmi Group';
  var TAGLINE  = 'We Understand Realty';
  var GREETING = 'Hi there! 👋\nHow can I help you?';
  var CTA      = 'Start chat';
  var NOTE     = 'Opens WhatsApp';

  var fab = document.getElementById('waFab');
  if (!fab) return;

  var root = document.documentElement;
  var slow = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ------------------------------------------------------------ the card */
  var box = document.createElement('div');
  box.className = 'wac';
  box.id = 'waChat';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'false');
  box.setAttribute('aria-labelledby', 'wacName');
  box.innerHTML =
    '<div class="wac-head">' +
      '<span class="wac-av" aria-hidden="true"></span>' +
      '<span class="wac-who">' +
        '<span class="wac-name" id="wacName"></span>' +
        '<span class="wac-sub"></span>' +
      '</span>' +
      '<button type="button" class="wac-x" aria-label="Close">' +
        '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
          '<path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
        '</svg>' +
      '</button>' +
    '</div>' +
    '<div class="wac-body" aria-live="polite"></div>' +
    '<div class="wac-foot">' +
      '<a class="wac-go" target="_blank" rel="noopener noreferrer"></a>' +
      '<span class="wac-note"></span>' +
    '</div>';

  /* textContent, never innerHTML, for the words — they are content */
  box.querySelector('.wac-name').textContent = NAME;
  box.querySelector('.wac-sub').textContent = TAGLINE;
  box.querySelector('.wac-note').textContent = NOTE;

  var body = box.querySelector('.wac-body');
  var go   = box.querySelector('.wac-go');
  var xBtn = box.querySelector('.wac-x');

  /* the WhatsApp glyph is borrowed from the button rather than copied: one
     path in the page, not a second to drift */
  var glyph = fab.querySelector('svg');
  if (glyph) go.appendChild(glyph.cloneNode(true));
  go.appendChild(document.createTextNode(CTA));

  function syncHref() { go.setAttribute('href', fab.getAttribute('href') || '#'); }
  syncHref();
  if (window.MutationObserver) {
    new MutationObserver(syncHref).observe(fab, { attributes: true, attributeFilter: ['href'] });
  }

  document.body.appendChild(box);

  fab.setAttribute('aria-haspopup', 'dialog');
  fab.setAttribute('aria-controls', 'waChat');
  fab.setAttribute('aria-expanded', 'false');

  /* ------------------------------------------------------- the message */
  var greeted = false;

  function stamp() {
    try { return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }
    catch (e) { return ''; }
  }

  function bubble() {
    var m = document.createElement('div');
    m.className = 'wac-msg';
    var from = document.createElement('span');
    from.className = 'wac-from';
    from.textContent = NAME;
    var p = document.createElement('p');
    p.className = 'wac-text';
    p.textContent = GREETING;
    var t = document.createElement('span');
    t.className = 'wac-time';
    t.textContent = stamp();
    m.appendChild(from); m.appendChild(p); m.appendChild(t);
    return m;
  }

  /* A beat of "typing" the first time only, as WhatsApp business widgets
     do. Skipped under reduced motion, and never repeated: re-opening the
     card should show the message, not perform it again. */
  function greet() {
    if (greeted) return;
    greeted = true;
    if (slow && slow.matches) { body.appendChild(bubble()); return; }
    var dots = document.createElement('div');
    dots.className = 'wac-typing';
    dots.setAttribute('aria-label', NAME + ' is typing');
    dots.innerHTML = '<i></i><i></i><i></i>';
    body.appendChild(dots);
    setTimeout(function () { dots.replaceWith(bubble()); }, 650);
  }

  /* ----------------------------------------------------- open and close */
  function isOpen() { return root.classList.contains('wac-open'); }

  function open() {
    if (isOpen()) return;
    /* SAATHI AND THIS SHARE ONE SLOT, so opening one closes the other.
       A pointer press on this button already closes Saathi (its own
       outside-click rule); a keyboard press does not, so it is asked here
       through its launcher, which is Saathi's only public way in. */
    if (root.classList.contains('sa-open')) {
      var sa = document.querySelector('.sa-launch');
      if (sa) sa.click();
    }
    syncHref();
    root.classList.add('wac-open');
    fab.setAttribute('aria-expanded', 'true');
    greet();
    setTimeout(function () { go.focus({ preventScroll: true }); }, 60);
  }

  function close(returnFocus) {
    if (!isOpen()) return;
    root.classList.remove('wac-open');
    fab.setAttribute('aria-expanded', 'false');
    if (returnFocus) fab.focus({ preventScroll: true });
  }

  fab.addEventListener('click', function (e) {
    /* a modified or non-primary click is a request for the link itself */
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    isOpen() ? close(false) : open();
  });

  xBtn.addEventListener('click', function () { close(true); });

  /* the hand-over: let the link do its work, then put the card away */
  go.addEventListener('click', function () { setTimeout(function () { close(false); }, 150); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) close(true);
  });

  /* A press outside closes it — pointerdown, as Saathi and the hero capsule
     use, so it cannot race the button's own click. */
  document.addEventListener('pointerdown', function (e) {
    if (!isOpen()) return;
    if (box.contains(e.target) || fab.contains(e.target)) return;
    close(false);
  });

  /* Three things open over or beside this from elsewhere, and each one
     shuts it: Saathi opened by keyboard (no pointerdown to catch), the lead
     popup on its 30-second timer, and the walkthrough player on
     project.html. All three announce themselves as a class on <html>. */
  if (window.MutationObserver) {
    new MutationObserver(function () {
      if (!isOpen()) return;
      var c = root.classList;
      if (c.contains('sa-open') || c.contains('lead-open') || c.contains('pdw-open')) close(false);
    }).observe(root, { attributes: true, attributeFilter: ['class'] });
  }
})();
