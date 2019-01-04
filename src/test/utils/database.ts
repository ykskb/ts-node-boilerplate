
import { Connection } from 'typeorm';

export const synchronizeDatabase = async (connection: Connection) => {
    await connection.dropDatabase();
    return connection.synchronize(true);
};

export const migrateDatabase = async (connection: Connection) => {
    await connection.dropDatabase();
    return connection.runMigrations();
};

export const closeDatabase = (connection: Connection) => {
    return connection.close();
};