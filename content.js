(() => {
  if (window.__XHS_ANALYTICS_CONTENT__) return;
  window.__XHS_ANALYTICS_CONTENT__ = true;
  const fmt = new Intl.NumberFormat("zh-CN");
  let root;
  let latestResult = null;
  const esc = value => String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function shell(){
    root?.remove(); root=document.createElement("aside"); root.id="xhs-analytics-panel";
    latestResult=null;
    root.innerHTML=`<header><b>XHS Creator Analytics</b><button data-close aria-label="关闭">×</button></header><main><div class="xhs-state"><span class="xhs-spinner"></span><p>正在读取笔记总数…</p><small>请保持此页面打开</small></div></main>`;
    document.documentElement.append(root); root.querySelector("[data-close]").onclick=()=>root.remove();
  }
  function progress(d){const state=root?.querySelector(".xhs-state");if(state)state.innerHTML=d.expected?`<span class="xhs-spinner"></span><p>正在统计全部笔记</p><strong>共 ${fmt.format(d.expected)} 篇，已统计 ${fmt.format(d.unique)} 篇</strong>`:`<span class="xhs-spinner"></span><p>正在读取笔记总数…</p><small>请保持此页面打开</small>`}
  function exportAll(){
    if(!latestResult?.notes?.length)return;
    const notes=window.XhsXlsx.sortNotes(latestResult.notes);
    const rows=notes.map(n=>[n.id,n.title,n.time,n.type,n.views,n.likes,n.collections,n.comments,n.shares]);
    const url=URL.createObjectURL(window.XhsXlsx.create(rows));
    const a=document.createElement("a");a.href=url;a.download=`小红书创作者全部笔记-${new Date().toISOString().slice(0,10)}.xlsx`;a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function complete(r){
    latestResult=r;
    const t=r.totals; const cards=[["浏览量",t.views],["点赞",t.likes],["收藏",t.collections],["评论",t.comments],["转发",t.shares]];
    root.querySelector("main").innerHTML=`<div class="xhs-summary"><div><span>共 ${fmt.format(r.count)} 篇笔记</span>${r.expected&&r.expected!==r.count?`<em>页面显示 ${fmt.format(r.expected)} 篇，结果可能不完整</em>`:`<em>统计完成</em>`}</div><button data-export>导出全部数据</button></div><section class="xhs-cards">${cards.map(([k,v])=>`<div><small>${k}</small><strong>${fmt.format(v)}</strong></div>`).join("")}</section><h2>浏览量 Top 10</h2><div class="xhs-table"><table><colgroup><col class="rank"><col class="note"><col class="views"><col class="metric"><col class="metric"><col class="metric"><col class="metric"></colgroup><thead><tr><th>#</th><th>笔记</th><th>浏览量</th><th>点赞</th><th>收藏</th><th>评论</th><th>转发</th></tr></thead><tbody>${r.top.map((n,i)=>`<tr><td>${i+1}</td><td title="${esc(n.title)}"><b>${esc(n.title)}</b><small>${esc(n.time)}</small></td><td>${fmt.format(n.views)}</td><td>${fmt.format(n.likes)}</td><td>${fmt.format(n.collections)}</td><td>${fmt.format(n.comments)}</td><td>${fmt.format(n.shares)}</td></tr>`).join("")}</tbody></table></div>`;
    root.querySelector("[data-export]").onclick=exportAll;
  }
  function fail(text){root.querySelector("main").innerHTML=`<div class="xhs-error"><b>获取失败</b><p>${esc(text)}</p><small>请确认已登录并刷新笔记管理页。若仍失败，请截图此提示反馈。</small><button data-retry>重新尝试</button></div>`;root.querySelector("[data-retry]").onclick=start}
  function start(){shell();window.dispatchEvent(new CustomEvent("xhs-analytics:start"))}
  window.addEventListener("xhs-analytics:result",e=>{const d=e.detail;if(!root||!d)return;if(!d.ok)return fail(d.error);if(d.phase==="progress")progress(d);if(d.phase==="complete")complete(d.result)});
  chrome.runtime.onMessage.addListener((m,_s,send)=>{if(m?.type==="XHS_OPEN_PANEL"){start();send({ok:true})}});
})();
