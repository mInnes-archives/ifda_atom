'use strict';

var ContextBrowser = require('../lib/cbd');

module.exports = function ($document, $timeout, $modal, SETTINGS, InformationObjectService, FullscreenService) {
  return {
    restrict: 'E',
    templateUrl: SETTINGS.viewsPath + '/partials/context-browser.html',
    scope: {
      id: '@',
      openViewer: '&onOpenViewer',
      files: '='
    },
    replace: true,
    link: function (scope, element) {
      // This layer will be the closest HTML container of the SVG
      var container = element.find('.svg-container');

      var cb = new ContextBrowser(container);

      // List of active nodes by its id
      scope.activeNodes = {};

      // Fetch data from the server
      scope.$watch('id', function (value) {
        if (value.length < 1) {
          return;
        }
        InformationObjectService.getTree(scope.id)
          .then(function (response) {
            cb.init(response.data);
          }, function (reason) {
            console.error('Error loading tree:', reason);
          });
      });

      cb.events.on('pin-node', function (attrs) {
        scope.$apply(function (scope) {
          scope.selectNode(attrs.id);
        });
      });

      cb.events.on('unpin-node', function (attrs) {
        scope.$apply(function () {
          scope.unselectNode(attrs.id);
        });
      });

      cb.events.on('click-background', function () {
        scope.$apply(function () {
          scope.unselectAll();
        });
      });

      // Keyboard shortcuts
      $document.on('keyup', function (event) {
        // Escape shortcut
        if (event.which === 27 && scope.isMaximized) {
          scope.$apply(function () {
            scope.toggleMaximizedMode();
          });
        // Maximized mode (f)
        } else if (event.which === 70 && !scope.isFullscreen) {
          scope.$apply(function () {
            scope.toggleMaximizedMode();
          });
        }
      });

      // Selected nodes
      scope.hasNodeSelected = function () {
        return Object.keys(scope.activeNodes).length === 1;
      };
      scope.hasNodesSelected = function () {
        return Object.keys(scope.activeNodes).length > 1;
      };
      scope.getNumberOfSelectedNodes = function () {
        return Object.keys(scope.activeNodes).length;
      };

      // Files (digital objects)
      scope.hasFiles = function () {
        return typeof scope.files !== 'undefined' && scope.files.length > 0;
      };
      scope.hasSelectedFiles = function () {
        return scope.files.some(function (element) {
          return typeof element.selected !== 'undefined' && element.selected === true;
        });
      };
      scope.cancelFileSelection = function () {
        scope.files.forEach(function (element) {
          element.selected = false;
        });
      };
      scope.selectFile = function (file, $event) {
        if (file.selected) {
          file.selected = false;
        } else {
          if ($event.shiftKey) {
            file.selected = true;
          }
        }
      };

      // Maximize/minimize. Center the graph within the loop.
      scope.isMaximized = false;
      scope.toggleMaximizedMode = function () {
        scope.isMaximized = !scope.isMaximized;
      };
      scope.$watch('isMaximized', function (oldValue, newValue) {
        if (oldValue !== newValue) {
          cb.center();
        }
      });

      scope.renderDCValue = function (value) {
        if (angular.isArray(value)) {
          return value.join(', ');
        } else if (angular.isString(value)) {
          return value;
        } else {
          return String(value);
        }
      };

      // Fullscreen mode
      scope.isFullscreen = false;
      scope.toggleFullscreenMode = function () {
        if (scope.isFullscreen) {
          FullscreenService.cancel();
        } else {
          FullscreenService.enable(element.get(0));
        }
        scope.isFullscreen = !scope.isFullscreen;
        cb.center();
      };
      scope.$on('fullscreenchange', function (event, args) {
        scope.$apply(function () {
          if (args.type === 'enter') {
            scope.isFullscreen = true;
          } else {
            scope.isFullscreen = false;
          }
        });
        cb.center();
      });

      // Hide relationships
      scope.areRelationshipsHidden = false;
      scope.hideRelationships = function () {
        scope.areRelationshipsHidden = !scope.areRelationshipsHidden;
        if (scope.areRelationshipsHidden) {
          cb.hideRelationships();
        } else {
          cb.showRelationships();
        }
      };

      // Legend
      scope.showLegend = false;
      scope.toggleLegend = function () {
        scope.showLegend = !scope.showLegend;
      };

      scope.addChildNode = function (parentId) {
        var label = prompt('Insert label');
        var id = Math.random() * 100;
        if (label.length === 0) {
          return;
        }
        cb.addNode(id, label, 'description', parentId);
      };

      scope.deleteNodes = function (ids) {
        var candidates = [];
        if (typeof ids === 'number') {
          candidates.push(ids);
        } else if (typeof ids === 'string' && ids === 'selected') {
          candidates = candidates.concat(Object.keys(scope.activeNodes));
        } else {
          throw 'I don\'t know what you are trying to do!';
        }
        cb.deleteNodes(candidates);
        scope.activeNodes = {};
      };

      scope.moveNodes = function (ids) {
        var source = [];
        if (typeof ids === 'number') {
          source.push(ids);
        } else if (typeof ids === 'string' && ids === 'selected') {
          source = source.concat(Object.keys(scope.activeNodes));
        } else {
          throw 'I don\'t know what you are trying to do!';
        }
        cb.promptNodeSelection({
          exclude: source,
          action: function (target) {
            cb.moveNodes(source, target);
          }
        });
      };

      scope.linkNodes = function (ids) {
        var source = [];
        if (typeof ids === 'number') {
          source.push(ids);
        } else if (typeof ids === 'string' && ids === 'selected') {
          source = source.concat(Object.keys(scope.activeNodes));
        } else {
          throw 'I don\'t know what you are trying to do!';
        }
        // Modal configuration
        var modalConfiguration = {
          templateUrl: SETTINGS.viewsPath + '/modals/context-browser-node-linker.html',
          backdrop: true,
          scope: scope.$new(),
          resolve: {
            source: function () {
              return source;
            }
          },
          controller: function ($scope, $modalInstance, source, target) {
            $scope.items = [
              { id: 1, name: 'hasVersion' },
              { id: 2, name: 'hasPart' },
              { id: 3, name: 'hasFormat' },
              { id: 4, name: 'hasVersion' },
              { id: 5, name: 'isReferencedBy' },
              { id: 6, name: 'isReplacedBy' },
              { id: 7, name: 'isRequiredBy' },
              { id: 8, name: 'conformsTo' }
            ];
            $scope.source = source;
            $scope.target = target;
            $scope.selected = $scope.items[0];
            // This doesn't feel right, but the <select/> has its own scope and
            // it doesn't inherit ^ $scope.selected, why?
            $scope.change = function (selection) {
              $scope.selected = selection;
            };
            $scope.save = function () {
              $modalInstance.close($scope.selected);
            };
            $scope.cancel = function () {
              $modalInstance.dismiss('Cancel');
            };
          }
        };
        // Prompt the user
        cb.promptNodeSelection({
          exclude: source,
          action: function (target) {
            modalConfiguration.resolve.target = function () {
              return target;
            };
            var modal = $modal.open(modalConfiguration);
            modal.result.then(function (type) {
              cb.createAssociativeRelationship(source, target, type);
            });
          }
        });
      };

      scope.cancelBulkEdit = function () {
        scope.unselectAll();
      };

      scope.selectNode = function (id) {
        scope.currentNode = scope.activeNodes[id] = { id: id };
        // Fetch information from the server
        InformationObjectService.getById(id).then(function (response) {
          scope.currentNode.data = response.data;

          // Retrieve a list of files or digital objects
          InformationObjectService.getDigitalObjects(id).then(function (response) {
            if (response.data.length > 0) {
              scope.files = response.data;
            } else {
              scope.files = [];
            }
          }, function () {
            scope.files = [];
          });

          // Retreive TMS metadata for the component
          if (InformationObjectService.isComponent(scope.currentNode.data.level_of_description_id)) {
            InformationObjectService.getTms(id).then(function (response) {
              scope.currentNode.data.tms = response.data;
            });
          }
        });
      };

      scope.unselectNode = function (id) {
        delete scope.currentNode;
        delete scope.activeNodes[id];
      };

      scope.unselectAll = function () {
        delete scope.currentNode;
        scope.activeNodes = {};
        cb.unselectAll();
      };
    }
  };
};