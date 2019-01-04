
export const appConfig = {
    appName: process.env.APP_NAME || 'PROJ',
    appDomain: process.env.APP_DOMAIN || 'project.com',
    accessModules: {
        endUser: 'end_user',
        adminIndex: 'admin_index'
    }
}