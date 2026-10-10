const PLATFORMS = {
  xiaohongshu: {name:"小红书", origin:"https://creator.xiaohongshu.com"},
  rednote: {name:"Rednote", origin:"https://creator.rednote.com"}
};
const NOTE_PATH = "/new/note-manager";
const MODE_KEY = "xhs-analytics:platform";
let mode = "xiaohongshu";
try {
  if (localStorage.getItem(MODE_KEY) === "rednote") mode = "rednote";
} catch (_) {}
const message = document.querySelector("#message");
function renderPlatform() {
  const platform = PLATFORMS[mode];
  const next = mode === "xiaohongshu" ? "rednote" : "xiaohongshu";
  document.querySelector("#platform").textContent = `当前：${platform.name}`;
  document.querySelector("#switch-label").textContent = `切换为 ${PLATFORMS[next].name}`;
  const link = document.querySelector("#note-page");
  link.href = platform.origin + NOTE_PATH;
  link.textContent = `打开${platform.name}笔记管理`;
}
document.querySelector("#switch-platform").addEventListener("click", () => {
  mode = mode === "xiaohongshu" ? "rednote" : "xiaohongshu";
  message.textContent = "";
  try { localStorage.setItem(MODE_KEY, mode); }
  catch (_) { message.textContent = "模式已切换，但未能保存，下次打开需重新选择。"; }
  renderPlatform();
});
renderPlatform();
document.querySelector("#start").addEventListener("click", async () => {
  let tab;
  try { [tab] = await chrome.tabs.query({active:true,currentWindow:true}); }
  catch (_) { message.textContent = "无法读取当前标签页，请重新打开扩展。"; return; }
  const platform = PLATFORMS[mode];
  let url;
  try { url = new URL(tab?.url); } catch (_) {}
  if (!tab?.id || !url || url.origin !== platform.origin ||
      (url.pathname !== NOTE_PATH && !url.pathname.startsWith(`${NOTE_PATH}/`))) {
    message.textContent = `当前为${platform.name}模式，请先打开${platform.name}笔记管理页。`;
    return;
  }
  try {
    await chrome.tabs.sendMessage(tab.id,{type:"XHS_OPEN_PANEL"});
    window.close();
  } catch {
    message.textContent = "页面脚本尚未就绪，请刷新笔记管理页后重试。";
  }
});
