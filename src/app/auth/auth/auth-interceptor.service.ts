import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpParams } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { take, exhaustMap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
    
    constructor(private authService: AuthService) {}

    intercept(req: import("@angular/common/http").HttpRequest<any>, next: import("@angular/common/http").HttpHandler): import("rxjs").Observable<import("@angular/common/http").HttpEvent<any>> {
        
        //take -> take value (user in this case) and automatically unsubscribe,
        //exhaustMap -> wait for first observable to finish then switch map

        return this.authService.userSub.pipe(take(1), exhaustMap(user => {
            if(!user) return next.handle(req);
            const modifiedRequest = req.clone({params: new HttpParams().set('auth', user.token)})
            return next.handle(modifiedRequest);
        }));
    }

}