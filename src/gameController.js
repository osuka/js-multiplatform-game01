/* globals cc */
(function () {
  'use strict';

  var InitialScene = require('./InitialScene');
  var MenuLayer = require('./menuLayer');
  var ChapterOne = require('./chapterOne');

  var GameController = {

    currentChapter: 0,

    boot: function () {
      // The director controles the game
      var director = cc.Director.getInstance();
      director.setDisplayStats(false);

      // // set FPS. the default value is 1.0/60 if you don't call this
      // // Note: this doesn't seem to work for Mac or Android
      // director.setAnimationInterval(1.0 / 60);

      // show initial chapter
      cc.log('About to display menu');
      this.showMenu();
    },

    showMenu: function () {
      this.currentChapter = -1;
      var newScene = new InitialScene(MenuLayer);
      var director = cc.Director.getInstance();
      if (!director.getRunningScene()) {
        director.runWithScene(newScene);
      } else {
        director.replaceScene(newScene);
      }
    },

    showChapter: function (n) {
      this.currentChapter = n;
      var newScene = new InitialScene(ChapterOne);
      var director = cc.Director.getInstance();
      if (!director.getRunningScene()) {
        director.runWithScene(newScene);
      } else {
        director.replaceScene(newScene);
      }
    },

  };

  module.exports = GameController;
})();