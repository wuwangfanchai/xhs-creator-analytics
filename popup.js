const TARGET = "https://creator.xiaohongshu.com/new/note-manager";
const message = document.querySelector("#message");
document.querySelector("#start").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
  if (!tab?.id || !tab.url?.startsWith(TARGET)) {
    message.textContent = "请先打开笔记管理页面。";
    return;
  }
  try {
    await chrome.tabs.sendMessage(tab.id,{type:"XHS_OPEN_PANEL"});
    window.close();
  } catch {
    message.textContent = "页面脚本尚未就绪，请刷新笔记管理页后重试。";
  }
});
