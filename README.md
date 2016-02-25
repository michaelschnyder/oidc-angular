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

##Calling oidc-angular explicitly

```javascript
 $auth.signIn();
```

Or with a redirection after login:

```javascript
 $auth.signIn('#/page2');
```



See https://github.com/michaelschnyder/oidc-angular/blob/master/oidc-angular.js#L220 for configuration details

#Sample
There is a sample in the `samples`-Folder.
