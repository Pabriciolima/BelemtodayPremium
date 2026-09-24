const PUBLICATION_OPTIONS = [
  { id: 'proprio', label: 'Perfil próprio', short: 'Perfil próprio', addon: 0, icon: 'fa-user' },
  { id: 'belem-today', label: 'Belém Today', short: 'Belém Today', addon: 350, icon: 'fa-bullhorn' },
  { id: 'belem-today-geek', label: 'Belém Today Geek', short: 'Belém Today Geek', addon: 150, icon: 'fa-gamepad' }
];

const services = [
  {
    id:'video-horizontal',group:'captacao',name:'Vídeo Horizontal',
    desc:'Captação mobile profissional + edição completa para redes sociais. Formato paisagem em 4K60/4K30.',
    tag:'Paisagem',icon:'fa-image',unit:'vídeo',publication:true,
    durations:[
      {label:'Até 1min30',price:650},
      {label:'Até 3 minutos',price:650},
      {label:'Até 5 minutos',price:700},
      {label:'Até 10 minutos',price:1000}
    ]
  },
  {
    id:'video-vertical',group:'captacao',name:'Vídeo Vertical',
    desc:'Captação mobile profissional + edição completa para Reels, Stories e TikTok.',
    tag:'Retrato',icon:'fa-mobile-screen',unit:'vídeo',publication:true,
    durations:[
      {label:'Até 1min30',price:650},
      {label:'Até 3 minutos',price:650},
      {label:'Até 5 minutos',price:700},
      {label:'Até 10 minutos',price:1000}
    ]
  },
  {
    id:'drone',group:'especiais',name:'Vídeo de drone',
    desc:'Sobrevoo aéreo e plano de fachada do evento com DJI 4.',
    icon:'fa-helicopter-symbol',unit:'vídeo',
    durations:[
      {label:'Até 30 segundos',price:650},
      {label:'Até 1 minuto',price:650},
      {label:'Até 1min30',price:650}
    ]
  },
  {
    id:'chamada',group:'especiais',name:'Chamada para o evento',
    desc:'Teaser de divulgação gravado antes do evento para aquecer o público.',
    icon:'fa-bullhorn',unit:'vídeo',
    durations:[
      {label:'Até 30 segundos',price:650},
      {label:'Até 1 minuto',price:650},
      {label:'Até 1min30',price:650}
    ]
  },
  {
    id:'after-movie',group:'especiais',name:'After Movie',
    desc:'Recap cinematográfico do evento inteiro, editado no estilo documental.',
    icon:'fa-clapperboard',unit:'vídeo',
    durations:[
      {label:'Até 1min30',price:650},
      {label:'Até 3 minutos',price:900},
      {label:'Até 5 minutos',price:1200},
      {label:'Até 8 minutos',price:1600}
    ]
  },
  {id:'entrevistas',group:'especiais',name:'Entrevistas',desc:'Cobertura de entrevistas com convidados, artistas e público.',icon:'fa-microphone',price:180,unit:'entrevista',quantity:true},
  {id:'quadros',group:'especiais',name:'Brincadeiras & quadros',desc:'Conteúdos dinâmicos para engajamento com o público.',icon:'fa-gamepad',price:180,unit:'quadro',quantity:true},
  {id:'stories-live',group:'publicacoes',name:'Cobertura Stories ao vivo',desc:'Publicação em tempo real durante o evento.',icon:'fa-bolt',price:300,unit:'pacote'},
  {id:'bruto',group:'publicacoes',name:'Conteúdo bruto',desc:'Entrega organizada de todo o material captado para uso futuro.',icon:'fa-hard-drive',price:250,unit:'pacote'}
];

const state = {selected:new Map(), schedule:{multiplier:1, travel:0, notes:[]}};
const brl = value => Number(value || 0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const $ = selector => document.querySelector(selector);
const getDuration = (service, index = 0) => service.durations?.[index] || null;
const getPublication = id => PUBLICATION_OPTIONS.find(option => option.id === id) || PUBLICATION_OPTIONS[0];
const normalizePublicationIds = ids => {
  const raw = Array.isArray(ids) ? ids : (ids ? [ids] : ['proprio']);
  const valid = [...new Set(raw.filter(id => PUBLICATION_OPTIONS.some(option => option.id === id)))];
  return valid.length ? valid : ['proprio'];
};
const publicationAddon = ids => normalizePublicationIds(ids).reduce((sum,id)=>sum+getPublication(id).addon,0);
const publicationLabels = ids => normalizePublicationIds(ids).map(id=>getPublication(id).label);
const getDurationLabel = item => item.durationLabel || (item.durations ? item.durations[0].label : '');

function unitPrice(service, durationIndex = 0, publicationIds = ['proprio']) {
  const base = getDuration(service, durationIndex)?.price ?? service.price ?? 0;
  const addon = service.publication ? publicationAddon(publicationIds) : 0;
  return base + addon;
}

function createPublicationPicker(service) {
  if (!service.publication) return '';
  return `
    <div class="publication-control" onclick="event.stopPropagation()">
      <div class="publication-control-head">
        <span><i class="fa-solid fa-share-nodes"></i> Onde publicar?</span>
        <small>Você pode selecionar mais de um perfil.</small>
      </div>
      <div class="publication-options" data-publication-options>
        ${PUBLICATION_OPTIONS.map(option=>`
          <button type="button" class="publication-option ${option.id==='proprio'?'active':''}" data-publication-id="${option.id}" aria-pressed="${option.id==='proprio'?'true':'false'}">
            <i class="fa-solid ${option.icon}"></i>
            <span>${option.label}</span>
            <strong>${option.addon === 0 ? 'Incluso' : '+' + brl(option.addon)}</strong>
          </button>`).join('')}
      </div>
    </div>`;
}

function renderServices(){
  const groups={captacao:$('#grupo-captacao'),especiais:$('#grupo-especiais'),publicacoes:$('#grupo-publicacoes')};
  Object.values(groups).forEach(group=>group.innerHTML='');

  services.forEach(service=>{
    const initialPrice=unitPrice(service,0,'proprio');
    const el=document.createElement('article');
    el.className='service-card';
    el.dataset.id=service.id;

    const durationSelector=service.durations ? `
      <label class="duration-control" onclick="event.stopPropagation()">
        <span>Duração do vídeo</span>
        <select data-duration-select>
          ${service.durations.map((option,index)=>`<option value="${index}">${option.label} — ${brl(option.price)}</option>`).join('')}
        </select>
      </label>` : '';

    el.innerHTML=`
      <div class="check"><i class="fa-solid fa-check"></i></div>
      <div class="service-icon"><i class="fa-solid ${service.icon}"></i></div>
      <div class="service-info">
        <h3>${service.name}</h3>
        <p>${service.desc}</p>
        ${service.tag?`<small>${service.tag}</small>`:''}
        <div class="service-config-grid ${service.publication?'has-publication':''}">
          ${durationSelector}
          ${createPublicationPicker(service)}
        </div>
      </div>
      <div class="service-price">
        <strong data-card-price>${brl(initialPrice)}</strong>
        <span data-price-caption>por ${service.unit}</span>
        <div class="qty-control" aria-label="Quantidade de ${service.name}">
          <button type="button" data-action="minus" aria-label="Diminuir quantidade">−</button>
          <input value="1" readonly aria-label="Quantidade selecionada">
          <button type="button" data-action="plus" aria-label="Aumentar quantidade">+</button>
        </div>
      </div>`;

    el.addEventListener('click',e=>{
      if(e.target.closest('[data-action], [data-duration-select], .duration-control, [data-publication-id], .publication-control')) return;
      toggleService(service.id);
    });

    el.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',e=>{
      e.stopPropagation();
      changeQuantity(service.id,btn.dataset.action==='plus'?1:-1);
    }));

    const durationSelect=el.querySelector('[data-duration-select]');
    if(durationSelect){
      durationSelect.addEventListener('change',e=>{
        e.stopPropagation();
        const durationIndex=Number(e.target.value);
        const durationOption=getDuration(service,durationIndex);
        const current=state.selected.get(service.id);
        const publicationIds=current?.publicationIds || JSON.parse(el.dataset.publicationIds || '["proprio"]');
        el.dataset.durationIndex=String(durationIndex);
        el.querySelector('[data-card-price]').textContent=brl(unitPrice(service,durationIndex,publicationIds));

        if(state.selected.has(service.id)){
          Object.assign(current,{
            price:unitPrice(service,durationIndex,publicationIds),
            durationIndex,
            durationLabel:durationOption?.label || '',
            publicationIds,
            publicationLabels:service.publication ? publicationLabels(publicationIds) : [],
            publicationAddon:service.publication ? publicationAddon(publicationIds) : 0
          });
          syncUI();
        }
      });
    }

    el.querySelectorAll('[data-publication-id]').forEach(btn=>btn.addEventListener('click',e=>{
      e.stopPropagation();
      togglePublication(service.id,btn.dataset.publicationId,true);
    }));

    groups[service.group].appendChild(el);
  });
}

function buildSelectedItem(service, overrides={}) {
  const durationIndex=Number(overrides.durationIndex ?? 0);
  const durationOption=getDuration(service,durationIndex);
  const publicationIds=service.publication ? normalizePublicationIds(overrides.publicationIds || overrides.publicationId || ['proprio']) : [];
  return {
    ...service,
    qty:Number(overrides.qty || 1),
    durationIndex,
    durationLabel:durationOption?.label || '',
    publicationIds,
    publicationLabels:service.publication ? publicationLabels(publicationIds) : [],
    publicationAddon:service.publication ? publicationAddon(publicationIds) : 0,
    price:unitPrice(service,durationIndex,publicationIds)
  };
}

function cardPublicationIds(card){
  try{return normalizePublicationIds(JSON.parse(card?.dataset.publicationIds || '["proprio"]'));}
  catch{return ['proprio'];}
}

function toggleService(id){
  const service=services.find(s=>s.id===id);
  if(!service) return;
  if(state.selected.has(id)) state.selected.delete(id);
  else {
    const card=document.querySelector(`.service-card[data-id="${id}"]`);
    state.selected.set(id,buildSelectedItem(service,{
      durationIndex:Number(card?.dataset.durationIndex || 0),
      publicationIds:cardPublicationIds(card)
    }));
  }
  syncUI();
}

function changeQuantity(id,delta){
  const service=services.find(s=>s.id===id);
  if(!service) return;
  if(!state.selected.has(id)){
    const card=document.querySelector(`.service-card[data-id="${id}"]`);
    state.selected.set(id,buildSelectedItem(service,{
      durationIndex:Number(card?.dataset.durationIndex || 0),
      publicationIds:cardPublicationIds(card)
    }));
  }
  const item=state.selected.get(id);
  item.qty=Math.max(1,Math.min(99,item.qty+delta));
  syncUI();
}

function togglePublication(id, publicationId, autoSelect=true){
  const service=services.find(s=>s.id===id);
  if(!service?.publication) return;
  const card=document.querySelector(`.service-card[data-id="${id}"]`);
  const durationIndex=Number(card?.querySelector('[data-duration-select]')?.value || card?.dataset.durationIndex || 0);
  let ids=state.selected.has(id) ? [...state.selected.get(id).publicationIds] : cardPublicationIds(card);

  if(ids.includes(publicationId)){
    if(ids.length>1) ids=ids.filter(x=>x!==publicationId);
  }else{
    ids.push(publicationId);
  }
  ids=normalizePublicationIds(ids);
  card.dataset.publicationIds=JSON.stringify(ids);

  if(autoSelect && !state.selected.has(id)){
    state.selected.set(id,buildSelectedItem(service,{durationIndex,publicationIds:ids}));
  }else if(state.selected.has(id)){
    const item=state.selected.get(id);
    Object.assign(item,{
      publicationIds:ids,
      publicationLabels:publicationLabels(ids),
      publicationAddon:publicationAddon(ids),
      price:unitPrice(service,item.durationIndex ?? durationIndex,ids)
    });
  }
  syncUI();
}

function calculateSchedule(){
  const dateValue=$('#dataEvento').value;
  const time=$('#horaEvento').value||'14:00';
  const duration=Number($('#duracaoEvento').value);
  const notes=[];

  if(dateValue){
    const dateLabel=new Date(dateValue+'T12:00:00').toLocaleDateString('pt-BR');
    $('#dataHint').textContent=`${dateLabel} reservado na proposta — sem adicional de agenda.`;
  } else {
    $('#dataHint').textContent='Selecione uma data.';
  }

  $('#horaHint').textContent=`Início às ${time} — sem adicional por horário.`;
  if(duration===12) notes.push('evento de até 12 horas — sem adicional de agenda');

  const deslocSel=$('#deslocamento');
  let travel=Number(deslocSel.value)||0;
  if(deslocSel.selectedOptions[0]?.dataset.custom==='true') travel=(Number($('#kmPersonalizado').value)||0)*2.5;

  state.schedule={multiplier:1,travel,notes};
  updateSummary();
}

function totals(){
  const subtotal=[...state.selected.values()].reduce((sum,item)=>sum+item.price*item.qty,0);
  const travel=state.schedule.travel;
  const discountPct=Math.max(0,Math.min(30,Number($('#desconto').value)||0));
  const discount=(subtotal+travel)*(discountPct/100);
  const total=Math.max(0,subtotal+travel-discount);
  return {subtotal,travel,discountPct,discount,total};
}

function syncUI(){
  document.querySelectorAll('.service-card').forEach(card=>{
    const service=services.find(s=>s.id===card.dataset.id);
    const active=state.selected.has(card.dataset.id);
    const item=active ? state.selected.get(card.dataset.id) : null;
    card.classList.toggle('selected',active);

    const input=card.querySelector('.qty-control input');
    if(input) input.value=active?item.qty:1;

    const durationSelect=card.querySelector('[data-duration-select]');
    const durationIndex=active ? Number(item.durationIndex || 0) : Number(card.dataset.durationIndex || durationSelect?.value || 0);
    if(durationSelect) durationSelect.value=String(durationIndex);
    card.dataset.durationIndex=String(durationIndex);

    let publicationIds=['proprio'];
    if(service.publication){
      publicationIds=active ? normalizePublicationIds(item.publicationIds) : cardPublicationIds(card);
      card.dataset.publicationIds=JSON.stringify(publicationIds);
      card.querySelectorAll('[data-publication-id]').forEach(btn=>{
        const on=publicationIds.includes(btn.dataset.publicationId);
        btn.classList.toggle('active',on);
        btn.setAttribute('aria-pressed',on?'true':'false');
      });
    }

    const priceEl=card.querySelector('[data-card-price]');
    if(priceEl) priceEl.textContent=brl(active ? item.price : unitPrice(service,durationIndex,publicationIds));

    const caption=card.querySelector('[data-price-caption]');
    if(caption && service.publication){
      const labels=publicationLabels(publicationIds);
      caption.textContent=publicationAddon(publicationIds) ? `vídeo + ${labels.join(' + ')}` : 'vídeo • perfil próprio incluso';
    }
  });
  updateSummary();
}

function itemMeta(item){
  const parts=[];
  if(getDurationLabel(item)) parts.push(getDurationLabel(item));
  if(item.publicationLabels?.length) parts.push(`Publicação: ${item.publicationLabels.join(' + ')}`);
  return parts.join(' • ');
}

function updateSummary(){
  const container=$('#selectedItems');
  container.innerHTML='';
  if(!state.selected.size){
    container.innerHTML='<div class="empty-state"><i class="fa-solid fa-basket-shopping"></i><p>Selecione os serviços para começar.</p></div>';
  }

  [...state.selected.values()].forEach(item=>{
    const row=document.createElement('div');
    row.className='selected-row';
    row.innerHTML=`
      <div class="mini-icon"><i class="fa-solid ${item.icon}"></i></div>
      <div><b>${item.name}</b><small>${itemMeta(item) ? itemMeta(item)+' • ' : ''}${item.qty} × ${brl(item.price)}</small></div>
      <strong>${brl(item.price*item.qty)}</strong>
      <button aria-label="Remover"><i class="fa-solid fa-trash-can"></i></button>`;
    row.querySelector('button').onclick=()=>{state.selected.delete(item.id);syncUI();};
    container.appendChild(row);
  });

  const t=totals();
  $('#subtotalServicos').textContent=brl(t.subtotal);
  $('#valorDeslocamento').textContent=brl(t.travel);
  $('#valorDesconto').textContent=t.discount?'- '+brl(t.discount):brl(0);
  $('#totalGeral').textContent=brl(t.total);
  $('#parcelamento').textContent=`ou 3x de ${brl(t.total/3)}`;
}

function proposalHTML(){
  const t=totals();
  const date=$('#dataEvento').value?new Date($('#dataEvento').value+'T12:00:00').toLocaleDateString('pt-BR'):'A definir';
  const nf=$('#notaFiscal').value==='sim'?'Sim — emitir nota fiscal':'Não solicitada';
  const items=[...state.selected.values()].map(i=>`
    <tr>
      <td>${i.name}${itemMeta(i)?`<br><small>${itemMeta(i)}</small>`:''}</td>
      <td>${i.qty}</td>
      <td>${brl(i.price*i.qty)}</td>
    </tr>`).join('');

  return `<div class="proposal">
    <div class="proposal-header">
      <div class="proposal-logo"><div class="brand-mark">BELÉM<br>TODAY</div><div><h1 id="modalTitle">Proposta Comercial</h1><small>Produção de conteúdo & cobertura de eventos</small></div></div>
      <div class="meta"><b>Data de emissão:</b> ${new Date().toLocaleDateString('pt-BR')}<br><b>Validade:</b> ${$('#validade').value}</div>
    </div>
    <div class="proposal-section"><h2>Dados do cliente</h2><p>
      <b>Cliente:</b> ${$('#clienteNome').value||'Não informado'}<br>
      <b>Evento:</b> ${$('#eventoNome').value||'Não informado'}<br>
      <b>Contato:</b> ${$('#clienteContato').value||'Não informado'}<br>
      <b>Data e horário:</b> ${date} às ${$('#horaEvento').value||'A definir'}<br>
      <b>Duração:</b> até ${$('#duracaoEvento').value} horas<br>
      <b>Nota fiscal:</b> ${nf}
    </p></div>
    <div class="proposal-section"><h2>Serviços selecionados</h2><table class="proposal-table"><thead><tr><th>Serviço</th><th>Qtd.</th><th>Valor</th></tr></thead><tbody>${items||'<tr><td colspan="3">Nenhum serviço selecionado.</td></tr>'}</tbody></table></div>
    <div class="proposal-total"><div><p><span>Subtotal</span><b>${brl(t.subtotal)}</b></p><p><span>Deslocamento</span><b>${brl(t.travel)}</b></p><p><span>Desconto (${t.discountPct}%)</span><b>- ${brl(t.discount)}</b></p><p class="grand"><span>Total</span><b>${brl(t.total)}</b></p></div></div>
    <div class="proposal-section proposal-notes"><h2>Condições</h2><p>Reserva de agenda mediante pagamento de sinal. Alterações de escopo podem gerar revisão de valores. Despesas não previstas, como hospedagem, balsa, estacionamento ou autorizações especiais, serão apresentadas previamente.</p>${$('#observacoes').value?`<p><b>Observações:</b> ${$('#observacoes').value}</p>`:''}</div>
    <div class="proposal-contact"><strong>Belém Today</strong><span>belemtoday@outlook.com • (91) 98451-3581</span><small>Captação mobile premium para redes sociais.</small></div>
  </div>`;
}

function openModal(){
  if(!state.selected.size)return toast('Selecione ao menos um serviço.');
  $('#printArea').innerHTML=proposalHTML();
  $('#quoteModal').classList.add('open');
  $('#quoteModal').setAttribute('aria-hidden','false');
}
function closeModal(){$('#quoteModal').classList.remove('open');$('#quoteModal').setAttribute('aria-hidden','true');}
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>el.classList.remove('show'),2400)}

const STORAGE_KEY='belemTodayQuoteV4MultiProfile';
function saveQuote(){
  const data={
    selected:[...state.selected.entries()],
    fields:{
      date:$('#dataEvento').value,time:$('#horaEvento').value,duration:$('#duracaoEvento').value,
      travel:$('#deslocamento').selectedIndex,km:$('#kmPersonalizado').value,type:$('#tipoEvento').value,
      discount:$('#desconto').value,client:$('#clienteNome').value,event:$('#eventoNome').value,
      contact:$('#clienteContato').value,validity:$('#validade').value,notes:$('#observacoes').value,
      invoice:$('#notaFiscal').value
    }
  };
  localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
  toast('Orçamento salvo neste dispositivo.');
}

function loadQuote(){
  const raw=localStorage.getItem(STORAGE_KEY);
  if(!raw)return;
  try{
    const d=JSON.parse(raw);
    state.selected=new Map();
    (d.selected||[]).forEach(([id,saved])=>{
      const service=services.find(s=>s.id===id);
      if(!service) return;
      state.selected.set(id,buildSelectedItem(service,{
        qty:saved.qty,
        durationIndex:saved.durationIndex,
        publicationIds:saved.publicationIds || saved.publicationId || ['proprio']
      }));
    });
    const f=d.fields||{};
    $('#dataEvento').value=f.date||'';
    $('#horaEvento').value=f.time||'14:00';
    $('#duracaoEvento').value=f.duration||'12';
    $('#deslocamento').selectedIndex=f.travel||0;
    $('#kmPersonalizado').value=f.km||'';
    $('#tipoEvento').value=f.type||'1';
    $('#desconto').value=f.discount||0;
    $('#clienteNome').value=f.client||'';
    $('#eventoNome').value=f.event||'';
    $('#clienteContato').value=f.contact||'';
    $('#validade').value=f.validity||'10 dias';
    $('#observacoes').value=f.notes||'';
    $('#notaFiscal').value=f.invoice||'nao';
    calculateSchedule();
    syncUI();
  }catch(e){console.error(e)}
}

renderServices();
loadQuote();
calculateSchedule();

['dataEvento','horaEvento','duracaoEvento','tipoEvento','kmPersonalizado','desconto'].forEach(id=>$('#'+id).addEventListener('input',calculateSchedule));
$('#deslocamento').addEventListener('change',()=>{$('#campoKm').classList.toggle('hidden',$('#deslocamento').selectedOptions[0]?.dataset.custom!=='true');calculateSchedule();});
$('#btnGerar').onclick=openModal;
$('#btnLimpar').onclick=()=>{state.selected.clear();$('#desconto').value=0;syncUI();toast('Seleção limpa.');};
$('#btnSalvar').onclick=saveQuote;
document.querySelectorAll('[data-close-modal]').forEach(el=>el.onclick=closeModal);
$('#btnImprimir').onclick=()=>{
  const tituloOriginal=document.title;
  const cliente=($('#clienteNome')?.value||'Cliente').trim().replace(/[^a-zA-ZÀ-ÿ0-9 _-]/g,'');
  const evento=($('#eventoNome')?.value||'Orcamento').trim().replace(/[^a-zA-ZÀ-ÿ0-9 _-]/g,'');
  document.title=`Proposta Belém Today - ${evento} - ${cliente}`;
  window.print();
  setTimeout(()=>{document.title=tituloOriginal;},500);
};
$('#btnCopiar').onclick=async()=>{
  const t=totals();
  const txt=`PROPOSTA BELÉM TODAY\nCliente: ${$('#clienteNome').value||'-'}\nEvento: ${$('#eventoNome').value||'-'}\nData: ${$('#dataEvento').value||'-'} ${$('#horaEvento').value||''}\nNota fiscal: ${$('#notaFiscal').value==='sim'?'Sim':'Não'}\n\n${[...state.selected.values()].map(i=>`${i.qty}x ${i.name}${itemMeta(i)?' ('+itemMeta(i)+')':''}: ${brl(i.price*i.qty)}`).join('\n')}\n\nTOTAL: ${brl(t.total)}\n\nBelém Today | belemtoday@outlook.com | (91) 98451-3581`;
  await navigator.clipboard.writeText(txt);
  toast('Resumo copiado.');
};
$('#btnCarregarDemo').onclick=()=>{
  state.selected.clear();
  ['video-vertical','drone','chamada','after-movie','entrevistas','quadros','stories-live','bruto'].forEach(id=>{
    const s=services.find(x=>x.id===id);
    state.selected.set(id,buildSelectedItem(s,{
      qty:id==='entrevistas'?6:id==='quadros'?3:1,
      publicationIds:id==='video-vertical'?['belem-today','belem-today-geek']:['proprio']
    }));
  });
  $('#eventoNome').value='Multiverso Geek 2026';
  $('#clienteNome').value='Organização do Evento';
  $('#duracaoEvento').value='12';
  syncUI();
  calculateSchedule();
  toast('Exemplo carregado.');
};

// Mobile-first: barra fixa de resumo sem alterar a lógica existente.
(function initMobileBudgetBar(){
  const totalEl=document.getElementById('mobileTotal');
  const countEl=document.getElementById('mobileItemCount');
  const reviewBtn=document.getElementById('mobileReviewBtn');
  if(!totalEl||!countEl||!reviewBtn) return;
  const refresh=()=>{
    const desktopTotal=document.getElementById('totalGeral');
    if(desktopTotal) totalEl.textContent=desktopTotal.textContent;
    const qty=[...state.selected.values()].reduce((sum,item)=>sum+Number(item.qty||1),0);
    countEl.textContent=qty===0?'Nenhum serviço selecionado':`${qty} ${qty===1?'item selecionado':'itens selecionados'}`;
  };
  const originalSync=window.syncUI;
  // syncUI é declaração global; observar mudanças no resumo garante atualização sem interferir no cálculo.
  const target=document.getElementById('resumo');
  if(target) new MutationObserver(refresh).observe(target,{subtree:true,childList:true,characterData:true});
  reviewBtn.addEventListener('click',()=>document.getElementById('btnGerar')?.click());
  refresh();
})();



// ============================================================
// MOTION PREMIUM — microinterações e animações progressivas
// Mantém toda a lógica de orçamento existente intacta.
// ============================================================
(function initPremiumMotion(){
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Progresso de leitura
  const progress = document.getElementById('scrollProgress');
  const updateProgress = () => {
    if(!progress) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? (scrollY / max) * 100 : 0;
    progress.style.width = `${Math.max(0, Math.min(100, pct))}%`;
  };
  addEventListener('scroll', updateProgress, {passive:true});
  updateProgress();

  // Reveal progressivo como nos motion-layouts modernos
  const revealEls = document.querySelectorAll('[data-reveal]');
  if(!reduced && 'IntersectionObserver' in window){
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold:.08, rootMargin:'0px 0px -5% 0px'});
    revealEls.forEach(el => observer.observe(el));
  }else revealEls.forEach(el => el.classList.add('is-visible'));

  // Cards entram em cascata
  const observeServiceCards = () => {
    const cards = [...document.querySelectorAll('.service-card')];
    cards.forEach((card,index)=>card.style.setProperty('--delay',`${Math.min(index,8)*55}ms`));
    if(!reduced && 'IntersectionObserver' in window){
      const cardObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if(entry.isIntersecting){
            entry.target.classList.add('is-visible');
            cardObserver.unobserve(entry.target);
          }
        });
      }, {threshold:.04, rootMargin:'0px 0px -2% 0px'});
      cards.forEach(card => cardObserver.observe(card));
    }else cards.forEach(card=>card.classList.add('is-visible'));
  };
  requestAnimationFrame(observeServiceCards);

  // Leve parallax somente em telas com mouse; não afeta mobile.
  const stage = document.querySelector('[data-parallax-stage]');
  if(stage && !reduced && matchMedia('(hover:hover) and (pointer:fine)').matches){
    stage.addEventListener('pointermove', e => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      stage.style.transform = `rotateX(${y * -3}deg) rotateY(${x * 4}deg)`;
      stage.querySelectorAll('[data-depth]').forEach(el=>{
        const d = Number(el.dataset.depth || 1);
        el.style.translate = `${x*10*d}px ${y*9*d}px`;
      });
    });
    stage.addEventListener('pointerleave',()=>{
      stage.style.transform='';
      stage.querySelectorAll('[data-depth]').forEach(el=>el.style.translate='');
    });
  }

  // Feedback visual ao selecionar um serviço.
  document.addEventListener('click', e=>{
    const card = e.target.closest('.service-card');
    if(!card) return;
    if(e.target.closest('select,input,textarea,.publication-option,.qty-control')) return;
    card.classList.remove('is-bouncing');
    void card.offsetWidth;
    card.classList.add('is-bouncing');
    setTimeout(()=>card.classList.remove('is-bouncing'),520);
  });

  // Total "respira" quando muda.
  const total = document.getElementById('totalGeral');
  if(total && 'MutationObserver' in window){
    new MutationObserver(()=>{
      total.classList.remove('total-pop');
      void total.offsetWidth;
      total.classList.add('total-pop');
    }).observe(total,{childList:true,characterData:true,subtree:true});
  }

  // Navegação de etapas acompanha a seção ativa no mobile.
  const progressLinks=[...document.querySelectorAll('.mobile-progress a')];
  const sections=['servicos','agenda','dados-proposta'].map(id=>document.getElementById(id)).filter(Boolean);
  if(progressLinks.length && sections.length && 'IntersectionObserver' in window){
    const stepObserver=new IntersectionObserver(entries=>{
      const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(!visible) return;
      progressLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')===`#${visible.target.id}`));
    },{threshold:[.18,.4,.7],rootMargin:'-20% 0px -55% 0px'});
    sections.forEach(s=>stepObserver.observe(s));
  }
})();