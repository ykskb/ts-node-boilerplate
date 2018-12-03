module.exports = [
    {
        "name": "mysql",
        "type": "mysql",
        "synchronize": true,
        "host": process.env.DB_MYSQL_HOST,
        "port": process.env.DB_MYSQL_PORT,
        "username": process.env.DB_MYSQL_USERNAME,
        "password": process.env.DB_MYSQL_PASSWORD,
        "database": process.env.DB_MYSQL_DATABASE,
        "entities": [
            "dist/entities/**/*.js"
        ],
        "migrations": [
            "dist/database/migrations/**/*.ts"
        ],
        "factories": [
            "dist/database/factories/**/*.ts"
        ]
    }
]