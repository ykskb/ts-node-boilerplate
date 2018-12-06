import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class RoleModule1544076393487 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        const table = new Table({
            name: 'role_module',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isNullable: false,
                    unsigned: true
                }, {
                    name: 'module',
                    type: 'varchar',
                    length: '127',
                    isPrimary: false,
                    isNullable: false,
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

        await queryRunner.createForeignKey("role_module", new TableForeignKey({
            columnNames: ["roleId"],
            referencedColumnNames: ["id"],
            referencedTableName: "role"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropTable('role');
    }

}
