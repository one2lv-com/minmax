import path from "path";
export const config = {
  appName: 'one2lvos_v4',
  openAiKey: process.env.OPENAI_API_KEY || '',
  openAiModel: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
  googleDriveEnabled: String(process.env.GOOGLE_DRIVE_ENABLED || 'false') === 'true',
  googleDriveCredentials: process.env.GOOGLE_DRIVE_CREDENTIALS || 'backend/credentials.json',
  moltbookEnabled: String(process.env.MOLTBOOK_ENABLED || 'true') === 'true',
  moltbookApiKey: process.env.MOLTBOOK_API_KEY || '',
  moltbookBaseUrl: process.env.MOLTBOOK_BASE_URL || 'https://www.moltbook.com/api/v1',
  allowShell: String(process.env.ALLOW_SHELL || 'true') === 'true',
  workspaceRoot: path.resolve(process.cwd(), process.env.WORKSPACE_ROOT || 'workspace'),
  jwtSecret: process.env.JWT_SECRET || 'change_me_now',
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || '',
  sessionTtlHours: Number(process.env.SESSION_TTL_HOURS || 12),
  bootProfile: process.env.BOOT_PROFILE || 'recovery'
};
