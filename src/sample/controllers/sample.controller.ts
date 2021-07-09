import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import { Roles, RolesGuard, Logger } from '../../common';
import type { Config } from '../../config';
import { Sampletable1 } from '../../entity/sampledb1';
import { FoobarService } from '../../shared/foobar';
import { SampleDto } from '../dto';
import { DatabaseService } from '../providers';

/**
 * route /test/sample/*
 */
@UseGuards(RolesGuard)
@Controller('sample')
export class SampleController {
  constructor(
    private readonly logger: Logger,
    private config: ConfigService<Config>,
    private dbquery: DatabaseService,
    private foobarService: FoobarService,
  ) {
    this.logger.setContext(SampleController.name);
  }

  @Get() // http://localhost:3000/test/sample
  public sample(): Record<string, unknown> {
    this.logger.log('this is sample');

    return {
      hello: this.config.get('hello'),
      foo: this.config.get('foo'),
    };
  }

  @Get('hello') // http://localhost:3000/test/sample/hello
  public hello(@Req() req: Request, @Res() res: Response): void {
    res.json({
      message: req.originalUrl,
    });
  }

  @Get('hello/query') // http://localhost:3000/test/sample/hello/query?name=anything
  public helloQuery(@Query('name') name: string): string {
    if (!name) {
      throw new BadRequestException('InvalidParameter');
    }

    return `helloQuery: ${name}`;
  }

  @Get('hello/param/:name') // http://localhost:3000/test/sample/hello/param/anything
  public helloParam(@Param('name') name: string): string {
    return `helloParam: ${name}`;
  }

  @Get('hello/number/:foo') // http://localhost:3000/test/sample/hello/number/123?bar=456&blah=789
  public helloNumber( // number transform or validation
    @Param('foo') foo: number, @Query('bar') bar: string, @Query('blah', ParseIntPipe) blah: number,
  ): Record<string, unknown> {
    return { foo, bar, blah };
  }

  @Post('hello/body') // http://localhost:3000/test/sample/hello/body
  public helloBody(@Body() param: SampleDto): string {
    return `helloBody: ${JSON.stringify(param)}`;
  }

  @Get('database')
  public async database(): Promise<Sampletable1[]> {
    // this.dbquery.sample2();
    // this.dbquery.sample3();
    return this.dbquery.sample1();
  }

  @Get('foobars')
  public async foobars(): Promise<Sampletable1[]> {
    return this.foobarService.getFoobars();
  }

  @Roles('admin')
  @Get('admin') // http://localhost:3000/test/sample/admin
  public admin(): string {
    return 'Need admin role';
  }
}
