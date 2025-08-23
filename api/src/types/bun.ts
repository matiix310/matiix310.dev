declare module "bun" {
  interface Env {
    HOST?: string;
    PORT?: number;
    DOWNLOADS_FOLDER?: string;
    MUSICS_FOLDER?: string;
    LOGS_FOLDER?: string;
    BASE_FOLDER?: string;
    BACKEND_BASE_FOLDER?: string;
  }
}
