chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the tab has completed loading and the URL is available
  if (changeInfo.status === "complete" && tab.url && tab.url.includes("youtube.com/watch")) {
    try {
      const queryParameters = tab.url.split("?")[1];
      const urlParameters = new URLSearchParams(queryParameters);

      // Extract videoId and ensure it's valid
      const videoId = urlParameters.get("v");
      if (videoId) {
        chrome.tabs.sendMessage(tabId, {
          type: "NEW",
          videoId: videoId,
        });
        console.log("Message sent to content script:", { videoId });
      } else {
        console.warn("No videoId found in URL");
      }
    } catch (error) {
      console.error("Error parsing tab URL or sending message:", error);
    }
  }
});
