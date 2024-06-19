import { Injectable } from '@angular/core';

import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
  IAuthenticationCallback,
} from "amazon-cognito-identity-js";
import { environment } from '../../env';
import { Observable, Observer } from 'rxjs';


const POOLDATA = {
  UserPoolId: environment.userPoolId,
  ClientId: environment.clientId
};

@Injectable({
  providedIn: 'root'
})



export class AuthService {

  user: CognitoUser | null = null;

  constructor() { }


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
    return new Observable(observer => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: result => observer.next(result),
        onFailure: result => observer.error(result)
      })

    })

  }






}
