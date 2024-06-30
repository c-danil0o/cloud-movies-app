import { Injectable } from '@angular/core';

import {
  AuthenticationDetails,
  CognitoRefreshToken,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
  IAuthenticationCallback,
} from "amazon-cognito-identity-js";
import { environment } from '../../env';
import { BehaviorSubject, EMPTY, Observable, Observer, of, switchMap, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { HttpHeaders } from '@angular/common/http';
import { nextTick } from 'process';


const POOLDATA = {
  UserPoolId: environment.userPoolId,
  ClientId: environment.clientId
};

@Injectable({
  providedIn: 'root'
})



export class AuthService {

  user: CognitoUser | null = null;


  constructor(private messageService: MessageService) { }


  getUserPool(): CognitoUserPool {
    return new CognitoUserPool(POOLDATA);
  }

  signUp(
    username: string,
    password: string,
    attributes: [{ Name: string; Value: string }, { Name: string; Value: string }]
  ): Observable<any> {
    const userPool = this.getUserPool();

    const attributeList = attributes.map(
      attribute => new CognitoUserAttribute(attribute)
    );

    return new Observable((observer: Observer<any>) => {
      userPool.signUp(
        username,
        password,
        attributeList,
        // @ts-ignore
        null,
        (err, result) => {
          if (err) {
            return observer.error(err);
          }
          observer.next(result);
        }
      );
    });
  }

  confirmSignUp(username: string, code: string): Observable<any> {
    const userData = {
      Username: username,
      Pool: this.getUserPool()
    };

    let user = new CognitoUser(userData);
    this.user = user;

    return new Observable(observer => {
      user.confirmRegistration(code, true, (err, result) => {
        if (err) {
          return observer.error(err);
        }
        observer.next(result);
      });
    });
  }

  resendConfirmationCode(username: string): Observable<any> {
    const userData = {
      Username: username,
      Pool: this.getUserPool()
    };

    let user = new CognitoUser(userData);
    this.user = user;

    return new Observable(observer => {
      user.resendConfirmationCode((err, result) => {
        if (err) {
          return observer.error(err);
        }
        observer.next(result);
      });
    });
  }

  // callbacks
  authenticate(email: string, password: string): Observable<any> {
    let authData = {
      Username: email,
      Password: password
    }

    let authenticationDetails = new AuthenticationDetails(authData);

    let userData = {
      Username: email,
      Pool: this.getUserPool()
    }

    let cognitoUser = new CognitoUser(userData);
    this.user = cognitoUser;
    return new Observable(observer => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: result => observer.next(result),
        onFailure: result => observer.error(result)
      })

    })

  }

  login(email: string, password: string) {
    this.authenticate(email, password).subscribe({
      next: (result: CognitoUserSession) => {
        return result;
      },
      error: (err) => {
        console.log(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Login failed',
          key: 'bc',
          detail: 'Invalid credentials!',
          life: 2000
        })

      }
    })
  }

  getSession(): Observable<CognitoUserSession | null> {
    const user = this.getUserPool().getCurrentUser();
    if (user) {
      return new Observable(observer => {
        user.getSession((err: any, session: CognitoUserSession) => {
          if (err) {
            return observer.error(err);
          } else {
            observer.next(session);
          }
        })
      })
    } else {
      return of(null);
    }
  }

  refreshSession(refreshToken: CognitoRefreshToken): CognitoUserSession | null {
    const user = this.getUserPool().getCurrentUser();
    if (user) {
      user.refreshSession(refreshToken, (err, session) => {
        if (err) {
          return null;
        }
        return session;
      })
    }
    return null;
  }


  logout(): void {
    const user = this.getUserPool().getCurrentUser();
    if (user != null) {
      user.signOut()
    }
  }


  getRole(): Observable<string> {
    return this.getSession().pipe(switchMap((session) => {
      if (session != null) {
        let groups: string[] = (session.getIdToken().decodePayload()['cognito:groups']);
        if (groups.includes('Admin')) {
          return of("Admin");
        }
        if (groups.includes("User")) {
          return of("User");
        }
      }
      return of("none");
    }));
  }






}
