export enum CacheKey {
  SESSION_BLACKLIST = 'auth:session-blacklist:%s', // %s: sessionId
  EMAIL_VERIFICATION = 'auth:token:%s:email-verification', // %s: userId
  FORGOT_PASSWORD = 'auth:token:%s:forgot-password', // %s: userId
  PASSWORD_RESET = 'auth:token:%s:password', // %s: userId
}
