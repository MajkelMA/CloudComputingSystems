import { Injectable } from '@angular/core';
import { AuthenticationDetails, CognitoUser, CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import {BehaviorSubject, Observable, Observer} from 'rxjs';
import * as AWS from 'aws-sdk';
import * as Globals from '../app-consts';

const poolData = {
  UserPoolId: Globals.userPoolId,
  ClientId: Globals.clientId
};

const userPool = new CognitoUserPool(poolData);

@Injectable({
  providedIn: 'root'
})

export class AuthenticationRecruiterService {
  cognitoUser: CognitoUser;
  private username = new BehaviorSubject('');
  public currUsername = this.username.asObservable();
  private sessionUserAttributes;

  constructor() {}

  signIn(username, password) {
    return new Observable(observer => {
      const authenticationData = {
        Username: username,
        Password: password
      };
      const authenticationDetails = new AuthenticationDetails(authenticationData);

      const userData = {
        Username: username,
        Pool: userPool
      };

      this.cognitoUser = new CognitoUser(userData);
      this.cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: result => {
          sessionStorage.setItem('accessToken', result.getAccessToken().getJwtToken());
          localStorage.setItem('refreshToken', result.getRefreshToken().getToken());


          // AWS.config.region = 'us-east-1';
          // const tmp = new AWS.CognitoIdentityCredentials({
          //   IdentityPoolId: Globals.recruiterIdentityPoolId,
          //   Logins: {
          //     [`cognito-idp.us-east-1.amazonaws.com/${Globals.userPoolId}`]: result.getIdToken().getJwtToken()
          //   }
          // });
          //
          // // bullshit workaround for updating the credentials params
          // AWS.config.update({credentials: tmp, region: 'us-east-1'});



          this.cognitoUser.getUserAttributes( (err, res) => {
            if (err) {
              console.log('userattrs err: ', err);
            }
            this.sessionUserAttributes = res;
            res.forEach( value => {
              if (value.getName() === 'email') {
                localStorage.setItem('email', value.getValue());
              }
            });
          });

          observer.next(result);
          observer.complete();
        }, onFailure: err => {
          console.log(err);
          observer.error(err);
        }, newPasswordRequired: ((userAttributes, requiredAttributes) => {
          localStorage.setItem('email', userAttributes.email);
          delete userAttributes.email_verified;
          this.sessionUserAttributes = userAttributes;
          observer.next('newPass');
          observer.complete();
        })
      });
    });
  }

  addToGroup(username, group) {
    return new Observable( observer => {
      const params = {
        GroupName: group,
        UserPoolId: poolData.UserPoolId,
        Username: username
      };

      if (this.cognitoUser != null ) {
        this.cognitoUser.getSession( (err, session) => {
          console.log('session valid: ', session.isValid());

          const loginProvider = {};
          console.log(session.getIdToken().getJwtToken());
          loginProvider[`cognito-idp.us-east-1.amazonaws.com/${Globals.userPoolId}`] = session.getIdToken().getJwtToken();
          const creds = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: Globals.recruiterIdentityPoolId,
            Logins: loginProvider
          });

          AWS.config.update({ credentials: creds, region: 'us-east-1'});
          console.log(AWS.config.credentials);


          AWS.config.getCredentials( error => {
            if (error) {
              console.log(error);
            }
            const idProvider = new AWS.CognitoIdentityServiceProvider();
            idProvider.adminAddUserToGroup(params, (e, data) => {
              if (e) {
                observer.error(e);
              } else {
                observer.next(data);
                observer.complete();
              }
            });
          });
          // AWS.config.credentials.refresh( error => {
          //   if (error) {
          //     console.log(error);
          //   }
          // });
          //
          // const idProvider = new AWS.CognitoIdentityServiceProvider();
          // idProvider.adminAddUserToGroup(params, (e, data) => {
          //   if (e) {
          //     observer.error(e);
          //   } else {
          //     observer.next(data);
          //     observer.complete();
          //   }
          // });
        });
      }

    });
  }

  confirmCode(username, code, password) {
    const userData = {
      Username: username,
      Pool: userPool
    };

    const cUser = new CognitoUser(userData);
    return new Observable( observer => {
      cUser.confirmRegistration(code, false, (err, result) => {
        if (err) {
          console.log(err);
          return;
        }

        this.signIn(username, 'password').subscribe(res => {
          this.cognitoUser.changePassword('password', password, (e, r) => {
            if (e) {
              console.log(e);
            }
          });

          this.addToGroup(username, 'client').subscribe(re => {
            observer.next('success');
            observer.complete();
            });
          });
        });
    });
  }

  sendMail(email: string) {
    const mail = {
      Name: 'email',
      Value: email
    };
    const attributeList = [new CognitoUserAttribute(mail)];
    return new Observable(observer => {
      userPool.signUp(email, 'password', attributeList, null, (err, result) => {
        if (err) {
          console.log('signup error: ', err);
          observer.error(err);
          return;
        }
        console.log('signup correct');
        this.cognitoUser = result.user;
        observer.next(result);
        observer.complete();
      });
    });
  }

  setNewPassword(newPassword) {
    return new Observable( observer => {
      this.cognitoUser.completeNewPasswordChallenge(newPassword, this.sessionUserAttributes, {
        onSuccess: result => {
          sessionStorage.setItem('accessToken', result.getAccessToken().getJwtToken());
          localStorage.setItem('refreshToken', result.getRefreshToken().getToken());

          observer.next(result);
          observer.complete();
        }, onFailure: err => {
          console.log('setNewPassword: ', err);
          observer.error(err);
        }
      });
    });
  }


  isLogged(): boolean {
    return userPool.getCurrentUser() != null;
  }

  getUser() {
    return userPool.getCurrentUser();
  }

  getAccessToken() {
    return sessionStorage.getItem('accessToken');
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }


  getUsername() {
    return localStorage.getItem('email');
  }

  logOut() {
    localStorage.clear();
    sessionStorage.clear();
    if (this.getUser()) {
      this.getUser().signOut();
    }
    this.cognitoUser = null;
  }

}
