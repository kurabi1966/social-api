// to be refactored and documented

import { MigrationInterface, QueryRunner } from 'typeorm';
import { lorem } from 'faker';
import slugify from 'slugify';
const tagsArray = [
  'nodejs',
  'angular',
  'reactjs',
  'nextjs',
  'javascipt',
  'java',
  'mongodb',
  'postgres',
  'mysql',
  'oop',
];
const update_articles = [];

const password = '$2b$10$HucZ/p6kXxGHTEiM3/8fbOjIPTkYBjHHr2JhtwWOy6ejThOr/svOm';

const usersArray = [
  { username: 'kurabi', email: 'kurabi@yopmail.com' },
  { username: 'ali', email: 'ali@yopmail.com' },
  { username: 'lina', email: 'lina@yopmail.com' },
  { username: 'muhannad', email: 'muhannad@yopmail.com' },
  { username: 'abody', email: 'abody@yopmail.com' },
  { username: 'ahmad', email: 'ahmad@yopmail.com' },
  { username: 'omar', email: 'omar@yopmail.com' },
  { username: 'sami', email: 'sami@yopmail.com' },
  { username: 'saeed', email: 'saeed@yopmail.com' },
  { username: 'basem', email: 'basem@yopmail.com' },
];

let users = '';

usersArray.forEach((user) => {
  users += `('${user.username}', '${user.email}', '${password}'),`;
});

users = users.substring(0, users.length - 1);

let tags = '';
tagsArray.forEach((tag) => {
  tags += `('${tag}'),`;
});

tags = tags.substring(0, tags.length - 1);

let articles = '';
let users_favorite_articles = '';

for (let i = 0; i < 20; i++) {
  const title = lorem.words(5);
  const slug =
    slugify(title, { lower: true, remove: /[*+~.()'"!:@]/g }) +
    '-' +
    ((Math.random() * Math.pow(36, 6)) | 0).toString(36);

  const description = lorem.words(15);
  const body = lorem.paragraphs(3);
  const authorId = Math.floor(Math.random() * usersArray.length) + 1;
  let tagList = '';
  const tempTagsArray = [];
  const rndTags = Math.floor(Math.random() * tagsArray.length);
  for (let i = 0; i <= rndTags; i++) {
    const tag = tagsArray[Math.floor(Math.random() * tagsArray.length)];
    if (tempTagsArray.indexOf(tag) === -1) {
      tempTagsArray.push(tag);
      tagList += `${tag},`;
    }
  }
  tagList = tagList.substring(0, tagList.length - 1);
  articles += `('${slug}', '${title}', '${description}', '${body}', '${tagList}', ${authorId}),`;

  // users_favorite_articles
  const selectedUsers = [];
  const rndLikes = Math.floor(Math.random() * usersArray.length);
  for (let j = 1; j <= rndLikes; j++) {
    const userId = Math.floor(Math.random() * usersArray.length) + 1;

    if (selectedUsers.indexOf(userId.toString()) === -1) {
      users_favorite_articles += `(${userId},${i + 1}),`;
      selectedUsers.push(userId.toString());
    }
  }
  // selectedUsers.length = the users who liked this article
  update_articles.push(
    `UPDATE articles SET "favoritesCount" = ${
      selectedUsers.length
    } WHERE id = ${i + 1};`,
  );
}

articles = articles.substring(0, articles.length - 1);

// for (let i = 1; i <= usersArray.length; i++) {
//   const articlesIds: string[] = [];

//   for (let j = 1; j <= 5; j++) {
//     if (articles.indexOf(j + '') === -1) {
//       articlesIds.push(j + '');
//       users_favorite_articles += `(${i},${j}),`;
//     }
//   }
// }

users_favorite_articles = users_favorite_articles.substring(
  0,
  users_favorite_articles.length - 1,
);

export class SeedDb1623667896851 implements MigrationInterface {
  name = 'SeedDb1623667896851';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO tags (name) VALUES ${tags}`); // tags
    await queryRunner.query(
      `INSERT INTO users (username, email, password) VALUES ${users}`,
    );
    await queryRunner.query(`
      INSERT INTO articles (slug, title, description, body, "tagList", "authorId") Values ${articles}`); // articles
    await queryRunner.query(`
      INSERT INTO users_favorites_articles ("usersId", "articlesId") VALUES ${users_favorite_articles}
    `);
    for (let i = 0; i < 20; i++) {
      await queryRunner.query(update_articles[i]);
    }
  }

  down(_: QueryRunner): Promise<any> {
    return '' as any;
  }
}
