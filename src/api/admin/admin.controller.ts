import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UseGuards,
  ParseIntPipe,
  ParseUUIDPipe,
  UploadedFile,
  HttpException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { accessRoles } from 'src/common/decorator/roles.decorator';
import { Roles } from 'src/common/enum/roles.enum';
import { type Response } from 'express';
import { AuthGuard } from 'src/common/guard/AuthGuard';
import { RolesGuard } from 'src/common/guard/RolesGuard';
import { CookieGetter } from 'src/common/decorator/cookieGetter.decorator';
import { type IToken } from 'src/infrastructure/token/interface';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import { SigninDto } from 'src/common/dto/signin.dto';
import { UpdatePasswordDto } from 'src/common/dto/update-password.dto';
import { ApiImageFile } from 'src/common/decorator/upload.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('create-admin')
  @ApiOperation({ summary: 'for super admin' })
  @accessRoles(Roles.SUPER_ADMIN)
  @ApiBearerAuth()
  createAdmin(@Body() createDto: CreateAdminDto) {
    return this.adminService.createAdmin(createDto);
  }

  @Post('signin')
  @ApiOperation({ summary: 'public' })
  @accessRoles('public')
  signIn(@Body() dto: SigninDto, @Res({ passthrough: true }) res: Response) {
    return this.adminService.signIn(dto, res);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'for super admin and admin' })
  @accessRoles('public')
  refresh(@CookieGetter('adminToken') token: string) {
    // return this.authService.newToken(this.adminService.getRepository, token);
  }

  @Post('signout')
  @ApiOperation({ summary: 'for super admin and admin' })
  @accessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)
  @ApiBearerAuth()
  signOut(
    @CookieGetter('adminToken') token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.adminService.signOut(res, 'adminToken');
  }

  @Get('me')
  @ApiOperation({ summary: 'for super admin and admin' })
  @accessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)
  @ApiBearerAuth()
  getProfile(@CurrentUser() user: IToken) {
    return this.adminService.findOneById(user.id);
  }

  @Get('all')
  @ApiOperation({ summary: 'for super admin' })
  @accessRoles(Roles.SUPER_ADMIN)
  @ApiBearerAuth()
  getAll() {
    return this.adminService.findAll({ order: { createdAt: 'DESC' } });
  }

  @Get('details')
  @ApiOperation({ summary: 'for admin' })
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @ApiBearerAuth()
  getDetails(@CurrentUser() user: IToken) {
    return this.adminService.findOneById(user.id);
  }

  @Patch('update-details')
  @ApiOperation({ summary: 'for super admin and admin' })
  @accessRoles(Roles.SUPER_ADMIN, 'ID')
  @ApiBearerAuth()
  updateDetails(@Body() dto: UpdateAdminDto, @CurrentUser() user: IToken) {
    return this.adminService.updateAdmin(user.id, dto);
  }

  @Patch('update-password')
  @ApiOperation({ summary: 'for admins' })
  @accessRoles(Roles.SUPER_ADMIN, 'ID')
  @ApiBearerAuth()
  updatePassword(@Body() dto: UpdatePasswordDto, @CurrentUser() user: IToken) {
    return this.adminService.updatePassword(user.id, dto);
  }

  @Patch('update-avatar')
  @ApiOperation({ summary: 'Update avatar (Universal Upload)' })
  @accessRoles(Roles.SUPER_ADMIN, Roles.ADMIN, 'ID')
  @ApiBearerAuth()
  @ApiImageFile('file', true)
  updateAvatar(
    @CurrentUser() user: IToken,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new HttpException('File is required', 400);

    return this.adminService.updateAvatar(user.id, file);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'for super admin' })
  @accessRoles(Roles.SUPER_ADMIN)
  @ApiBearerAuth()
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.delete(id);
  }

  @Delete('delete-avatar')
  @ApiOperation({ summary: 'Delete avatar' })
  @accessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)
  @ApiBearerAuth()
  deleteAvatar(@CurrentUser() user: IToken) {
    return this.adminService.deleteAvatar(user.id);
  }
}
