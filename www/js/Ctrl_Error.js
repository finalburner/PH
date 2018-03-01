app
.controller('CtrlError', [ '$rootScope', '$scope',
               function ($rootScope , $scope ) {


if (!$rootScope.ERROR || $rootScope.ERROR == '')
$rootScope.ERROR = 'Une erreur s\'est produite';


               }])
