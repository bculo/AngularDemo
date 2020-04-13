import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError, BehaviorSubject } from 'rxjs';
import { User } from './auth/user.model';
import { Router } from '@angular/router';

export interface AuthResponseData {
    idToken: string,
    email: string,
    refreshToken: string,
    expiresIn: string,
    localId: string,
    registered?: boolean
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiKey = "AIzaSyDPxgr9ChQyCunRkS14hS8Bx2uzbhNShmk"
    private apiSignUpUrl = "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key="
    private apiLoginInUrl = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key="

    userSub = new BehaviorSubject<User>(null);
    private tokenExpirationTimer: any;

    constructor(private http: HttpClient,
        private router: Router) {}

    signUp(email: string, password: string) {
        return this.http.post<AuthResponseData>(`${this.apiSignUpUrl}${this.apiKey}`,
        {
            email: email,
            password: password,
            returnSecureToken: true
        }).pipe(catchError(this.handleError), tap(res => {
            this.handleAuthentication(res.email, res.idToken, res.localId, +res.expiresIn);
        }));
    }

    login(email: string, password: string) {
        return this.http.post<AuthResponseData>(`${this.apiLoginInUrl}${this.apiKey}`,
        {
            email: email,
            password: password,
            returnSecureToken: true
        }).pipe(catchError(this.handleError), tap(res => {
            this.handleAuthentication(res.email, res.idToken, res.localId, +res.expiresIn);
        }));
    }

    logout() {
        this.userSub.next(null);
        this.router.navigate(['/auth']);
        localStorage.removeItem('userData');
        if(this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
        }
        this.tokenExpirationTimer = null;
    }

    autoLogin() {
        const userAsString: string = localStorage.getItem('userData');
        if(!userAsString) return;

        const user: { 
            email: string,
            id: string,
            _token: string,
            _tokenExpirationDate: string
        } = JSON.parse(userAsString);

        const loadedUser = new User(user.email, user.id, user._token, new Date(user._tokenExpirationDate));
        if(loadedUser.token) {
            this.userSub.next(loadedUser);
            const expirationDuration = new Date(user._tokenExpirationDate).getTime() - new Date().getTime();
            this.autoLogout(expirationDuration);
        }
    }

    //expirationDuration in miliseconds
    autoLogout(expirationDuration: number) {
        this.tokenExpirationTimer = setTimeout(() => {
            this.logout();
        }, expirationDuration);
    }

    private handleAuthentication(email: string, token: string, localId: string, expiresIn: number) {
        const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
        const user = new User(email, localId, token, expirationDate);
        localStorage.setItem('userData', JSON.stringify(user));
        this.userSub.next(user);
        this.autoLogout(expiresIn * 1000);
    }

    private handleError(errorRes: HttpErrorResponse) {
        let errorMessage = "An unknown error occured";

        if(!errorRes.error || !errorRes.error.error){
            return throwError(errorMessage)
        }

        switch(errorRes.error.error.message){
            case 'EMAIL_EXISTS':
                errorMessage = "This email exists already";
                break;
            case 'EMAIL_NOT_FOUND':
                errorMessage = "There is no user record corresponding to this identifier. The user may have been deleted.";
                break;
            case 'INVALID_PASSWORD':
                errorMessage = "The password is invalid or the user does not have a password.";
                break;
        }
        
        return throwError(errorMessage);
    }
}