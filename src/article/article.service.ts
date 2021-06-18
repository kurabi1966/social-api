import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, getRepository, Repository } from 'typeorm';
import { ArticleEntity } from '@app/article/article.entity';
import { CreateArticleDto } from '@app/article/dtos/create-article.dto';
import { UserEntity } from '../user/user.entity';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import slugify from 'slugify';
import { UpdateArticleDto } from './dtos/update-article.dto';
import { ArticlesResponseInterface } from './types/articlesResponse.interface';
import { BadRequestException } from '@nestjs/common';
import { FollowEntity } from '../profile/follow.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
  ) {}
  async createArticle(
    currentUser: UserEntity,
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);
    if (!article.tagList) {
      article.tagList = [];
    }
    article.author = currentUser;
    article.slug = this.getSlug(article.title);
    return await this.articleRepository.save(article);
  }

  async getArticleBySlug(slug: string): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOne({ slug });
    if (!article) {
      throw new NotFoundException(`Article with slug ${slug} does not exist`);
    }
    return article;
  }

  async findAll(
    currentUserId: number,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const queryBuilder = getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList Like :tag', {
        tag: `%${query.tag}%`,
      });
    }

    if (query.author) {
      const author = await this.userRepository.findOne({
        username: query.author,
      });
      queryBuilder.andWhere('articles.authorId = :id', { id: author.id });
    }

    if (query.favorited) {
      const user = await this.userRepository.findOne(
        { username: query.favorited },
        {
          relations: ['favorites'],
        },
      );

      if (user.favorites.length !== 0) {
        const ids: number[] = user.favorites.map(
          (articleInFavorites) => articleInFavorites.id,
        );
        queryBuilder.andWhereInIds(ids);
      } else {
        queryBuilder.andWhere('1=0');
      }
    }

    const articlesCount = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }
    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const articles = await queryBuilder.getMany();

    return { articles, articlesCount };
  }

  async feed(
    currentUserId: number,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const queryBuilder = getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    queryBuilder.orderBy('articles.createdAt', 'DESC');
    if (currentUserId) {
      const follows = await this.followRepository.find({
        followerId: currentUserId,
      });
      const usersIds = follows.map((user) => user.followingId);
      queryBuilder.andWhere('articles.authorId IN (:...authors)', {
        authors: usersIds,
      });
    }

    const articlesCount = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }
    if (query.offset) {
      queryBuilder.offset(query.offset);
    }
    const articles = await queryBuilder.getMany();
    return { articles, articlesCount };
  }

  async deleteArticle(
    currentUserId: number,
    slug: string,
  ): Promise<DeleteResult> {
    const article = await this.getArticleBySlug(slug);
    if (!article) {
      throw new NotFoundException(`Article ${slug} does not exist.`);
    }

    if (article.author.id !== currentUserId) {
      throw new UnauthorizedException(
        `You are not Authorized to delete ${slug} article`,
      );
    }

    return await this.articleRepository.delete({ slug });
  }

  // User to add an article to his favorite list
  async addArticleToFavorite(
    currentUserId: number,
    slug: string,
  ): Promise<ArticleEntity> {
    const article = await this.getArticleBySlug(slug);
    if (!article) {
      throw new NotFoundException(`Article of slug ${slug} do not exist.`);
    }

    if (article.author.id === currentUserId) {
      throw new BadRequestException('You can not like your own article!');
    }
    const user = await this.userRepository.findOne(currentUserId, {
      relations: ['favorites'],
    });

    const isNotFavorited =
      user.favorites.findIndex(
        (articleInFavorite) => article.id === articleInFavorite.id,
      ) === -1;

    if (!isNotFavorited) {
      throw new BadRequestException(
        `This article "${slug}" Already in your favorite list!`,
      );
    }

    user.favorites.push(article);

    article.favoritesCount++;

    await this.userRepository.save(user);
    await this.articleRepository.save(article);

    return article;
  }

  // User to remove an article from his favorite list
  async removeArticleFromFavorite(currentUserId: number, slug: string) {
    const article = await this.getArticleBySlug(slug);
    if (!article) {
      throw new NotFoundException(`Article of slug ${slug} do not exist.`);
    }
    const user = await this.userRepository.findOne(currentUserId, {
      relations: ['favorites'],
    });

    const articleIndex = user.favorites.findIndex(
      (articleInFavorite) => article.id === articleInFavorite.id,
    );
    if (articleIndex === -1) {
      throw new BadRequestException(
        `This article "${slug}" is not in your favorite list!`,
      );
    }

    user.favorites.splice(articleIndex, 1);

    article.favoritesCount--;

    await this.userRepository.save(user);
    await this.articleRepository.save(article);

    return article;
  }

  async updateArticle(
    slug: string,
    currentUserId: number,
    updateArticleDto: UpdateArticleDto,
  ): Promise<ArticleEntity> {
    // 1. Find the article
    const article = await this.articleRepository.findOne({ slug });
    if (!article) {
      throw new NotFoundException(`Article ${slug} does not exist.`);
    }
    // 2. Check if the author is the current user
    if (currentUserId !== article.author.id) {
      throw new UnauthorizedException(
        `You are not Authorized to delete ${slug} article`,
      );
    }
    // 3. check if the title has been changed
    if (updateArticleDto.title !== article.title) {
      article.slug = this.getSlug(updateArticleDto.title);
    }
    // 4. Update the article and return it

    Object.assign(article, updateArticleDto);
    await this.articleRepository.update({ slug }, article);

    return await this.articleRepository.findOne({ id: article.id });
  }

  // Hellpers
  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }

  private getSlug(title: string): string {
    return (
      slugify(title, { lower: true, remove: /[*+~.()'"!:@]/g }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}
