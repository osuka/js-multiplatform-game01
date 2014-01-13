/* globals cc */

(function () {
  'use strict';

  var ScreenDimensions = require('./screenDimensions');
  var Joystick = cc.Layer.extend({
    JOYSTICK_BASE_TAG: 99999991,
    JOYSTICK_PAD_TAG: 99999992,
    JOYSTICK_BUTTON1_TAG: 99999993,
    JOYSTICK_BUTTON2_TAG: 99999994,
  
    ctor: function () {
      this._super();
      cc.associateWithNative(this, cc.Layer);
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
      var joystickMoved = false;
      var joystickBase = this.getChildByTag(this.JOYSTICK_BASE_TAG);
      var point;
      var callback = function (child) {
        var boundingBox = child.getBoundingBox();
        if (cc.rectContainsPoint(boundingBox, point)) {
          joystickMoved = joystickMoved || (child === joystickBase);
          return child.touchedEnded && child.touchedEnded(point);
        }
      };
      for (var j = 0; j < touches.length; j++) {
        point = this.convertTouchToNodeSpace(touches[j]);
        this._walkChildren(callback);
      }
  
      // joystick is a special case, release it if there's no touches
      if (!joystickMoved && joystickBase) {
        joystickBase.touchedEnded();
      }
    },
  
    onTouchesMoved: function (touches) {
      /* jshint maxdepth: 5 */
      var children = this.getChildren();
      for (var j = 0; j < touches.length; j++) {
        var point = this.convertTouchToNodeSpace(touches[j]);
        for (var i = children.length - 1; i >= 0; i--) {
          var child = children[i];
          var boundingBox = child.getBoundingBox();
          if (cc.rectContainsPoint(boundingBox, point)) {
            if (child.touchedMoved) {
              var result = child.touchedMoved(point);
              if (result) { // stop propagating event if true
                return;
              }
            }
          }
        }
      }
    },
  
    onTouchesBegan: function (touches) {
      // Find child clicked - children are ordered by zorder
      // in parent
      if (!touches) {
        return;
      }
      var children = this.getChildren();
      /* jshint maxdepth: 5 */
      for (var j = 0; j < touches.length; j++) {
        var point = this.convertTouchToNodeSpace(touches[j]);
        for (var i = children.length - 1; i >= 0; i--) {
          var child = children[i];
          var boundingBox = child.getBoundingBox();
          if (cc.rectContainsPoint(boundingBox, point)) {
            if (child.touchedStart) {
              var result = child.touchedStart(point);
              if (result) { // stop propagating event if true
                return;
              }
            }
          }
        }
      }
    },
  
    init: function () {
      this._super();
  
      this.setTouchEnabled(true);
  
      var size = cc.p(75, 75);
      var pos = cc.p(size.x + size.x * 0.5, size.y + size.y * 0.5);
      this.createBase(pos);
      this.createPad(pos);
      this.createButtons(pos);
  
      // If we are on a browser with a keyboard, use it
      if (typeof document !== 'undefined') {
        var canvas = document.getElementById('gameCanvas');
        canvas.addEventListener('keydown',
          this.keyboardKeyDown.bind(this), false);
        canvas.addEventListener('keyup',
          this.keyboardKeyUp.bind(this), false);
      }
  
    },
  
    getBase: function () {
      return this.getChildByTag(this.JOYSTICK_BASE_TAG);
    },
  
    getJoystick: function () {
      return this.getChildByTag(this.JOYSTICK_PAD_TAG);
    },
  
    keyboardKeyDown: function (key) {
      var base = this.getBase();
      var joystick = this.getJoystick();
      var center = base.getPosition();
      var width = base.getContentSize().width / 4;
      var pos = joystick.getPosition();
      if (key.keyCode === 37) { /* LEFT ARROW */
        joystick.stopAllActions();
        joystick.setPosition(cc.p(center.x - width, pos.y));
        return true;
      }
      if (key.keyCode === 38) { /* UP ARROW */
        joystick.stopAllActions();
        joystick.setPosition(cc.p(pos.x, center.y + width));
      }
      if (key.keyCode === 39) { /* RIGHT RROW */
        joystick.stopAllActions();
        joystick.setPosition(cc.p(center.x + width, pos.y));
      }
      if (key.keyCode === 40) { /* DOWN ARROW */
        joystick.stopAllActions();
        joystick.setPosition(cc.p(pos.x, center.y - width));
      }
      if (key.keyCode === 'Z') {
  
      }
      if (key.keyCode === 'X') {
  
      }
    },
  
    keyboardKeyUp: function (key) {
      var base = this.getBase();
      var joystick = this.getJoystick();
      var center = base.getPosition();
      var pos = joystick.getPosition();
      if (key.keyCode === 37) { /* LEFT ARROW */
        joystick.stopAllActions();
        joystick.setPosition(cc.p(center.x, pos.y));
        return true;
      }
      if (key.keyCode === 38) { /* UP ARROW */
        joystick.stopAllActions();
        joystick.setPosition(cc.p(pos.x, center.y));
      }
      if (key.keyCode === 39) { /* RIGHT RROW */
        joystick.stopAllActions();
        joystick.setPosition(cc.p(center.x, pos.y));
      }
      if (key.keyCode === 40) { /* DOWN ARROW */
        joystick.stopAllActions();
        joystick.setPosition(cc.p(pos.x, center.y));
      }
      if (key.keyCode === 'Z') {
  
      }
      if (key.keyCode === 'X') {
  
      }
    },
  
    createBase: function (pos) {
      var _this = this;
      var joystickBase = cc.Sprite.create('res/joystick-base.png');
      joystickBase.setPosition(pos);
      joystickBase.touchedStart =
      joystickBase.touchedMoved = function (touchPoint) {
        var joystick = _this.getChildByTag(_this.JOYSTICK_PAD_TAG);
        if (joystick) {
          joystick.stopAllActions();
          joystick.setPosition(touchPoint);
          return true; // consume event
        }
        return false;
      };
  
      joystickBase.touchedEnded = function () {
        var joystickBase = _this.getChildByTag(_this.JOYSTICK_BASE_TAG);
        var joystick = _this.getChildByTag(_this.JOYSTICK_PAD_TAG);
        if (!joystickBase || !joystick) {
          return false;
        }
        joystick.stopAllActions();
        var center = joystickBase.getPosition();
        // var currentPos = joystick.getPosition();
        // var xd = currentPos.x - center.x;
        // var yd = currentPos.y - center.y;
        // var distance = Math.sqrt(xd * xd + yd * yd);
        joystick.runAction(cc.MoveTo.create(0.10, center));
        return true; // consume event
      };
      this.addChild(joystickBase, 100 /* zorder */, this.JOYSTICK_BASE_TAG);
    },
  
    createPad: function (pos) {
      var joystick = cc.Sprite.create('res/joystick-pad.png');
      joystick.setPosition(pos);
      this.addChild(joystick, 110 /* zorder */, this.JOYSTICK_PAD_TAG);
    },
  
    createButtons: function (pos) {
  
      var _this = this;
  
      var joystickButton1 = cc.Sprite.create('res/joystick-button.png');
      joystickButton1.setPosition(cc.p(
        ScreenDimensions.viewportSize.width - pos.x * 1.6, pos.y));
      joystickButton1.touchedStart = function (touchPoint) {
        joystickButton1.runAction(
          cc.ScaleTo.create(0.15, 0.8, 0.8));
        _this.fire1(touchPoint);
        return true; // consume event
      };
      joystickButton1.touchedEnded = function () {
        joystickButton1.runAction(
          cc.ScaleTo.create(0.15, 1, 1));
      };
  
      var joystickButton2 = cc.Sprite.create('res/joystick-button.png');
      joystickButton2.setPosition(
        cc.p(ScreenDimensions.viewportSize.width - pos.x / 2, pos.y));
      joystickButton2.touchedStart = function (touchPoint) {
        joystickButton2.runAction(
          cc.ScaleTo.create(0.15, 0.8, 0.8));
        _this.fire2(touchPoint);
        return true; // consume event
      };
      joystickButton2.touchedEnded = function () {
        joystickButton2.runAction(
          cc.ScaleTo.create(0.15, 1, 1));
      };
  
      this.addChild(joystickButton1, 110 /* zorder */,
        this.JOYSTICK_BUTTON1_TAG);
      this.addChild(joystickButton2, 110 /* zorder */,
          this.JOYSTICK_BUTTON2_TAG);
  
      return true;
    },
  
    getPadPosition: function () {
      var joystick = this.getChildByTag(this.JOYSTICK_PAD_TAG);
      var base = this.getChildByTag(this.JOYSTICK_BASE_TAG);
      var jp = joystick.getPosition();
      var bp = base.getPosition();
      return cc.p(jp.x - bp.x, jp.y - bp.y);
    },
  
    fire1: function () {
      // override this
    },
  
    fire2: function () {
      // override this
    }
  });

  module.exports = Joystick;
})();
