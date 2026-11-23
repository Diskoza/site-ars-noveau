(() => {
  'use strict';
  const D = window.WIKI_DATA;
  const root = document.getElementById('page-root');
  const sidebar = document.getElementById('sidebar');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalContent = document.getElementById('modal-content');
  const recipeKinds = [...new Set(D.recipes.map(r => r.kind))];
  const soulFrames = {
    flame_soul:10,frost_soul:10,earth_soul:10,lightning_soul:9,hero_soul:8,void_soul:10,elemental_soul:8,true_elemental_soul:8
  };
  const structureGlow = {
    infernal_prison:'#ff7248', frozen_library:'#74dfff', overgrown_barracks:'#75d78d',
    nimbostratic_ruins:'#ffe16c', holy_mausoleum:'#fff0b5', void_fortress:'#b77cff'
  };
  let activeGlyphCategory = 'Все';
  let activeRecipeKind = 'Все';
  let activeEncyclopedia = 'items';
  let filters = { glyph:'', recipe:'', encyclopedia:'' };

  const esc = (s='') => String(s).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':'&quot;'}[c]));
  const titleCaseId = rid => rid.replace(/^#/,'').split(':').pop().replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());

  const allEntries = [...D.items,...D.blocks,...D.entities,...D.effects];
  const entryMap = new Map(allEntries.map(x=>[x.id,x]));
  const glyphMap = new Map(D.glyphs.map(x=>[`adamsarsplus:${x.id}`,x]));
  const recipeMap = new Map(D.recipes.map(x=>[x.id,x]));

  function pathExistsGuess(rid){
    if(!rid || rid.startsWith('#')) return null;
    const [ns,id] = rid.includes(':') ? rid.split(':') : ['minecraft',rid];
    if(ns==='adamsarsplus') return `assets/adamsarsplus/textures/item/${id}.png`;
    if(ns==='ars_nouveau') return `assets/ars_nouveau/textures/item/${id}.png`;
    return null;
  }
  function entryName(rid){
    if(!rid) return 'Неизвестный объект';
    if(rid.startsWith('#')) return `Тег: ${rid.slice(1)}`;
    const e = entryMap.get(rid) || glyphMap.get(rid);
    return e?.name || titleCaseId(rid);
  }
  function entryEn(rid){ const e=entryMap.get(rid)||glyphMap.get(rid); return e?.en || rid; }
  function entryIcon(rid){ const e=entryMap.get(rid)||glyphMap.get(rid); return e?.icon || pathExistsGuess(rid); }
  function imgTag(src, alt='', cls=''){
    if(!src) return `<span class="fallback-icon ${cls}">✦</span>`;
    return `<img class="${cls}" src="${esc(src)}" alt="${esc(alt)}" loading="lazy" onerror="this.outerHTML='<span class=&quot;fallback-icon&quot;>✦</span>'">`;
  }
  function soulSprite(id, cls=''){
    const f=soulFrames[id]||1, end=-(f-1)*72;
    return `<span class="soul-sprite ${cls}" style="--frames:${f};--end:${end}px;background-image:url('assets/adamsarsplus/textures/item/${id}.png')"></span>`;
  }
  function iconBox(rid, entity=false){
    const src=entryIcon(rid); return `<span class="icon-box ${entity?'entity':''}">${imgTag(src,entryName(rid),entity?'entity-texture':'')}</span>`;
  }
  function miniIcon(rid){ return `<span class="mini-icon">${imgTag(entryIcon(rid),entryName(rid))}</span>`; }
  function pageHeader(eyebrow,title,lead,stat='',label=''){
    return `<header class="page-header"><div><div class="eyebrow">${esc(eyebrow)}</div><h1 class="page-title">${esc(title)}</h1><p class="page-lead">${esc(lead)}</p></div>${stat!==''?`<div class="header-stat"><strong>${esc(stat)}</strong><small>${esc(label)}</small></div>`:''}</header>`;
  }
  function setRoute(route, push=true){
    route=route||'home';
    document.querySelectorAll('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.route===route));
    if(push && location.hash!==`#${route}`) history.pushState(null,'',`#${route}`);
    sidebar.classList.remove('open');
    render(route);
    window.scrollTo({top:0,behavior:'instant'});
  }

  function homePage(){
    const stats=[['Глифов',D.stats.glyphs],['Рецептов',D.stats.recipes],['Сущностей',D.stats.entities],['Структур',D.structures.length],['Эффектов',D.stats.effects]];
    return `<section class="page">
      <div class="hero">
        <div class="hero-copy"><div class="eyebrow">НЕОФИЦИАЛЬНАЯ ЭНЦИКЛОПЕДИЯ • JAR VERIFIED</div>
          <h1>Магия без <em>слепых зон</em></h1>
          <p>Полная русская база знаний по Adam's Ars Plus 5.0.3: развитие от первого Mana Diamond до открытых доменов, архимагов, пробуждённой брони и ритуала Махораги.</p>
          <div class="hero-actions"><button class="btn btn-primary" data-go="progression">Начать прохождение</button><button class="btn" data-go="glyphs">Открыть гримуар</button><button class="btn" data-go="recipes">Все рецепты</button></div>
        </div>
        <div class="hero-visual"><div class="arcane-ring">
          <span class="orbit-glyph">${imgTag(entryIcon('adamsarsplus:glyph_effectdomain'),'Домен')}</span>
          <span class="orbit-glyph">${imgTag(entryIcon('adamsarsplus:glyph_effectannihilate'),'Аннигиляция')}</span>
          <span class="orbit-glyph">${imgTag(entryIcon('adamsarsplus:glyph_effectlimitless'),'Безграничность')}</span>
          <span class="orbit-glyph">${imgTag(entryIcon('adamsarsplus:glyph_effectmeteorswarm'),'Метеоритный рой')}</span>
          ${soulSprite('true_elemental_soul','hero-soul')}
        </div></div><div class="hero-badge">Minecraft 1.20.1 · Forge · Ars Nouveau 4.12.7</div>
      </div>
      <div class="stats-grid">${stats.map(([l,n])=>`<div class="stat-card"><strong>${n}</strong><small>${l} в базе</small></div>`).join('')}</div>
      <div class="section-head"><div><div class="eyebrow">КЛЮЧЕВЫЕ РАЗДЕЛЫ</div><h2>Исследуй аддон как систему</h2></div><p>Не набор отдельных предметов, а связанная цепочка: структуры → души → броня → архимаги → домены.</p></div>
      <div class="featured-grid">
        <article class="feature-card large" data-go="progression"><div class="feature-gradient"></div><span class="feature-number">01 / ПРОХОЖДЕНИЕ</span>${imgTag(entryIcon('adamsarsplus:true_elemental_soul'),'Стихийная душа','feature-art')}<h3>Дерево прогрессии</h3><p>Пошаговая карта развития без пропусков и тупиков.</p></article>
        <article class="feature-card" data-go="structures"><div class="feature-gradient"></div><span class="feature-number">02 / МИР</span>${imgTag(entryIcon('adamsarsplus:mage_tome'),'Структуры','feature-art')}<h3>6 сооружений</h3><p>Биомы, измерения, высоты и охрана.</p></article>
        <article class="feature-card" data-go="shadows"><div class="feature-gradient"></div><span class="feature-number">03 / РИТУАЛ</span>${imgTag(entryIcon('adamsarsplus:ritual_ten_shadows'),'Десять теней','feature-art')}<h3>Ten Shadows</h3><p>Подчинение сикигами и адаптация Махораги.</p></article>
      </div>
      <div class="info-strip"><b>✦</b><p><strong>Источник истины:</strong> названия, рецепты, биомы, высоты генерации и встроенные описания взяты непосредственно из файлов мода. Боевые значения, которые требуют отдельного разбора байткода или проверки в мире, не выдаются за подтверждённые.</p></div>
    </section>`;
  }

  function progressionPage(){
    return `<section class="page">${pageHeader('ПУТЬ АРХИМАГА','Дерево прогрессии','Последовательность, связывающая материалы, сооружения, ритуалы, броню и поздние глифы.',D.progression.length,'основных этапов')}
      <div class="progression-map">${D.progression.map((n,i)=>`<article class="progress-node"><div class="node-orb" data-stage="${n.stage}">${imgTag(n.icon,n.title)}</div><div class="node-body"><div><h3>${esc(n.title)}</h3><p>${esc(n.text)}</p><div class="tags"><span class="tag green">Подтверждено ресурсами</span>${i===1?'<span class="tag purple">6 ветвей стихий</span>':''}</div></div><span class="node-action">→</span></div></article>`).join('')}</div>
      <div class="section-head"><div><div class="eyebrow">РИТУАЛЫ</div><h2>Точки перехода</h2></div></div>
      <div class="card-grid">${D.rituals.map(r=>`<article class="wiki-card" data-item="adamsarsplus:${r.id}"><div class="card-top">${iconBox(`adamsarsplus:${r.id}`)}<div><h3 class="card-title">${esc(r.name)}</h3><div class="card-sub">adamsarsplus:${esc(r.id)}</div></div></div><p class="desc">${esc(r.desc)}</p><div class="tags"><span class="tag purple">Ритуал</span></div></article>`).join('')}</div>
    </section>`;
  }

  function structuresPage(){
    return `<section class="page">${pageHeader('МИРОВАЯ ГЕНЕРАЦИЯ','Стихийные сооружения','Точные биомы и стартовые высоты взяты из worldgen JSON. Координаты не гарантируют, что вся структура будет находиться на указанной высоте.',D.structures.length,'уникальных структур')}
      <div class="structure-grid">${D.structures.map(s=>`<article class="structure-card" style="--structure-glow:${structureGlow[s.id]}"><div class="structure-banner">${imgTag(s.soulIcon,s.reward)}<h3>${esc(s.name)}</h3></div><div class="structure-content"><div class="structure-meta"><div class="meta-box"><span>Измерение</span><strong>${esc(s.dimension)}</strong></div><div class="meta-box"><span>Биомы</span><strong>${esc(s.biomes)}</strong></div><div class="meta-box"><span>Высота</span><strong>${esc(s.height)}</strong></div></div><p class="structure-note">${esc(s.note)}</p><div class="spawn-row">${s.spawns.map(x=>`<span class="spawn-pill">${esc(x.name)} · ${x.min}–${x.max}</span>`).join('')}</div><div class="tags"><span class="tag gold">Награда: ${esc(s.reward)}</span><span class="tag">Jigsaw ${s.size}</span><span class="tag">радиус ${s.maxDistance}</span></div></div></article>`).join('')}</div>
    </section>`;
  }

  function armorPage(){
    return `<section class="page">${pageHeader('МАГИЧЕСКАЯ ЭКИПИРОВКА','Комплекты архимагов','Шесть стихийных комплектов с обычной и пробуждённой формой. Карточки связываются с точными рецептами каждой части.',D.armorSets.length,'комплектов')}
      <div class="armor-stack">${D.armorSets.map(a=>`<article class="armor-card" style="--armor-accent:${a.accent};--armor-glow:${a.accent}22"><div class="armor-accent"></div><div class="armor-main"><div class="armor-showcase">${soulSprite(a.soul,'armor-soul')}<div class="armor-pieces">${a.pieces.map(p=>`<button class="armor-piece" data-item="${p.id}" title="${esc(p.name)}">${imgTag(p.icon,p.name)}</button>`).join('')}</div></div><div class="armor-info"><div class="archmage">${esc(a.archmage)}</div><h2>${esc(a.name)}</h2><p>${esc(a.desc)}</p><div class="tier-compare"><div class="tier-box"><span>ОБЫЧНАЯ ФОРМА</span><strong>Уровень ${a.baseTier}</strong><div class="awakened-row">${a.pieces.map(p=>imgTag(p.icon,p.name)).join('')}</div></div><div class="tier-box"><span>ПРОБУЖДЁННАЯ ФОРМА</span><strong>Уровень ${a.awakenedTier}</strong><div class="awakened-row">${a.awakened.map(p=>`<button data-item="${p.id}" title="${esc(p.name)}">${imgTag(p.icon,p.name)}</button>`).join('')}</div></div></div><div class="tags"><span class="tag purple">Бонус полного комплекта</span><span class="tag green">Рецепты из JAR</span></div></div></div></article>`).join('')}</div>
    </section>`;
  }

  function glyphsPage(){
    const cats=['Все',...new Set(D.glyphs.map(g=>g.category))];
    const q=filters.glyph.toLowerCase();
    const list=D.glyphs.filter(g=>(activeGlyphCategory==='Все'||g.category===activeGlyphCategory)&&(!q||`${g.name} ${g.en} ${g.description} ${g.id}`.toLowerCase().includes(q)));
    return `<section class="page">${pageHeader('ГРИМУАР','Глифы Adam’s Ars Plus','Все зарегистрированные глифы аддона, включая улучшенные аугменты, домены, высокоуровневые эффекты и ритуально открываемые способности.',D.glyphs.length,'глифов')}
      <div class="toolbar"><input class="filter-input" id="glyph-search" value="${esc(filters.glyph)}" placeholder="Поиск по названию или описанию…"><div class="chip-row">${cats.map(c=>`<button class="chip ${c===activeGlyphCategory?'active':''}" data-glyph-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div></div>
      <div class="card-grid">${list.length?list.map(g=>`<article class="wiki-card" data-glyph="${g.id}"><span class="verified"></span><div class="card-top">${iconBox(`adamsarsplus:${g.id}`)}<div><h3 class="card-title">${esc(g.name)}</h3><div class="card-sub">${esc(g.en)}</div></div></div><p class="desc">${esc(g.description)}</p><div class="tags"><span class="tag purple">${esc(g.category)}</span><span class="tag ${g.recipeId?'green':'gold'}">${esc(g.unlock)}</span></div></article>`).join(''):'<div class="empty-state">Ничего не найдено.</div>'}</div>
    </section>`;
  }

  function shadowsPage(){
    return `<section class="page"><div class="shadow-hero"><div><div class="eyebrow">ЗАПРЕТНАЯ ТЕХНИКА</div><h1>Десять теней</h1><p>Ритуал выдаёт глиф Ten Shadows. Mana Diamond, добавленные к ритуалу, определяют доступный уровень испытания. Для приручения существо необходимо победить без посторонней помощи — особенно это важно для Махораги.</p><div class="tags"><span class="tag purple">Ритуальное открытие</span><span class="tag gold">Одиночная победа</span><span class="tag green">Состояние хранится в capability</span></div></div><div class="mahoraga-portrait"><img src="assets/adamsarsplus/textures/entity/ten_shadows/mahoraga_texture.png" alt="Махорага"></div></div>
      <div class="section-head"><div><div class="eyebrow">ПУТЬ ПОДЧИНЕНИЯ</div><h2>Сикигами</h2></div><p>Ранг и точная стоимость усиления будут дополнены после полного разбора RitualTenShadows.</p></div>
      <div class="shadow-path">${D.shikigami.map((s,i)=>`<article class="shadow-card" data-entity="adamsarsplus:${s.id}"><img src="${esc(s.icon)}" alt="${esc(s.name)}"><div class="rank">${esc(s.rank)}</div><h3>${esc(s.name)}</h3><p>${esc(s.desc)}</p><div class="tags"><span class="tag">${esc(s.cost)}</span></div></article>`).join('')}</div>
      <div class="section-head"><div><div class="eyebrow">МАХОРАГА</div><h2>Механика адаптации</h2></div></div>
      <div class="adapt-grid"><article class="adapt-card"><b>Типы урона</b><p>Сущность хранит список адаптированных DamageType и отдельную стадию для каждого типа.</p></article><article class="adapt-card"><b>Эффекты</b><p>Отдельно проверяется адаптация к наложенным MobEffect; это не только сопротивление прямому урону.</p></article><article class="adapt-card"><b>Новые возможности</b><p>В классе предусмотрены флаги дальней атаки, рубящего удара и Disruption, открывающиеся по ходу боя.</p></article></div>
    </section>`;
  }

  function recipesPage(){
    const q=filters.recipe.toLowerCase();
    const list=D.recipes.filter(r=>(activeRecipeKind==='Все'||r.kind===activeRecipeKind)&&(!q||`${r.outputName} ${r.outputEn} ${r.output} ${r.kind}`.toLowerCase().includes(q)));
    const counts=Object.fromEntries(recipeKinds.map(k=>[k,D.recipes.filter(r=>r.kind===k).length]));
    return `<section class="page">${pageHeader('КРАФТ И МАГИЯ','База рецептов','Автоматически собранные рецепты из data/adamsarsplus/recipes: глифы, улучшение брони, наполнение, чародейский аппарат и ритуальные таблички.',D.recipes.length,'JSON-рецептов')}
      <div class="toolbar"><input class="filter-input" id="recipe-search" value="${esc(filters.recipe)}" placeholder="Найти результат рецепта…"></div>
      <div class="recipe-layout"><aside class="recipe-sidebar"><h3>Тип рецепта</h3><button class="recipe-filter ${activeRecipeKind==='Все'?'active':''}" data-recipe-kind="Все"><span>Все рецепты</span><b>${D.recipes.length}</b></button>${recipeKinds.map(k=>`<button class="recipe-filter ${activeRecipeKind===k?'active':''}" data-recipe-kind="${esc(k)}"><span>${esc(k)}</span><b>${counts[k]}</b></button>`).join('')}</aside>
      <div class="recipe-grid">${list.length?list.map(r=>`<article class="recipe-card" data-recipe="${r.id}"><div class="recipe-output">${iconBox(r.output)}<div><h3>${esc(r.outputName)}</h3><small>${esc(r.kind)}</small></div></div><div class="recipe-ingredients">${[...r.reagent,...r.ingredients].slice(0,7).map(miniIcon).join('')}${r.reagent.length+r.ingredients.length>7?`<span class="more-count">+${r.reagent.length+r.ingredients.length-7}</span>`:''}</div><div class="recipe-cost"><span>${r.sourceCost!=null?`${r.sourceCost} Source`:(r.exp!=null?`${r.exp} XP`:'Верстак')}</span><span>${esc(r.output.split(':').pop())}</span></div></article>`).join(''):'<div class="empty-state">Рецепты не найдены.</div>'}</div></div>
    </section>`;
  }

  function encyclopediaPage(){
    const tabs=[['items','Предметы',D.items.length],['blocks','Блоки',D.blocks.length],['entities','Сущности',D.entities.length],['effects','Эффекты',D.effects.length]];
    const source=D[activeEncyclopedia];
    const q=filters.encyclopedia.toLowerCase();
    const list=source.filter(x=>!q||`${x.name} ${x.en} ${x.id}`.toLowerCase().includes(q));
    return `<section class="page">${pageHeader('РЕЕСТР КОНТЕНТА','Энциклопедия','Все предметы, блоки, сущности и эффекты, зарегистрированные аддоном. Карточки используют оригинальные текстуры из JAR.',source.length,'объектов в разделе')}
      <div class="encyclopedia-tabs">${tabs.map(([id,l,n])=>`<button class="chip ${activeEncyclopedia===id?'active':''}" data-encyclopedia="${id}">${l} · ${n}</button>`).join('')}</div>
      <div class="toolbar"><input class="filter-input" id="encyclopedia-search" value="${esc(filters.encyclopedia)}" placeholder="Поиск по реестру…"></div>
      <div class="card-grid">${list.length?list.map(e=>`<article class="wiki-card" data-item="${e.id}"><div class="card-top">${iconBox(e.id,activeEncyclopedia==='entities')}<div><h3 class="card-title">${esc(e.name)}</h3><div class="card-sub">${esc(e.en)}</div></div></div><div class="tags"><span class="tag purple">${esc(activeEncyclopedia)}</span><span class="tag green">Из реестра мода</span></div></article>`).join(''):'<div class="empty-state">Ничего не найдено.</div>'}</div>
    </section>`;
  }

  function render(route){
    const pages={home:homePage,progression:progressionPage,structures:structuresPage,armor:armorPage,glyphs:glyphsPage,shadows:shadowsPage,recipes:recipesPage,encyclopedia:encyclopediaPage};
    root.innerHTML=(pages[route]||homePage)();
    initDynamicSprites();
    bindPageEvents(route);
    document.title=`${route==='home'?"Adam's Ars Plus Wiki":document.querySelector('.page-title,.shadow-hero h1')?.textContent+' — Adam’s Ars Plus Wiki'}`;
  }

  function bindPageEvents(route){
    root.querySelectorAll('[data-go]').forEach(el=>el.addEventListener('click',()=>setRoute(el.dataset.go)));
    root.querySelectorAll('[data-glyph]').forEach(el=>el.addEventListener('click',()=>openGlyph(el.dataset.glyph)));
    root.querySelectorAll('[data-recipe]').forEach(el=>el.addEventListener('click',()=>openRecipe(el.dataset.recipe)));
    root.querySelectorAll('[data-item]').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();openItem(el.dataset.item)}));
    root.querySelectorAll('[data-entity]').forEach(el=>el.addEventListener('click',()=>openItem(el.dataset.entity)));
    root.querySelectorAll('[data-glyph-cat]').forEach(el=>el.addEventListener('click',()=>{activeGlyphCategory=el.dataset.glyphCat;render('glyphs')}));
    root.querySelectorAll('[data-recipe-kind]').forEach(el=>el.addEventListener('click',()=>{activeRecipeKind=el.dataset.recipeKind;render('recipes')}));
    root.querySelectorAll('[data-encyclopedia]').forEach(el=>el.addEventListener('click',()=>{activeEncyclopedia=el.dataset.encyclopedia;render('encyclopedia')}));
    const gs=root.querySelector('#glyph-search'); if(gs) gs.addEventListener('input',e=>{filters.glyph=e.target.value;render('glyphs');requestAnimationFrame(()=>{const i=root.querySelector('#glyph-search');i?.focus();i?.setSelectionRange(i.value.length,i.value.length)})});
    const rs=root.querySelector('#recipe-search'); if(rs) rs.addEventListener('input',e=>{filters.recipe=e.target.value;render('recipes');requestAnimationFrame(()=>{const i=root.querySelector('#recipe-search');i?.focus();i?.setSelectionRange(i.value.length,i.value.length)})});
    const es=root.querySelector('#encyclopedia-search'); if(es) es.addEventListener('input',e=>{filters.encyclopedia=e.target.value;render('encyclopedia');requestAnimationFrame(()=>{const i=root.querySelector('#encyclopedia-search');i?.focus();i?.setSelectionRange(i.value.length,i.value.length)})});
  }

  function openModal(html){ modalContent.innerHTML=html; modalBackdrop.hidden=false; document.body.style.overflow='hidden'; initDynamicSprites(); }
  function closeModal(){ modalBackdrop.hidden=true;document.body.style.overflow=''; }
  function openGlyph(id){
    const g=D.glyphs.find(x=>x.id===id); if(!g)return;
    const rec=g.recipeId&&recipeMap.get(g.recipeId);
    openModal(`<div class="modal-head">${iconBox(`adamsarsplus:${g.id}`)}<div><h2>${esc(g.name)}</h2><div class="id">adamsarsplus:${esc(g.id)} · ${esc(g.en)}</div></div></div><p class="modal-desc">${esc(g.description)}</p><div class="modal-stats"><span class="modal-stat">Категория: <b>${esc(g.category)}</b></span><span class="modal-stat">Получение: <b>${esc(g.unlock)}</b></span><span class="modal-stat">Рецепт: <b>${rec?'есть':'нет в JSON'}</b></span></div>${rec?recipeDetails(rec):'<div class="modal-section"><h3>Открытие</h3><p class="modal-desc">Этот глиф не имеет обычного JSON-рецепта. Он выдаётся или открывается специальной механикой аддона.</p></div>'}`);
  }
  function recipeDetails(r){
    const ingredients=[...r.reagent.map(x=>({...x,type:'reagent'})),...r.ingredients.map(x=>({...x,type:'pedestal'}))];
    const ids=[...r.reagent,...r.ingredients];
    return `<div class="modal-section"><h3>Состав рецепта</h3><div class="ingredient-list">${ids.map((x,i)=>`<div class="ingredient">${miniIcon(x)}<div><b>${esc(entryName(x))}</b><div class="card-sub">${esc(x)}</div></div></div>`).join('')}</div><div class="modal-stats" style="margin-top:14px">${r.sourceCost!=null?`<span class="modal-stat">Source: <b>${r.sourceCost}</b></span>`:''}${r.exp!=null?`<span class="modal-stat">Опыт открытия: <b>${r.exp}</b></span>`:''}${r.tier!=null?`<span class="modal-stat">Входной уровень: <b>${r.tier}</b></span>`:''}${r.outTier!=null?`<span class="modal-stat">Итоговый уровень: <b>${r.outTier}</b></span>`:''}<span class="modal-stat">Тип: <b>${esc(r.kind)}</b></span></div></div>`;
  }
  function openRecipe(id){
    const r=recipeMap.get(id); if(!r)return;
    openModal(`<div class="modal-head">${iconBox(r.output)}<div><h2>${esc(r.outputName)}</h2><div class="id">${esc(r.output)} · ${esc(r.kind)}</div></div></div><p class="modal-desc">Рецепт <b>${esc(r.id)}</b> извлечён непосредственно из JSON-файла аддона.</p>${recipeDetails(r)}`);
  }
  function openItem(rid){
    const e=entryMap.get(rid)||glyphMap.get(rid);
    const related=D.recipes.filter(r=>r.output===rid||r.ingredients.includes(rid)||r.reagent.includes(rid)).slice(0,18);
    const isEntity=rid.includes(':')&&D.entities.some(x=>x.id===rid);
    openModal(`<div class="modal-head">${iconBox(rid,isEntity)}<div><h2>${esc(e?.name||entryName(rid))}</h2><div class="id">${esc(rid)}${e?.en?` · ${esc(e.en)}`:''}</div></div></div><p class="modal-desc">Объект зарегистрирован в Adam's Ars Plus 5.0.3. ${related.length?`Найдено связанных рецептов: ${related.length}.`:'Обычный рецепт для него в ресурсах аддона не найден.'}</p>${related.length?`<div class="modal-section"><h3>Связанные рецепты</h3><div class="data-modal-list">${related.map(r=>`<div class="search-result" data-modal-recipe="${r.id}">${miniIcon(r.output)}<span><b>${esc(r.outputName)}</b><p>${esc(r.kind)} · ${r.sourceCost!=null?r.sourceCost+' Source':r.exp!=null?r.exp+' XP':'крафт'}</p></span></div>`).join('')}</div></div>`:''}`);
    modalContent.querySelectorAll('[data-modal-recipe]').forEach(x=>x.addEventListener('click',()=>openRecipe(x.dataset.modalRecipe)));
  }

  function initDynamicSprites(){
    document.querySelectorAll('[data-soul]').forEach(el=>{const id=el.dataset.soul;const f=soulFrames[id]||1;el.style.setProperty('--frames',f);el.style.setProperty('--end',`${-(f-1)*(el.clientWidth||72)}px`);el.style.backgroundImage=`url('assets/adamsarsplus/textures/item/${id}.png')`;el.style.backgroundSize=`${el.clientWidth||72}px auto`;});
  }

  // Main navigation
  document.querySelectorAll('[data-route]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();setRoute(el.dataset.route)}));
  document.getElementById('mobile-menu').addEventListener('click',()=>sidebar.classList.toggle('open'));
  document.getElementById('modal-close').addEventListener('click',closeModal);
  modalBackdrop.addEventListener('click',e=>{if(e.target===modalBackdrop)closeModal()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();document.getElementById('global-search').focus()}});
  window.addEventListener('popstate',()=>setRoute(location.hash.slice(1)||'home',false));
  document.getElementById('about-data').addEventListener('click',()=>openModal(`<div class="modal-head">${soulSprite('elemental_soul')}<div><h2>О достоверности данных</h2><div class="id">Adam's Ars Plus 5.0.3 · Minecraft 1.20.1</div></div></div><div class="data-modal-list"><div><b>Подтверждено ресурсами</b><p>169 рецептов, 36 глифов, 76 предметов, 20 блоков, 26 сущностей, 21 эффект, 6 worldgen-структур и их биомы.</p></div><div><b>Частично разобрано по классам</b><p>Архимаги, броневые способности, Ten Shadows, адаптация Махораги, домены и собственные сетевые механики.</p></div><div><b>Следующий уровень анализа</b><p>Точные характеристики мобов, формулы урона, кулдауны, дроп, условия рангов сикигами и тесты поведения в реальном мире.</p></div></div>`));

  // Search
  const searchInput=document.getElementById('global-search'), searchResults=document.getElementById('search-results');
  const searchIndex=[
    ...D.glyphs.map(x=>({type:'Глиф',name:x.name,en:x.en,id:`adamsarsplus:${x.id}`,icon:x.icon,action:()=>{setRoute('glyphs');setTimeout(()=>openGlyph(x.id),10)}})),
    ...allEntries.map(x=>({type:D.items.includes(x)?'Предмет':D.blocks.includes(x)?'Блок':D.entities.includes(x)?'Сущность':'Эффект',name:x.name,en:x.en,id:x.id,icon:x.icon,action:()=>openItem(x.id)})),
    ...D.recipes.map(x=>({type:'Рецепт',name:x.outputName,en:x.outputEn,id:x.id,icon:x.outputIcon,action:()=>openRecipe(x.id)}))
  ];
  function doSearch(q){
    q=q.trim().toLowerCase(); if(!q){searchResults.hidden=true;return}
    const found=searchIndex.filter(x=>`${x.name} ${x.en} ${x.id} ${x.type}`.toLowerCase().includes(q)).slice(0,12);
    searchResults.innerHTML=found.length?found.map((x,i)=>`<div class="search-result" data-sri="${i}">${imgTag(x.icon,x.name)}<div><strong>${esc(x.name)}</strong><small>${esc(x.type)} · ${esc(x.en||x.id)}</small></div></div>`).join(''):'<div class="empty-state" style="padding:22px">Ничего не найдено</div>';
    searchResults.hidden=false; searchResults.querySelectorAll('[data-sri]').forEach(el=>el.addEventListener('click',()=>{searchResults.hidden=true;searchInput.value='';found[Number(el.dataset.sri)].action()}));
  }
  searchInput.addEventListener('input',e=>doSearch(e.target.value));
  document.addEventListener('click',e=>{if(!e.target.closest('.global-search-wrap'))searchResults.hidden=true});

  document.getElementById('recipe-count').textContent=D.recipes.length;
  setRoute(location.hash.slice(1)||'home',false);

  // Ambient canvas
  const canvas=document.getElementById('arcane-bg'),ctx=canvas.getContext('2d');let particles=[];
  function resize(){canvas.width=innerWidth*devicePixelRatio;canvas.height=innerHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);particles=Array.from({length:Math.min(80,Math.floor(innerWidth/18))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.2+.2,s:Math.random()*.16+.03,o:Math.random()*.32+.05}))}
  function draw(){ctx.clearRect(0,0,innerWidth,innerHeight);for(const p of particles){p.y-=p.s;if(p.y<-5){p.y=innerHeight+5;p.x=Math.random()*innerWidth}ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(170,144,255,${p.o})`;ctx.fill()}requestAnimationFrame(draw)}
  addEventListener('resize',resize);resize();draw();
})();
