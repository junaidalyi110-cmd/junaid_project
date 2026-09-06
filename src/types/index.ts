export type Database = {
  public: {
    Tables: {
      videos: {
        Row: {
          id: string;
          title: string;
          video_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          video_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          video_url?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      buttons: {
        Row: {
          id: string;
          video_id: string;
          label: string;
          url: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          video_id: string;
          label: string;
          url: string;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          video_id?: string;
          label?: string;
          url?: string;
          position?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "buttons_video_id_fkey";
            columns: ["video_id"];
            isOneToOne: false;
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Video = Database["public"]["Tables"]["videos"]["Row"];
export type ActionButton = Database["public"]["Tables"]["buttons"]["Row"];

export type VideoWithButtons = Video & {
  buttons: ActionButton[];
};

export type EditableActionButton = Pick<ActionButton, "label" | "url"> & {
  id?: string;
  clientId: string;
};
