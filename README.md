# oidc-angular
Please see http://blog.emtwo.ch/jwt-token-based-auth-with-angularjs/ for motivation and technical details.

To install oidc-angular use bower
``bower install oidc-angular -save``

Inject the `$auth`-Provider to setup the library while configuring the Angular-Application

```javascript

var app = angular.module('myApp', ['oidc-angular'], function($auth) {
  $auth.configure(
    {
      clientId: 'abcd...',
      ...
    }
  );
}
);
```

##Configuration Options

For a complete and always up-to-date list of configuration options, see https://github.com/michaelschnyder/oidc-angular/blob/master/oidc-angular.js#L220 for configuration details


##Events
oidc-angular comes with a various list of events which gives you the most possible 
flexibility to handle the authentication process 

Events are broadcasted to the `$rootScope`.

| Name                    | Description                       | Parameters            |
|:--------------------------------|:----------------------------------|:----------------------|
|`oidcauth:unauthorized`          | The server returned an 401 response and oidc-angular was unable to find out the exect reason. See `tokenExpired` or `tokenMissing`| The `response` istelf |
|`oidcauth:tokenExpired`          | The server returned an 401 response and the lib found out that the token might be expired. | `request` or `response`, see `enableRequestChecks`
|`oidcauth:tokenMissing`          | The server returned an 401 response while the client had no token sent. | `request` or `response`, see `enableRequestChecks`
|`oidcauth:tokenExpires`          | Raised when the token will expire soon, based on the value of `advanceRefresh` | *none*
|`oidcauth:loggedIn`              | Raised when the library sucessfully parsed the token after the IdP-Redirect | *none*
|`oidcauth:loggedOut`             | Raised when the IdP redirected the user back to the app after logout | *none*
|`oidcauth:silentRefreshStarted`  | The Refresh-process of the token has started in the background (`iframe`) | *none*
|`oidcauth:silentRefreshSucceded` | A new and newer token was aquired sucessfully | *none*
|`oidcauth:silentRefreshFailed`   | Unable to aquire a new token via backgroud-process | *none*
|`oidcauth:silentRefreshTimeout`  | The background-refresh process timed out | *none*

##Methods

##SignIn

```javascript
 $auth.signIn();
```

Or with a redirection after login:

```javascript
 $auth.signIn('#/page2');
```

#Sample
There is a sample in the `samples`-Folder.
