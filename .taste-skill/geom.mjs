import { Browser } from 'file:///C:/Users/Lenovo/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const b = await Browser.launch({ width: 390, height: 844 });
const p = await b.newPage({ width: 390, height: 844, mobile: true });
await p.goto('http://localhost:4173', { settleMs: 1500 });
const out = await p.eval(() => {
  const els = [...document.querySelectorAll('main > *, footer, section, .footer-middle, .footer-bottom, .plan-block, .closing, .closing-mid, .closing-foot, .faq-band')];
  return {
    pageH: document.documentElement.scrollHeight,
    rects: els.map(el => { const r = el.getBoundingClientRect(); return { tag: el.tagName, cls: el.className, id: el.id, top: Math.round(r.top + scrollY), h: Math.round(r.height), bottom: Math.round(r.bottom + scrollY), text: (el.innerText||'').replace(/\s+/g,' ').slice(0,55) }; })
  };
});
console.log(JSON.stringify(out, null, 2));
await b.close();

