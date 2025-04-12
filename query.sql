select * from users
select * from platforms 
select * from anime
select * from anime_list
delete from users where id=2

update users set role='admin' where id=21

-- AlterTable
ALTER TABLE "anime_list" ALTER COLUMN "episodes_difference" SET NOT NULL,
ALTER COLUMN "episodes_difference" SET DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "anime_list_user_id_anime_id_key" ON "anime_list"("user_id", "anime_id");

-- CreateIndex
CREATE UNIQUE INDEX "platforms_link_key" ON "platforms"("link");


ALTER TABLE "anime_list" 
ALTER COLUMN "episodes_difference" DROP NOT NULL,
ALTER COLUMN "episodes_difference" DROP DEFAULT;

DROP INDEX IF EXISTS "anime_list_user_id_anime_id_key";

DROP INDEX IF EXISTS "platforms_link_key";