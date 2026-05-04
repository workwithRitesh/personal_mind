export async function getYouTubeTranscript(url: string) {
  try {
    const response = await fetch(`/api/youtube-transcript?url=${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error("Transcript fetch failed");
    const transcript = await response.json();
    return transcript.map((t: any) => t.text).join(' ');
  } catch (error) {
    console.error("Transcript fetch failed:", error);
    throw error;
  }
}

function extractVideoId(url: string) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}
