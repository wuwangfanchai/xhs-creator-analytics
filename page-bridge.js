(() => {
  if (window.__XHS_ANALYTICS_BRIDGE__) return;
  window.__XHS_ANALYTICS_BRIDGE__ = true;
  const API = "/api/galaxy/v2/creator/note/user/posted";
  const emit = (detail) => window.dispatchEvent(new CustomEvent("xhs-analytics:result", {detail}));
  const number = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;

  async function requestPage(page, signal) {
    const path = `${API}?tab=0&page=${encodeURIComponent(page)}`;
    const headers = {Accept:"application/json, text/plain, */*"};
    // Some creator-platform builds expose the same signer used by their request layer.
    // Prefer it when available; otherwise try the normal same-origin authenticated request.
    if (typeof window._webmsxyw === "function") {
      try {
        let signed = await window._webmsxyw(path, undefined);
        if (typeof signed === "string") {
          try { signed = JSON.parse(signed); } catch (_) {}
        }
        if (signed && typeof signed === "object") Object.assign(headers, signed);
      } catch (_) {}
    }
    const response = await fetch(path,{method:"GET",credentials:"include",headers,signal,cache:"no-store"});
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (!body || body.code !== 0 || body.success === false) throw new Error(body?.msg || "接口返回异常");
    if (!body.data || !Array.isArray(body.data.notes)) throw new Error("接口数据结构已变化");
    return body.data;
  }

  async function collect() {
    const controller = new AbortController();
    window.__XHS_ANALYTICS_ABORT__?.abort();
    window.__XHS_ANALYTICS_ABORT__ = controller;
    const unique = new Map();
    const visited = new Set();
    let page = 0;
    let expected = null;
    for (let round=0; round<500; round++) {
      if (visited.has(String(page))) throw new Error(`分页游标重复：${page}`);
      visited.add(String(page));
      emit({ok:true,phase:"progress",page,unique:unique.size,expected});
      const data = await requestPage(page,controller.signal);
      for (const tag of data.tags || []) if (tag?.id === "special.note_time_desc") expected = number(tag.notes_count) || expected;
      for (const note of data.notes) if (note?.id) unique.set(String(note.id), note);
      const next = data.page;
      emit({ok:true,phase:"progress",page,unique:unique.size,expected});
      if (!data.notes.length || String(next) === "-1") break;
      if (next === undefined || next === null || next === "") throw new Error("响应缺少下一页游标");
      page = next;
    }
    const notes = [...unique.values()].map(n => ({
      id:String(n.id), title:String(n.display_title || "（无标题）"), time:String(n.time || ""),
      timestamp:number(n.visible_time), type:String(n.type || ""),
      views:number(n.view_count), likes:number(n.likes), collections:number(n.collected_count),
      comments:number(n.comments_count), shares:number(n.shared_count)
    })).sort((a,b) => b.timestamp-a.timestamp || b.time.localeCompare(a.time));
    const sum = key => notes.reduce((total,n) => total+n[key],0);
    emit({ok:true,phase:"complete",result:{count:notes.length,expected,notes,totals:{views:sum("views"),likes:sum("likes"),collections:sum("collections"),comments:sum("comments"),shares:sum("shares")},top:[...notes].sort((a,b)=>b.views-a.views).slice(0,10)}});
  }

  window.addEventListener("xhs-analytics:start", () => collect().catch(error => emit({ok:false,phase:"error",error:error?.name === "AbortError" ? "任务已取消" : String(error?.message || error)})));
})();
