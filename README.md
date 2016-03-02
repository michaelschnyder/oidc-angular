# oidc-angular
AngularJs Client Library to support modern web-applications when using the OpenId compatible "Hyprid Flow". See http://openid.net/specs/openid-connect-core-1_0.html#HybridFlowAuth for details.

![Hybrid Flow explained](http://www.websequencediagrams.com/cgi-bin/cdraw?lz=dGl0bGUgQXV0aGVudGljYXRpb24gU2VxdWVuY2UKCkJyb3dzZXItPlBvcnRhbC1DbGllbnQ6IE5hdmlnYXRlIHRvIAAVBgoAFQ0AKAlBcGk6IEFjY2VzcyBSZXNzb3VyY2UKbm90ZSByaWdodCBvZgA6BwBTCVVzdWFsbHkgdGhlIGMAawUgaXMgYWJsAGkFY2hlY2sgXG50b2tlbiBwcmlvciBhAFsFaW5nAC8FQVBJAIEFCEFwaQCBKhFBdXRoIFJlcXVpcmVkCgCBJxAAgWoHOiBSZWRpcmVjdCB0byBJZFAAggAKSWRQOiBMb2dpbiB3aXRoIFVzZXJuYW1lIC8gUGFzc3dvcmQKSWRQAEALU3VjZWVkZWQsIHIASgsAgkUNAIIDDwB9CVRoZSAAgWQGaXMgdGFuc3BvcnRlZCBhIGFuIFVybC1cbkNvbXBvbmVudCBsaWtlICZpZF8AghcFPS4uLgCDJxkAgwsHAINQBgCBQgZUb2tlbgCDICYAgyobAINrBUdyYW50AINvBw&s=roundgreen)

See Origin http://blog.emtwo.ch/jwt-token-based-auth-with-angularjs/ for motivation and technical details.

##First Start
To install oidc-angular use bower
```
bower install oidc-angular -save
```

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
