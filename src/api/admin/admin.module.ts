import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { CryptoService } from 'src/infrastructure/crypto/crypto.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenService } from 'src/infrastructure/token/Token';
import { AdminEntity } from 'src/core/entity/admin.entity';
@Module({
  imports: [TypeOrmModule.forFeature([AdminEntity])],
  controllers: [AdminController],
  providers: [AdminService, CryptoService, TokenService],
})
export class AdminModule {}
