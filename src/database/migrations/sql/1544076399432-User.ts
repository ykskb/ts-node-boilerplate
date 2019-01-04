import { MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class User1544076399432 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        const table = new Table({
            name: 'user',
            columns: [
                {
                    name: 'id',
                    type: 'bigint',
                    isPrimary: true,
                    isNullable: false,
                    unsigned: true
                }, {
                    name: 'username',
                    type: 'varchar',
                    length: '127',
                    isPrimary: false,
                    isNullable: false,
                    isUnique: true
                }, {
                    name: 'email',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: false,
                    isUnique: true
                }, {
                    name: 'password',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: false
                }, {
                    name: 'phone_number',
                    type: 'varchar',
                    length: '127',
                    isPrimary: false,
                    isNullable: false,
                    isUnique: true
                }, {
                    name: 'roleId',
                    type: 'int',
                    length: '127',
                    isPrimary: false,
                    isNullable: false,
                    unsigned: true
                }
            ],
        });
        await queryRunner.createTable(table);

        await queryRunner.createForeignKey("user", new TableForeignKey({
            columnNames: ["roleId"],
            referencedColumnNames: ["id"],
            referencedTableName: "role"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropTable('user');
    }

}
