// This file declares resources that need to be preloaded
// before the application is ran.
//
// If an image is not declared here, you'll check the texture
// and listen for file loading events. This makes things easier.
//

(function () {
  'use strict';

  var Resources = [
    //image
    { src : 'res/headers-100.png' },
    { src : 'res/maps/../tiles/tilesheet-1_2x-fixed.png' },
    { src : 'res/sprites/spritesheet1_1x.png' },
    { src : 'res/sprites/spritesheet1_2x.png' },
    { src : 'res/1x1-pixel.png' },
  
    //plist
    { src : 'res/sprites/spritesheet1_1x.plist' },
    { src : 'res/sprites/spritesheet1_2x.plist' },
  
    //fnt
    { src : 'res/headers-100.fnt' },
  
    //tmx
    { src : 'res/maps/scene00.tmx'}
  
    //bgm
  
    //effect
  ];

  module.exports = Resources;
})();
