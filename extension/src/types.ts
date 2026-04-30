interface BookmarkCapture {
  url: string;
  platform: "x" | "youtube";
  title: string;
  author: string;
  thumbnail_url?: string;
  topic_id?: string;
  reminder_at?: string;
}

interface Topic {
  id: string;
  name: string;
}

type MessageType =
  | { type: "BOOKMARK_CAPTURED"; data: BookmarkCapture }
  | { type: "SAVE_BOOKMARK"; data: BookmarkCapture }
  | { type: "GET_TOPICS" }
  | { type: "TOPICS_RESPONSE"; topics: Topic[] }
  | { type: "AUTH_STATUS" }
  | { type: "AUTH_STATUS_RESPONSE"; loggedIn: boolean; email?: string; savesToday?: number };
