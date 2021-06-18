import {MigrationInterface, QueryRunner} from "typeorm";

export class addingUsersManyToManyRelationshipt1624016771128 implements MigrationInterface {
    name = 'addingUsersManyToManyRelationshipt1624016771128'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users_followes_users" ("usersId_1" integer NOT NULL, "usersId_2" integer NOT NULL, CONSTRAINT "PK_b817882c47793583f5576e85213" PRIMARY KEY ("usersId_1", "usersId_2"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ff2188731022f99b1762190035" ON "users_followes_users" ("usersId_1") `);
        await queryRunner.query(`CREATE INDEX "IDX_fff2033404d96d400003e3ffe1" ON "users_followes_users" ("usersId_2") `);
        await queryRunner.query(`ALTER TABLE "users_followes_users" ADD CONSTRAINT "FK_ff2188731022f99b17621900356" FOREIGN KEY ("usersId_1") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users_followes_users" ADD CONSTRAINT "FK_fff2033404d96d400003e3ffe14" FOREIGN KEY ("usersId_2") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_followes_users" DROP CONSTRAINT "FK_fff2033404d96d400003e3ffe14"`);
        await queryRunner.query(`ALTER TABLE "users_followes_users" DROP CONSTRAINT "FK_ff2188731022f99b17621900356"`);
        await queryRunner.query(`DROP INDEX "IDX_fff2033404d96d400003e3ffe1"`);
        await queryRunner.query(`DROP INDEX "IDX_ff2188731022f99b1762190035"`);
        await queryRunner.query(`DROP TABLE "users_followes_users"`);
    }

}
