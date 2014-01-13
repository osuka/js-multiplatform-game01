/* globals cc */
(function () {
  'use strict';

  var GameController = require('./gameController'); // cylic(!)
  var ScreenDimensions = require('./screenDimensions');
  
  // Menu (initial screen)
  //
  var MenuLayer = cc.Layer.extend({
  
    ctor: function  () {
      this._super();
      cc.associateWithNative(this, cc.Layer);
    },
  
    init: function () {
      this._super();
      this.setTouchEnabled(true);
      this.addMainMenu();
      GameController = require('./gameController'); // cyclic dep
      return true;
    },
  
    _walkChildren: function (callback) {
      var children = this.getChildren();
      for (var i = children.length - 1; i >= 0; i--) {
        var child = children[i];
        if (callback(child) === true) {
          break;
        }
      }
    },
  
    // The release event - as it stands in this code,
    // it could be missed by the target 
    onTouchesEnded: function (touches) {
      var callback = function (child) {
        var boundingBox = child.getBoundingBox();
        if (cc.rectContainsPoint(boundingBox, point)) {
          if (child.touchEnded) {
            child.touchEnded();
          }
        }
      };
      for (var j = 0; j < touches.length; j++) {
        var point = this.convertTouchToNodeSpace(touches[j]);
        this._walkChildren(callback);
      }
    },
  
    // Add some menu items
    //
    addMainMenu: function () {
      var texts = [
        { t : 'Start',
          callback : function () {
            cc.log('GameController: ');
            cc.log(GameController);
            GameController.showChapter(0);
          }},
        { t : 'Resume',
          callback : function () {
            cc.log('Resume');
          }},
        { t : 'About',
          callback : function () {
            cc.log('About');
          }}
      ];
      var actualWidth = ScreenDimensions.viewportSize.width;
      var actualHeight = ScreenDimensions.viewportSize.height;
      var highlightActionFactory = function (label, callback) {
        return function () {
          label.runAction(
            cc.Sequence.create(
              cc.ScaleTo.create(0.10, 0.4, 0.4),
              cc.CallFunc.create(callback)
            )
          );
        };
      };
      for (var i = 0; i < texts.length; i++) {
        var label = cc.LabelBMFont.create(
          texts[i].t,
          'res/headers-100.fnt',
          ScreenDimensions.viewportSize.width,
          cc.TEXT_ALIGNMENT_LEFT,
          cc.p(0, 0)
        );
        label.setPosition(cc.p(actualWidth / 2,
          (texts.length - i - 0.5) * actualHeight / texts.length));
        this.addChild(label);
        label.touchEnded = highlightActionFactory(label, texts[i].callback);
      }
    }
  });

  module.exports = MenuLayer;
})();
