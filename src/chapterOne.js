/* globals cc, cp */

(function () {
  'use strict';
    
  var PhysicsSpriteHelper = require('./physicsSprite');
  var BaseLayer = require('./baseLayer');
  var ScreenDimensions = require('./screenDimensions');

  var ChapterOne = BaseLayer.extend({

    TAG_GOAL :   29999995,

    init: function () {
      this._super();
      this.lastTime = 0;
      this.setTouchEnabled(true);

      var tilemap = this.createTilemap();

      // To put the top-left corner of the map on the top left
      // corner of the screen you would do:
      // tilemap.setPosition( cc.p(0, -mapheight + SD.viewportSize.height) );

      var gameArea = this.getChildByTag(this.TAG_GAMEAREA_LAYER);
      gameArea.setAnchorPoint(0, 0);
      gameArea.addChild(tilemap, 0, this.TAG_TILEMAP);

      this.createBoundaries();

      this.createSpriteBatch();

      this.createCharacterDefinitions();

      this.createSolids(tilemap);

      this.createGoal(tilemap);

      this.createGenerators(tilemap);

      this.createAttackers(tilemap);

      this.createDefendants(tilemap);

      var pos = cc.p(0, 0);
      this.ensureGameAreaPositionWithinBoundaries(pos);
      gameArea.setPosition(pos);

      return true;

    },

    createTilemap: function () {
      var tilemap = cc.TMXTiledMap.create('res/maps/scene00.tmx');
      if (ScreenDimensions.scale < 2) {
        tilemap.setScale(0.5);
      } else {
        tilemap.setScale(1);
      }
      this.worldSize = {
        width : tilemap.getBoundingBox().width,
        height : tilemap.getBoundingBox().height
      };
      return tilemap;
    },

    // (helper) move from (x,y) to array, plus fix string to integer
    // and reverse y because different coordinate system
    pointToArray: function (p) {
      return [parseInt(p.x, 10), -parseInt(p.y, 10)];
    },

    // Returns a Chipmunk shape object from a TileMap ObjectGroup's object
    shapeForObject: function (tmxObject, scale) {
      var cpShape;
      // BUG: in native, instead of polygonPoints we have 'points'
      var points = tmxObject.polygonPoints || tmxObject.points;
      if (points) {
        // turn from array of objects into array of arrays
        // TODO: Check clockwise, reverse accordingly
        var arrays = points.map(this.pointToArray);
        // chipmunk wants polygons as a flat list of numbers
        // plus we need to scale them accordingly
        var flatten = [].concat.apply([], arrays)
                      .map(function (n) {
          return n * scale;
        });
        cpShape = new cp.PolyShape(
          this.space.staticBody,
          flatten,
          cp.v(scale * parseInt(tmxObject.x, 10),
               scale * parseInt(tmxObject.y, 10))
        );
      } else {
        // convert rectangle to polygon
        var w = scale * parseInt(tmxObject.width, 10);
        var h = scale * parseInt(tmxObject.height, 10);
        cpShape = new cp.PolyShape(
          this.space.staticBody,
          [0, 0,
           0, h,
           w, h,
           w, 0
          ],
          cp.v(scale * parseInt(tmxObject.x, 10),
               scale * parseInt(tmxObject.y, 10))
        );
      }
      return cpShape;
    },

    // Returns a cocos Rect object from a TileMap ObjectGroup's object,
    // warning of objects that are actually polygons
    ccRectForObject: function (tmxObject, scale) {
      if (tmxObject.polygonPoints && tmxObject.polygonPoints.length) {
        cc.log('Warning: ccRectForObject called with polygon');
        return undefined;
      } else {
        return cc.rect(
          scale * parseInt(tmxObject.x, 10),
          scale * parseInt(tmxObject.y, 10),
          scale * parseInt(tmxObject.width, 10),
          scale * parseInt(tmxObject.height, 10)
        );
      }
    },

    // Returns a cocos position object from a TileMap ObjectGroup's object,
    // warning of objects that are actually polygons
    ccPosForObject: function (tmxObject, scale) {
      if (tmxObject.polygonPoints && tmxObject.polygonPoints.length) {
        cc.log('Warning: ccRectForObject called with polygon');
        return undefined;
      } else {
        return cc.p(
          scale * parseInt(tmxObject.x, 10),
          scale * parseInt(tmxObject.y, 10)
        );
      }
    },

    createGoal: function (tilemap) {
      var gameArea = this.getChildByTag(this.TAG_GAMEAREA_LAYER);
      var tilemapSprite =
      gameArea.getChildByTag(this.TAG_TILEMAP);
      var scale = tilemapSprite.getScale();

      var goals = tilemap.getObjectGroup('goal').getObjects();
      var goal = goals[0];

      var w = scale * parseInt(goal.width, 10);
      var h = scale * parseInt(goal.height, 10);
      var sprite = cc.Sprite.create('res/1x1-pixel.png');
      sprite.setPosition(cc.p(scale * parseInt(goal.x, 10),
             scale * parseInt(goal.y, 10)));
      sprite.setScaleX(w * scale);
      sprite.setScaleY(h * scale);
      sprite.setAnchorPoint(cp.v(0, 0));
      gameArea.addChild(sprite, 10000, this.TAG_GOAL);

      sprite.runAction(
        cc.RepeatForever.create(
          cc.Sequence.create(
              cc.FadeIn.create(0.5),
              cc.FadeOut.create(1.0)
      )));

    },

    createAttackers: function (tilemap) {
      var gameArea = this.getChildByTag(this.TAG_GAMEAREA_LAYER);
      var tilemapSprite =
      gameArea.getChildByTag(this.TAG_TILEMAP);
      var scale = tilemapSprite.getScale();

      var attackers = tilemap.getObjectGroup('attackers').getObjects();
      var tag = 11000;
      for (var i = 0; i < attackers.length; i++) {
        var pos = this.ccPosForObject(attackers[i], scale);
        this.createSampleChar('persona',
          pos, tag + 1, 1 /* zoom */);
      }
    },

    createDefendants: function (tilemap) {
      var gameArea = this.getChildByTag(this.TAG_GAMEAREA_LAYER);
      var tilemapSprite =
      gameArea.getChildByTag(this.TAG_TILEMAP);
      var scale = tilemapSprite.getScale();

      var attackers = tilemap.getObjectGroup('defendants').getObjects();
      var tag = 12000;
      for (var i = 0; i < attackers.length; i++) {
        var pos = this.ccPosForObject(attackers[i], scale);
        this.createSampleChar('defendant',
          pos, tag + 1, 1 /* no zoom */);
      }
    },

    createGenerators: function (tilemap) {
      var attackers = tilemap.getObjectGroup('generator-attacker')
        .getObjects();
      var defendants = tilemap.getObjectGroup('generator-defendant')
        .getObjects();

      var gameArea = this.getChildByTag(this.TAG_GAMEAREA_LAYER);
      var tilemapSprite =
      gameArea.getChildByTag(this.TAG_TILEMAP);
      var scale = tilemapSprite.getScale();
      var _this = this;
      this.attackGenerators = attackers.map(function (obj) {
        return _this.ccRectForObject(obj, scale);
      });
      this.defendantGenerators = defendants.map(function (obj) {
        return _this.ccRectForObject(obj, scale);
      });

    },

    // If a generator is clicked, returns it's center, undefined otherwise
    checkGeneratorClicked: function (point) {
      var gameArea = this.getChildByTag(this.TAG_GAMEAREA_LAYER);
      var worldPoint = {
        x : point.x - gameArea.getPosition().x,
        y : point.y - gameArea.getPosition().y
      };
      var margin = 4; // make it easier to click
      var worldRect = cc.rect(
        worldPoint.x - margin, worldPoint.y - margin,
        margin * 2, margin * 2);
      var tag = 10000; // TODO: need a different tag?
      for (var i = 0; i < this.attackGenerators.length; i++) {
        var r = this.attackGenerators[i];
        if (cc.rectIntersectsRect(worldRect, r)) {
          var center = cc.p(
             worldRect.x + worldRect.width / 2,
             worldRect.y + worldRect.height / 2);
          this.createSampleChar('persona',
            center, tag, 1 /* zoom */);
          return center;
        }
      }
      return undefined;
    },

    createSolids: function (tilemap) {
      var objectGroup = tilemap.getObjectGroup('solids');
      var objects = objectGroup.getObjects();

      var gameArea = this.getChildByTag(this.TAG_GAMEAREA_LAYER);
      var tilemapSprite =
      gameArea.getChildByTag(this.TAG_TILEMAP);
      var scale = tilemapSprite.getScale();
      for (var i = 0; i < objects.length; i++) {
        var shape = this.shapeForObject(objects[i], scale);
        this.space.addStaticShape(shape);
        shape.setElasticity(1);
        shape.setFriction(1);
      }
    },

    createSpriteBatch: function () {
      // load shared graphics
      // good reference: http://www.cocos2d-x.org/forums/19/topics/23698
      var spritesheetName = 'res/sprites/spritesheet1_';
      if (ScreenDimensions.scale >= 2) {
        spritesheetName += '2x';
      } else {
        spritesheetName += '1x';
      }
      var spriteBatch = cc.SpriteBatchNode.create(spritesheetName + '.png');
      var cache = cc.SpriteFrameCache.getInstance();
      cache.addSpriteFrames(spritesheetName + '.plist');
      var gameArea = this.getChildByTag(this.TAG_GAMEAREA_LAYER);
      gameArea.addChild(spriteBatch, 100, this.TAG_SPRITEBATCH);
    },

    setSpriteStateBasedOnVelocity: function (sprite, body) {
      if (!body) {
        return; // this AI only works with physical bodies
      }
      var animations = cc.AnimationCache.getInstance();

      var state;

      // Main idea:
      // Determine wheter it's going "more" vertically or horizontally
      // to choose the sprite
      var howMuchVert = Math.abs(body.getVel().y);
      var howMuchHoriz = Math.abs(body.getVel().x);
      var isVertical = howMuchVert > howMuchHoriz;

      if (isVertical && howMuchVert > 0.5) {
        state = (body.getVel().y > 0.5) ? '.up' : '.down';
      } else if (howMuchHoriz > 0.25) {
        state = (body.getVel().x > 0.25) ? '.right' : '.left';
      } else {
        state = '.standing';
      }

      if (sprite.state !== state) {
        sprite.state = state;
        sprite.stopAllActions();
        sprite.runAction(
          cc.RepeatForever.create(
            cc.Animate.create(
              animations.getAnimation(sprite.character + sprite.state)
        )));
      }
    },

    randomWalkingAI: function (dt, sprite, body) {
      body.setAngle(0);
      this.setSpriteStateBasedOnVelocity(sprite, body);

      if (Math.random() < 0.05) {
        if (Math.random() < 0.2) {
          body.setVel(cp.v(0, 0));
        } else {
          body.setVel(cp.v(2000 * dt * (Math.random() * 2 - 1),
                           2000 * dt * (Math.random() * 2 - 1)));
          body.setAngVel(0);
          body.setAngle(0);
        }
      }
    },

    // tries to walk to goal
    walkToGoalAI: function (dt, sprite, body) {

      if (Math.random() < 0.3) {
        return this.randomWalkingAI(dt, sprite, body);
      }

      body.setAngle(0);
      this.setSpriteStateBasedOnVelocity(sprite, body);

      var gameArea = this.getChildByTag(this.TAG_GAMEAREA_LAYER);
      var goal = gameArea.getChildByTag(this.TAG_GOAL);
      var p = cc.p(
        goal.getPosition().x + goal.getBoundingBox().width / 2,
        goal.getPosition().y + goal.getBoundingBox().height / 2
      );

      var currentPos = body.getPos();
      var incX = currentPos.x < p.x ? 1 :
                  (currentPos.x > p.x ? -1 : 0);
      var incY = currentPos.y < p.y ? 1 :
                  (currentPos.y > p.y ? -1 : 0);
      if (Math.random() < 0.05) {
        if (Math.random() < 0.2) {
          body.setVel(cp.v(0, 0));
        } else {
          body.setVel(cp.v(2000 * dt * incX, 2000 * dt * incY));
          body.setAngVel(0);
        }
      }
    },

    createSampleChar: function (character, pos, tag, zoom) {
      var gameArea = this.getChildByTag(this.TAG_GAMEAREA_LAYER);
      var spriteBatch = gameArea.getChildByTag(this.TAG_SPRITEBATCH);

      var orientations = ['.standing', '.right', '.left', '.up', '.down'];
      var animations = cc.AnimationCache.getInstance();

      var person = PhysicsSpriteHelper.createSprite({
        spriteFrame : 'persona-standing-1.png',
        spriteBatch : spriteBatch,
        tag : tag,
        pos : pos,
        space : this.space
      });

      var orientation = orientations[Math.floor(Math.random() *
        orientations.length)];

      person.character = character;
      person.state = orientation;

      person.runAction(
        cc.RepeatForever.create(
          cc.Animate.create(
            animations.getAnimation(character + orientation)
      )));

      if (Math.random() < 0.15) {
        person.applyAI = this.randomWalkingAI.bind(this);
      } else {
        person.applyAI = this.walkToGoalAI.bind(this);
      }

      cc.log('Character created with zoom ' + zoom);
      person.setScale(zoom);
    },

    characters : {},

    _createPeopleDefinitions: function () {
      this.characters.persona = {
        standing : [
          { file : 'persona-standing-1' },
          { file : 'persona-standing-2' }
        ],
        up : [
          { file : 'persona-up-1' },
          { file : 'persona-up-2' },
          { file : 'persona-up-3' },
          { file : 'persona-up-4' },
        ],
        down : [
          { file : 'persona-down-1' },
          { file : 'persona-down-2' },
          { file : 'persona-down-3' },
          { file : 'persona-down-4' },
        ],
        left : [
          { file : 'persona-left-1' },
          { file : 'persona-left-2' },
          { file : 'persona-left-3' },
          { file : 'persona-left-4' },
        ],
        right : [
          { file : 'persona-right-1' },
          { file : 'persona-right-2' },
          { file : 'persona-right-3' },
          { file : 'persona-right-4' },
        ]
      };
    },

    _createDefendantDefinitions: function () {
      this.characters.defendant = {
        standing : [
          { file : 'defendant-standing-1' },
          { file : 'defendant-standing-2' }
        ],
        up : [
          { file : 'defendant-up-1' },
          { file : 'defendant-up-2' },
          { file : 'defendant-up-3' },
          { file : 'defendant-up-4' },
        ],
        down : [
          { file : 'defendant-down-1' },
          { file : 'defendant-down-2' },
          { file : 'defendant-down-3' },
          { file : 'defendant-down-4' },
        ],
        left : [
          { file : 'defendant-left-1' },
          { file : 'defendant-left-2' },
          { file : 'defendant-left-3' },
          { file : 'defendant-left-4' },
        ],
        right : [
          { file : 'defendant-right-1' },
          { file : 'defendant-right-2' },
          { file : 'defendant-right-3' },
          { file : 'defendant-right-4' },
        ]
      };
    },

    createCharacterDefinitions : function () {

      // Character definitions

      cc.log('Define characters');
      this._createPeopleDefinitions();
      this._createDefendantDefinitions();

      /*jshint maxdepth:5 */
      var animations = cc.AnimationCache.getInstance();
      var cache = cc.SpriteFrameCache.getInstance();
      for (var name in this.characters) {
        var states = this.characters[name]; // e.g. 'persona'
        for (var state in states) { // e.g. 'up'
          var animation = cc.Animation.create();
          var frames = states[state]; // array of file names
          for (var f in frames) {
            var fileName = frames[f].file + '.png';
            var frame = cache.getSpriteFrame(fileName);
            if (!frame) {
              cc.log(fileName + ' not found');
              continue;
            } else {
              animation.addSpriteFrame(frame);
            }
          }
          animation.setDelayPerUnit(0.150);
          animation.setLoops(true);
          // cache them like: <characterName> + '.' + <stateName>
          animations.addAnimation(animation, name + '.' + state);
        }
      }
    },

    // Add a title label
    //
    addTitle: function (text) {
      this.titleLabel = cc.LabelBMFont.create(
          text,
          'res/headers-100.fnt',
          ScreenDimensions.viewportSize.width * 0.85,
          cc.TEXT_ALIGNMENT_LEFT,
          cc.p(0, 0)
      );
      var posx = ScreenDimensions.viewportSize.width * 0.05;
      var posy = ScreenDimensions.viewportSize.height;
      this.titleLabel.setPosition(cc.p(posx, posy));
      this.titleLabel.setAnchorPoint(cc.p(0.0, 1.0));
      // this.titleLabel.color = cc.ccc(180, 0, 0);
      this.addChild(this.titleLabel);
    },

    fire1: function () {
      // this.toggleDebug();
      var gameArea = this.getChildByTag(this.TAG_GAMEAREA_LAYER);
      var newScale = Math.max(gameArea.getScale() / 2, 0.25);
      gameArea.runAction(
        cc.ScaleTo.create(0.1, newScale)
      );
    },

    fire2: function () {
      // this.toggleDebug();
      var gameArea = this.getChildByTag(this.TAG_GAMEAREA_LAYER);
      var newScale = Math.min(gameArea.getScale() * 2, 2);
      gameArea.runAction(
        cc.ScaleTo.create(0.1, newScale)
      );
    },

    onTouchesEnded: function (touches) {
      for (var j = 0; j < touches.length; j++) {
        var point = this.convertTouchToNodeSpace(touches[j]);
        this.checkGeneratorClicked(point);
      }
    },

    update: function (dt) {
      this.lastTime += dt; // in seconds
      if (this.lastTime < 0.05) {
        return; // don't update for tiny steps
      }
      if (this.lastTime > 1) {
        this.lastTime = 1; // cap time lapses to keep physics correct
      }
      var elapsed = this.lastTime;
      this.lastTime = 0;
      this._super(elapsed);

      this.updateGameAreaPosition(elapsed);

      var _this = this;
      if (typeof this.space.eachBody !== 'undefined') {
        this.space.eachBody(function (body) {
          _this.applyAIToBody(elapsed, body);
        });
      } else { // not defined in native code
        var gameArea = this.getChildByTag(this.TAG_GAMEAREA_LAYER);
        var spriteBatchNode = gameArea.getChildByTag(this.TAG_SPRITEBATCH);
        spriteBatchNode.getChildren().forEach(function (child) {
          if (typeof child.applyAI !== 'undefined') {
            child.applyAI(elapsed, child, child.getBody());
          }
        });
      }
    },

    applyAIToBody: function (dt, body) {
      if (body && body.userData) {
        var sprite = body.userData;
        if (typeof sprite.applyAI !== 'undefined') {
          sprite.applyAI(dt, sprite, body);
        }
      }
    },

    _getPadPos: function () {
      var controls = this.getChildByTag(this.TAG_CONTROLS_LAYER);
      var pad = controls.getChildByTag(this.TAG_JOYSTICK);
      return pad.getPadPosition();
    },

    _getGameArea: function () {
      return this.getChildByTag(this.TAG_GAMEAREA_LAYER);
    },

    ensureGameAreaPositionWithinBoundaries: function (newPos) {
      var gameArea = this._getGameArea();
      var totalWidth = this.worldSize.width * gameArea.getScale();
      var totalHeight = this.worldSize.height * gameArea.getScale();

      var topX = Math.min(-totalWidth + ScreenDimensions.viewportSize.width, 0);
      var topY = Math.min(ScreenDimensions.viewportSize.height - totalHeight,
        0);

      newPos.x = Math.min(newPos.x, 0);
      newPos.x = Math.max(newPos.x, topX);
      newPos.y = Math.min(newPos.y, 0);
      newPos.y = Math.max(newPos.y, topY);
      if (ScreenDimensions.viewportSize.width > totalWidth) {
        newPos.x = (ScreenDimensions.viewportSize.width - totalWidth) / 2;
      }
      if (ScreenDimensions.viewportSize.height > totalHeight) {
        newPos.y = (ScreenDimensions.viewportSize.height - totalHeight) / 2;
      }

      // newPos.x = Math.floor(newPos.x);
      // newPos.y = Math.floor(newPos.y);
    },

    updateGameAreaPosition: function (/*dt*/) {
      // function sign(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }
      var padPos = this._getPadPos();
      var gameArea = this._getGameArea();
      var newPos = cc.p(gameArea.getPositionX(), gameArea.getPositionY());

      if (Math.abs(padPos.y) >= 1) {
        newPos.y -= padPos.y;
      }
      if (Math.abs(padPos.x) >= 1) {
        newPos.x -= padPos.x;
      }

      this.ensureGameAreaPositionWithinBoundaries(newPos);

      gameArea.setPosition(newPos);
    }

  });
   
  module.exports = ChapterOne;
})();