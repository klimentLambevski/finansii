define([], function() {

        var module=angular.module('app.pages.resources.retail',[]);

        module.controller('resourcesCalculationsPageController',function($scope){
            $scope.selectedResource=-1;
        })
        module.directive('resourcesCalculationsPage',function(){
            function link($scope){
                    $scope.resources=[{
                        name:'Компании',
                        resource:'companies'
                    },{
                        name:'Тарифи',
                        resource:'tariffs'
                    },{
                        name:'Единици мерки',
                        resource:'units'
                    },{
                        name:'Артикли',
                        resource:'articles'
                    },{
                        name:'Тип калкулација',
                        resource:'calculation_types'
                    },{
                        name:'Бизнис единици',
                        resource:'business_units'
                    },{
                        name:'Партнери',
                        resource:'partners'
                     },{
                        name:'Места',
                        resource:'settlements'
                    },{
                        name:'Општини',
                        resource:'municipalities'
                    },{
                        name:'Улици',
                        resource:'streets'
                    },{
                        name:'Банки',
                        resource:'banks'

                    }]
            }
            return {
                restrict:'EA',
                link:link,
                templateUrl:"app/pages/retail/resources/resources.html"
            }
        });


        return module;
});