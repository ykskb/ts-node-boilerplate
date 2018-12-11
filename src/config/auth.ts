
export const authConfig = {
    sessionCookieName: process.env.SESSION || 'PROJ_SESSION',
    jwtSecret: process.env.JWT_SECRET || "proj_secret",
    sessionKey: 'session',
    tokenArg: 'token',
    headerArg: 'authorization'
}