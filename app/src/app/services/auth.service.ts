import { Injectable } from '@angular/core';

import {
  AuthenticationDetails,
  CognitoRefreshToken,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
} from "amazon-cognito-identity-js";
import { environment } from '../../env';
import { BehaviorSubject, EMPTY, Observable, Observer, of, switchMap, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import {UserInfo} from "../models/UserInfo";


const POOLDATA = {
  UserPoolId: environment.userPoolId,
  ClientId: environment.clientId
};

@Injectable({
  providedIn: 'root'
})



export class AuthService {

  user: CognitoUser | null = null;
  userRole = new BehaviorSubject<string>("none")
  currentRole = this.userRole.asObservable()


  constructor(private messageService: MessageService) {
  }


  getUserPool(): CognitoUserPool {
    return new CognitoUserPool(POOLDATA);
  }


  updateRole(newRole: string) {
    this.userRole.next(newRole)
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
        onSuccess: result => { this.updateRole(this.extractRole(result)); observer.next(result) },
        onFailure: result => observer.error(result)
      })

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
      this.updateRole("none")
      user.signOut()
    }
  }

  extractRole(session: CognitoUserSession) {

    let groups: string[] = (session.getIdToken().decodePayload()['cognito:groups']);
    if (groups.includes('Admin')) {
      return "Admin";
    }
    if (groups.includes("User")) {
      return "User";
    }
    return "none"
  }

  getRole(): Observable<string> {
    return this.getSession().pipe(switchMap((session) => {
      if (session != null) {
        return of(this.extractRole(session))
      }
      return of("none");
    }));
  }

  getUserInfo():Observable<UserInfo|null>{
    return this.getSession().pipe(switchMap((session) => {
      if (session != null) {
        console.log(session.getAccessToken());
        console.log(session.getIdToken());

        let userInfo: UserInfo = {
          id: session.getAccessToken().decodePayload()['sub'],
          email: session.getAccessToken().decodePayload()['email']
        }
        return of(userInfo)
      }
      return of(null);
    }));
  }






}
