'use strict';

(function() {

var eventPrefix = 'oidcauth:';

// App libraries
var oidcmodule = angular.module('oidc-angular', ['base64', 'ngStorage', function($provide, $httpProvider) {
    $httpProvider.interceptors.push('oidcHttpInterceptor');
}]);

oidcmodule.factory('oidcHttpInterceptor', ['$rootScope', '$q', '$auth', 'tokenService', function($rootScope, $q, $auth, tokenService) {
      return {

        'request': function(request) {
          
         if (request.url.startsWith($auth.config.apiUrl)) {
              
              if (tokenService.hasToken()) {
                  
                  if (tokenService.hasValidToken())
                  {
                      var token = tokenService.getIdToken();
                      request.headers['Authorization'] = 'Bearer ' + token;
                  }
                  else {
                      $rootScope.$broadcast(eventPrefix + 'tokenExpired');
                  }                  
              }
              else {
                  $rootScope.$broadcast(eventPrefix + 'tokenMissing');
              }
          }
          
          // do something on success
          return request;
        },
    
        'response': function(response) {
            
            if (response.status == 401) {
            
              if (tokenService.hasToken()) {
                  
                  if (tokenService.hasValidToken())
                  {
                      $rootScope.$broadcast(eventPrefix + 'unauthorized');
                  }
                  else {
                      $rootScope.$broadcast(eventPrefix + 'tokenExpired');
                  }                  
              }
              else {
                  $rootScope.$broadcast(eventPrefix + 'tokenMissing');
              }
            }
            else {
                
                // Proactive check if the token will expire soo
                $auth.validateExpirity();
            }
            
            return response;
            }
      };
    }]);

oidcmodule.service('tokenService', ['$base64', '$localStorage', function ($base64, $localStorage) {

    var service = this;

    var padBase64 = function (base64data) {
        while (base64data.length % 4 !== 0) {
            base64data += "=";
        }
        return base64data;
    };
    
    service.getPayload = function(raw)
    {
        var tokenParts = raw.split(".");
        return tokenParts[1];
    }

    service.deserializeClaims = function(raw) {
        var claimsBase64 = padBase64(raw);
        var claimsJson = $base64.decode(claimsBase64);

        var claims = JSON.parse(claimsJson);

        return claims;
    }
    
    service.saveToken = function (id_token) {
        $localStorage['idToken'] =  id_token;
    };

    service.hasToken = function() {
        
        var claims = service.allClaims();
        
        if (!(claims && claims.hasOwnProperty("iat") && claims.hasOwnProperty('exp'))) {
            return false;
        }
        
        return true;
    };
    
    service.hasValidToken = function() {
        if (!this.hasToken()) return false;
        
        var claims = service.allClaims();
        
        var now = Date.now();
        var issuedAtMSec = claims.iat * 1000;
        var expiresAtMSec = claims.exp * 1000;

        if (issuedAtMSec > now || expiresAtMSec < now) {
            return false;
        }
        
        return true;
    }

    service.saveClaims = function (id_token) {
        var idClaims = service.deserializeClaims(id_token);
        
        var allClaims = {};
        
        angular.extend(allClaims, idClaims);
        $localStorage['claims'] =  allClaims;
    };
    
    service.allClaims = function() {
        return $localStorage['claims'];
    };
    
    service.getIdToken = function() {
        return $localStorage['idToken'];
    };
    
    service.clearTokens = function() {
        delete $localStorage['claims'];
        delete $localStorage['idToken'];
    }
}]);

oidcmodule.provider("$auth", ['$routeProvider', function ($routeProvider) {

    // Register callback route
    $routeProvider.
        when('/auth/callback/:result', {
            template: '',
            controller: function ($auth) {
                $auth.handleSignInCallback();
            }
        }).
        when('/auth/clear', {
            template: '',
            controller: function ($auth) {
                $auth.handleSignOutCallback();
            }
        });        
    

    // Default configuration
    var config = {
        issuer: null,
        basePath: null,
        clientId: null,
        apiUrl: '/api/',
        responseType: 'id_token',
        scope: "openid profile",
        redirectUri: (window.location.origin || window.location.protocol + '//' + window.location.host) + window.location.pathname + '#/auth/callback/',
        logoutUri: (window.location.origin || window.location.protocol + '//' + window.location.host) + window.location.pathname + '#/auth/clear',
        state: "",
        jwksUri :              '.well-known/jwks',
        authorizationEndpoint:  'connect/authorize',
        revocationEndpoint:     'connect/revocation', 
        endSessionEndpoint:     'connect/endsession',
        advanceRefresh:         300,
      };

    return {
     
        // Service configuration
        configure: function (params) {
            angular.extend(config, params);
        },
        
        // Service itself
        $get: ['$document', '$rootScope', '$localStorage', '$location', 'tokenService', function ($document, $rootScope, $localStorage, $location, tokenService) {
        
            var init = function() {
                
                if ($localStorage['logoutActive']) {
                    delete $localStorage['logoutActive'];
                    
                    tokenService.clearTokens();                    
                }
                
                if ($localStorage['refreshRunning']) {
                    delete $localStorage['refreshRunning'];
                }
            };
            
            var createLoginUrl = function (nonce, state) {
            
                var hasPathDelimiter = config.basePath.endsWith('/');
                var appendChar = (hasPathDelimiter) ? '' : '/';
                
                var baseUrl = config.basePath + appendChar;
                var url = baseUrl + config.authorizationEndpoint
                                  + "?response_type="
                                  + encodeURIComponent(config.responseType)
                                  + "&client_id=" 
                                  + encodeURIComponent(config.clientId) 
                                  + "&state=" 
                                  + encodeURIComponent(state || config.state) 
                                  + "&redirect_uri=" 
                                  + encodeURIComponent(config.redirectUri) 
                                  + "&scope=" 
                                  + encodeURIComponent(config.scope)
                                  + "&nonce=" 
                                   + encodeURIComponent(nonce);
                return url;
            };

            var createLogoutUrl = function(state) {
                
                var idToken = tokenService.getIdToken();
                
                var hasPathDelimiter = config.basePath.endsWith('/');
                var appendChar = (hasPathDelimiter) ? '' : '/';
                
                var baseUrl = config.basePath + appendChar;
                var url = baseUrl + config.endSessionEndpoint
                                  + "?id_token_hint="
                                  + encodeURIComponent(idToken)
                                  + "&post_logout_redirect_uri=" 
                                  + encodeURIComponent(config.logoutUri) 
                                  + "&state=" 
                                  + encodeURIComponent(state || config.state) 
                return url;
            }    
            
            var startImplicitFlow = function (localRedirect) {
            
                $localStorage['localRedirect'] = localRedirect;
                
                var url = createLoginUrl("dummynonce");
                window.location.replace(url);
            };
    
            var startLogout = function () {
                var url = createLogoutUrl();
                $localStorage['logoutActive'] = true;

                window.location.replace(url);
            };

            var tryRefresh = function() {
                
                if ($localStorage['refreshRunning']) {
                    return;            
                }
                
                $localStorage['refreshRunning'] = true;
                
                $rootScope.$broadcast(eventPrefix + 'refresh');
                
                var url = createLoginUrl('dummynonce', 'refresh');
                
                var html = "<iframe src='" + url + "' height='400' width='100%' id='oauthFrame' style='display:none;visibility:hidden;'></iframe>";
                var elem = angular.element(html);
                
                $document.find("body").append(elem);
                
                setTimeout(function() {
                    if ($localStorage['refreshRunning']) {
                        $rootScope.$broadcast(eventPrefix + 'refreshTimeout');
                        delete $localStorage['refreshRunning']
                    }
                    
                    $document.find("#oauthFrame").remove();
                }, 10000);
            };


            var handleSignInCallback = function() {
                var fragments = {}
                if (window.location.hash.indexOf("#") === 0) {
                    fragments = parseQueryString(window.location.hash.substr(16));
                }
            
                var id_token     = fragments['id_token'];
                var state        = fragments['state'];
            
                tokenService.saveToken(id_token);
                tokenService.saveClaims(tokenService.getPayload(id_token));
            
                if (state === 'refresh') {
                    delete $localStorage['refreshRunning'];
                    $rootScope.$broadcast(eventPrefix + 'refreshed');
                }
                else {
                    var localRedirect = $localStorage['localRedirect'];
                    
                    if (localRedirect) {
                        $location.path(localRedirect);
                        delete $localStorage['localRedirect'];
                    }
                    else {
                        $location.path('/');
                    }
                    
                    $rootScope.$broadcast(eventPrefix + 'loggedIn');            
                }
            };

            var handleSignOutCallback = function() {

                delete $localStorage['logoutActive'];
                
                tokenService.clearTokens();
                $location.path('/');

                $rootScope.$broadcast(eventPrefix + 'loggedOut');            
            };

            var validateExpirity = function() {
                if (!tokenService.hasToken()) return;
                if (!tokenService.hasValidToken()) return;
                
                var claims = tokenService.allClaims();
                
                var now = Date.now();
                var expiresAtMSec = claims.exp * 1000;
            
                if (now + config.advanceRefresh > expiresAtMSec) {
                    $rootScope.$broadcast(eventPrefix + 'tokenExpires');
                    tryRefresh();
                }
            };

            init();

            return {
                config: config,
            
                handleSignInCallback : handleSignInCallback,
            
                handleSignOutCallback : handleSignOutCallback,
            
                validateExpirity: validateExpirity,
            
                isAuthenticated : function() { 
                    return tokenService.hasValidToken(); 
                },
            
                signIn : function(localRedirect) { 
                    startImplicitFlow(localRedirect);
                },
            
                signOut : function() {
                    startLogout();
                },
                
                forceRefresh : function() {
                    tryRefresh();
                }
              
            };
        }]
    };
}]);

/* Helpers & Polyfills */
function parseQueryString(queryString) {
    var data = {}, pairs, pair, separatorIndex, escapedKey, escapedValue, key, value;

    if (queryString === null) {
        return data;
    }

    pairs = queryString.split("&");

    for (var i = 0; i < pairs.length; i++) {
        pair = pairs[i];
        separatorIndex = pair.indexOf("=");

        if (separatorIndex === -1) {
            escapedKey = pair;
            escapedValue = null;
        } else {
            escapedKey = pair.substr(0, separatorIndex);
            escapedValue = pair.substr(separatorIndex + 1);
        }

        key = decodeURIComponent(escapedKey);
        value = decodeURIComponent(escapedValue);

        if (key.substr(0, 1) === '/')
            key = key.substr(1);

        data[key] = value;
    }

    return data;
 };
 
     
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (searchString, position) {
        var subjectString = this.toString();
        if (position === undefined || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
}

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.lastIndexOf(searchString, position) === position;
  };
}

})();