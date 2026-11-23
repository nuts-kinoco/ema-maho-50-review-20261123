
(function () {
  const prefix = 'maho-50-votes:';
  const choices = [['pass','採用'],['fail','不採用'],['hold','保留']];
  const page = location.pathname.split('/').pop() || 'index.html';
  const isIndex = page === 'index.html';
  function collect() {
    const out = {};
    for (let i=0; i<localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) {
        try { out[k.slice(prefix.length)] = JSON.parse(localStorage.getItem(k)); } catch {}
      }
    }
    return out;
  }
  function summary() {
    const vals = Object.values(collect());
    const counts = {pass:0,fail:0,hold:0};
    vals.forEach(v => {if (v && counts[v.choice]!==undefined) counts[v.choice]++});
    return '採用 '+counts.pass+' / 不採用 '+counts.fail+' / 保留 '+counts.hold+' / 判定済 '+vals.length+' / 全50枚';
  }
  function download() {
    const json = JSON.stringify({version:1, exported_at:new Date().toISOString(), results:collect()},null,2);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([json], {type:'application/json'}));
    a.download = 'maho-50-review.json';
    document.body.append(a);a.click();
    setTimeout(() => {URL.revokeObjectURL(a.href); a.remove()}, 1000);
  }
  function toolbar() {
    const el = document.createElement('div');
    el.className = 'review-toolbar';
    const count = document.createElement('strong');
    count.dataset.reviewCount = '1';
    count.textContent = summary();
    const button = document.createElement('button');
    button.textContent = '判定結果をJSON保存';
    button.addEventListener('click', download);
    el.append(count,button);
    const hint = document.createElement('span');
    hint.className = 'review-hint';
    hint.textContent = '判定はこのブラウザ内に保存。別端末へはJSONを保存して引き継いでください。';
    el.append(hint);
    const h1 = document.querySelector('h1');
    h1?.after(el);
  }
  function refresh() {document.querySelectorAll('[data-review-count]').forEach(el => el.textContent=summary())}
  toolbar();
  {
    const rows = [...document.querySelectorAll('tr, .review-card')].filter(row => row.querySelector('img[src]'));
    rows.forEach((row) => {
      const img = row.querySelector('img[src]');
      const name = img.getAttribute('src').split('/').pop();
      const key = name;
      const target = row.classList.contains('review-card') ? row.querySelector('.card-content') : (img.closest('td') || row.lastElementChild);
      const controls = document.createElement('div');
      controls.className='review-controls';
      const status = document.createElement('span');
      status.className='status';
      const btns=[];
      function update() {
        let val=null;
        try {val=JSON.parse(localStorage.getItem(prefix+key))} catch {}
        for (const b of btns) {b.classList.toggle('selected',val?.choice===b.dataset.choice);b.setAttribute('aria-pressed',String(val?.choice===b.dataset.choice))}
        status.textContent=val?'判定: '+choices.find(c=>c[0]===val.choice)?.[1]:'未判定';
        refresh();
      }
      choices.forEach(([choice,label])=>{
        const b = document.createElement('button');
        b.type='button';b.dataset.choice=choice;b.textContent=label;
        b.addEventListener('click',()=>{localStorage.setItem(prefix+key,JSON.stringify({image:name,case:page,choice,updated_at:new Date().toISOString()}));update()});
        btns.push(b);controls.append(b);
      });
      controls.append(status);target.append(controls);update();
    });
  }
  window.addEventListener('storage',refresh);
})();
