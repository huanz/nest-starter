import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { validate } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

export abstract class Validate {
  @BeforeInsert()
  @BeforeUpdate()
  async validate() {
    const errors = await validate(this);
    if (errors.length > 0) {
      console.log(errors);
      throw new BadRequestException(errors);
    }
  }
}

export abstract class Base extends Validate {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}
