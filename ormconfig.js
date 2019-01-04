module.exports = [
    {
        "name": "mysql",
        "type": process.env.DB_MYSQL_TYPE,
        "synchronize": false,
        "host": process.env.DB_MYSQL_HOST,
        "port": process.env.DB_MYSQL_PORT,
        "username": process.env.DB_MYSQL_USERNAME,
        "password": process.env.DB_MYSQL_PASSWORD,
        "database": process.env.DB_MYSQL_DATABASE,
        "entities": [
            "dist/entities/sql/**/*.js"
        ],
        "migrations": [
            "dist/database/migrations/sql/**/*.js"
        ],
        "factories": [
            "dist/database/factories/sql/**/*.js"
        ]
    }
]