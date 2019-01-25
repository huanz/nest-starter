import { ExecutionContext, Injectable, CanActivate, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LoginGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const isAuth = request.isAuthenticated();
    if (isAuth) {
      return true;
    }
    throw new UnauthorizedException();
  }
}
