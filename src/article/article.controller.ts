import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { User } from '@app/user/decorators/user.decorators';
import { CreateArticleDto } from '@app/article/dtos/create-article.dto';
import { UsePipes } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { UserEntity } from '../user/user.entity';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import { DeleteResult } from 'typeorm';
import { Put } from '@nestjs/common';
import { UpdateArticleDto } from './dtos/update-article.dto';
import { ArticlesResponseInterface } from './types/articlesResponse.interface';
import { BackendValidationPipe } from '@app/shared/pips/backendValidation.pipe';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}
  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async create(
    @User() currentUser: UserEntity,
    @Body('article') createArticleDto: CreateArticleDto,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.createArticle(
      currentUser,
      createArticleDto,
    );

    return this.articleService.buildArticleResponse(article);
  }

  @Get('/feed')
  @UseGuards(AuthGuard)
  async feed(
    @User('id') currentUserId: number,
    @Query() query: any,
  ): Promise<ArticlesResponseInterface> {
    return this.articleService.feed(currentUserId, query);
  }

  @Get('/:slug')
  async getArticleBySlug(
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.getArticleBySlug(slug);
    return this.articleService.buildArticleResponse(article);
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @User('id') currentUserId: number,
    @Query() query: any,
  ): Promise<ArticlesResponseInterface> {
    return this.articleService.findAll(currentUserId, query);
  }



  @Delete('/:slug')
  // @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async deleteArticle(
    @Param('slug') slug: string,
    @User('id') currentUserId: number,
  ): Promise<DeleteResult> {
    return await this.articleService.deleteArticle(currentUserId, slug);
  }

  @Put('/:slug')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async updateArticle(
    @Param('slug') slug: string,
    @User('id') currentUserId: number,
    @Body('article') updateArticleDto: UpdateArticleDto,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.updateArticle(
      slug,
      currentUserId,
      updateArticleDto,
    );
    return this.articleService.buildArticleResponse(article);
  }

  @Post(['/:slug/favorite', '/:slug/like'])
  @UseGuards(AuthGuard)
  async addArticleToFavorite(
    @User('id') currentUserId: number,
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.addArticleToFavorite(
      currentUserId,
      slug,
    );
    return this.articleService.buildArticleResponse(article);
  }
  @Delete(['/:slug/favorite', '/:slug/dislike'])
  @UseGuards(AuthGuard)
  async removeArticleFromFavorite(
    @User('id') currentUserId: number,
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.removeArticleFromFavorite(
      currentUserId,
      slug,
    );
    return this.articleService.buildArticleResponse(article);
  }
}
