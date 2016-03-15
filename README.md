# oidc-angular
This is an angularjs client library to support modern web-applications when using the OpenId compatible "Hyprid Flow" aka "Browser-Flow". See http://openid.net/specs/openid-connect-core-1_0.html#HybridFlowAuth for details.

![Hybrid Flow explained](http://www.websequencediagrams.com/cgi-bin/cdraw?lz=dGl0bGUgQXV0aGVudGljYXRpb24gU2VxdWVuY2UKCkJyb3dzZXItPlBvcnRhbC1DbGllbnQ6IE5hdmlnYXRlIHRvIAAVBgoAFQ0AKAlBcGk6IEFjY2VzcyBSZXNzb3VyY2UKbm90ZSByaWdodCBvZgA6BwBTCVVzdWFsbHkgdGhlIGMAawUgaXMgYWJsAGkFY2hlY2sgXG50b2tlbiBwcmlvciBhAFsFaW5nAC8FQVBJAIEFCEFwaQCBKhFBdXRoIFJlcXVpcmVkCgCBJxAAgWoHOiBSZWRpcmVjdCB0byBJZFAAggAKSWRQOiBMb2dpbiB3aXRoIFVzZXJuYW1lIC8gUGFzc3dvcmQKSWRQAEALU3VjZWVkZWQsIHIASgsAgkUNAIIDDwB9CVRoZSAAgWQGaXMgdGFuc3BvcnRlZCBhIGFuIFVybC1cbkNvbXBvbmVudCBsaWtlICZpZF8AghcFPS4uLgCDJxkAgwsHAINQBgCBQgZUb2tlbgCDICYAgyobAINrBUdyYW50AINvBw&s=roundgreen)

See origin on http://blog.emtwo.ch/jwt-token-based-auth-with-angularjs/ for motivation and technical details.

##Getting started
To install oidc-angular use bower
```
bower install oidc-angular -save
```

Inject the `$auth`-provider to setup the library while configuring your angular-application

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

For a complete and always up-to-date list of configuration options, see https://github.com/michaelschnyder/oidc-angular/blob/master/oidc-angular.js#L220.

| Option                    | Type     | Description                             | Default Value            |
|:--------------------------|:---------|:-------------------------|:----------------------|
| `basePath`                | `string` | Path to the OIDC-Compatible Identity Provider. Will be used as the baseUrl for the `authorizationEndpoint` and `endSessionEndpoint` | *none*
| `clientId`                | `string` | The identifier of the client application. See [Spec](http://openid.net/specs/openid-connect-core-1_0.html#AuthRequest) | *none*
| `apiUrl`                  | `string` | The url to your backend which should be protected by adding the jwt-token for outgoing requests. | `/api/`
| `responseType`            | `string` | Type of the required token. Should be `id_token`. | `id_token`
| `scope`                   | `string` | Scopes (and contained claims) that should be returned by the IdP. Needs to be at least `openid profile`. Separate by space. | `openid profile`
| `redirectUri`             | `string` | The uri where the **Library** has registered its callback route for login is by default `#/auth/callback/`. The callback route gets evaluated by the **Library** and typically doesn't need an adjustment | `[Proto]://[HostName]/[Path(s)]/#/auth/callback/`
| `logoutUri`               | `string` | The uri where the **Library** has registered its callback route for logout is by default `#/auth/clear`. The callback route gets evaluated by the **Library** and typically doesn't need an adjustment | `[Proto]://[HostName]/[Path(s)]/#/auth/clear`
| `authorizationEndpoint`   | `string` | Place where the user logs in to the IdP. Combined with `basePath` | `[basePath]:connect/authorize`
| `endSessionEndpoint`      | `string` | Place where the ends his session in the IdP. Combined with `basePath` | `[basePath]:connect/endsession`
| `advanceRefresh`          | `int`    | Defines the advance seconds when trying to silenty reaquire a token. Checks are not made constantly, only after on sucessfull responses  | `300`
| `enableRequestChecks`     | `boolean`| Specifies if the token should be validated before using it in outgoing requests. Use with caution, because this checks depend on the currect UTC time of both the browser and the server | `false`

### Configuring the IdP
When configuring the IdP, make sure the options `clientId`, `redirectUri` and `logoutUri` are exact the same as in the oidc-angular configuration. Otherwise, the IdP typically refuses to redirect back to your application as part of its security restrictions.

##Events
oidc-angular comes with a various list of events which gives you the most possible flexibility to handle the authentication process 

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
|`oidcauth:silentRefreshFailed`   | Unable to aquire a new token via background-process | *none*
|`oidcauth:silentRefreshTimeout`  | The background-refresh process timed out | *none*

##Methods

###SignIn

Redirects the user to the configured IpP. The URL to the login screen is constructed based on the configuration made.

**Samples**
```javascript
 $auth.signIn();
```

Or with a redirection after login:

```javascript
 $auth.signIn('#/page2');
```

###SignOut
Logout the user imediately and quit the session on the IdP by calling the `endSessionEndpoint`. Claims in local storage get cleared after callback.

**Sample**

```javascript
 $auth.signOut();
```

###IsAuthenticated
Returns `true` if the there is a valid token available, `false` if no token or an expired / not yet valid token is available.

**Sample**

```javascript
 $auth.isAuthenthicated();
```

###IsAuthenticatedIn(milliseconds) 
Returns `true` if the current token is still valid after the given amount of milliseconds

**Sample**

```javascript
 $auth.isAuthenthicatedIn(3600000); // 1hour
```

#Sample
There is a sample in the `samples`-Folder.

#Compatibility
This library has been tested and intensively used with the ThinkTecture IdentityServer3 with varous versions. Please see [Thinktecture IdentityServer3](https://github.com/IdentityServer/IdentityServer3)
