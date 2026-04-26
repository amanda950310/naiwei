// ==============================================
// 【真正可上线】远程+本地双备份视频数据管理器
// 所有人访问看到同一数据，后台修改全网同步
// ==============================================
let videoData = [];
const LOCAL_STORAGE_KEY = "videoListData";

// ========== 已帮你填好所有配置 ==========
const CONFIG = {
  BIN_ID: "69ee197eaaba8821973c91e5",
  MASTER_KEY: "$2a$10$LKCYSe1IY7.aVYVJIjpsn.kIL5VhWlYPUpIqzfXKlp7H9pFXyT2LC",
  ACCESS_KEY: "$2a$10$4shKFwvieqjhMlrI.2wiwO8w2tYDZxMX3BbJPGNWWuWREWIzEHfca"
};

// ==============================================
// 同步数据（优先远程）
// ==============================================
async function syncVideoData() {
  try {
    let remoteData = await fetchRemoteData();
    if (remoteData && Array.isArray(remoteData)) {
      videoData = remoteData;
      saveLocalVideoList(remoteData);
      return remoteData;
    }
  } catch (e) {}

  try {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      videoData = JSON.parse(local);
      return videoData;
    }
  } catch (e) {}

  videoData = [];
  return videoData;
}

// ==============================================
// 从远程拉取数据
// ==============================================
async function fetchRemoteData() {
  try {
    const res = await fetch(
      `https://api.jsonbin.io/v3/b/${CONFIG.BIN_ID}/latest`,
      {
        headers: {
          "X-Master-Key": CONFIG.MASTER_KEY,
          "X-Access-Key": CONFIG.ACCESS_KEY
        }
      }
    );
    const json = await res.json();
    // 👇 这里已经帮你改成兼容 {"list":[]} 格式
    return json.record?.list || [];
  } catch (e) {
    return null;
  }
}

// ==============================================
// 保存到远程（真正全网同步）
// ==============================================
async function saveRemoteVideoList(list) {
  if (!list) return;
  videoData = list;
  saveLocalVideoList(list);

  try {
    await fetch(`https://api.jsonbin.io/v3/b/${CONFIG.BIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": CONFIG.MASTER_KEY,
        "X-Access-Key": CONFIG.ACCESS_KEY
      },
      // 👇 保存时也自动适配 {"list":[]}
      body: JSON.stringify({ list: list })
    });
  } catch (e) {}
}

// ==============================================
// 本地备份
// ==============================================
function saveLocalVideoList(list) {
  videoData = list;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {}
}

// 初始化
syncVideoData();