
var app = angular.module('myApp', ['angularjs-dropdown-multiselect','cgNotify','ionic', 'moment-picker' ,'ui.router', 'ui.calendar','ngMaterial','md.time.picker','ui.bootstrap.contextMenu']);

app
.config(['$stateProvider','$urlRouterProvider', function ($stateProvider,$urlRouterProvider) {
  $stateProvider
        .state('VC', {
              cache: false,
              url: '/VC/:Mode/:Login/:ID',
              templateUrl: 'partials/VC.html',
              controller: 'AppCtrl' })
        .state('ER', {
              cache: false,
              url: '/ER/:Mode/:Login/:ID',
              templateUrl: 'partials/ER.html',
              controller: 'AppCtrl' })
        .state('EG', {
              cache: false,
              url: '/EG/:Mode/:Login/:ID',
              templateUrl: 'partials/EG.html',
              controller: 'AppCtrl' })
        .state('AD', {
              cache: false,
              url: '/AD/:Mode/:Login/:ID',
              templateUrl: 'partials/AD.html',
              controller: 'AppCtrl' })
        .state('ERROR', {
              cache: false,
              url: '/ERROR',
              templateUrl: 'partials/ERROR.html',
              controller: 'CtrlError' })
  // $urlRouterProvider.otherwise('/VC/0/');
}])

app.config(function($mdAriaProvider) {
   // Globally disables all ARIA warnings.
   $mdAriaProvider.disableWarnings();
});

// app.directive("disableRightClick", function () {
//     return {
//         restict: 'A',
//         link: function (scope, el) {
//             el.bind("contextmenu", function (e) {
//                 e.preventDefault();
//             });
//         }
//     };
// });

// app.directive('ngRightClick', function($parse) {
//     return function(scope, element, attrs) {
//         var fn = $parse(attrs.ngRightClick);
//         element.bind('contextmenu', function(event) {
//             scope.$apply(function() {
//                 event.preventDefault();
//                 fn(scope, {$event:event});
//             });
//         });
//     };
// });
