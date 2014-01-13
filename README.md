# A Javascript-based game for iOS, Android and HTML5 devices

# Summary

This is a relatively simple game made using open source technologies
and with almost all of the logic in cross-platform Javascript.

I'm using:

* npm, browserify and bower for dependency management
* grunt for building
* cocos2d-x and cocos2d-html5 as the game engine
* chipmunk as the physics engine
* Inkscape for graphics

You are encouraged to reuse this in any way you want and to give
feedback and report errors or suggestions using the github page.

# Installation

* Make sure you have `node` installed. If not, get it from [the nodejs website](http://nodejs.org/).
* Install `grunt`, the tool used for building the game. Run `npm install -g grunt-cli` to do so.

* Get a copy of the repository using [`git`](http://git-scm.com/).

```
git clone https://github.com/osuka/js-multiplatform-game
```

* Use the node package manager to download all the external libraries.
This will in turn install and invoke `bower` for the libraries that are not in the node repositories,
namely `cocos2d-x` and `cocos2d-html5`.

```
npm install -g grunt-cli
npm install
```

You are almost done!

# Launching the HTML5 version

You can run the HTML5 version in your computer executing the following:

```
grunt server
```
(then navigate to [http://localhost:9000](http://localhost:9000))


# Launching the XCode (iOS, Mac) version

Open `proj.ios_mac/manifajs.xcodeproj`. Launch as usual.

# Launching the Android version

Import `proj.android` into your IDE. Launch as usual.


# Advanced

## Syntax and error checker (Linter, jshint)

This project uses (and enforces) a strict Javascript syntax and policy. It's
using the common `jshint` tool to do it.

The exact policy is defined in the file `.jshintrc`. It may seem annoying at the
beginning but it helps a lot in keeping code tidy and identifies a lot of
common errors like use of undefined variables, unintended redefinition variables
and so on.

## Automatic syntax/error checking using Sublime text editor

If you use Sublime text editor you can have it automatically invoke `jshint` and
highlight on screen any possible errors. I highly recommend you give it a try.

To enable it, just make sure the linter is globally available by running:

```
npm install -g jshint
```

And then in Sublime:

* Install [Package Control](https://sublime.wbond.net/installation)
* Use it to install `SublimeLinter` and `SublimeLinter-jshint` packages
* Restart the editor

To make life even easier, you can define the following User Settings:

* "tab_size": 2
* "translate_tabs_to_spaces": true
* "rulers": [80],

