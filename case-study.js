// "View all" toggles. Extra items stay visible unless this script runs,
// so the page never hides content it can't reveal again.
document.querySelectorAll('[data-toggle-more]').forEach(function (btn) {
  var target = document.getElementById(btn.getAttribute('aria-controls'));
  if (!target) return;
  var showLabel = btn.textContent;
  target.hidden = true;
  btn.hidden = false;
  btn.addEventListener('click', function () {
    var open = target.hidden;
    target.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Show fewer' : showLabel;
    // Collapsing removes content above the button; keep it under the cursor.
    if (!open) btn.scrollIntoView({ block: 'center' });
  });
});
