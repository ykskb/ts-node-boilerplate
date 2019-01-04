import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class Role1544076366639 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        const table = new Table({
            name: 'role',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isNullable: false,
                    unsigned: true
                }, {
                    name: 'name',
                    type: 'varchar',
                    length: '127',
                    isPrimary: false,
                    isNullable: false,
                    isUnique: true
                }
            ],
        });
        await queryRunner.createTable(table);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropTable('role');
    }

}
