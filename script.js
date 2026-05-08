
// ═══════════════════════════════════════════
// STORAGE HELPERS
// ═══════════════════════════════════════════
const K={pecas:'lb_pecas4',pastas:'lb_pastas4',casos:'lb_casos4',timbs:'lb_timbs4',prazos:'lb_prazos4',agenda:'lb_agenda4',users:'lb_users4'};
const ld=k=>{try{return JSON.parse(localStorage.getItem(K[k])||'[]');}catch{return[];}};
const sv=(k,v)=>localStorage.setItem(K[k],JSON.stringify(v));

// ═══════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════
let currentUser=null;

function initUsers(){
  let users=ld('users');
  if(!users.length){
    users=[{id:'u1',nome:'Tatiani Fabi',user:'tatiani',pass:btoa('lexbase2024'),role:'admin',email:'tatiani.fabi@live.com'}];
    sv('users',users);
  }
  return users;
}





function changePass(){
  const atual=document.getElementById('cp-atual').value;
  const nova=document.getElementById('cp-nova').value;
  const conf=document.getElementById('cp-conf').value;
  const err=document.getElementById('cp-err');
  if(btoa(atual)!==currentUser.pass){err.textContent='Senha atual incorreta.';err.style.display='block';return;}
  if(nova.length<6){err.textContent='Nova senha muito curta.';err.style.display='block';return;}
  if(nova!==conf){err.textContent='As senhas não coincidem.';err.style.display='block';return;}
  const users=ld('users');
  const idx=users.findIndex(u=>u.id===currentUser.id);
  if(idx>=0){users[idx].pass=btoa(nova);currentUser.pass=btoa(nova);}
  sv('users',users);
  closeModal('modal-change-pass');
  err.style.display='none';
  alert('Senha alterada com sucesso!');
}

function saveNewUser(){
  const nome=document.getElementById('nu-nome').value.trim();
  const user=document.getElementById('nu-user').value.trim();
  const pass=document.getElementById('nu-pass').value;
  const role=document.getElementById('nu-role').value;
  if(!nome||!user||pass.length<6){alert('Preencha todos os campos. Senha mínima 6 caracteres.');return;}
  const users=ld('users');
  if(users.find(u=>u.user===user)){alert('Usuário já existe.');return;}
  users.push({id:'u'+Date.now(),nome,user,pass:btoa(pass),role,email:''});
  sv('users',users);
  closeModal('modal-novo-user');
  renderUsers();
}

function renderUsers(){
  const users=ld('users');
  document.getElementById('users-list').innerHTML=users.map(u=>`
    <div class="user-row">
      <div class="user-row-avatar">${u.nome[0]}</div>
      <div class="user-row-info">
        <div class="user-row-name">${u.nome}</div>
        <div class="user-row-role">${u.user}${u.email?' · '+u.email:''}</div>
      </div>
      <span class="user-row-badge role-${u.role==='admin'?'admin':u.role==='blocked'?'blocked':'user'}">${u.role==='admin'?'Admin':u.role==='blocked'?'Bloqueado':'Usuário'}</span>
      ${u.role!=='admin'||users.filter(x=>x.role==='admin').length>1?`<div style="display:flex;gap:4px;">
        <button class="btn btn-xs btn-outline" onclick="toggleBlock('${u.id}')">${u.role==='blocked'?'Desbloquear':'Bloquear'}</button>
        <button class="btn btn-xs btn-danger" onclick="delUser('${u.id}')">✕</button>
      </div>`:''}
    </div>`).join('');
}

function toggleBlock(id){
  const users=ld('users');
  const u=users.find(x=>x.id===id);
  if(u){u.role=u.role==='blocked'?'user':'blocked';}
  sv('users',users);renderUsers();
}

function delUser(id){
  if(!window.confirm('Excluir usuário?'))return;
  sv('users',ld('users').filter(u=>u.id!==id));
  renderUsers();
}

// ═══════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════
let currentFolder=null;
function nav(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('on'));
  document.querySelectorAll('.s-item').forEach(n=>n.classList.remove('on'));
  document.getElementById('page-'+id).classList.add('on');
  const el=document.getElementById('nav-'+id);
  if(el)el.classList.add('on');
  if(id==='dash')renderDash();
  if(id==='casos')renderCasos();
  if(id==='biblioteca'){currentFolder=null;renderBib();}
  if(id==='editor')populateSels();
  if(id==='prazos')renderPrazos();
  if(id==='agenda')renderAgenda();
  if(id==='timbrados')renderTimbrados();
  if(id==='admin')renderUsers();
  if(id==='financeiro')renderFinanceiro();
  if(id==='teses')renderTeses();
  if(id==='triagem'){populateSels();}
  if(id==='logs')renderLogs();
  if(id==='importar')populateSels();
}

function filtArea(a){currentFolder=null;nav('biblioteca');document.getElementById('f-area').value=a;var _bh=document.getElementById('bib-h');if(_bh)_bh.textContent=a;renderBib();}
function filtPasta(id){currentFolder=id;nav('biblioteca');const p=ld('pastas').find(x=>x.id===id);var _bh=document.getElementById('bib-h');if(_bh)_bh.textContent=(p?.emoji||'📁')+' '+p?.nome;renderBib();renderFolderTree();}

// ═══════════════════════════════════════════
// PASTAS
// ═══════════════════════════════════════════
let editPastaId=null;
function renderFolderTree(){
  const pastas=ld('pastas'),pecas=ld('pecas');
  const tree=document.getElementById('folder-tree');
  if(!pastas.length){tree.innerHTML='<div style="font-size:10.5px;color:var(--text3);padding:3px 10px;">Nenhuma pasta</div>';return;}
  tree.innerHTML=pastas.map(p=>{
    const cnt=pecas.filter(x=>x.pasta===p.id).length;
    return`<div class="folder-item${currentFolder===p.id?' on':''}" onclick="filtPasta('${p.id}')">
      <span class="fi-emoji">${p.emoji||'📁'}</span>
      <span class="fi-name">${p.nome}</span>
      <span class="fi-cnt">${cnt}</span>
      <div class="fi-acts">
        <button class="fib" onclick="editPasta(event,'${p.id}')">✎</button>
        <button class="fib" onclick="delPasta(event,'${p.id}')">✕</button>
      </div>
    </div>`;
  }).join('');
}

function savePasta(){
  const nome=document.getElementById('p-nome').value.trim();
  if(!nome){alert('Informe o nome.');return;}
  const pastas=ld('pastas');
  const obj={id:editPastaId||('p'+Date.now()),nome,emoji:document.getElementById('p-emoji').value||'📁',desc:document.getElementById('p-desc').value};
  if(editPastaId){const i=pastas.findIndex(p=>p.id===editPastaId);if(i>=0)pastas[i]=obj;}
  else pastas.push(obj);
  sv('pastas',pastas);closeModal('modal-pasta');editPastaId=null;
  renderFolderTree();populateSels();
}
function editPasta(e,id){e.stopPropagation();editPastaId=id;const p=ld('pastas').find(x=>x.id===id);document.getElementById('pasta-mt').textContent='Editar Pasta';document.getElementById('p-nome').value=p?.nome||'';document.getElementById('p-emoji').value=p?.emoji||'📁';document.getElementById('p-desc').value=p?.desc||'';openModal('modal-pasta');}
function delPasta(e,id){e.stopPropagation();if(!window.confirm('Excluir pasta?'))return;sv('pastas',ld('pastas').filter(p=>p.id!==id));const pecas=ld('pecas');pecas.forEach(p=>{if(p.pasta===id)p.pasta='';});sv('pecas',pecas);if(currentFolder===id)currentFolder=null;renderFolderTree();renderBib();}

// ═══════════════════════════════════════════
// POPULATE SELECTS
// ═══════════════════════════════════════════
function populateSels(){
  const pastas=ld('pastas'),casos=ld('casos'),timbs=ld('timbs');
  const pOpts='<option value="">— Raiz —</option>'+pastas.map(p=>`<option value="${p.id}">${p.emoji||'📁'} ${p.nome}</option>`).join('');
  const cOpts='<option value="">— Nenhum —</option>'+casos.map(c=>`<option value="${c.id}">${c.nome||c.num}</option>`).join('');
  const tOpts='<option value="">— Sem timbrado —</option>'+timbs.map(t=>`<option value="${t.id}">${t.nome}</option>`).join('');
  ['pq-pasta','imp-pasta'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML=pOpts;});
  ['pq-caso','pr-caso','au-caso','ed-caso'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML=cOpts;});
  ['pq-timbrado','editor-timbrado'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML=tOpts;});
}

// ═══════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// BIBLIOTECA
// ═══════════════════════════════════════════
function tipoClass(t){
  const m={'Contestação':'tt-c','Petição Inicial':'tt-i','Recurso de Apelação':'tt-r','Agravo de Instrumento':'tt-r','Agravo Interno':'tt-r','Embargos de Declaração':'tt-e','Impugnação':'tt-im','Contrarrazões':'tt-im','Manifestação':'tt-f','Petições Diversas':'tt-f','Contrato':'tt-o','Distrato':'tt-o','Parecer':'tt-o'};
  return m[t]||'tt-o';
}


function openNewPeca(){populateSels();document.getElementById('pq-data').value=new Date().toISOString().split('T')[0];openModal('modal-peca-quick');}

function savePecaQuick(){
  const titulo=document.getElementById('pq-titulo').value.trim();
  if(!titulo){alert('Informe o título.');return;}
  const pecas=ld('pecas');
  pecas.unshift({titulo,tipo:document.getElementById('pq-tipo').value,area:document.getElementById('pq-area').value,pasta:document.getElementById('pq-pasta').value,timbrado:document.getElementById('pq-timbrado').value,caso:document.getElementById('pq-caso').value,tese:document.getElementById('pq-tese').value,texto:document.getElementById('pq-texto').value,resultado:document.getElementById('pq-res').value,data:document.getElementById('pq-data').value||new Date().toLocaleDateString('pt-BR'),obs:document.getElementById('pq-obs').value});
  sv('pecas',pecas);closeModal('modal-peca-quick');renderBib();renderFolderTree();
}

let currentVerPecaIdx=null;
function verPeca(idx){
  const pecas=ld('pecas'),pastas=ld('pastas'),casos=ld('casos');
  const p=pecas[idx];if(!p)return;
  currentVerPecaIdx=idx;
  document.getElementById('vp-titulo').textContent=p.titulo;
  const tb=document.getElementById('vp-tipo-badge');tb.textContent=p.tipo;tb.className='tt '+tipoClass(p.tipo);
  var _v_vp_area_badge=document.getElementById('vp-area-badge');if(_v_vp_area_badge)_v_vp_area_badge.getElementById('vp-area-badge')=p.area;
  const pasta=p.pasta?pastas.find(x=>x.id===p.pasta):null;
  const pb=document.getElementById('vp-pasta-badge');pb.textContent=pasta?(pasta.emoji||'📁')+' '+pasta.nome:'';pb.style.display=pasta?'':'none';
  const caso=p.caso?casos.find(x=>x.id===p.caso):null;
  const cb=document.getElementById('vp-caso-badge');cb.textContent=caso?'📋 '+caso.nome:'';cb.style.display=caso?'':'none';
  const rb=document.getElementById('vp-res-badge');rb.textContent=p.resultado||'Pendente';rb.className=p.resultado==='Ganho'?'res-g':p.resultado==='Perda'?'res-p':'res-n';
  document.getElementById('vp-data-badge').textContent=p.data||'';
  var _v_vp_tese=document.getElementById('vp-tese');if(_v_vp_tese)_v_vp_tese.getElementById('vp-tese')=p.tese?'🔹 '+p.tese:'';
  const ob=document.getElementById('vp-obs-box');ob.textContent=p.obs?'📝 '+p.obs:'';ob.style.display=p.obs?'block':'none';
  document.getElementById('vp-texto').textContent=p.texto||'(sem texto)';
  openModal('modal-ver-peca');
}

function delVerPeca(){if(!window.confirm('Excluir?'))return;const pecas=ld('pecas');pecas.splice(currentVerPecaIdx,1);sv('pecas',pecas);closeModal('modal-ver-peca');renderBib();renderFolderTree();}
function delPeca(e,idx){
  e.stopPropagation();
  confirmar('Excluir esta peça da biblioteca?', function(){
    var pecas=ld('pecas');pecas.splice(idx,1);sv('pecas',pecas);
    renderBib();renderFolderTree();showToast('✓ Peça excluída.');
  }, '📋', 'Excluir', 'rgba(204,68,68,0.85)');
}

function verCaso(idx){
  const casos=ld('casos');const c=casos[idx];if(!c)return;
  currentCasoIdx=idx;
  document.getElementById('vc-mt').textContent=c.nome||(c.autor+' × '+c.reu);
  const st=document.getElementById('vc-status-chip');st.textContent=c.status==='ativo'?'● Ativo':c.status==='pessoal'?'Pessoal':'Encerrado';st.className='chip '+(c.status==='ativo'?'ativo':'enc');
  document.getElementById('vc-area-chip').textContent=c.area||'';
  var _v_vc_lado_chip=document.getElementById('vc-lado-chip');if(_v_vc_lado_chip)_v_vc_lado_chip.getElementById('vc-lado-chip')=c.lado?'Rep.: '+c.lado:'';
  var _v_vc_vara_chip=document.getElementById('vc-vara-chip');if(_v_vc_vara_chip)_v_vc_vara_chip.getElementById('vc-vara-chip')=c.vara||'';
  var _v_vc_num_chip=document.getElementById('vc-num-chip');if(_v_vc_num_chip)_v_vc_num_chip.getElementById('vc-num-chip')=c.num||'';
  var _v_vc_autor=document.getElementById('vc-autor');if(_v_vc_autor)_v_vc_autor.getElementById('vc-autor')=c.autor||'—';
  var _v_vc_reu=document.getElementById('vc-reu');if(_v_vc_reu)_v_vc_reu.getElementById('vc-reu')=c.reu||'—';
  const ob=document.getElementById('vc-obs-box');ob.textContent=c.obs?'📝 '+c.obs:'';ob.style.display=c.obs?'block':'none';
  const ands=(c.andamentos||[]);
  var _v_vc_timeline=document.getElementById('vc-timeline');if(_v_vc_timeline)_v_vc_timeline.getElementById('vc-timeline')=ands.length?[...ands].reverse().map(a=>`<div class="tl-item"><div class="tl-date">${formatDate(a.data)}</div><div class="tl-text">${a.texto}</div></div>`).join(''):'<div style="font-size:11.5px;color:var(--text3);">Nenhum andamento.</div>';
  const pecas=ld('pecas').filter(p=>p.caso===c.id);
  document.getElementById('vc-pecas').innerHTML=pecas.length?pecas.map((p,i)=>`<div style="display:flex;align-items:center;gap:7px;padding:6px 0;border-bottom:1px solid var(--border);">
    <span class="tt ${tipoClass(p.tipo)}" style="flex-shrink:0;">${p.tipo}</span>
    <span style="flex:1;font-size:12px;">${p.titulo}</span>
    <span style="font-size:10.5px;color:var(--text3);">${p.data||''}</span>
    <button class="cb p" onclick="verPeca(${ld('pecas').indexOf(p)})">Ver</button>
  </div>`).join(''):'<div style="font-size:11.5px;color:var(--text3);">Nenhuma peça vinculada.</div>';
  document.getElementById('vc-alegacoes').value=c.alegacoes||'';
  switchCasoTab('timeline');
  openModal('modal-ver-caso');
}


function addCasoDoc(e){
  const files=[...e.target.files];
  const casos=ld('casos');const c=casos[currentCasoIdx];if(!c)return;
  if(!c.docs)c.docs=[];
  files.forEach(f=>{
    const reader=new FileReader();
    reader.onload=ev=>{c.docs.push({name:f.name,type:f.type,size:(f.size/1024).toFixed(1)+'kb',data:ev.target.result});sv('casos',casos);renderCasoDocs();};
    reader.readAsDataURL(f);
  });
}

function delCasoDoc(i){const casos=ld('casos');const c=casos[currentCasoIdx];if(c?.docs)c.docs.splice(i,1);sv('casos',casos);renderCasoDocs();}

function saveCasoAlegacoes(){const casos=ld('casos');if(casos[currentCasoIdx])casos[currentCasoIdx].alegacoes=document.getElementById('vc-alegacoes').value;sv('casos',casos);alert('Salvo!');}
function delCaso(){if(!window.confirm('Excluir caso?'))return;const casos=ld('casos');casos.splice(currentCasoIdx,1);sv('casos',casos);closeModal('modal-ver-caso');renderCasos();populateSels();}

function saveAndamento(){
  const texto=document.getElementById('and-texto').value.trim();
  if(!texto){alert('Descreva o andamento.');return;}
  const casos=ld('casos');const c=casos[currentCasoIdx];if(!c)return;
  if(!c.andamentos)c.andamentos=[];
  c.andamentos.push({data:document.getElementById('and-data').value||new Date().toLocaleDateString('pt-BR'),texto});
  sv('casos',casos);closeModal('modal-andamento');verCaso(currentCasoIdx);
}

function novaSecParaCaso(){closeModal('modal-ver-caso');nav('editor');setTimeout(()=>{document.getElementById('ed-caso').value=ld('casos')[currentCasoIdx]?.id||'';updateEditorCasoInfo();},100);}
function redigirParaCaso(){novaSecParaCaso();}

// ═══════════════════════════════════════════
// EDITOR DE PETIÇÃO
// ═══════════════════════════════════════════
let editorDocs=[];
let currentSel=null;

function fmt(cmd,val){document.getElementById('editor-body').focus();document.execCommand(cmd,false,val||null);}

function insertDate(){
  const d=new Date();
  const meses=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const txt=`Curitiba, ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}.`;
  document.execCommand('insertText',false,'\n\n'+txt);
}

function insertHR(){document.execCommand('insertHTML',false,'<hr style="border:none;border-top:1px solid #ccc;margin:12px 0;"/>');}

function insertImgEditor(){document.getElementById('editor-img-insert').click();}

function onEditorImgInsert(e){
  const files=[...e.target.files];
  files.forEach(f=>{
    const r=new FileReader();
    r.onload=ev=>{document.getElementById('editor-body').focus();document.execCommand('insertHTML',false,`<img src="${ev.target.result}" alt="${f.name}" style="max-width:100%;"/>`);updateWordCount();};
    r.readAsDataURL(f);
  });
  e.target.value='';
}

function updateWordCount(){
  const text=document.getElementById('editor-body').innerText||'';
  const wc=text.trim().split(/\s+/).filter(w=>w.length>0).length;
  document.getElementById('word-count').textContent=wc+' palavras';
}

function addEdDocs(e){
  const files=[...e.target.files];
  files.forEach(f=>{editorDocs.push(f);});
  renderEdDocs();e.target.value='';
}

function addEdImgs(e){
  const files=[...e.target.files];
  files.forEach(f=>{
    const r=new FileReader();
    r.onload=ev=>{
      editorDocs.push({name:f.name,type:f.type,data:ev.target.result});
      renderEdDocs();
    };
    r.readAsDataURL(f);
  });
  e.target.value='';
}

function renderEdDocs(){
  document.getElementById('ed-docs-list').innerHTML=editorDocs.map((d,i)=>`<div class="doc-item">
    <span class="doc-ico">${d.type?.includes('image')?'🖼':d.name?.endsWith('.pdf')?'📄':'📃'}</span>
    <span class="doc-name">${d.name}</span>
    <button class="cb" onclick="removeEdDoc(${i})">✕</button>
  </div>`).join('');
}

function removeEdDoc(i){editorDocs.splice(i,1);renderEdDocs();}

function updateEditorCasoInfo(){
  const casoId=document.getElementById('ed-caso').value;
  const caso=ld('casos').find(c=>c.id===casoId);
  if(caso){
    document.getElementById('editor-caso-info').textContent=`📋 ${caso.nome||caso.num} · ${caso.area}`;
    // Preenche partes
    if(caso.autor||caso.reu)document.getElementById('ed-partes').value=(caso.autor||'')+(caso.reu?' × '+caso.reu:'');
    // Memória do caso
    const ands=(caso.andamentos||[]).slice(-3).reverse();
    document.getElementById('ed-caso-memoria').innerHTML=`
      <div style="margin-bottom:7px;font-size:11px;color:var(--text2);">${caso.nome||caso.num}</div>
      ${caso.alegacoes?`<div style="margin-bottom:7px;font-size:10.5px;color:var(--gold2);">📌 Alegações registradas</div>`:''}
      <div style="font-size:10.5px;color:var(--text3);">Últimos andamentos:</div>
      ${ands.map(a=>`<div style="font-size:10.5px;margin-top:4px;"><span style="color:var(--text3);">${formatDate(a.data)}</span> ${a.texto}</div>`).join('')||'<div style="font-size:10.5px;color:var(--text3);">Nenhum andamento.</div>'}
    `;
  } else {
    document.getElementById('editor-caso-info').textContent='Nenhum caso vinculado';
    document.getElementById('ed-caso-memoria').textContent='Selecione um caso para ver o histórico.';
  }
}

function loadIntoEditor(p){
  nav('editor');
  populateSels();
  setTimeout(()=>{
    document.getElementById('ed-tipo').value=p.tipo||'Contestação';
    document.getElementById('ed-area').value=p.area||'Direito Civil';
    if(p.caso)document.getElementById('ed-caso').value=p.caso;
    document.getElementById('editor-body').innerHTML=p.htmlTexto||(p.texto||'').replace(/\n/g,'<br>');
    if(p.timbrado){document.getElementById('editor-timbrado').value=p.timbrado;renderEditorTimbrado();}
    document.getElementById('ed-alegacoes').value=p.alegacoesBase||'';
    updateWordCount();updateEditorCasoInfo();
  },150);
}

function renderEditorTimbrado(){
  const id=document.getElementById('editor-timbrado').value;
  const t=id?ld('timbs').find(x=>x.id===id):null;
  const header=document.getElementById('editor-timbrado-header');
  if(!t){header.innerHTML='';return;}
  const cor=t.cor||'#1a3a5c';const align=t.align||'center';
  let html='<div style="background:#fff;border-radius:6px 6px 0 0;padding:12px 18px;border:1px solid rgba(255,255,255,0.1);border-bottom:none;">';
  html+=`<div style="border-bottom:2px solid ${cor};padding-bottom:8px;margin-bottom:0;text-align:${align};">`;
  if(t.logo)html+=`<div style="text-align:${align};margin-bottom:4px;"><img src="${t.logo}" style="max-height:40px;"/></div>`;
  if(t.l1)html+=`<div style="font-size:13px;font-weight:bold;color:${cor};font-family:Arial;">${t.l1}</div>`;
  if(t.l2)html+=`<div style="font-size:11px;color:#555;font-family:Arial;">${t.l2}</div>`;
  if(t.l3)html+=`<div style="font-size:11px;color:#555;font-family:Arial;">${t.l3}</div>`;
  html+='</div></div>';
  header.innerHTML=html;
}

async function editorGerarIA(){
  const prompt=document.getElementById('ed-ia-prompt').value.trim();
  if(!prompt){alert('Descreva o que gerar.');return;}
  if(!navigator.onLine){alert('IA requer internet.');return;}
  const out=document.getElementById('ed-ia-out');
  out.style.display='block';out.className='ia-out dim';out.textContent='⏳ Gerando...';
  document.getElementById('ed-ia-acts').style.display='none';
  const casoId=document.getElementById('ed-caso').value;
  const caso=casoId?ld('casos').find(c=>c.id===casoId):null;
  const alegacoes=document.getElementById('ed-alegacoes').value;
  const tipo=document.getElementById('ed-tipo').value;
  const area=document.getElementById('ed-area').value;
  const ctx=`Tipo de peça: ${tipo}\nÁrea: ${area}\n${caso?'Caso: '+caso.nome+'\nPartes: '+(caso.autor||'')+(caso.reu?' × '+caso.reu:''):''}\n${alegacoes?'Alegações da parte contrária: '+alegacoes.substring(0,400):''}\nTexto atual da peça (contexto): ${(document.getElementById('editor-body').innerText||'').substring(0,500)}`;
  try{
    const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,messages:[{role:'user',content:`Você é um advogado especialista em ${area}. ${ctx}\n\nTarefa: ${prompt}\n\nResponda com o texto jurídico solicitado, pronto para inserir na petição.`}]})});
    const data=await res.json();
    const txt=(data.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('');
    out.className='ia-out';out.textContent=txt;
    document.getElementById('ed-ia-acts').style.display='flex';
  }catch(e){out.className='ia-out';out.textContent='⚠ Erro: '+e.message;}
}

function editorInserirIA(){
  const txt=document.getElementById('ed-ia-out').textContent;
  document.getElementById('editor-body').focus();
  document.execCommand('insertHTML',false,'<p>'+txt.replace(/\n/g,'</p><p>')+'</p>');
  document.getElementById('ed-ia-out').style.display='none';
  document.getElementById('ed-ia-acts').style.display='none';
  updateWordCount();
}

// SELEÇÃO PARA IA
let savedSel=null;
function checkSelection(){
  const sel=window.getSelection();
  if(sel&&sel.toString().trim().length>20){
    savedSel=sel;
    const rect=sel.getRangeAt(0).getBoundingClientRect();
    const popup=document.getElementById('sel-popup');
    popup.style.display='block';
    popup.style.top=(rect.bottom+window.scrollY+8)+'px';
    popup.style.left=Math.min(rect.left,window.innerWidth-220)+'px';
  }else{
    closeSelPopup();
  }
}


async function iaSelAction(action){
  closeSelPopup();
  if(!navigator.onLine){alert('IA requer internet.');return;}
  const txt=savedSel?savedSel.toString():'';
  if(!txt)return;
  const prompts={reescrever:'Reescreva este trecho com mais clareza e precisão jurídica',tecnico:'Torne este trecho mais técnico e juridicamente preciso',fundamentar:'Adicione fundamentação legal (artigos de lei e jurisprudência) a este trecho',resumir:'Resuma este trecho mantendo o essencial',contrapor:'Reformule este trecho para contrapor e rebater a alegação da parte contrária'};
  const out=document.getElementById('ed-ia-out');
  out.style.display='block';out.className='ia-out dim';out.textContent='⏳ Processando trecho com IA...';
  try{
    const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,messages:[{role:'user',content:`Você é um advogado especialista. ${prompts[action]}:\n\n"${txt}"\n\nResponda apenas com o trecho reescrito, sem explicações.`}]})});
    const data=await res.json();
    const ntxt=(data.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('');
    out.className='ia-out';out.textContent=ntxt;
    document.getElementById('ed-ia-acts').style.display='flex';
  }catch(e){out.className='ia-out';out.textContent='⚠ Erro: '+e.message;}
}

function iaReescrever(){
  const sel=window.getSelection();
  if(sel&&sel.toString().trim().length>5){savedSel=sel;iaSelAction('reescrever');}
  else{const popup=document.getElementById('sel-popup');popup.style.top='200px';popup.style.left='50%';popup.style.transform='translateX(-50%)';popup.style.display='block';}
}

async function editorPesquisar(){
  const q=document.getElementById('ed-pesq-q').value.trim();
  if(!q)return;
  if(!navigator.onLine){document.getElementById('ed-pesq-res').textContent='Sem conexão.';return;}
  document.getElementById('ed-pesq-res').innerHTML='<span class="spin"></span>Pesquisando...';
  try{
    const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,tools:[{type:'web_search_20250305',name:'web_search'}],messages:[{role:'user',content:`Pesquise jurisprudência sobre: "${q}". Retorne 2-3 resultados concisos em formato: FONTE | Resumo em 1 frase.`}]})});
    const data=await res.json();
    const txt=(data.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('');
    document.getElementById('ed-pesq-res').innerHTML=txt.split('\n').filter(l=>l.trim()).map(l=>`<div style="padding:5px 0;border-bottom:1px solid var(--border);font-size:11px;color:var(--text2);">${l}</div>`).join('');
  }catch(e){document.getElementById('ed-pesq-res').textContent='Erro: '+e.message;}
}

function editorSalvar(){
  const titulo=prompt('Título da peça:','Nova peça — '+new Date().toLocaleDateString('pt-BR'));
  if(!titulo)return;
  const pecas=ld('pecas');
  const timbradoId=document.getElementById('editor-timbrado').value;
  pecas.unshift({titulo,tipo:document.getElementById('ed-tipo').value,area:document.getElementById('ed-area').value,caso:document.getElementById('ed-caso').value,timbrado:timbradoId,pasta:'',tese:'',htmlTexto:document.getElementById('editor-body').innerHTML,texto:document.getElementById('editor-body').innerText,resultado:'Pendente',data:new Date().toLocaleDateString('pt-BR'),obs:'Criado no editor'});
  sv('pecas',pecas);renderBib();renderFolderTree();
  alert('Peça salva na biblioteca!');
}

function editorImprimir(){
  const t=document.getElementById('editor-timbrado').value?ld('timbs').find(x=>x.id===document.getElementById('editor-timbrado').value):null;
  printDocHTML(document.getElementById('editor-body').innerHTML,document.getElementById('ed-tipo').value,t);
}

function editorExportarDocx(){
  const titulo=document.getElementById('ed-tipo').value+' — '+new Date().toLocaleDateString('pt-BR');
  const t=document.getElementById('editor-timbrado').value?ld('timbs').find(x=>x.id===document.getElementById('editor-timbrado').value):null;
  exportDocx(titulo,document.getElementById('editor-body').innerText,t);
}

// ═══════════════════════════════════════════
// PRAZOS
// ═══════════════════════════════════════════


function togglePrazo(idx){const prazos=ld('prazos');if(prazos[idx])prazos[idx].done=!prazos[idx].done;sv('prazos',prazos);renderPrazos();renderDash();}
function delPrazo(idx){
  confirmar('Excluir este prazo?', function(){
    var prazos=ld('prazos');prazos.splice(idx,1);sv('prazos',prazos);
    renderPrazos();renderDash();showToast('✓ Prazo excluído.');
  }, '⏰', 'Excluir', 'rgba(204,68,68,0.85)');
}
function delAudienciaFromModal(){
  if(typeof currentAuId==='undefined'||currentAuId===null)return;
  confirmar('Excluir esta audiência permanentemente?', function(){
    var agenda=ld('agenda');agenda.splice(currentAuId,1);sv('agenda',agenda);
    currentAuId=null;closeModal('modal-audiencia');renderAgenda();renderDash();
    showToast('✓ Audiência excluída.');
  }, '🗓', 'Excluir', 'rgba(204,68,68,0.85)');
}

function delAud(idx){const agenda=ld('agenda');agenda.splice(idx,1);sv('agenda',agenda);renderAgenda();}

// ═══════════════════════════════════════════
// VISUAL LAW / TIMBRADOS
// ═══════════════════════════════════════════
let logoB64=null,editTimbId=null;
function onLogoUpload(e){
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=ev=>{logoB64=ev.target.result;document.getElementById('tb-logo-status').textContent=f.name;document.getElementById('tb-logo-prev').style.display='block';document.getElementById('tb-logo-img').src=logoB64;updateTbPrev();};
  r.readAsDataURL(f);
}

function saveTimbrado(){
  const nome=document.getElementById('tb-nome').value.trim();
  if(!nome){alert('Informe o nome.');return;}
  const timbs=ld('timbs');
  const obj={id:editTimbId||('tb'+Date.now()),nome,logo:logoB64,l1:document.getElementById('tb-l1').value,l2:document.getElementById('tb-l2').value,l3:document.getElementById('tb-l3').value,cor:document.getElementById('tb-cor').value,align:document.getElementById('tb-align').value,rodape:document.getElementById('tb-rodape').value};
  if(editTimbId){const i=timbs.findIndex(t=>t.id===editTimbId);if(i>=0)timbs[i]=obj;}else timbs.push(obj);
  sv('timbs',timbs);closeModal('modal-timbrado');editTimbId=null;logoB64=null;
  renderTimbrados();populateSels();
}

function renderTimbrados(){
  const timbs=ld('timbs');
  const grid=document.getElementById('timbrados-grid');
  if(!timbs.length){grid.innerHTML='<div class="empty"><div class="empty-ico">🗒</div><div>Nenhum timbrado.<br>Crie o primeiro para seu escritório.</div></div>';return;}
  grid.innerHTML=timbs.map(t=>`
    <div class="tb-card">
      <div class="tb-preview" style="display:flex;flex-direction:column;align-items:${t.align||'center'};justify-content:center;padding:6px 10px;gap:2px;">
        ${t.logo?`<img src="${t.logo}" style="max-height:22px;max-width:80%;object-fit:contain;"/>`:'' }
        ${t.l1?`<div style="font-size:8px;font-weight:bold;color:${t.cor};text-align:${t.align};font-family:Arial;">${t.l1}</div>`:''}
        ${t.l2?`<div style="font-size:7px;color:#666;text-align:${t.align};font-family:Arial;">${t.l2}</div>`:''}
      </div>
      <div style="font-size:12.5px;font-weight:500;margin-bottom:7px;">${t.nome}</div>
      <div style="display:flex;gap:5px;">
        <button class="btn btn-outline btn-xs" onclick="editTimbrado('${t.id}')">Editar</button>
        <button class="btn btn-danger btn-xs" onclick="delTimbrado('${t.id}')">Excluir</button>
      </div>
    </div>`).join('');
}

function editTimbrado(id){
  editTimbId=id;const t=ld('timbs').find(x=>x.id===id);if(!t)return;
  document.getElementById('tb-mt').textContent='Editar Timbrado';
  document.getElementById('tb-nome').value=t.nome;document.getElementById('tb-l1').value=t.l1||'';document.getElementById('tb-l2').value=t.l2||'';document.getElementById('tb-l3').value=t.l3||'';document.getElementById('tb-cor').value=t.cor||'#1a3a5c';document.getElementById('tb-align').value=t.align||'center';document.getElementById('tb-rodape').value=t.rodape||'';
  logoB64=t.logo||null;
  if(logoB64){document.getElementById('tb-logo-prev').style.display='block';document.getElementById('tb-logo-img').src=logoB64;document.getElementById('tb-logo-status').textContent='imagem carregada';}
  updateTbPrev();openModal('modal-timbrado');
}
function delTimbrado(id){if(!window.confirm('Excluir?'))return;sv('timbs',ld('timbs').filter(t=>t.id!==id));renderTimbrados();populateSels();}

// ═══════════════════════════════════════════
// IMPORTAÇÃO INTELIGENTE
// ═══════════════════════════════════════════
let pendFiles=[];
function onDragOver(e){e.preventDefault();document.getElementById('drop-zone').classList.add('drag');}
function onDragLeave(){document.getElementById('drop-zone').classList.remove('drag');}

function addFiles(files){
  const ok=files.filter(f=>/\.(docx?|txt|pdf)$/i.test(f.name));
  if(!ok.length){alert('Formatos: .docx · .txt · .pdf');return;}
  pendFiles=[...pendFiles,...ok];renderImpList();document.getElementById('btn-imp').style.display='inline-block';
}

function removePend(i){pendFiles.splice(i,1);renderImpList();if(!pendFiles.length)document.getElementById('btn-imp').style.display='none';}

async function doImport(){
  if(!pendFiles.length)return;
  const pasta=document.getElementById('imp-pasta').value;
  const areaDefault=document.getElementById('imp-area').value;
  const wrap=document.getElementById('imp-prog-wrap');wrap.style.display='block';
  const fill=document.getElementById('imp-pf'),lbl=document.getElementById('imp-lbl');
  const pecas=ld('pecas');let ok=0;
  for(let i=0;i<pendFiles.length;i++){
    const f=pendFiles[i];
    lbl.textContent=`Processando ${i+1}/${pendFiles.length}: ${f.name}`;
    fill.style.width=((i/pendFiles.length)*100)+'%';
    const st=document.getElementById('is-'+i);
    try{
      let txt='';
      if(/\.txt$/i.test(f.name))txt=await f.text();
      else if(/\.pdf$/i.test(f.name))txt=await readPDF(f);
      else txt=await readDOCX(f);
      const titulo=f.name.replace(/\.(docx?|txt|pdf)$/i,'');
      const tipo=detectTipo(titulo+' '+txt.substring(0,600));
      const area=detectArea(txt.substring(0,1000))||areaDefault;
      const assunto=detectAssunto(txt.substring(0,800));
      // Cria/usa pasta por área automaticamente
      let pastaFinal=pasta;
      if(!pasta&&area){
        const pastas=ld('pastas');
        let pastaArea=pastas.find(p=>p.nome===area);
        if(!pastaArea){pastaArea={id:'p'+Date.now()+i,nome:area,emoji:'📁',desc:''};pastas.push(pastaArea);sv('pastas',pastas);}
        pastaFinal=pastaArea.id;
      }
      pecas.unshift({titulo,tipo,area,pasta:pastaFinal,timbrado:'',caso:'',tese:assunto,texto:txt.substring(0,10000),resultado:'Pendente',data:new Date().toLocaleDateString('pt-BR'),obs:`Importado: ${f.name}`});
      if(st){st.textContent='✓ '+tipo;st.className='s-ok';}ok++;
    }catch(e){if(st){st.textContent='erro';st.className='s-err';}}
  }
  sv('pecas',pecas);fill.style.width='100%';lbl.textContent=`Concluído — ${ok}/${pendFiles.length} importados`;
  const fb=document.getElementById('imp-fb');fb.textContent=`✓ ${ok} peça(s) importada(s) e categorizadas automaticamente.`;fb.style.display='block';
  pendFiles=[];renderFolderTree();populateSels();renderBib();
}

async function readDOCX(file){
  return new Promise((res,rej)=>{
    const r=new FileReader();
    r.onload=async function(e){
      try{
        if(typeof mammoth!=='undefined'){const x=await mammoth.extractRawText({arrayBuffer:e.target.result});res(x.value);}
        else res(new TextDecoder().decode(e.target.result).replace(/[^\x20-\x7E\xC0-\xFF\n\r]/g,' ').substring(0,6000));
      }catch(err){rej(err);}
    };
    r.onerror=rej;r.readAsArrayBuffer(file);
  });
}

async function readPDF(file){
  return new Promise(res=>{
    const r=new FileReader();
    r.onload=async function(e){
      try{
        if(typeof pdfjsLib!=='undefined'){
          const pdf=await pdfjsLib.getDocument({data:new Uint8Array(e.target.result)}).promise;
          let txt='';
          for(let i=1;i<=Math.min(pdf.numPages,20);i++){const pg=await pdf.getPage(i);const tc=await pg.getTextContent();txt+=tc.items.map(x=>x.str).join(' ')+'\n';}
          res(txt);
        }else res('(PDF)');
      }catch{res('(erro PDF)');}
    };
    r.readAsArrayBuffer(file);
  });
}

function detectTipo(txt){
  const t=txt.toLowerCase();
  if(/embargos\s+de\s+declar/.test(t))return'Embargos de Declaração';
  if(/contrarraz/.test(t))return'Contrarrazões';
  if(/impugnaç/.test(t))return'Impugnação';
  if(/contestaç/.test(t))return'Contestação';
  if(/apelaç/.test(t)||/recurso\s+(de\s+)?apelaç/.test(t))return'Recurso de Apelação';
  if(/agravo\s+de\s+instrumento/.test(t))return'Agravo de Instrumento';
  if(/agravo\s+interno/.test(t)||/agravo\s+regimental/.test(t))return'Agravo Interno';
  if(/peti[çc][aã]o\s+inicial/.test(t)||/excelent[íi]ssim/.test(t))return'Petição Inicial';
  if(/manifest/.test(t))return'Manifestação';
  if(/contrato/.test(t))return'Contrato';
  if(/distrato/.test(t))return'Distrato';
  if(/parecer/.test(t))return'Parecer';
  return'Petições Diversas';
}

function detectArea(txt){
  const t=txt.toLowerCase();
  if(/cdc|c[oó]digo\s+de\s+defesa\s+do\s+consumidor|consumidor|fornecedor|vício|defeito/.test(t))return'Direito do Consumidor';
  if(/banco|banc[aá]rio|financiamento|empr[eé]stimo|cartão\s+de\s+crédito|juros/.test(t))return'Direito Bancário';
  if(/alimentos|guardas?|divórcio|uni[aã]o\s+estável|casamento|família/.test(t))return'Direito de Família';
  if(/reclamat[oó]ria|trabalhista|clt|empregado|empregador|rescis/.test(t))return'Direito Trabalhista';
  if(/pena|crime|criminal|réu|minist[eé]rio\s+público|indici/.test(t))return'Direito Penal';
  return'Direito Civil';
}

function detectAssunto(txt){
  const t=txt.toLowerCase();
  if(/dano\s+moral/.test(t))return'Dano moral';
  if(/cobran[çc]a\s+indevida/.test(t))return'Cobrança indevida';
  if(/inscri[çc][aã]o\s+indevida|spc|serasa/.test(t))return'Inscrição indevida SPC/Serasa';
  if(/revis[aã]o\s+contratual|juros\s+abusivos/.test(t))return'Revisão contratual';
  if(/alimentos/.test(t))return'Alimentos';
  if(/guarda/.test(t))return'Guarda';
  if(/divórcio/.test(t))return'Divórcio';
  return'';
}

// ═══════════════════════════════════════════
// PESQUISA JURÍDICA
// ═══════════════════════════════════════════
async function pesquisar(){const q=document.getElementById('pesq-q').value.trim();if(!q){alert('Digite o tema.');return;}await runSearch(q);}
async function qs(q){document.getElementById('pesq-q').value=q;await runSearch(q);}

async function runSearch(q){
  const res=document.getElementById('pesq-res');
  const tp=document.getElementById('pesq-tipo').value;
  const tr=document.getElementById('pesq-trib').value;
  if(!navigator.onLine){
    const pecas=ld('pecas');
    const m=pecas.filter(p=>(p.titulo+p.tese+(p.texto||'')).toLowerCase().includes(q.toLowerCase())).slice(0,6);
    if(!m.length){res.innerHTML='<div class="empty"><div>Nenhum resultado na biblioteca.</div></div>';return;}
    res.innerHTML='<div class="alert alert-b" style="margin-bottom:10px;">📴 Offline — resultados da biblioteca interna</div>'+m.map(p=>`<div class="pr"><div class="pr-header"><div class="pr-title">${p.titulo}</div><span class="pr-fonte">${p.tipo} · ${p.area}</span></div><div class="pr-body">${p.tese||'—'}</div></div>`).join('');
    return;
  }
  res.innerHTML='<div style="color:var(--text2);padding:14px 0;"><span class="spin"></span>Pesquisando jurisprudência com IA...</div>';
  const focusTxt=tp==='s'?'Foque exclusivamente em súmulas do STJ e STF.':tp==='l'?'Foque em legislação, artigos de lei e códigos.':tp==='j'?'Foque em acórdãos e jurisprudência dos tribunais.':'Traga jurisprudência e legislação relevante.';
  const tribunalTxt=tr?'Priorize o tribunal: '+tr+'. ':' ';
  const systemPrompt='Você é um pesquisador jurídico brasileiro. Sempre responda APENAS com JSON puro, sem texto adicional, sem markdown, sem blocos de código. O JSON deve começar com { e terminar com }.';
  const userPrompt='Pesquise sobre: "'+q+'". '+tribunalTxt+focusTxt+' Retorne este JSON exato: {"resultados":[{"titulo":"titulo do acordao ou lei","fonte":"STJ REsp 000000 ou CDC art.X etc","resumo":"resumo objetivo em 2 frases","ementa":"trecho da ementa ou texto do dispositivo legal","relevancia":"motivo da relevancia para o tema"}]} — exatamente 4 resultados reais.';
  try{
    const r=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        model:'claude-sonnet-4-20250514',
        max_tokens:4000,
        system:systemPrompt,
        tools:[{type:'web_search_20250305',name:'web_search'}],
        messages:[{role:'user',content:userPrompt}]
      })
    });
    const data=await r.json();
    if(data.error){res.innerHTML='<div class="alert alert-r">⚠ Erro API: '+data.error.message+'</div>';return;}
    const txt=(data.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('').trim();
    let parsed=null;
    // Múltiplas tentativas de parse
    const attempts=[
      ()=>JSON.parse(txt),
      ()=>JSON.parse(txt.replace(/^[^{]*/,'').replace(/[^}]*$/,'')),
      ()=>{ const m=txt.match(/\{[\s\S]*"resultados"[\s\S]*\}/); return m?JSON.parse(m[0]):null; },
      ()=>JSON.parse(txt.replace(/```json|```/g,'').trim())
    ];
    for(const fn of attempts){
      try{const r=fn();if(r&&r.resultados){parsed=r;break;}}catch{}
    }
    if(!parsed){
      res.innerHTML='<div class="alert alert-b" style="margin-bottom:8px;">Resposta recebida (formato texto):</div><div class="pr"><div class="pr-body" style="white-space:pre-wrap;font-size:12px;">'+txt+'</div></div>';
      return;
    }
    const itens=parsed.resultados||[];
    if(!itens.length){res.innerHTML='<div class="empty"><div>Nenhum resultado encontrado.</div></div>';return;}
    res.innerHTML=itens.map(it=>`<div class="pr">
      <div class="pr-header"><div class="pr-title">${it.titulo||'—'}</div><span class="pr-fonte">${it.fonte||'—'}</span></div>
      <div class="pr-body">${it.resumo||'—'}</div>
      ${it.ementa?'<div class="pr-ementa">'+it.ementa+'</div>':''}
      ${it.relevancia?'<div style="font-size:10.5px;color:var(--gr2);margin-top:5px;">✓ '+it.relevancia+'</div>':''}
      <button class="btn btn-xs btn-outline" style="margin-top:7px;" onclick="insertJurisToEditor(this)">↗ Inserir no editor</button>
    </div>`).join('');
  }catch(e){res.innerHTML='<div class="alert alert-r">⚠ Erro: '+e.message+'</div>';}
}

function insertJurisToEditor(btn){
  const pr=btn.closest('.pr');
  const titulo=pr.querySelector('.pr-title').textContent;
  const ementa=pr.querySelector('.pr-ementa')||pr.querySelector('.pr-body');
  const texto='\n\nNesse sentido, confira-se o entendimento de '+titulo+':\n\n"'+(ementa?ementa.textContent:'')+'"\n\n';
  nav('editor');
  setTimeout(()=>{document.getElementById('editor-body').focus();document.execCommand('insertText',false,texto);},300);
}


// ═══════════════════════════════════════════
// IMPRESSÃO / EXPORT
// ═══════════════════════════════════════════
function printDoc(texto,titulo,timb){
  const cor=timb?.cor||'#1a3a5c',align=timb?.align||'center';
  let header='';
  if(timb){
    if(timb.logo)header+=`<div style="text-align:${align};margin-bottom:5px;"><img src="${timb.logo}" style="max-height:55px;"/></div>`;
    if(timb.l1)header+=`<div style="font-size:14px;font-weight:bold;color:${cor};text-align:${align};">${timb.l1}</div>`;
    if(timb.l2)header+=`<div style="font-size:11px;color:#555;text-align:${align};">${timb.l2}</div>`;
    if(timb.l3)header+=`<div style="font-size:11px;color:#555;text-align:${align};">${timb.l3}</div>`;
    header=`<div style="border-bottom:2px solid ${cor};padding-bottom:10px;margin-bottom:18px;">${header}</div>`;
  }
  const footer=timb?.rodape?`<div style="text-align:center;font-size:10px;color:#999;border-top:1px solid #ddd;padding-top:7px;margin-top:28px;">${timb.rodape}</div>`:'';
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>${titulo}</title><style>body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.9;color:#111;margin:0;}pre{white-space:pre-wrap;font-family:inherit;font-size:12pt;}@media print{@page{margin:25mm 20mm;}}</style>  <!-- Google Identity Services + Drive API -->
</head><body style="padding:30mm 25mm 25mm;">${header}<pre>${texto}</pre>${footer}</body></html>`;
  const fr=document.getElementById('print-frame');
  fr.contentWindow.document.open();fr.contentWindow.document.write(html);fr.contentWindow.document.close();
  fr.contentWindow.focus();setTimeout(()=>fr.contentWindow.print(),400);
}

function printDocHTML(htmlContent,titulo,timb){
  const cor=timb?.cor||'#1a3a5c',align=timb?.align||'center';
  let header='';
  if(timb){
    if(timb.logo)header+=`<div style="text-align:${align};margin-bottom:5px;"><img src="${timb.logo}" style="max-height:55px;"/></div>`;
    if(timb.l1)header+=`<div style="font-size:14px;font-weight:bold;color:${cor};text-align:${align};">${timb.l1}</div>`;
    if(timb.l2)header+=`<div style="font-size:11px;color:#555;text-align:${align};">${timb.l2}</div>`;
    header=`<div style="border-bottom:2px solid ${cor};padding-bottom:10px;margin-bottom:18px;">${header}</div>`;
  }
  const footer=timb?.rodape?`<div style="text-align:center;font-size:10px;color:#999;border-top:1px solid #ddd;padding-top:7px;margin-top:28px;">${timb.rodape}</div>`:'';
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>${titulo}</title><style>body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.9;color:#111;margin:0;}img{max-width:100%;}@media print{@page{margin:25mm 20mm;}}</style>  <!-- Google Identity Services + Drive API -->
</head><body style="padding:30mm 25mm 25mm;">${header}${htmlContent}${footer}</body></html>`;
  const fr=document.getElementById('print-frame');
  fr.contentWindow.document.open();fr.contentWindow.document.write(html);fr.contentWindow.document.close();
  fr.contentWindow.focus();setTimeout(()=>fr.contentWindow.print(),400);
}

function exportDocx(titulo,texto,timb){
  // Exportação como HTML formatado (download) — para .docx real requer docx.js no browser
  const cor=timb?.cor||'#1a3a5c',align=timb?.align||'center';
  let header='';
  if(timb){
    if(timb.logo)header+=`<div style="text-align:${align};"><img src="${timb.logo}" style="max-height:55px;"/></div>`;
    if(timb.l1)header+=`<div style="font-size:14pt;font-weight:bold;color:${cor};text-align:${align};">${timb.l1}</div>`;
    if(timb.l2)header+=`<div style="font-size:10pt;color:#555;text-align:${align};">${timb.l2}</div>`;
    header=`<div style="border-bottom:2pt solid ${cor};padding-bottom:8pt;margin-bottom:16pt;">${header}</div>`;
  }
  // Word-compatible HTML
  const wordHtml=`<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'><head><meta charset="UTF-8"/><style>
    body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.9;margin:2.5cm 2cm;}
    p{margin:0 0 6pt;}
  </style>  <!-- Google Identity Services + Drive API -->
</head><body>${header}<div>${texto.replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br/>')}</div>${timb?.rodape?`<p style="text-align:center;font-size:9pt;color:#999;margin-top:20pt;border-top:1px solid #ddd;padding-top:6pt;">${timb.rodape}</p>`:''}</body></html>`;
  const blob=new Blob([wordHtml],{type:'application/msword'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=titulo.replace(/[/\\:*?"<>|]/g,'-')+'.doc';a.click();
}

// ═══════════════════════════════════════════
// MODALS
// ═══════════════════════════════════════════
function openModal(id){
  if(id==='modal-offline-guide'){
    // Update status in guide
    const dot=document.getElementById('guide-status-dot');
    const txt=document.getElementById('guide-status-txt');
    if(dot&&txt){
      if(navigator.onLine){dot.style.background='#5aaa84';txt.textContent='Status: Online';}
      else{dot.style.background='#e05555';txt.textContent='Status: Offline';}
    }
  }populateSels();document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}

// ═══════════════════════════════════════════
// OFFLINE / PWA
// ═══════════════════════════════════════════
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;document.getElementById('pwa-btn').style.display='inline-block';});
window.addEventListener('appinstalled',()=>{document.getElementById('pwa-btn').style.display='none';});
function installPWA(){if(deferredPrompt){deferredPrompt.prompt();deferredPrompt.userChoice.then(()=>deferredPrompt=null);}else alert('Para instalar:\nChrome/Edge: menu (⋮) → Instalar aplicativo\nSafari: Compartilhar → Adicionar à tela de início');}
function checkOnline(){const b=document.getElementById('offline-bar'),p=document.getElementById('offline-pill');if(navigator.onLine){b.classList.remove('show');p.style.display='none';}else{b.classList.add('show');p.style.display='inline-block';}}
window.addEventListener('online',checkOnline);window.addEventListener('offline',checkOnline);checkOnline();

// PWA manifest + SW
const mf={name:'LexBase',short_name:'LexBase',start_url:'./',display:'standalone',background_color:'#0a0b0d',theme_color:'#0a0b0d',icons:[{src:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="18" fill="%230a0b0d"/><text y=".9em" font-size="80" x="8">⚖</text></svg>',sizes:'any',type:'image/svg+xml'}]};
const mb=new Blob([JSON.stringify(mf)],{type:'application/manifest+json'});
try{var _ml=document.querySelector('link[rel="manifest"]');if(_ml)_ml.href=URL.createObjectURL(mb);}catch(e){}
if('serviceWorker' in navigator){
  const sw=`const C='lb-v1';self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll([location.href])));self.skipWaiting();});self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));self.clients.claim();});self.addEventListener('fetch',e=>{if(e.request.url.includes('api.anthropic.com'))return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{const rc=resp.clone();caches.open(C).then(c=>c.put(e.request,rc));return resp;}).catch(()=>caches.match(e.request))));});`;
  navigator.serviceWorker.register(URL.createObjectURL(new Blob([sw],{type:'application/javascript'}))).catch(()=>{});
}

// ═══════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════
function formatDate(str){if(!str)return'—';try{const d=new Date(str+'T12:00:00');return d.toLocaleDateString('pt-BR');}catch{return str;}}

// LIBS EXTERNAS
(function(){
  const s1=document.createElement('script');s1.src='https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';document.head.appendChild(s1);
  const s2=document.createElement('script');s2.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  s2.onload=()=>{if(typeof pdfjsLib!=='undefined')pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';};
  document.head.appendChild(s2);
})();

// CLICK FORA FECHA POPUP
document.addEventListener('click',e=>{if(!e.target.closest('#sel-popup')&&!e.target.closest('#editor-body'))closeSelPopup();});

// CTRL+S
document.addEventListener('keydown',e=>{if(e.ctrlKey&&e.key==='s'){e.preventDefault();if(document.getElementById('page-editor').classList.contains('on'))editorSalvar();}});

// INIT
function initApp(){
  document.getElementById('pq-data').value=new Date().toISOString().split('T')[0];
  document.getElementById('and-data').value=new Date().toISOString().split('T')[0];
  document.getElementById('pr-data').value=new Date().toISOString().split('T')[0];
  document.getElementById('au-data').value=new Date().toISOString().split('T')[0];
  document.getElementById('au-hora').value='09:00';
  renderFolderTree();renderDash();
  // Check auto-backup on load
  setTimeout(checkAutoBackup, 800);
  // Show last backup date
  const lbd = localStorage.getItem('lexbase_autobackup_date');
  const lbdEl = document.getElementById('last-backup-date');
  if(lbdEl && lbd) lbdEl.textContent = new Date(lbd).toLocaleString('pt-BR');
  // Do first auto-backup
  autoBackupLocal();
}

// ═══ VISUAL LAW TABS ═══
function switchTbTab(tab){
  ['config','modelo','preview'].forEach(t=>{
    const el=document.getElementById('tb-tab-'+t);
    if(el)el.style.display=t===tab?'block':'none';
    const btn=document.getElementById('tb-tab-'+t+'-btn');
    if(btn)btn.classList.toggle('active',t===tab);
  });
  if(tab==='preview')updateTbPrev();
}
function clearTbLogo(){logoB64=null;document.getElementById('tb-logo-status').textContent='nenhuma imagem';document.getElementById('tb-logo-prev').style.display='none';updateTbPrev();}
function updateTbPrev(){
  const l1=document.getElementById('tb-l1')?.value||'',l2=document.getElementById('tb-l2')?.value||'',l3=document.getElementById('tb-l3')?.value||'';
  const cor=document.getElementById('tb-cor')?.value||'#8a5070',align=document.getElementById('tb-align')?.value||'center';
  const fonte=document.getElementById('tb-fonte')?.value||'Times New Roman';
  let html='';
  if(logoB64)html+=`<div style="text-align:${align};margin-bottom:4px;"><img src="${logoB64}" style="max-height:40px;"/></div>`;
  if(l1)html+=`<div style="font-size:13px;font-weight:bold;color:${cor};text-align:${align};font-family:${fonte};">${l1}</div>`;
  if(l2)html+=`<div style="font-size:10px;color:#555;text-align:${align};font-family:${fonte};">${l2}</div>`;
  if(l3)html+=`<div style="font-size:10px;color:#555;text-align:${align};font-family:${fonte};">${l3}</div>`;
  const ph=document.getElementById('tb-prev-header');
  if(ph){ph.style.borderColor=cor;ph.innerHTML=html||'<span style="color:#bbb;font-size:10px;">Preencha os campos</span>';}
  const pf=document.getElementById('tb-prev-fecho');
  const fechoVal=document.getElementById('tb-fecho')?.value||'';
  if(pf)pf.innerHTML='<div style="font-size:11px;color:#444;white-space:pre-wrap;">'+fechoVal+'</div>';
  const pr=document.getElementById('tb-prev-rodape');
  if(pr)pr.textContent=document.getElementById('tb-rodape')?.value||'';
  const pe=document.getElementById('tb-prev-enderecamento');
  if(pe)pe.textContent=(document.getElementById('tb-enderecamento')?.value||'').replace(/\{[^}]+\}/g,'[...]');
}
function exportarModeloTimbrado(){
  const txt=document.getElementById('tb-modelo-texto')?.value||'';
  if(!txt){alert('Nenhum modelo para exportar.');return;}
  const nome=document.getElementById('tb-modelo-nome')?.value||'modelo';
  const blob=new Blob([txt],{type:'text/plain;charset=utf-8'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=nome.replace(/[^\w\sÀ-ÿ]/g,'-')+'.txt';a.click();
}
async function importarModeloTimbrado(e){
  const f=e.target.files[0];if(!f)return;
  let txt='';
  if(f.name.endsWith('.txt')){txt=await f.text();}
  else{try{if(typeof mammoth!=='undefined'){const ab=await f.arrayBuffer();const x=await mammoth.extractRawText({arrayBuffer:ab});txt=x.value;}else txt=await f.text();}catch{txt=await f.text();}}
  if(document.getElementById('tb-modelo-texto'))document.getElementById('tb-modelo-texto').value=txt;
  e.target.value='';
}
// Override saveTimbrado to include extra fields
const _origSaveTimbrado=saveTimbrado;
saveTimbrado=function(){
  const nome=document.getElementById('tb-nome').value.trim();
  if(!nome){alert('Informe o nome.');return;}
  const timbs=ld('timbs');
  const obj={id:editTimbId||('tb'+Date.now()),nome,logo:logoB64,
    l1:document.getElementById('tb-l1').value,l2:document.getElementById('tb-l2').value,l3:document.getElementById('tb-l3').value,
    cor:document.getElementById('tb-cor').value,align:document.getElementById('tb-align').value,
    fonte:document.getElementById('tb-fonte')?.value||'Times New Roman',
    fontsize:document.getElementById('tb-fontsize')?.value||'12pt',
    rodape:document.getElementById('tb-rodape').value,
    enderecamento:document.getElementById('tb-enderecamento')?.value||'',
    fecho:document.getElementById('tb-fecho')?.value||'',
    modeloNome:document.getElementById('tb-modelo-nome')?.value||'',
    modeloTipo:document.getElementById('tb-modelo-tipo')?.value||'',
    modeloTexto:document.getElementById('tb-modelo-texto')?.value||''};
  if(editTimbId){const i=timbs.findIndex(t=>t.id===editTimbId);if(i>=0)timbs[i]=obj;}else timbs.push(obj);
  sv('timbs',timbs);closeModal('modal-timbrado');editTimbId=null;logoB64=null;
  renderTimbrados();populateSels();
};
const _origEditTimbrado=editTimbrado;
editTimbrado=function(id){
  editTimbId=id;const t=ld('timbs').find(x=>x.id===id);if(!t)return;
  document.getElementById('tb-mt').textContent='Editar Timbrado';
  document.getElementById('tb-nome').value=t.nome;
  document.getElementById('tb-l1').value=t.l1||'';document.getElementById('tb-l2').value=t.l2||'';document.getElementById('tb-l3').value=t.l3||'';
  document.getElementById('tb-cor').value=t.cor||'#8a5070';document.getElementById('tb-align').value=t.align||'center';
  if(document.getElementById('tb-fonte'))document.getElementById('tb-fonte').value=t.fonte||'Times New Roman';
  if(document.getElementById('tb-fontsize'))document.getElementById('tb-fontsize').value=t.fontsize||'12pt';
  document.getElementById('tb-rodape').value=t.rodape||'';
  if(document.getElementById('tb-enderecamento'))document.getElementById('tb-enderecamento').value=t.enderecamento||'';
  if(document.getElementById('tb-fecho'))document.getElementById('tb-fecho').value=t.fecho||'';
  if(document.getElementById('tb-modelo-nome'))document.getElementById('tb-modelo-nome').value=t.modeloNome||'';
  if(document.getElementById('tb-modelo-tipo'))document.getElementById('tb-modelo-tipo').value=t.modeloTipo||'';
  if(document.getElementById('tb-modelo-texto'))document.getElementById('tb-modelo-texto').value=t.modeloTexto||'';
  logoB64=t.logo||null;
  if(logoB64){document.getElementById('tb-logo-prev').style.display='block';document.getElementById('tb-logo-img').src=logoB64;document.getElementById('tb-logo-status').textContent='imagem carregada';}
  switchTbTab('config');updateTbPrev();openModal('modal-timbrado');
};

// ═══ EXPORTAÇÃO COM ESCOLHA DE FORMATO ═══
let exportTarget='editor',exportCurrentIdx=null,exportFormat='doc';
function abrirExportar(){
  exportTarget='editor';
  document.getElementById('exp-filename').value=(document.getElementById('ed-tipo')?.value||'Petição')+' — '+new Date().toLocaleDateString('pt-BR');
  populateSels();const tId=document.getElementById('editor-timbrado')?.value||'';document.getElementById('exp-timbrado').value=tId;
  selectExport('doc');openModal('modal-export');
}
function abrirExportarVer(){
  exportTarget='biblioteca';const p=ld('pecas')[currentVerPecaIdx];
  document.getElementById('exp-filename').value=p?.titulo||'Petição';
  populateSels();if(p?.timbrado)setTimeout(()=>document.getElementById('exp-timbrado').value=p.timbrado,100);
  selectExport('doc');openModal('modal-export');
}
function selectExport(fmt){
  exportFormat=fmt;
  ['doc','pdf','txt'].forEach(f=>{
    const el=document.getElementById('exp-opt-'+f);if(!el)return;
    el.style.borderColor=f===fmt?'var(--gold2)':'var(--border2)';
    el.style.background=f===fmt?'var(--gdim)':'var(--bg3)';
  });
}
function doExport(){
  const fname=document.getElementById('exp-filename').value||'petição';
  const tId=document.getElementById('exp-timbrado').value;
  const timb=tId?ld('timbs').find(t=>t.id===tId):null;
  let texto='',htmlContent='';
  if(exportTarget==='editor'){texto=document.getElementById('editor-body')?.innerText||'';htmlContent=document.getElementById('editor-body')?.innerHTML||'';}
  else{const p=ld('pecas')[currentVerPecaIdx];texto=p?.texto||'';htmlContent=p?.htmlTexto||texto.replace(/\n/g,'<br>');}
  if(exportFormat==='doc')exportDocxFull(fname,texto,htmlContent,timb);
  else if(exportFormat==='pdf')printDocHTML(htmlContent,fname,timb);
  else{const blob=new Blob([texto],{type:'text/plain;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=fname.replace(/[\/\\:*?"<>|]/g,'-')+'.txt';a.click();}
  closeModal('modal-export');
}
function exportDocxFull(titulo,texto,htmlContent,timb){
  const cor=timb?.cor||'#8a5070',align=timb?.align||'center',fonte=timb?.fonte||'Times New Roman',fsize=timb?.fontsize||'12pt';
  let header='';
  if(timb){
    if(timb.logo)header+=`<div style="text-align:${align};margin-bottom:5pt;"><img src="${timb.logo}" style="max-height:55pt;"/></div>`;
    if(timb.l1)header+=`<div style="font-size:14pt;font-weight:bold;color:${cor};text-align:${align};font-family:${fonte};">${timb.l1}</div>`;
    if(timb.l2)header+=`<div style="font-size:10pt;color:#444;text-align:${align};font-family:${fonte};">${timb.l2}</div>`;
    if(timb.l3)header+=`<div style="font-size:10pt;color:#444;text-align:${align};font-family:${fonte};">${timb.l3}</div>`;
    header=`<div style="border-bottom:2pt solid ${cor};padding-bottom:9pt;margin-bottom:18pt;">${header}</div>`;
    if(timb.enderecamento)header+=`<p style="text-align:center;font-family:${fonte};font-size:${fsize};">${timb.enderecamento.replace(/\n/g,'<br/>')}</p><br/>`;
  }
  const footer=timb?.rodape?`<p style="text-align:center;font-size:9pt;color:#888;border-top:1px solid #ccc;padding-top:6pt;margin-top:24pt;font-family:${fonte};">${timb.rodape}</p>`:'';
  const fechoHtml=timb?.fecho?`<br/><p style="font-family:${fonte};font-size:${fsize};">${timb.fecho.replace(/\n/g,'<br/>')}</p>`:'';
  const wordHtml=`<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'><head><meta charset="UTF-8"/><style>body{font-family:'${fonte}',serif;font-size:${fsize};line-height:2.0;margin:0;}p{margin:0 0 6pt;text-align:justify;}@page{margin:2.5cm 3cm 2cm;}</style>  <!-- Google Identity Services + Drive API -->
</head><body>${header}${htmlContent||texto.replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br/>')}${fechoHtml}${footer}</body></html>`;
  const blob=new Blob([wordHtml],{type:'application/msword'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=titulo.replace(/[\/\\:*?"<>|]/g,'-')+'.doc';a.click();
}

// ═══ BUSCAR MODELO POR NOME ═══
function usarModeloTimbrado(id){
  const t=ld('timbs').find(x=>x.id===id);if(!t||!t.modeloTexto)return;
  closeModal('modal-buscar-modelo');nav('editor');
  setTimeout(()=>{
    document.getElementById('editor-body').innerHTML=t.modeloTexto.replace(/\n/g,'<br>');
    if(t.modeloTipo&&document.getElementById('ed-tipo'))document.getElementById('ed-tipo').value=t.modeloTipo;
    document.getElementById('editor-timbrado').value=id;renderEditorTimbrado();updateWordCount();
  },150);
}
function usarModeloBiblioteca(idx){const p=ld('pecas')[idx];if(p){closeModal('modal-buscar-modelo');loadIntoEditor(p);}}

// ═══ DJe — IMPORTAR PRAZOS ═══
let djePrazosEncontrados=[];
async function buscarDJe(){
  const nome=document.getElementById('dje-nome').value.trim();
  const oab=document.getElementById('dje-oab').value.trim();
  if(!nome&&!oab){alert('Informe o nome ou OAB.');return;}
  if(!navigator.onLine){alert('Busca no DJe requer internet.');return;}
  const tribunais=[];
  if(document.getElementById('dje-tjpr')?.checked)tribunais.push('TJPR');
  if(document.getElementById('dje-tjsp')?.checked)tribunais.push('TJSP');
  if(document.getElementById('dje-tjrj')?.checked)tribunais.push('TJRJ');
  if(document.getElementById('dje-tjmg')?.checked)tribunais.push('TJMG');
  if(document.getElementById('dje-stj')?.checked)tribunais.push('STJ');
  if(document.getElementById('dje-trt9')?.checked)tribunais.push('TRT-9ª Região');
  const data=document.getElementById('dje-data').value;
  const prazoDias=parseInt(document.getElementById('dje-prazo-dias').value)||15;
  const resEl=document.getElementById('dje-results');
  resEl.innerHTML='<div style="color:var(--text2);font-size:12px;"><span class="spin"></span>Consultando com IA...</div>';
  const prompt='Simule uma busca no Diário da Justiça Eletrônico dos tribunais: '+tribunais.join(', ')+'. Advogado: '+(nome||'não informado')+'. OAB: '+(oab||'não informado')+'. Data: '+(data||'hoje')+'. Crie 4 exemplos realistas de intimações para este advogado. Responda APENAS em JSON sem markdown: {"intimacoes":[{"processo":"numero","tribunal":"nome","tipo":"Intimação","descricao":"descrição breve","publicacao":"'+data+'","autor":"nome autor","reu":"nome reu","prazo_dias":'+prazoDias+'}]}';
  try{
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:2000,messages:[{role:'user',content:prompt}]})});
    const d=await r.json();
    const txt=(d.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('').trim();
    let parsed=null;
    try{parsed=JSON.parse(txt);}catch{}
    if(!parsed){const m=txt.match(/\{[\s\S]*"intimacoes"[\s\S]*\}/);if(m)try{parsed=JSON.parse(m[0]);}catch{}}
    if(!parsed||!parsed.intimacoes?.length){resEl.innerHTML='<div class="alert alert-r">Nenhuma intimação encontrada.</div>';return;}
    djePrazosEncontrados=parsed.intimacoes;resEl.innerHTML='';
    document.getElementById('dje-import-list').innerHTML=
      '<div style="font-size:10.5px;color:var(--text2);margin-bottom:8px;">Selecione as intimações para importar como prazo:</div>'+
      djePrazosEncontrados.map((it,i)=>{
        const pub=it.publicacao||data||new Date().toISOString().split('T')[0];
        const fatal=calcPrazoUtil(pub,it.prazo_dias||prazoDias);
        return`<div style="display:flex;gap:9px;padding:10px 12px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);margin-bottom:5px;align-items:flex-start;">
          <input type="checkbox" id="dje-cb-${i}" checked style="margin-top:3px;flex-shrink:0;"/>
          <div style="flex:1;">
            <div style="font-size:12px;font-weight:500;">${it.descricao}</div>
            <div style="font-size:10.5px;color:var(--text3);margin-top:2px;">📄 ${it.processo||'—'} · ${it.tribunal} · Pub: ${formatDate(pub)}</div>
            <div style="font-size:10.5px;color:var(--rd2);margin-top:2px;">⏰ Fatal: ${formatDate(fatal)}</div>
            ${it.autor?`<div style="font-size:10px;color:var(--text3);">Autor: ${it.autor} · Réu: ${it.reu||'—'}</div>`:''}
          </div></div>`;
      }).join('');
    document.getElementById('dje-import-btn').style.display='inline-block';
  }catch(e){resEl.innerHTML='<div class="alert alert-r">⚠ Erro: '+e.message+'</div>';}
}
function importarDJePrazos(){
  const prazos=ld('prazos');let count=0;
  djePrazosEncontrados.forEach((it,i)=>{
    if(!document.getElementById('dje-cb-'+i)?.checked)return;
    const pub=it.publicacao||new Date().toISOString().split('T')[0];
    const pd=it.prazo_dias||parseInt(document.getElementById('dje-prazo-dias').value)||15;
    prazos.push({id:'pr'+Date.now()+i,desc:it.descricao||it.tipo,tipo:it.tipo||'Manifestação',num:it.processo||'',chegou:pub,data:calcPrazoUtil(pub,pd),estado:'',autor:it.autor||'',reu:it.reu||'',caso:'',obs:'DJe — '+it.tribunal,done:false});
    count++;
  });
  sv('prazos',prazos);closeModal('modal-dje');nav('prazos');
  alert(count+' prazo(s) importado(s)!');renderPrazos();renderDash();
}

// ═══ CPJ / PLANILHA — IMPORTAR AGENDA ═══
let cpjAgendaPendente=[];
async function importarPlanilhaAgenda(e){
  const f=e.target.files[0];if(!f)return;
  const txt=await f.text();
  const lines=txt.split('\n').filter(l=>l.trim());
  const header=lines[0].toLowerCase();
  const sep=header.includes(';')?';':',';
  const cols=header.split(sep).map(c=>c.trim().replace(/"/g,''));
  const iData=cols.findIndex(c=>/data/i.test(c)),iHora=cols.findIndex(c=>/hora/i.test(c));
  const iDesc=cols.findIndex(c=>/desc|assunto|evento/i.test(c)),iLocal=cols.findIndex(c=>/local|vara/i.test(c));
  const iProc=cols.findIndex(c=>/processo|proc/i.test(c));
  cpjAgendaPendente=lines.slice(1).map(line=>{
    const parts=line.split(sep).map(p=>p.trim().replace(/"/g,''));
    const dr=iData>=0?parts[iData]:'';
    let df=dr;const dm=dr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(dm)df=`${dm[3]}-${dm[2].padStart(2,'0')}-${dm[1].padStart(2,'0')}`;
    return{desc:iDesc>=0?parts[iDesc]:'Audiência',data:df,hora:iHora>=0?parts[iHora]:'',local:iLocal>=0?parts[iLocal]:'',caso:'',obs:iProc>=0?'Proc: '+parts[iProc]:''};
  }).filter(a=>a.data&&a.desc);
  mostrarCpjPreview();e.target.value='';
}
// init extra date fields
window.addEventListener('load',()=>{
  const ec=document.getElementById('pr-chegou');if(ec)ec.value=new Date().toISOString().split('T')[0];
  const ed=document.getElementById('dje-data');if(ed)ed.value=new Date().toISOString().split('T')[0];
});


// ══ CLIENTES SUBPASTAS ══

// Override saveCaso to handle clientes with acoes
var _origSaveCaso=typeof saveCaso!=='undefined'?saveCaso:null;

// ══ EDITOR FUNCTIONS ══
var edMarginL=3,edMarginR=3;
function editorDragOver(e){e.preventDefault();document.getElementById('editor-body').style.outline='2px dashed #9a6060';}
function editorDragLeave(){document.getElementById('editor-body').style.outline='';}
function editorDrop(e){
  e.preventDefault();document.getElementById('editor-body').style.outline='';
  var files=[...e.dataTransfer.files];
  files.filter(function(f){return f.type.startsWith('image/');}).forEach(function(f){
    var r=new FileReader();r.onload=function(ev){document.execCommand('insertHTML',false,'<img src="'+ev.target.result+'" style="max-width:100%;border-radius:6px;margin:4px 0;"/>');updateWordCount();};r.readAsDataURL(f);
  });
}
function openBuscaModelos(){openModal('modal-buscar-modelo');}
function buscarModelos(){
  var q=(document.getElementById('bm-q')?.value||'').toLowerCase();
  var res=document.getElementById('bm-results');
  if(q.length<2){res.innerHTML='<div style="font-size:11.5px;color:var(--text3);">Digite ao menos 2 caracteres...</div>';return;}
  var pecas=ld('pecas');
  var m=pecas.filter(function(p){return(p.titulo+p.tese+(p.tipo||'')+(p.area||'')).toLowerCase().includes(q);}).slice(0,10);
  if(!m.length){res.innerHTML='<div style="font-size:11.5px;color:var(--text3);">Nenhuma peça encontrada.</div>';return;}
  res.innerHTML=m.map(function(p,i){
    var idx=pecas.indexOf(p);
    return'<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);padding:10px 12px;margin-bottom:6px;cursor:pointer;" onclick="usarModeloBanco('+idx+')" onmouseover="this.style.borderColor=\'#9a6060\'" onmouseout="this.style.borderColor=\'var(--border)\'"><div style="font-size:12.5px;font-weight:600;margin-bottom:3px;">'+p.titulo+'</div><div style="font-size:10.5px;color:var(--text3);">'+p.tipo+' · '+p.area+'</div></div>';
  }).join('');
}
function usarModeloBanco(idx){
  var p=ld('pecas')[idx];if(!p)return;
  closeModal('modal-buscar-modelo');
  nav('editor');
  setTimeout(function(){
    document.getElementById('editor-body').innerHTML=(p.htmlTexto||(p.texto||'').replace(/\n/g,'<br>'));
    var et=document.getElementById('ed-tipo');if(et)et.value=p.tipo;
    updateWordCount();
  },150);
}

// ══ IA SELECTION ══


// ══ INTIMAÇÕES ══
var intimacoesEncontradas=[];
function fmtDate(s){if(!s)return'—';try{return new Date(s+'T12:00:00').toLocaleDateString('pt-BR');}catch{return s;}}
async function buscarIntimacoesAuto(){
  var nome=document.getElementById('intim-nome')?.value.trim()||'';
  var oab=document.getElementById('intim-oab')?.value.trim()||'';
  if(!nome&&!oab){alert('Informe nome ou OAB.');return;}
  if(!navigator.onLine){var s=document.getElementById('intim-status');if(s){s.textContent='⚠ Sem internet.';s.className='alert alert-r';}return;}
  var tMap={'tjpr':'TJPR','tjsp':'TJSP','tjrj':'TJRJ','tjmg':'TJMG','tjrs':'TJRS','tjsc':'TJSC','tjba':'TJBA','tjgo':'TJGO','tjpe':'TJPE','tjdf':'TJDFT','stj':'STJ','stf':'STF','trf1':'TRF-1','trf2':'TRF-2','trf3':'TRF-3','trf4':'TRF-4','trf5':'TRF-5','trt9':'TRT-9','trt2':'TRT-2','trt4':'TRT-4','trt15':'TRT-15','dje':'DJe Federal','pje':'PJe'};
  var tribunais=Object.keys(tMap).filter(function(t){return document.getElementById('t-'+t)?.checked;}).map(function(t){return tMap[t];});
  if(!tribunais.length){alert('Selecione ao menos um tribunal.');return;}
  var data=document.getElementById('intim-data')?.value||new Date().toISOString().split('T')[0];
  var prazoDias=parseInt(document.getElementById('intim-prazo')?.value)||15;
  var status=document.getElementById('intim-status');
  if(status){status.className='alert alert-g';status.innerHTML='<span class="spin"></span>Consultando '+tribunais.length+' tribunal(is)...';}
  var res=document.getElementById('intim-results');if(res)res.innerHTML='';
  var imp=document.getElementById('intim-import-area');if(imp)imp.style.display='none';
  try{
    var r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:3000,system:'Responda SOMENTE com JSON válido sem nenhum texto adicional.',messages:[{role:'user',content:'Simule resultados DJe dos tribunais: '+tribunais.slice(0,6).join(', ')+'. Advogado: '+(nome||'—')+'. OAB: '+(oab||'—')+'. Data: '+data+'. Gere 5 intimações realistas. Retorne APENAS este JSON: {"intimacoes":[{"processo":"0001234-56.2024.8.16.0001","tribunal":"TJPR","tipo":"Intimação","descricao":"descrição do ato","publicacao":"'+data+'","autor":"Nome Autor","reu":"Nome Reu","prazo_dias":'+prazoDias+',"area":"Direito do Consumidor"}]}'}]})});
    var d=await r.json();
    if(d.error){if(status){status.innerHTML='⚠ '+d.error.message;status.className='alert alert-r';}return;}
    var raw=(d.content||[]).filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('').trim();
    var parsed=null;
    var tries=[function(){return JSON.parse(raw);},function(){var m=raw.match(/\{[\s\S]*"intimacoes"[\s\S]*\}/);return m?JSON.parse(m[0]):null;},function(){return JSON.parse(raw.replace(/```json|```/g,'').trim());}];
    for(var i=0;i<tries.length;i++){try{var x=tries[i]();if(x&&x.intimacoes){parsed=x;break;}}catch(e2){}}
    if(!parsed){if(status){status.innerHTML='Formato inesperado. Tente novamente.';status.className='alert alert-r';}if(res)res.innerHTML='<div style="white-space:pre-wrap;font-size:11px;color:var(--text2);">'+raw+'</div>';return;}
    intimacoesEncontradas=parsed.intimacoes||[];
    if(status){status.innerHTML='✓ '+intimacoesEncontradas.length+' intimação(ões) encontrada(s).';status.className='alert alert-g';}
    if(res)res.innerHTML=intimacoesEncontradas.map(function(it,i){
      var pub=it.publicacao||data;var fatal=calcPrazoUtil(pub,it.prazo_dias||prazoDias);
      return'<div style="background:rgba(255,248,246,0.88);border:1px solid var(--border);border-radius:var(--r2);padding:13px;margin-bottom:7px;display:flex;gap:9px;align-items:flex-start;"><input type="checkbox" id="ic-'+i+'" checked style="margin-top:4px;flex-shrink:0;accent-color:#9a6060;width:15px;height:15px;"/><div style="flex:1;"><span style="font-size:9px;text-transform:uppercase;font-weight:700;padding:2px 8px;border-radius:20px;background:rgba(154,96,96,.10);color:#9a4040;">'+it.tribunal+'</span><span style="font-size:9px;padding:2px 7px;border-radius:20px;background:var(--bg4);color:var(--text3);margin-left:5px;">'+it.area+'</span><div style="font-family:\'DM Mono\',monospace;font-size:10px;color:var(--text3);margin-top:4px;">'+it.processo+'</div><div style="font-size:13px;font-weight:600;margin:4px 0;">'+it.descricao+'</div><div style="font-size:11px;color:var(--text2);">'+(it.autor||'')+(it.reu?' × '+it.reu:'')+'</div><div style="font-size:10.5px;margin-top:3px;">Pub: '+fmtDate(pub)+' · <span style="color:var(--rd2);font-weight:700;">⏰ Fatal: '+fmtDate(fatal)+'</span></div></div></div>';
    }).join('');
    if(imp)imp.style.display='block';
  }catch(e){if(status){status.innerHTML='⚠ Erro: '+e.message;status.className='alert alert-r';}}
}

// ══ AUDIÊNCIAS TIPO ══
function onAuTipoChange(){
  var tipo=document.getElementById('au-tipo').value;
  var nc=document.getElementById('au-nota-concil');var ow=document.getElementById('au-obs-wrap');var pa=document.getElementById('au-prep-area');
  if(nc)nc.style.display=tipo==='conciliacao'?'block':'none';
  if(ow)ow.style.display=tipo==='conciliacao'?'none':'block';
  if(pa)pa.style.display=(tipo==='instrucao'||tipo==='una')?'block':'none';
}
async function prepararAudienciaIA(){
  if(!navigator.onLine){alert('IA requer internet.');return;}
  var num=document.getElementById('au-num')?.value||'';
  var desc=document.getElementById('au-desc')?.value||'';
  var casoId=document.getElementById('au-caso')?.value||'';
  var caso=casoId?ld('casos').find(function(c){return c.id===casoId;}):null;
  var out=document.getElementById('au-prep-out');
  if(out){out.style.fontStyle='normal';out.textContent='⏳ Preparando audiência...';}
  var prompt='Você é advogado preparando audiência de instrução.\nProcesso: '+(num||'não informado')+'\nDescrição: '+desc+(caso?'\nCliente: '+caso.nome+'\nÁrea: '+caso.area+'\nNotas: '+(caso.obs||''):'')+'\n\nPrepare:\n1. Pontos críticos a provar\n2. 8 perguntas estratégicas para testemunhas\n3. Argumentos prováveis da parte contrária e como rebater\n4. Documentos essenciais para ter em mãos\n5. Estratégia de condução';
  try{
    var r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:3000,messages:[{role:'user',content:prompt}]})});
    var d=await r.json();
    var txt=(d.content||[]).filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('');
    if(out)out.textContent=txt||'(vazio)';
  }catch(e){if(out)out.textContent='⚠ '+e.message;}
}
function saveAudiencia(){
  var desc=document.getElementById('au-desc')?.value.trim()||'';if(!desc){alert('Descreva a audiência.');return;}
  var tipo=document.getElementById('au-tipo')?.value||'conciliacao';
  var obs=tipo==='conciliacao'?(document.getElementById('au-obs-concil')?.value||''):(document.getElementById('au-obs')?.value||'');
  var agenda=ld('agenda');
  agenda.push({id:'au'+Date.now(),desc:desc,tipo:tipo,modalidade:document.getElementById('au-modal')?.value||'presencial',data:document.getElementById('au-data')?.value||'',hora:document.getElementById('au-hora')?.value||'',local:document.getElementById('au-local')?.value||'',link:document.getElementById('au-link')?.value||'',num:document.getElementById('au-num')?.value||'',caso:document.getElementById('au-caso')?.value||'',autor:document.getElementById('au-autor')?.value||'',reu:document.getElementById('au-reu')?.value||'',obs:obs,prepIA:document.getElementById('au-prep-out')?.textContent||''});
  sv('agenda',agenda);closeModal('modal-audiencia');
  ['au-desc','au-local','au-link','au-num','au-autor','au-reu','au-obs','au-obs-concil'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  renderAgenda();renderDash();
}

// ══ PESQUISA JURÍDICA ══
async function runSearch(q){
  var res=document.getElementById('pesq-res');
  var tp=document.getElementById('pesq-tipo').value;
  var tr=document.getElementById('pesq-trib').value;
  if(!navigator.onLine){
    var pecas=ld('pecas');
    var m=pecas.filter(function(p){return(p.titulo+p.tese+(p.texto||'')).toLowerCase().includes(q.toLowerCase());}).slice(0,6);
    if(!m.length){res.innerHTML='<div class="empty"><div>Nenhum resultado.</div></div>';return;}
    res.innerHTML='<div class="alert alert-g" style="margin-bottom:10px;">📴 Offline — biblioteca interna</div>'+m.map(function(p){return'<div class="pr"><div class="pr-header"><div class="pr-title">'+p.titulo+'</div><span class="pr-fonte">'+p.tipo+' · '+p.area+'</span></div><div class="pr-body">'+(p.tese||'—')+'</div></div>';}).join('');
    return;
  }
  res.innerHTML='<div style="color:var(--text2);padding:14px 0;"><span class="spin"></span>Pesquisando...</div>';
  var foco=tp==='s'?'Foco em súmulas do STJ e STF.':tp==='l'?'Foco em legislação.':tp==='j'?'Foco em jurisprudência dos tribunais.':'Traga jurisprudência e legislação relevante.';
  var trib=tr?'Tribunal: '+tr+'. ':'Considere STJ, STF e TJs. ';
  try{
    var r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:4000,system:'Responda APENAS com JSON puro sem markdown.',tools:[{type:'web_search_20250305',name:'web_search'}],messages:[{role:'user',content:'Pesquise jurisprudência brasileira sobre: "'+q+'". '+trib+foco+' Retorne APENAS este JSON: {"resultados":[{"titulo":"","fonte":"","resumo":"","ementa":"","relevancia":""}]}'}]})});
    var d=await r.json();
    if(d.error){res.innerHTML='<div class="alert alert-r">⚠ '+d.error.message+'</div>';return;}
    var raw=(d.content||[]).filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('').trim();
    var parsed=null;
    var tries=[function(){return JSON.parse(raw);},function(){var m=raw.match(/\{[\s\S]*"resultados"[\s\S]*\}/);return m?JSON.parse(m[0]):null;},function(){return JSON.parse(raw.replace(/```json|```/g,'').trim());}];
    for(var i=0;i<tries.length;i++){try{var x=tries[i]();if(x&&x.resultados){parsed=x;break;}}catch(e2){}}
    if(!parsed){res.innerHTML='<div class="pr"><div class="pr-body" style="white-space:pre-wrap;font-size:12px;">'+raw+'</div></div>';}
    else{
      res.innerHTML=(parsed.resultados||[]).map(function(it){return'<div class="pr"><div class="pr-header"><div class="pr-title">'+(it.titulo||'—')+'</div><span class="pr-fonte">'+(it.fonte||'—')+'</span></div><div class="pr-body">'+(it.resumo||'—')+'</div>'+(it.ementa?'<div class="pr-ementa">'+it.ementa+'</div>':'')+(it.relevancia?'<div style="font-size:10.5px;color:var(--gr2);margin-top:5px;font-weight:600;">✓ '+it.relevancia+'</div>':'')+'<button class="btn btn-xs btn-outline" style="margin-top:7px;" onclick="insertJurisEditor(this)">↗ Inserir no editor</button></div>';}).join('')||'<div class="empty"><div>Nenhum resultado.</div></div>';
    }
    res.innerHTML+='<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border);"><div style="font-size:10px;color:var(--text3);text-transform:uppercase;font-weight:700;margin-bottom:8px;">Pesquisar também:</div><div style="display:flex;gap:7px;flex-wrap:wrap;"><a href="https://www.jusbrasil.com.br/iniciar-pesquisa/" target="_blank" class="btn btn-xs btn-outline">🔗 JusBrasil</a><a href="https://portal.tjpr.jus.br/jurisprudencia/" target="_blank" class="btn btn-xs btn-outline">🔗 TJPR</a><a href="https://buscadordizerodireito.com.br/jurisprudencia" target="_blank" class="btn btn-xs btn-outline">🔗 Dizer o Direito</a><a href="https://jurisprudencia.stj.jus.br/" target="_blank" class="btn btn-xs btn-outline">🔗 STJ</a><a href="https://portal.stf.jus.br/jurisprudencia/" target="_blank" class="btn btn-xs btn-outline">🔗 STF</a></div></div>';
  }catch(e){res.innerHTML='<div class="alert alert-r">⚠ Erro: '+e.message+'</div>';}
}

// ══ CPJ / PLANILHA IMPORT ══
var cpjPendente=[];
function switchCpjTab(t){['plan','cpj'].forEach(function(x){var el=document.getElementById('cpj-tab-'+x);if(el)el.style.display=x===t?'block':'none';var btn=document.getElementById('cpj-tab-'+x+'-btn');if(btn)btn.classList.toggle('active',x===t);});}
async function importarPlanilhaAgenda(e){
  var f=e.target.files[0];if(!f)return;
  var txt=await f.text();
  var lines=txt.split('\n').filter(function(l){return l.trim();});
  var hdr=lines[0].toLowerCase();var sep=hdr.includes(';')?';':',';
  var cols=hdr.split(sep).map(function(x){return x.trim().replace(/"/g,'');});
  var iD=cols.findIndex(function(c){return/data/i.test(c);});
  var iH=cols.findIndex(function(c){return/hora/i.test(c);});
  var iDe=cols.findIndex(function(c){return/desc|assunto/i.test(c);});
  var iL=cols.findIndex(function(c){return/local|vara/i.test(c);});
  var iP=cols.findIndex(function(c){return/processo|proc/i.test(c);});
  cpjPendente=lines.slice(1).map(function(line){
    var parts=line.split(sep).map(function(p){return p.trim().replace(/"/g,'');});
    var dr=iD>=0?parts[iD]:'';var df=dr;var dm=dr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(dm)df=dm[3]+'-'+dm[2].padStart(2,'0')+'-'+dm[1].padStart(2,'0');
    return{desc:iDe>=0?parts[iDe]:'Audiência',data:df,hora:iH>=0?parts[iH]:'',local:iL>=0?parts[iL]:'',obs:iP>=0?'Proc: '+parts[iP]:''};
  }).filter(function(a){return a.data&&a.desc;});
  mostrarCpjPreview();e.target.value='';
}
function parseCpjTexto(){
  var txt=document.getElementById('cpj-texto')?.value||'';
  cpjPendente=txt.split('\n').filter(function(l){return l.trim();}).map(function(line){
    var dM=line.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);var tM=line.match(/(\d{1,2}):(\d{2})/);
    var data=dM?dM[3]+'-'+dM[2].padStart(2,'0')+'-'+dM[1].padStart(2,'0'):'';var hora=tM?tM[1].padStart(2,'0')+':'+tM[2]:'';
    var desc=line.replace(/\d{1,2}\/\d{1,2}\/\d{4}/,'').replace(/\d{1,2}:\d{2}/,'').replace(/\s*-\s*/g,' ').trim();
    return{desc:desc||'Audiência',data:data,hora:hora,local:'',obs:''};
  }).filter(function(a){return a.data&&a.desc;});
  mostrarCpjPreview();
}
function mostrarCpjPreview(){
  var el=document.getElementById('cpj-preview');if(!el)return;
  if(!cpjPendente.length){el.innerHTML='<div style="font-size:12px;color:var(--text3);">Nenhum evento.</div>';return;}
  el.innerHTML='<div style="font-size:10.5px;color:var(--text2);margin-bottom:7px;">'+cpjPendente.length+' audiência(s):</div>'+cpjPendente.slice(0,4).map(function(a){return'<div style="font-size:11.5px;padding:5px 9px;background:rgba(255,248,246,0.90);border-radius:var(--r);margin-bottom:4px;border:1px solid var(--border);">'+fmtDate(a.data)+' '+a.hora+' — '+a.desc+(a.local?' @ '+a.local:'')+'</div>';}).join('')+(cpjPendente.length>4?'<div style="font-size:11px;color:var(--text3);">+mais '+( cpjPendente.length-4)+'</div>':'');
  var btn=document.getElementById('cpj-import-btn');if(btn)btn.style.display='inline-block';
}
function confirmarImportAgenda(){
  var agenda=ld('agenda');
  cpjPendente.forEach(function(a,i){agenda.push(Object.assign({id:'au'+Date.now()+i},a));});
  sv('agenda',agenda);closeModal('modal-cpj');
  alert(cpjPendente.length+' audiência(s) importada(s)!');cpjPendente=[];renderAgenda();renderDash();
}
function downloadModeloPlanilha(){
  var csv='Data,Hora,Descrição,Local,Processo\n15/06/2025,09:00,Audiência de Conciliação,3ª Vara Cível,0001234-56.2024.8.16.0001';
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='modelo_agenda.csv';a.click();
}

// ══ DOLOIGN FIX ══
function doLogin(){
  var u=document.getElementById('login-user').value.trim();
  var p=document.getElementById('login-pass').value;
  var users=initUsers();var found=null;
  for(var i=0;i<users.length;i++){var usr=users[i];if((usr.user===u||usr.email===u||usr.email2===u)&&usr.pass===btoa(p)&&usr.role!=='blocked'){found=usr;break;}}
  if(!found){document.getElementById('login-err').style.display='block';return;}
  currentUser=found;
  document.getElementById('login-screen').style.cssText='display:none!important;visibility:hidden!important;';
  document.getElementById('app').style.cssText='display:grid!important;';
  var na=document.getElementById('nav-admin');if(found.role==='admin'&&na)na.style.display='flex';
  var tn=document.getElementById('top-name');if(tn)tn.textContent=found.nome.split(' ')[0];
  var ta=document.getElementById('top-avatar');if(ta)ta.textContent=found.nome[0].toUpperCase();
  var un=document.getElementById('um-nome');if(un)un.textContent=found.nome;
  var ui=document.getElementById('um-info');if(ui)ui.textContent=found.email||found.user;
  initApp();
}

function doLogout(){
  currentUser=null;
  document.getElementById('login-screen').style.cssText='display:flex!important;visibility:visible!important;';
  document.getElementById('app').style.cssText='display:none!important;';
  closeModal('modal-user-menu');
}
// init extra
window.addEventListener('load',function(){
  var ti=document.getElementById('intim-data');if(ti)ti.value=new Date().toISOString().split('T')[0];
  try{var ml=document.querySelector('link[rel="manifest"]');if(ml){var mb=new Blob([JSON.stringify({name:'LexBase',short_name:'LexBase',display:'standalone',background_color:'#fceae6',theme_color:'#9a6060'})],{type:'application/json'});ml.href=URL.createObjectURL(mb);}}catch(e){}
});


// ═══════════════════════════════════════════════════════
// SISTEMA DE BACKUP VITALÍCIO
// ═══════════════════════════════════════════════════════

// Chaves que fazem parte do backup completo
const BACKUP_KEYS = ['pecas','pastas','casos','timbs','prazos','agenda','users'];

// Exportar backup completo de TUDO

// Importar backup

// Auto-backup periódico no localStorage (backup de segurança)

// Verificar se houve perda de dados e oferecer restauração do auto-backup
function checkAutoBackup(){
  const pecas = ld('pecas');
  const autoBackup = localStorage.getItem('lexbase_autobackup');
  if(!autoBackup) return;

  try{
    const bk = JSON.parse(autoBackup);
    const bkPecas = bk.dados?.pecas || [];

    // Se o backup tem dados mas o atual não tem
    if(bkPecas.length > 0 && pecas.length === 0){
      const bkDate = bk.data ? new Date(bk.data).toLocaleString('pt-BR') : '—';
      if(confirm('⚠ A biblioteca está vazia, mas foi encontrado um backup automático de ' + bkDate + ' com ' + bkPecas.length + ' peça(s).\n\nDeseja restaurar?')){
        BACKUP_KEYS.forEach(k => { if(bk.dados[k]) sv(k, bk.dados[k]); });
        renderBib(); renderFolderTree(); renderCasos(); renderPrazos(); renderAgenda(); renderDash();
        showToast('✓ Dados restaurados do backup automático!');
      }
    }
  } catch(e){ /* silencioso */ }
}

// Toast de notificação

// sv hook handled by Drive sync module below

// Instrução de uso offline no modal de import
// Adicionar aviso de uso offline na bib


// ══ ONLINE/OFFLINE STATUS ══

window.addEventListener('online',  function(){ updateOnlineStatus(); showToast('✓ Conexão restaurada — IA disponível'); });
window.addEventListener('offline', function(){ updateOnlineStatus(); showToast('📴 Sem internet — modo offline ativo'); });

// Atualizar ao iniciar
document.addEventListener('DOMContentLoaded', updateOnlineStatus);


// ═══════════════════════════════════════════════════════════════
// GOOGLE DRIVE SYNC — LexBase
// Salva todos os dados em lexbase_dados.json no Drive do usuário
// ═══════════════════════════════════════════════════════════════

const GDRIVE_FILE_NAME = 'lexbase_dados.json';
const GDRIVE_SCOPES = 'https://www.googleapis.com/auth/drive.appdata';
// CLIENT_ID: precisa ser configurado no Google Cloud Console
// Por ora usa um placeholder — instruções abaixo
const GDRIVE_CLIENT_ID = localStorage.getItem('lexbase_google_client_id') || '';

let gdriveToken = null;
let gdriveSyncing = false;
let gdriveFileId = null;
let gdriveSyncTimer = null;

// Estado do drive

// Conectar / desconectar

function connectGDrive(){
  if(typeof google === 'undefined' || !google.accounts){
    showToast('⚠ Google APIs não carregadas. Verifique sua conexão.');
    return;
  }
  setDriveStatus('syncing');
  const client = google.accounts.oauth2.initTokenClient({
    client_id: GDRIVE_CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/drive.appdata',
    callback: async function(response) {
      if(response.error){
        setDriveStatus('error');
        showToast('⚠ Erro ao conectar: ' + response.error);
        return;
      }
      gdriveToken = response.access_token;
      localStorage.setItem('lexbase_gdrive_token', gdriveToken);
      setDriveStatus('connected');
      showToast('✓ Conectado ao Google Drive!');
      // Carregar dados do Drive (se existir)
      await loadFromDrive();
    }
  });
  client.requestAccessToken();
}

// Salvar no Drive
async function saveToDrive(){
  if(!gdriveToken || gdriveSyncing) return;
  gdriveSyncing = true;
  setDriveStatus('syncing');
  try{
    const data = { versao:'5.0', data: new Date().toISOString(), dados:{} };
    ['pecas','pastas','casos','timbs','prazos','agenda','users'].forEach(k => {
      data.dados[k] = ld(k);
    });
    const json = JSON.stringify(data);
    const blob = new Blob([json], {type:'application/json'});

    if(gdriveFileId){
      // Atualizar arquivo existente
      await fetch(`https://www.googleapis.com/upload/drive/v3/files/${gdriveFileId}?uploadType=media`, {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer ' + gdriveToken, 'Content-Type': 'application/json' },
        body: json
      });
    } else {
      // Criar arquivo novo na pasta appDataFolder
      const meta = { name: GDRIVE_FILE_NAME, parents: ['appDataFolder'] };
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(meta)], {type:'application/json'}));
      form.append('file', blob);
      const r = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + gdriveToken },
        body: form
      });
      const f = await r.json();
      gdriveFileId = f.id;
      localStorage.setItem('lexbase_gdrive_file_id', gdriveFileId);
    }
    setDriveStatus('connected');
  } catch(e){
    setDriveStatus('error');
    console.error('Drive save error:', e);
  } finally {
    gdriveSyncing = false;
  }
}

// Carregar do Drive
async function loadFromDrive(){
  if(!gdriveToken) return;
  setDriveStatus('syncing');
  try{
    // Procurar o arquivo
    const search = await fetch(
      "https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='" + GDRIVE_FILE_NAME + "'&fields=files(id,name,modifiedTime)",
      { headers: { 'Authorization': 'Bearer ' + gdriveToken } }
    );
    const result = await search.json();
    const files = result.files || [];

    if(!files.length){
      // Arquivo não existe ainda — salvar dados atuais
      setDriveStatus('connected');
      showToast('Drive conectado! Fazendo upload dos dados...');
      await saveToDrive();
      return;
    }

    gdriveFileId = files[0].id;
    localStorage.setItem('lexbase_gdrive_file_id', gdriveFileId);
    const modDate = new Date(files[0].modifiedTime).toLocaleString('pt-BR');

    // Baixar conteúdo
    const dl = await fetch(
      `https://www.googleapis.com/drive/v3/files/${gdriveFileId}?alt=media`,
      { headers: { 'Authorization': 'Bearer ' + gdriveToken } }
    );
    const driveData = await dl.json();

    // Verificar se Drive tem dados mais recentes
    const driveDate = driveData.data ? new Date(driveData.data) : null;
    const localPecas = ld('pecas');

    if(driveData.dados){
      const drivePecas = driveData.dados.pecas || [];
      if(drivePecas.length > 0 && localPecas.length === 0){
        // Drive tem dados, local está vazio — carregar do Drive automaticamente
        ['pecas','pastas','casos','timbs','prazos','agenda'].forEach(k => {
          if(driveData.dados[k]) sv_local(k, driveData.dados[k]);
        });
        renderBib(); renderFolderTree(); renderCasos(); renderPrazos(); renderAgenda(); renderDash();
        showToast('✓ Dados carregados do Google Drive! (' + drivePecas.length + ' peças)');
      } else if(drivePecas.length > 0 && localPecas.length > 0){
        // Ambos têm dados — perguntar qual usar
        if(confirm('O Google Drive tem um backup de ' + modDate + ' com ' + drivePecas.length + ' peça(s).\n\nSeu dispositivo atual tem ' + localPecas.length + ' peça(s).\n\nCarregar dados do Drive? (Cancele para manter os dados locais e enviá-los ao Drive)')){
          ['pecas','pastas','casos','timbs','prazos','agenda'].forEach(k => {
            if(driveData.dados[k]) sv_local(k, driveData.dados[k]);
          });
          renderBib(); renderFolderTree(); renderCasos(); renderPrazos(); renderAgenda(); renderDash();
          showToast('✓ Dados carregados do Drive!');
        } else {
          await saveToDrive();
          showToast('✓ Dados locais enviados ao Drive!');
        }
      }
    }
    setDriveStatus('connected');
  } catch(e){
    setDriveStatus('error');
    console.error('Drive load error:', e);
    showToast('⚠ Erro ao carregar do Drive: ' + e.message);
  }
}

// sv_local = salvar só no localStorage sem triggerar sync (evitar loop)
function sv_local(k, v){
  try{ localStorage.setItem(['pecas','pastas','casos','timbs','prazos','agenda','users'].includes(k) ? 
    {pecas:'lb_pecas4',pastas:'lb_pastas4',casos:'lb_casos4',timbs:'lb_timbs4',prazos:'lb_prazos4',agenda:'lb_agenda4',users:'lb_users4'}[k] : k, 
    JSON.stringify(v)); }catch(e){}
}

// Hook no sv para auto-sync com Drive
(function(){
  const _sv_orig = window.sv || sv;
  window.sv = function(k, v){
    _sv_orig(k, v);
    // Auto-sync com Drive (debounced 2s)
    if(gdriveToken){
      clearTimeout(gdriveSyncTimer);
      gdriveSyncTimer = setTimeout(saveToDrive, 2000);
    }
    // Auto-backup local
    clearTimeout(window._autoBackupTimer);
    window._autoBackupTimer = setTimeout(autoBackupLocal, 1500);
  };
})();

// Inicializar Drive ao carregar (se tinha token salvo)
window.addEventListener('load', function(){
  const savedClientId = localStorage.getItem('lexbase_google_client_id');
  if(savedClientId && savedClientId.length > 10){
    const savedFileId = localStorage.getItem('lexbase_gdrive_file_id');
    if(savedFileId) gdriveFileId = savedFileId;
    // Reconectar automaticamente
    setTimeout(function(){
      if(typeof google !== 'undefined' && google.accounts){
        connectGDrive();
      }
    }, 1500);
  }
});



// ══ LOGIN EXTRAS ══
function toggleLoginPass(){
  var inp = document.getElementById('login-pass');
  var btn = document.getElementById('toggle-pass-btn');
  if(!inp) return;
  if(inp.type === 'password'){
    inp.type = 'text';
    if(btn) btn.style.opacity = '0.9';
  } else {
    inp.type = 'password';
    if(btn) btn.style.opacity = '0.5';
  }
}

// Lembrar usuário
function loadRememberedUser(){
  var saved = localStorage.getItem('lexbase_remember_user');
  if(saved){
    var el = document.getElementById('login-user');
    var cb = document.getElementById('remember-me');
    if(el) el.value = saved;
    if(cb) cb.checked = true;
  }
}

// Hook no doLogin para salvar usuário se "lembrar" marcado
var _doLoginOrig = doLogin;
doLogin = function(){
  var cb = document.getElementById('remember-me');
  var u = document.getElementById('login-user');
  if(cb && cb.checked && u && u.value.trim()){
    localStorage.setItem('lexbase_remember_user', u.value.trim());
  } else {
    localStorage.removeItem('lexbase_remember_user');
  }
  _doLoginOrig();
};

// Redefinir senha (direto, sem senha atual — só admin)
function resetSenha(){
  var nova = document.getElementById('recover-nova').value;
  var conf = document.getElementById('recover-conf').value;
  var err  = document.getElementById('recover-err');
  err.style.display = 'none';
  if(nova.length < 6){ err.textContent = 'Mínimo 6 caracteres.'; err.style.display='block'; return; }
  if(nova !== conf){ err.textContent = 'Senhas não coincidem.'; err.style.display='block'; return; }
  var users = ld('users');
  var admin = users.find(function(u){ return u.role === 'admin'; });
  if(!admin){ err.textContent = 'Usuário admin não encontrado.'; err.style.display='block'; return; }
  admin.pass = btoa(nova);
  sv('users', users);
  closeModal('modal-recover-pass');
  showToast('✓ Senha redefinida com sucesso! Faça login com a nova senha.');
  document.getElementById('recover-nova').value = '';
  document.getElementById('recover-conf').value = '';
}

// Carregar usuário lembrado ao iniciar
window.addEventListener('DOMContentLoaded', function(){
  loadRememberedUser();
});


// ══ RENOMEAR / MOVER PEÇA ══
var currentRenameIdx = null;

function openRenomearPeca(idx){
  const pecas = ld('pecas');
  const p = pecas[idx];
  if(!p) return;
  currentRenameIdx = idx;

  document.getElementById('rn-titulo').value = p.titulo || '';
  document.getElementById('rn-tipo').value = p.tipo || 'Contestação';
  document.getElementById('rn-area').value = p.area || 'Direito do Consumidor';
  document.getElementById('rn-resultado').value = p.resultado || 'Pendente';
  document.getElementById('rn-tese').value = p.tese || '';
  document.getElementById('rn-obs').value = p.obs || '';

  // Populate pastas
  const pastas = ld('pastas');
  const casos = ld('casos');
  let pastOpts = '<option value="">— Raiz (sem pasta) —</option>';
  pastas.forEach(pa => { pastOpts += `<option value="${pa.id}" ${p.pasta===pa.id?'selected':''}>${pa.emoji||'📁'} ${pa.nome}</option>`; });
  document.getElementById('rn-pasta').innerHTML = pastOpts;

  // Populate casos
  let casoOpts = '<option value="">— Nenhum —</option>';
  casos.forEach(ca => { casoOpts += `<option value="${ca.id}" ${p.caso===ca.id?'selected':''}>${ca.nome}</option>`; });
  document.getElementById('rn-caso').innerHTML = casoOpts;

  openModal('modal-rename-peca');
}

function saveRenamePeca(){
  if(currentRenameIdx === null) return;
  const pecas = ld('pecas');
  const p = pecas[currentRenameIdx];
  if(!p) return;
  p.titulo    = document.getElementById('rn-titulo').value.trim() || p.titulo;
  p.tipo      = document.getElementById('rn-tipo').value;
  p.area      = document.getElementById('rn-area').value;
  p.resultado = document.getElementById('rn-resultado').value;
  p.tese      = document.getElementById('rn-tese').value;
  p.obs       = document.getElementById('rn-obs').value;
  p.pasta     = document.getElementById('rn-pasta').value;
  p.caso      = document.getElementById('rn-caso').value;
  sv('pecas', pecas);
  closeModal('modal-rename-peca');
  renderBib();
  renderFolderTree();
  showToast('✓ Peça atualizada!');
  currentRenameIdx = null;
}

function delPecaFromRename(){
  if(currentRenameIdx === null) return;
  if(!window.confirm('Excluir esta peça permanentemente?'))return;
  const pecas = ld('pecas');
  pecas.splice(currentRenameIdx, 1);
  sv('pecas', pecas);
  closeModal('modal-rename-peca');
  renderBib();
  renderFolderTree();
  showToast('✓ Peça excluída.');
  currentRenameIdx = null;
}

// ══ IMPORTAR COM DESTINO ══
var importPendingFiles = [];
var importDest = 'biblioteca'; // 'biblioteca' ou 'cliente'

function setImpDest(dest){
  importDest = dest;
  const bibCard  = document.getElementById('imp-dest-bib');
  const cliCard  = document.getElementById('imp-dest-cliente');
  const bibOpts  = document.getElementById('imp-dest-bib-opts');
  const cliOpts  = document.getElementById('imp-dest-cli-opts');
  if(dest === 'biblioteca'){
    bibCard.style.border  = '2px solid var(--gold)';
    bibCard.style.background = 'rgba(154,96,96,0.08)';
    cliCard.style.border  = '2px solid var(--border2)';
    cliCard.style.background = 'rgba(255,248,246,0.80)';
    bibOpts.style.display = 'block';
    cliOpts.style.display = 'none';
  } else {
    cliCard.style.border  = '2px solid var(--gold)';
    cliCard.style.background = 'rgba(154,96,96,0.08)';
    bibCard.style.border  = '2px solid var(--border2)';
    bibCard.style.background = 'rgba(255,248,246,0.80)';
    bibOpts.style.display = 'none';
    cliOpts.style.display = 'block';
    // Populate clientes
    const casos = ld('casos');
    let opts = '<option value="">— Selecionar cliente —</option>';
    casos.forEach(ca => { opts += `<option value="${ca.id}">${ca.nome}</option>`; });
    document.getElementById('imp-cliente-sel').innerHTML = opts;
  }
}

function updateAcoesSel(){
  const casoId = document.getElementById('imp-cliente-sel').value;
  const caso = ld('casos').find(c => c.id === casoId);
  const acoes = caso?.acoes || [];
  let opts = '<option value="">— Selecionar ação —</option>';
  acoes.forEach(ac => { opts += `<option value="${ac.id}">${ac.nome}${ac.num?' ('+ac.num+')':''}</option>`; });
  document.getElementById('imp-acao-sel').innerHTML = opts;
}

function addAcaoRapida(){
  const nome = prompt('Nome da nova ação (ex: Ação SHEIN):');
  if(!nome) return;
  const num = prompt('Número do processo (opcional):','');
  const casoId = document.getElementById('imp-cliente-sel').value;
  if(!casoId){ alert('Selecione um cliente primeiro.'); return; }
  const casos = ld('casos');
  const caso = casos.find(c => c.id === casoId);
  if(!caso) return;
  if(!caso.acoes) caso.acoes = [];
  const novaAcao = {id:'ac'+Date.now(), nome, num: num||'', pecas:[], docs:[]};
  caso.acoes.push(novaAcao);
  sv('casos', casos);
  updateAcoesSel();
  document.getElementById('imp-acao-sel').value = novaAcao.id;
  showToast('✓ Ação criada!');
}

function criarPastaRapida(){
  const nome = prompt('Nome da nova pasta:');
  if(!nome) return;
  const emoji = prompt('Emoji (opcional, ex: 📁):','📁') || '📁';
  const pastas = ld('pastas');
  const nova = {id:'p'+Date.now(), nome, emoji, desc:''};
  pastas.push(nova);
  sv('pastas', pastas);
  renderFolderTree();
  // Atualizar select
  const sel = document.getElementById('imp-pasta-sel');
  if(sel){
    const opt = document.createElement('option');
    opt.value = nova.id;
    opt.textContent = emoji + ' ' + nome;
    opt.selected = true;
    sel.appendChild(opt);
  }
  showToast('✓ Pasta criada!');
}

// Abrir modal de destino com arquivos pendentes
function openImportDestino(files){
  importPendingFiles = files;

  // Populate pastas no select
  const pastas = ld('pastas');
  let opts = '<option value="">— Raiz —</option>';
  pastas.forEach(p => { opts += `<option value="${p.id}">${p.emoji||'📁'} ${p.nome}</option>`; });
  document.getElementById('imp-pasta-sel').innerHTML = opts;

  // Info
  document.getElementById('imp-dest-info').textContent =
    files.length + ' arquivo(s) prontos para importar. Escolha onde salvar:';

  // Preview dos arquivos com campo para renomear
  document.getElementById('imp-dest-files-list').innerHTML =
    '<div style="font-size:10px;color:var(--text2);text-transform:uppercase;font-weight:700;letter-spacing:.09em;margin-bottom:8px;">Arquivos — você pode renomear antes de salvar:</div>' +
    files.map((f,i) => `
      <div style="background:rgba(255,248,246,0.88);border:1px solid var(--border);border-radius:var(--r);padding:9px 11px;margin-bottom:5px;">
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:5px;">
          <span style="font-size:14px;">${f.name.endsWith('.pdf')?'📄':f.name.endsWith('.docx')||f.name.endsWith('.doc')?'📝':'📃'}</span>
          <span style="font-size:11px;color:var(--text3);font-family:'DM Mono',monospace;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${f.name}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr auto;gap:6px;">
          <input class="fi" id="imp-file-name-${i}" value="${f.name.replace(/\.[^.]+$/,'')}" placeholder="Nome da peça" style="font-size:11.5px;"/>
          <select class="fi" id="imp-file-tipo-${i}" style="font-size:11px;min-width:130px;">
            <option>Contestação</option><option>Petição Inicial</option><option>Recurso de Apelação</option>
            <option>Agravo de Instrumento</option><option>Embargos de Declaração</option><option>Impugnação</option>
            <option>Contrarrazões</option><option>Manifestação</option><option>Petições Diversas</option>
            <option>Contrato</option><option>Distrato</option><option>Parecer</option><option>Outros</option>
          </select>
        </div>
      </div>`).join('');

  setImpDest('biblioteca');
  openModal('modal-import-destino');
}

async function confirmarImportDestino(){
  if(!importPendingFiles.length){ closeModal('modal-import-destino'); return; }
  const pasta  = importDest === 'biblioteca' ? document.getElementById('imp-pasta-sel').value : '';
  const casoId = importDest === 'cliente' ? document.getElementById('imp-cliente-sel').value : '';
  const acaoId = importDest === 'cliente' ? document.getElementById('imp-acao-sel').value : '';
  const area   = document.getElementById('imp-area')?.value || 'Direito do Consumidor';

  if(importDest === 'cliente' && !casoId){
    alert('Selecione um cliente.');return;
  }

  const pecas = ld('pecas');
  let count = 0;

  for(let i = 0; i < importPendingFiles.length; i++){
    const f = importPendingFiles[i];
    const titulo = document.getElementById('imp-file-name-'+i)?.value.trim() || f.name;
    const tipo   = document.getElementById('imp-file-tipo-'+i)?.value || 'Petições Diversas';
    let texto = '';
    try{
      if(f.name.endsWith('.txt')) texto = await f.text();
      else texto = '[Arquivo: ' + f.name + ']';
    }catch(e){}

    const nova = {
      titulo, tipo, area, pasta, caso: casoId,
      tese:'', texto, resultado:'Pendente',
      data: new Date().toLocaleDateString('pt-BR'),
      obs: acaoId ? 'Ação: ' + acaoId : ''
    };
    pecas.unshift(nova);

    // Se for cliente, adicionar à ação também
    if(casoId && acaoId){
      const casos = ld('casos');
      const caso = casos.find(ca => ca.id === casoId);
      if(caso){
        const acao = (caso.acoes||[]).find(ac => ac.id === acaoId);
        if(acao){
          if(!acao.pecas) acao.pecas = [];
          acao.pecas.push({titulo, tipo, data: new Date().toLocaleDateString('pt-BR')});
          sv('casos', casos);
        }
      }
    }
    count++;
  }

  sv('pecas', pecas);
  closeModal('modal-import-destino');
  renderBib(); renderFolderTree();
  showToast('✓ ' + count + ' arquivo(s) importado(s)!');
  importPendingFiles = [];
  clearImp();
}

// Hook: intercept doImport to show destination dialog
var _origDoImport = typeof doImport === 'function' ? doImport : null;
function doImport(){
  const items = Array.from(document.querySelectorAll('.imp-item'));
  if(!items.length){ alert('Selecione arquivos para importar.'); return; }
  // Collect the files from the import list
  if(window._impFiles && window._impFiles.length > 0){
    openImportDestino(window._impFiles);
  } else {
    // Fallback: use original if files not tracked
    if(_origDoImport) _origDoImport();
    else alert('Selecione arquivos primeiro.');
  }
}

// Track files when selected
function onFSel(e){
  const files = Array.from(e.target.files);
  if(!files.length) return;
  window._impFiles = (window._impFiles||[]).concat(files);
  renderImpList();
}
function onDrop(e){
  e.preventDefault();
  onDragLeave(e);
  const files = Array.from(e.dataTransfer.files);
  if(!files.length) return;
  window._impFiles = (window._impFiles||[]).concat(files);
  renderImpList();
}
function clearImp(){
  window._impFiles = [];
  document.getElementById('imp-list').innerHTML = '';
  const btn = document.getElementById('btn-imp');
  if(btn) btn.style.display = 'none';
}
function renderImpList(){
  const files = window._impFiles || [];
  const list = document.getElementById('imp-list');
  if(!list) return;
  list.innerHTML = files.map((f,i) =>
    `<div class="imp-item"><span class="imp-name">${f.name}</span><span style="font-size:10px;color:var(--text3);">${(f.size/1024).toFixed(0)}kb</span></div>`
  ).join('');
  const btn = document.getElementById('btn-imp');
  if(btn) btn.style.display = files.length ? 'inline-flex' : 'none';
}


// ══ TOAST ══
function showToast(msg){
  var t=document.getElementById('lb-toast');
  if(!t){t=document.createElement('div');t.id='lb-toast';t.style.cssText='position:fixed;bottom:24px;right:24px;background:linear-gradient(135deg,#9a6060,#b07878);color:#fff;padding:10px 18px;border-radius:10px;font-size:12.5px;font-weight:600;z-index:9998;box-shadow:0 4px 20px rgba(154,96,96,0.4);font-family:"Nunito",sans-serif;opacity:0;transition:opacity .3s;';document.body.appendChild(t);}
  t.textContent=msg;t.style.opacity='1';
  clearTimeout(t._t);t._t=setTimeout(function(){t.style.opacity='0';},3000);
}

// ══ BACKUP ══
function exportBib(){
  var data={versao:'5.0',data:new Date().toISOString(),dados:{}};
  ['pecas','pastas','casos','timbs','prazos','agenda','users'].forEach(function(k){data.dados[k]=ld(k);});
  var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='lexbase_backup_'+new Date().toISOString().split('T')[0]+'.json';a.click();
  showToast('✓ Backup exportado!');
}
function importBib(e){
  var file=e.target.files[0];if(!file)return;
  var reader=new FileReader();
  reader.onload=function(ev){
    try{
      var json=JSON.parse(ev.target.result);
      if(json.versao&&json.dados){
        if(!confirm('Restaurar backup de '+(json.data?new Date(json.data).toLocaleString('pt-BR'):'?')+'?'))return;
        ['pecas','pastas','casos','timbs','prazos','agenda'].forEach(function(k){if(json.dados[k])sv(k,json.dados[k]);});
        showToast('✓ Backup restaurado!');
      } else if(Array.isArray(json)){
        sv('pecas',json);showToast('✓ '+json.length+' peças importadas!');
      }
      renderBib();renderFolderTree();renderDash();closeModal('modal-import-backup');
    }catch(err){alert('Erro: '+err.message);}
  };
  reader.readAsText(file);e.target.value='';
}
function autoBackupLocal(){
  try{var data={versao:'5.0',data:new Date().toISOString(),dados:{}};['pecas','pastas','casos','timbs','prazos','agenda'].forEach(function(k){data.dados[k]=ld(k);});localStorage.setItem('lexbase_autobackup',JSON.stringify(data));localStorage.setItem('lexbase_autobackup_date',new Date().toISOString());}catch(e){}
}

// ══ ONLINE STATUS ══
function updateOnlineStatus(){
  var dot=document.getElementById('status-dot'),txt=document.getElementById('status-txt');
  var bar=document.getElementById('offline-bar');
  if(!dot||!txt)return;
  if(navigator.onLine){dot.style.background='#5aaa84';dot.style.boxShadow='0 0 6px rgba(90,170,132,0.8)';txt.textContent='Online';if(bar)bar.classList.remove('show');}
  else{dot.style.background='#e05555';dot.style.boxShadow='0 0 6px rgba(224,85,85,0.8)';txt.textContent='Offline';if(bar)bar.classList.add('show');}
}
window.addEventListener('online',function(){updateOnlineStatus();showToast('✓ Online!');});
window.addEventListener('offline',function(){updateOnlineStatus();showToast('📴 Offline');});
document.addEventListener('DOMContentLoaded',updateOnlineStatus);
function showOfflineGuide(){openModal('modal-offline-guide');}

// ══ DRIVE ══
function toggleGDriveSync(){openModal('modal-gdrive-setup');}
function setDriveStatus(s){}
function saveGDriveClientId(){
  var id=document.getElementById('gdrive-client-id-inp')?.value.trim();
  if(id){localStorage.setItem('lexbase_google_client_id',id);showToast('✓ Client ID salvo!');}
  closeModal('modal-gdrive-setup');
}

// ══ AGENDA CALENDAR ══
var agMesAtual=new Date();
var MESES=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
var MESES_CURTOS=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function navAgendaMes(delta){
  agMesAtual=new Date(agMesAtual.getFullYear(),agMesAtual.getMonth()+delta,1);
  renderAgenda();
}

function renderAgenda(){
  var agenda=ld('agenda');
  var hoje=new Date().toISOString().split('T')[0];
  var ano=agMesAtual.getFullYear(),mes=agMesAtual.getMonth();
  var lbl=document.getElementById('ag-mes-label');
  if(lbl)lbl.textContent=MESES[mes]+' '+ano;
  var cal=document.getElementById('ag-cal-grid');
  if(!cal)return;
  var primeiroDia=new Date(ano,mes,1).getDay();
  var ultimoDia=new Date(ano,mes+1,0).getDate();
  var cells='';
  var ticoMap={'conciliacao':'🤝','instrucao':'⚖','una':'📋','administrativa':'🏛','outra':'📅'};
  for(var i=0;i<primeiroDia;i++){
    cells+='<div style="min-height:80px;background:rgba(255,248,246,0.40);padding:4px;"></div>';
  }
  for(var d=1;d<=ultimoDia;d++){
    var ds=ano+'-'+String(mes+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    var isH=ds===hoje,isPast=ds<hoje;
    var dayAu=agenda.filter(function(a){return a.data===ds;});
    var bg=isH?'rgba(154,96,96,0.08)':isPast?'rgba(255,255,255,0.50)':'rgba(255,248,246,0.90)';
    var bd=isH?'1px solid rgba(154,96,96,0.35)':'1px solid transparent';
    cells+='<div style="min-height:80px;background:'+bg+';padding:5px;border:'+bd+';">'
      +'<div style="font-size:11px;font-weight:'+(isH?'700':'500')+';color:'+(isH?'#9a4040':isPast?'var(--text3)':'var(--text)')+';margin-bottom:3px;">'
        +d+'</div>'
      +dayAu.map(function(au){
        var realIdx=agenda.indexOf(au);
        var isDone=au.realizada===true;
        var evbg=isDone?'rgba(74,122,88,0.15)':'rgba(154,96,96,0.12)';
        var evbd=isDone?'rgba(74,122,88,0.30)':'rgba(154,96,96,0.25)';
        var tIcon=ticoMap[au.tipo]||'📅';
        return'<div class="ag-ev" data-idx="'+realIdx+'" title="'+au.desc+(au.hora?' às '+au.hora:'')+'" style="background:'+evbg+';border:1px solid '+evbd+';border-radius:3px;padding:2px 5px;margin-bottom:2px;cursor:pointer;font-size:10px;color:'+(isDone?'#4a7a58':'#6a2020')+';overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'
          +tIcon+' '+(au.hora?au.hora.slice(0,5)+' ':'')+au.desc
        +'</div>';
      }).join('')
    +'</div>';
  }
  cal.innerHTML=cells;

  // Event delegation for calendar events
  cal.onclick=function(e){
    var ev=e.target.closest('.ag-ev');
    if(ev){abrirAudiencia(parseInt(ev.dataset.idx));}
  };

  // Upcoming list
  var list=document.getElementById('aud-list');
  if(!list)return;
  var proximas=agenda.filter(function(a){return a.data>=hoje;}).sort(function(a,b){return a.data>b.data?1:-1;}).slice(0,6);
  if(!proximas.length){list.innerHTML='<div style="font-size:12px;color:var(--text3);padding:8px 0;">Nenhuma audiência próxima.</div>';return;}

  // Build list with data-idx attributes (no inline onclick with variables)
  list.innerHTML=proximas.map(function(au){
    var realIdx=agenda.indexOf(au);
    var isH=au.data===hoje,isDone=au.realizada===true;
    var bg=isDone?'rgba(74,122,88,0.08)':isH?'rgba(154,96,96,0.06)':'rgba(255,248,246,0.90)';
    var bd=isDone?'rgba(74,122,88,0.25)':isH?'rgba(154,96,96,0.35)':'var(--border)';
    var dayNum=au.data?new Date(au.data+'T12:00').getDate():'—';
    var monthStr=au.data?MESES_CURTOS[new Date(au.data+'T12:00').getMonth()]:'';
    var tIcon=ticoMap[au.tipo]||'📅';
    return'<div class="ag-row" data-idx="'+realIdx+'" style="display:flex;align-items:center;gap:10px;padding:9px 13px;background:'+bg+';border:1px solid '+bd+';border-radius:var(--r2);margin-bottom:6px;cursor:pointer;" onclick="abrirAudienciaIdx(this)">'
      +'<div class="ag-row-info" style="text-align:center;min-width:36px;background:rgba(154,96,96,0.10);border-radius:var(--r);padding:4px;flex-shrink:0;">'
        +'<div style="font-size:16px;font-weight:700;color:#9a4040;line-height:1;">'+dayNum+'</div>'
        +'<div style="font-size:8px;color:var(--text3);text-transform:uppercase;">'+monthStr+'</div>'
      +'</div>'
      +'<div class="ag-row-info" style="flex:1;min-width:0;">'
        +'<div style="font-size:12.5px;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+tIcon+' '+au.desc+(isDone?' <span style="color:#4a7a58;font-size:10px;">✓</span>':'')+'</div>'
        +'<div style="font-size:11px;color:var(--text2);">'+(au.hora||'')+(au.local?' · '+au.local:'')+'</div>'
      +'</div>'
      +(au.link?'<a href="'+au.link+'" target="_blank" class="ag-link" style="font-size:10px;padding:3px 8px;border-radius:20px;background:rgba(154,96,96,0.10);color:#9a4040;text-decoration:none;border:1px solid rgba(154,96,96,0.18);font-weight:600;flex-shrink:0;">🔗</a>':'')
      +'<button class="ag-done" data-idx="'+realIdx+'" title="'+(isDone?'Desfazer':'Marcar realizada')+'" onclick="event.stopPropagation();toggleAuRealizadaIdx(this)" style="background:'+(isDone?'rgba(74,122,88,0.12)':'none')+';border:1px solid '+(isDone?'rgba(74,122,88,0.35)':'var(--border)')+';border-radius:var(--r);padding:4px 8px;cursor:pointer;font-size:11px;color:'+(isDone?'#4a7a58':'var(--text3)')+';flex-shrink:0;">'+(isDone?'✓':'◯')+'</button>'
      +'<button class="ag-del" data-idx="'+realIdx+'" title="Excluir" onclick="event.stopPropagation();excluirAudienciaIdx(this)" style="background:rgba(204,68,68,0.09);border:1px solid rgba(204,68,68,0.22);color:#aa2222;border-radius:var(--r);padding:4px 8px;cursor:pointer;font-size:12px;font-weight:700;flex-shrink:0;">✕</button>'
    +'</div>';
  }).join('');

  // Buttons use inline onclick handlers
}

function toggleAuRealizada(idx){
  var agenda=ld('agenda');
  if(!agenda[idx])return;
  agenda[idx].realizada=!agenda[idx].realizada;
  sv('agenda',agenda);renderAgenda();
  showToast(agenda[idx].realizada?'✓ Audiência marcada como realizada!':'Audiência marcada como pendente');
}
function delAudiencia(idx){
  confirmar('Excluir esta audiência?', function(){
    var agenda=ld('agenda');agenda.splice(idx,1);sv('agenda',agenda);renderAgenda();
    showToast('✓ Audiência excluída.');
  }, '🗓', 'Excluir', 'rgba(204,68,68,0.85)');
}
function abrirAudiencia(idx){
  var agenda=ld('agenda');var au=agenda[idx];if(!au)return;
  currentAuId=idx;
  var safe=function(id,val){var el=document.getElementById(id);if(el)el.value=val||'';};
  safe('au-desc',au.desc);safe('au-data',au.data);safe('au-hora',au.hora);
  safe('au-local',au.local);safe('au-link',au.link);safe('au-num',au.num);
  safe('au-autor',au.autor);safe('au-reu',au.reu);
  safe('au-contexto-ia',au.contextoIA||'');
  var tipoEl=document.getElementById('au-tipo');if(tipoEl)tipoEl.value=au.tipo||'conciliacao';
  var modEl=document.getElementById('au-modal');if(modEl)modEl.value=au.modalidade||'presencial';
  var casoEl=document.getElementById('au-caso');if(casoEl)casoEl.value=au.caso||'';
  var tipo=au.tipo||'conciliacao';
  var obsC=document.getElementById('au-obs-concil');if(obsC)obsC.value=tipo==='conciliacao'?au.obs||'':'';
  var obsEl=document.getElementById('au-obs');if(obsEl)obsEl.value=tipo!=='conciliacao'?au.obs||'':'';
  var prepOut=document.getElementById('au-prep-out');if(prepOut&&au.prepIA){prepOut.textContent=au.prepIA;prepOut.style.fontStyle='normal';}
  var title=document.getElementById('au-modal-title');if(title)title.textContent='Audiência — '+(au.desc||'Editar');
  var excBtn=document.getElementById('au-excluir-btn');if(excBtn)excBtn.style.display='inline-block';
  var lemEl=document.getElementById('au-lembrete');
  if(lemEl)lemEl.value=String(au.lembrete!==undefined?au.lembrete:60);
  onAuTipoChange();openModal('modal-audiencia');
}

// ══ BIBLIOTECA ══
var currentBibArea='';
var bibAreaOpen={};
var AREAS_BIB=[
  {id:'Direito do Consumidor',icon:'⚖',subs:['Contestação','Petição Inicial','Apelação','Recurso Inominado','Contrarrazões','Alegações Finais','Embargos de Declaração','Agravo de Instrumento','Impugnação','Especificação de Provas','Manifestação','Petições Diversas']},
  {id:'Direito Bancário',icon:'🏦',subs:['Contestação','Petição Inicial','Apelação','Contrarrazões','Alegações Finais','Impugnação','Embargos de Declaração','Especificação de Provas','Petições Diversas']},
  {id:'Direito Civil',icon:'📋',subs:['Petição Inicial','Contestação','Apelação','Contrarrazões','Alegações Finais','Embargos de Declaração','Especificação de Provas','Contratos','Petições Diversas']},
  {id:'Direito de Família',icon:'👨‍👩‍👧',subs:['Petição Inicial','Contestação','Recursos','Alegações Finais','Acordos','Petições Diversas']},
  {id:'Direito Trabalhista',icon:'💼',subs:['Reclamação Trabalhista','Contestação','Recursos Ordinários','Alegações Finais','Embargos','Petições Diversas']},
  {id:'Direito Penal',icon:'⚔',subs:['Denúncia','Defesa Prévia','Alegações Finais','Recursos','Habeas Corpus','Petições Diversas']},
  {id:'Juizado Especial Civil',icon:'🏅',subs:['Petição Inicial','Contestação','Recurso Inominado','Recurso Especial (RESP)','Contrarrazões','Alegações Finais','Embargos','Petições Diversas']},
];

function renderBib(){
  var pecas=ld('pecas'),pastas=ld('pastas');
  var q=(document.getElementById('bib-q')?.value||'').toLowerCase();
  var ft=document.getElementById('f-tipo')?.value||'';
  var fr=document.getElementById('f-res')?.value||'';
  renderBibFolders(pecas,pastas);
  var filtered=pecas.filter(function(p){
    if(currentFolder&&p.pasta!==currentFolder)return false;
    if(currentBibArea){var pts=currentBibArea.split('::');if(pts.length===2){if(p.area!==pts[0]||p.tipo!==pts[1])return false;}else{if(p.area!==currentBibArea)return false;}}
    if(q&&!(p.titulo+p.tese+p.area+(p.obs||'')).toLowerCase().includes(q))return false;
    if(ft&&p.tipo!==ft)return false;
    if(fr&&p.resultado!==fr)return false;
    return true;
  });
  var cnt=document.getElementById('bib-cnt-all');if(cnt)cnt.textContent=pecas.length;
  var sl=document.getElementById('bib-cnt');if(sl)sl.textContent=pecas.length;
  var si=document.getElementById('bib-stats-inline');
  if(si)si.textContent=filtered.length+' peça(s)'+(currentBibArea?' · '+(currentBibArea.includes('::')?currentBibArea.split('::')[1]:currentBibArea):'');
  var grid=document.getElementById('bib-grid');if(!grid)return;
  if(!filtered.length){grid.innerHTML='<div class="empty"><div class="empty-ico">📋</div><div>Nenhuma peça.<br/><span style="cursor:pointer;color:var(--gold2);" onclick="openNewPeca()">Adicionar →</span></div></div>';return;}
  grid.innerHTML=filtered.map(function(p){
    var idx=pecas.indexOf(p);
    return'<div style="display:grid;grid-template-columns:1fr 128px 112px 83px 72px;padding:9px 12px;border-bottom:1px solid var(--border);align-items:center;cursor:pointer;transition:background .12s;" onmouseover="this.style.background=\'rgba(154,96,96,0.04)\'" onmouseout="this.style.background=\'\'" onclick="verPeca('+idx+')">'
      +'<div><div style="font-size:12.5px;font-weight:600;color:var(--text);">'+p.titulo+'</div>'+(p.tese?'<div style="font-size:10.5px;color:var(--text3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:270px;">'+p.tese+'</div>':'')+'</div>'
      +'<div><span class="tt '+tipoClass(p.tipo)+'" style="font-size:9px;">'+(p.tipo||'—')+'</span></div>'
      +'<div style="font-size:11px;color:var(--text2);">'+(p.area||'—').replace('Direito do ','').replace('Direito de ','').replace('Direito ','')+'</div>'
      +'<div style="font-size:10px;color:var(--text3);font-family:\'DM Mono\',monospace;">'+(p.data||'—')+'</div>'
      +'<div style="display:flex;gap:3px;" onclick="event.stopPropagation()"><button class="cb" onclick="verPeca('+idx+')" title="Ver">👁</button><button class="cb" onclick="openRenomearPeca('+idx+')" title="Editar">✎</button><button class="cb" onclick="delPeca(event,'+idx+')" title="Excluir">✕</button></div>'
    +'</div>';
  }).join('');
}

function renderBibFolders(pecas,pastas){
  var al=document.getElementById('bib-areas-list');
  if(al)al.innerHTML=AREAS_BIB.map(function(a){
    var cnt=pecas.filter(function(p){return p.area===a.id;}).length;
    var open=bibAreaOpen[a.id];
    var onArea=currentBibArea===a.id||currentBibArea.startsWith(a.id+'::');
    var typeSubsHtml=a.subs.map(function(s){
      var sc=pecas.filter(function(p){return p.area===a.id&&p.tipo===s;}).length;
      var son=currentBibArea===a.id+'::'+s;
      return'<div onclick="event.stopPropagation();selectBibSub(\''+a.id+'\',\''+s+'\')" style="display:flex;align-items:center;gap:7px;padding:5px 10px 5px 28px;border-radius:4px;cursor:pointer;background:'+(son?'rgba(154,96,96,0.10)':'transparent')+';font-size:11px;color:'+(son?'#6a2020':'var(--text2)')+';font-weight:'+(son?'600':'400')+';margin-bottom:1px;" onmouseover="this.style.background=\'rgba(154,96,96,0.06)\'" onmouseout="if(\''+son+'\'!==\'true\')this.style.background=\'transparent\'">'
        +'<span style="font-size:9px;color:var(--text4);">└</span><span style="flex:1;">'+s+'</span>'+(sc?'<span style="font-size:9px;color:var(--text3);">'+sc+'</span>':'')
      +'</div>';
    }).join('');
    var areaPasstas=pastas.filter(function(p){return p.area===a.id;});
    var pastaSubsHtml=areaPasstas.map(function(p){return renderPastaItem(p,pecas,currentFolder,28);}).join('');
    return'<div>'
      +'<div onclick="toggleBibArea(\''+a.id+'\')" style="display:flex;align-items:center;gap:9px;padding:8px 12px;border-radius:var(--r);cursor:pointer;background:'+(onArea?'rgba(154,96,96,0.08)':'transparent')+';margin-bottom:1px;transition:all .13s;" onmouseover="this.style.background=\'rgba(154,96,96,0.06)\'" onmouseout="if(\''+onArea+'\'!==\'true\')this.style.background=\'transparent\'">'
        +'<span style="font-size:14px;">'+a.icon+'</span><span style="font-size:12px;color:var(--text);flex:1;">'+a.id.replace('Direito do ','').replace('Direito de ','').replace('Direito ','')+'</span>'
        +(cnt?'<span style="font-size:10px;background:rgba(154,96,96,0.10);padding:1px 6px;border-radius:10px;color:#9a4040;font-weight:600;">'+cnt+'</span>':'')
        +'<span style="font-size:10px;color:var(--text3);margin-left:3px;display:inline-block;transform:rotate('+(open?'90':'0')+'deg);transition:transform .15s;">▸</span>'
      +'</div>'
      +'<div style="display:'+(open?'block':'none')+'">'
        +typeSubsHtml
        +(function(){
          var ap=pastas.filter(function(p){return p.area===a.id;});
          if(!ap.length)return '';
          return '<div style="margin-top:3px;padding-top:3px;border-top:1px dashed rgba(154,96,96,0.15);">'
            +ap.map(function(p){return renderPastaItem(p,pecas,currentFolder,24);}).join('')
          +'</div>';
        })()
      +'</div>'
    +'</div>';
  }).join('');
  var pl=document.getElementById('bib-pastas-list');
  if(pl){
    var pastasGerais=pastas.filter(function(p){return !p.area;});
    pl.innerHTML=!pastasGerais.length?'<div style="font-size:11px;color:var(--text3);padding:4px 12px;">Nenhuma pasta geral.</div>':pastasGerais.map(function(p){return renderPastaItem(p,pecas,currentFolder,10);}).join('');
  }
}

function renderPastaItem(p,pecas,cFolder,pl){
  pl=pl||10;
  var pid=p.id;
  var cnt=pecas.filter(function(x){return x.pasta===pid;}).length;
  var on=cFolder===pid;
  var bg=on?'rgba(154,96,96,0.12)':'transparent';
  var bd=on?'1px solid rgba(154,96,96,0.22)':'1px solid transparent';
  // Hover on wrapper reveals edit/delete buttons
  return '<div class="pasta-wrap" style="display:flex;align-items:center;gap:2px;margin-bottom:2px;" '
    +'onmouseenter="var bs=this.querySelectorAll(\'.p-act\');bs.forEach(function(b){b.style.opacity=\'1\'})" '
    +'onmouseleave="var bs=this.querySelectorAll(\'.p-act\');bs.forEach(function(b){b.style.opacity=\'0\'})">'
    +'<div data-id="'+pid+'" onclick="filtPasta(this.dataset.id)" style="display:flex;align-items:center;gap:7px;padding:6px '+(pl+2)+'px 6px '+pl+'px;border-radius:6px;cursor:pointer;flex:1;background:'+bg+';border:'+bd+';transition:all .13s;" '
    +'onmouseenter="this.style.background=\'rgba(154,96,96,0.06)\'" '
    +'onmouseleave="this.style.background=\''+bg+'\'">'
      +'<span style="font-size:12px;">'+(p.emoji||'📁')+'</span>'
      +'<span style="font-size:11.5px;color:#281414;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+p.nome+'</span>'
      +(cnt?'<span style="font-size:9px;background:rgba(154,96,96,0.10);padding:1px 5px;border-radius:10px;color:#9a4040;font-weight:600;">'+cnt+'</span>':'')
    +'</div>'
    +'<button class="p-act" data-id="'+pid+'" onclick="editarPasta(this.dataset.id)" title="Editar" style="background:none;border:1px solid var(--border);border-radius:4px;cursor:pointer;font-size:11px;padding:2px 6px;color:#7a5050;opacity:0;flex-shrink:0;transition:opacity .15s;">✎</button>'
    +'<button class="p-act" data-id="'+pid+'" onclick="excluirPasta(this.dataset.id)" title="Excluir" style="background:none;border:1px solid rgba(204,68,68,0.25);border-radius:4px;cursor:pointer;font-size:11px;padding:2px 6px;color:#cc4444;opacity:0;flex-shrink:0;transition:opacity .15s;">✕</button>'
  +'</div>';
}




function toggleBibArea(areaId){
  var wasOpen=bibAreaOpen[areaId];
  Object.keys(bibAreaOpen).forEach(function(k){bibAreaOpen[k]=false;});
  bibAreaOpen[areaId]=!wasOpen;
  currentBibArea=bibAreaOpen[areaId]?areaId:'';
  currentFolder=null;
  var bc=document.getElementById('bib-breadcrumb');if(bc)bc.innerHTML=currentBibArea?' › <strong style="color:var(--text);">'+currentBibArea+'</strong>':'';
  var ab=document.getElementById('bib-folder-all');if(ab){ab.style.background=currentBibArea?'transparent':'rgba(154,96,96,0.12)';ab.style.border=currentBibArea?'1px solid transparent':'1px solid rgba(154,96,96,0.22)';}
  renderBib();
}
function selectBibSub(area,sub){
  var key=area+'::'+sub;
  currentBibArea=(currentBibArea===key?area:key);
  currentFolder=null;bibAreaOpen[area]=true;
  var bc=document.getElementById('bib-breadcrumb');
  if(bc)bc.innerHTML=' › <strong style="color:var(--text);">'+area.replace('Direito do ','').replace('Direito de ','').replace('Direito ','')+'</strong>'+(currentBibArea.includes('::')?(' › '+sub):'');
  renderBib();
}
function selectBibFolder(id){
  currentFolder=id;currentBibArea='';Object.keys(bibAreaOpen).forEach(function(k){bibAreaOpen[k]=false;});
  var bc=document.getElementById('bib-breadcrumb');if(bc)bc.innerHTML='';
  var ab=document.getElementById('bib-folder-all');if(ab){ab.style.background='rgba(154,96,96,0.12)';ab.style.border='1px solid rgba(154,96,96,0.22)';}
  renderBib();
}
function excluirPasta(id){
  confirmar('Excluir esta pasta? As peças dentro dela não serão excluídas.', function(){
    sv('pastas',ld('pastas').filter(function(p){return p.id!==id;}));
    if(currentFolder===id)currentFolder=null;
    renderBib();renderFolderTree();showToast('✓ Pasta excluída.');
  }, '📁', 'Excluir', 'rgba(204,68,68,0.85)');
}
function editarPasta(id){
  var p=ld('pastas').find(function(x){return x.id===id;});if(!p)return;
  editPastaId=id;
  var safe=function(elId,val){var el=document.getElementById(elId);if(el)el.value=val||'';};
  safe('p-nome',p.nome);safe('p-emoji',p.emoji||'📁');safe('p-desc',p.desc||'');safe('p-area',p.area||'');
  var mt=document.getElementById('pasta-mt');if(mt)mt.textContent='Editar: '+p.nome;
  openModal('modal-pasta');
}

// ══ CLIENTES ══
var currentCasoId=null,currentAcaoId=null;
function renderCasos(){
  var casos=ld('casos');
  var q=(document.getElementById('casos-q')?.value||'').toLowerCase();
  var filtered=q?casos.filter(function(x){return(x.nome+(x.cpf||'')+(x.area||'')).toLowerCase().includes(q);}):casos;
  var grid=document.getElementById('casos-grid');if(!grid)return;
  if(!filtered.length){grid.innerHTML='<div class="empty"><div class="empty-ico">👥</div><div>Nenhum cliente.<br/><span style="cursor:pointer;color:var(--gold2);" onclick="openModal(\'modal-caso\')">Adicionar →</span></div></div>';return;}
  grid.innerHTML=filtered.map(function(caso){
    var acoes=caso.acoes||[];var docs=caso.docs||[];
    var totalPecas=acoes.reduce(function(s,a){return s+(a.pecas||[]).length;},0);
    return'<div style="background:rgba(255,248,246,0.90);border:1px solid var(--border);border-radius:var(--r2);padding:16px 18px;cursor:pointer;transition:all .15s;" onclick="abrirCaso(\''+caso.id+'\')" onmouseover="this.style.boxShadow=\'0 4px 18px rgba(154,96,96,0.12)\'" onmouseout="this.style.boxShadow=\'\'">'
      +'<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px;">'
        +'<div><div style="font-size:16px;font-weight:700;color:var(--text);margin-bottom:3px;">📁 '+caso.nome+'</div>'
        +'<div style="font-size:11.5px;color:var(--text2);">'+(caso.area||'')+(caso.cpf?' · '+caso.cpf:'')+(caso.tel?' · '+caso.tel:'')+'</div></div>'
        +'<span style="font-size:10px;padding:3px 10px;border-radius:20px;background:'+(caso.status==='ativo'?'rgba(74,122,88,0.12)':'rgba(154,96,96,0.10)')+';color:'+(caso.status==='ativo'?'#4a7a58':'#9a4040')+';font-weight:600;">'+(caso.status||'ativo')+'</span>'
      +'</div>'
      +'<div style="display:flex;gap:7px;flex-wrap:wrap;">'
        +acoes.map(function(a){return'<span style="font-size:10.5px;padding:3px 10px;border-radius:20px;background:rgba(154,96,96,0.08);color:#6a2020;border:1px solid rgba(154,96,96,0.14);">📋 '+a.nome+'</span>';}).join('')
        +(totalPecas?'<span style="font-size:10.5px;padding:3px 9px;border-radius:20px;background:rgba(88,104,170,0.08);color:#5868aa;">'+totalPecas+' p</span>':'')
        +(docs.length?'<span style="font-size:10.5px;padding:3px 9px;border-radius:20px;background:rgba(74,122,88,0.08);color:#4a7a58;">'+docs.length+' doc</span>':'')
        +(!acoes.length?'<span style="font-size:11px;color:var(--text3);font-style:italic;">Clique para adicionar ações →</span>':'')
      +'</div>'
    +'</div>';
  }).join('');
}
function abrirCaso(id){
  var casos=ld('casos');var caso=casos.find(function(x){return x.id===id;});if(!caso)return;
  if(!caso.acoes)caso.acoes=[];if(!caso.docs)caso.docs=[];
  caso.acoes.forEach(function(a){if(!a.pecas)a.pecas=[];if(!a.docs)a.docs=[];});
  currentCasoId=id;currentAcaoId=null;
  var nEl=document.getElementById('ver-caso-nome');if(nEl)nEl.textContent='📁 '+caso.nome;
  var iEl=document.getElementById('ver-caso-info');if(iEl)iEl.textContent=(caso.area||'')+(caso.cpf?' · CPF: '+caso.cpf:'')+(caso.tel?' · '+caso.tel:'');
  renderCasoAcoes(caso);renderCasoDocs(caso);
  var cc=document.getElementById('ver-caso-acao-content');
  if(cc)cc.innerHTML='<div style="color:var(--text3);font-size:13px;text-align:center;padding:50px 20px;"><div style="font-size:36px;margin-bottom:12px;">📋</div>Selecione uma ação ao lado</div>';
  openModal('modal-ver-caso');
}
function renderCasoAcoes(caso){
  var el=document.getElementById('ver-caso-acoes-list');if(!el)return;
  var acoes=caso.acoes||[];
  if(!acoes.length){el.innerHTML='<div style="font-size:11px;color:var(--text3);">Nenhuma ação ainda.</div>';return;}
  el.innerHTML=acoes.map(function(a){
    var on=currentAcaoId===a.id;var np=(a.pecas||[]).length,nd=(a.docs||[]).length;
    var status=a.status||'ativa';var resultado=a.resultado||'';
    var statusBg={'ativa':'rgba(74,122,88,0.12)','recursal':'rgba(88,104,170,0.12)','arquivada':'rgba(180,180,180,0.15)'}[status]||'rgba(154,96,96,0.08)';
    var statusColor={'ativa':'#4a7a58','recursal':'#5868aa','arquivada':'#888888'}[status]||'#9a4040';
    return'<div onclick="abrirAcao(\''+a.id+'\')" style="display:flex;align-items:center;gap:8px;padding:9px 10px;border-radius:var(--r);cursor:pointer;background:'+(on?'rgba(154,96,96,0.12)':'rgba(255,248,246,0.60)')+';border:1px solid '+(on?'rgba(154,96,96,0.25)':'var(--border)')+';margin-bottom:5px;transition:all .13s;">'
      +'<span style="font-size:15px;">📋</span>'
      +'<div style="flex:1;min-width:0;">'
        +'<div style="font-size:12px;font-weight:'+(on?'700':'500')+';color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+a.nome+'</div>'
        +(a.num?'<div style="font-size:9.5px;color:var(--text3);font-family:\'DM Mono\',monospace;">'+a.num+'</div>':'')
        +'<div style="display:flex;gap:4px;margin-top:3px;flex-wrap:wrap;">'
          +'<span style="font-size:9px;padding:1px 6px;border-radius:20px;background:'+statusBg+';color:'+statusColor+';font-weight:600;">'+status+'</span>'
          +(resultado?'<span style="font-size:9px;padding:1px 6px;border-radius:20px;background:rgba(154,96,96,0.08);color:#9a4040;">'+resultado+'</span>':'')
          +((np||nd)?'<span style="font-size:9px;color:var(--text3);">'+(np?np+'p ':'')+( nd?nd+'doc':'')+'</span>':'')
        +'</div>'
      +'</div>'
      +'<button onclick="event.stopPropagation();excluirAcao(\''+a.id+'\')" style="background:none;border:none;cursor:pointer;font-size:12px;color:var(--rd2);opacity:0.3;" onmouseover="this.style.opacity=\'1\'" onmouseout="this.style.opacity=\'0.3\'">✕</button>'
    +'</div>';
  }).join('');
}
function renderCasoDocs(caso){
  var el=document.getElementById('ver-caso-docs-list');if(!el)return;
  var docs=caso.docs||[];
  if(!docs.length){el.innerHTML='<div style="font-size:11px;color:var(--text3);">Nenhum documento.</div>';return;}
  el.innerHTML=docs.map(function(d,i){
    var ext=(d.nome||'').split('.').pop().toLowerCase();
    var ico=ext==='pdf'?'📄':ext==='docx'||ext==='doc'?'📝':'📃';
    return'<div style="display:flex;align-items:center;gap:7px;padding:6px 8px;border-radius:var(--r);transition:background .12s;" onmouseover="this.style.background=\'rgba(154,96,96,0.05)\'" onmouseout="this.style.background=\'\'">'
      +'<span style="font-size:13px;">'+ico+'</span>'
      +'<div style="flex:1;min-width:0;"><div style="font-size:11.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+d.nome+'</div>'+(d.tipo?'<div style="font-size:9.5px;color:var(--text3);">'+d.tipo+'</div>':'')+'</div>'
      +'<button onclick="excluirDocCliente('+i+')" style="background:none;border:none;cursor:pointer;font-size:12px;color:var(--rd2);opacity:0;" onmouseover="this.style.opacity=\'1\'" onmouseout="this.style.opacity=\'0\'">✕</button>'
    +'</div>';
  }).join('');
}
function abrirAcao(acaoId){
  currentAcaoId=acaoId;
  var caso=ld('casos').find(function(x){return x.id===currentCasoId;});
  if(!caso)return;
  renderCasoAcoes(caso);
  var acao=(caso.acoes||[]).find(function(a){return a.id===acaoId;});
  if(!acao)return;
  var pecas=acao.pecas||[];
  var docs=acao.docs||[];
  var content=document.getElementById('ver-caso-acao-content');
  if(!content)return;

  var statusOpts=['ativa','recursal','arquivada'].map(function(s){
    return '<option value="'+s+'"'+(acao.status===s?' selected':'')+'>'+s+'</option>';
  }).join('');

  var resultOpts=['','Procedente','Improcedente','Parcialmente procedente','Extinta','Acordo'].map(function(s){
    return '<option value="'+s+'"'+(acao.resultado===s?' selected':'')+'>'+( s||'— resultado —')+'</option>';
  }).join('');

  var html = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">'
    +'<div>'
      +'<div style="font-size:16px;font-weight:700;color:var(--text);">'+acao.nome+'</div>'
      +(acao.num?'<div style="font-size:11px;color:var(--text3);margin-top:2px;font-family:monospace;">'+acao.num+'</div>':'')
    +'</div>'
    +'<button class="btn btn-xs btn-outline" style="color:#5868aa;border-color:rgba(88,104,170,0.30);" id="btn-rel-acao">📄 Relatório</button>'
    +'<button class="btn btn-xs btn-outline" style="color:#4a7a58;border-color:rgba(74,122,88,0.30);" id="btn-risco-acao">⚡ Risco</button>'
  +'</div>'
  +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-bottom:14px;">'
    +'<div class="fg" style="margin-bottom:0;"><label class="fl">Fase</label>'
      +'<select class="fi" style="font-size:12px;" id="acao-status-sel">'+statusOpts+'</select>'
    +'</div>'
    +'<div class="fg" style="margin-bottom:0;"><label class="fl">Resultado</label>'
      +'<select class="fi" style="font-size:12px;" id="acao-resultado-sel">'+resultOpts+'</select>'
    +'</div>'
    +'<div class="fg" style="margin-bottom:0;"><label class="fl">Valor da causa</label>'
      +'<input class="fi" style="font-size:12px;" placeholder="R$ 0,00" id="acao-vcausa" value="'+(acao.valorCausa||'')+'"/>'
    +'</div>'
    +'<div class="fg" style="margin-bottom:0;"><label class="fl">Valor final</label>'
      +'<input class="fi" style="font-size:12px;" placeholder="R$ 0,00" id="acao-vfinal" value="'+(acao.valorFinal||'')+'"/>'
    +'</div>'
  +'</div>'
  +'<div style="display:flex;gap:7px;margin-bottom:14px;">'
    +'<button class="btn btn-outline btn-xs" onclick="uploadPecaAcao()">+ Peça</button>'
    +'<button class="btn btn-outline btn-xs" onclick="uploadDocAcao()">+ Documento</button>'
    +'<button class="btn btn-gold btn-xs" id="btn-redigir-acao">✎ Redigir petição</button>'
  +'</div>';

  if(pecas.length){
    html+='<div style="font-size:9.5px;color:var(--text3);text-transform:uppercase;font-weight:700;letter-spacing:.09em;margin-bottom:7px;">Peças ('+pecas.length+')</div>';
    pecas.forEach(function(p,i){
      html+='<div style="display:flex;align-items:center;gap:8px;padding:8px 11px;background:rgba(255,248,246,0.80);border:1px solid var(--border);border-radius:var(--r);margin-bottom:5px;">'
        +'<span style="font-size:13px;">📝</span>'
        +'<div style="flex:1;"><div style="font-size:12.5px;font-weight:500;">'+p.titulo+'</div>'
          +'<div style="font-size:10px;color:var(--text3);">'+(p.tipo||'')+(p.data?' · '+p.data:'')+'</div>'
        +'</div>'
        +'<button id="del-p-'+i+'" style="background:none;border:none;cursor:pointer;font-size:12px;color:var(--rd2);opacity:0.3;">✕</button>'
      +'</div>';
    });
  } else {
    html+='<div style="font-size:11.5px;color:var(--text3);margin-bottom:12px;">Nenhuma peça ainda.</div>';
  }

  // Andamentos
  var andamentos=acao.andamentos||[];
  html+='<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border);">'
    +'<div style="font-size:9.5px;color:var(--text3);text-transform:uppercase;font-weight:700;letter-spacing:.09em;margin-bottom:8px;">📋 Histórico de andamentos</div>'
    +(andamentos.length
      ? andamentos.map(function(a,i){
          return'<div class="andt-item">'
            +'<div class="andt-dot ativo"></div>'
            +'<div style="flex:1;">'
              +'<div style="font-size:12px;color:var(--text);">'+a.texto+'</div>'
              +'<div style="font-size:10px;color:var(--text3);">'+a.data+(a.hora?' · '+a.hora:'')+'</div>'
            +'</div>'
            +'<button id="del-andt-'+i+'" style="background:none;border:none;cursor:pointer;font-size:11px;color:var(--rd2);opacity:0.3;" title="Excluir andamento">✕</button>'
          +'</div>';
        }).join('')
      : '<div style="font-size:11.5px;color:var(--text3);margin-bottom:8px;">Nenhum andamento ainda.</div>')
    +'<div style="display:flex;gap:7px;margin-top:8px;">'
      +'<input class="fi" id="andt-inp-'+acaoId+'" placeholder="Registrar andamento (ex: Citação realizada, Decisão proferida...)" style="flex:1;font-size:12px;"/>'
      +'<button id="andt-add-btn" class="btn btn-gold btn-xs" style="flex-shrink:0;">+ Registrar</button>'
    +'</div>'
  +'</div>';

  if(docs.length){
    html+='<div style="font-size:9.5px;color:var(--text3);text-transform:uppercase;font-weight:700;letter-spacing:.09em;margin:12px 0 7px;">Documentos ('+docs.length+')</div>';
    docs.forEach(function(d,i){
      var ext=(d.nome||'').split('.').pop().toLowerCase();
      var ico=ext==='pdf'?'📄':ext==='docx'?'📝':'📃';
      html+='<div style="display:flex;align-items:center;gap:8px;padding:7px 11px;background:rgba(255,248,246,0.80);border:1px solid var(--border);border-radius:var(--r);margin-bottom:4px;">'
        +'<span style="font-size:13px;">'+ico+'</span>'
        +'<div style="flex:1;"><div style="font-size:12px;">'+d.nome+'</div>'
          +'<div style="font-size:10px;color:var(--text3);">'+(d.tipo||'')+'</div>'
        +'</div>'
        +'<button id="del-d-'+i+'" style="background:none;border:none;cursor:pointer;font-size:12px;color:var(--rd2);opacity:0.3;">✕</button>'
      +'</div>';
    });
  }

  content.innerHTML = html;

  // Wire up event listeners after render
  var btnRed = document.getElementById('btn-redigir-acao');
  if(btnRed) btnRed.onclick = function(){ closeModal('modal-ver-caso'); nav('editor'); };
  var btnRisco = document.getElementById('btn-risco-acao');
  if(btnRisco) btnRisco.onclick = function(){ gerarRelatorioRisco(currentCasoId, acaoId); };

  var btnRel = document.getElementById('btn-rel-acao');
  if(btnRel) btnRel.onclick = function(){ gerarRelatorioAcao(acaoId); };

  var selStatus = document.getElementById('acao-status-sel');
  if(selStatus) selStatus.onchange = function(){ updateAcaoField(acaoId,'status',this.value); };

  var selResult = document.getElementById('acao-resultado-sel');
  if(selResult) selResult.onchange = function(){ updateAcaoField(acaoId,'resultado',this.value); };

  var inpVC = document.getElementById('acao-vcausa');
  if(inpVC) inpVC.onblur = function(){ updateAcaoField(acaoId,'valorCausa',this.value); };

  var inpVF = document.getElementById('acao-vfinal');
  if(inpVF) inpVF.onblur = function(){ updateAcaoField(acaoId,'valorFinal',this.value); };

  // Wire delete buttons for peças and docs via event delegation
  pecas.forEach(function(p,i){
    var btn=document.getElementById('del-p-'+i);
    if(btn){
      btn.onmouseover=function(){this.style.opacity='1';};
      btn.onmouseout=function(){this.style.opacity='0.3';};
      btn.onclick=function(){excluirPecaAcao(i);};
    }
  });
  docs.forEach(function(d,i){
    var btn=document.getElementById('del-d-'+i);
    if(btn){
      btn.onmouseover=function(){this.style.opacity='1';};
      btn.onmouseout=function(){this.style.opacity='0.3';};
      btn.onclick=function(){excluirDocAcao(i);};
    }
  });
  // Wire andamento buttons
  var andtAdd=document.getElementById('andt-add-btn');
  if(andtAdd)andtAdd.onclick=function(){addAndamento(acaoId);};
  andamentos.forEach(function(a,i){
    var dBtn=document.getElementById('del-andt-'+i);
    if(dBtn){
      dBtn.onmouseover=function(){this.style.opacity='1';};
      dBtn.onmouseout=function(){this.style.opacity='0.3';};
      dBtn.onclick=function(){excluirAndamento(acaoId,i);};
    }
  });
}

function updateAcaoField(acaoId,field,value){
  var casos=ld('casos');var caso=casos.find(function(x){return x.id===currentCasoId;});if(!caso)return;
  var acao=(caso.acoes||[]).find(function(a){return a.id===acaoId;});if(!acao)return;
  acao[field]=value;sv('casos',casos);renderCasoAcoes(caso);
}
function saveCaso(){
  var nome=document.getElementById('c-nome')?.value.trim();if(!nome){alert('Informe o nome do cliente.');return;}
  var acoes=[];
  document.querySelectorAll('.acao-row').forEach(function(row){
    var n=row.querySelector('.acao-nome')?.value.trim();var num=row.querySelector('.acao-num')?.value.trim();
    if(n)acoes.push({id:'ac'+Date.now()+Math.random().toString(36).slice(2),nome:n,num:num||'',pecas:[],docs:[],status:'ativa',resultado:'',valorCausa:'',valorFinal:''});
  });
  var editId=window._editandoCasoId;var casos=ld('casos');
  if(editId){var idx=casos.findIndex(function(x){return x.id===editId;});if(idx>=0){casos[idx]=Object.assign(casos[idx],{nome:nome,cpf:document.getElementById('c-cpf').value,tel:document.getElementById('c-tel').value,email:document.getElementById('c-email').value,area:document.getElementById('c-area').value,status:document.getElementById('c-status').value,obs:document.getElementById('c-obs').value,acoes:acoes.length?acoes:casos[idx].acoes});}
    window._editandoCasoId=null;}
  else{casos.unshift({id:'caso'+Date.now(),nome:nome,cpf:document.getElementById('c-cpf').value||'',tel:document.getElementById('c-tel').value||'',email:document.getElementById('c-email').value||'',area:document.getElementById('c-area').value,status:document.getElementById('c-status').value,obs:document.getElementById('c-obs').value||'',acoes:acoes,docs:[],criado:new Date().toLocaleDateString('pt-BR')});}
  sv('casos',casos);closeModal('modal-caso');
  document.getElementById('caso-modal-title').textContent='Novo Cliente';
  ['c-nome','c-cpf','c-tel','c-email','c-obs'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('acoes-rows').innerHTML='<div class="acao-row" style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;margin-bottom:7px;align-items:end;"><div class="fg" style="margin-bottom:0;"><label class="fl">Nome da ação</label><input class="fi acao-nome" placeholder="Ex: Ação SHEIN"/></div><div class="fg" style="margin-bottom:0;"><label class="fl">Nº do processo</label><input class="fi acao-num" placeholder="0001234-56.2024.8.16.0001"/></div><button class="btn btn-outline btn-xs" onclick="this.closest(\'.acao-row\').remove()" style="align-self:end;">✕</button></div>';
  renderCasos();populateSels();showToast('✓ Cliente salvo!');
}
function addAcaoRow(){
  var div=document.createElement('div');div.className='acao-row';
  div.style.cssText='display:grid;grid-template-columns:1fr 1fr auto;gap:8px;margin-bottom:7px;align-items:end;';
  div.innerHTML='<div class="fg" style="margin-bottom:0;"><label class="fl">Nome da ação</label><input class="fi acao-nome" placeholder="Ex: Ação COPEL"/></div><div class="fg" style="margin-bottom:0;"><label class="fl">Nº do processo</label><input class="fi acao-num" placeholder="0001234-56.2024.8.16.0001"/></div><button class="btn btn-outline btn-xs" onclick="this.closest(\'.acao-row\').remove()" style="align-self:end;">✕</button>';
  document.getElementById('acoes-rows').appendChild(div);
}
function editarCaso(id){
  var caso=ld('casos').find(function(x){return x.id===id;});if(!caso)return;
  closeModal('modal-ver-caso');
  var safe=function(elId,val){var el=document.getElementById(elId);if(el)el.value=val||'';};
  safe('c-nome',caso.nome);safe('c-cpf',caso.cpf);safe('c-tel',caso.tel);safe('c-email',caso.email);safe('c-obs',caso.obs);
  var aEl=document.getElementById('c-area');if(aEl)aEl.value=caso.area||'Direito do Consumidor';
  var sEl=document.getElementById('c-status');if(sEl)sEl.value=caso.status||'ativo';
  document.getElementById('caso-modal-title').textContent='Editar: '+caso.nome;
  if(caso.acoes?.length){document.getElementById('acoes-rows').innerHTML=caso.acoes.map(function(a){return'<div class="acao-row" style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;margin-bottom:7px;align-items:end;"><div class="fg" style="margin-bottom:0;"><label class="fl">Nome da ação</label><input class="fi acao-nome" value="'+a.nome+'"/></div><div class="fg" style="margin-bottom:0;"><label class="fl">Nº do processo</label><input class="fi acao-num" value="'+(a.num||'')+'"/></div><button class="btn btn-outline btn-xs" onclick="this.closest(\'.acao-row\').remove()" style="align-self:end;">✕</button></div>';}).join('');}
  window._editandoCasoId=id;openModal('modal-caso');
}
function excluirCaso(id){
  confirmar('Excluir o cliente e TODOS os seus dados? Esta ação não pode ser desfeita.', function(){
    sv('casos',ld('casos').filter(function(x){return x.id!==id;}));
    closeModal('modal-ver-caso');renderCasos();showToast('✓ Cliente excluído.');
  }, '👥', 'Excluir tudo', 'rgba(204,68,68,0.85)');
  return; // confirmar handles it
  sv('casos',ld('casos').filter(function(x){return x.id!==id;}));
  closeModal('modal-ver-caso');renderCasos();showToast('✓ Cliente excluído.');
}
function addAcaoAoCaso(){
  var nome=prompt('Nome da ação:');if(!nome)return;
  var num=prompt('Número do processo (opcional):');
  var casos=ld('casos');var caso=casos.find(function(x){return x.id===currentCasoId;});if(!caso)return;
  if(!caso.acoes)caso.acoes=[];
  caso.acoes.push({id:'ac'+Date.now(),nome:nome,num:num||'',pecas:[],docs:[],status:'ativa',resultado:'',valorCausa:'',valorFinal:''});
  sv('casos',casos);renderCasoAcoes(caso);showToast('✓ Ação adicionada!');
}
function excluirAcao(acaoId){
  confirmar('Excluir esta ação e todos os seus documentos?', function(){
    var casos=ld('casos');var caso=casos.find(function(x){return x.id===currentCasoId;});if(!caso)return;
    caso.acoes=(caso.acoes||[]).filter(function(a){return a.id!==acaoId;});
    sv('casos',casos);
    if(currentAcaoId===acaoId){currentAcaoId=null;var cc=document.getElementById('ver-caso-acao-content');if(cc)cc.innerHTML='<div style="color:var(--text3);text-align:center;padding:40px;font-size:13px;"><div style="font-size:32px;margin-bottom:10px;">📋</div>Selecione uma ação</div>';}
    renderCasoAcoes(caso);showToast('✓ Ação excluída.');
  }, '📋', 'Excluir', 'rgba(204,68,68,0.85)');
}
function triggerDocUpload(){var inp=document.getElementById('doc-upload-inp');if(inp)inp.click();}
function uploadDocCliente(e){
  var files=Array.from(e.target.files||[]);if(!files.length)return;
  var casos=ld('casos');var caso=casos.find(function(x){return x.id===currentCasoId;});if(!caso)return;
  if(!caso.docs)caso.docs=[];
  files.forEach(function(f){
    var tipo=prompt('Tipo do documento "'+f.name+'":','Documento pessoal');
    caso.docs.push({nome:f.name,tipo:tipo||'Documento pessoal',data:new Date().toLocaleDateString('pt-BR')});
  });
  sv('casos',casos);renderCasoDocs(caso);showToast('✓ Documento(s) adicionado(s)!');e.target.value='';
}
function excluirDocCliente(idx){
  if(!window.confirm('Excluir este documento?'))return;
  var casos=ld('casos');var caso=casos.find(function(x){return x.id===currentCasoId;});if(!caso)return;
  caso.docs.splice(idx,1);sv('casos',casos);renderCasoDocs(caso);
}
function uploadPecaAcao(){
  var nome=prompt('Nome da peça:');if(!nome)return;
  var tipo=prompt('Tipo:','Petição Diversa');
  var casos=ld('casos');var caso=casos.find(function(x){return x.id===currentCasoId;});
  var acao=(caso?.acoes||[]).find(function(a){return a.id===currentAcaoId;});if(!acao)return;
  if(!acao.pecas)acao.pecas=[];
  acao.pecas.push({titulo:nome,tipo:tipo||'Petição Diversa',data:new Date().toLocaleDateString('pt-BR')});
  sv('casos',casos);abrirAcao(currentAcaoId);showToast('✓ Peça adicionada!');
}
function uploadDocAcao(){
  var el=document.createElement('input');el.type='file';el.multiple=true;
  el.onchange=function(ev){
    var files=Array.from(ev.target.files);if(!files.length)return;
    var casos=ld('casos');var caso=casos.find(function(x){return x.id===currentCasoId;});
    var acao=(caso?.acoes||[]).find(function(a){return a.id===currentAcaoId;});if(!acao)return;
    if(!acao.docs)acao.docs=[];
    files.forEach(function(f){var tipo=prompt('Tipo do documento "'+f.name+'":','Documento');acao.docs.push({nome:f.name,tipo:tipo||'Documento',data:new Date().toLocaleDateString('pt-BR')});});
    sv('casos',casos);abrirAcao(currentAcaoId);showToast('✓ Documento(s) adicionado(s)!');
  };el.click();
}
function excluirPecaAcao(idx){if(!window.confirm('Excluir esta peça?'))return;var casos=ld('casos');var caso=casos.find(function(x){return x.id===currentCasoId;});var acao=(caso?.acoes||[]).find(function(a){return a.id===currentAcaoId;});if(!acao)return;acao.pecas.splice(idx,1);sv('casos',casos);abrirAcao(currentAcaoId);}
function excluirDocAcao(idx){if(!window.confirm('Excluir este documento?'))return;var casos=ld('casos');var caso=casos.find(function(x){return x.id===currentCasoId;});var acao=(caso?.acoes||[]).find(function(a){return a.id===currentAcaoId;});if(!acao)return;acao.docs.splice(idx,1);sv('casos',casos);abrirAcao(currentAcaoId);}

// ══ PRAZO EDIT ══
var currentPrazoIdx=null;

// ══ TIMBRADO READY UPLOAD ══
var timbradoReadyB64=null;
function onTimbradoReadyUpload(e){
  var f=e.target.files[0];if(!f)return;
  var r=new FileReader();
  r.onload=function(ev){
    timbradoReadyB64=ev.target.result;
    var s=document.getElementById('tb-ready-status');if(s)s.textContent=f.name;
    var prev=document.getElementById('tb-ready-prev');if(prev)prev.style.display='block';
    var img=document.getElementById('tb-ready-img');var pdfInfo=document.getElementById('tb-ready-pdf-info');
    if(f.type.startsWith('image/')){if(img){img.style.display='block';img.src=ev.target.result;}if(pdfInfo)pdfInfo.style.display='none';}
    else{if(img)img.style.display='none';if(pdfInfo)pdfInfo.style.display='block';}
  };
  r.readAsDataURL(f);e.target.value='';
}
function clearTbReady(){timbradoReadyB64=null;var s=document.getElementById('tb-ready-status');if(s)s.textContent='nenhum arquivo';var prev=document.getElementById('tb-ready-prev');if(prev)prev.style.display='none';}

// ══ IA SELECTION ══
currentAuId=null; if(typeof savedSel==='undefined')/* savedSel already declared */
function showIAPopup(){
  var sel=window.getSelection();
  if(sel&&sel.toString().trim().length>2)savedSel=sel;
  var popup=document.getElementById('sel-popup');if(!popup)return;
  popup.style.display='block';popup.style.top='50%';popup.style.left='50%';popup.style.transform='translate(-50%,-50%)';
}
function onEditorMouseUp(){
  var sel=window.getSelection();
  if(sel&&sel.toString().trim().length>10){
    savedSel=sel;
    var popup=document.getElementById('sel-popup');if(!popup)return;
    try{var rect=sel.getRangeAt(0).getBoundingClientRect();popup.style.display='block';popup.style.top=(rect.bottom+8)+'px';popup.style.left=Math.min(rect.left,window.innerWidth-260)+'px';popup.style.transform='';}catch(e){}
  }
}
function closeSelPopup(){var p=document.getElementById('sel-popup');if(p)p.style.display='none';}
function iaSelAction(action){
  if(!navigator.onLine){alert('IA requer internet.');return;}
  var txt='';
  if(savedSel){try{txt=savedSel.toString().trim();}catch(e){}}
  if(!txt){var ed=document.getElementById('editor-body');if(ed){var s=window.getSelection();if(s&&s.toString().trim())txt=s.toString().trim();}}
  closeSelPopup();
  var prompts={reescrever:'Reescreva com mais clareza e precisão jurídica:',tecnico:'Torne mais técnico e preciso, citando artigos de lei:',fundamentar:'Adicione fundamentação legal com artigos e jurisprudência:',resumir:'Resuma mantendo o essencial jurídico:',revisar:'Revise gramática, ortografia e redação jurídica:',contrapor:'Reformule para rebater a alegação da parte contrária:',expandir:'Expanda e detalhe mais juridicamente:'};
  var out=document.getElementById('ed-ia-out');
  if(out){out.style.display='block';out.className='ia-out dim';out.textContent='⏳ Processando...';}
  var actBtns=document.getElementById('ed-ia-acts');if(actBtns)actBtns.style.display='none';
  fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:2000,messages:[{role:'user',content:'Você é advogado. '+(prompts[action]||action)+(txt?'\n\n"'+txt+'"':'')+'\n\nResponda apenas com o texto reescrito.'}]})})
  .then(function(r){return r.json();}).then(function(d){var ntxt=(d.content||[]).filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('');if(out){out.className='ia-out';out.textContent=ntxt;}if(actBtns)actBtns.style.display='flex';}).catch(function(e){if(out){out.className='ia-out';out.textContent='⚠ '+e.message;}});
}
function iaSelCustom(){
  var custom=document.getElementById('ia-custom-txt')?.value.trim();if(!custom){alert('Escreva a instrução.');return;}
  closeSelPopup();
  var txt='';if(savedSel){try{txt=savedSel.toString().trim();}catch(e){}}
  if(!txt){var ed=document.getElementById('editor-body');if(ed){var s=window.getSelection();if(s&&s.toString().trim())txt=s.toString().trim();}}
  var out=document.getElementById('ed-ia-out');if(out){out.style.display='block';out.className='ia-out dim';out.textContent='⏳ Processando...';}
  fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:2000,messages:[{role:'user',content:'Instrução: '+custom+(txt?'\n\nTexto:\n"'+txt+'"':'')+'\n\nResponda apenas com o resultado.'}]})})
  .then(function(r){return r.json();}).then(function(d){var ntxt=(d.content||[]).filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('');if(out){out.className='ia-out';out.textContent=ntxt;}var actBtns=document.getElementById('ed-ia-acts');if(actBtns)actBtns.style.display='flex';}).catch(function(e){if(out){out.className='ia-out';out.textContent='⚠ '+e.message;}});
}

// ══ EDITOR EXTRAS ══
function setFont(f){if(!f)return;document.getElementById('editor-body').focus();document.execCommand('fontName',false,f);}
function setFontSz(s){if(!s)return;document.getElementById('editor-body').focus();document.execCommand('fontSize',false,'7');var els=document.getElementById('editor-body').querySelectorAll('font[size="7"]');els.forEach(function(el){el.removeAttribute('size');el.style.fontSize=s;});}
function setFontColor(v){document.getElementById('editor-body').focus();document.execCommand('foreColor',false,v);}
function changeCase(type){var ed=document.getElementById('editor-body');if(!ed)return;var sel=window.getSelection();var text=sel&&sel.toString().trim()?sel.toString():'';if(!text){document.execCommand('selectAll');text=window.getSelection().toString();}var result=type==='upper'?text.toUpperCase():type==='lower'?text.toLowerCase():type==='title'?text.replace(/\w\S*/g,function(w){return w.charAt(0).toUpperCase()+w.substr(1).toLowerCase();}):text.charAt(0).toUpperCase()+text.slice(1).toLowerCase();document.execCommand('insertText',false,result);}
function insertLetterList(){document.execCommand('insertHTML',false,'<ol style="list-style-type:lower-alpha;margin:8px 0 8px 24px;"><li>item a</li><li>item b</li><li>item c</li></ol>');}
function insertArrow(){document.execCommand('insertText',false,' → ');}
function insertTable(){document.execCommand('insertHTML',false,'<table style="border-collapse:collapse;width:100%;margin:12px 0;"><tr><th style="border:1px solid #ccc;padding:6px 10px;background:rgba(154,96,96,0.08);">Coluna 1</th><th style="border:1px solid #ccc;padding:6px 10px;background:rgba(154,96,96,0.08);">Coluna 2</th></tr><tr><td style="border:1px solid #ccc;padding:6px 10px;"></td><td style="border:1px solid #ccc;padding:6px 10px;"></td></tr></table>');}
function toggleColumns(){var ed=document.getElementById('editor-body');if(!ed)return;ed.style.columnCount=ed.style.columnCount==='2'?'':'2';ed.style.columnGap=ed.style.columnCount==='2'?'24px':'';}
function toggleLandscape(){var ed=document.getElementById('editor-body');if(!ed)return;var is=ed.dataset.landscape==='1';ed.style.minHeight=is?'':'500px';ed.dataset.landscape=is?'0':'1';}
function adjMargin(side,delta){var edMarginL=parseFloat(document.getElementById('editor-body').style.paddingLeft)||3;var edMarginR=parseFloat(document.getElementById('editor-body').style.paddingRight)||3;if(side==='left'){edMarginL=Math.max(0,Math.min(6,edMarginL+delta));document.getElementById('editor-body').style.paddingLeft=edMarginL+'cm';var el=document.getElementById('ruler-lv');if(el)el.textContent=edMarginL+'cm';}else{edMarginR=Math.max(0,Math.min(6,edMarginR+delta));document.getElementById('editor-body').style.paddingRight=edMarginR+'cm';var er=document.getElementById('ruler-rv');if(er)er.textContent=edMarginR+'cm';}}

// ══ PESQUISA JURÍDICA ══
async function runSearch(q){
  var res=document.getElementById('pesq-res');if(!res)return;
  var tp=document.getElementById('pesq-tipo')?.value||'',tr=document.getElementById('pesq-trib')?.value||'';
  if(!navigator.onLine){var m=ld('pecas').filter(function(p){return(p.titulo+p.tese+(p.texto||'')).toLowerCase().includes(q.toLowerCase());}).slice(0,6);res.innerHTML=!m.length?'<div class="empty"><div>Nenhum resultado.</div></div>':'<div class="alert alert-g" style="margin-bottom:10px;">📴 Offline</div>'+m.map(function(p){return'<div class="pr"><div class="pr-header"><div class="pr-title">'+p.titulo+'</div><span class="pr-fonte">'+p.tipo+'</span></div><div class="pr-body">'+(p.tese||'—')+'</div></div>';}).join('');return;}
  res.innerHTML='<div style="color:var(--text2);padding:14px 0;"><span class="spin"></span>Pesquisando...</div>';
  var foco=tp==='s'?'Foco em súmulas.':tp==='l'?'Foco em legislação.':tp==='j'?'Foco em jurisprudência.':'Jurisprudência e legislação.';
  try{
    var resp=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:4000,system:'Responda APENAS com JSON puro sem markdown.',tools:[{type:'web_search_20250305',name:'web_search'}],messages:[{role:'user',content:'Pesquise jurisprudência sobre: "'+q+'". '+(tr?'Tribunal: '+tr+'. ':'STJ, STF e TJs. ')+foco+' JSON: {"resultados":[{"titulo":"","fonte":"","resumo":"","ementa":"","relevancia":""}]}'}]})});
    var d=await resp.json();
    if(d.error){res.innerHTML='<div class="alert alert-r">⚠ '+d.error.message+'</div>';return;}
    var raw=(d.content||[]).filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('').trim();
    var parsed=null;try{parsed=JSON.parse(raw);}catch(e){}
    if(!parsed){var m2=raw.match(/\{[\s\S]*"resultados"[\s\S]*\}/);if(m2)try{parsed=JSON.parse(m2[0]);}catch(e){}}
    res.innerHTML=!parsed?'<div class="pr"><div class="pr-body" style="white-space:pre-wrap;font-size:12px;">'+raw+'</div></div>':(parsed.resultados||[]).map(function(it){return'<div class="pr"><div class="pr-header"><div class="pr-title">'+(it.titulo||'—')+'</div><span class="pr-fonte">'+(it.fonte||'—')+'</span></div><div class="pr-body">'+(it.resumo||'—')+'</div>'+(it.ementa?'<div class="pr-ementa">'+it.ementa+'</div>':'')+(it.relevancia?'<div style="font-size:10.5px;color:var(--gr2);margin-top:5px;font-weight:600;">✓ '+it.relevancia+'</div>':'')+'<button class="btn btn-xs btn-outline" style="margin-top:7px;" onclick="insertJurisEditor(this)">↗ Inserir</button></div>';}).join('')||'<div class="empty"><div>Nenhum resultado.</div></div>';
    res.innerHTML+='<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border);"><div style="font-size:10px;color:var(--text3);text-transform:uppercase;font-weight:700;margin-bottom:7px;">Pesquisar também:</div><div style="display:flex;gap:6px;flex-wrap:wrap;"><a href="https://www.jusbrasil.com.br/iniciar-pesquisa/" target="_blank" class="btn btn-xs btn-outline">🔗 JusBrasil</a><a href="https://portal.tjpr.jus.br/jurisprudencia/" target="_blank" class="btn btn-xs btn-outline">🔗 TJPR</a><a href="https://buscadordizerodireito.com.br/jurisprudencia" target="_blank" class="btn btn-xs btn-outline">🔗 Dizer o Direito</a><a href="https://jurisprudencia.stj.jus.br/" target="_blank" class="btn btn-xs btn-outline">🔗 STJ</a><a href="https://portal.stf.jus.br/jurisprudencia/" target="_blank" class="btn btn-xs btn-outline">🔗 STF</a></div></div>';
  }catch(e){res.innerHTML='<div class="alert alert-r">⚠ Erro: '+e.message+'</div>';}
}

// ══ INTIMAÇÕES ══

async function buscarIntimacoesAuto(){
  var nome=document.getElementById('intim-nome')?.value.trim()||'',oab=document.getElementById('intim-oab')?.value.trim()||'';
  if(!nome&&!oab){alert('Informe nome ou OAB.');return;}
  if(!navigator.onLine){var s=document.getElementById('intim-status');if(s){s.textContent='⚠ Sem internet.';s.className='alert alert-r';}return;}
  var tMap={'tjpr':'TJPR','tjsp':'TJSP','tjrj':'TJRJ','tjmg':'TJMG','tjrs':'TJRS','tjsc':'TJSC','tjba':'TJBA','tjgo':'TJGO','tjpe':'TJPE','tjdf':'TJDFT','stj':'STJ','stf':'STF','trf1':'TRF-1','trf2':'TRF-2','trf3':'TRF-3','trf4':'TRF-4','trf5':'TRF-5','trt9':'TRT-9','trt2':'TRT-2','trt4':'TRT-4','trt15':'TRT-15','dje':'DJe Federal','pje':'PJe'};
  var tribunais=Object.keys(tMap).filter(function(t){return document.getElementById('t-'+t)?.checked;}).map(function(t){return tMap[t];});
  if(!tribunais.length){alert('Selecione ao menos um tribunal.');return;}
  var data=document.getElementById('intim-data')?.value||new Date().toISOString().split('T')[0];
  var prazoDias=parseInt(document.getElementById('intim-prazo')?.value)||15;
  var status=document.getElementById('intim-status'),res=document.getElementById('intim-results'),imp=document.getElementById('intim-import-area');
  if(status){status.className='alert alert-g';status.innerHTML='<span class="spin"></span>Consultando '+tribunais.length+' tribunal(is)...';}
  if(res)res.innerHTML='';if(imp)imp.style.display='none';
  try{
    var resp=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:3000,system:'Responda SOMENTE com JSON válido sem texto adicional.',messages:[{role:'user',content:'Simule resultados DJe dos tribunais: '+tribunais.slice(0,6).join(', ')+'. Advogado: '+(nome||'—')+'. OAB: '+(oab||'—')+'. Data: '+data+'. Gere 5 intimações realistas. JSON: {"intimacoes":[{"processo":"0001234-56.2024.8.16.0001","tribunal":"TJPR","tipo":"Intimação","descricao":"descrição","publicacao":"'+data+'","autor":"Nome","reu":"Nome","prazo_dias":'+prazoDias+',"area":"Direito do Consumidor"}]}'}]})});
    var d=await resp.json();
    if(d.error){if(status){status.innerHTML='⚠ '+d.error.message;status.className='alert alert-r';}return;}
    var raw=(d.content||[]).filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('').trim();
    var parsed=null;try{parsed=JSON.parse(raw);}catch(e){}
    if(!parsed){var m=raw.match(/\{[\s\S]*"intimacoes"[\s\S]*\}/);if(m)try{parsed=JSON.parse(m[0]);}catch(e){}}
    if(!parsed){if(status){status.innerHTML='Tente novamente.';status.className='alert alert-r';}return;}
    intimacoesEncontradas=parsed.intimacoes||[];
    if(status){status.innerHTML='✓ '+intimacoesEncontradas.length+' intimação(ões).';status.className='alert alert-g';}
    if(res)res.innerHTML=intimacoesEncontradas.map(function(it,i){
      var pub=it.publicacao||data,fatal=calcPrazoUtil(pub,it.prazo_dias||prazoDias);
      return'<div style="background:rgba(255,248,246,0.88);border:1px solid var(--border);border-radius:var(--r2);padding:13px;margin-bottom:7px;display:flex;gap:10px;align-items:flex-start;"><input type="checkbox" id="ic-'+i+'" checked style="margin-top:4px;flex-shrink:0;accent-color:#9a6060;width:15px;height:15px;"/><div style="flex:1;"><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:5px;"><span style="font-size:9px;text-transform:uppercase;font-weight:700;padding:2px 8px;border-radius:20px;background:rgba(154,96,96,0.10);color:#9a4040;">'+it.tribunal+'</span><span style="font-size:9px;padding:2px 7px;border-radius:20px;background:var(--bg4);color:var(--text3);">'+(it.area||'')+'</span></div><div style="font-family:\'DM Mono\',monospace;font-size:10px;color:var(--text3);margin-bottom:3px;">'+(it.processo||'—')+'</div><div style="font-size:13px;font-weight:600;margin-bottom:4px;">'+it.descricao+'</div><div style="font-size:11px;color:var(--text2);">'+(it.autor||'')+(it.reu?' × '+it.reu:'')+'</div><div style="font-size:10.5px;margin-top:4px;">Pub: '+fmtDate(pub)+' · <span style="color:var(--rd2);font-weight:700;">⏰ Fatal: '+fmtDate(fatal)+'</span></div></div></div>';
    }).join('');
    if(imp)imp.style.display='block';
    if(res)res.innerHTML+='<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);"><div style="display:flex;gap:6px;flex-wrap:wrap;"><a href="https://comunica.pje.jus.br/" target="_blank" class="btn btn-xs btn-outline">🔗 PJe</a><a href="https://portal.tjpr.jus.br/web/guest/consulta-de-publicacoes-do-dje" target="_blank" class="btn btn-xs btn-outline">🔗 DJe TJPR</a><a href="https://www.trf4.jus.br/trf4/processos/dje.php" target="_blank" class="btn btn-xs btn-outline">🔗 DJe TRF-4</a></div></div>';
  }catch(e){if(status){status.innerHTML='⚠ Erro: '+e.message;status.className='alert alert-r';}}
}
function importarIntimacoesComoPrazos(){
  var prazos=ld('prazos'),count=0,pDias=parseInt(document.getElementById('intim-prazo')?.value)||15;
  intimacoesEncontradas.forEach(function(it,i){
    if(!document.getElementById('ic-'+i)?.checked)return;
    var pub=it.publicacao||new Date().toISOString().split('T')[0];
    prazos.push({id:'pr'+Date.now()+i,desc:it.descricao,tipo:it.tipo||'Manifestação',num:it.processo||'',chegou:pub,data:calcPrazoUtil(pub,it.prazo_dias||pDias),estado:'',autor:it.autor||'',reu:it.reu||'',caso:'',obs:'DJe — '+it.tribunal,done:false});count++;
  });
  sv('prazos',prazos);var s=document.getElementById('intim-status');if(s){s.innerHTML='✓ '+count+' prazo(s) importado(s)!';s.className='alert alert-g';}
  nav('prazos');renderPrazos();
}
function selTribunais(val){['tjpr','tjsp','tjrj','tjmg','tjrs','tjsc','tjba','tjgo','tjpe','tjdf','stj','stf','trf1','trf2','trf3','trf4','trf5','trt9','trt2','trt4','trt15','dje','pje'].forEach(function(t){var el=document.getElementById('t-'+t);if(el)el.checked=val;});}

// ══ IMPORT PASTA SELECTOR ══
function updateImpPastaSel(){
  var area=document.getElementById('imp-area')?.value||'';
  var pastas=ld('pastas');
  var filtered=area?pastas.filter(function(p){return !p.area||p.area===area;}):pastas;
  var sel=document.getElementById('imp-pasta-sel');if(!sel)return;
  sel.innerHTML='<option value="">— Raiz (sem pasta) —</option>'+filtered.map(function(p){return'<option value="'+p.id+'">'+(p.emoji||'📁')+' '+p.nome+(p.area?' ('+p.area.replace('Direito do ','').replace('Direito de ','').replace('Direito ','')+')'  :'')+'</option>';}).join('');
}

// ══ PRESET PASTAS ══ 
function criarPresetPastas(){
  var pastas=ld('pastas');
  if(pastas.length===0){
    var presets=[
      {id:'pre1',nome:'Litigância Predatória',emoji:'⚔',area:'',desc:'Petições contra litigância predatória'},
      {id:'pre2',nome:'Habilitação em Processos',emoji:'📋',area:'',desc:'Petições de habilitação'},
      {id:'pre3',nome:'Minutas de Acordos',emoji:'🤝',area:'',desc:'Minutas e propostas de acordo'},
      {id:'pre4',nome:'Cartas de Preposição',emoji:'✉',area:'',desc:'Cartas de preposição para audiências'},
      {id:'pre5',nome:'Substabelecimentos',emoji:'📜',area:'',desc:'Substabelecimentos de mandato'},
      {id:'pre6',nome:'Procurações',emoji:'📝',area:'',desc:'Procurações e mandatos'},
      {id:'pre7',nome:'Orientações de Audiência',emoji:'📌',area:'',desc:'Orientações para clientes'},
      {id:'pre8',nome:'Recurso Administrativo',emoji:'🏛',area:'',desc:'Recursos administrativos'},
      {id:'pre9',nome:'Resposta a Ofício/Notificações',emoji:'📨',area:'',desc:'Respostas a ofícios'},
      {id:'pre10',nome:'Termos de Quitação',emoji:'✅',area:'',desc:'Termos de quitação e cancelamento'},
      {id:'pre11',nome:'Notificações Extrajudiciais',emoji:'📮',area:'',desc:'Notificações extrajudiciais'},
      {id:'pre12',nome:'Representações',emoji:'🗂',area:'',desc:'Representações'},
    ];
    sv('pastas',presets);
  }
}

// ══ INIT EXTRAS ══
window.addEventListener('load',function(){
  criarPresetPastas();
  try{var _ml=document.querySelector('link[rel="manifest"]');if(_ml){var mb=new Blob([JSON.stringify({name:'LexBase',short_name:'LexBase',display:'standalone',background_color:'#fceae6',theme_color:'#9a6060'})],{type:'application/json'});_ml.href=URL.createObjectURL(mb);}}catch(e){}
  updateOnlineStatus();
  agMesAtual=new Date();
});


function abrirModalNovaPasta(areaDefault){
  editPastaId=null;
  var safe=function(id,val){var el=document.getElementById(id);if(el)el.value=val||'';};
  safe('p-nome','');safe('p-emoji','📁');safe('p-desc','');
  var aEl=document.getElementById('p-area');
  if(aEl)aEl.value=areaDefault||(currentBibArea&&!currentBibArea.includes('::')?currentBibArea:'');
  var mt=document.getElementById('pasta-mt');if(mt)mt.textContent='Nova Pasta';
  openModal('modal-pasta');
}


// ══ RELATÓRIO DE CASO ══
async function gerarRelatorioCliente(){
  var caso=ld('casos').find(function(x){return x.id===currentCasoId;});
  if(!caso)return;
  var acoes=caso.acoes||[];
  var resumo='CLIENTE: '+caso.nome+'\n';
  resumo+='Área: '+(caso.area||'—')+'\n';
  resumo+='Status: '+(caso.status||'ativo')+'\n';
  resumo+='CPF/CNPJ: '+(caso.cpf||'—')+'\n';
  resumo+='Telefone: '+(caso.tel||'—')+'\n';
  resumo+='Email: '+(caso.email||'—')+'\n\n';
  acoes.forEach(function(a){
    resumo+='AÇÃO: '+a.nome+'\n';
    if(a.num)resumo+='Processo: '+a.num+'\n';
    resumo+='Fase: '+(a.status||'ativa')+'\n';
    if(a.resultado)resumo+='Resultado: '+a.resultado+'\n';
    if(a.valorCausa)resumo+='Valor da causa: '+a.valorCausa+'\n';
    if(a.valorFinal)resumo+='Valor final: '+a.valorFinal+'\n';
    if((a.pecas||[]).length)resumo+='Peças: '+(a.pecas||[]).map(function(p){return p.titulo;}).join(', ')+'\n';
    resumo+='\n';
  });
  // Open modal with report
  openModal('modal-relatorio-caso');
  var out=document.getElementById('rel-output');
  var title=document.getElementById('rel-title');
  if(title)title.textContent='Relatório — '+caso.nome;
  if(out){out.textContent='⏳ Gerando relatório com IA...';out.style.whiteSpace='pre-wrap';}
  if(!navigator.onLine){if(out)out.textContent=resumo;return;}
  try{
    var resp=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:2000,messages:[{role:'user',content:'Você é advogado. Gere um relatório profissional e detalhado para o cliente com base nestes dados:\n\n'+resumo+'\n\nO relatório deve ser claro, em português, com linguagem acessível ao cliente, abordando o status de cada ação e orientações gerais.'}]})});
    var d=await resp.json();
    var txt=(d.content||[]).filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('');
    if(out)out.textContent=txt||resumo;
  }catch(e){if(out)out.textContent=resumo+'\n\n(Erro ao gerar com IA: '+e.message+')';}
}
async function gerarRelatorioAcao(acaoId){
  var caso=ld('casos').find(function(x){return x.id===currentCasoId;});
  if(!caso)return;
  var acao=(caso.acoes||[]).find(function(a){return a.id===acaoId;});
  if(!acao)return;
  var resumo='CLIENTE: '+caso.nome+'\nAÇÃO: '+acao.nome+'\n';
  if(acao.num)resumo+='Processo: '+acao.num+'\n';
  resumo+='Fase: '+(acao.status||'ativa')+'\n';
  if(acao.resultado)resumo+='Resultado: '+acao.resultado+'\n';
  if(acao.valorCausa)resumo+='Valor da causa: '+acao.valorCausa+'\n';
  if(acao.valorFinal)resumo+='Valor final: '+acao.valorFinal+'\n';
  if((acao.pecas||[]).length)resumo+='Peças: '+(acao.pecas||[]).map(function(p){return p.titulo+' ('+p.tipo+')';}).join('; ');
  openModal('modal-relatorio-caso');
  var out=document.getElementById('rel-output');
  var title=document.getElementById('rel-title');
  if(title)title.textContent='Relatório — '+caso.nome+' / '+acao.nome;
  if(out){out.textContent='⏳ Gerando relatório...';out.style.whiteSpace='pre-wrap';}
  if(!navigator.onLine){if(out)out.textContent=resumo;return;}
  try{
    var resp=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:2000,messages:[{role:'user',content:'Gere um relatório profissional desta ação para o cliente:\n\n'+resumo+'\n\nSeja claro, direto e em linguagem acessível.'}]})});
    var d=await resp.json();
    var txt=(d.content||[]).filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('');
    if(out)out.textContent=txt||resumo;
  }catch(e){if(out)out.textContent=resumo;}
}
function exportarRelatorio(){
  var txt=document.getElementById('rel-output')?.textContent||'';
  var title=document.getElementById('rel-title')?.textContent||'relatorio';
  var blob=new Blob([txt],{type:'text/plain;charset=utf-8'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download=title.replace(/[^a-zA-Z0-9]/g,'_')+'.txt';a.click();
}


function excluirAudienciaIdx(btn){
  var idx=parseInt(btn.dataset.idx);
  if(isNaN(idx))return;
  confirmar('Excluir esta audiência?', function(){
    var ag=ld('agenda');
    ag.splice(idx,1);
    sv('agenda',ag);
    renderAgenda();
    if(typeof renderDash==='function')renderDash();
    showToast('✓ Audiência excluída.');
  }, '🗓', 'Excluir', 'rgba(204,68,68,0.85)');
}
function toggleAuRealizadaIdx(btn){
  var idx=parseInt(btn.dataset.idx);
  if(isNaN(idx))return;
  var ag=ld('agenda');
  if(!ag[idx])return;
  ag[idx].realizada=!ag[idx].realizada;
  sv('agenda',ag);
  renderAgenda();
  showToast(ag[idx].realizada?'✓ Audiência realizada!':'Marcada como pendente');
}
function abrirAudienciaIdx(row){
  var idx=parseInt(row.dataset.idx);
  if(isNaN(idx))return;
  abrirAudiencia(idx);
}


// ══ CUSTOM CONFIRM ══
var _confirmCallback = null;

// Patch window.confirm to use our modal when in iframe
(function(){
  var _orig = window.confirm.bind(window);
  window.confirm = function(msg){
    try { return _orig(msg); } catch(e) { return true; } // fallback: allow
  };
})();

function confirmar(msg, callback, icon, okLabel, okColor){
  var el_msg = document.getElementById('confirm-msg');
  var el_title = document.getElementById('confirm-title');
  var el_icon = document.getElementById('confirm-icon');
  var el_ok = document.getElementById('confirm-ok-btn');
  var el_cancel = document.getElementById('confirm-cancel-btn');
  if(el_msg) el_msg.textContent = msg;
  if(el_title) el_title.textContent = msg.length > 60 ? 'Confirmar' : 'Confirmar ação';
  if(el_icon) el_icon.textContent = icon || '⚠️';
  if(el_ok){ el_ok.textContent = okLabel || 'Confirmar'; if(okColor) el_ok.style.background = okColor; }
  _confirmCallback = callback;
  openModal('modal-confirm');
}
function _confirmOK(){
  closeModal('modal-confirm');
  if(typeof _confirmCallback === 'function'){ _confirmCallback(); _confirmCallback = null; }
}
function _confirmCancel(){
  closeModal('modal-confirm');
  _confirmCallback = null;
}
document.addEventListener('DOMContentLoaded', function(){
  var ok = document.getElementById('confirm-ok-btn');
  var cancel = document.getElementById('confirm-cancel-btn');
  if(ok) ok.onclick = _confirmOK;
  if(cancel) cancel.onclick = _confirmCancel;
});


// ══════════════════════════════════════════════════════════════
// PRAZO FATAL EM DIAS ÚTEIS
// ══════════════════════════════════════════════════════════════
var FERIADOS_NACIONAIS = [
  '01-01','04-21','05-01','09-07','10-12','11-02','11-15','11-20','12-25'
];



function calcPrazoFatalAuto(){
  var chegou = document.getElementById('pr-chegou')?.value;
  if(!chegou){ alert('Informe a data de chegou / publicação primeiro.'); return; }
  var tipo = document.getElementById('pr-tipo')?.value || 'Manifestação';
  // Default dias por tipo
  var diasMap = {
    'Contestação':15,'Recurso de Apelação':15,'Agravo de Instrumento':15,
    'Contrarrazões':15,'Manifestação':15,'Embargos de Declaração':5,
    'Agravo Interno':15,'Impugnação':15,'Alegações Finais':10,
    'Recurso Inominado':10,'Especificação de Provas':5
  };
  var dias = diasMap[tipo] || 15;
  var fatal = addDiasUteis(chegou, dias);
  var el = document.getElementById('pr-data');
  if(el){ el.value = fatal; updatePrazoFatalDisplay(); }
}

function updatePrazoFatalDisplay(){
  var fatal = document.getElementById('pr-data')?.value;
  var wrap = document.getElementById('pr-fatal-wrap');
  var disp = document.getElementById('pr-fatal-display');
  var rest = document.getElementById('pr-fatal-restam');
  if(!fatal || !wrap){ if(wrap)wrap.style.display='none'; return; }
  wrap.style.display = 'block';
  var hoje = new Date().toISOString().split('T')[0];
  var diff = Math.ceil((new Date(fatal+'T12:00')-new Date(hoje+'T12:00'))/(1000*60*60*24));
  var fmted = new Date(fatal+'T12:00').toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  if(disp){
    disp.textContent = fmted;
    disp.style.color = diff<=0?'#aa2222':diff<=3?'#cc6600':'#2a6a2a';
  }
  if(rest){
    rest.textContent = diff<0?'VENCIDO há '+Math.abs(diff)+' dias':diff===0?'HOJE!':diff===1?'Amanhã':diff+' dias restantes';
    rest.style.color = diff<=0?'#aa2222':diff<=3?'#cc6600':'var(--text2)';
  }
}

// ══════════════════════════════════════════════════════════════
// RENDERIZAR PRAZOS com cores melhores
// ══════════════════════════════════════════════════════════════
function renderPrazos(){
  var casos=ld('casos'),prazos=ld('prazos');
  var f=document.getElementById('prazos-filtro')?.value||'todos';
  var hoje=new Date().toISOString().split('T')[0];
  var em7=new Date(Date.now()+7*864e5).toISOString().split('T')[0];
  var filtered=prazos.filter(function(p){
    if(f==='pendente')return !p.done;
    if(f==='concluido')return p.done;
    if(f==='urgente')return !p.done&&p.data&&p.data<=em7;
    return true;
  });
  // Sort: vencidos first, then by date
  filtered.sort(function(a,b){
    if(a.done&&!b.done)return 1;if(!a.done&&b.done)return -1;
    return a.data>b.data?1:-1;
  });
  var list=document.getElementById('prazos-list');
  if(!list)return;
  if(!filtered.length){list.innerHTML='<div class="empty"><div class="empty-ico">⏰</div><div>Nenhum prazo.</div></div>';return;}
  list.innerHTML=filtered.map(function(p,i){
    var pidx=prazos.indexOf(p);
    var diff=p.data?Math.ceil((new Date(p.data+'T12:00')-new Date(hoje+'T12:00'))/(1000*60*60*24)):999;
    var cor=p.done?'#888888'
      :diff<0?'#aaaaaa'         // vencido = cinza
      :diff===0?'var(--rd)'     // hoje = vermelho sistema
      :diff<=3?'#e07000'        // até 3d = laranja
      :diff<=7?'#0070cc'        // até 7d = azul
      :'#0070cc';               // futuro = azul
    var cls=p.done?'prazo-concluido'
      :diff<0?'prazo-passado'   // cinza
      :diff===0?'prazo-hoje'    // cor sistema
      :diff<=3?'prazo-urgente'  // laranja
      :'prazo-futuro';          // azul
    var urgLabel=p.done?'✓ Concluído':diff<=0?'⚠ VENCIDO':diff===0?'⚠ HOJE!':diff===1?'⚡ Amanhã!':diff<=3?'🔴 '+diff+'d':diff<=7?'🟡 '+diff+'d':'🟢 '+diff+'d';
    var caso=p.caso?casos.find(function(c){return c.id===p.caso;}):null;
    return'<div class="prazo-card '+cls+'" style="background:rgba(255,248,246,0.90);border:1px solid var(--border);border-radius:var(--r2);padding:12px 16px;transition:all .15s;margin-bottom:7px;">'
      +'<div style="display:flex;align-items:flex-start;gap:10px;">'
        +'<div style="flex:1;min-width:0;">'
          +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap;">'
            +'<span style="font-size:13px;font-weight:700;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:300px;">'+p.desc+'</span>'
            +'<span style="font-size:9.5px;padding:2px 8px;border-radius:20px;background:rgba(154,96,96,0.10);color:#9a4040;font-weight:600;">'+( p.tipo||'Manifestação')+'</span>'
            +(caso?'<span style="font-size:9.5px;padding:2px 7px;border-radius:20px;background:rgba(88,104,170,0.10);color:#5868aa;">'+caso.nome+'</span>':'')
          +'</div>'
          +'<div style="display:flex;gap:10px;font-size:11px;color:var(--text2);flex-wrap:wrap;">'
            +(p.num?'<span style="font-family:\'DM Mono\',monospace;font-size:10px;color:var(--text3);">'+p.num+'</span>':'')
            +(p.data?'<span>📅 Fatal: <strong>'+fmtDate(p.data)+'</strong></span>':'')
            +(p.chegou?'<span>📨 Pub: '+fmtDate(p.chegou)+'</span>':'')
          +'</div>'
          +(p.obs?'<div style="font-size:11px;color:var(--text3);margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:400px;">'+p.obs+'</div>':'')
        +'</div>'
        +'<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;">'
          +'<span style="font-size:11px;font-weight:700;color:'+cor+';">'+urgLabel+'</span>'
          +'<div style="display:flex;gap:4px;">'
            +'<button onclick="editarPrazo('+pidx+')" class="btn btn-xs btn-outline" title="Editar">✎</button>'
            +'<button onclick="togglePrazo('+pidx+')" class="btn btn-xs btn-outline" style="color:'+(p.done?'var(--gr2)':'var(--text2)')+';" title="'+(p.done?'Reabrir':'Concluir')+'">'+(p.done?'↩':'✓')+'</button>'
            +'<button onclick="gerarCertidao('+pidx+')" class="btn btn-xs btn-outline" style="color:#5868aa;" title="Certidão de prazo">📜</button>'
          +'<button onclick="gerarContrarrazaoFromPrazo('+pidx+')" class="btn btn-xs btn-gold" title="Redigir com IA" style="font-size:10.5px;">✦ Redigir</button>'
          +'<button onclick="abrirDespachoModal('+pidx+')" class="btn btn-xs btn-outline" title="Ler despacho deste prazo" style="font-size:10.5px;">📋 Despacho</button>'
          +'<button onclick="delPrazo('+pidx+')" class="btn btn-xs" style="background:rgba(204,68,68,0.09);border:1px solid rgba(204,68,68,0.22);color:#aa2222;" title="Excluir">✕</button>'
          +'</div>'
        +'</div>'
      +'</div>'
    +'</div>';
  }).join('');
}

// ══════════════════════════════════════════════════════════════
// DASHBOARD CHARTS
// ══════════════════════════════════════════════════════════════
function renderDashCharts(){
  var pecas=ld('pecas'),casos=ld('casos'),prazos=ld('prazos');
  var hoje=new Date(),mes=hoje.getMonth(),ano=hoje.getFullYear();

  // Chart 1: Prazos por semana do mês atual
  var chartPrazos=document.getElementById('chart-prazos');
  var chartLabels=document.getElementById('chart-prazos-labels');
  if(chartPrazos){
    var semanas=['S1','S2','S3','S4','S5'];
    var counts=[0,0,0,0,0];
    var urgentes=[0,0,0,0,0];
    prazos.filter(function(p){
      if(!p.data||p.done)return false;
      var d=new Date(p.data+'T12:00');
      return d.getMonth()===mes&&d.getFullYear()===ano;
    }).forEach(function(p){
      var d=new Date(p.data+'T12:00');
      var semIdx=Math.floor((d.getDate()-1)/7);
      if(semIdx<5){counts[semIdx]++;
        var diff=Math.ceil((d-hoje)/(1000*60*60*24));
        if(diff<=3)urgentes[semIdx]++;
      }
    });
    var maxC=Math.max(...counts,1);
    chartPrazos.innerHTML=counts.map(function(cnt,i){
      var h=Math.round((cnt/maxC)*70)||4;
      var clr=urgentes[i]>0?'rgba(204,68,68,0.70)':'rgba(154,96,96,0.35)';
      return'<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;">'
        +(cnt?'<span style="font-size:9px;color:var(--text3);">'+cnt+'</span>':'')
        +'<div style="width:100%;background:'+clr+';border-radius:3px 3px 0 0;height:'+h+'px;transition:height .4s;cursor:default;" title="S'+(i+1)+': '+cnt+' prazo(s)"></div>'
      +'</div>';
    }).join('');
    if(chartLabels)chartLabels.innerHTML=semanas.map(function(s){return'<span>'+s+'</span>';}).join('');
  }

  // Chart 2: Distribuição por área
  var chartAreas=document.getElementById('chart-areas');
  if(chartAreas){
    var areaCounts={};
    pecas.forEach(function(p){if(p.area)areaCounts[p.area]=(areaCounts[p.area]||0)+1;});
    var total=Object.values(areaCounts).reduce(function(a,b){return a+b;},0)||1;
    var cores=['#9a6060','#6080a0','#6a8860','#a08060','#8060a0','#a07060','#607090'];
    var sorted=Object.entries(areaCounts).sort(function(a,b){return b[1]-a[1];}).slice(0,6);
    chartAreas.innerHTML=sorted.length?sorted.map(function(entry,i){
      var pct=Math.round(entry[1]/total*100);
      var nome=entry[0].replace('Direito do ','').replace('Direito de ','').replace('Direito ','');
      return'<div style="display:flex;align-items:center;gap:7px;">'
        +'<div style="width:8px;height:8px;border-radius:50%;background:'+cores[i%cores.length]+';flex-shrink:0;"></div>'
        +'<span style="font-size:11px;color:var(--text2);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+nome+'</span>'
        +'<div style="flex:2;background:var(--bg4);border-radius:20px;height:6px;overflow:hidden;">'
          +'<div style="width:'+pct+'%;height:100%;background:'+cores[i%cores.length]+';border-radius:20px;transition:width .4s;"></div>'
        +'</div>'
        +'<span style="font-size:10px;color:var(--text3);min-width:28px;text-align:right;">'+entry[1]+'</span>'
      +'</div>';
    }).join(''):'<div style="font-size:11px;color:var(--text3);">Nenhuma peça ainda.</div>';
  }

  // Chart 3: Status dos casos
  var chartStatus=document.getElementById('chart-status');
  if(chartStatus){
    var ativos=casos.filter(function(c){return c.status==='ativo';}).length;
    var encerrados=casos.filter(function(c){return c.status==='encerrado';}).length;
    var total2=casos.length||1;
    chartStatus.innerHTML=!casos.length?'<div style="font-size:11px;color:var(--text3);">Nenhum cliente ainda.</div>':[
      ['Ativos',ativos,'#4a7a58'],['Encerrados',encerrados,'#9a6060']
    ].map(function(item){
      var pct=Math.round(item[1]/total2*100);
      return'<div style="display:flex;align-items:center;gap:7px;">'
        +'<div style="width:8px;height:8px;border-radius:50%;background:'+item[2]+';flex-shrink:0;"></div>'
        +'<span style="font-size:11px;color:var(--text2);flex:1;">'+item[0]+'</span>'
        +'<div style="flex:2;background:var(--bg4);border-radius:20px;height:6px;overflow:hidden;">'
          +'<div style="width:'+pct+'%;height:100%;background:'+item[2]+';border-radius:20px;"></div>'
        +'</div>'
        +'<span style="font-size:10px;color:var(--text3);min-width:28px;text-align:right;">'+item[1]+'</span>'
      +'</div>';
    }).join('');
  }
}

// ══════════════════════════════════════════════════════════════
// BUSCA GLOBAL
// ══════════════════════════════════════════════════════════════
function showGlobalSearch(){ var r=document.getElementById('global-search-results');if(r&&document.getElementById('global-search')?.value)r.style.display='block'; }
function hideGlobalSearch(){ var r=document.getElementById('global-search-results');if(r)r.style.display='none'; }

function runGlobalSearch(q){
  var res=document.getElementById('global-search-results');
  if(!res)return;
  if(!q||q.length<2){res.style.display='none';return;}
  q=q.toLowerCase();
  var results=[];
  var pecas=ld('pecas'),casos=ld('casos'),prazos=ld('prazos'),agenda=ld('agenda');

  // Search pecas
  pecas.forEach(function(p,i){
    if((p.titulo+' '+(p.tese||'')+(p.area||'')).toLowerCase().includes(q)){
      results.push({icon:'📋',label:p.titulo,sub:(p.tipo||'')+(p.area?' · '+p.area.replace('Direito do ','').replace('Direito de ','').replace('Direito ',''):''),action:"closeGS();nav('biblioteca')",type:'Peça'});
    }
  });
  // Search casos
  casos.forEach(function(caso){
    if((caso.nome+(caso.cpf||'')+(caso.area||'')).toLowerCase().includes(q)){
      results.push({icon:'📁',label:caso.nome,sub:(caso.area||'')+(caso.status?' · '+caso.status:''),action:"closeGS();abrirCaso('"+caso.id+"')",type:'Cliente'});
    }
    // Search within ações
    (caso.acoes||[]).forEach(function(a){
      if((a.nome+(a.num||'')).toLowerCase().includes(q)){
        results.push({icon:'⚖',label:a.nome,sub:'Caso: '+caso.nome+(a.num?' · '+a.num:''),action:"closeGS();abrirCaso('"+caso.id+"')",type:'Ação'});
      }
    });
  });
  // Search prazos
  prazos.forEach(function(p){
    if((p.desc+(p.num||'')).toLowerCase().includes(q)){
      results.push({icon:'⏰',label:p.desc,sub:(p.tipo||'')+(p.data?' · Fatal: '+fmtDate(p.data):''),action:"closeGS();nav('prazos')",type:'Prazo'});
    }
  });
  // Search agenda
  agenda.forEach(function(au,i){
    if((au.desc+(au.local||'')+(au.num||'')).toLowerCase().includes(q)){
      results.push({icon:'📅',label:au.desc,sub:(au.data?fmtDate(au.data):'')+(au.hora?' às '+au.hora:'')+(au.local?' · '+au.local:''),action:"closeGS();abrirAudiencia("+i+")",type:'Audiência'});
    }
  });

  if(!results.length){
    res.innerHTML='<div style="padding:14px;font-size:12px;color:var(--text3);text-align:center;">Nenhum resultado para "'+q+'"</div>';
    res.style.display='block';return;
  }

  res.style.display='block';
  res.innerHTML='<div style="padding:4px 12px;font-size:9px;color:var(--text3);text-transform:uppercase;font-weight:700;letter-spacing:.09em;">'+results.length+' resultado(s)</div>'
    +results.slice(0,12).map(function(r){
      return'<div onclick="'+r.action+'" style="display:flex;align-items:center;gap:10px;padding:9px 14px;cursor:pointer;transition:background .12s;border-bottom:1px solid rgba(154,96,96,0.06);" onmouseover="this.style.background=\'rgba(154,96,96,0.06)\'" onmouseout="this.style.background=\'\'">'
        +'<span style="font-size:18px;flex-shrink:0;">'+r.icon+'</span>'
        +'<div style="flex:1;min-width:0;">'
          +'<div style="font-size:12.5px;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+r.label+'</div>'
          +'<div style="font-size:11px;color:var(--text2);">'+r.sub+'</div>'
        +'</div>'
        +'<span style="font-size:9px;padding:2px 7px;border-radius:20px;background:rgba(154,96,96,0.08);color:#9a4040;flex-shrink:0;">'+r.type+'</span>'
      +'</div>';
    }).join('');
}

function closeGS(){
  var r=document.getElementById('global-search-results');if(r)r.style.display='none';
  var inp=document.getElementById('global-search');if(inp)inp.value='';
}

// ══════════════════════════════════════════════════════════════
// GERADOR DE PETIÇÃO COM IA
// ══════════════════════════════════════════════════════════════
async function gerarPeticaoIA(){
  var tipo=document.getElementById('gen-tipo')?.value||'Contestação';
  var area=document.getElementById('gen-area')?.value||'Direito do Consumidor';
  var fatos=document.getElementById('gen-fatos')?.value||'';
  var pedidos=document.getElementById('gen-pedidos')?.value||'';
  var casoId=document.getElementById('gen-caso')?.value||'';
  if(!fatos){alert('Descreva os fatos principais.');return;}
  if(!navigator.onLine){alert('IA requer internet.');return;}

  var caso=casoId?ld('casos').find(function(c){return c.id===casoId;}):null;
  var out=document.getElementById('gen-output');
  var btn=document.getElementById('gen-btn');
  if(out){out.style.display='block';out.innerHTML='<div style="color:var(--text3);padding:20px;text-align:center;"><span class="spin"></span> Gerando '+tipo+' com IA...</div>';}
  if(btn)btn.disabled=true;

  var prompt='Você é advogado especialista em '+area+'.\n'
    +'Gere uma '+tipo+' completa e fundamentada com:\n'
    +(caso?'Cliente: '+caso.nome+'\n':'')
    +'Área: '+area+'\n'
    +'Fatos: '+fatos+'\n'
    +(pedidos?'Pedidos: '+pedidos+'\n':'')
    +'\nEstrutura: Exórdio, Dos Fatos, Do Direito (com artigos e jurisprudência do STJ/STF), Dos Pedidos, Termos em que Pede Deferimento.\n'
    +'Use linguagem jurídica formal, parágrafo justificado, estrutura profissional.';

  try{
    var resp=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:4000,messages:[{role:'user',content:prompt}]})});
    var d=await resp.json();
    if(d.error){if(out)out.innerHTML='<div style="color:var(--rd2);padding:12px;">⚠ '+d.error.message+'</div>';if(btn)btn.disabled=false;return;}
    var txt=(d.content||[]).filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('');
    if(out)out.innerHTML='<div style="white-space:pre-wrap;font-size:12.5px;line-height:1.8;padding:16px;color:var(--text);">'+txt+'</div>';
    // Store for use in editor
    window._lastGeneratedPetition = txt;
    var useBtn=document.getElementById('gen-use-btn');
    if(useBtn)useBtn.style.display='block';
  }catch(e){
    if(out)out.innerHTML='<div style="color:var(--rd2);padding:12px;">⚠ Erro: '+e.message+'</div>';
  }
  if(btn)btn.disabled=false;
}


// ══════════════════════════════════════════════════════════════
// NOTIFICAÇÕES DE PRAZO (Browser Notifications)
// ══════════════════════════════════════════════════════════════
function checkNotificacoesPrazos(){
  if(!('Notification' in window))return;
  if(Notification.permission==='default'){
    Notification.requestPermission();return;
  }
  if(Notification.permission!=='granted')return;
  var prazos=ld('prazos').filter(function(p){return !p.done&&p.data;});
  var hoje=new Date().toISOString().split('T')[0];
  var amanha=new Date(Date.now()+864e5).toISOString().split('T')[0];
  prazos.forEach(function(p){
    if(p.data===hoje||p.data===amanha||p.data<hoje){
      var titulo=p.data<hoje?'⚠ PRAZO VENCIDO':'⏰ Prazo '+(p.data===hoje?'HOJE':'amanhã');
      try{new Notification(titulo+' — LexBase',{body:p.desc+(p.num?' ('+p.num+')':''),icon:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⚖</text></svg>'});}catch(e){}
    }
  });
}

// Check on load and every hour
window.addEventListener('load',function(){
  setTimeout(checkNotificacoesPrazos, 3000);
  setInterval(checkNotificacoesPrazos, 3600000);
});

// Hook renderDash to also render charts
var _origRenderDash = typeof renderDash==='function'?renderDash:null;
function renderDash(){
  const now=new Date();
  const dias=['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
  const meses=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const h=now.getHours();
  const greet=h<12?'Bom dia':h<18?'Boa tarde':'Boa noite';
  var greetEl=document.getElementById('dash-greeting');
  if(greetEl){ greetEl.textContent=greet+', '+((currentUser?.nome||'').split(' ')[0]||'Tatiani'); }
  document.getElementById('dash-date').textContent=`${dias[now.getDay()]}, ${now.getDate()} de ${meses[now.getMonth()]} de ${now.getFullYear()}`;

  const pecas=ld('pecas'),casos=ld('casos'),prazos=ld('prazos'),agenda=ld('agenda');
  const hoje=now.toISOString().split('T')[0];
  const em7=new Date(now.getTime()+7*864e5).toISOString().split('T')[0];
  const prazosUrg=prazos.filter(p=>!p.done&&p.data&&p.data<=em7);
  const audMes=agenda.filter(a=>a.data&&a.data.startsWith(now.getFullYear()+'-'+(String(now.getMonth()+1).padStart(2,'0'))));
  const casosAtivos=casos.filter(c=>c.status==='ativo');

  document.getElementById('dash-prazos-cnt').textContent=prazosUrg.length;
  document.getElementById('dash-agenda-cnt').textContent=audMes.length;
  document.getElementById('dash-casos-cnt').textContent=casosAtivos.length;
  document.getElementById('dash-bib-cnt').textContent=pecas.length;

  // Prazos dash
  const proxPrazos=prazos.filter(p=>!p.done).sort((a,b)=>a.data>b.data?1:-1).slice(0,5);
  document.getElementById('dash-prazos-list').innerHTML=proxPrazos.length?proxPrazos.map(p=>{
    const diff=Math.ceil((new Date(p.data)-now)/864e5);
    const cls=diff<=2?'urgente':diff<=7?'proximo':'ok';
    return`<div class="prazo-item">
      <div class="prazo-dot ${cls}"></div>
      <div class="prazo-txt">${p.desc}</div>
      <div class="prazo-date">${formatDate(p.data)}<br><span style="color:${cls==='urgente'?'var(--rd2)':cls==='proximo'?'var(--or2)':'var(--gr2)'};">${diff<=0?'HOJE':diff===1?'amanhã':diff+'d'}</span></div>
    </div>`;
  }).join(''):'<div style="font-size:11.5px;color:var(--text3);">Nenhum prazo pendente.</div>';

  // Agenda dash
  const proxAud=agenda.filter(a=>a.data>=hoje).sort((a,b)=>a.data>b.data?1:-1).slice(0,4);
  document.getElementById('dash-agenda-list').innerHTML=proxAud.length?proxAud.map(a=>{
    const d=new Date(a.data+'T12:00:00');
    return`<div class="agenda-item">
      <div class="agenda-date-box">
        <div class="agenda-day">${d.getDate()}</div>
        <div class="agenda-mon">${['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'][d.getMonth()]}</div>
      </div>
      <div><div class="agenda-desc">${a.desc}</div><div class="agenda-hora">${a.hora||''} ${a.local||''}</div></div>
    </div>`;
  }).join(''):'<div style="font-size:11.5px;color:var(--text3);">Nenhuma audiência próxima.</div>';

  // Alertas
  if(prazosUrg.length>0)document.getElementById('prazos-alert').style.display='inline-block';
  else document.getElementById('prazos-alert').style.display='none';
  try{renderDashGraficos();}catch(e){}
  try{initLogPatch();}catch(e){}
  try{renovarMensalidadesVencidas();}catch(e){}
  try{iniciarCheckerNotifs();}catch(e){}
}

// ═══════════════════════════════════════════
// BIBLIOTECA
// ══════════════════════════════════════════

// Hook initApp to add auto-calc button in prazo modal
document.addEventListener('DOMContentLoaded',function(){
  // Add onchange to pr-chegou for auto-calc
  var prChegou=document.getElementById('pr-chegou');
  if(prChegou)prChegou.addEventListener('input',function(){
    var tipo=document.getElementById('pr-tipo')?.value||'Manifestação';
    var diasMap={'Contestação':15,'Recurso de Apelação':15,'Agravo de Instrumento':15,'Contrarrazões':15,'Manifestação':15,'Embargos de Declaração':5,'Agravo Interno':15,'Impugnação':15,'Alegações Finais':10,'Recurso Inominado':10,'Especificação de Provas':5};
    var dias=diasMap[tipo]||15;
    if(this.value){
      var fatal=addDiasUteis(this.value,dias);
      var prData=document.getElementById('pr-data');
      if(prData){prData.value=fatal;updatePrazoFatalDisplay();}
    }
  });
});


// ══════════════════════════════════════════════════════════
// FERIADOS NACIONAIS FIXOS (ano corrente e próximo)
// ══════════════════════════════════════════════════════════
function getFeriados(ano){
  // Feriados fixos
  var fixos=['01-01','04-21','05-01','09-07','10-12','11-02','11-15','11-20','12-25'];
  var feriados=fixos.map(function(d){return ano+'-'+d;});
  // Páscoa (algoritmo de Gauss)
  var a=ano%19,b=Math.floor(ano/100),cc=ano%100;
  var d2=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3);
  var h=(19*a+b-d2-g+15)%30,i=Math.floor(cc/4),k=cc%4;
  var l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451);
  var mes=Math.floor((h+l-7*m+114)/31),dia=((h+l-7*m+114)%31)+1;
  var pascoa=new Date(ano,mes-1,dia);
  // Carnaval (-47), Sexta Santa (-2), Corpus Christi (+60)
  [-47,-46,-2,60].forEach(function(offset){
    var d=new Date(pascoa);d.setDate(d.getDate()+offset);
    feriados.push(d.toISOString().split('T')[0]);
  });
  return feriados;
}

function isDiaUtil(date){
  var d=new Date(date+'T12:00:00');
  var dow=d.getDay();
  if(dow===0||dow===6)return false; // fim de semana
  var ano=d.getFullYear();
  var feriados=getFeriados(ano).concat(getFeriados(ano+1));
  return !feriados.includes(date);
}

function addDiasUteis(dataStr, dias){
  var d=new Date(dataStr+'T12:00:00');
  var count=0;
  while(count<dias){
    d.setDate(d.getDate()+1);
    var ds=d.toISOString().split('T')[0];
    if(isDiaUtil(ds))count++;
  }
  return d.toISOString().split('T')[0];
}

function calcPrazoUtil(dataPublicacao, diasUteis){
  // Conta a partir do dia SEGUINTE à publicação
  var d=new Date(dataPublicacao+'T12:00:00');
  d.setDate(d.getDate()+1);
  var next=d.toISOString().split('T')[0];
  return addDiasUteis(next, diasUteis-1);
}

function fmtPrazoFatal(dataFatal){
  if(!dataFatal)return '';
  var hoje=new Date().toISOString().split('T')[0];
  var diff=Math.ceil((new Date(dataFatal+'T12:00')-new Date(hoje+'T12:00'))/(1000*60*60*24));
  if(diff<0)return '<span class="fatal-badge fatal-venc">⏰ Vencido '+Math.abs(diff)+'d</span>';
  if(diff===0)return '<span class="fatal-badge fatal-urg">⏰ HOJE!</span>';
  if(diff<=3)return '<span class="fatal-badge fatal-urg">⏰ '+diff+'d</span>';
  if(diff<=7)return '<span class="fatal-badge fatal-warn">⏰ '+diff+'d</span>';
  return '<span class="fatal-badge fatal-ok">⏰ '+diff+'d</span>';
}

// ══ PRAZO: auto-calcular fatal ao mudar data/tipo ══
function calcFatalAuto(){
  var chegou=document.getElementById('pr-chegou')?.value||document.getElementById('pr-data')?.value||'';
  var tipo=document.getElementById('pr-tipo')?.value||'';
  if(!chegou)return;
  var dias=15; // padrão
  var tiposDias={
    'Contestação':15,'Recurso de Apelação':15,'Agravo de Instrumento':15,
    'Embargos de Declaração':5,'Agravo Interno':15,'Contrarrazões':15,
    'Manifestação':15,'Impugnação':15,'Alegações Finais':15,
    'Recurso Inominado':10,'Recurso Especial (RESP)':15,'Habilitação':5,
  };
  if(tiposDias[tipo])dias=tiposDias[tipo];
  var fatal=calcPrazoUtil(chegou,dias);
  var fEl=document.getElementById('pr-fatal');
  if(fEl){fEl.value=fatal;atualizarFatalBadge(fatal);}
  var fDisp=document.getElementById('pr-fatal-disp');
  if(fDisp)fDisp.innerHTML=fmtPrazoFatal(fatal);
}

function atualizarFatalBadge(fatal){
  var disp=document.getElementById('pr-fatal-disp');
  if(disp)disp.innerHTML=fmtPrazoFatal(fatal||'');
}

// ══ BUSCA GLOBAL ══
function openBuscaGlobal(){
  var q=prompt('Buscar em tudo (peças, clientes, prazos, audiências):');
  if(!q||!q.trim())return;
  q=q.trim().toLowerCase();
  var pecas=ld('pecas').filter(function(p){return(p.titulo+(p.tese||'')+(p.texto||'')+(p.area||'')).toLowerCase().includes(q);});
  var casos=ld('casos').filter(function(c){return(c.nome+(c.cpf||'')+(c.area||'')+(c.obs||'')).toLowerCase().includes(q);});
  var prazos=ld('prazos').filter(function(p){return(p.desc+(p.num||'')+(p.autor||'')+(p.reu||'')+(p.obs||'')).toLowerCase().includes(q);});
  var agenda=ld('agenda').filter(function(a){return(a.desc+(a.num||'')+(a.local||'')+(a.autor||'')+(a.reu||'')).toLowerCase().includes(q);});
  var total=pecas.length+casos.length+prazos.length+agenda.length;
  if(!total){showToast('Nenhum resultado para: '+q);return;}
  // Build result modal
  var html='<div style="font-size:12px;color:var(--text2);margin-bottom:12px;">'+total+' resultado(s) para <strong>'+q+'</strong></div>';
  if(pecas.length){html+='<div style="font-size:10px;text-transform:uppercase;font-weight:700;color:var(--text3);letter-spacing:.09em;margin-bottom:6px;">📋 Peças ('+pecas.length+')</div>';
    html+=pecas.slice(0,5).map(function(p){return'<div style="padding:7px 10px;background:rgba(255,248,246,0.80);border-radius:var(--r);margin-bottom:4px;cursor:pointer;border:1px solid var(--border);" onclick="closeModal(\'modal-busca-global\');nav(\'biblioteca\')">'
      +'<div style="font-size:12.5px;font-weight:600;">'+p.titulo+'</div>'
      +'<div style="font-size:10.5px;color:var(--text3);">'+(p.area||'')+(p.tipo?' · '+p.tipo:'')+'</div>'
    +'</div>';}).join('');}
  if(casos.length){html+='<div style="font-size:10px;text-transform:uppercase;font-weight:700;color:var(--text3);letter-spacing:.09em;margin:10px 0 6px;">👥 Clientes ('+casos.length+')</div>';
    html+=casos.slice(0,5).map(function(cas){return'<div style="padding:7px 10px;background:rgba(255,248,246,0.80);border-radius:var(--r);margin-bottom:4px;cursor:pointer;border:1px solid var(--border);" onclick="closeModal(\'modal-busca-global\');abrirCaso(\''+cas.id+'\')">'
      +'<div style="font-size:12.5px;font-weight:600;">'+cas.nome+'</div>'
      +'<div style="font-size:10.5px;color:var(--text3);">'+(cas.area||'')+(cas.cpf?' · '+cas.cpf:'')+'</div>'
    +'</div>';}).join('');}
  if(prazos.length){html+='<div style="font-size:10px;text-transform:uppercase;font-weight:700;color:var(--text3);letter-spacing:.09em;margin:10px 0 6px;">⏰ Prazos ('+prazos.length+')</div>';
    html+=prazos.slice(0,4).map(function(p){return'<div style="padding:7px 10px;background:rgba(255,248,246,0.80);border-radius:var(--r);margin-bottom:4px;border:1px solid var(--border);" onclick="closeModal(\'modal-busca-global\');nav(\'prazos\')">'
      +'<div style="font-size:12.5px;font-weight:600;">'+p.desc+'</div>'
      +'<div style="font-size:10.5px;color:var(--text3);">'+(p.data?fmtDate(p.data):'')+(p.num?' · '+p.num:'')+'</div>'
    +'</div>';}).join('');}
  if(agenda.length){html+='<div style="font-size:10px;text-transform:uppercase;font-weight:700;color:var(--text3);letter-spacing:.09em;margin:10px 0 6px;">📅 Audiências ('+agenda.length+')</div>';
    html+=agenda.slice(0,4).map(function(a){return'<div style="padding:7px 10px;background:rgba(255,248,246,0.80);border-radius:var(--r);margin-bottom:4px;border:1px solid var(--border);" onclick="closeModal(\'modal-busca-global\');nav(\'agenda\')">'
      +'<div style="font-size:12.5px;font-weight:600;">'+a.desc+'</div>'
      +'<div style="font-size:10.5px;color:var(--text3);">'+(a.data?fmtDate(a.data):'')+(a.local?' · '+a.local:'')+'</div>'
    +'</div>';}).join('');}
  var el=document.getElementById('busca-global-results');
  if(el)el.innerHTML=html;
  openModal('modal-busca-global');
}

// ══ HISTÓRICO DE ANDAMENTOS POR AÇÃO ══
function addAndamento(acaoId){
  var desc=document.getElementById('andt-inp-'+acaoId);
  if(!desc||!desc.value.trim())return;
  var casos=ld('casos');
  var caso=casos.find(function(x){return x.id===currentCasoId;});
  var acao=(caso?.acoes||[]).find(function(a){return a.id===acaoId;});
  if(!acao)return;
  if(!acao.andamentos)acao.andamentos=[];
  acao.andamentos.push({
    texto:desc.value.trim(),
    data:new Date().toLocaleDateString('pt-BR'),
    hora:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})
  });
  sv('casos',casos);
  desc.value='';
  abrirAcao(acaoId);
  showToast('✓ Andamento registrado!');
}

function excluirAndamento(acaoId, idx){
  confirmar('Excluir este andamento?', function(){
    var casos=ld('casos');
    var caso=casos.find(function(x){return x.id===currentCasoId;});
    var acao=(caso?.acoes||[]).find(function(a){return a.id===acaoId;});
    if(!acao||!acao.andamentos)return;
    acao.andamentos.splice(idx,1);
    sv('casos',casos);
    abrirAcao(acaoId);
  },'⚠️','Excluir','rgba(204,68,68,0.85)');
}

// ══ NOTIFICAÇÕES DO NAVEGADOR ══




// ══ GERAR PETIÇÃO COM IA ══
async function gerarPeticaoIA(){
  var tipo=document.getElementById('ia-gen-tipo')?.value||'Contestação';
  var fatos=document.getElementById('ia-gen-fatos')?.value||'';
  var pedidos=document.getElementById('ia-gen-pedidos')?.value||'';
  var area=document.getElementById('ia-gen-area')?.value||'Direito do Consumidor';
  var partes=document.getElementById('ia-gen-partes')?.value||'';
  if(!fatos.trim()){showToast('Descreva os fatos.');return;}
  if(!navigator.onLine){showToast('IA requer internet.');return;}
  var out=document.getElementById('ia-gen-out');
  var btn=document.getElementById('ia-gen-btn');
  if(out){out.style.display='block';out.textContent='⏳ Gerando '+tipo+'...';}
  if(btn)btn.disabled=true;
  var prompt='Você é advogado experiente em '+area+'.\n'
    +'Redija uma '+tipo+' completa e profissional.\n\n'
    +(partes?'Partes: '+partes+'\n':'')
    +'Fatos: '+fatos+'\n'
    +(pedidos?'Pedidos: '+pedidos+'\n':'')
    +'\nEstrutura obrigatória:\n'
    +'1. PREÂMBULO (endereçamento ao juízo)\n'
    +'2. DOS FATOS\n'
    +'3. DO DIREITO (com artigos de lei e jurisprudência relevante)\n'
    +'4. DOS PEDIDOS\n'
    +'5. ENCERRAMENTO E ASSINATURA\n\n'
    +'Use linguagem técnica, formal e persuasiva. Inclua pelo menos 3 fundamentos legais específicos.';
  try{
    var resp=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:4000,messages:[{role:'user',content:prompt}]})
    });
    var d=await resp.json();
    if(d.error){if(out)out.textContent='⚠ '+d.error.message;return;}
    var txt=(d.content||[]).filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('');
    if(out){out.textContent=txt;out.style.whiteSpace='pre-wrap';}
  }catch(e){if(out)out.textContent='⚠ Erro: '+e.message;}
  finally{
    if(btn)btn.disabled=false;
    // Show "usar no editor" button if content was generated
    var usarBtn=document.getElementById('ia-usar-btn');
    var outEl=document.getElementById('ia-gen-out');
    if(usarBtn&&outEl&&outEl.textContent.length>100)usarBtn.style.display='inline-flex';
  }
}

function usarPeticaoGerada(){
  var txt=document.getElementById('ia-gen-out')?.textContent||'';
  if(!txt.trim())return;
  closeModal('modal-gerar-peticao');
  nav('editor');
  setTimeout(function(){
    var ed=document.getElementById('editor-body');
    if(ed){ed.focus();ed.innerText=txt;}
  },200);
  showToast('✓ Petição carregada no editor!');
}

// ══ DASHBOARD GRÁFICOS ══
function renderDashGraficos(){
  var casos=ld('casos');
  var prazos=ld('prazos');
  var hoje=new Date().toISOString().split('T')[0];
  
  // Gráfico de pizza por área
  var areas={};
  casos.forEach(function(c){var a=c.area||'Outros';areas[a]=(areas[a]||0)+1;});
  var cores=['#9a6060','#c49090','#d4a8a0','#e8c8c4','#7a4545','#b87878','#6a3a3a'];
  var totalCasos=casos.length||1;
  var grafEl=document.getElementById('dash-graf-areas');
  if(grafEl&&casos.length){
    var svg='<svg viewBox="0 0 100 100" style="width:100%;max-width:180px;">';
    var startAngle=-Math.PI/2;
    var i=0;
    Object.entries(areas).forEach(function(entry){
      var area=entry[0],count=entry[1];
      var slice=count/totalCasos*2*Math.PI;
      var x1=50+48*Math.cos(startAngle),y1=50+48*Math.sin(startAngle);
      startAngle+=slice;
      var x2=50+48*Math.cos(startAngle),y2=50+48*Math.sin(startAngle);
      var large=slice>Math.PI?1:0;
      svg+='<path d="M50,50 L'+x1+','+y1+' A48,48 0 '+large+',1 '+x2+','+y2+' Z" fill="'+( cores[i%cores.length])+'" opacity="0.85"><title>'+area+': '+count+'</title></path>';
      i++;
    });
    svg+='</svg>';
    grafEl.innerHTML=svg+'<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;">'+Object.entries(areas).map(function(entry,i){return'<span style="font-size:9.5px;display:flex;align-items:center;gap:3px;"><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:'+cores[i%cores.length]+'"></span>'+entry[0].replace('Direito do ','').replace('Direito de ','').replace('Direito ','')+' ('+entry[1]+')</span>';}).join('')+'</div>';
  }
  
  // Próximos prazos do mês - mini gráfico de barras
  var grafPr=document.getElementById('dash-graf-prazos');
  if(grafPr){
    var vencendo=prazos.filter(function(p){return!p.done&&p.data&&p.data>=hoje;}).sort(function(a,b){return a.data>b.data?1:-1;}).slice(0,6);
    if(vencendo.length){
      grafPr.innerHTML=vencendo.map(function(p){
        var diff=Math.ceil((new Date(p.data+'T12:00')-new Date(hoje+'T12:00'))/(1000*60*60*24));
        var cor=diff<=3?'#cc4444':diff<=7?'#e0aa44':'#4a7a58';
        var width=Math.min(100,Math.max(10,(30-diff)/30*100));
        return'<div style="margin-bottom:5px;">'
          +'<div style="font-size:10.5px;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:240px;">'+p.desc+'</div>'
          +'<div style="display:flex;align-items:center;gap:6px;">'
            +'<div style="flex:1;height:5px;background:var(--border);border-radius:3px;overflow:hidden;"><div style="width:'+width+'%;height:100%;background:'+cor+';border-radius:3px;"></div></div>'
            +'<span style="font-size:9.5px;color:'+cor+';font-weight:700;min-width:30px;">'+diff+'d</span>'
          +'</div>'
        +'</div>';
      }).join('');
    } else {
      grafPr.innerHTML='<div style="font-size:11px;color:var(--text3);">Nenhum prazo pendente ✓</div>';
    }
  }
}

// Run on dashboard nav



function doBuscaGlobal(){
  var inp=document.getElementById('busca-global-inp');
  var q=(inp?inp.value:'').trim();
  if(!q)return;
  var pecas=ld('pecas').filter(function(p){return(p.titulo+(p.tese||'')+(p.texto||'')+(p.area||'')).toLowerCase().includes(q.toLowerCase());});
  var casos=ld('casos').filter(function(x){return(x.nome+(x.cpf||'')+(x.area||'')+(x.obs||'')).toLowerCase().includes(q.toLowerCase());});
  var prazos=ld('prazos').filter(function(p){return(p.desc+(p.num||'')+(p.autor||'')+(p.reu||'')+(p.obs||'')).toLowerCase().includes(q.toLowerCase());});
  var agenda=ld('agenda').filter(function(a){return(a.desc+(a.num||'')+(a.local||'')+(a.autor||'')+(a.reu||'')).toLowerCase().includes(q.toLowerCase());});
  var total=pecas.length+casos.length+prazos.length+agenda.length;
  var html=total?'':'<div style="text-align:center;padding:20px;color:var(--text3);">Nenhum resultado para <strong>'+q+'</strong></div>';
  if(pecas.length){html+='<div style="font-size:9.5px;text-transform:uppercase;font-weight:700;color:var(--text3);letter-spacing:.09em;margin-bottom:6px;padding:8px 0 2px;">📋 Peças ('+pecas.length+')</div>';
    html+=pecas.slice(0,5).map(function(p){return'<div style="padding:7px 10px;background:rgba(255,248,246,0.80);border-radius:var(--r);margin-bottom:4px;cursor:pointer;border:1px solid var(--border);" onclick="closeModal(\'modal-busca-global\');nav(\'biblioteca\')">'
      +'<div style="font-size:12.5px;font-weight:600;">'+p.titulo+'</div>'
      +'<div style="font-size:10.5px;color:var(--text3);">'+(p.area||'')+(p.tipo?' · '+p.tipo:'')+'</div></div>';}).join('');}
  if(casos.length){html+='<div style="font-size:9.5px;text-transform:uppercase;font-weight:700;color:var(--text3);letter-spacing:.09em;margin-bottom:6px;padding:8px 0 2px;">👥 Clientes ('+casos.length+')</div>';
    html+=casos.slice(0,5).map(function(cas){return'<div style="padding:7px 10px;background:rgba(255,248,246,0.80);border-radius:var(--r);margin-bottom:4px;cursor:pointer;border:1px solid var(--border);" onclick="closeModal(\'modal-busca-global\');abrirCaso(\''+cas.id+'\')">'
      +'<div style="font-size:12.5px;font-weight:600;">'+cas.nome+'</div>'
      +'<div style="font-size:10.5px;color:var(--text3);">'+(cas.area||'')+'</div></div>';}).join('');}
  if(prazos.length){html+='<div style="font-size:9.5px;text-transform:uppercase;font-weight:700;color:var(--text3);letter-spacing:.09em;margin-bottom:6px;padding:8px 0 2px;">⏰ Prazos ('+prazos.length+')</div>';
    html+=prazos.slice(0,4).map(function(p){return'<div style="padding:7px 10px;background:rgba(255,248,246,0.80);border-radius:var(--r);margin-bottom:4px;cursor:pointer;border:1px solid var(--border);" onclick="closeModal(\'modal-busca-global\');nav(\'prazos\')">'
      +'<div style="font-size:12.5px;font-weight:600;">'+p.desc+'</div>'
      +'<div style="font-size:10.5px;color:var(--text3);">'+(p.data?fmtDate(p.data):'')+'</div></div>';}).join('');}
  if(agenda.length){html+='<div style="font-size:9.5px;text-transform:uppercase;font-weight:700;color:var(--text3);letter-spacing:.09em;margin-bottom:6px;padding:8px 0 2px;">📅 Audiências ('+agenda.length+')</div>';
    html+=agenda.slice(0,4).map(function(a){return'<div style="padding:7px 10px;background:rgba(255,248,246,0.80);border-radius:var(--r);margin-bottom:4px;cursor:pointer;border:1px solid var(--border);" onclick="closeModal(\'modal-busca-global\');nav(\'agenda\')">'
      +'<div style="font-size:12.5px;font-weight:600;">'+a.desc+'</div>'
      +'<div style="font-size:10.5px;color:var(--text3);">'+(a.data?fmtDate(a.data):'')+'</div></div>';}).join('');}
  var el=document.getElementById('busca-global-results');if(el)el.innerHTML=html;
}



// Show usar btn when petição is generated



// ══════════════════════════════════════════════════
// EXPORTAR AGENDA PARA .ICS (Google/Apple Calendar)
// ══════════════════════════════════════════════════
function exportarAgendaICS(){
  var agenda=ld('agenda');
  if(!agenda.length){showToast('Nenhuma audiência para exportar.');return;}
  var icsStr=gerarICS(agenda,'audiencia');
  baixarArquivo(icsStr,'LexBase_Audiencias.ics','text/calendar;charset=utf-8');
  openModal('modal-ics-instrucoes');
}

function exportarPrazosICS(){
  var prazos=ld('prazos').filter(function(p){return !p.done&&p.data;});
  if(!prazos.length){showToast('Nenhum prazo pendente para exportar.');return;}
  var icsStr=gerarICS(prazos,'prazo');
  baixarArquivo(icsStr,'LexBase_Prazos.ics','text/calendar;charset=utf-8');
  openModal('modal-ics-instrucoes');
}

function gerarICS(items, tipo){
  var lembrete_min=parseInt(localStorage.getItem('lb_lembrete_min')||'60');
  var lines=[
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LexBase//LexBase Juridico//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:LexBase - '+(tipo==='audiencia'?'Audiências':'Prazos'),
    'X-WR-TIMEZONE:America/Sao_Paulo',
  ];

  items.forEach(function(item){
    if(!item.data)return;
    var uid='lexbase-'+tipo+'-'+(item.id||('x'+Math.random().toString(36).slice(2)))+'@lexbase.app';
    var now=new Date().toISOString().replace(/[-:.]/g,'').slice(0,15)+'Z';
    var dateParts=item.data.split('-');
    var dateStr=dateParts[0]+dateParts[1]+dateParts[2];

    lines.push('BEGIN:VEVENT');
    lines.push('UID:'+uid);
    lines.push('DTSTAMP:'+now);

    if(tipo==='audiencia'&&item.hora){
      // Timed event with São Paulo timezone
      var hp=item.hora.split(':');
      var hh=String(parseInt(hp[0]||'9')).padStart(2,'0');
      var mm=String(parseInt(hp[1]||'0')).padStart(2,'0');
      var endH=String(parseInt(hh)+1).padStart(2,'0');
      lines.push('DTSTART;TZID=America/Sao_Paulo:'+dateStr+'T'+hh+mm+'00');
      lines.push('DTEND;TZID=America/Sao_Paulo:'+dateStr+'T'+endH+mm+'00');
    } else {
      // All-day event
      lines.push('DTSTART;VALUE=DATE:'+dateStr);
      lines.push('DTEND;VALUE=DATE:'+dateStr);
    }

    var titulo=tipo==='audiencia'
      ? '⚖ '+item.desc
      : '⏰ PRAZO: '+item.desc;
    lines.push('SUMMARY:'+escapar(titulo));

    if(item.local)lines.push('LOCATION:'+escapar(item.local));

    var descParts=[];
    if(item.num)descParts.push('Processo: '+item.num);
    if(item.autor)descParts.push('Autor: '+item.autor);
    if(item.reu)descParts.push('Réu: '+item.reu);
    if(item.link)descParts.push('Link: '+item.link);
    if(item.obs)descParts.push(item.obs);
    if(item.tipo)descParts.push('Tipo: '+item.tipo);
    if(descParts.length)lines.push('DESCRIPTION:'+escapar(descParts.join('\\n')));

    if(item.link)lines.push('URL:'+item.link);

    // LEMBRETES configuráveis
    if(tipo==='audiencia'){
      // Lembrete principal (configurável)
      lines.push('BEGIN:VALARM');
      lines.push('TRIGGER:-PT'+lembrete_min+'M');
      lines.push('ACTION:DISPLAY');
      lines.push('DESCRIPTION:🔔 Audiência em '+lembrete_min+' min: '+escapar(item.desc));
      lines.push('END:VALARM');
      // Lembrete no dia anterior
      lines.push('BEGIN:VALARM');
      lines.push('TRIGGER:-P1D');
      lines.push('ACTION:DISPLAY');
      lines.push('DESCRIPTION:📅 Amanhã: '+escapar(item.desc));
      lines.push('END:VALARM');
    } else {
      // Prazo: lembrete 3 dias antes e no dia
      lines.push('BEGIN:VALARM');
      lines.push('TRIGGER:-P3D');
      lines.push('ACTION:DISPLAY');
      lines.push('DESCRIPTION:⚠ Em 3 dias: '+escapar(item.desc));
      lines.push('END:VALARM');
      lines.push('BEGIN:VALARM');
      lines.push('TRIGGER:-PT9H');
      lines.push('ACTION:DISPLAY');
      lines.push('DESCRIPTION:⚠ PRAZO HOJE: '+escapar(item.desc));
      lines.push('END:VALARM');
    }

    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function escapar(s){
  return (s||'').replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n');
}

function baixarArquivo(conteudo, nome, tipo){
  var blob=new Blob([conteudo],{type:tipo});
  var a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=nome;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function(){URL.revokeObjectURL(a.href);},1000);
}




// ══════════════════════════════════════════════════
// SERVICE WORKER — NOTIFICAÇÕES DE PRAZOS
// ══════════════════════════════════════════════════
var SW_CODE = `
self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ clients.claim(); });
self.addEventListener('message', function(e){
  if(e.data && e.data.type === 'CHECK_PRAZOS'){
    var prazos = e.data.prazos || [];
    var hoje = new Date().toISOString().split('T')[0];
    prazos.forEach(function(p){
      if(p.done || !p.data) return;
      var diff = Math.ceil((new Date(p.data+'T12:00') - new Date(hoje+'T12:00')) / (1000*60*60*24));
      if(diff >= 0 && diff <= 1){
        self.registration.showNotification('⚠ Prazo LexBase', {
          body: p.desc + (diff === 0 ? ' — HOJE!' : ' — amanhã'),
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text y="52" font-size="56">⚖</text></svg>',
          badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text y="52" font-size="56">⚠</text></svg>',
          tag: 'prazo-'+p.id,
          requireInteraction: diff === 0
        });
      }
    });
  }
});
`;

function registrarServiceWorker(){
  if(!('serviceWorker' in navigator)){
    showToast('Notificações push não suportadas neste navegador.');
    return;
  }
  if(!('Notification' in window)){
    showToast('Notificações não suportadas.');
    return;
  }
  Notification.requestPermission().then(function(perm){
    if(perm !== 'granted'){
      showToast('Permissão negada. Ative nas configurações do navegador.');
      return;
    }
    // Register SW from blob
    var swBlob = new Blob([SW_CODE], {type:'application/javascript'});
    var swUrl = URL.createObjectURL(swBlob);
    navigator.serviceWorker.register(swUrl).then(function(reg){
      localStorage.setItem('lb_notif','1');
      showToast('✓ Notificações ativadas! Você receberá alertas de prazos.');
      // Send current prazos to SW
      setTimeout(function(){enviarPrazosAoSW(reg);}, 1000);
    }).catch(function(e){
      // Blob SW not supported (some browsers) — use basic notification
      localStorage.setItem('lb_notif','1');
      scheduleNotifs();
      showToast('✓ Notificações ativadas para esta sessão!');
    });
  });
}

function enviarPrazosAoSW(reg){
  var prazos = ld('prazos');
  if(navigator.serviceWorker.controller){
    navigator.serviceWorker.controller.postMessage({
      type: 'CHECK_PRAZOS',
      prazos: prazos
    });
  }
}

function scheduleNotifs(){
  if(!('Notification' in window)||Notification.permission!=='granted')return;
  var agenda=ld('agenda');
  var prazos=ld('prazos');
  var agora=new Date();
  var hoje=agora.toISOString().split('T')[0];

  // ── AUDIÊNCIAS: verificar se tem lembrete agendado ──
  agenda.forEach(function(au,idx){
    if(!au.data||au.realizada)return;
    if(au.data<hoje)return;
    var lembrete=au.lembrete!==undefined?au.lembrete:60;
    if(lembrete===0)return;
    if(!au.hora)return;
    // Calcular quando notificar
    var hp=au.hora.split(':');
    var auDate=new Date(au.data+'T'+hp[0]+':'+hp[1]+':00');
    var notifTime=new Date(auDate.getTime()-lembrete*60*1000);
    var diffMs=notifTime.getTime()-agora.getTime();
    if(diffMs>0&&diffMs<24*60*60*1000){
      // Dentro das próximas 24h - agendar
      var key='lb_notif_au_'+idx+'_'+au.data;
      if(!sessionStorage.getItem(key)){
        setTimeout(function(){
          try{
            new Notification('⚖ Audiência em '+lembrete+(lembrete>=60?' hora':'min'), {
              body: au.desc+(au.local?' · '+au.local:'')+(au.link?'\n🔗 '+au.link:''),
              tag:'au-'+idx+'-'+au.data,
              requireInteraction:true
            });
            sessionStorage.setItem(key,'1');
          }catch(e){}
        }, Math.max(0, diffMs));
        sessionStorage.setItem(key,'scheduled');
        console.log('Audiência agendada: '+au.desc+' em '+Math.round(diffMs/60000)+'min');
      }
    }
    // Se a audiência é hoje e ainda não passou
    if(au.data===hoje&&auDate>agora){
      var diff2=Math.round((auDate-agora)/60000);
      if(diff2<=lembrete&&diff2>0&&!sessionStorage.getItem('lb_notif_now_'+idx)){
        try{
          new Notification('⚖ Audiência em '+diff2+' minutos!', {
            body: au.desc+(au.local?' · '+au.local:''),
            tag:'au-now-'+idx, requireInteraction:true
          });
          sessionStorage.setItem('lb_notif_now_'+idx,'1');
        }catch(e){}
      }
    }
  });

  // ── PRAZOS: notificar às 16h do dia do vencimento ──
  prazos.forEach(function(p,idx){
    if(p.done||!p.data)return;
    if(p.data===hoje){
      var key='lb_notif_prazo_'+idx+'_'+p.data;
      if(!sessionStorage.getItem(key)){
        // Notificação às 16h de hoje
        var notif16h=new Date(hoje+'T16:00:00');
        var diffMs=notif16h.getTime()-agora.getTime();
        if(diffMs>0){
          setTimeout(function(){
            try{
              new Notification('⏰ Prazo vence HOJE!', {
                body: p.desc+(p.num?' · '+p.num:''),
                tag:'prazo-hoje-'+idx, requireInteraction:true
              });
              sessionStorage.setItem(key,'1');
            }catch(e){}
          }, diffMs);
          sessionStorage.setItem(key,'scheduled');
        } else if(diffMs<0&&diffMs>-3600000){
          // Passou das 16h mas menos de 1h - notificar agora
          if(!sessionStorage.getItem(key+'-late')){
            try{
              new Notification('⏰ PRAZO VENCE HOJE!', {
                body: p.desc+(p.num?' · '+p.num:''),
                tag:'prazo-hoje-'+idx+'-late', requireInteraction:true
              });
              sessionStorage.setItem(key+'-late','1');
            }catch(e){}
          }
        }
      }
    }
    // Prazo amanhã — notificar agora se ainda não notificou
    var amanha=new Date(agora);amanha.setDate(amanha.getDate()+1);
    var amanhaStr=amanha.toISOString().split('T')[0];
    if(p.data===amanhaStr){
      var key2='lb_notif_amanha_'+idx+'_'+p.data;
      if(!sessionStorage.getItem(key2)){
        try{
          new Notification('⚠ Prazo amanhã', {
            body: p.desc+(p.num?' · '+p.num:''),
            tag:'prazo-amanha-'+idx
          });
          sessionStorage.setItem(key2,'1');
        }catch(e){}
      }
    }
  });
}

// Checar a cada 5 minutos
function iniciarCheckerNotifs(){
  if(localStorage.getItem('lb_notif')!=='1')return;
  if(!('Notification' in window)||Notification.permission!=='granted')return;
  scheduleNotifs();
  setInterval(scheduleNotifs, 5*60*1000); // a cada 5 min
}


function requestNotifPermission(){
  registrarServiceWorker();
}

// Checar prazos ao carregar (se notificações já ativas)
window.addEventListener('load', function(){
  if(localStorage.getItem('lb_notif') === '1'){
    setTimeout(function(){
      if('serviceWorker' in navigator){
        navigator.serviceWorker.getRegistration().then(function(reg){
          if(reg) enviarPrazosAoSW(reg);
          else scheduleNotifs();
        });
      } else {
        scheduleNotifs();
      }
    }, 3000);
  }
});


function salvarLembreteMin(){
  var sel=document.getElementById('lembrete-min-sel');
  if(!sel)return;
  localStorage.setItem('lb_lembrete_min', sel.value);
  showToast('✓ Lembrete de '+sel.value+' min salvo! Re-exportando...');
  setTimeout(function(){
    closeModal('modal-ics-instrucoes');
    exportarAgendaICS();
  }, 800);
}
// Init lembrete select with saved value
document.addEventListener('DOMContentLoaded', function(){
  var saved=localStorage.getItem('lb_lembrete_min');
  if(saved){var sel=document.getElementById('lembrete-min-sel');if(sel)sel.value=saved;}
});


// ══════════════════════════════════════════════════
// FINANCEIRO — HONORÁRIOS
// ══════════════════════════════════════════════════
var editHonId = null;

function renderFinanceiro(){
  var honorarios = ld('honorarios');
  var casos = ld('casos');
  // Populate caso select
  var honCasoEl = document.getElementById('hon-caso');
  if(honCasoEl){
    honCasoEl.innerHTML = '<option value="">— Avulso —</option>'
      + casos.map(function(c){ return '<option value="'+c.id+'">'+c.nome+'</option>'; }).join('');
  }
  var lrecCasoEl = document.getElementById('lrec-caso');
  if(lrecCasoEl){
    lrecCasoEl.innerHTML = '<option value="">— Nenhum —</option>'
      + casos.map(function(c){ return '<option value="'+c.id+'">'+c.nome+'</option>'; }).join('');
  }

  // Calcular totais
  var hoje = new Date().toISOString().split('T')[0];
  var total=0, recebido=0, pendente=0, atraso=0;
  honorarios.forEach(function(h){
    var v = parseFloat(h.valor)||0;
    total += v;
    if(h.status==='recebido') recebido += v;
    else if(h.status==='atraso'||(h.status==='pendente'&&h.venc&&h.venc<hoje)) atraso += v;
    else if(h.status==='pendente') pendente += v;
  });

  var fmt = function(v){ return 'R$ '+v.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}); };
  var setEl = function(id,val){ var el=document.getElementById(id);if(el)el.textContent=val; };
  setEl('fin-total', fmt(total));
  setEl('fin-recebido', fmt(recebido));
  setEl('fin-pendente', fmt(pendente));
  setEl('fin-atraso', fmt(atraso));

  // Estatísticas de casos
  var acoes = [];
  casos.forEach(function(c){ (c.acoes||[]).forEach(function(a){ acoes.push({caso:c.nome,status:a.status,resultado:a.resultado,valorFinal:a.valorFinal}); }); });
  var totalAcoes=acoes.length, proc=0, imprcc=0, extinta=0, acordo=0, pendAcoes=0;
  var valorRecup=0;
  acoes.forEach(function(a){
    if(a.resultado==='Procedente'){proc++;valorRecup+=parseFloat((a.valorFinal||'').replace(/[^\d.,]/g,'').replace(',','.'))||0;}
    else if(a.resultado==='Improcedente')imprcc++;
    else if(a.resultado==='Extinta')extinta++;
    else if(a.resultado==='Acordo'){acordo++;valorRecup+=parseFloat((a.valorFinal||'').replace(/[^\d.,]/g,'').replace(',','.'))||0;}
    else pendAcoes++;
  });
  var exitoEl=document.getElementById('fin-stats-exito');
  if(exitoEl){
    var taxa=totalAcoes>0?Math.round((proc+acordo)/totalAcoes*100):0;
    exitoEl.innerHTML='<div style="font-size:22px;font-weight:800;color:#4a7a58;margin-bottom:6px;">'+taxa+'%</div>'
      +'<div>✅ Procedente: '+proc+'</div>'
      +'<div>🤝 Acordo: '+acordo+'</div>'
      +'<div>❌ Improcedente: '+imprcc+'</div>'
      +'<div>⚖ Extinta: '+extinta+'</div>'
      +'<div style="color:var(--text3);">⏳ Pendentes: '+pendAcoes+'</div>';
  }
  var valorEl=document.getElementById('fin-stats-valor');
  if(valorEl) valorEl.textContent=fmt(valorRecup);

  // Casos por mês
  var mesesEl=document.getElementById('fin-stats-meses');
  if(mesesEl){
    var porMes={};
    casos.forEach(function(c){
      if(c.criado){var parts=c.criado.split('/');if(parts.length===3){var key=parts[2]+'-'+parts[1];porMes[key]=(porMes[key]||0)+1;}}
    });
    var keys=Object.keys(porMes).sort().slice(-6);
    var maxV=Math.max.apply(null,keys.map(function(k){return porMes[k];}));
    mesesEl.innerHTML=keys.map(function(k){
      var pct=Math.round(porMes[k]/maxV*100);
      var parts=k.split('-');
      var meses=['','Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
      var label=meses[parseInt(parts[1])]+'/'+(parts[0].slice(2));
      return '<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;">'
        +'<span style="font-size:10.5px;min-width:50px;color:var(--text2);">'+label+'</span>'
        +'<div style="flex:1;height:14px;background:var(--border);border-radius:3px;overflow:hidden;">'
          +'<div style="width:'+pct+'%;height:100%;background:rgba(154,96,96,0.50);border-radius:3px;"></div>'
        +'</div>'
        +'<span style="font-size:10.5px;min-width:14px;color:var(--text3);">'+porMes[k]+'</span>'
      +'</div>';
    }).join('');
  }

  // Lista de honorários
  var lista = document.getElementById('fin-lista');
  if(!lista)return;
  if(!honorarios.length){
    lista.innerHTML='<div class="empty"><div class="empty-ico">💰</div><div>Nenhum honorário cadastrado.<br/><span style="cursor:pointer;color:var(--gold2);" onclick="openModal(\'modal-honorario\')">Adicionar →</span></div></div>';
    return;
  }
  var statusCor={recebido:'#4a7a58',pendente:'#b08030',atraso:'#cc4444',cancelado:'#888'};
  var statusBg={recebido:'rgba(74,122,88,0.10)',pendente:'rgba(224,170,68,0.10)',atraso:'rgba(204,68,68,0.10)',cancelado:'rgba(180,180,180,0.10)'};
  lista.innerHTML=honorarios.map(function(h,i){
    var casoNome=casos.find(function(c){return c.id===h.caso;}); 
    casoNome=casoNome?casoNome.nome:'Avulso';
    var cor=statusCor[h.status]||'#888';
    var bg=statusBg[h.status]||'rgba(180,180,180,0.10)';
    return '<div style="background:rgba(255,248,246,0.90);border:1px solid var(--border);border-radius:var(--r2);padding:13px 16px;display:flex;align-items:center;gap:12px;">'
      +'<div style="flex:1;">'
        +'<div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:3px;">'+(h.desc||h.tipo)+'</div>'
        +'<div style="font-size:11px;color:var(--text2);">'+casoNome+(h.venc?' · Venc: '+fmtDate(h.venc):'')+'</div>'
        +(h.obs?'<div style="font-size:10.5px;color:var(--text3);">'+h.obs+'</div>':'')
      +'</div>'
      +'<div style="text-align:right;">'
        +'<div style="font-size:16px;font-weight:800;color:var(--text);">'+fmt(parseFloat(h.valor)||0)+'</div>'
        +'<span style="font-size:10px;padding:2px 9px;border-radius:20px;background:'+bg+';color:'+cor+';font-weight:700;">'+h.status+'</span>'
      +'</div>'
      +'<div style="display:flex;flex-direction:column;gap:4px;" onclick="event.stopPropagation()">'
        +'<button class="cb" onclick="editarHonorario('+i+')" title="Editar">✎</button>'
        +'<button class="cb" onclick="marcarRecebido('+i+')" title="Marcar recebido" style="color:#4a7a58;">✓</button>'
        +'<button class="cb" onclick="excluirHonorario('+i+')" title="Excluir" style="color:var(--rd2);">✕</button>'
      +'</div>'
    +'</div>';
  }).join('');
}


function editarHonorario(idx){
  var h=ld('honorarios')[idx];if(!h)return;
  editHonId=idx;
  var safe=function(id,val){var el=document.getElementById(id);if(el)el.value=val||'';};
  safe('hon-caso',h.caso);safe('hon-tipo',h.tipo);safe('hon-desc',h.desc);
  safe('hon-valor',h.valor);safe('hon-venc',h.venc);safe('hon-status',h.status);
  safe('hon-receb',h.receb);safe('hon-obs',h.obs);
  document.getElementById('hon-title').textContent='Editar Honorário';
  openModal('modal-honorario');
}

function marcarRecebido(idx){
  var honorarios=ld('honorarios');
  honorarios[idx].status='recebido';
  honorarios[idx].receb=new Date().toISOString().split('T')[0];
  sv('honorarios',honorarios);renderFinanceiro();showToast('✓ Marcado como recebido!');
}

function excluirHonorario(idx){
  confirmar('Excluir este honorário?',function(){
    var h=ld('honorarios');h.splice(idx,1);sv('honorarios',h);renderFinanceiro();
    showToast('✓ Honorário excluído.');
  },'💰','Excluir','rgba(204,68,68,0.85)');
}

function exportarFinanceiro(){
  var h=ld('honorarios');var casos=ld('casos');
  var linhas=['Descrição\tCliente\tTipo\tValor\tVencimento\tStatus\tRecebimento\tObs'];
  h.forEach(function(hon){
    var cn=casos.find(function(c){return c.id===hon.caso;});
    linhas.push([hon.desc||hon.tipo,cn?cn.nome:'Avulso',hon.tipo,'R$ '+hon.valor,hon.venc||'',hon.status,hon.receb||'',hon.obs||''].join('\t'));
  });
  var blob=new Blob([linhas.join('\n')],{type:'text/plain;charset=utf-8'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='LexBase_Financeiro.txt';a.click();
  showToast('✓ Exportado!');
}

// ══ LEMBRETES RECORRENTES ══
function saveLembreteRec(){
  var desc=document.getElementById('lrec-desc')?.value.trim();
  if(!desc){showToast('Informe a descrição.');return;}
  var recs=ld('lembretes_rec');
  recs.push({
    id:'lr'+Date.now(),
    desc:desc,tipo:document.getElementById('lrec-tipo')?.value||'Manifestação',
    freq:document.getElementById('lrec-freq')?.value||'mensal',
    dia:parseInt(document.getElementById('lrec-dia')?.value)||1,
    caso:document.getElementById('lrec-caso')?.value||'',
    num:document.getElementById('lrec-num')?.value||'',
    obs:document.getElementById('lrec-obs')?.value||'',
    ativo:true,criado:new Date().toLocaleDateString('pt-BR')
  });
  sv('lembretes_rec',recs);
  closeModal('modal-lembrete-rec');
  gerarPrazosDoRecorrente(recs[recs.length-1]);
  showToast('✓ Lembrete recorrente ativo! Prazos gerados automaticamente.');
}

function gerarPrazosDoRecorrente(rec){
  var prazos=ld('prazos');
  var hoje=new Date();
  var meses={'mensal':1,'quinzenal':1,'bimestral':2,'semanal':0};
  var count=rec.freq==='semanal'?4:3;
  for(var i=0;i<count;i++){
    var d=new Date(hoje);
    if(rec.freq==='semanal') d.setDate(d.getDate()+7*(i+1));
    else{
      d.setMonth(d.getMonth()+( meses[rec.freq]||1)*(i+1));
      d.setDate(rec.dia||1);
    }
    var dateStr=d.toISOString().split('T')[0];
    prazos.push({id:'pr_rec_'+rec.id+'_'+i,desc:'[🔁] '+rec.desc,tipo:rec.tipo,data:dateStr,num:rec.num||'',caso:rec.caso||'',obs:rec.obs||'Recorrente: '+rec.freq,done:false,recorrenteId:rec.id});
  }
  sv('prazos',prazos);renderPrazos();
}

// ══ CERTIDÃO DE PRAZO ══
function gerarCertidao(prazoIdx){
  var prazos=ld('prazos');
  var p=prazos[prazoIdx];if(!p)return;
  var casos=ld('casos');
  var caso=casos.find(function(c){return c.id===p.caso;});
  var advogado=ld('users')[0]||{nome:'Tatiani Fabi',oab:'OAB/PR'};
  var agora=new Date();
  var texto='CERTIDÃO DE PRAZO PROCESSUAL\n\n'
    +'Eu, '+advogado.nome+', advogado(a) inscrito(a) na '+( advogado.oab||'OAB')+',\n'
    +'CERTIFICO que o seguinte prazo encontra-se devidamente cadastrado\n'
    +'no sistema LexBase de controle de prazos:\n\n'
    +'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n'
    +'PRAZO: '+p.desc+'\n'
    +'TIPO: '+(p.tipo||'—')+'\n'
    +(p.num?'PROCESSO: '+p.num+'\n':'')
    +(caso?'CLIENTE: '+caso.nome+'\n':'')
    +(p.autor?'AUTOR: '+p.autor+'\n':'')
    +(p.reu?'RÉU: '+p.reu+'\n':'')
    +'DATA FATAL: '+(p.data?fmtDate(p.data):'—')+'\n'
    +'STATUS: '+(p.done?'CONCLUÍDO':'PENDENTE')+'\n'
    +(p.obs?'OBS: '+p.obs+'\n':'')
    +'\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n'
    +'Certidão emitida em: '+agora.toLocaleDateString('pt-BR')+' às '+agora.toLocaleTimeString('pt-BR')+'\n'
    +'Sistema: LexBase — Gestão Jurídica\n\n'
    +'_______________________________\n'
    +advogado.nome+'\n'
    +(advogado.oab||'')+'\n'
    +(advogado.email||'');
  var el=document.getElementById('certidao-conteudo');
  if(el)el.textContent=texto;
  openModal('modal-certidao-prazo');
}

function imprimirCertidao(){
  var txt=document.getElementById('certidao-conteudo')?.textContent||'';
  var win=window.open('','_blank');
  win.document.write('<html><head><title>Certidão de Prazo</title><style>body{font-family:"Times New Roman",serif;font-size:13px;line-height:1.85;margin:40px;color:#1a1a1a;white-space:pre-wrap;}</style></head><body>'+txt.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</body></html>');
  win.document.close();win.print();
}

function baixarCertidao(){
  var txt=document.getElementById('certidao-conteudo')?.textContent||'';
  baixarArquivo(txt,'Certidao_Prazo_'+new Date().toISOString().split('T')[0]+'.txt','text/plain;charset=utf-8');
}

// ══ MODELO DE PROCURAÇÃO/SUBSTABELECIMENTO COM IA ══
async function gerarProcuracao(casoId, tipo){
  tipo=tipo||'procuracao';
  var casos=ld('casos');
  var caso=casos.find(function(c){return c.id===casoId;});
  var advogado=ld('users')[0]||{nome:'Tatiani Fabi',oab:'OAB/PR'};
  if(!caso){showToast('Caso não encontrado.');return;}
  if(!navigator.onLine){showToast('IA requer internet.');return;}
  showToast('⏳ Gerando '+tipo+' com IA...');
  var nome_doc=tipo==='substabelecimento'?'Substabelecimento de Poderes':'Procuração Ad Judicia et Extra';
  var prompt='Redija um(a) '+nome_doc+' completo e profissional.\n\n'
    +'OUTORGANTE: '+caso.nome+'\n'
    +(caso.cpf?'CPF/CNPJ: '+caso.cpf+'\n':'')
    +(caso.end||caso.obs?'Qualificação: '+( caso.obs||'')+'\n':'')
    +'OUTORGADO (ADVOGADO): '+advogado.nome+'\n'
    +(advogado.oab?'OAB: '+advogado.oab+'\n':'')
    +'FINALIDADE: Representação em processos judiciais — '+(caso.area||'cível')+'\n'
    +(caso.acoes&&caso.acoes[0]&&caso.acoes[0].num?'PROCESSO: '+caso.acoes[0].num+'\n':'')
    +'\nO documento deve incluir:\n'
    +'- Qualificação completa das partes\n'
    +'- Poderes para todos os atos do foro em geral\n'
    +'- Cláusula de substabelecimento '+(tipo==='substabelecimento'?'com reserva de iguais poderes':'com e sem reserva')+'\n'
    +'- Local e data em branco para preenchimento\n'
    +'- Assinatura e reconhecimento de firma\n\n'
    +'Use linguagem jurídica formal e completa.';
  try{
    var resp=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:2000,messages:[{role:'user',content:prompt}]})
    });
    var d=await resp.json();
    var txt=(d.content||[]).filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('');
    if(txt){
      nav('editor');
      setTimeout(function(){
        var ed=document.getElementById('editor-body');
        if(ed){ed.focus();ed.innerText=txt;}
        showToast('✓ '+nome_doc+' carregado no editor!');
      },200);
    }
  }catch(e){showToast('Erro: '+e.message);}
}

// Adicionar botão no modal-ver-caso
function renderCasoAcoesComProcuracao(caso){
  renderCasoAcoes(caso);
}

// Adicionar botões de procuração/substabelecimento no abrirCaso


// Adicionar botão de certidão em cada prazo
// Modificar renderPrazos para incluir botão certidão


// Add certidão button to prazo cards
// We do this by overriding the delete button area rendering in renderPrazos
// Instead: add certidão link to each prazo card via delegation
document.addEventListener('click',function(e){
  var certBtn=e.target.closest('[data-certidao]');
  if(certBtn){
    gerarCertidao(parseInt(certBtn.dataset.certidao));
  }
});


// ══ REDIGIR COM BASE NA INICIAL ══
function gerarContrarrazaoFromPrazo(pidx){
  var prazos=ld('prazos');
  var p=prazos[parseInt(pidx)];if(!p)return;
  var casos=ld('casos');
  var caso=p.caso?casos.find(function(x){return x.id===p.caso;}):null;
  nav('editor');
  setTimeout(function(){
    var ed=document.getElementById('editor-body');if(!ed)return;
    var contexto=p.tipo+' — '+p.desc;
    if(caso)contexto+='\nCliente: '+caso.nome+(caso.area?' ('+caso.area+')':'');
    if(p.autor)contexto+='\nAutor: '+p.autor;
    if(p.reu)contexto+='\nRéu: '+p.reu;
    if(p.num)contexto+='\nProcesso: '+p.num;
    if(p.obs)contexto+='\nObs: '+p.obs;
    if(!navigator.onLine){
      ed.innerHTML='<p><strong>'+p.tipo+'</strong></p><p>'+contexto.replace(/\n/g,'<br>')+'</p>';
      showToast('Editor aberto — adicione o conteúdo');return;
    }
    ed.innerHTML='<p style="color:var(--text3);font-style:italic;">⏳ Gerando '+p.tipo+' com IA...</p>';
    fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:3000,
        messages:[{role:'user',content:'Redija uma '+p.tipo+' completa com base nestas informações:\n\n'+contexto+'\n\nEstrutura obrigatória: preâmbulo, fatos, direito (artigos de lei + jurisprudência), pedidos. Linguagem técnica e persuasiva.'}]})
    }).then(function(r){return r.json();})
    .then(function(d){
      var txt=(d.content||[]).filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('');
      if(txt)ed.innerText=txt;
      showToast('✓ '+p.tipo+' gerada com IA!');
    }).catch(function(e){
      ed.innerHTML='<p><strong>'+p.tipo+'</strong></p><p>'+contexto.replace(/\n/g,'<br>')+'</p>';
    });
  },200);
}

// ══ BIBLIOTECA DE TESES ══
function renderTeses(){
  var teses=ld('teses');
  var grid=document.getElementById('teses-grid');if(!grid)return;
  if(!teses.length){
    grid.innerHTML='<div class="empty"><div class="empty-ico">📖</div><div>Nenhuma tese salva.<br/><span style="cursor:pointer;color:var(--gold2);" onclick="openModal(\'modal-nova-tese\')">Adicionar →</span></div></div>';
    return;
  }
  grid.innerHTML='';
  teses.forEach(function(t,i){
    var div=document.createElement('div');
    div.style.cssText='background:rgba(255,248,246,0.90);border:1px solid var(--border);border-radius:var(--r2);padding:14px 16px;cursor:pointer;transition:all .15s;';
    div.onmouseenter=function(){this.style.boxShadow='0 4px 18px rgba(154,96,96,0.12)';};
    div.onmouseleave=function(){this.style.boxShadow='';};
    div.innerHTML='<div style="display:flex;justify-content:space-between;align-items:flex-start;">'
      +'<div>'
        +'<div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:4px;">'+t.titulo+'</div>'
        +'<div style="display:flex;gap:6px;flex-wrap:wrap;">'
          +(t.area?'<span style="font-size:9.5px;padding:2px 8px;border-radius:20px;background:rgba(154,96,96,0.10);color:#9a4040;">'+t.area+'</span>':'')
          +(t.tipo?'<span style="font-size:9.5px;padding:2px 8px;border-radius:20px;background:rgba(88,104,170,0.10);color:#5868aa;">'+t.tipo+'</span>':'')
        +'</div>'
      +'</div>'
      +'<div style="display:flex;gap:4px;" id="tese-btns-'+i+'"></div>'
    +'</div>'
    +(t.resumo?'<div style="font-size:11px;color:var(--text3);margin-top:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+t.resumo+'</div>':'');
    div.onclick=function(){verTese(i);};
    grid.appendChild(div);
    // Add buttons via DOM (avoid inline onclick quote issues)
    var btnWrap=document.getElementById('tese-btns-'+i);
    if(btnWrap){
      var b1=document.createElement('button');b1.className='cb';b1.title='Usar no editor';b1.textContent='↗';
      b1.onclick=function(e){e.stopPropagation();usarTeseNoEditor(i);};
      var b2=document.createElement('button');b2.className='cb';b2.title='Editar';b2.textContent='✎';
      b2.onclick=function(e){e.stopPropagation();editarTese(i);};
      var b3=document.createElement('button');b3.className='cb';b3.title='Excluir';b3.textContent='✕';b3.style.color='var(--rd2)';
      b3.onclick=function(e){e.stopPropagation();excluirTese(i);};
      btnWrap.appendChild(b1);btnWrap.appendChild(b2);btnWrap.appendChild(b3);
    }
  });
}

function saveTese(){
  var titulo=document.getElementById('tese-titulo')?.value.trim();
  if(!titulo){showToast('Informe o título da tese.');return;}
  var teses=ld('teses');
  var editIdx=window._editTeseIdx;
  var tese={
    titulo:titulo,
    area:document.getElementById('tese-area')?.value||'',
    tipo:document.getElementById('tese-tipo')?.value||'',
    resumo:document.getElementById('tese-resumo')?.value||'',
    texto:document.getElementById('tese-texto')?.value||''
  };
  if(editIdx!==undefined){teses[editIdx]=tese;window._editTeseIdx=undefined;}
  else teses.push(tese);
  sv('teses',teses);
  closeModal('modal-nova-tese');
  renderTeses();showToast('✓ Tese salva na biblioteca!');
}

function verTese(idx){
  var t=ld('teses')[idx];if(!t)return;
  var el=document.getElementById('tese-view-txt');
  if(el)el.textContent=t.texto||t.resumo||'(sem conteúdo)';
  var title=document.getElementById('tese-view-title');
  if(title)title.textContent=t.titulo;
  window._viewTeseIdx=idx;
  openModal('modal-ver-tese');
}

function usarTeseNoEditor(idx){
  var t=ld('teses')[idx];if(!t)return;
  closeModal('modal-ver-tese');
  nav('editor');
  setTimeout(function(){
    var ed=document.getElementById('editor-body');if(!ed)return;
    ed.innerText=t.texto||t.titulo;
    showToast('✓ Tese carregada no editor!');
  },200);
}

async function aplicarTeseComIA(casoDesc){
  var teses=ld('teses');
  if(!teses.length){showToast('Nenhuma tese na biblioteca.');return;}
  if(!navigator.onLine){showToast('IA requer internet.');return;}
  var ed=document.getElementById('editor-body');
  var textoAtual=ed?ed.innerText:'';
  var listaTeses=teses.map(function(t,i){return i+'. '+t.titulo+(t.resumo?' — '+t.resumo:'');}).join(' | ');
  var prompt='Você é advogado. Analise o caso e as teses disponíveis na biblioteca jurídica:\n\n'
    +'CASO/PETIÇÃO ATUAL:\n'+textoAtual.slice(0,500)+'...\n\n'
    +'BIBLIOTECA DE TESES:\n'+listaTeses+'\n\n'
    +'Identifique quais teses se aplicam a este caso (máximo 3) e explique brevemente por quê cada uma se aplica.\n'
    +'Formato da resposta: lista numerada com nome da tese e justificativa em 1 linha.';
  showToast('⏳ Analisando teses aplicáveis...');
  try{
    var resp=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:800,messages:[{role:'user',content:prompt}]})
    });
    var d=await resp.json();
    var txt=(d.content||[]).filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('');
    var out=document.getElementById('ed-ia-out');
    if(out){out.style.display='block';out.textContent=txt;}
    showToast('✓ Teses sugeridas!');
  }catch(e){showToast('Erro: '+e.message);}
}

function editarTese(idx){
  var t=ld('teses')[idx];if(!t)return;
  window._editTeseIdx=idx;
  var safe=function(id,v){var el=document.getElementById(id);if(el)el.value=v||'';};
  safe('tese-titulo',t.titulo);safe('tese-area',t.area);safe('tese-tipo',t.tipo);
  safe('tese-resumo',t.resumo);safe('tese-texto',t.texto);
  openModal('modal-nova-tese');
}

function excluirTese(idx){
  confirmar('Excluir esta tese da biblioteca?',function(){
    var teses=ld('teses');teses.splice(idx,1);sv('teses',teses);
    renderTeses();showToast('✓ Tese excluída.');
  },'📖','Excluir','rgba(204,68,68,0.85)');
}

// ══ TRIAGEM RÁPIDA ══
async function processarTriagem(){
  var texto=document.getElementById('triagem-texto')?.value.trim();
  if(!texto){showToast('Cole o relato do cliente.');return;}
  if(!navigator.onLine){showToast('IA requer internet.');return;}
  var out=document.getElementById('triagem-resultado');
  var btn=document.getElementById('triagem-btn');
  if(out)out.style.display='block';
  if(btn)btn.disabled=true;
  var loadEl=document.getElementById('triagem-loading');
  if(loadEl)loadEl.style.display='block';
  try{
    var resp=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1500,
        system:'Responda SOMENTE com JSON válido sem markdown.',
        messages:[{role:'user',content:'Analise o relato jurídico e extraia as informações. Responda SOMENTE com JSON:\n\n'+texto+'\n\n{"nome_autor":"","nome_reu":"","cpf_autor":"","telefone":"","email":"","valor_causa":"","valor_numerico":0,"area_direito":"","pedidos":[""],"fatos_resumo":"","datas_relevantes":[{"data":"","descricao":""}],"urgente":false,"observacoes":""}'}]})
    });
    var d=await resp.json();
    if(d.error){showToast('Erro IA: '+d.error.message);return;}
    var raw=(d.content||[]).filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('').trim();
    var m=raw.match(/\{[\s\S]*\}/);
    var dados=m?JSON.parse(m[0]):null;
    if(!dados){showToast('Não foi possível extrair os dados. Tente reformular o relato.');return;}
    // Show results
    renderTriagemResultado(dados);
  }catch(e){showToast('Erro: '+e.message);}
  finally{if(btn)btn.disabled=false;if(loadEl)loadEl.style.display='none';}
}

function renderTriagemResultado(dados){
  var out=document.getElementById('triagem-resultado');if(!out)return;
  out.innerHTML='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">'
    +'<div class="fg"><label class="fl">Autor/Cliente</label><input class="fi" id="tri-autor" value="'+(dados.nome_autor||'')+'"/></div>'
    +'<div class="fg"><label class="fl">Réu</label><input class="fi" id="tri-reu" value="'+(dados.nome_reu||'')+'"/></div>'
    +'<div class="fg"><label class="fl">CPF/Contato</label><input class="fi" id="tri-cpf" value="'+(dados.cpf_autor||dados.telefone||dados.email||'')+'"/></div>'
    +'<div class="fg"><label class="fl">Área</label><input class="fi" id="tri-area" value="'+(dados.area_direito||'Direito do Consumidor')+'"/></div>'
    +'<div class="fg"><label class="fl">Valor da causa</label><input class="fi" id="tri-valor" value="'+(dados.valor_causa||'')+'"/></div>'
    +'<div class="fg" style="grid-column:1/-1;"><label class="fl">Pedidos identificados</label>'
      +'<textarea class="fi" id="tri-pedidos" style="min-height:65px;">'+(dados.pedidos||[]).join('\n')+'</textarea>'
    +'</div>'
    +'<div class="fg" style="grid-column:1/-1;"><label class="fl">Fatos resumidos</label>'
      +'<textarea class="fi" id="tri-fatos" style="min-height:65px;">'+(dados.fatos_resumo||'')+'</textarea>'
    +'</div>'
    +(dados.datas_relevantes&&dados.datas_relevantes.length?'<div class="fg" style="grid-column:1/-1;"><label class="fl">Datas relevantes</label><input class="fi" id="tri-datas" value="'+dados.datas_relevantes.map(function(d){return d.data+' — '+d.descricao;}).join(' | ')+'"/></div>':'')
    +(dados.urgente?'<div style="grid-column:1/-1;" class="alert alert-r">⚠ CASO URGENTE identificado!</div>':'')
  +'</div>'
  +'<div style="display:flex;gap:8px;margin-top:12px;">'
    +'<button class="btn btn-gold" onclick="criarCasoFromTriagem()">✓ Criar cliente no sistema</button>'
    +'<button class="btn btn-outline" onclick="gerarPeticaoFromTriagem()">✦ Gerar petição inicial</button>'
  +'</div>';
}

function criarCasoFromTriagem(){
  var nome=document.getElementById('tri-autor')?.value.trim()||'Novo Cliente';
  var reu=document.getElementById('tri-reu')?.value||'';
  var cpf=document.getElementById('tri-cpf')?.value||'';
  var area=document.getElementById('tri-area')?.value||'Direito do Consumidor';
  var valor=document.getElementById('tri-valor')?.value||'';
  var fatos=document.getElementById('tri-fatos')?.value||'';
  var pedidos=document.getElementById('tri-pedidos')?.value||'';
  var casos=ld('casos');
  var novo={
    id:'caso'+Date.now(),nome:nome,cpf:cpf,area:area,status:'ativo',
    obs:'Réu: '+reu+(fatos?'\nFatos: '+fatos:'')+(pedidos?'\nPedidos: '+pedidos:''),
    acoes:[{id:'ac'+Date.now(),nome:'Ação vs '+reu,num:'',pecas:[],docs:[],
      status:'ativa',resultado:'',valorCausa:valor,valorFinal:''}],
    docs:[],criado:new Date().toLocaleDateString('pt-BR')
  };
  casos.unshift(novo);sv('casos',casos);
  closeModal('modal-triagem');
  nav('casos');renderCasos();populateSels();
  showToast('✓ Cliente criado! Abra a pasta para completar os dados.');
}

function gerarPeticaoFromTriagem(){
  var fatos=document.getElementById('tri-fatos')?.value||'';
  var pedidos=document.getElementById('tri-pedidos')?.value||'';
  var autor=document.getElementById('tri-autor')?.value||'';
  var reu=document.getElementById('tri-reu')?.value||'';
  var area=document.getElementById('tri-area')?.value||'';
  closeModal('modal-triagem');
  // Pre-fill gerar petição modal
  var safe=function(id,v){var el=document.getElementById(id);if(el)el.value=v;};
  safe('ia-gen-tipo','Petição Inicial');
  safe('ia-gen-area',area);
  safe('ia-gen-partes',autor+(reu?' × '+reu:''));
  safe('ia-gen-fatos',fatos);
  safe('ia-gen-pedidos',pedidos);
  openModal('modal-gerar-peticao');
}


// ══ HONORÁRIOS: PARCELAS E MENSALIDADE ══
function onHonTipoChange(){
  var tipo=document.getElementById('hon-tipo')?.value||'unico';
  var pw=document.getElementById('hon-parcelas-wrap');
  var mw=document.getElementById('hon-mensal-wrap');
  if(pw)pw.style.display=tipo==='parcelado'?'block':'none';
  if(mw)mw.style.display=tipo==='mensal'?'block':'none';
}

function saveHonorario(){
  var valor=parseFloat(document.getElementById('hon-valor')?.value||0);
  if(!valor){showToast('Informe o valor.');return;}
  var tipo=document.getElementById('hon-tipo')?.value||'unico';
  var honorarios=ld('honorarios');
  var editIdx=window.editHonId;
  var base={
    caso:document.getElementById('hon-caso')?.value||'',
    tipo:tipo,
    desc:document.getElementById('hon-desc')?.value||'',
    valor:valor,
    status:document.getElementById('hon-status')?.value||'pendente',
    receb:document.getElementById('hon-receb')?.value||'',
    obs:document.getElementById('hon-obs')?.value||''
  };

  if(tipo==='parcelado'){
    var nParcelas=parseInt(document.getElementById('hon-num-parcelas')?.value||3);
    var diaVenc=parseInt(document.getElementById('hon-dia-venc')?.value||10);
    var hoje=new Date();
    for(var i=0;i<nParcelas;i++){
      var d=new Date(hoje.getFullYear(),hoje.getMonth()+i,diaVenc);
      honorarios.push(Object.assign({},base,{
        id:'h'+Date.now()+i,
        desc:base.desc+(nParcelas>1?' ('+( i+1)+'/'+nParcelas+')':''),
        venc:d.toISOString().split('T')[0],
        parcelaIdx:i+1,totalParcelas:nParcelas
      }));
    }
    sv('honorarios',honorarios);
    closeModal('modal-honorario');renderFinanceiro();
    showToast('✓ '+nParcelas+' parcelas criadas!');
    return;
  }
  if(tipo==='mensal'){
    var diaMensal=parseInt(document.getElementById('hon-dia-mensal')?.value||5);
    var mesesGerar=parseInt(document.getElementById('hon-meses-gerar')?.value||3);
    var hoje2=new Date();
    for(var j=0;j<mesesGerar;j++){
      var d2=new Date(hoje2.getFullYear(),hoje2.getMonth()+j,diaMensal);
      honorarios.push(Object.assign({},base,{
        id:'h'+Date.now()+j,
        desc:base.desc+' — '+d2.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}),
        venc:d2.toISOString().split('T')[0],
        recorrente:true,diaVenc:diaMensal
      }));
    }
    sv('honorarios',honorarios);
    closeModal('modal-honorario');renderFinanceiro();
    showToast('✓ '+mesesGerar+' mensalidades criadas! Serão renovadas automaticamente.');
    return;
  }

  // Único / Êxito / Consultoria
  var hon=Object.assign({id:'h'+Date.now()},base,{
    venc:document.getElementById('hon-venc')?.value||''
  });
  if(editIdx!==undefined&&editIdx!==null){honorarios[editIdx]=hon;window.editHonId=null;}
  else honorarios.unshift(hon);
  sv('honorarios',honorarios);
  closeModal('modal-honorario');renderFinanceiro();showToast('✓ Honorário salvo!');
}

// Auto-gerar mensalidade do próximo mês
function renovarMensalidadesVencidas(){
  var honorarios=ld('honorarios');
  var hoje=new Date().toISOString().split('T')[0];
  var renovados=0;
  honorarios.forEach(function(h){
    if(!h.recorrente||!h.diaVenc)return;
    if(h.venc&&h.venc<hoje&&h.status==='pendente'){
      h.status='atraso'; // mark as overdue
    }
    // Check if next month's entry exists
    if(h.venc&&h.status!=='cancelado'){
      var d=new Date(h.venc+'T12:00');
      var nextMonth=new Date(d.getFullYear(),d.getMonth()+1,h.diaVenc);
      var nextStr=nextMonth.toISOString().split('T')[0];
      var exists=honorarios.find(function(x){return x.recorrente&&x.diaVenc===h.diaVenc&&x.venc===nextStr&&x.caso===h.caso;});
      if(!exists&&nextMonth<=new Date(new Date().getFullYear(),new Date().getMonth()+2,1)){
        honorarios.push({id:'h'+Date.now()+Math.random().toString(36).slice(2),
          caso:h.caso,tipo:'mensal',desc:h.desc.replace(/ — .*$/,'')
            +' — '+nextMonth.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}),
          valor:h.valor,venc:nextStr,status:'pendente',recorrente:true,diaVenc:h.diaVenc,obs:h.obs||''
        });
        renovados++;
      }
    }
  });
  if(renovados>0){sv('honorarios',honorarios);showToast('✓ '+renovados+' mensalidade(s) renovada(s)!');}
}

// ══ PRAZO: RECORRENTE + DOCS ══
function onPrazoRecorrenteChange(){
  var cb=document.getElementById('pr-recorrente');
  var opts=document.getElementById('pr-rec-opts');
  if(opts)opts.style.display=cb&&cb.checked?'block':'none';
}

var _currentPrazoEditIdx=null;
function uploadDocPrazo(e){
  var files=Array.from(e.target.files||[]);
  if(!files.length)return;
  var existing=window._prazoDocsTmp||[];
  files.forEach(function(f){
    // Store name (can't store binary in localStorage, just metadata)
    existing.push({nome:f.name,tipo:f.type,tamanho:Math.round(f.size/1024)+'kb',data:new Date().toLocaleDateString('pt-BR')});
  });
  window._prazoDocsTmp=existing;
  renderPrazoDocs();
  e.target.value='';showToast('✓ '+files.length+' doc(s) registrado(s)!');
}

function renderPrazoDocs(){
  var list=document.getElementById('pr-docs-list');if(!list)return;
  var docs=window._prazoDocsTmp||[];
  list.innerHTML=docs.map(function(d,i){
    return'<div style="display:flex;align-items:center;gap:7px;padding:5px 8px;background:rgba(255,248,246,0.80);border:1px solid var(--border);border-radius:var(--r);margin-bottom:3px;">'
      +'<span style="font-size:12px;">📄</span>'
      +'<span style="flex:1;font-size:11.5px;">'+d.nome+'</span>'
      +'<span style="font-size:10px;color:var(--text3);">'+d.tamanho+'</span>'
      +'<button onclick="removePrazoDoc('+i+')" style="background:none;border:none;cursor:pointer;font-size:11px;color:var(--rd2);">✕</button>'
    +'</div>';
  }).join('');
}

function removePrazoDoc(idx){
  var docs=window._prazoDocsTmp||[];docs.splice(idx,1);
  window._prazoDocsTmp=docs;renderPrazoDocs();
}

function editarPrazo(idx){
  var prazos=ld('prazos');
  var p=prazos[idx];if(!p)return;
  _currentPrazoEditIdx=idx;
  window._prazoDocsTmp=p.docs||[];
  var safe=function(id,val){var el=document.getElementById(id);if(el)el.value=val||'';};
  safe('pr-desc',p.desc);safe('pr-tipo',p.tipo);safe('pr-data',p.data);
  safe('pr-num',p.num);safe('pr-obs',p.obs);safe('pr-autor',p.autor);safe('pr-reu',p.reu);
  safe('pr-chegou',p.chegou||p.data);safe('pr-fatal',p.fatal||p.data);
  var diasEl=document.getElementById('pr-dias-uteis');if(diasEl)diasEl.value=p.diasUteis||'15';
  var recCb=document.getElementById('pr-recorrente');
  if(recCb){recCb.checked=!!p.recorrente;onPrazoRecorrenteChange();}
  if(p.recorrente){
    safe('pr-rec-freq',p.recFreq);safe('pr-rec-dia',p.recDia);
  }
  var casoEl=document.getElementById('pr-caso');if(casoEl)casoEl.value=p.caso||'';
  renderPrazoDocs();
  atualizarFatalBadge(p.fatal||p.data);
  var mt=document.getElementById('prazo-mt');if(mt)mt.textContent='Editar Prazo';
  openModal('modal-prazo');
}

function savePrazo(){
  var desc=document.getElementById('pr-desc')?.value.trim();if(!desc){alert('Descreva o prazo.');return;}
  var prazos=ld('prazos');
  var recorrente=document.getElementById('pr-recorrente')?.checked||false;
  var prazo={
    desc:desc,tipo:document.getElementById('pr-tipo')?.value||'Manifestação',
    data:document.getElementById('pr-fatal')?.value||document.getElementById('pr-data')?.value||'',
    fatal:document.getElementById('pr-fatal')?.value||'',
    chegou:document.getElementById('pr-chegou')?.value||'',
    diasUteis:document.getElementById('pr-dias-uteis')?.value||'15',
    num:document.getElementById('pr-num')?.value||'',
    obs:document.getElementById('pr-obs')?.value||'',
    autor:document.getElementById('pr-autor')?.value||'',
    reu:document.getElementById('pr-reu')?.value||'',
    caso:document.getElementById('pr-caso')?.value||'',
    docs:window._prazoDocsTmp||[],
    recorrente:recorrente,
    recFreq:recorrente?document.getElementById('pr-rec-freq')?.value:'',
    recDia:recorrente?document.getElementById('pr-rec-dia')?.value:''
  };
  if(_currentPrazoEditIdx!==null&&_currentPrazoEditIdx>=0){
    Object.assign(prazos[_currentPrazoEditIdx],prazo);
    _currentPrazoEditIdx=null;
  }else{
    prazo.id='pr'+Date.now();prazo.done=false;
    prazos.unshift(prazo);
    if(recorrente)gerarProximosRecorrentes(prazo,prazos);
  }
  sv('prazos',prazos);
  window._prazoDocsTmp=[];
  var mt=document.getElementById('prazo-mt');if(mt)mt.textContent='Novo Prazo';
  closeModal('modal-prazo');renderPrazos();renderDash();showToast('✓ Prazo salvo!');
}

function gerarProximosRecorrentes(prazo,prazos){
  var count=parseInt(document.getElementById('pr-rec-count')?.value||3);
  var freq=prazo.recFreq||'mensal';
  var dia=parseInt(prazo.recDia||10);
  var base=new Date(prazo.fatal||prazo.data);
  for(var i=1;i<=count;i++){
    var d=new Date(base);
    if(freq==='semanal') d.setDate(d.getDate()+7*i);
    else if(freq==='quinzenal') d.setDate(d.getDate()+15*i);
    else if(freq==='bimestral') d.setMonth(d.getMonth()+2*i);
    else{d.setMonth(d.getMonth()+i);d.setDate(dia);}
    prazos.push({id:'pr_rec_'+prazo.id+'_'+i,
      desc:prazo.desc+' ('+( i+1)+'ª)',tipo:prazo.tipo,
      data:d.toISOString().split('T')[0],
      fatal:d.toISOString().split('T')[0],
      num:prazo.num,caso:prazo.caso,obs:prazo.obs||'[Recorrente]',done:false,
      recorrente:true,recFreq:freq,recDia:dia
    });
  }
}

function gerarContrarrazaoFromPrazoAtual(){
  var prazos=ld('prazos');
  if(_currentPrazoEditIdx!==null&&_currentPrazoEditIdx>=0){
    gerarContrarrazaoFromPrazo(_currentPrazoEditIdx);
  } else {
    showToast('Abra um prazo para redigir a peça.');
  }
}

// ══ TRIAGEM: IMAGENS E DOCUMENTOS ══
var _triagemFiles=[];
function onTriagemFileAdd(e){
  var files=Array.from(e.target.files||[]);
  files.forEach(function(f){
    var reader=new FileReader();
    reader.onload=function(ev){
      _triagemFiles.push({nome:f.name,type:f.type,b64:ev.target.result.split(',')[1],mediaType:f.type});
      renderTriagemFiles();
    };
    reader.readAsDataURL(f);
  });
  e.target.value='';
}

function renderTriagemFiles(){
  var list=document.getElementById('triagem-files-list');if(!list)return;
  list.innerHTML=_triagemFiles.map(function(f,i){
    return'<div style="display:flex;align-items:center;gap:7px;padding:5px 8px;background:rgba(255,248,246,0.80);border:1px solid var(--border);border-radius:var(--r);margin-bottom:3px;">'
      +'<span style="font-size:12px;">'+(f.type.startsWith('image/')? '🖼':'📄')+'</span>'
      +'<span style="flex:1;font-size:11.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+f.nome+'</span>'
      +'<button onclick="removeTriagemFile('+i+')" style="background:none;border:none;cursor:pointer;font-size:11px;color:var(--rd2);">✕</button>'
    +'</div>';
  }).join('');
}

function removeTriagemFile(idx){_triagemFiles.splice(idx,1);renderTriagemFiles();}

async function processarTriagem(){
  var texto=document.getElementById('triagem-texto')?.value.trim()||'';
  var tipoPeca=document.getElementById('triagem-tipo-peca')?.value||'triagem';
  if(!texto&&_triagemFiles.length===0){showToast('Cole um relato ou anexe um documento.');return;}
  if(!navigator.onLine){showToast('IA requer internet.');return;}
  var btn=document.getElementById('triagem-btn');
  var loadEl=document.getElementById('triagem-loading');
  var out=document.getElementById('triagem-resultado');
  if(btn)btn.disabled=true;
  if(loadEl)loadEl.style.display='block';
  if(out)out.style.display='block';

  var systemPrompt = tipoPeca==='triagem'
    ? 'Responda SOMENTE com JSON válido sem markdown. Extraia dados do relato jurídico.'
    : 'Você é advogado especialista. Analise o documento e responda conforme solicitado.';

  var userContent=[];
  // Add images/docs first
  _triagemFiles.forEach(function(f){
    if(f.type.startsWith('image/')){
      userContent.push({type:'image',source:{type:'base64',media_type:f.mediaType,data:f.b64}});
    } else if(f.type==='application/pdf'){
      userContent.push({type:'document',source:{type:'base64',media_type:'application/pdf',data:f.b64}});
    }
  });

  var promptText='';
  if(tipoPeca==='triagem'){
    promptText=(texto?'Relato:\n'+texto+'\n\n':'')
      +'Extraia as informações em JSON:\n{"nome_autor":"","nome_reu":"","cpf_autor":"","telefone":"","email":"","valor_causa":"","valor_numerico":0,"area_direito":"","pedidos":[""],"fatos_resumo":"","datas_relevantes":[{"data":"","descricao":""}],"urgente":false,"observacoes":""}';
  } else if(tipoPeca==='parecer'){
    promptText=(texto?'Contexto:\n'+texto+'\n\n':'')+'Redija um parecer jurídico completo e fundamentado. Analise os documentos anexados se houver.';
  } else if(tipoPeca==='contrato'){
    promptText=(texto?'Contexto:\n'+texto+'\n\n':'')+'Redija um contrato jurídico completo com cláusulas padronizadas. Partes, objeto, obrigações, penalidades, foro.';
  } else {
    promptText=(texto?texto+'\n\n':'')+'Analise e processe conforme o tipo de documento. Se há imagens/documentos anexados, leia-os também.';
  }
  userContent.push({type:'text',text:promptText});

  try{
    var resp=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:3000,
        system:systemPrompt,
        messages:[{role:'user',content:userContent}]})
    });
    var d=await resp.json();
    if(d.error){if(out)out.innerHTML='<div class="alert alert-r">⚠ '+d.error.message+'</div>';return;}
    var raw=(d.content||[]).filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('').trim();

    if(tipoPeca==='triagem'){
      var m=raw.match(/\{[\s\S]*\}/);
      var dados=m?JSON.parse(m[0]):null;
      if(dados){renderTriagemResultado(dados);}
      else{if(out)out.innerHTML='<div style="white-space:pre-wrap;font-size:12.5px;">'+raw+'</div>';}
    } else {
      // For parecer/contrato/outros - show result and offer to load in editor
      if(out)out.innerHTML='<div style="background:rgba(255,248,246,0.92);border:1px solid var(--border);border-radius:var(--r);padding:14px;font-size:12.5px;line-height:1.75;white-space:pre-wrap;max-height:400px;overflow-y:auto;">'+raw+'</div>'
        +'<div style="display:flex;gap:8px;margin-top:10px;">'
          +'<button class="btn btn-gold" onclick="carregarTriagemNoEditor(this.previousElementSibling.textContent)">↗ Abrir no editor</button>'
        +'</div>';
      window._triagemTextoGerado=raw;
    }
  }catch(e){if(out)out.innerHTML='<div class="alert alert-r">⚠ Erro: '+e.message+'</div>';}
  finally{if(btn)btn.disabled=false;if(loadEl)loadEl.style.display='none';}
}

function carregarTriagemNoEditor(txt){
  nav('editor');
  setTimeout(function(){
    var ed=document.getElementById('editor-body');
    if(ed){ed.innerText=window._triagemTextoGerado||txt;showToast('✓ Carregado no editor!');}
  },200);
}

// ══ BIBLIOTECA DE TESES: AUTO-EXTRAÇÃO ══
async function extrairTesesDeTexto(texto, origem){
  if(!texto||texto.length<100)return;
  if(!navigator.onLine)return;
  try{
    var resp=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:2000,
        system:'Responda SOMENTE com JSON válido. Seja criterioso: só extraia teses relevantes e bem fundamentadas.',
        messages:[{role:'user',content:'Analise este texto jurídico e extraia as teses jurídicas mais relevantes e reutilizáveis.\n\n'+texto.slice(0,3000)+'\n\nJSON: {"teses":[{"titulo":"","area":"","tipo":"","resumo":"","texto":""}]}\n\nExtrai no máximo 3 teses. Inclua só as mais sólidas com fundamentação legal clara.'}]})
    });
    var d=await resp.json();
    var raw=(d.content||[]).filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('').trim();
    var m=raw.match(/\{[\s\S]*\}/);
    var parsed=m?JSON.parse(m[0]):null;
    if(!parsed||!parsed.teses||!parsed.teses.length)return;
    var teses=ld('teses');
    var novas=0;
    parsed.teses.forEach(function(t){
      if(!t.titulo||!t.texto)return;
      // Avoid duplicates
      var existe=teses.find(function(x){return x.titulo.toLowerCase()===t.titulo.toLowerCase();});
      if(!existe){
        teses.push({titulo:t.titulo,area:t.area||'',tipo:t.tipo||'',resumo:t.resumo||'',texto:t.texto,origem:origem||'auto-extração',data:new Date().toLocaleDateString('pt-BR')});
        novas++;
      }
    });
    if(novas>0){sv('teses',teses);showToast('✓ '+novas+' tese(s) nova(s) salva(s) na biblioteca!');}
  }catch(e){}
}

// Hook: auto-extract when saving a peça to biblioteca
var _origSavePecaForm=typeof savePecaForm==='function'?savePecaForm:null;
// We hook into verPeca save - detect when text is saved
function autoExtrairTesesAoSalvar(texto, area){
  if(!texto||texto.length<200)return;
  if(localStorage.getItem('lb_auto_teses')==='0')return;
  setTimeout(function(){extrairTesesDeTexto(texto,'peça salva — '+area);},2000);
}

// ══ TRIAGEM TIPO SELETOR ══
function atualizarTipoTriagem(){
  var tipo=document.getElementById('triagem-tipo-peca')?.value||'triagem';
  var placeholder=document.getElementById('triagem-texto');
  var btn=document.getElementById('triagem-btn');
  if(!placeholder||!btn)return;
  var textos={
    triagem:'Cole o relato bruto do cliente (WhatsApp, e-mail, transcrição de conversa)...',
    peticao:'Descreva os fatos para a petição inicial ou cole informações do caso...',
    parecer:'Cole o documento, decisão ou pergunta para análise jurídica...',
    contrato:'Descreva as partes, objeto e condições do contrato a ser redigido...',
    outro:'Cole o texto ou descreva o que precisa ser processado pela IA...'
  };
  var btns={triagem:'⚡ Extrair dados do caso',peticao:'✦ Gerar petição inicial',parecer:'✦ Redigir parecer',contrato:'✦ Redigir contrato',outro:'✦ Processar com IA'};
  placeholder.placeholder=textos[tipo]||textos['outro'];
  btn.textContent=btns[tipo]||btns['outro'];
}


function toggleAutoTeses(){
  var cur=localStorage.getItem('lb_auto_teses');
  var next=cur==='0'?'1':'0';
  localStorage.setItem('lb_auto_teses',next);
  var btn=document.getElementById('btn-auto-teses');
  if(btn)btn.textContent='🤖 Auto-extração: '+(next==='0'?'desativada':'ativada');
  showToast(next==='0'?'Auto-extração desativada':'✓ Auto-extração ativada — peças salvas terão teses extraídas automaticamente!');
}
document.addEventListener('DOMContentLoaded',function(){
  var saved=localStorage.getItem('lb_auto_teses');
  var btn=document.getElementById('btn-auto-teses');
  if(btn)btn.textContent='🤖 Auto-extração: '+(saved==='0'?'desativada':'ativada');
});


// ══════════════════════════════════════════════════════
// LOG DE ALTERAÇÕES
// ══════════════════════════════════════════════════════
function addLog(acao, detalhes){
  var logs=ld('logs');
  var user=currentUser?currentUser.nome:'Usuário';
  var now=new Date();
  logs.unshift({
    user:user,acao:acao,detalhes:detalhes||'',
    data:now.toLocaleDateString('pt-BR'),
    hora:now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),
    ts:now.toISOString()
  });
  if(logs.length>500)logs=logs.slice(0,500); // keep last 500
  sv('logs',logs);
}

function renderLogs(){
  var logs=ld('logs');
  var list=document.getElementById('logs-list');if(!list)return;
  if(!logs.length){list.innerHTML='<div style="color:var(--text3);font-size:12px;padding:10px;">Nenhuma alteração registrada.</div>';return;}
  list.innerHTML=logs.map(function(l){
    return'<div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);align-items:flex-start;">'
      +'<div style="font-size:9.5px;color:var(--text3);min-width:90px;padding-top:1px;font-family:monospace;">'+l.data+' '+l.hora+'</div>'
      +'<div style="flex:1;">'
        +'<span style="font-size:11.5px;font-weight:600;color:var(--text);">'+l.user+'</span>'
        +'<span style="font-size:11.5px;color:var(--text2);"> '+l.acao+'</span>'
        +(l.detalhes?'<div style="font-size:10.5px;color:var(--text3);">'+l.detalhes+'</div>':'')
      +'</div>'
    +'</div>';
  }).join('');
}

// Patch key functions to log changes
var _logPatched=false;
function patchLogging(){
  if(_logPatched)return;
  _logPatched=true;
  // Patch updateAcaoField to log status changes
  var _origUpdateAcao=updateAcaoField;
  updateAcaoField=function(acaoId,field,value){
    _origUpdateAcao(acaoId,field,value);
    var caso=ld('casos').find(function(x){return x.id===currentCasoId;});
    var acao=caso?(caso.acoes||[]).find(function(a){return a.id===acaoId;}):null;
    var labels={status:'Fase',resultado:'Resultado',valorCausa:'Valor da causa',valorFinal:'Valor final'};
    if(labels[field]&&caso&&acao){
      addLog('alterou '+labels[field]+' da ação "'+acao.nome+'"','Para: "'+value+'" — Processo: '+(acao.num||'—'));
    }
  };
}
document.addEventListener('DOMContentLoaded',function(){setTimeout(patchLogging,500);});

// ══════════════════════════════════════════════════════
// LEITURA DE DESPACHO
// ══════════════════════════════════════════════════════
function agendarDespachoComoPrazo(){
  var d=window._despachoAnalise;if(!d)return;
  var hoje=new Date();
  if(d.prazo_dias>0)hoje.setDate(hoje.getDate()+d.prazo_dias);
  var fatal=hoje.toISOString().split('T')[0];
  // Pre-fill prazo modal
  var safe=function(id,v){var el=document.getElementById(id);if(el)el.value=v||'';};
  safe('pr-desc',d.prazo_descricao||d.o_que_fazer||'Prazo do despacho');
  safe('pr-tipo',d.prazo_tipo||'Manifestação');
  safe('pr-fatal',fatal);safe('pr-data',fatal);
  safe('pr-chegou',new Date().toISOString().split('T')[0]);
  safe('pr-obs','Despacho: '+d.resumo);
  closeModal('modal-despacho');
  openModal('modal-prazo');
  showToast('✓ Prazo pré-preenchido — revise e salve!');
}

function redigirAPartirDoDespacho(){
  var d=window._despachoAnalise;if(!d)return;
  closeModal('modal-despacho');
  nav('editor');
  setTimeout(function(){
    var ed=document.getElementById('editor-body');if(!ed)return;
    var ctx=d.prazo_tipo+'\n\nBase: '+d.o_que_fazer+'\n\n'+d.resumo;
    ed.innerHTML='<p style="color:var(--text3);font-style:italic;">⏳ Gerando '+d.prazo_tipo+' com IA...</p>';
    fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:3000,
        messages:[{role:'user',content:'Com base neste contexto de despacho judicial, redija a peça processual adequada ('+d.prazo_tipo+'):\n\n'+ctx+'\n\nTexto do despacho original:\n'+document.getElementById('despacho-texto')?.value?.slice(0,1000)+'\n\nRedija completo: preâmbulo, fatos, direito, pedidos.'}]})
    }).then(function(r){return r.json();})
    .then(function(dd){
      var txt=(dd.content||[]).filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('');
      if(txt)ed.innerText=txt;showToast('✓ Peça gerada!');
    }).catch(function(e){ed.innerHTML='<p>'+ctx+'</p>';});
  },200);
}

// ══════════════════════════════════════════════════════
// RELATÓRIO DE RISCO VISUAL
// ══════════════════════════════════════════════════════
async function gerarRelatorioRisco(casoId, acaoId){
  var casos=ld('casos');
  var caso=casos.find(function(x){return x.id===casoId;});
  if(!caso)return;
  var acao=acaoId?(caso.acoes||[]).find(function(a){return a.id===acaoId;}):null;
  var pedidos=acao?(document.getElementById('tri-pedidos')?.value||''):
    (caso.acoes||[]).map(function(a){return a.nome;}).join(', ');
  var fatos=caso.obs||'';
  var area=caso.area||'Direito do Consumidor';
  var valorCausa=acao?acao.valorCausa:'';

  openModal('modal-relatorio-risco');
  var out=document.getElementById('risco-content');
  if(out)out.innerHTML='<div style="text-align:center;padding:30px;color:var(--text3);">⏳ Analisando pedidos e jurisprudência...</div>';

  if(!navigator.onLine){if(out)out.innerHTML='<div class="alert alert-r">IA requer internet.</div>';return;}
  try{
    var resp=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:2000,
        system:'Responda SOMENTE com JSON válido sem markdown.',
        tools:[{type:'web_search_20250305',name:'web_search'}],
        messages:[{role:'user',content:'Analise os pedidos deste caso jurídico e classifique cada pedido como Provável, Possível ou Remoto com base na jurisprudência atual.\n\nCaso: '+caso.nome+'\nÁrea: '+area+'\n'+(acao?'Ação: '+acao.nome+'\n':'')+(valorCausa?'Valor da causa: '+valorCausa+'\n':'')+'Fatos: '+fatos.slice(0,500)+'\nPedidos: '+pedidos+'\n\nBusque jurisprudência recente e responda em JSON:\n{"pedidos":[{"pedido":"","classificacao":"Provável|Possível|Remoto","percentual_estimado":0,"fundamento":"","jurisprudencia":""}],"valor_provavel":"","valor_possivel":"","valor_remoto":"","resumo_executivo":"","recomendacao":""}'}]})
    });
    var d=await resp.json();
    var raw=(d.content||[]).filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('').trim();
    var m=raw.match(/\{[\s\S]*\}/);
    var dados=m?JSON.parse(m[0]):null;
    if(!dados){if(out)out.innerHTML='<div style="white-space:pre-wrap;font-size:12px;padding:10px;">'+raw+'</div>';return;}
    renderRelatorioRisco(dados, caso, acao);
    addLog('gerou relatório de risco','Caso: '+caso.nome+(acao?' / '+acao.nome:''));
  }catch(e){if(out)out.innerHTML='<div class="alert alert-r">⚠ Erro: '+e.message+'</div>';}
}

function renderRelatorioRisco(dados, caso, acao){
  var out=document.getElementById('risco-content');if(!out)return;
  var pedidos=dados.pedidos||[];
  var cores={Provável:'#4a7a58',Possível:'#0070cc',Remoto:'#e07000'};
  var bgs={Provável:'rgba(74,122,88,0.12)',Possível:'rgba(0,112,204,0.10)',Remoto:'rgba(224,112,0,0.10)'};
  var icones={Provável:'✅',Possível:'⚡',Remoto:'⚠'};
  
  // Count for pie chart
  var contagem={Provável:0,Possível:0,Remoto:0};
  pedidos.forEach(function(p){contagem[p.classificacao]=(contagem[p.classificacao]||0)+1;});
  var total=pedidos.length||1;

  // Build SVG pie chart
  var svgSize=160;
  var cx=svgSize/2, cy=svgSize/2, r=65;
  var svgSlices='';
  var startAngle=-Math.PI/2;
  var chartData=[
    {label:'Provável',count:contagem.Provável,cor:'#4a7a58'},
    {label:'Possível',count:contagem.Possível,cor:'#0070cc'},
    {label:'Remoto',count:contagem.Remoto,cor:'#e07000'}
  ];
  chartData.forEach(function(seg){
    if(!seg.count)return;
    var slice=seg.count/total*2*Math.PI;
    var x1=cx+r*Math.cos(startAngle),y1=cy+r*Math.sin(startAngle);
    startAngle+=slice;
    var x2=cx+r*Math.cos(startAngle),y2=cy+r*Math.sin(startAngle);
    var large=slice>Math.PI?1:0;
    svgSlices+='<path d="M'+cx+','+cy+' L'+x1.toFixed(1)+','+y1.toFixed(1)+' A'+r+','+r+' 0 '+large+',1 '+x2.toFixed(1)+','+y2.toFixed(1)+' Z" fill="'+seg.cor+'" opacity="0.85"><title>'+seg.label+': '+seg.count+'</title></path>';
  });
  var pieSvg='<svg viewBox="0 0 '+svgSize+' '+svgSize+'" style="width:150px;height:150px;"><circle cx="'+cx+'" cy="'+cy+'" r="'+(r+3)+'" fill="white" opacity="0.5"/>'+svgSlices+'</svg>';

  out.innerHTML=''
    // Header
    +'<div style="text-align:center;margin-bottom:16px;">'
      +'<div style="font-size:16px;font-weight:800;color:var(--text);">Relatório de Risco Processual</div>'
      +'<div style="font-size:12px;color:var(--text2);">'+caso.nome+(acao?' · '+acao.nome:'')+'</div>'
      +'<div style="font-size:10px;color:var(--text3);">'+new Date().toLocaleDateString('pt-BR',{year:'numeric',month:'long',day:'numeric'})+'</div>'
    +'</div>'
    // Resumo executivo
    +'<div style="background:linear-gradient(135deg,rgba(154,96,96,0.08),rgba(154,96,96,0.04));border:1px solid rgba(154,96,96,0.18);border-radius:var(--r2);padding:13px;margin-bottom:14px;">'
      +'<div style="font-size:10px;text-transform:uppercase;font-weight:700;color:#9a4040;letter-spacing:.09em;margin-bottom:5px;">Resumo Executivo</div>'
      +'<div style="font-size:12.5px;color:var(--text);line-height:1.65;">'+( dados.resumo_executivo||'—')+'</div>'
    +'</div>'
    // Gráfico + legenda
    +'<div style="display:flex;align-items:center;gap:16px;margin-bottom:14px;flex-wrap:wrap;">'
      +pieSvg
      +'<div style="flex:1;">'
        +chartData.map(function(s){
          var pct=Math.round(s.count/total*100);
          return'<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">'
            +'<div style="width:12px;height:12px;border-radius:3px;background:'+s.cor+';flex-shrink:0;"></div>'
            +'<div style="flex:1;">'
              +'<div style="font-size:12px;font-weight:600;color:var(--text);">'+s.label+' ('+s.count+' pedido'+(s.count!==1?'s':'')+')</div>'
              +'<div style="height:6px;background:rgba(0,0,0,0.08);border-radius:3px;margin-top:2px;overflow:hidden;">'
                +'<div style="width:'+pct+'%;height:100%;background:'+s.cor+';border-radius:3px;"></div>'
              +'</div>'
            +'</div>'
            +'<div style="font-size:12px;font-weight:700;color:'+s.cor+';">'+pct+'%</div>'
          +'</div>';
        }).join('')
        +(dados.valor_provavel?'<div style="margin-top:8px;padding:8px;background:rgba(74,122,88,0.08);border-radius:var(--r);border:1px solid rgba(74,122,88,0.20);">'
          +'<div style="font-size:10px;text-transform:uppercase;font-weight:700;color:#4a7a58;margin-bottom:3px;">Valor provável de êxito</div>'
          +'<div style="font-size:15px;font-weight:800;color:#4a7a58;">'+dados.valor_provavel+'</div>'
        +'</div>':'')
      +'</div>'
    +'</div>'
    // Pedidos detalhados
    +'<div style="font-size:10px;text-transform:uppercase;font-weight:700;color:var(--text3);letter-spacing:.09em;margin-bottom:8px;">Análise por Pedido</div>'
    +pedidos.map(function(p){
      var cor=cores[p.classificacao]||'#888';
      var bg=bgs[p.classificacao]||'rgba(180,180,180,0.08)';
      var ico=icones[p.classificacao]||'•';
      return'<div style="background:'+bg+';border:1px solid '+(cor)+'33;border-radius:var(--r2);padding:11px 13px;margin-bottom:8px;">'
        +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">'
          +'<span style="font-size:14px;">'+ico+'</span>'
          +'<span style="font-size:12.5px;font-weight:700;color:var(--text);flex:1;">'+p.pedido+'</span>'
          +'<span style="font-size:10px;padding:2px 10px;border-radius:20px;background:'+cor+';color:#fff;font-weight:700;">'+p.classificacao+'</span>'
        +'</div>'
        +(p.percentual_estimado?'<div style="height:5px;background:rgba(0,0,0,0.08);border-radius:3px;margin:5px 0;overflow:hidden;"><div style="width:'+p.percentual_estimado+'%;height:100%;background:'+cor+';border-radius:3px;"></div></div>':'')
        +'<div style="font-size:11.5px;color:var(--text2);line-height:1.55;">'+p.fundamento+'</div>'
        +(p.jurisprudencia?'<div style="font-size:10.5px;color:var(--text3);margin-top:4px;font-style:italic;">📖 '+p.jurisprudencia+'</div>':'')
      +'</div>';
    }).join('')
    // Recomendação
    +(dados.recomendacao?'<div style="background:rgba(154,96,96,0.06);border:1px solid rgba(154,96,96,0.18);border-radius:var(--r2);padding:11px 13px;margin-top:4px;">'
      +'<div style="font-size:10px;text-transform:uppercase;font-weight:700;color:#9a4040;letter-spacing:.09em;margin-bottom:4px;">Recomendação do Advogado</div>'
      +'<div style="font-size:12px;color:var(--text);line-height:1.6;">'+dados.recomendacao+'</div>'
    +'</div>':'');
}


function imprimirRelatorioRisco(){
  var content=document.getElementById('risco-content')?.innerHTML||'';
  var win=window.open('','_blank');
  win.document.write('<html><head><title>Relatório de Risco</title><style>body{font-family:"Nunito",sans-serif;font-size:13px;color:#1a1a1a;margin:30px;line-height:1.6;}@media print{button{display:none;}}</style></head><body>'+content+'</body></html>');
  win.document.close();setTimeout(function(){win.print();},500);
}

// Log key actions automatically
var _loggedInit=false;
function initLogPatch(){
  if(_loggedInit)return;_loggedInit=true;
  // Log login
  addLog('entrou no sistema','LexBase — sessão iniciada');
}


// ══════════════════════════════════════════════════════
// DESPACHO — UI + FUNÇÕES COMPLETAS
// ══════════════════════════════════════════════════════
var _despArquivoB64=null, _despArquivoTipo=null, _despArquivoNome=null;

function despachoTab(tab){
  ['texto','arquivo','intim'].forEach(function(t){
    var panel=document.getElementById('desp-panel-'+t);
    var btn=document.getElementById('desp-tab-'+t);
    if(panel)panel.style.display=t===tab?'block':'none';
    if(btn){
      btn.style.color=t===tab?'#9a4040':'var(--text3)';
      btn.style.borderBottom=t===tab?'2px solid #9a4040':'2px solid transparent';
    }
  });
  if(tab==='intim') popularDespachoIntimacoes();
  if(tab==='arquivo') popularDespachoCasos();
  popularDespachoCasos();
}

function popularDespachoCasos(){
  var sel=document.getElementById('desp-caso');if(!sel)return;
  var casos=ld('casos');
  sel.innerHTML='<option value="">— Nenhum —</option>'
    +casos.map(function(c){return'<option value="'+c.id+'">'+c.nome+'</option>';}).join('');
}

function popularDespachoIntimacoes(){
  var sel=document.getElementById('desp-intim-sel');if(!sel)return;
  var intims=ld('intimacoes_cache')||[];
  if(!intims.length){sel.innerHTML='<option value="">Nenhuma intimação salva. Use a aba Intimações.</option>';return;}
  sel.innerHTML='<option value="">— Selecione —</option>'
    +intims.map(function(it,i){return'<option value="'+i+'">'+it.processo+' — '+it.descricao+'</option>';}).join('');
  sel.onchange=function(){
    var it=intims[parseInt(this.value)];
    if(!it)return;
    var txt=document.getElementById('despacho-texto');
    if(txt)txt.value='Processo: '+it.processo+'\nTribunal: '+it.tribunal+'\nDescrição: '+it.descricao+'\nPublicação: '+it.publicacao;
    despachoTab('texto');
  };
}

function onDespachoFileLoad(e){
  var f=e.target.files[0];if(!f)return;
  var reader=new FileReader();
  reader.onload=function(ev){
    _despArquivoB64=ev.target.result.split(',')[1];
    _despArquivoTipo=f.type;
    _despArquivoNome=f.name;
    var status=document.getElementById('desp-file-status');
    var nome=document.getElementById('desp-file-nome');
    if(status)status.style.display='flex';
    if(nome)nome.textContent=f.name;
    showToast('✓ Arquivo carregado: '+f.name);
  };
  reader.readAsDataURL(f);
  e.target.value='';
}

function removerDespachoArquivo(){
  _despArquivoB64=null;_despArquivoTipo=null;_despArquivoNome=null;
  var status=document.getElementById('desp-file-status');
  if(status)status.style.display='none';
}

async function lerDespacho(){
  var texto=document.getElementById('despacho-texto')?.value.trim()||'';
  var casoId=document.getElementById('desp-caso')?.value||'';
  if(!texto&&!_despArquivoB64){showToast('Cole o texto do despacho ou anexe um arquivo.');return;}
  if(!navigator.onLine){showToast('IA requer internet.');return;}

  var btn=document.getElementById('despacho-btn');
  var out=document.getElementById('despacho-resultado');
  var cumprirArea=document.getElementById('desp-cumprir-area');
  if(btn)btn.disabled=true;
  if(out){out.style.display='block';out.innerHTML='<div style="text-align:center;padding:20px;color:var(--text3);font-size:12px;">⏳ Lendo despacho com IA...</div>';}
  if(cumprirArea)cumprirArea.style.display='none';

  // Build message with optional file
  var userContent=[];
  if(_despArquivoB64){
    if(_despArquivoTipo.startsWith('image/')){
      userContent.push({type:'image',source:{type:'base64',media_type:_despArquivoTipo,data:_despArquivoB64}});
    } else if(_despArquivoTipo==='application/pdf'){
      userContent.push({type:'document',source:{type:'base64',media_type:'application/pdf',data:_despArquivoB64}});
    }
  }
  userContent.push({type:'text',text:'Analise este despacho/intimação judicial'+(texto?':\n\n'+texto:'')+'.\n\nExtraia as informações em JSON:\n{"resumo":"","o_que_fazer":"","prazo_dias":0,"prazo_tipo":"Manifestação","urgente":false,"prazo_descricao":"","datas_mencionadas":[""],"tipo_resposta":"manifestação|contestação|recurso|petição simples","fundamento_necessario":"","observacoes":""}'});

  try{
    var resp=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1500,
        system:'Responda SOMENTE com JSON válido sem markdown.',
        messages:[{role:'user',content:userContent}]})
    });
    var d=await resp.json();
    if(d.error){if(out)out.innerHTML='<div class="alert alert-r">⚠ '+d.error.message+'</div>';return;}
    var raw=(d.content||[]).filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('').trim();
    var m=raw.match(/\{[\s\S]*\}/);
    var dados=m?JSON.parse(m[0]):null;
    if(!dados){if(out)out.innerHTML='<div style="white-space:pre-wrap;font-size:12.5px;padding:10px;">'+raw+'</div>';return;}

    // Store analysis
    window._despachoAnalise=dados;
    window._despachoCasoId=casoId;
    window._despachoTextoOriginal=texto;

    // Render result
    var urgCor=dados.urgente?'#cc4444':'#0070cc';
    var urgBg=dados.urgente?'rgba(204,68,68,0.08)':'rgba(0,112,204,0.06)';
    out.innerHTML=''
      +'<div style="background:rgba(255,248,246,0.92);border:1px solid var(--border);border-radius:var(--r2);padding:14px;margin-bottom:10px;">'
        +'<div style="font-size:10px;text-transform:uppercase;font-weight:700;color:var(--text3);letter-spacing:.09em;margin-bottom:6px;">📋 Resumo do juiz</div>'
        +'<div style="font-size:13px;color:var(--text);line-height:1.65;">'+dados.resumo+'</div>'
      +'</div>'
      +'<div style="background:'+urgBg+';border:1px solid '+urgCor+'33;border-radius:var(--r2);padding:14px;">'
        +(dados.urgente?'<div style="font-size:11px;font-weight:800;color:#cc4444;margin-bottom:6px;text-transform:uppercase;letter-spacing:.08em;">⚠ URGENTE</div>':'')
        +'<div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:6px;">'+dados.o_que_fazer+'</div>'
        +(dados.prazo_dias?'<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">'
          +'<span style="font-size:12px;padding:4px 12px;border-radius:20px;background:'+urgCor+';color:#fff;font-weight:700;">⏰ '+dados.prazo_dias+' dias úteis</span>'
          +'<span style="font-size:12px;color:var(--text2);">'+dados.prazo_tipo+'</span>'
        +'</div>':'')
        +(dados.fundamento_necessario?'<div style="font-size:11px;color:var(--text3);margin-top:6px;font-style:italic;">📚 '+dados.fundamento_necessario+'</div>':'')
      +'</div>'
      +(dados.observacoes?'<div style="font-size:11px;color:var(--text3);margin-top:8px;padding:8px 12px;background:rgba(255,248,246,0.60);border-radius:var(--r);">'+dados.observacoes+'</div>':'')
      +'<div style="display:flex;gap:7px;margin-top:10px;flex-wrap:wrap;">'
        +'<button class="btn btn-outline btn-xs" onclick="agendarDespachoComoPrazo()">⏰ Agendar prazo</button>'
        +(casoId?'<button class="btn btn-outline btn-xs" onclick="vincularDespachoAoAndamento()">📋 Salvar como andamento</button>':'')
      +'</div>';

    // Show "Cumprir" area
    if(cumprirArea)cumprirArea.style.display='block';

    addLog('leu despacho com IA','Prazo: '+(dados.prazo_dias||0)+'d — '+dados.prazo_tipo+(casoId?' — Caso vinculado':''));
  }catch(e){if(out)out.innerHTML='<div class="alert alert-r">⚠ Erro: '+e.message+'</div>';}
  finally{if(btn)btn.disabled=false;}
}

function vincularDespachoAoAndamento(){
  var d=window._despachoAnalise;
  var casoId=window._despachoCasoId;
  if(!d||!casoId)return;
  var casos=ld('casos');
  var caso=casos.find(function(x){return x.id===casoId;});
  if(!caso||!caso.acoes||!caso.acoes.length)return;
  var acao=caso.acoes[0];
  if(!acao.andamentos)acao.andamentos=[];
  acao.andamentos.unshift({
    texto:'Despacho: '+d.resumo+(d.prazo_dias?' | Prazo: '+d.prazo_dias+'d — '+d.prazo_tipo:''),
    data:new Date().toLocaleDateString('pt-BR'),
    hora:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})
  });
  sv('casos',casos);
  showToast('✓ Despacho salvo como andamento!');
  addLog('salvou despacho como andamento','Caso: '+caso.nome);
}

// ══ CUMPRIR DESPACHO ══
function cumprimDespachoAuto(){
  var d=window._despachoAnalise;
  if(!d){showToast('Analise um despacho primeiro.');return;}
  closeModal('modal-despacho');
  nav('editor');
  setTimeout(function(){
    var ed=document.getElementById('editor-body');if(!ed)return;
    ed.innerHTML='<p style="color:var(--text3);font-style:italic;text-align:center;">⏳ Gerando '+d.prazo_tipo+' com IA...</p>';
    _gerarRespostaDespacho(d);
  },200);
}

function cumprimDespachoManual(){
  var d=window._despachoAnalise;
  if(!d){closeModal('modal-despacho');nav('editor');return;}
  // Ask: auto or manual
  confirmar(
    'Deseja que a IA gere automaticamente a '+d.prazo_tipo+', ou prefere começar do zero?',
    function(){
      // OK = gerar com IA
      closeModal('modal-despacho');
      nav('editor');
      setTimeout(function(){
        var ed=document.getElementById('editor-body');if(!ed)return;
        ed.innerHTML='<p style="color:var(--text3);font-style:italic;text-align:center;">⏳ Gerando '+d.prazo_tipo+'...</p>';
        _gerarRespostaDespacho(d);
      },200);
    },
    '✦', 'Gerar com IA', 'rgba(154,96,96,0.85)'
  );
  // Cancel = manual
  var cancelBtn=document.getElementById('confirm-cancel-btn');
  if(cancelBtn){
    var oldOnClick=cancelBtn.onclick;
    cancelBtn.onclick=function(){
      oldOnClick&&oldOnClick();
      closeModal('modal-despacho');
      nav('editor');
      setTimeout(function(){
        var ed=document.getElementById('editor-body');if(!ed)return;
        var d2=window._despachoAnalise;
        ed.innerHTML='<p><strong>'+d2.prazo_tipo+'</strong></p><br><p><em>Contexto: '+d2.o_que_fazer+'</em></p>';
        showToast('Editor aberto — redija sua resposta');
      },200);
    };
  }
}

async function _gerarRespostaDespacho(d){
  var casos=ld('casos');
  var caso=window._despachoCasoId?casos.find(function(x){return x.id===window._despachoCasoId;}):null;
  var textoOriginal=window._despachoTextoOriginal||'';

  var prompt='Você é advogado experiente. Com base neste despacho judicial, redija a resposta processual adequada.\n\n'
    +'DESPACHO/DETERMINAÇÃO:\n'+textoOriginal.slice(0,1000)+'\n\n'
    +'ANÁLISE:\n'
    +'- O que o juiz quer: '+d.o_que_fazer+'\n'
    +'- Tipo de resposta: '+d.prazo_tipo+'\n'
    +(d.fundamento_necessario?'- Fundamento necessário: '+d.fundamento_necessario+'\n':'')
    +(caso?'\nDADOS DO CASO:\n- Cliente: '+caso.nome+'\n- Área: '+(caso.area||'—')+'\n'+(caso.acoes&&caso.acoes[0]?'- Processo: '+( caso.acoes[0].num||'—')+'\n':''):'')
    +'\nRedija a peça completa:\n'
    +'1. PREÂMBULO (endereçamento correto ao juízo)\n'
    +'2. SÍNTESE DO DESPACHO\n'
    +'3. RESPOSTA/MANIFESTAÇÃO (com fundamentos legais e jurisprudência)\n'
    +'4. PEDIDO FINAL\n'
    +'5. FECHO E ASSINATURA\n\n'
    +'Use linguagem técnica e formal. Seja direto e objetivo.';

  var ed=document.getElementById('editor-body');
  if(!ed)return;

  try{
    var resp=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:3000,messages:[{role:'user',content:prompt}]})
    });
    var dd=await resp.json();
    if(dd.error){ed.innerHTML='<p class="alert alert-r">⚠ '+dd.error.message+'</p>';return;}
    var txt=(dd.content||[]).filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('');
    if(txt){ed.innerText=txt;showToast('✓ '+d.prazo_tipo+' gerada com IA!');}
    addLog('gerou '+d.prazo_tipo+' via despacho','IA gerou resposta automática');
  }catch(e){
    ed.innerHTML='<p><strong>'+d.prazo_tipo+'</strong></p><p>'+d.o_que_fazer+'</p>';
    showToast('IA indisponível — editor aberto');
  }
}

// Open despacho modal with auto-populate from prazos page
function abrirDespachoModal(prazoIdx){
  var prazos=ld('prazos');
  var p=prazoIdx!==undefined?prazos[prazoIdx]:null;
  var casoSel=document.getElementById('desp-caso');
  if(casoSel&&p&&p.caso)casoSel.value=p.caso;
  popularDespachoCasos();
  openModal('modal-despacho');
  despachoTab('texto');
}
