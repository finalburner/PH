app
.controller('AppCtrl', ['$filter','notify','$mdColorPalette','$ionicPopup','$ionicLoading','$ionicScrollDelegate', 'P' ,'$document', '$rootScope', '$scope', '$state', '$http', 'uiCalendarConfig', '$stateParams' ,'$ionicPopover' , '$mdDialog' , '$ionicListDelegate', '$mdDateLocale',
               function ($filter, notify, $mdColorPalette,$ionicPopup, $ionicLoading, $ionicScrollDelegate, P, $document, $rootScope, $scope,   $state,   $http,  uiCalendarConfig, $stateParams ,  $ionicPopover ,   $mdDialog , $ionicListDelegate, $mdDateLocale) {

    $scope.eventSources = []
    var Period ;
    var a,b ; //view start and end date

    function init_List_EG_GF()
    {
          $scope.List_EG_GF_Model = [];
          $scope.List_EG_GF_Translation = {
            checkAll	: 'Sélectionner tout',
            uncheckAll	: 'Désélectionner tout',
            enableSearch	: '',
            disableSearch : '',
            // selectionCount	: '',
            // selectionOf	: '',
            // searchPlaceholder	: '',
            // buttonDefaultText	: '',
            // dynamicButtonTextSuffix	: '',
            // selectGroup: '',
          }
           $scope.List_EG_GF_Options = {
             // enableSearch: false,
             // showEnableSearchButton: true,
              showCheckAll : false,
              showUncheckAll : false,
              styleActive: true,
              scrollableHeight: '300px',
              scrollable: true,
              closeOnBlur : true
              // checkBoxes: true
            };

           $scope.List_EG_GF_Events = {
               onItemSelect	: function(item){
                 $http.post( API_PH  + '/api/EG/Check_EG_GF' , {C : 1, EG : item.EG, ID : $rootScope.GF_Selected, Login : $rootScope.Login} )
                 .success(() => {
                   notify('Exception globale appliquée')
                   get_event($rootScope.Period)
                 })

               },
               onItemDeselect	: function(item){
                 $http.post( API_PH  + '/api/EG/Check_EG_GF' , {C : 0, EG : item.EG, ID : $rootScope.GF_Selected, Login : $rootScope.Login} )
                 .success(() => {
                   notify('Exception globale enlevée')
                   get_event($rootScope.Period)
                 })
               }
             };

           $http.post( API_PH  + '/api/LIST_EG_GF' , { EG: $rootScope.GF_Selected } )
                   .success(function(data) {
                            $scope.EG_GF= data;
                            $scope.EG_GF.forEach((elm) => {
                              // console.log(elm)
                              if(elm.C==1) $scope.List_EG_GF_Model.push(elm)
                            })
                            console.log($scope.EG_GF)
                            console.log($scope.List_EG_GF_Model)

                          })

    }

     // $ionicLoading.show({ //Spinner au chargement initial
     //      content: 'Loading', animation: 'fade-in', showBackdrop: true,
     //      duration: 15000, maxWidth: 200,  showDelay: 0
     //  });

     notify.config({
        duration : 2000,
        maximumOpen : 1,
        startTop : 4
      })

     $scope.EG_Selected = '0' ;
     $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      // $state.current = toState;   // if you need the target Url
     $scope.state = toState.name
      //  $state.current = fromState;// If you need the current URL
     })

     //REDIRECTION SI MODE NON DEFINI OU UTILISATEUR NON DEFINI
     console.log($stateParams)

     if (!$stateParams.Mode || !$stateParams.Login)
        {
          $rootScope.ERROR = "Paramètre Mode ou Login manquant";
          $state.go('ERROR');
        }
     else
       {
         $rootScope.Login = $stateParams.Login ;
       }

    // console.log(P)
    var API_PH = P.URL
    $scope.EG = [];
    $scope.CT = [] ;
    $scope.GF = [] ,
    $scope.CT_Selected = false;
    $scope.EG_Selected = false ;



    if(!$rootScope.DROITS) GET_RIGHTS();
    if(!$rootScope.Raison) Read_List_RAI();

    function GET_RIGHTS() {
        // console.log($stateParams.Login )
        var Login = $stateParams.Login ;
        $http.post( API_PH  + '/api/Droit' , { login : $rootScope.Login } )
             .success(function(data) {
                      $rootScope.DROITS = data
                      console.log(data)
                      if (!$rootScope.DROITS.FPHMSC)
                      $scope.uiConfig.calendar.editable2 = false;
                      if (!$rootScope.DROITS.FPHMSS)
                      $scope.uiConfig.calendar.editable1 = false;
                      if (!$rootScope.DROITS.FPHVS)
                      {  $rootScope.ERROR = "Affichage des Programmes Horaires non authorisé" ; $state.go('ERROR') }

              });
     }

    $scope.$watchGroup(['DROITS.FPHMSC', 'DROITS.FPHMSS', '$root.S'], function(newVal, oldVal) {
          if(!newVal[0] && newVal[2] == 2){
          $scope.uiConfig.calendar.editable = false;
          }
          else if(!newVal[1] && newVal[2] == 1){
          $scope.uiConfig.calendar.editable = false;
          }
          else
          $scope.uiConfig.calendar.editable = true;
    });


   if($stateParams.Mode == "0") //Avec Liste
     {
         // getCTname()
         $rootScope.PHavecList = true;
         $rootScope.Mode == "0" ;


     }

   else if ($stateParams.Mode == "1") //Sans liste /ID
   {
       getCTname()
       $rootScope.PHavecList = false
       $rootScope.GF_Selected = $stateParams.ID
       $rootScope.Mode == "1" ;

   }


  function getCTname()
  {
    $http.post( API_PH  + '/api/GF' , {ID : $stateParams.ID } )
    .success(function(data) {
             console.log(data)
             if (data[0])
             {
                  $rootScope.GF_Name_Selected = data[0].I ;
                  $rootScope.CT_Selected = data[0].L ;
             }
             else {
                  $rootScope.ERROR = "Groupe Fonctionnel non existant" ; $state.go('ERROR') ;
             }
    });
  }

  $scope.PHavecList = $rootScope.PHavecList


  $scope.filter = function(search)
  {
  $rootScope.List_CT = $filter('filter')($rootScope.List_ALL_CT, search );
  console.log(search)
  }

  $scope.Reset_CT_Search = function()
  {
    $ionicScrollDelegate.scrollTop()
  }

  $scope.Alert = function (titre,message)
  {
    var alertPopup = $ionicPopup.alert({
      title: titre,
      template: message
    });
  }

  $scope.Import_PH = function()
  {
    $ionicLoading.show({ //Spinner au chargement initial
    content: 'Loading', animation: 'fade-in', showBackdrop: true,
    duration: 120000, maxWidth: 200,  showDelay: 0
   });
    $http.post( API_PH  + '/api/GF/Import', { PTE : $rootScope.PTE_Selected })
    .success(function(data) {
      // console.log(data)
    var message = "[" + data.EXITCODE + "] "
    switch (data.EXITCODE){
         case 0 :
         message += "Programmes Horaires " + $rootScope.PTE_Selected + " importés avec succès"
         break ;
         case -1 :
         message += "Erreur dans les arguments de la ligne de commande  "
         break;
         case -2 :
         message += "Problème de connexion à la base de données"
         break;
         case -11 :
         message += "Aucun équipement trouvé"
         break;
         case -12 :
         message += "Aucun circuit trouvé"
         break;
         case -20 :
         message += "Erreur durant l'importation"
         break;
         case -31 :
         message += "Erreur de status dans le retour DevIO"
         break;
         case -32 :
         message += "Erreur dans les fichiers XML DevIO"
         break;
         case -40 :
         message += "Erreur d'exécution, vérifiez le chemin d'accès à ImportPH.exe"
         break;
         default :
         message = "Erreur" + data.EXITCODE + " d'importation des programmes horaires " + $rootScope.PTE_Selected
       }
    $ionicLoading.hide() //enleve le spinner

    var alertPopup = $ionicPopup.alert({
      title: 'Import Programmes Horaires',
      template: '<center>' +  message + '</center>'
    });

    alertPopup.then(function(res) {
      // console.log('');
      get_event($rootScope.Period)
    });
  })
  }

  $scope.init_List = function ()
  {
   if(!$rootScope.List_ALL_CT) $rootScope.List_ALL_CT = [];
   if ($rootScope.List_ALL_CT.length == 0 )
    {
      $ionicLoading.show({ //Spinner au chargement initial
          content: 'Loading', animation: 'fade-in', showBackdrop: true,
          duration: 120000, maxWidth: 200,  showDelay: 0
       });

      $http.post( API_PH  + '/api/List', { Login : $rootScope.Login })
        .success(function(data) {
                   $ionicLoading.hide() //enleve le spinner
                   // console.log(data)
                 // Script de transformation de la liste CT, GF + ID recue depuis SQL pour l'afficher sous forme de liste deroulante
                 // La Liste récupéré depuis SQL doit être impérativement ORDONNE PAR CT.
                   var CT_Actuel = '';
                   var CT_Precedant = '';
                   var j = 0 ;
                   var tab = []
                   tab.push( { CT : data[0].L, GF : [{I : data[0].I ,  ID : data[0].ID , E : data[0].E  }] }) // Ajoute le 1 ere GF
                   for (i=1 ; i< data.length; i++)
                   {
                     j = tab.findIndex(function (obj) { return (obj.CT == data[i].L) } );
                     if (j == -1)
                     {
                       tab.push( { CT : data[i].L , GF : [{I : data[i].I ,  ID : data[i].ID, E : data[i].E }] }) //Si CT différent, on cree un nouveau CT dans la liste
                     }
                     else
                     {
                     tab[j].GF.push({I : data[i].I ,  ID : data[i].ID, E : data[i].E  }) // Si le CT existe deja, on ajoute le nouveau GF
                     }
                     }
                     $ionicLoading.hide()
                     // console.log(tab)
                     $scope.$broadcast('scroll.refreshComplete');//Stop the ion-refresher from spinning
        $rootScope.List_ALL_CT = tab ;
        $rootScope.List_CT = tab ;
    });
  } else  $ionicLoading.hide()

  }


  if($rootScope.ScrollPosition)
  {
   setTimeout(() => {
        $ionicScrollDelegate.$getByHandle('listct').scrollTo(0,$rootScope.ScrollPosition  ,0) // goto list CT position
   }, 5000);
   }

  if ($rootScope.shownItem)
  {
    GET_DEFCOM($rootScope.shownItem)
  }


  $scope.PH_CT_GF = function(ID,PTE,GF,CT,DEFCOM)
  {
    if ($state.current.name != 'VC' && $state.current.name != 'ER')
      $scope.goto('ER')
      $rootScope.GF_Selected = ID
      $rootScope.GF_Name_Selected = GF ;
      $rootScope.PTE_Selected = PTE;
      $rootScope.CT_Selected = CT;
      $rootScope.DEFCOM = DEFCOM;
      init_List_EG_GF()
      get_event($rootScope.Period)

  }

  $scope.getScrollPosition = function(item)
  {
  $rootScope.ScrollPosition = parseInt($ionicScrollDelegate.$getByHandle('listct').getScrollPosition().top)
  }



   function GET_DEFCOM(CT)
   {
     $http.post( API_PH  + '/api/DEFCOM' , { CT: CT } )
          .success(function(data) {
                  console.log(data)
                  var h = 0;
                  var j = $scope.List_ALL_CT.findIndex(function(obj) { return obj.CT == data.CT })
                  var row = $scope.List_ALL_CT[j].GF.length
                   for (i=0; i <$scope.List_ALL_CT[j].GF.length ; i++)
                    {
                   h= data.GF.findIndex(function(obj) { return obj.ID == $scope.List_ALL_CT[j].GF[i].ID})
                   if (h!=-1) $scope.List_ALL_CT[j].GF[i].DEFCOM = data.GF[h].DEFCOM
                    }
                  });
   }

   $scope.expand_CT = function(item) {
             if  ($scope.isItemExpanded(item))
             {
               $rootScope.shownItem = null
             }
             else
             {
             $rootScope.shownItem = item.CT
             GET_DEFCOM(item.CT)
             console.log(item)
             }
         };

  $scope.isItemExpanded = function(item) {
    // console.log("shownitem : " + $scope.shownItem)
          return $rootScope.shownItem === item.CT;
  };


  $scope.print = function()
  {
    console.log($scope.New_EL)
  }
  $mdDateLocale.formatDate = function(date) {
    return moment(date).format('DD-MM-YYYY');
  };

  $scope.message = {
    hour: 'Heure requise',
    minute: 'Minute requise',
  }
  $scope.daySelect = [
    { day : 'Lundi' , number : 1 },
      { day : 'Mardi' , number : 2 },
        { day : 'Mercredi' , number : 3 },
          { day : 'Jeudi' , number : 4 },
            { day : 'Vendredi' , number : 5 },
              { day : 'Samedi' , number : 6 },
                { day : 'Dimanche' , number : 7 }
  ]

//initialise la vue calendaire
  $scope.init_VC = function()
  {
      $scope.titre_vue = "Vue Calendaire";
      $rootScope.S = 2 ; // S =2 , Vue calendaire
      console.log("VC")
      $scope.state = "VC" ;
      $scope.uiConfig.calendar.columnFormat = 'ddd D/M' // format column avec jour/mois
      $scope.uiConfig.calendar.editable = $scope.uiConfig.calendar.editable2
      init_List_EG_GF()

  }

  $scope.init_AD = function()
  {
      $scope.state = "AD" ;
      $rootScope.S = 4 ; // Vue Administration
  }

  $scope.init_EG = function()
  {
      $rootScope.S = 3 ; // Vue Administration
      $scope.state = "EG" ;
      Read_List_EG();
      // Read_List_CT();
  }

  //initialise la vue Evenement recurrent
  $scope.init_ER = function()
  {
    console.log("ER")
      $scope.titre_vue = "Programme standard";
      $rootScope.S = 1 ;// S = 1 , Vue recurrents
      $scope.state = "ER" ;
      $scope.uiConfig.calendar.columnFormat = 'ddd' //format column avec nom jour seul
      $scope.uiConfig.calendar.editable = $scope.uiConfig.calendar.editable1


  }

  $scope.Del_EL_Excep = function(tmp_EL)
     {
    if ($rootScope.S == 1) //Supression Tranches recurrentes
      {
          $http.post( API_PH  + '/api/TR/Del' , tmp_EL )
                .success(function() {
                      $mdDialog.hide();
                  });
      }
      else {
          if (tmp_EL.typeTranche != 1) //Suppression Exception Locale
          {
              $http.post( API_PH  + '/api/EL/Del' , tmp_EL )
                    .success(function() {
                        $mdDialog.hide();
                    });
          }
          else
          {
            // tmp_EL.idTrancheRemplace ==  tmp_EL.idTranche
              tmp_EL.heureFin = tmp_EL.heureDebut
              console.log(tmp_EL)
              $http.post( API_PH  + '/api/EL/Add' , tmp_EL )
                   .then(function() {
                        $mdDialog.hide();
                        get_event($rootScope.Period)
                    });

          }
    }
    }

  $scope.Edit_EL_Excep = function(tmp_EL)
     {
       console.log($rootScope.Raison)
      tmp_EL.heureDebut = Add_Offset(tmp_EL.heureDebut )
      tmp_EL.heureFin = Add_Offset(tmp_EL.heureFin )
      if ( $rootScope.S == 1  ) //Tranches recurrentes
      {
      $http.post( API_PH  + '/api/TR/Update' , tmp_EL )
      .then(function() {
      $mdDialog.hide();
      get_event($rootScope.Period)
      });
      }
      else { //Vue calendaire
        if (tmp_EL.typeTranche == 1 )
        {
          // tmp_EL.idTrancheRemplace ==  tmp_EL.idTranche
          $http.post( API_PH  + '/api/EL/Add' , tmp_EL )
          .then(function() {
           $mdDialog.hide();
           get_event($rootScope.Period)
           });
        }
        else {
      $http.post( API_PH  + '/api/EL/Update' , tmp_EL )
      .then(function() {
        console.log("http then")

       $mdDialog.hide();
       console.log("http then2")

       get_event($rootScope.Period)
     })
     }
      }
      }

   $scope.Add_EL_Excep = function(New_EL)
     {
      New_EL.heureDebut = Add_Offset(New_EL.heureDebut )
      New_EL.heureFin = Add_Offset(New_EL.heureFin )
      // New_EL.JS = New_EL.dateException.getDay() +1
      if ($rootScope.S == 1) //Tranches recurrentes
      {
      $http.post( API_PH  + '/api/TR/Add' , New_EL )
      .success(function() {
            $mdDialog.hide();
      });
      }
      else
      {
        $http.post( API_PH  + '/api/EL/Add' , New_EL )
        .success(function() {
              $mdDialog.hide();
        });
      }
    }

  $scope.Add_RAI = function(item)
  {
    $scope.Edit_Raison = { raison : '' , Login : $rootScope.Login}
           $mdDialog.show({
                         templateUrl: 'popup/RAI_Add.html',
                         parent: angular.element(document.body),
                         scope: $scope,
                         clickOutsideToClose:true,
                         preserveScope : true,
                         bindToController: true,
                         escapeToClose: true,
                         autoWrap:false
                         }).finally(function() {

                        })
   }

     $scope.Add_RAI_Apply = function()
     {
     $mdDialog.hide();
     $http.post( API_PH  + '/api/Raison/Add' , $scope.Edit_Raison )
          .success(function() {
           Read_List_RAI();
          });
     }

     $scope.Set_RAI = function(item)
     {
      $scope.Edit_Raison = item;
     }

     $scope.Edit_RAI = function(item)
     {
       $ionicListDelegate.closeOptionButtons();
       $scope.Edit_Raison = item;
       $mdDialog.show({
                            templateUrl: 'popup/RAI_Edit.html',
                            parent: angular.element(document.body),
                            controller : 'AppCtrl',
                            scope: $scope,
                            clickOutsideToClose:true,
                            preserveScope : true,
                            bindToController: true,
                            escapeToClose: true,
                            autoWrap:false
                            }).finally(function() {
                           })
      }

      $scope.Edit_RAI_Apply = function()
         {
          $mdDialog.hide();
          $http.post( API_PH  + '/api/Raison/Edit' , $scope.Edit_Raison )
          .success(function() {
          Read_List_RAI();
          });
          }

       $scope.Del_RAI = function(item)
       {
         if(!item) item = $scope.Edit_Raison ;
         item.Login = $rootScope.Login
                $mdDialog.hide();
                $http.post( API_PH  + '/api/Raison/Del' ,item )
                      .success(function() {
                        Read_List_RAI()
                      });
        }


      $scope.Close_Add_EL = function() {
         $mdDialog.hide()
       };


      $scope.pop_List =  [
         {name :  'Vue Calendaire', url: 'VC'},
         {name :  'Programme standard', url: 'ER' }
         ]

      $ionicPopover.fromTemplateUrl('partials/pop.html', {
      scope: $scope,
      }).then(function(popover) {
      $scope.pop = popover;
      });

     $scope.pop_open = function ($event)
     {
     $scope.pop.show($event)
     // console.log($event)
     // console.log($rootScope.GF_Selected)
     $scope.popisOpen = true ;
     }

     $scope.pop_close = function (item)
     {
     $scope.popisOpen = false ;
     $scope.pop.hide();
     $state.go(item.url, { ID : $rootScope.GF_Selected, Mode : $stateParams.Mode , Login : $stateParams.Login })
    }

     $scope.goto = function (state)
     {
      $state.go(state, { ID : $rootScope.GF_Selected, Mode : $stateParams.Mode , Login : $stateParams.Login })
     }

     $scope.$on('popover.hidden', function() {
          $scope.popisOpen = false ;
       });

//Coulour initiale des jours == false (pas d'EG )
$scope.EG_Day_Color = [false,false,false,false,false,false,false]

//A la fin du rendu du calendrier, colorier les jours en EG
$scope.eventAfterAllRender= function(view){
    for (i=0;i<7;i++)
    if ($scope.EG_Day_Color[i]) $('#d' + i ).css({'background-color': 'orange'});
    else $('#d' + i ).css({'background-color': '#E9EDF2'});
}

//Redimentionnement Graphique d'une tranche / exception
$scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view ){
  {  //oblige de passer par le popup afin de changer raison
     if ($rootScope.S == 1 ) //Evenement Récurrent
     if ($rootScope.DROITS.FPHMSS)  $scope.Open_editPopup(event)
     else notify('Vous n\'avez pas de droit de modification')
     if ($rootScope.S == 2 ) //Semaine Courante
     if ($rootScope.DROITS.FPHMSC)  $scope.Open_editPopup(event)
     else notify('Vous n\'avez pas de droit de modification')
  };
};

//Deplacement d'une tranche ou une exception
$scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view ){
  {  //oblige de passer par le popup afin de changer raison
     if ($rootScope.S == 1 ) //Evenement Récurrent
     if ($rootScope.DROITS.FPHMSS)  $scope.Open_editPopup(event)
     else notify('Vous n\'avez pas de droit de modification')
     if ($rootScope.S == 2 ) //Semaine Courante
     if ($rootScope.DROITS.FPHMSC)  $scope.Open_editPopup(event)
     else notify('Vous n\'avez pas de droit de modification')
  };
  };

//Click sur une tranche ou une exception
$scope.alertEventOnClick = function(event, delta, revertFunc, jsEvent, ui, view)
  {  if ($rootScope.S == 1 ) //Evenement Récurrent
     if ($rootScope.DROITS.FPHMSS)  $scope.Open_editPopup(event)
     else notify('Vous n\'avez pas de droit de modification')
     if ($rootScope.S == 2 ) //Semaine Courante
     if ($rootScope.DROITS.FPHMSC)  $scope.Open_editPopup(event)
     else notify('Vous n\'avez pas de droit de modification')
  };

//Click sur l'agenda dans un emplacement libre
$scope.alertOnDayClick = function(day,  jsEvent, view)
  {
     // $scope.Alert("Alerte","<center>Séléctionnez un groupe fonctionnel depuis la liste des CT</center>")
     if(!$rootScope.GF_Selected) notify('Séléctionnez un groupe fonctionnel depuis la liste des CT')
     else if (!$rootScope.PH_Actif)notify('Le programme horaire n\'a jamais été importé')
     else if ($scope.EG_Day_Color[day._d.getDay()]) notify('Une exception globale est appliquée')
     else if ($rootScope.S == 1) //Evenement Récurrent
     if ($rootScope.DROITS.FPHMSS)  $scope.Open_addPopup(day)
     else notify('Vous n\'avez pas de droit de modification')
     else if ($rootScope.S == 2) //Semaine Courante
     if ($rootScope.DROITS.FPHMSC)  $scope.Open_addPopup(day)
     else notify('Vous n\'avez pas de droit de modification')


  };


function Del_Offset(date) //Supprime l'offset du fuseau horaire
{  return new Date(date.getTime() + (60000 * date.getTimezoneOffset())) ; }

function Add_Offset(date) //Rétablit l'offset du fuseau horaire
{   return new Date(date.getTime() - (60000 * date.getTimezoneOffset())) ; }

function DEFAULT_OFFSET(date) //Ajoute un offset standard pour dateFin %r à dateDébut
{  return new Date(date.getTime() + 3600000 * 2  ) }



$scope.Open_editPopup = function(event) {
    var HF ;
    console.log(event)
    if (event.end && event.end._d) HF = Del_Offset(new Date(event.end._d)) //cas ou datefin n'est pas definie
    else HF = Del_Offset(new Date(event.start._d))

    if ($rootScope.S == 2 ) // Vue calendaire
        $scope.tmp_EL = { raison: event.source.item.idException,  heureDebut : Del_Offset(new Date(event.start._d)) , heureFin : HF , dateException : new Date(event.start._d) , GF : $rootScope.GF_Selected , idTrancheRemplace : event.source.item.idTrancheRemplace , idTranche :event.source.item.idTranche , typeTranche : event.source.item.typeTranche, Login : $rootScope.Login }
    else
    { // Vue semaine standard
        var DAY = event.start._d.getDay()
        if( DAY== 0 ) DAY =7 ;
        $scope.tmp_EL = { raison: event.source.item.idException, heureDebut : Del_Offset(new Date(event.start._d)) , heureFin : HF , day : DAY , GF : $rootScope.GF_Selected , idTranche :event.source.item.id, Login : $rootScope.Login }
    }

    console.log($scope.tmp_EL )
    $mdDialog.show({
                  templateUrl: 'popup/EL_Edit.html',
                  parent: angular.element(document.body),
                  scope: $scope,
                  clickOutsideToClose: true,
                  preserveScope: true,
                  bindToController: true,
                  escapeToClose: true,
                  autoWrap: false
    }).finally(function()  {
                  get_event($rootScope.Period)
    });
};

  $scope.Open_addPopup = function(day) {

    var DAY =  day._d.getDay()
    if (DAY == 0 ) DAY = 7
    if ($rootScope.S == 2 ) // Vue calendaire
    $scope.New_EL = { heureDebut : Del_Offset(new Date(day._d)) , heureFin : DEFAULT_OFFSET(Del_Offset(new Date(day._d))) , dateException : new Date(day._d) , GF : $rootScope.GF_Selected , Login : $rootScope.Login  }
    else {
    $scope.New_EL = { heureDebut : Del_Offset(new Date(day._d)) , heureFin : DEFAULT_OFFSET(Del_Offset(new Date(day._d))) , dateException : new Date(day._d) , GF : $rootScope.GF_Selected , day : DAY, Login : $rootScope.Login }

    }
    // console.log($scope.New_EL)
    $mdDialog.show({
                  templateUrl: 'popup/EL_Add.html',
                  parent: angular.element(document.body),
                  scope: $scope,
                  clickOutsideToClose: true,
                  preserveScope : true,
                  bindToController: true,
                  escapeToClose: true,
                  autoWrap:false
            }).finally(function()  {
                  get_event($rootScope.Period)
            });
  };

$scope.Close_editPopup = function() {
          $mdDialog.hide()
          $ionicLoading.hide()
  };


  $scope.defaultView = "agendaWeek"
  $scope.uiConfig = {
     calendar:{
       height: 'auto',
       editable: true,
       firstDay: 1 ,
       nowIndicator : true, //marker for current time
       aspectRatio : 2 ,
       handleWindowResize : true,
       contentHeight : 'auto' ,
       allDaySlot : false ,
      //  titleFormat : 'MMM D YYYY d',
       columnFormat : 'ddd D/M',
       timeFormat:'H:mm', // Month 24 hour timeformat
       axisFormat: 'H:mm', // Week & Day 24 hour timeformat
       defaultView : 'agendaWeek' ,
       dayNamesShort : ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'] ,
       weekNumbers: false,
       overlap : false,
       eventConstraint : {
         start : '00:00',
         end : '23:59'
       },
       eventResourceEditable: false,
       nextDayThreshold: '08:00:00',
      //  dayNamesShort : ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'] ,
       header:{
        left: '',
         center: '',
         right: ''
       },
       timeFormat: {
                // for agendaWeek and agendaDay do not display time in title (time already displayed in the view)
                agenda: 'H:mm',
            },
       customButtons: {
       intervalweek: {
             text: 'title' ,
             click: function() {
                 alert('clicked the custom button!');
             }
         }
      },
       dayClick : $scope.alertOnDayClick,
       eventClick: $scope.alertEventOnClick,
       eventDrop: $scope.alertOnDrop,
       eventResize: $scope.alertOnResize,
       eventAfterAllRender : $scope.eventAfterAllRender,

       viewRender: function(view, element) {

     // console.log(view) //info view
     a = view.start._d;
     b = new Date(view.end._d.getFullYear(),view.end._d.getMonth(),view.end._d.getDate());
     // console.log(a + "-" + b)


      $rootScope.Period = {
              dateDebut_Day : a.getUTCDate(),
              dateDebut_Month : a.getUTCMonth()  ,
              dateDebut_Year : a.getUTCFullYear() ,
              dateFin_Day : b.getUTCDate() ,
              dateFin_Month : b.getUTCMonth()  ,
              dateFin_Year : b.getUTCFullYear()
            }

      if($rootScope.GF_Selected && $rootScope.GF_Selected!="")
      get_event($rootScope.Period)
     // Read_List_RAI()
     //

      if ($rootScope.Period.dateDebut_Month == $rootScope.Period.dateFin_Month)
       $scope.title = "Du " + $rootScope.Period.dateDebut_Day + "" + " au " + $rootScope.Period.dateFin_Day + " " + months[$rootScope.Period.dateDebut_Month]
       else
       $scope.title = "Du " + $rootScope.Period.dateDebut_Day + " " + months[$rootScope.Period.dateDebut_Month] +  " au " + $rootScope.Period.dateFin_Day + " " + months[$rootScope.Period.dateFin_Month]
     }
     }
   };

  //  $(document).on('change', 'body', function(){
  //    console.log( $(document).find('#d20170904'));
  //    $(document).find('#d20170904').css({'background-color': 'orange'});
  //  });
  // angular.element('#d20170904').css({'background-color': 'orange'});
  // $('.fc-slot5').css({'background-color':'yellow', 'opacity':0.5 });
  //  uiCalendarConfig.calendars.fullCalendar('next')
  // angular.element('#cal').fullCalendar('next');
  //  console.log(uiCalendarConfig.calendars);

  //  $scope.myCalendar.fullCalendar('changeView', 'agendaDay' );
  //  uiCalendarConfig.calendars.myCalendar.fullCalendar('unselect');
  // uiCalendarConfig.calendars[calendar].fullCalendar('changeView',view);
     //  angular.element('.calendar').fullCalendar('next');

  //  $scope.myCalendar.fullCalendar('changeView', 'agendaDay' );

  //  $scope.myCalendar.fullcalendar('next');
  //  $scope.calendar.fulzlcalendar('next');
  $scope.changeView = function(view) {
        // $scope.myCalendar.fullCalendar('changeView',view);
    };

  function get_event(Period)
  {

    console.log("GET_EVENT DONE ")
    $ionicLoading.show({ //Spinner au chargement initial
      content: 'Loading', animation: '', showBackdrop: true,
      duration: 15000, maxWidth: 200,  showDelay: 0
    });

    if($rootScope.GF_Selected)
    $http.post(API_PH + '/api/import_export' , { GF :  $rootScope.GF_Selected } )
     .success(function(data) {
       if(data)
       {
         console.log(data)
         $rootScope.PH_Actif = data.Actif
         $rootScope.PH_Modifie = data.Modifie
       }
     })

    var d_start ;
    $scope.EG_Day_Color = [false,false,false,false,false,false,false]
    $scope.eventSources.length = 0 ;

    if ($rootScope.S == 2 && $rootScope.GF_Selected)
      {
        $http.post(API_PH + '/api/event' , { ID : $rootScope.GF_Selected , Period : Period } )
         .success(function(data) {
              $ionicLoading.hide()
              console.log(data)
              $scope.eventSources.length = 0
              var len = data.length ;
              for (var i = 0 ; i < len; i++) {
              //   console.log(data[i]);
              // arr.slice(début, fin)
              var s = data[i].laDate.slice(0,10) + data[i].heureDebut.slice(10)
              var e= data[i].laDate.slice(0,10) + data[i].heureFin.slice(10)
              var h = $rootScope.Raison[$rootScope.Raison.findIndex(function(obj) { return obj.id == data[i].idException})];
              if (h) h = h.raison  // lit le nom de la raison si elle existe dans le tableau
              //Tranche récurrente
              if (data[i].typeTranche  == 1)
              $scope.eventSources.push(
              {   events :
               [ { start : s , end : e }],
               item : data[i],
               color : 'rgba(115, 83, 202, 0.5)',
               textColor: 'black'
             }
             )

             //Tranche Evenement Récurrent modifié Elargi
             if (data[i].typeTranche  == 2)
               $scope.eventSources.push(
               {   events :
                [ {title : h, start : s , end : e}],
                item : data[i],
                color : 'rgba(14, 103, 255, 0.5)',
                textColor: 'black'
              }
              )

            //Tranche Evenement Récurrent modifié Rétréci
              if (data[i].typeTranche  == 3)
                $scope.eventSources.push(
                {   events :
                 [ {title : h, start : s , end : e }],
                 item : data[i],
                 color : 'rgba(80, 227, 194, 0.5)',
                 textColor: 'black'
               }
               )

               //Tranche recurrente supprimée
            //  if (data[i].typeTranche  == 4)
            //      $scope.eventSources.push(
            //      {   events :
            //       [ {start : s , end : e }],
            //       item : data[i],
            //       color : 'rgba(193, 66, 66, 0.2)',
            //       textColor: 'black'
            //     }
            //     )

                //Exception globale
              if (data[i].typeTranche  == 5)
              {
                var day = new Date(data[i].laDate).getDay();
                // console.log(day)
                // if (!$scope.EG_Day_Color[day])
                 $scope.EG_Day_Color[day] = true;
              }

              console.log($scope.EG_Day_Color)
              console.log(data)


                 }
              })
         .error(function(data) {
             notify('Erreur /Api/Event')
             console.log(data);
         });
       }
       else if ($rootScope.S == 1 && $rootScope.GF_Selected)
       {
         // console.log($rootScope.S)
         // // console.log(data)
         $http.post(API_PH + '/api/event_ER' , { ID : $rootScope.GF_Selected , Period : Period } )
        .success(function(data) {
          console.log(data)
         $ionicLoading.hide();
         $scope.eventSources.length = 0 ;
         var len = data.length ;
         for (var i = 0 ; i < len; i++) {
         //   console.log(data[i]);
         // arr.slice(début, fin)
         var d_start = new Date() // Monday Week Start
         if (data[i].numJourSemaine - 1 == 0 )
         d_start.setDate(d_start.getDate() - (d_start.getDay() + 6) % 7 + 6  )
         d_start.setDate(d_start.getDate() - (d_start.getDay() + 6) % 7 + data[i].numJourSemaine -1  )
         var s = d_start.toISOString().slice(0,10) + data[i].heureDebut.slice(10)
         var e = d_start.toISOString().slice(0,10) + data[i].heureFin.slice(10)

         $scope.eventSources.push(
         {   events :
          [ {start : s , end : e }],
          item : data[i],
          color : 'rgba(115, 83, 202, 0.5)',
          textColor: 'black'
          })
         }
        })
        .error(function(data) {
           notify('Erreur /Api/Event_ER')
           console.log('Error: ' + data);
        });
         }
        }


  var months = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Aout","Septembre","Octobre","Novembre","Décembre"]


      $scope.viewRender = function(view, element) {
      $scope.info = view
    }

     $scope.nextCalendar = function(){
       if($rootScope.GF_Selected)
       uiCalendarConfig.calendars.myCalendar.fullCalendar('next')
       else
       $scope.Alert("Alerte","<center>Séléctionnez un groupe fonctionnel depuis la liste des CT</center>")
     };

     $scope.prevCalendar = function(){
       if($rootScope.GF_Selected)
       uiCalendarConfig.calendars.myCalendar.fullCalendar('prev')
       else
       $scope.Alert("Alerte","<center>Séléctionnez un groupe fonctionnel depuis la liste des CT</center>")
     };

     $scope.today = function(){
       if($rootScope.GF_Selected)
       uiCalendarConfig.calendars.myCalendar.fullCalendar('today')
       else
       $scope.Alert("Alerte","<center>Séléctionnez un groupe fonctionnel depuis la liste des CT</center>")
     };

/////////////// VUE EXCEPTION GLOBALE ////////////////////////////////////////////

      $mdDateLocale.formatDate = function(date) {
        return moment(date).format('DD-MM-YYYY');
      };

      $scope.JourSeul = function(item)
      {
        if ($scope.tmp_EG) { console.log($scope.tmp_EG) ; $scope.tmp_EG.dateFin = $scope.tmp_EG.dateDebut; }
        if ($scope.New_EG) $scope.New_EG.dateFin = $scope.New_EG.dateDebut;

      }



      function Read_List_CT() {

          $http.post( API_PH  + '/api/EG/List_CT' , { EG : $scope.EG_Selected} )
               .success(function(data) {
                        // console.log(data)
                        $ionicLoading.hide() //enleve le spinner
                        $scope.CT= data;

      });}


      function Read_List_GF(CT,EG , callback) {
          $http.post( API_PH  + '/api/EG/List_GF' , { CT : CT , EG: $scope.EG_Selected } )
                .success(function(data) {
                         $scope.GF= data;
                         if(callback) callback()
                         $ionicLoading.hide() //enleve le spinner
       });}

       function Read_List_EG() {
           $http.post( API_PH  + '/api/EG/List' )
                .success(function(data) {
                 // console.log(data)
                 $rootScope.ExpG = data;
                 $ionicLoading.hide() //enleve le spinner
          }); }

      function Read_List_RAI() {
          $http.get(API_PH + '/api/Raison' )
               .success(function(data) {
                        $rootScope.Raison = data ;
                        $ionicLoading.hide()
                        // console.log(data)
        })
      }

      $scope.Edit_EG = function(item)
      {
        $ionicListDelegate.closeOptionButtons();
        $scope.tmp_EG = item;
        $scope.tmp_EG.Login = $rootScope.Login;
        console.log($scope.tmp_EG)
        $mdDialog.show({
                  templateUrl: 'popup/EG_Edit.html',
                  parent: angular.element(document.body),
                  scope: $scope,
                  clickOutsideToClose:true,
                  preserveScope: true,
                  autoWrap:false
                })
         }

       $scope.Add_EG = function()
         {

           $scope.New_EG = { nom : '', description : '' ,  dateDebut : new Date() , dateFin : new Date() , repetitionAnnuel : 0 , vacances : 0, Login : $rootScope.Login }
           $mdDialog.show({
                     templateUrl: 'popup/EG_Add.html',
                     parent: angular.element(document.body),
                     scope: $scope,
                     clickOutsideToClose:true,
                     preserveScope: true,
                     autoWrap:false
                   })
            }


      $scope.Close_Edit_EG = function() {
         $mdDialog.hide()
       };

       var all_selected = true
       var j ;

       $scope.Check_EG_GF = function(item , callback)
        {
         $http.post( API_PH  + '/api/EG/Check_EG_GF' , {C : item.C, EG : $scope.EG_Selected, ID : item.ID, Login : $rootScope.Login} )
         .success(function() {
                          if (item.C) notify('Exception globale appliquée')
                          if (!item.C) notify('Exception globale enlevée')
                           j = $scope.CT.findIndex(function (obj) { return (obj.L == $scope.CT_Selected) } );
                           all_selected = true; oneselect = false;
                           for(i=0;i<$scope.GF.length;i++)
                           if ($scope.GF[i].C == false)
                           all_selected = false
                           else
                           oneselect = true
                           $scope.CT[j].C = all_selected
                           $scope.CT[j].P = oneselect
                           $ionicLoading.hide() //enleve le spinner
                           if(callback) callback();

         });
         }

        $scope.Check_CT = function (item)
        {
          $ionicLoading.show({ //Spinner au chargement initial
            content: 'Loading', animation: 'fade-in', showBackdrop: true,
            duration: 5000, maxWidth: 200,  showDelay: 0
            });
          if (item.L == $scope.CT_Selected)
        {
          for(i=0;i<$scope.GF.length; i++)
         { $scope.GF[i].C = item.C
           console.log($scope.GF[i])
           $scope.Check_EG_GF($scope.GF[i])
          }
        }
        else
        {
          $scope.CT_Selected = item.L
          Read_List_GF(item.L, $scope.EG_Selected, function(){

                for(i=0;i<$scope.GF.length; i++)
                { $scope.GF[i].C = item.C
                  $scope.Check_EG_GF($scope.GF[i])
                }

              })
        }
        }

        $scope.Add_EG_Apply = function()
        {
        $mdDialog.hide();
        $http.post( API_PH  + '/api/EG/Add' , $scope.New_EG )
              .success(function() {
                Read_List_EG()
              });
        }

        $scope.Edit_EG_Apply = function(tmp_EG)
        {
          if($scope.JourSeulSelected) $scope.tmp_EG.jourFin = angular.copy($scope.tmp_EG.jourDebut) ;
          $mdDialog.hide();
          $http.post( API_PH  + '/api/EG/Edit' , tmp_EG )
                .success(function() {
                  Read_List_EG()
                });
        }

        $scope.Del_EG = function(item)
        {
          $mdDialog.hide();
          $http.post( API_PH  + '/api/EG/Del' , { id : item.id, Login : $rootScope.Login} )
                .success(function() {
                  $scope.EG_Selected = false
                  $scope.CT = []
                  $scope.GF = []
                  Read_List_EG()
                });
         }

       $scope.CT_Show = function(item)
       {
         if ($scope.EG_Selected_item =item)
         {
              $ionicLoading.show({ //Spinner au chargement initial
                content: 'Loading', animation: '', showBackdrop: true,
                duration: 5000, maxWidth: 200,  showDelay: 0
              });
              console.log(item)

              $scope.EG_Selected = item.id ;
              $scope.EG_Selected_item = item;
              $scope.EG_Clicked = true;
              Read_List_CT()
              if ($scope.CT_Selected && $scope.EG_Selected)
              Read_List_GF($scope.CT_Selected,$scope.EG_Selected)
          }
        }

      $scope.GF_Show = function(CT)
       {
      //  console.log(CT)
       $scope.CT_Selected = CT ;
       $scope.CT_Clicked = true;
      //  console.log($scope.CT_Clicked == CT)
       if ($scope.EG_Selected && $scope.CT_Selected)
       Read_List_GF($scope.CT_Selected,$scope.EG_Selected)
       }

       $scope.isEGSelected = function(item)
       {
         return $scope.EG_Selected == item.id
       }

       $scope.isCTSelected = function(item)
       {
         return $scope.CT_Selected == item.L
       }


       $scope.menuOptions_EG = [
          {    text: 'Modifier',
               click: function ($itemScope, $event, modelValue, text, $li) {
               $scope.Edit_EG($scope.EG_Selected_item)
               }
           },
          {     text: 'Supprimer',
                click: function ($itemScope, $event, modelValue, text, $li) {
                $scope.Del_EG($scope.EG_Selected_item)
              }
            }
              ];

      $scope.menuOptions_RAI = [
           {    text: 'Modifier',
                click: function ($itemScope, $event, modelValue, text, $li) {
                $scope.Edit_RAI($scope.Edit_Raison)
                }
            },
           {     text: 'Supprimer',
                 click: function ($itemScope, $event, modelValue, text, $li) {
                 $scope.Del_RAI($scope.Edit_Raison)
               }
             }
              ];

}]);
//   $scope.eventSources = [{
//     events: [
//         {
//             title: 'Event1',
//             start: '2017-06-26T12:00:00',
//             end: '2017-06-26T17:00:00'
//         },
//         {
//             title: 'Event2',
//             start: '2017-06-27T14:00:00',
//             end: '2017-06-26T17:00:00'
//         }
//         // etc...
//     ],
//     color: 'rgba(174, 159, 218, 0.7)',   // an option!
//     textColor: 'white', // an option!
//     editable : true // Evenement non éditable
// }, {
//  events: [
//       {
//           title: 'Event2',
//           start: '2017-06-28T10:00:00',
//           end: '2017-06-28T13:00:00'
//       }
//   ],
//   color: 'rgba(124, 168, 245, 0.7)',   // an option!
//   textColor: 'white' // an option!
// }
// ];
//    //Horaire modifiable ( pour validation)
//   $scope.exploc = false ;
//   $scope.tmp_event =
//   { start :  moment(event.start._d).utc() , end : moment(event.end._d).utc() } ;
//
//    //horaire initiale
//   $scope.initdate =
// {  start : moment(event.start._d).utc().format('DD-MM-YYYY  à  HH:mm') ,
//    end : moment(event.end._d).utc().format('DD-MM-YYYY  à  HH:mm')  } ;

  //  $scope.tmp_EL = { heureDebut :  moment(event.start._d).utc() , heureFin : moment(event.end._d).utc() } ;
  //  console.log($scope.tmp_EL)
  //  $scope.tmp_EL.start = moment($scope.tmp_EL.start).utc()
  //  console.log($scope.tmp_EL.start._i)
  //  $scope.tmp_EL.heureFin =  new Date()
  //  $scope.tmp_EL.laDate = moment($scope.tmp_EL.laDate)
