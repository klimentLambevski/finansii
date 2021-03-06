define([], function () {
    /**
     * @ngdoc overview
     * @name grid.module:controllers
     * @module grid
     * @description
     *  module that wraps all controlers needed for custum grid directive
     */
    var module = angular.module("app.components.grid.controllers", []);


    /**
     * @ngdoc controller
     * @name grid.controller:gridController
     * @module grid
     * @requires ng.$scope
     * @requires ng.$http
     * @requires ng.$filter
     * @description used for handling the resuouce that fills the grid, pagination, selection of rows
     */
    module.controller("gridController", ['$scope', '$http', '$filter', 'jsonGridDataService', function ($scope, $http, $filter, jsonGridDataService) {
        jsonGridDataService.getConfig($scope.gridResource,$scope.gridParams).then(function (data) {
            $scope.config = data;
            $scope.dataChangeTag = !$scope.dataChangeTag;
        });
        jsonGridDataService.getResource($scope.gridResource,$scope.gridParams).then(function (data) {
            $scope.resources = data;
            $scope.dataChangeTag = !$scope.dataChangeTag;
        });
        $scope.data = {};
        $scope.dataChangeTag = false;
        $scope.dataReady = false;
        $scope.selectedItems = {};
        $scope.protoModels = {};
        $scope.requestInProgress=false;

        if (_.isUndefined($scope.gridOptions)) $scope.gridOptions = {};

        if (!$scope.selectedRow) {
            $scope.selectedRow = -1;
        }

        $scope.gridOrder = {
            reverse: false,
            orderColumn: -1
        };

        $scope.showAllColumns = function () {
            $.each($scope.data.colsSettings, function (i, v) {
                v.visible = true;
            });
        };

        $scope.deleteResources = function () {
            for (var id in $scope.selectedItems) {
                if ($scope.selectedItems[id]) {
                    for (var i = 0; i < $scope.data.rows.length; i++) {
                        if ($scope.data.rows[i].id == id) {
                            $scope.data.rows.splice(i, 1);
                            break;
                        }
                    }
                }
            }
            //TODO delete na server na selektiranite id-a

            $scope.dataChangeTag = !$scope.dataChangeTag;
        };


        //Za da se smenet broj na strani
        //TODO posle promena na filtered data da se desavat ova
        var wcArray = [
            'searchField',
            'pagination.currentPage',
            'pagination.pageSize',
            'gridOrder.orderColumn',
            'gridOrder.reverse',
            'dataChangeTag',
            'resources.length'
        ].toString();
        var wcArray = '[' + wcArray + ']';
        $scope.$watchCollection(wcArray, function () {
                if (!$scope.resources || !$scope.config) {
                    $scope.filteredData = null;
                    return;
                }
                var temp = $scope.resources;
                temp = $filter('filter')(temp, $scope.searchField);
                temp = $filter('orderByColumn')(temp, $scope.gridOrder.orderColumn, $scope.gridOrder.reverse);
                //Pagination is calculated before data is filtered by current page
                $scope.pagination.totalItems = temp.length;

                temp = $filter('currentPageFilter')(temp, $scope.pagination.currentPage, $scope.pagination.pageSize);
                $scope.filteredData = temp;

            }
        );

    }])


    /**
     * @ngdoc controller
     * @name grid.controller:formController
     * @module grid
     * @description controller that handles action made on the form, binding the data from the form and saving data
     */

    module.controller("formController", ['$scope', 'jsonGridDataService', '$filter', function controller($scope, jsonGridDataService,$filter) {
        var formName = $scope.gridOptions.formName;
        $scope.setFormData = function () {
            $scope.formData = {};
            var row = getRowById();
            if (row !== false) {
                $scope.formData = _.clone(row);
            }
        };
        $scope.isFormValid = function () {
            return !$scope[formName].$valid;
        };

        $scope.submitForm = function () {
            if ($scope.selectedRowId > -1) {
                updateRow();
            } else {
                addRow();
            }
            $scope.cancelForm();
        };
        $scope.cancelForm = function () {
            $scope.formData = null;
            $scope[formName].$setPristine();
        };
        function updateRow() {

            if ($scope[formName]) {
                if($scope.formData==null) return;
                $scope.requestInprogress=true;
                var postRequestData = {};
                var formData = _.clone($scope.formData);
                _($scope.config.order).each(function (column) {
                    if ($scope.config[column].type == "autocomplete" || $scope.config[column].type == "dropdown") {
                        if($scope.config[column].referencedColumn)
                            postRequestData[column] = $scope.formData[$scope.config[column].resource][$scope.config[column].referencedColumn];
                        else postRequestData[column] = $scope.formData[$scope.config[column].resource].id;
                    } else if($scope.config[column].type == "date"){
                        postRequestData[column] =$filter('date')(formData[column],"yyyy-MM-dd HH:mm:ss");
                    } else postRequestData[column] =formData[column];
                });
                jsonGridDataService.editResource($scope.gridResource, postRequestData,formData.id,$scope.gridParams).then(function (data) {

                    if (data.code == 0) {
                        var rowId = getRowIndexById();
                        $scope.resources[rowId] = formData;
                        $scope.dataChangeTag = !$scope.dataChangeTag;
                    }
                    alert(data.msg);
                    $scope.requestInprogress=false;
                });

                //TODO http post do server
            } else {
                console.log('form is not valid');
            }
        }

        function addRow() {
            if($scope.formData==null) return;
            var postRequestData = {};
            var formData = _.clone($scope.formData);
            _($scope.config.order).each(function (column) {
                if ($scope.config[column].type == "autocomplete" || $scope.config[column].type=="dropdown") {
                    if($scope.config[column].referencedColumn)
                        postRequestData[column] = $scope.formData[$scope.config[column].resource][$scope.config[column].referencedColumn];
                    else postRequestData[column] = $scope.formData[$scope.config[column].resource].id
                } else if($scope.config[column].type == "date"){
                    postRequestData[column] =$filter('date')(formData[column],"yyyy-MM-dd HH:mm:ss");
                } else postRequestData[column] = $scope.formData[column];
            });
            jsonGridDataService.saveResource($scope.gridResource, postRequestData,$scope.gridParams).then(function (data) {

                if (data.code == 0) {
                    $scope.resources.push(formData);
                    $scope.formData = null;
                    $scope.dataChangeTag = !$scope.dataChangeTag;
                }
                alert(data.msg);
            });

        }


        $scope.editDataRow = function (id, index) {
            $scope.selectedRowId = id;
            $scope.setFormData();
            $scope.formLabel = "Измени";
        };
        $scope.addNewResource = function () {
            $scope.selectedRowId = -1;
            $scope.setFormData();
            $scope.formLabel = "Додади";
        };


        function getRowById() {
            for (var i = 0; i < $scope.resources.length; i++) {
                if ($scope.resources[i].id == $scope.selectedRowId) {
                    return $scope.resources[i];
                }
            }
            return false;
        }

        function getRowIndexById() {
            for (var i = 0; i < $scope.resources.length; i++) {
                if ($scope.resources[i].id == $scope.selectedRowId) {
                    return i;
                }
            }
            return -1;
        }
    }]);

    return module;
});

