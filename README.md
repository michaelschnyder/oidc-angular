# oidc-angular
Please see http://blog.emtwo.ch/jwt-token-based-auth-with-angularjs/ for motivation and technical details.

To install oidc-angular use bower
``bower installl oidc-angular -save``

Configure the `$auth$`-Provider while configuring the application

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

## Configuration options

See https://github.com/michaelschnyder/oidc-angular/blob/master/oidc-angular.js#L220 for configuration details

#Sample
There is a sample in the `samples`-Folder.
