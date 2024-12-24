(() => {
  let youtubeLeftControls, youtubePlayer;
  let currentVideo = "";
  let currentVideoBookmarks = [];

  const fetchBookmarks = () => {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get([currentVideo], (obj) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
        }
      });
    });
  };

  const addNewBookmarkEventHandler = async () => {
    const currentTime = youtubePlayer.currentTime;
    const newBookmark = {
      time: currentTime,
      desc: "Bookmark at " + getTime(currentTime),
    };

    try {
      currentVideoBookmarks = await fetchBookmarks();
      chrome.storage.sync.set({
        [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
      });
      console.log("Bookmark added:", newBookmark);
    } catch (error) {
      console.error("Error adding bookmark:", error);
    }
  };

  const newVideoLoaded = async () => {
    try {
      const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
      currentVideoBookmarks = await fetchBookmarks();

      if (!bookmarkBtnExists) {
        const bookmarkBtn = document.createElement("img");

        bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
        bookmarkBtn.className = "ytp-button " + "bookmark-btn";
        bookmarkBtn.title = "Click to bookmark current timestamp";

        youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
        youtubePlayer = document.getElementsByClassName('video-stream')[0];

        youtubeLeftControls.appendChild(bookmarkBtn);
        bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
        console.log("Bookmark button added.");
      }
    } catch (error) {
      console.error("Error loading new video:", error);
    }
  };

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value, videoId } = obj;

    switch (type) {
      case "NEW":
        currentVideo = videoId;
        newVideoLoaded();
        break;
      case "PLAY":
        youtubePlayer.currentTime = value;
        break;
      case "DELETE":
        currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value);
        chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
        response(currentVideoBookmarks);
        break;
      default:
        console.warn("Unknown message type:", type);
    }
  });

  const getTime = (t) => {
    const date = new Date(0);
    date.setSeconds(t);
    return date.toISOString().substr(11, 8);
  };
})();
