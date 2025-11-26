/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 766:
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 *  howler.js v2.2.4
 *  howlerjs.com
 *
 *  (c) 2013-2020, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */

(function() {

  'use strict';

  /** Global Methods **/
  /***************************************************************************/

  /**
   * Create the global controller. All contained methods and properties apply
   * to all sounds that are currently playing or will be in the future.
   */
  var HowlerGlobal = function() {
    this.init();
  };
  HowlerGlobal.prototype = {
    /**
     * Initialize the global Howler object.
     * @return {Howler}
     */
    init: function() {
      var self = this || Howler;

      // Create a global ID counter.
      self._counter = 1000;

      // Pool of unlocked HTML5 Audio objects.
      self._html5AudioPool = [];
      self.html5PoolSize = 10;

      // Internal properties.
      self._codecs = {};
      self._howls = [];
      self._muted = false;
      self._volume = 1;
      self._canPlayEvent = 'canplaythrough';
      self._navigator = (typeof window !== 'undefined' && window.navigator) ? window.navigator : null;

      // Public properties.
      self.masterGain = null;
      self.noAudio = false;
      self.usingWebAudio = true;
      self.autoSuspend = true;
      self.ctx = null;

      // Set to false to disable the auto audio unlocker.
      self.autoUnlock = true;

      // Setup the various state values for global tracking.
      self._setup();

      return self;
    },

    /**
     * Get/set the global volume for all sounds.
     * @param  {Float} vol Volume from 0.0 to 1.0.
     * @return {Howler/Float}     Returns self or current volume.
     */
    volume: function(vol) {
      var self = this || Howler;
      vol = parseFloat(vol);

      // If we don't have an AudioContext created yet, run the setup.
      if (!self.ctx) {
        setupAudioContext();
      }

      if (typeof vol !== 'undefined' && vol >= 0 && vol <= 1) {
        self._volume = vol;

        // Don't update any of the nodes if we are muted.
        if (self._muted) {
          return self;
        }

        // When using Web Audio, we just need to adjust the master gain.
        if (self.usingWebAudio) {
          self.masterGain.gain.setValueAtTime(vol, Howler.ctx.currentTime);
        }

        // Loop through and change volume for all HTML5 audio nodes.
        for (var i=0; i<self._howls.length; i++) {
          if (!self._howls[i]._webAudio) {
            // Get all of the sounds in this Howl group.
            var ids = self._howls[i]._getSoundIds();

            // Loop through all sounds and change the volumes.
            for (var j=0; j<ids.length; j++) {
              var sound = self._howls[i]._soundById(ids[j]);

              if (sound && sound._node) {
                sound._node.volume = sound._volume * vol;
              }
            }
          }
        }

        return self;
      }

      return self._volume;
    },

    /**
     * Handle muting and unmuting globally.
     * @param  {Boolean} muted Is muted or not.
     */
    mute: function(muted) {
      var self = this || Howler;

      // If we don't have an AudioContext created yet, run the setup.
      if (!self.ctx) {
        setupAudioContext();
      }

      self._muted = muted;

      // With Web Audio, we just need to mute the master gain.
      if (self.usingWebAudio) {
        self.masterGain.gain.setValueAtTime(muted ? 0 : self._volume, Howler.ctx.currentTime);
      }

      // Loop through and mute all HTML5 Audio nodes.
      for (var i=0; i<self._howls.length; i++) {
        if (!self._howls[i]._webAudio) {
          // Get all of the sounds in this Howl group.
          var ids = self._howls[i]._getSoundIds();

          // Loop through all sounds and mark the audio node as muted.
          for (var j=0; j<ids.length; j++) {
            var sound = self._howls[i]._soundById(ids[j]);

            if (sound && sound._node) {
              sound._node.muted = (muted) ? true : sound._muted;
            }
          }
        }
      }

      return self;
    },

    /**
     * Handle stopping all sounds globally.
     */
    stop: function() {
      var self = this || Howler;

      // Loop through all Howls and stop them.
      for (var i=0; i<self._howls.length; i++) {
        self._howls[i].stop();
      }

      return self;
    },

    /**
     * Unload and destroy all currently loaded Howl objects.
     * @return {Howler}
     */
    unload: function() {
      var self = this || Howler;

      for (var i=self._howls.length-1; i>=0; i--) {
        self._howls[i].unload();
      }

      // Create a new AudioContext to make sure it is fully reset.
      if (self.usingWebAudio && self.ctx && typeof self.ctx.close !== 'undefined') {
        self.ctx.close();
        self.ctx = null;
        setupAudioContext();
      }

      return self;
    },

    /**
     * Check for codec support of specific extension.
     * @param  {String} ext Audio file extention.
     * @return {Boolean}
     */
    codecs: function(ext) {
      return (this || Howler)._codecs[ext.replace(/^x-/, '')];
    },

    /**
     * Setup various state values for global tracking.
     * @return {Howler}
     */
    _setup: function() {
      var self = this || Howler;

      // Keeps track of the suspend/resume state of the AudioContext.
      self.state = self.ctx ? self.ctx.state || 'suspended' : 'suspended';

      // Automatically begin the 30-second suspend process
      self._autoSuspend();

      // Check if audio is available.
      if (!self.usingWebAudio) {
        // No audio is available on this system if noAudio is set to true.
        if (typeof Audio !== 'undefined') {
          try {
            var test = new Audio();

            // Check if the canplaythrough event is available.
            if (typeof test.oncanplaythrough === 'undefined') {
              self._canPlayEvent = 'canplay';
            }
          } catch(e) {
            self.noAudio = true;
          }
        } else {
          self.noAudio = true;
        }
      }

      // Test to make sure audio isn't disabled in Internet Explorer.
      try {
        var test = new Audio();
        if (test.muted) {
          self.noAudio = true;
        }
      } catch (e) {}

      // Check for supported codecs.
      if (!self.noAudio) {
        self._setupCodecs();
      }

      return self;
    },

    /**
     * Check for browser support for various codecs and cache the results.
     * @return {Howler}
     */
    _setupCodecs: function() {
      var self = this || Howler;
      var audioTest = null;

      // Must wrap in a try/catch because IE11 in server mode throws an error.
      try {
        audioTest = (typeof Audio !== 'undefined') ? new Audio() : null;
      } catch (err) {
        return self;
      }

      if (!audioTest || typeof audioTest.canPlayType !== 'function') {
        return self;
      }

      var mpegTest = audioTest.canPlayType('audio/mpeg;').replace(/^no$/, '');

      // Opera version <33 has mixed MP3 support, so we need to check for and block it.
      var ua = self._navigator ? self._navigator.userAgent : '';
      var checkOpera = ua.match(/OPR\/(\d+)/g);
      var isOldOpera = (checkOpera && parseInt(checkOpera[0].split('/')[1], 10) < 33);
      var checkSafari = ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1;
      var safariVersion = ua.match(/Version\/(.*?) /);
      var isOldSafari = (checkSafari && safariVersion && parseInt(safariVersion[1], 10) < 15);

      self._codecs = {
        mp3: !!(!isOldOpera && (mpegTest || audioTest.canPlayType('audio/mp3;').replace(/^no$/, ''))),
        mpeg: !!mpegTest,
        opus: !!audioTest.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ''),
        ogg: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
        oga: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
        wav: !!(audioTest.canPlayType('audio/wav; codecs="1"') || audioTest.canPlayType('audio/wav')).replace(/^no$/, ''),
        aac: !!audioTest.canPlayType('audio/aac;').replace(/^no$/, ''),
        caf: !!audioTest.canPlayType('audio/x-caf;').replace(/^no$/, ''),
        m4a: !!(audioTest.canPlayType('audio/x-m4a;') || audioTest.canPlayType('audio/m4a;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
        m4b: !!(audioTest.canPlayType('audio/x-m4b;') || audioTest.canPlayType('audio/m4b;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
        mp4: !!(audioTest.canPlayType('audio/x-mp4;') || audioTest.canPlayType('audio/mp4;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
        weba: !!(!isOldSafari && audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, '')),
        webm: !!(!isOldSafari && audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, '')),
        dolby: !!audioTest.canPlayType('audio/mp4; codecs="ec-3"').replace(/^no$/, ''),
        flac: !!(audioTest.canPlayType('audio/x-flac;') || audioTest.canPlayType('audio/flac;')).replace(/^no$/, '')
      };

      return self;
    },

    /**
     * Some browsers/devices will only allow audio to be played after a user interaction.
     * Attempt to automatically unlock audio on the first user interaction.
     * Concept from: http://paulbakaus.com/tutorials/html5/web-audio-on-ios/
     * @return {Howler}
     */
    _unlockAudio: function() {
      var self = this || Howler;

      // Only run this if Web Audio is supported and it hasn't already been unlocked.
      if (self._audioUnlocked || !self.ctx) {
        return;
      }

      self._audioUnlocked = false;
      self.autoUnlock = false;

      // Some mobile devices/platforms have distortion issues when opening/closing tabs and/or web views.
      // Bugs in the browser (especially Mobile Safari) can cause the sampleRate to change from 44100 to 48000.
      // By calling Howler.unload(), we create a new AudioContext with the correct sampleRate.
      if (!self._mobileUnloaded && self.ctx.sampleRate !== 44100) {
        self._mobileUnloaded = true;
        self.unload();
      }

      // Scratch buffer for enabling iOS to dispose of web audio buffers correctly, as per:
      // http://stackoverflow.com/questions/24119684
      self._scratchBuffer = self.ctx.createBuffer(1, 1, 22050);

      // Call this method on touch start to create and play a buffer,
      // then check if the audio actually played to determine if
      // audio has now been unlocked on iOS, Android, etc.
      var unlock = function(e) {
        // Create a pool of unlocked HTML5 Audio objects that can
        // be used for playing sounds without user interaction. HTML5
        // Audio objects must be individually unlocked, as opposed
        // to the WebAudio API which only needs a single activation.
        // This must occur before WebAudio setup or the source.onended
        // event will not fire.
        while (self._html5AudioPool.length < self.html5PoolSize) {
          try {
            var audioNode = new Audio();

            // Mark this Audio object as unlocked to ensure it can get returned
            // to the unlocked pool when released.
            audioNode._unlocked = true;

            // Add the audio node to the pool.
            self._releaseHtml5Audio(audioNode);
          } catch (e) {
            self.noAudio = true;
            break;
          }
        }

        // Loop through any assigned audio nodes and unlock them.
        for (var i=0; i<self._howls.length; i++) {
          if (!self._howls[i]._webAudio) {
            // Get all of the sounds in this Howl group.
            var ids = self._howls[i]._getSoundIds();

            // Loop through all sounds and unlock the audio nodes.
            for (var j=0; j<ids.length; j++) {
              var sound = self._howls[i]._soundById(ids[j]);

              if (sound && sound._node && !sound._node._unlocked) {
                sound._node._unlocked = true;
                sound._node.load();
              }
            }
          }
        }

        // Fix Android can not play in suspend state.
        self._autoResume();

        // Create an empty buffer.
        var source = self.ctx.createBufferSource();
        source.buffer = self._scratchBuffer;
        source.connect(self.ctx.destination);

        // Play the empty buffer.
        if (typeof source.start === 'undefined') {
          source.noteOn(0);
        } else {
          source.start(0);
        }

        // Calling resume() on a stack initiated by user gesture is what actually unlocks the audio on Android Chrome >= 55.
        if (typeof self.ctx.resume === 'function') {
          self.ctx.resume();
        }

        // Setup a timeout to check that we are unlocked on the next event loop.
        source.onended = function() {
          source.disconnect(0);

          // Update the unlocked state and prevent this check from happening again.
          self._audioUnlocked = true;

          // Remove the touch start listener.
          document.removeEventListener('touchstart', unlock, true);
          document.removeEventListener('touchend', unlock, true);
          document.removeEventListener('click', unlock, true);
          document.removeEventListener('keydown', unlock, true);

          // Let all sounds know that audio has been unlocked.
          for (var i=0; i<self._howls.length; i++) {
            self._howls[i]._emit('unlock');
          }
        };
      };

      // Setup a touch start listener to attempt an unlock in.
      document.addEventListener('touchstart', unlock, true);
      document.addEventListener('touchend', unlock, true);
      document.addEventListener('click', unlock, true);
      document.addEventListener('keydown', unlock, true);

      return self;
    },

    /**
     * Get an unlocked HTML5 Audio object from the pool. If none are left,
     * return a new Audio object and throw a warning.
     * @return {Audio} HTML5 Audio object.
     */
    _obtainHtml5Audio: function() {
      var self = this || Howler;

      // Return the next object from the pool if one exists.
      if (self._html5AudioPool.length) {
        return self._html5AudioPool.pop();
      }

      //.Check if the audio is locked and throw a warning.
      var testPlay = new Audio().play();
      if (testPlay && typeof Promise !== 'undefined' && (testPlay instanceof Promise || typeof testPlay.then === 'function')) {
        testPlay.catch(function() {
          console.warn('HTML5 Audio pool exhausted, returning potentially locked audio object.');
        });
      }

      return new Audio();
    },

    /**
     * Return an activated HTML5 Audio object to the pool.
     * @return {Howler}
     */
    _releaseHtml5Audio: function(audio) {
      var self = this || Howler;

      // Don't add audio to the pool if we don't know if it has been unlocked.
      if (audio._unlocked) {
        self._html5AudioPool.push(audio);
      }

      return self;
    },

    /**
     * Automatically suspend the Web Audio AudioContext after no sound has played for 30 seconds.
     * This saves processing/energy and fixes various browser-specific bugs with audio getting stuck.
     * @return {Howler}
     */
    _autoSuspend: function() {
      var self = this;

      if (!self.autoSuspend || !self.ctx || typeof self.ctx.suspend === 'undefined' || !Howler.usingWebAudio) {
        return;
      }

      // Check if any sounds are playing.
      for (var i=0; i<self._howls.length; i++) {
        if (self._howls[i]._webAudio) {
          for (var j=0; j<self._howls[i]._sounds.length; j++) {
            if (!self._howls[i]._sounds[j]._paused) {
              return self;
            }
          }
        }
      }

      if (self._suspendTimer) {
        clearTimeout(self._suspendTimer);
      }

      // If no sound has played after 30 seconds, suspend the context.
      self._suspendTimer = setTimeout(function() {
        if (!self.autoSuspend) {
          return;
        }

        self._suspendTimer = null;
        self.state = 'suspending';

        // Handle updating the state of the audio context after suspending.
        var handleSuspension = function() {
          self.state = 'suspended';

          if (self._resumeAfterSuspend) {
            delete self._resumeAfterSuspend;
            self._autoResume();
          }
        };

        // Either the state gets suspended or it is interrupted.
        // Either way, we need to update the state to suspended.
        self.ctx.suspend().then(handleSuspension, handleSuspension);
      }, 30000);

      return self;
    },

    /**
     * Automatically resume the Web Audio AudioContext when a new sound is played.
     * @return {Howler}
     */
    _autoResume: function() {
      var self = this;

      if (!self.ctx || typeof self.ctx.resume === 'undefined' || !Howler.usingWebAudio) {
        return;
      }

      if (self.state === 'running' && self.ctx.state !== 'interrupted' && self._suspendTimer) {
        clearTimeout(self._suspendTimer);
        self._suspendTimer = null;
      } else if (self.state === 'suspended' || self.state === 'running' && self.ctx.state === 'interrupted') {
        self.ctx.resume().then(function() {
          self.state = 'running';

          // Emit to all Howls that the audio has resumed.
          for (var i=0; i<self._howls.length; i++) {
            self._howls[i]._emit('resume');
          }
        });

        if (self._suspendTimer) {
          clearTimeout(self._suspendTimer);
          self._suspendTimer = null;
        }
      } else if (self.state === 'suspending') {
        self._resumeAfterSuspend = true;
      }

      return self;
    }
  };

  // Setup the global audio controller.
  var Howler = new HowlerGlobal();

  /** Group Methods **/
  /***************************************************************************/

  /**
   * Create an audio group controller.
   * @param {Object} o Passed in properties for this group.
   */
  var Howl = function(o) {
    var self = this;

    // Throw an error if no source is provided.
    if (!o.src || o.src.length === 0) {
      console.error('An array of source files must be passed with any new Howl.');
      return;
    }

    self.init(o);
  };
  Howl.prototype = {
    /**
     * Initialize a new Howl group object.
     * @param  {Object} o Passed in properties for this group.
     * @return {Howl}
     */
    init: function(o) {
      var self = this;

      // If we don't have an AudioContext created yet, run the setup.
      if (!Howler.ctx) {
        setupAudioContext();
      }

      // Setup user-defined default properties.
      self._autoplay = o.autoplay || false;
      self._format = (typeof o.format !== 'string') ? o.format : [o.format];
      self._html5 = o.html5 || false;
      self._muted = o.mute || false;
      self._loop = o.loop || false;
      self._pool = o.pool || 5;
      self._preload = (typeof o.preload === 'boolean' || o.preload === 'metadata') ? o.preload : true;
      self._rate = o.rate || 1;
      self._sprite = o.sprite || {};
      self._src = (typeof o.src !== 'string') ? o.src : [o.src];
      self._volume = o.volume !== undefined ? o.volume : 1;
      self._xhr = {
        method: o.xhr && o.xhr.method ? o.xhr.method : 'GET',
        headers: o.xhr && o.xhr.headers ? o.xhr.headers : null,
        withCredentials: o.xhr && o.xhr.withCredentials ? o.xhr.withCredentials : false,
      };

      // Setup all other default properties.
      self._duration = 0;
      self._state = 'unloaded';
      self._sounds = [];
      self._endTimers = {};
      self._queue = [];
      self._playLock = false;

      // Setup event listeners.
      self._onend = o.onend ? [{fn: o.onend}] : [];
      self._onfade = o.onfade ? [{fn: o.onfade}] : [];
      self._onload = o.onload ? [{fn: o.onload}] : [];
      self._onloaderror = o.onloaderror ? [{fn: o.onloaderror}] : [];
      self._onplayerror = o.onplayerror ? [{fn: o.onplayerror}] : [];
      self._onpause = o.onpause ? [{fn: o.onpause}] : [];
      self._onplay = o.onplay ? [{fn: o.onplay}] : [];
      self._onstop = o.onstop ? [{fn: o.onstop}] : [];
      self._onmute = o.onmute ? [{fn: o.onmute}] : [];
      self._onvolume = o.onvolume ? [{fn: o.onvolume}] : [];
      self._onrate = o.onrate ? [{fn: o.onrate}] : [];
      self._onseek = o.onseek ? [{fn: o.onseek}] : [];
      self._onunlock = o.onunlock ? [{fn: o.onunlock}] : [];
      self._onresume = [];

      // Web Audio or HTML5 Audio?
      self._webAudio = Howler.usingWebAudio && !self._html5;

      // Automatically try to enable audio.
      if (typeof Howler.ctx !== 'undefined' && Howler.ctx && Howler.autoUnlock) {
        Howler._unlockAudio();
      }

      // Keep track of this Howl group in the global controller.
      Howler._howls.push(self);

      // If they selected autoplay, add a play event to the load queue.
      if (self._autoplay) {
        self._queue.push({
          event: 'play',
          action: function() {
            self.play();
          }
        });
      }

      // Load the source file unless otherwise specified.
      if (self._preload && self._preload !== 'none') {
        self.load();
      }

      return self;
    },

    /**
     * Load the audio file.
     * @return {Howler}
     */
    load: function() {
      var self = this;
      var url = null;

      // If no audio is available, quit immediately.
      if (Howler.noAudio) {
        self._emit('loaderror', null, 'No audio support.');
        return;
      }

      // Make sure our source is in an array.
      if (typeof self._src === 'string') {
        self._src = [self._src];
      }

      // Loop through the sources and pick the first one that is compatible.
      for (var i=0; i<self._src.length; i++) {
        var ext, str;

        if (self._format && self._format[i]) {
          // If an extension was specified, use that instead.
          ext = self._format[i];
        } else {
          // Make sure the source is a string.
          str = self._src[i];
          if (typeof str !== 'string') {
            self._emit('loaderror', null, 'Non-string found in selected audio sources - ignoring.');
            continue;
          }

          // Extract the file extension from the URL or base64 data URI.
          ext = /^data:audio\/([^;,]+);/i.exec(str);
          if (!ext) {
            ext = /\.([^.]+)$/.exec(str.split('?', 1)[0]);
          }

          if (ext) {
            ext = ext[1].toLowerCase();
          }
        }

        // Log a warning if no extension was found.
        if (!ext) {
          console.warn('No file extension was found. Consider using the "format" property or specify an extension.');
        }

        // Check if this extension is available.
        if (ext && Howler.codecs(ext)) {
          url = self._src[i];
          break;
        }
      }

      if (!url) {
        self._emit('loaderror', null, 'No codec support for selected audio sources.');
        return;
      }

      self._src = url;
      self._state = 'loading';

      // If the hosting page is HTTPS and the source isn't,
      // drop down to HTML5 Audio to avoid Mixed Content errors.
      if (window.location.protocol === 'https:' && url.slice(0, 5) === 'http:') {
        self._html5 = true;
        self._webAudio = false;
      }

      // Create a new sound object and add it to the pool.
      new Sound(self);

      // Load and decode the audio data for playback.
      if (self._webAudio) {
        loadBuffer(self);
      }

      return self;
    },

    /**
     * Play a sound or resume previous playback.
     * @param  {String/Number} sprite   Sprite name for sprite playback or sound id to continue previous.
     * @param  {Boolean} internal Internal Use: true prevents event firing.
     * @return {Number}          Sound ID.
     */
    play: function(sprite, internal) {
      var self = this;
      var id = null;

      // Determine if a sprite, sound id or nothing was passed
      if (typeof sprite === 'number') {
        id = sprite;
        sprite = null;
      } else if (typeof sprite === 'string' && self._state === 'loaded' && !self._sprite[sprite]) {
        // If the passed sprite doesn't exist, do nothing.
        return null;
      } else if (typeof sprite === 'undefined') {
        // Use the default sound sprite (plays the full audio length).
        sprite = '__default';

        // Check if there is a single paused sound that isn't ended.
        // If there is, play that sound. If not, continue as usual.
        if (!self._playLock) {
          var num = 0;
          for (var i=0; i<self._sounds.length; i++) {
            if (self._sounds[i]._paused && !self._sounds[i]._ended) {
              num++;
              id = self._sounds[i]._id;
            }
          }

          if (num === 1) {
            sprite = null;
          } else {
            id = null;
          }
        }
      }

      // Get the selected node, or get one from the pool.
      var sound = id ? self._soundById(id) : self._inactiveSound();

      // If the sound doesn't exist, do nothing.
      if (!sound) {
        return null;
      }

      // Select the sprite definition.
      if (id && !sprite) {
        sprite = sound._sprite || '__default';
      }

      // If the sound hasn't loaded, we must wait to get the audio's duration.
      // We also need to wait to make sure we don't run into race conditions with
      // the order of function calls.
      if (self._state !== 'loaded') {
        // Set the sprite value on this sound.
        sound._sprite = sprite;

        // Mark this sound as not ended in case another sound is played before this one loads.
        sound._ended = false;

        // Add the sound to the queue to be played on load.
        var soundId = sound._id;
        self._queue.push({
          event: 'play',
          action: function() {
            self.play(soundId);
          }
        });

        return soundId;
      }

      // Don't play the sound if an id was passed and it is already playing.
      if (id && !sound._paused) {
        // Trigger the play event, in order to keep iterating through queue.
        if (!internal) {
          self._loadQueue('play');
        }

        return sound._id;
      }

      // Make sure the AudioContext isn't suspended, and resume it if it is.
      if (self._webAudio) {
        Howler._autoResume();
      }

      // Determine how long to play for and where to start playing.
      var seek = Math.max(0, sound._seek > 0 ? sound._seek : self._sprite[sprite][0] / 1000);
      var duration = Math.max(0, ((self._sprite[sprite][0] + self._sprite[sprite][1]) / 1000) - seek);
      var timeout = (duration * 1000) / Math.abs(sound._rate);
      var start = self._sprite[sprite][0] / 1000;
      var stop = (self._sprite[sprite][0] + self._sprite[sprite][1]) / 1000;
      sound._sprite = sprite;

      // Mark the sound as ended instantly so that this async playback
      // doesn't get grabbed by another call to play while this one waits to start.
      sound._ended = false;

      // Update the parameters of the sound.
      var setParams = function() {
        sound._paused = false;
        sound._seek = seek;
        sound._start = start;
        sound._stop = stop;
        sound._loop = !!(sound._loop || self._sprite[sprite][2]);
      };

      // End the sound instantly if seek is at the end.
      if (seek >= stop) {
        self._ended(sound);
        return;
      }

      // Begin the actual playback.
      var node = sound._node;
      if (self._webAudio) {
        // Fire this when the sound is ready to play to begin Web Audio playback.
        var playWebAudio = function() {
          self._playLock = false;
          setParams();
          self._refreshBuffer(sound);

          // Setup the playback params.
          var vol = (sound._muted || self._muted) ? 0 : sound._volume;
          node.gain.setValueAtTime(vol, Howler.ctx.currentTime);
          sound._playStart = Howler.ctx.currentTime;

          // Play the sound using the supported method.
          if (typeof node.bufferSource.start === 'undefined') {
            sound._loop ? node.bufferSource.noteGrainOn(0, seek, 86400) : node.bufferSource.noteGrainOn(0, seek, duration);
          } else {
            sound._loop ? node.bufferSource.start(0, seek, 86400) : node.bufferSource.start(0, seek, duration);
          }

          // Start a new timer if none is present.
          if (timeout !== Infinity) {
            self._endTimers[sound._id] = setTimeout(self._ended.bind(self, sound), timeout);
          }

          if (!internal) {
            setTimeout(function() {
              self._emit('play', sound._id);
              self._loadQueue();
            }, 0);
          }
        };

        if (Howler.state === 'running' && Howler.ctx.state !== 'interrupted') {
          playWebAudio();
        } else {
          self._playLock = true;

          // Wait for the audio context to resume before playing.
          self.once('resume', playWebAudio);

          // Cancel the end timer.
          self._clearTimer(sound._id);
        }
      } else {
        // Fire this when the sound is ready to play to begin HTML5 Audio playback.
        var playHtml5 = function() {
          node.currentTime = seek;
          node.muted = sound._muted || self._muted || Howler._muted || node.muted;
          node.volume = sound._volume * Howler.volume();
          node.playbackRate = sound._rate;

          // Some browsers will throw an error if this is called without user interaction.
          try {
            var play = node.play();

            // Support older browsers that don't support promises, and thus don't have this issue.
            if (play && typeof Promise !== 'undefined' && (play instanceof Promise || typeof play.then === 'function')) {
              // Implements a lock to prevent DOMException: The play() request was interrupted by a call to pause().
              self._playLock = true;

              // Set param values immediately.
              setParams();

              // Releases the lock and executes queued actions.
              play
                .then(function() {
                  self._playLock = false;
                  node._unlocked = true;
                  if (!internal) {
                    self._emit('play', sound._id);
                  } else {
                    self._loadQueue();
                  }
                })
                .catch(function() {
                  self._playLock = false;
                  self._emit('playerror', sound._id, 'Playback was unable to start. This is most commonly an issue ' +
                    'on mobile devices and Chrome where playback was not within a user interaction.');

                  // Reset the ended and paused values.
                  sound._ended = true;
                  sound._paused = true;
                });
            } else if (!internal) {
              self._playLock = false;
              setParams();
              self._emit('play', sound._id);
            }

            // Setting rate before playing won't work in IE, so we set it again here.
            node.playbackRate = sound._rate;

            // If the node is still paused, then we can assume there was a playback issue.
            if (node.paused) {
              self._emit('playerror', sound._id, 'Playback was unable to start. This is most commonly an issue ' +
                'on mobile devices and Chrome where playback was not within a user interaction.');
              return;
            }

            // Setup the end timer on sprites or listen for the ended event.
            if (sprite !== '__default' || sound._loop) {
              self._endTimers[sound._id] = setTimeout(self._ended.bind(self, sound), timeout);
            } else {
              self._endTimers[sound._id] = function() {
                // Fire ended on this audio node.
                self._ended(sound);

                // Clear this listener.
                node.removeEventListener('ended', self._endTimers[sound._id], false);
              };
              node.addEventListener('ended', self._endTimers[sound._id], false);
            }
          } catch (err) {
            self._emit('playerror', sound._id, err);
          }
        };

        // If this is streaming audio, make sure the src is set and load again.
        if (node.src === 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA') {
          node.src = self._src;
          node.load();
        }

        // Play immediately if ready, or wait for the 'canplaythrough'e vent.
        var loadedNoReadyState = (window && window.ejecta) || (!node.readyState && Howler._navigator.isCocoonJS);
        if (node.readyState >= 3 || loadedNoReadyState) {
          playHtml5();
        } else {
          self._playLock = true;
          self._state = 'loading';

          var listener = function() {
            self._state = 'loaded';
            
            // Begin playback.
            playHtml5();

            // Clear this listener.
            node.removeEventListener(Howler._canPlayEvent, listener, false);
          };
          node.addEventListener(Howler._canPlayEvent, listener, false);

          // Cancel the end timer.
          self._clearTimer(sound._id);
        }
      }

      return sound._id;
    },

    /**
     * Pause playback and save current position.
     * @param  {Number} id The sound ID (empty to pause all in group).
     * @return {Howl}
     */
    pause: function(id) {
      var self = this;

      // If the sound hasn't loaded or a play() promise is pending, add it to the load queue to pause when capable.
      if (self._state !== 'loaded' || self._playLock) {
        self._queue.push({
          event: 'pause',
          action: function() {
            self.pause(id);
          }
        });

        return self;
      }

      // If no id is passed, get all ID's to be paused.
      var ids = self._getSoundIds(id);

      for (var i=0; i<ids.length; i++) {
        // Clear the end timer.
        self._clearTimer(ids[i]);

        // Get the sound.
        var sound = self._soundById(ids[i]);

        if (sound && !sound._paused) {
          // Reset the seek position.
          sound._seek = self.seek(ids[i]);
          sound._rateSeek = 0;
          sound._paused = true;

          // Stop currently running fades.
          self._stopFade(ids[i]);

          if (sound._node) {
            if (self._webAudio) {
              // Make sure the sound has been created.
              if (!sound._node.bufferSource) {
                continue;
              }

              if (typeof sound._node.bufferSource.stop === 'undefined') {
                sound._node.bufferSource.noteOff(0);
              } else {
                sound._node.bufferSource.stop(0);
              }

              // Clean up the buffer source.
              self._cleanBuffer(sound._node);
            } else if (!isNaN(sound._node.duration) || sound._node.duration === Infinity) {
              sound._node.pause();
            }
          }
        }

        // Fire the pause event, unless `true` is passed as the 2nd argument.
        if (!arguments[1]) {
          self._emit('pause', sound ? sound._id : null);
        }
      }

      return self;
    },

    /**
     * Stop playback and reset to start.
     * @param  {Number} id The sound ID (empty to stop all in group).
     * @param  {Boolean} internal Internal Use: true prevents event firing.
     * @return {Howl}
     */
    stop: function(id, internal) {
      var self = this;

      // If the sound hasn't loaded, add it to the load queue to stop when capable.
      if (self._state !== 'loaded' || self._playLock) {
        self._queue.push({
          event: 'stop',
          action: function() {
            self.stop(id);
          }
        });

        return self;
      }

      // If no id is passed, get all ID's to be stopped.
      var ids = self._getSoundIds(id);

      for (var i=0; i<ids.length; i++) {
        // Clear the end timer.
        self._clearTimer(ids[i]);

        // Get the sound.
        var sound = self._soundById(ids[i]);

        if (sound) {
          // Reset the seek position.
          sound._seek = sound._start || 0;
          sound._rateSeek = 0;
          sound._paused = true;
          sound._ended = true;

          // Stop currently running fades.
          self._stopFade(ids[i]);

          if (sound._node) {
            if (self._webAudio) {
              // Make sure the sound's AudioBufferSourceNode has been created.
              if (sound._node.bufferSource) {
                if (typeof sound._node.bufferSource.stop === 'undefined') {
                  sound._node.bufferSource.noteOff(0);
                } else {
                  sound._node.bufferSource.stop(0);
                }

                // Clean up the buffer source.
                self._cleanBuffer(sound._node);
              }
            } else if (!isNaN(sound._node.duration) || sound._node.duration === Infinity) {
              sound._node.currentTime = sound._start || 0;
              sound._node.pause();

              // If this is a live stream, stop download once the audio is stopped.
              if (sound._node.duration === Infinity) {
                self._clearSound(sound._node);
              }
            }
          }

          if (!internal) {
            self._emit('stop', sound._id);
          }
        }
      }

      return self;
    },

    /**
     * Mute/unmute a single sound or all sounds in this Howl group.
     * @param  {Boolean} muted Set to true to mute and false to unmute.
     * @param  {Number} id    The sound ID to update (omit to mute/unmute all).
     * @return {Howl}
     */
    mute: function(muted, id) {
      var self = this;

      // If the sound hasn't loaded, add it to the load queue to mute when capable.
      if (self._state !== 'loaded'|| self._playLock) {
        self._queue.push({
          event: 'mute',
          action: function() {
            self.mute(muted, id);
          }
        });

        return self;
      }

      // If applying mute/unmute to all sounds, update the group's value.
      if (typeof id === 'undefined') {
        if (typeof muted === 'boolean') {
          self._muted = muted;
        } else {
          return self._muted;
        }
      }

      // If no id is passed, get all ID's to be muted.
      var ids = self._getSoundIds(id);

      for (var i=0; i<ids.length; i++) {
        // Get the sound.
        var sound = self._soundById(ids[i]);

        if (sound) {
          sound._muted = muted;

          // Cancel active fade and set the volume to the end value.
          if (sound._interval) {
            self._stopFade(sound._id);
          }

          if (self._webAudio && sound._node) {
            sound._node.gain.setValueAtTime(muted ? 0 : sound._volume, Howler.ctx.currentTime);
          } else if (sound._node) {
            sound._node.muted = Howler._muted ? true : muted;
          }

          self._emit('mute', sound._id);
        }
      }

      return self;
    },

    /**
     * Get/set the volume of this sound or of the Howl group. This method can optionally take 0, 1 or 2 arguments.
     *   volume() -> Returns the group's volume value.
     *   volume(id) -> Returns the sound id's current volume.
     *   volume(vol) -> Sets the volume of all sounds in this Howl group.
     *   volume(vol, id) -> Sets the volume of passed sound id.
     * @return {Howl/Number} Returns self or current volume.
     */
    volume: function() {
      var self = this;
      var args = arguments;
      var vol, id;

      // Determine the values based on arguments.
      if (args.length === 0) {
        // Return the value of the groups' volume.
        return self._volume;
      } else if (args.length === 1 || args.length === 2 && typeof args[1] === 'undefined') {
        // First check if this is an ID, and if not, assume it is a new volume.
        var ids = self._getSoundIds();
        var index = ids.indexOf(args[0]);
        if (index >= 0) {
          id = parseInt(args[0], 10);
        } else {
          vol = parseFloat(args[0]);
        }
      } else if (args.length >= 2) {
        vol = parseFloat(args[0]);
        id = parseInt(args[1], 10);
      }

      // Update the volume or return the current volume.
      var sound;
      if (typeof vol !== 'undefined' && vol >= 0 && vol <= 1) {
        // If the sound hasn't loaded, add it to the load queue to change volume when capable.
        if (self._state !== 'loaded'|| self._playLock) {
          self._queue.push({
            event: 'volume',
            action: function() {
              self.volume.apply(self, args);
            }
          });

          return self;
        }

        // Set the group volume.
        if (typeof id === 'undefined') {
          self._volume = vol;
        }

        // Update one or all volumes.
        id = self._getSoundIds(id);
        for (var i=0; i<id.length; i++) {
          // Get the sound.
          sound = self._soundById(id[i]);

          if (sound) {
            sound._volume = vol;

            // Stop currently running fades.
            if (!args[2]) {
              self._stopFade(id[i]);
            }

            if (self._webAudio && sound._node && !sound._muted) {
              sound._node.gain.setValueAtTime(vol, Howler.ctx.currentTime);
            } else if (sound._node && !sound._muted) {
              sound._node.volume = vol * Howler.volume();
            }

            self._emit('volume', sound._id);
          }
        }
      } else {
        sound = id ? self._soundById(id) : self._sounds[0];
        return sound ? sound._volume : 0;
      }

      return self;
    },

    /**
     * Fade a currently playing sound between two volumes (if no id is passed, all sounds will fade).
     * @param  {Number} from The value to fade from (0.0 to 1.0).
     * @param  {Number} to   The volume to fade to (0.0 to 1.0).
     * @param  {Number} len  Time in milliseconds to fade.
     * @param  {Number} id   The sound id (omit to fade all sounds).
     * @return {Howl}
     */
    fade: function(from, to, len, id) {
      var self = this;

      // If the sound hasn't loaded, add it to the load queue to fade when capable.
      if (self._state !== 'loaded' || self._playLock) {
        self._queue.push({
          event: 'fade',
          action: function() {
            self.fade(from, to, len, id);
          }
        });

        return self;
      }

      // Make sure the to/from/len values are numbers.
      from = Math.min(Math.max(0, parseFloat(from)), 1);
      to = Math.min(Math.max(0, parseFloat(to)), 1);
      len = parseFloat(len);

      // Set the volume to the start position.
      self.volume(from, id);

      // Fade the volume of one or all sounds.
      var ids = self._getSoundIds(id);
      for (var i=0; i<ids.length; i++) {
        // Get the sound.
        var sound = self._soundById(ids[i]);

        // Create a linear fade or fall back to timeouts with HTML5 Audio.
        if (sound) {
          // Stop the previous fade if no sprite is being used (otherwise, volume handles this).
          if (!id) {
            self._stopFade(ids[i]);
          }

          // If we are using Web Audio, let the native methods do the actual fade.
          if (self._webAudio && !sound._muted) {
            var currentTime = Howler.ctx.currentTime;
            var end = currentTime + (len / 1000);
            sound._volume = from;
            sound._node.gain.setValueAtTime(from, currentTime);
            sound._node.gain.linearRampToValueAtTime(to, end);
          }

          self._startFadeInterval(sound, from, to, len, ids[i], typeof id === 'undefined');
        }
      }

      return self;
    },

    /**
     * Starts the internal interval to fade a sound.
     * @param  {Object} sound Reference to sound to fade.
     * @param  {Number} from The value to fade from (0.0 to 1.0).
     * @param  {Number} to   The volume to fade to (0.0 to 1.0).
     * @param  {Number} len  Time in milliseconds to fade.
     * @param  {Number} id   The sound id to fade.
     * @param  {Boolean} isGroup   If true, set the volume on the group.
     */
    _startFadeInterval: function(sound, from, to, len, id, isGroup) {
      var self = this;
      var vol = from;
      var diff = to - from;
      var steps = Math.abs(diff / 0.01);
      var stepLen = Math.max(4, (steps > 0) ? len / steps : len);
      var lastTick = Date.now();

      // Store the value being faded to.
      sound._fadeTo = to;

      // Update the volume value on each interval tick.
      sound._interval = setInterval(function() {
        // Update the volume based on the time since the last tick.
        var tick = (Date.now() - lastTick) / len;
        lastTick = Date.now();
        vol += diff * tick;

        // Round to within 2 decimal points.
        vol = Math.round(vol * 100) / 100;

        // Make sure the volume is in the right bounds.
        if (diff < 0) {
          vol = Math.max(to, vol);
        } else {
          vol = Math.min(to, vol);
        }

        // Change the volume.
        if (self._webAudio) {
          sound._volume = vol;
        } else {
          self.volume(vol, sound._id, true);
        }

        // Set the group's volume.
        if (isGroup) {
          self._volume = vol;
        }

        // When the fade is complete, stop it and fire event.
        if ((to < from && vol <= to) || (to > from && vol >= to)) {
          clearInterval(sound._interval);
          sound._interval = null;
          sound._fadeTo = null;
          self.volume(to, sound._id);
          self._emit('fade', sound._id);
        }
      }, stepLen);
    },

    /**
     * Internal method that stops the currently playing fade when
     * a new fade starts, volume is changed or the sound is stopped.
     * @param  {Number} id The sound id.
     * @return {Howl}
     */
    _stopFade: function(id) {
      var self = this;
      var sound = self._soundById(id);

      if (sound && sound._interval) {
        if (self._webAudio) {
          sound._node.gain.cancelScheduledValues(Howler.ctx.currentTime);
        }

        clearInterval(sound._interval);
        sound._interval = null;
        self.volume(sound._fadeTo, id);
        sound._fadeTo = null;
        self._emit('fade', id);
      }

      return self;
    },

    /**
     * Get/set the loop parameter on a sound. This method can optionally take 0, 1 or 2 arguments.
     *   loop() -> Returns the group's loop value.
     *   loop(id) -> Returns the sound id's loop value.
     *   loop(loop) -> Sets the loop value for all sounds in this Howl group.
     *   loop(loop, id) -> Sets the loop value of passed sound id.
     * @return {Howl/Boolean} Returns self or current loop value.
     */
    loop: function() {
      var self = this;
      var args = arguments;
      var loop, id, sound;

      // Determine the values for loop and id.
      if (args.length === 0) {
        // Return the grou's loop value.
        return self._loop;
      } else if (args.length === 1) {
        if (typeof args[0] === 'boolean') {
          loop = args[0];
          self._loop = loop;
        } else {
          // Return this sound's loop value.
          sound = self._soundById(parseInt(args[0], 10));
          return sound ? sound._loop : false;
        }
      } else if (args.length === 2) {
        loop = args[0];
        id = parseInt(args[1], 10);
      }

      // If no id is passed, get all ID's to be looped.
      var ids = self._getSoundIds(id);
      for (var i=0; i<ids.length; i++) {
        sound = self._soundById(ids[i]);

        if (sound) {
          sound._loop = loop;
          if (self._webAudio && sound._node && sound._node.bufferSource) {
            sound._node.bufferSource.loop = loop;
            if (loop) {
              sound._node.bufferSource.loopStart = sound._start || 0;
              sound._node.bufferSource.loopEnd = sound._stop;

              // If playing, restart playback to ensure looping updates.
              if (self.playing(ids[i])) {
                self.pause(ids[i], true);
                self.play(ids[i], true);
              }
            }
          }
        }
      }

      return self;
    },

    /**
     * Get/set the playback rate of a sound. This method can optionally take 0, 1 or 2 arguments.
     *   rate() -> Returns the first sound node's current playback rate.
     *   rate(id) -> Returns the sound id's current playback rate.
     *   rate(rate) -> Sets the playback rate of all sounds in this Howl group.
     *   rate(rate, id) -> Sets the playback rate of passed sound id.
     * @return {Howl/Number} Returns self or the current playback rate.
     */
    rate: function() {
      var self = this;
      var args = arguments;
      var rate, id;

      // Determine the values based on arguments.
      if (args.length === 0) {
        // We will simply return the current rate of the first node.
        id = self._sounds[0]._id;
      } else if (args.length === 1) {
        // First check if this is an ID, and if not, assume it is a new rate value.
        var ids = self._getSoundIds();
        var index = ids.indexOf(args[0]);
        if (index >= 0) {
          id = parseInt(args[0], 10);
        } else {
          rate = parseFloat(args[0]);
        }
      } else if (args.length === 2) {
        rate = parseFloat(args[0]);
        id = parseInt(args[1], 10);
      }

      // Update the playback rate or return the current value.
      var sound;
      if (typeof rate === 'number') {
        // If the sound hasn't loaded, add it to the load queue to change playback rate when capable.
        if (self._state !== 'loaded' || self._playLock) {
          self._queue.push({
            event: 'rate',
            action: function() {
              self.rate.apply(self, args);
            }
          });

          return self;
        }

        // Set the group rate.
        if (typeof id === 'undefined') {
          self._rate = rate;
        }

        // Update one or all volumes.
        id = self._getSoundIds(id);
        for (var i=0; i<id.length; i++) {
          // Get the sound.
          sound = self._soundById(id[i]);

          if (sound) {
            // Keep track of our position when the rate changed and update the playback
            // start position so we can properly adjust the seek position for time elapsed.
            if (self.playing(id[i])) {
              sound._rateSeek = self.seek(id[i]);
              sound._playStart = self._webAudio ? Howler.ctx.currentTime : sound._playStart;
            }
            sound._rate = rate;

            // Change the playback rate.
            if (self._webAudio && sound._node && sound._node.bufferSource) {
              sound._node.bufferSource.playbackRate.setValueAtTime(rate, Howler.ctx.currentTime);
            } else if (sound._node) {
              sound._node.playbackRate = rate;
            }

            // Reset the timers.
            var seek = self.seek(id[i]);
            var duration = ((self._sprite[sound._sprite][0] + self._sprite[sound._sprite][1]) / 1000) - seek;
            var timeout = (duration * 1000) / Math.abs(sound._rate);

            // Start a new end timer if sound is already playing.
            if (self._endTimers[id[i]] || !sound._paused) {
              self._clearTimer(id[i]);
              self._endTimers[id[i]] = setTimeout(self._ended.bind(self, sound), timeout);
            }

            self._emit('rate', sound._id);
          }
        }
      } else {
        sound = self._soundById(id);
        return sound ? sound._rate : self._rate;
      }

      return self;
    },

    /**
     * Get/set the seek position of a sound. This method can optionally take 0, 1 or 2 arguments.
     *   seek() -> Returns the first sound node's current seek position.
     *   seek(id) -> Returns the sound id's current seek position.
     *   seek(seek) -> Sets the seek position of the first sound node.
     *   seek(seek, id) -> Sets the seek position of passed sound id.
     * @return {Howl/Number} Returns self or the current seek position.
     */
    seek: function() {
      var self = this;
      var args = arguments;
      var seek, id;

      // Determine the values based on arguments.
      if (args.length === 0) {
        // We will simply return the current position of the first node.
        if (self._sounds.length) {
          id = self._sounds[0]._id;
        }
      } else if (args.length === 1) {
        // First check if this is an ID, and if not, assume it is a new seek position.
        var ids = self._getSoundIds();
        var index = ids.indexOf(args[0]);
        if (index >= 0) {
          id = parseInt(args[0], 10);
        } else if (self._sounds.length) {
          id = self._sounds[0]._id;
          seek = parseFloat(args[0]);
        }
      } else if (args.length === 2) {
        seek = parseFloat(args[0]);
        id = parseInt(args[1], 10);
      }

      // If there is no ID, bail out.
      if (typeof id === 'undefined') {
        return 0;
      }

      // If the sound hasn't loaded, add it to the load queue to seek when capable.
      if (typeof seek === 'number' && (self._state !== 'loaded' || self._playLock)) {
        self._queue.push({
          event: 'seek',
          action: function() {
            self.seek.apply(self, args);
          }
        });

        return self;
      }

      // Get the sound.
      var sound = self._soundById(id);

      if (sound) {
        if (typeof seek === 'number' && seek >= 0) {
          // Pause the sound and update position for restarting playback.
          var playing = self.playing(id);
          if (playing) {
            self.pause(id, true);
          }

          // Move the position of the track and cancel timer.
          sound._seek = seek;
          sound._ended = false;
          self._clearTimer(id);

          // Update the seek position for HTML5 Audio.
          if (!self._webAudio && sound._node && !isNaN(sound._node.duration)) {
            sound._node.currentTime = seek;
          }

          // Seek and emit when ready.
          var seekAndEmit = function() {
            // Restart the playback if the sound was playing.
            if (playing) {
              self.play(id, true);
            }

            self._emit('seek', id);
          };

          // Wait for the play lock to be unset before emitting (HTML5 Audio).
          if (playing && !self._webAudio) {
            var emitSeek = function() {
              if (!self._playLock) {
                seekAndEmit();
              } else {
                setTimeout(emitSeek, 0);
              }
            };
            setTimeout(emitSeek, 0);
          } else {
            seekAndEmit();
          }
        } else {
          if (self._webAudio) {
            var realTime = self.playing(id) ? Howler.ctx.currentTime - sound._playStart : 0;
            var rateSeek = sound._rateSeek ? sound._rateSeek - sound._seek : 0;
            return sound._seek + (rateSeek + realTime * Math.abs(sound._rate));
          } else {
            return sound._node.currentTime;
          }
        }
      }

      return self;
    },

    /**
     * Check if a specific sound is currently playing or not (if id is provided), or check if at least one of the sounds in the group is playing or not.
     * @param  {Number}  id The sound id to check. If none is passed, the whole sound group is checked.
     * @return {Boolean} True if playing and false if not.
     */
    playing: function(id) {
      var self = this;

      // Check the passed sound ID (if any).
      if (typeof id === 'number') {
        var sound = self._soundById(id);
        return sound ? !sound._paused : false;
      }

      // Otherwise, loop through all sounds and check if any are playing.
      for (var i=0; i<self._sounds.length; i++) {
        if (!self._sounds[i]._paused) {
          return true;
        }
      }

      return false;
    },

    /**
     * Get the duration of this sound. Passing a sound id will return the sprite duration.
     * @param  {Number} id The sound id to check. If none is passed, return full source duration.
     * @return {Number} Audio duration in seconds.
     */
    duration: function(id) {
      var self = this;
      var duration = self._duration;

      // If we pass an ID, get the sound and return the sprite length.
      var sound = self._soundById(id);
      if (sound) {
        duration = self._sprite[sound._sprite][1] / 1000;
      }

      return duration;
    },

    /**
     * Returns the current loaded state of this Howl.
     * @return {String} 'unloaded', 'loading', 'loaded'
     */
    state: function() {
      return this._state;
    },

    /**
     * Unload and destroy the current Howl object.
     * This will immediately stop all sound instances attached to this group.
     */
    unload: function() {
      var self = this;

      // Stop playing any active sounds.
      var sounds = self._sounds;
      for (var i=0; i<sounds.length; i++) {
        // Stop the sound if it is currently playing.
        if (!sounds[i]._paused) {
          self.stop(sounds[i]._id);
        }

        // Remove the source or disconnect.
        if (!self._webAudio) {
          // Set the source to 0-second silence to stop any downloading (except in IE).
          self._clearSound(sounds[i]._node);

          // Remove any event listeners.
          sounds[i]._node.removeEventListener('error', sounds[i]._errorFn, false);
          sounds[i]._node.removeEventListener(Howler._canPlayEvent, sounds[i]._loadFn, false);
          sounds[i]._node.removeEventListener('ended', sounds[i]._endFn, false);

          // Release the Audio object back to the pool.
          Howler._releaseHtml5Audio(sounds[i]._node);
        }

        // Empty out all of the nodes.
        delete sounds[i]._node;

        // Make sure all timers are cleared out.
        self._clearTimer(sounds[i]._id);
      }

      // Remove the references in the global Howler object.
      var index = Howler._howls.indexOf(self);
      if (index >= 0) {
        Howler._howls.splice(index, 1);
      }

      // Delete this sound from the cache (if no other Howl is using it).
      var remCache = true;
      for (i=0; i<Howler._howls.length; i++) {
        if (Howler._howls[i]._src === self._src || self._src.indexOf(Howler._howls[i]._src) >= 0) {
          remCache = false;
          break;
        }
      }

      if (cache && remCache) {
        delete cache[self._src];
      }

      // Clear global errors.
      Howler.noAudio = false;

      // Clear out `self`.
      self._state = 'unloaded';
      self._sounds = [];
      self = null;

      return null;
    },

    /**
     * Listen to a custom event.
     * @param  {String}   event Event name.
     * @param  {Function} fn    Listener to call.
     * @param  {Number}   id    (optional) Only listen to events for this sound.
     * @param  {Number}   once  (INTERNAL) Marks event to fire only once.
     * @return {Howl}
     */
    on: function(event, fn, id, once) {
      var self = this;
      var events = self['_on' + event];

      if (typeof fn === 'function') {
        events.push(once ? {id: id, fn: fn, once: once} : {id: id, fn: fn});
      }

      return self;
    },

    /**
     * Remove a custom event. Call without parameters to remove all events.
     * @param  {String}   event Event name.
     * @param  {Function} fn    Listener to remove. Leave empty to remove all.
     * @param  {Number}   id    (optional) Only remove events for this sound.
     * @return {Howl}
     */
    off: function(event, fn, id) {
      var self = this;
      var events = self['_on' + event];
      var i = 0;

      // Allow passing just an event and ID.
      if (typeof fn === 'number') {
        id = fn;
        fn = null;
      }

      if (fn || id) {
        // Loop through event store and remove the passed function.
        for (i=0; i<events.length; i++) {
          var isId = (id === events[i].id);
          if (fn === events[i].fn && isId || !fn && isId) {
            events.splice(i, 1);
            break;
          }
        }
      } else if (event) {
        // Clear out all events of this type.
        self['_on' + event] = [];
      } else {
        // Clear out all events of every type.
        var keys = Object.keys(self);
        for (i=0; i<keys.length; i++) {
          if ((keys[i].indexOf('_on') === 0) && Array.isArray(self[keys[i]])) {
            self[keys[i]] = [];
          }
        }
      }

      return self;
    },

    /**
     * Listen to a custom event and remove it once fired.
     * @param  {String}   event Event name.
     * @param  {Function} fn    Listener to call.
     * @param  {Number}   id    (optional) Only listen to events for this sound.
     * @return {Howl}
     */
    once: function(event, fn, id) {
      var self = this;

      // Setup the event listener.
      self.on(event, fn, id, 1);

      return self;
    },

    /**
     * Emit all events of a specific type and pass the sound id.
     * @param  {String} event Event name.
     * @param  {Number} id    Sound ID.
     * @param  {Number} msg   Message to go with event.
     * @return {Howl}
     */
    _emit: function(event, id, msg) {
      var self = this;
      var events = self['_on' + event];

      // Loop through event store and fire all functions.
      for (var i=events.length-1; i>=0; i--) {
        // Only fire the listener if the correct ID is used.
        if (!events[i].id || events[i].id === id || event === 'load') {
          setTimeout(function(fn) {
            fn.call(this, id, msg);
          }.bind(self, events[i].fn), 0);

          // If this event was setup with `once`, remove it.
          if (events[i].once) {
            self.off(event, events[i].fn, events[i].id);
          }
        }
      }

      // Pass the event type into load queue so that it can continue stepping.
      self._loadQueue(event);

      return self;
    },

    /**
     * Queue of actions initiated before the sound has loaded.
     * These will be called in sequence, with the next only firing
     * after the previous has finished executing (even if async like play).
     * @return {Howl}
     */
    _loadQueue: function(event) {
      var self = this;

      if (self._queue.length > 0) {
        var task = self._queue[0];

        // Remove this task if a matching event was passed.
        if (task.event === event) {
          self._queue.shift();
          self._loadQueue();
        }

        // Run the task if no event type is passed.
        if (!event) {
          task.action();
        }
      }

      return self;
    },

    /**
     * Fired when playback ends at the end of the duration.
     * @param  {Sound} sound The sound object to work with.
     * @return {Howl}
     */
    _ended: function(sound) {
      var self = this;
      var sprite = sound._sprite;

      // If we are using IE and there was network latency we may be clipping
      // audio before it completes playing. Lets check the node to make sure it
      // believes it has completed, before ending the playback.
      if (!self._webAudio && sound._node && !sound._node.paused && !sound._node.ended && sound._node.currentTime < sound._stop) {
        setTimeout(self._ended.bind(self, sound), 100);
        return self;
      }

      // Should this sound loop?
      var loop = !!(sound._loop || self._sprite[sprite][2]);

      // Fire the ended event.
      self._emit('end', sound._id);

      // Restart the playback for HTML5 Audio loop.
      if (!self._webAudio && loop) {
        self.stop(sound._id, true).play(sound._id);
      }

      // Restart this timer if on a Web Audio loop.
      if (self._webAudio && loop) {
        self._emit('play', sound._id);
        sound._seek = sound._start || 0;
        sound._rateSeek = 0;
        sound._playStart = Howler.ctx.currentTime;

        var timeout = ((sound._stop - sound._start) * 1000) / Math.abs(sound._rate);
        self._endTimers[sound._id] = setTimeout(self._ended.bind(self, sound), timeout);
      }

      // Mark the node as paused.
      if (self._webAudio && !loop) {
        sound._paused = true;
        sound._ended = true;
        sound._seek = sound._start || 0;
        sound._rateSeek = 0;
        self._clearTimer(sound._id);

        // Clean up the buffer source.
        self._cleanBuffer(sound._node);

        // Attempt to auto-suspend AudioContext if no sounds are still playing.
        Howler._autoSuspend();
      }

      // When using a sprite, end the track.
      if (!self._webAudio && !loop) {
        self.stop(sound._id, true);
      }

      return self;
    },

    /**
     * Clear the end timer for a sound playback.
     * @param  {Number} id The sound ID.
     * @return {Howl}
     */
    _clearTimer: function(id) {
      var self = this;

      if (self._endTimers[id]) {
        // Clear the timeout or remove the ended listener.
        if (typeof self._endTimers[id] !== 'function') {
          clearTimeout(self._endTimers[id]);
        } else {
          var sound = self._soundById(id);
          if (sound && sound._node) {
            sound._node.removeEventListener('ended', self._endTimers[id], false);
          }
        }

        delete self._endTimers[id];
      }

      return self;
    },

    /**
     * Return the sound identified by this ID, or return null.
     * @param  {Number} id Sound ID
     * @return {Object}    Sound object or null.
     */
    _soundById: function(id) {
      var self = this;

      // Loop through all sounds and find the one with this ID.
      for (var i=0; i<self._sounds.length; i++) {
        if (id === self._sounds[i]._id) {
          return self._sounds[i];
        }
      }

      return null;
    },

    /**
     * Return an inactive sound from the pool or create a new one.
     * @return {Sound} Sound playback object.
     */
    _inactiveSound: function() {
      var self = this;

      self._drain();

      // Find the first inactive node to recycle.
      for (var i=0; i<self._sounds.length; i++) {
        if (self._sounds[i]._ended) {
          return self._sounds[i].reset();
        }
      }

      // If no inactive node was found, create a new one.
      return new Sound(self);
    },

    /**
     * Drain excess inactive sounds from the pool.
     */
    _drain: function() {
      var self = this;
      var limit = self._pool;
      var cnt = 0;
      var i = 0;

      // If there are less sounds than the max pool size, we are done.
      if (self._sounds.length < limit) {
        return;
      }

      // Count the number of inactive sounds.
      for (i=0; i<self._sounds.length; i++) {
        if (self._sounds[i]._ended) {
          cnt++;
        }
      }

      // Remove excess inactive sounds, going in reverse order.
      for (i=self._sounds.length - 1; i>=0; i--) {
        if (cnt <= limit) {
          return;
        }

        if (self._sounds[i]._ended) {
          // Disconnect the audio source when using Web Audio.
          if (self._webAudio && self._sounds[i]._node) {
            self._sounds[i]._node.disconnect(0);
          }

          // Remove sounds until we have the pool size.
          self._sounds.splice(i, 1);
          cnt--;
        }
      }
    },

    /**
     * Get all ID's from the sounds pool.
     * @param  {Number} id Only return one ID if one is passed.
     * @return {Array}    Array of IDs.
     */
    _getSoundIds: function(id) {
      var self = this;

      if (typeof id === 'undefined') {
        var ids = [];
        for (var i=0; i<self._sounds.length; i++) {
          ids.push(self._sounds[i]._id);
        }

        return ids;
      } else {
        return [id];
      }
    },

    /**
     * Load the sound back into the buffer source.
     * @param  {Sound} sound The sound object to work with.
     * @return {Howl}
     */
    _refreshBuffer: function(sound) {
      var self = this;

      // Setup the buffer source for playback.
      sound._node.bufferSource = Howler.ctx.createBufferSource();
      sound._node.bufferSource.buffer = cache[self._src];

      // Connect to the correct node.
      if (sound._panner) {
        sound._node.bufferSource.connect(sound._panner);
      } else {
        sound._node.bufferSource.connect(sound._node);
      }

      // Setup looping and playback rate.
      sound._node.bufferSource.loop = sound._loop;
      if (sound._loop) {
        sound._node.bufferSource.loopStart = sound._start || 0;
        sound._node.bufferSource.loopEnd = sound._stop || 0;
      }
      sound._node.bufferSource.playbackRate.setValueAtTime(sound._rate, Howler.ctx.currentTime);

      return self;
    },

    /**
     * Prevent memory leaks by cleaning up the buffer source after playback.
     * @param  {Object} node Sound's audio node containing the buffer source.
     * @return {Howl}
     */
    _cleanBuffer: function(node) {
      var self = this;
      var isIOS = Howler._navigator && Howler._navigator.vendor.indexOf('Apple') >= 0;

      if (!node.bufferSource) {
        return self;
      }

      if (Howler._scratchBuffer && node.bufferSource) {
        node.bufferSource.onended = null;
        node.bufferSource.disconnect(0);
        if (isIOS) {
          try { node.bufferSource.buffer = Howler._scratchBuffer; } catch(e) {}
        }
      }
      node.bufferSource = null;

      return self;
    },

    /**
     * Set the source to a 0-second silence to stop any downloading (except in IE).
     * @param  {Object} node Audio node to clear.
     */
    _clearSound: function(node) {
      var checkIE = /MSIE |Trident\//.test(Howler._navigator && Howler._navigator.userAgent);
      if (!checkIE) {
        node.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      }
    }
  };

  /** Single Sound Methods **/
  /***************************************************************************/

  /**
   * Setup the sound object, which each node attached to a Howl group is contained in.
   * @param {Object} howl The Howl parent group.
   */
  var Sound = function(howl) {
    this._parent = howl;
    this.init();
  };
  Sound.prototype = {
    /**
     * Initialize a new Sound object.
     * @return {Sound}
     */
    init: function() {
      var self = this;
      var parent = self._parent;

      // Setup the default parameters.
      self._muted = parent._muted;
      self._loop = parent._loop;
      self._volume = parent._volume;
      self._rate = parent._rate;
      self._seek = 0;
      self._paused = true;
      self._ended = true;
      self._sprite = '__default';

      // Generate a unique ID for this sound.
      self._id = ++Howler._counter;

      // Add itself to the parent's pool.
      parent._sounds.push(self);

      // Create the new node.
      self.create();

      return self;
    },

    /**
     * Create and setup a new sound object, whether HTML5 Audio or Web Audio.
     * @return {Sound}
     */
    create: function() {
      var self = this;
      var parent = self._parent;
      var volume = (Howler._muted || self._muted || self._parent._muted) ? 0 : self._volume;

      if (parent._webAudio) {
        // Create the gain node for controlling volume (the source will connect to this).
        self._node = (typeof Howler.ctx.createGain === 'undefined') ? Howler.ctx.createGainNode() : Howler.ctx.createGain();
        self._node.gain.setValueAtTime(volume, Howler.ctx.currentTime);
        self._node.paused = true;
        self._node.connect(Howler.masterGain);
      } else if (!Howler.noAudio) {
        // Get an unlocked Audio object from the pool.
        self._node = Howler._obtainHtml5Audio();

        // Listen for errors (http://dev.w3.org/html5/spec-author-view/spec.html#mediaerror).
        self._errorFn = self._errorListener.bind(self);
        self._node.addEventListener('error', self._errorFn, false);

        // Listen for 'canplaythrough' event to let us know the sound is ready.
        self._loadFn = self._loadListener.bind(self);
        self._node.addEventListener(Howler._canPlayEvent, self._loadFn, false);

        // Listen for the 'ended' event on the sound to account for edge-case where
        // a finite sound has a duration of Infinity.
        self._endFn = self._endListener.bind(self);
        self._node.addEventListener('ended', self._endFn, false);

        // Setup the new audio node.
        self._node.src = parent._src;
        self._node.preload = parent._preload === true ? 'auto' : parent._preload;
        self._node.volume = volume * Howler.volume();

        // Begin loading the source.
        self._node.load();
      }

      return self;
    },

    /**
     * Reset the parameters of this sound to the original state (for recycle).
     * @return {Sound}
     */
    reset: function() {
      var self = this;
      var parent = self._parent;

      // Reset all of the parameters of this sound.
      self._muted = parent._muted;
      self._loop = parent._loop;
      self._volume = parent._volume;
      self._rate = parent._rate;
      self._seek = 0;
      self._rateSeek = 0;
      self._paused = true;
      self._ended = true;
      self._sprite = '__default';

      // Generate a new ID so that it isn't confused with the previous sound.
      self._id = ++Howler._counter;

      return self;
    },

    /**
     * HTML5 Audio error listener callback.
     */
    _errorListener: function() {
      var self = this;

      // Fire an error event and pass back the code.
      self._parent._emit('loaderror', self._id, self._node.error ? self._node.error.code : 0);

      // Clear the event listener.
      self._node.removeEventListener('error', self._errorFn, false);
    },

    /**
     * HTML5 Audio canplaythrough listener callback.
     */
    _loadListener: function() {
      var self = this;
      var parent = self._parent;

      // Round up the duration to account for the lower precision in HTML5 Audio.
      parent._duration = Math.ceil(self._node.duration * 10) / 10;

      // Setup a sprite if none is defined.
      if (Object.keys(parent._sprite).length === 0) {
        parent._sprite = {__default: [0, parent._duration * 1000]};
      }

      if (parent._state !== 'loaded') {
        parent._state = 'loaded';
        parent._emit('load');
        parent._loadQueue();
      }

      // Clear the event listener.
      self._node.removeEventListener(Howler._canPlayEvent, self._loadFn, false);
    },

    /**
     * HTML5 Audio ended listener callback.
     */
    _endListener: function() {
      var self = this;
      var parent = self._parent;

      // Only handle the `ended`` event if the duration is Infinity.
      if (parent._duration === Infinity) {
        // Update the parent duration to match the real audio duration.
        // Round up the duration to account for the lower precision in HTML5 Audio.
        parent._duration = Math.ceil(self._node.duration * 10) / 10;

        // Update the sprite that corresponds to the real duration.
        if (parent._sprite.__default[1] === Infinity) {
          parent._sprite.__default[1] = parent._duration * 1000;
        }

        // Run the regular ended method.
        parent._ended(self);
      }

      // Clear the event listener since the duration is now correct.
      self._node.removeEventListener('ended', self._endFn, false);
    }
  };

  /** Helper Methods **/
  /***************************************************************************/

  var cache = {};

  /**
   * Buffer a sound from URL, Data URI or cache and decode to audio source (Web Audio API).
   * @param  {Howl} self
   */
  var loadBuffer = function(self) {
    var url = self._src;

    // Check if the buffer has already been cached and use it instead.
    if (cache[url]) {
      // Set the duration from the cache.
      self._duration = cache[url].duration;

      // Load the sound into this Howl.
      loadSound(self);

      return;
    }

    if (/^data:[^;]+;base64,/.test(url)) {
      // Decode the base64 data URI without XHR, since some browsers don't support it.
      var data = atob(url.split(',')[1]);
      var dataView = new Uint8Array(data.length);
      for (var i=0; i<data.length; ++i) {
        dataView[i] = data.charCodeAt(i);
      }

      decodeAudioData(dataView.buffer, self);
    } else {
      // Load the buffer from the URL.
      var xhr = new XMLHttpRequest();
      xhr.open(self._xhr.method, url, true);
      xhr.withCredentials = self._xhr.withCredentials;
      xhr.responseType = 'arraybuffer';

      // Apply any custom headers to the request.
      if (self._xhr.headers) {
        Object.keys(self._xhr.headers).forEach(function(key) {
          xhr.setRequestHeader(key, self._xhr.headers[key]);
        });
      }

      xhr.onload = function() {
        // Make sure we get a successful response back.
        var code = (xhr.status + '')[0];
        if (code !== '0' && code !== '2' && code !== '3') {
          self._emit('loaderror', null, 'Failed loading audio file with status: ' + xhr.status + '.');
          return;
        }

        decodeAudioData(xhr.response, self);
      };
      xhr.onerror = function() {
        // If there is an error, switch to HTML5 Audio.
        if (self._webAudio) {
          self._html5 = true;
          self._webAudio = false;
          self._sounds = [];
          delete cache[url];
          self.load();
        }
      };
      safeXhrSend(xhr);
    }
  };

  /**
   * Send the XHR request wrapped in a try/catch.
   * @param  {Object} xhr XHR to send.
   */
  var safeXhrSend = function(xhr) {
    try {
      xhr.send();
    } catch (e) {
      xhr.onerror();
    }
  };

  /**
   * Decode audio data from an array buffer.
   * @param  {ArrayBuffer} arraybuffer The audio data.
   * @param  {Howl}        self
   */
  var decodeAudioData = function(arraybuffer, self) {
    // Fire a load error if something broke.
    var error = function() {
      self._emit('loaderror', null, 'Decoding audio data failed.');
    };

    // Load the sound on success.
    var success = function(buffer) {
      if (buffer && self._sounds.length > 0) {
        cache[self._src] = buffer;
        loadSound(self, buffer);
      } else {
        error();
      }
    };

    // Decode the buffer into an audio source.
    if (typeof Promise !== 'undefined' && Howler.ctx.decodeAudioData.length === 1) {
      Howler.ctx.decodeAudioData(arraybuffer).then(success).catch(error);
    } else {
      Howler.ctx.decodeAudioData(arraybuffer, success, error);
    }
  }

  /**
   * Sound is now loaded, so finish setting everything up and fire the loaded event.
   * @param  {Howl} self
   * @param  {Object} buffer The decoded buffer sound source.
   */
  var loadSound = function(self, buffer) {
    // Set the duration.
    if (buffer && !self._duration) {
      self._duration = buffer.duration;
    }

    // Setup a sprite if none is defined.
    if (Object.keys(self._sprite).length === 0) {
      self._sprite = {__default: [0, self._duration * 1000]};
    }

    // Fire the loaded event.
    if (self._state !== 'loaded') {
      self._state = 'loaded';
      self._emit('load');
      self._loadQueue();
    }
  };

  /**
   * Setup the audio context when available, or switch to HTML5 Audio mode.
   */
  var setupAudioContext = function() {
    // If we have already detected that Web Audio isn't supported, don't run this step again.
    if (!Howler.usingWebAudio) {
      return;
    }

    // Check if we are using Web Audio and setup the AudioContext if we are.
    try {
      if (typeof AudioContext !== 'undefined') {
        Howler.ctx = new AudioContext();
      } else if (typeof webkitAudioContext !== 'undefined') {
        Howler.ctx = new webkitAudioContext();
      } else {
        Howler.usingWebAudio = false;
      }
    } catch(e) {
      Howler.usingWebAudio = false;
    }

    // If the audio context creation still failed, set using web audio to false.
    if (!Howler.ctx) {
      Howler.usingWebAudio = false;
    }

    // Check if a webview is being used on iOS8 or earlier (rather than the browser).
    // If it is, disable Web Audio as it causes crashing.
    var iOS = (/iP(hone|od|ad)/.test(Howler._navigator && Howler._navigator.platform));
    var appVersion = Howler._navigator && Howler._navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
    var version = appVersion ? parseInt(appVersion[1], 10) : null;
    if (iOS && version && version < 9) {
      var safari = /safari/.test(Howler._navigator && Howler._navigator.userAgent.toLowerCase());
      if (Howler._navigator && !safari) {
        Howler.usingWebAudio = false;
      }
    }

    // Create and expose the master GainNode when using Web Audio (useful for plugins or advanced usage).
    if (Howler.usingWebAudio) {
      Howler.masterGain = (typeof Howler.ctx.createGain === 'undefined') ? Howler.ctx.createGainNode() : Howler.ctx.createGain();
      Howler.masterGain.gain.setValueAtTime(Howler._muted ? 0 : Howler._volume, Howler.ctx.currentTime);
      Howler.masterGain.connect(Howler.ctx.destination);
    }

    // Re-run the setup on Howler.
    Howler._setup();
  };

  // Add support for AMD (Asynchronous Module Definition) libraries such as require.js.
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function() {
      return {
        Howler: Howler,
        Howl: Howl
      };
    }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  }

  // Add support for CommonJS libraries such as browserify.
  if (true) {
    exports.Howler = Howler;
    exports.Howl = Howl;
  }

  // Add to global in Node.js (for testing, etc).
  if (typeof __webpack_require__.g !== 'undefined') {
    __webpack_require__.g.HowlerGlobal = HowlerGlobal;
    __webpack_require__.g.Howler = Howler;
    __webpack_require__.g.Howl = Howl;
    __webpack_require__.g.Sound = Sound;
  } else if (typeof window !== 'undefined') {  // Define globally in case AMD is not available or unused.
    window.HowlerGlobal = HowlerGlobal;
    window.Howler = Howler;
    window.Howl = Howl;
    window.Sound = Sound;
  }
})();


/*!
 *  Spatial Plugin - Adds support for stereo and 3D audio where Web Audio is supported.
 *  
 *  howler.js v2.2.4
 *  howlerjs.com
 *
 *  (c) 2013-2020, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */

(function() {

  'use strict';

  // Setup default properties.
  HowlerGlobal.prototype._pos = [0, 0, 0];
  HowlerGlobal.prototype._orientation = [0, 0, -1, 0, 1, 0];

  /** Global Methods **/
  /***************************************************************************/

  /**
   * Helper method to update the stereo panning position of all current Howls.
   * Future Howls will not use this value unless explicitly set.
   * @param  {Number} pan A value of -1.0 is all the way left and 1.0 is all the way right.
   * @return {Howler/Number}     Self or current stereo panning value.
   */
  HowlerGlobal.prototype.stereo = function(pan) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self.ctx || !self.ctx.listener) {
      return self;
    }

    // Loop through all Howls and update their stereo panning.
    for (var i=self._howls.length-1; i>=0; i--) {
      self._howls[i].stereo(pan);
    }

    return self;
  };

  /**
   * Get/set the position of the listener in 3D cartesian space. Sounds using
   * 3D position will be relative to the listener's position.
   * @param  {Number} x The x-position of the listener.
   * @param  {Number} y The y-position of the listener.
   * @param  {Number} z The z-position of the listener.
   * @return {Howler/Array}   Self or current listener position.
   */
  HowlerGlobal.prototype.pos = function(x, y, z) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self.ctx || !self.ctx.listener) {
      return self;
    }

    // Set the defaults for optional 'y' & 'z'.
    y = (typeof y !== 'number') ? self._pos[1] : y;
    z = (typeof z !== 'number') ? self._pos[2] : z;

    if (typeof x === 'number') {
      self._pos = [x, y, z];

      if (typeof self.ctx.listener.positionX !== 'undefined') {
        self.ctx.listener.positionX.setTargetAtTime(self._pos[0], Howler.ctx.currentTime, 0.1);
        self.ctx.listener.positionY.setTargetAtTime(self._pos[1], Howler.ctx.currentTime, 0.1);
        self.ctx.listener.positionZ.setTargetAtTime(self._pos[2], Howler.ctx.currentTime, 0.1);
      } else {
        self.ctx.listener.setPosition(self._pos[0], self._pos[1], self._pos[2]);
      }
    } else {
      return self._pos;
    }

    return self;
  };

  /**
   * Get/set the direction the listener is pointing in the 3D cartesian space.
   * A front and up vector must be provided. The front is the direction the
   * face of the listener is pointing, and up is the direction the top of the
   * listener is pointing. Thus, these values are expected to be at right angles
   * from each other.
   * @param  {Number} x   The x-orientation of the listener.
   * @param  {Number} y   The y-orientation of the listener.
   * @param  {Number} z   The z-orientation of the listener.
   * @param  {Number} xUp The x-orientation of the top of the listener.
   * @param  {Number} yUp The y-orientation of the top of the listener.
   * @param  {Number} zUp The z-orientation of the top of the listener.
   * @return {Howler/Array}     Returns self or the current orientation vectors.
   */
  HowlerGlobal.prototype.orientation = function(x, y, z, xUp, yUp, zUp) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self.ctx || !self.ctx.listener) {
      return self;
    }

    // Set the defaults for optional 'y' & 'z'.
    var or = self._orientation;
    y = (typeof y !== 'number') ? or[1] : y;
    z = (typeof z !== 'number') ? or[2] : z;
    xUp = (typeof xUp !== 'number') ? or[3] : xUp;
    yUp = (typeof yUp !== 'number') ? or[4] : yUp;
    zUp = (typeof zUp !== 'number') ? or[5] : zUp;

    if (typeof x === 'number') {
      self._orientation = [x, y, z, xUp, yUp, zUp];

      if (typeof self.ctx.listener.forwardX !== 'undefined') {
        self.ctx.listener.forwardX.setTargetAtTime(x, Howler.ctx.currentTime, 0.1);
        self.ctx.listener.forwardY.setTargetAtTime(y, Howler.ctx.currentTime, 0.1);
        self.ctx.listener.forwardZ.setTargetAtTime(z, Howler.ctx.currentTime, 0.1);
        self.ctx.listener.upX.setTargetAtTime(xUp, Howler.ctx.currentTime, 0.1);
        self.ctx.listener.upY.setTargetAtTime(yUp, Howler.ctx.currentTime, 0.1);
        self.ctx.listener.upZ.setTargetAtTime(zUp, Howler.ctx.currentTime, 0.1);
      } else {
        self.ctx.listener.setOrientation(x, y, z, xUp, yUp, zUp);
      }
    } else {
      return or;
    }

    return self;
  };

  /** Group Methods **/
  /***************************************************************************/

  /**
   * Add new properties to the core init.
   * @param  {Function} _super Core init method.
   * @return {Howl}
   */
  Howl.prototype.init = (function(_super) {
    return function(o) {
      var self = this;

      // Setup user-defined default properties.
      self._orientation = o.orientation || [1, 0, 0];
      self._stereo = o.stereo || null;
      self._pos = o.pos || null;
      self._pannerAttr = {
        coneInnerAngle: typeof o.coneInnerAngle !== 'undefined' ? o.coneInnerAngle : 360,
        coneOuterAngle: typeof o.coneOuterAngle !== 'undefined' ? o.coneOuterAngle : 360,
        coneOuterGain: typeof o.coneOuterGain !== 'undefined' ? o.coneOuterGain : 0,
        distanceModel: typeof o.distanceModel !== 'undefined' ? o.distanceModel : 'inverse',
        maxDistance: typeof o.maxDistance !== 'undefined' ? o.maxDistance : 10000,
        panningModel: typeof o.panningModel !== 'undefined' ? o.panningModel : 'HRTF',
        refDistance: typeof o.refDistance !== 'undefined' ? o.refDistance : 1,
        rolloffFactor: typeof o.rolloffFactor !== 'undefined' ? o.rolloffFactor : 1
      };

      // Setup event listeners.
      self._onstereo = o.onstereo ? [{fn: o.onstereo}] : [];
      self._onpos = o.onpos ? [{fn: o.onpos}] : [];
      self._onorientation = o.onorientation ? [{fn: o.onorientation}] : [];

      // Complete initilization with howler.js core's init function.
      return _super.call(this, o);
    };
  })(Howl.prototype.init);

  /**
   * Get/set the stereo panning of the audio source for this sound or all in the group.
   * @param  {Number} pan  A value of -1.0 is all the way left and 1.0 is all the way right.
   * @param  {Number} id (optional) The sound ID. If none is passed, all in group will be updated.
   * @return {Howl/Number}    Returns self or the current stereo panning value.
   */
  Howl.prototype.stereo = function(pan, id) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self._webAudio) {
      return self;
    }

    // If the sound hasn't loaded, add it to the load queue to change stereo pan when capable.
    if (self._state !== 'loaded') {
      self._queue.push({
        event: 'stereo',
        action: function() {
          self.stereo(pan, id);
        }
      });

      return self;
    }

    // Check for PannerStereoNode support and fallback to PannerNode if it doesn't exist.
    var pannerType = (typeof Howler.ctx.createStereoPanner === 'undefined') ? 'spatial' : 'stereo';

    // Setup the group's stereo panning if no ID is passed.
    if (typeof id === 'undefined') {
      // Return the group's stereo panning if no parameters are passed.
      if (typeof pan === 'number') {
        self._stereo = pan;
        self._pos = [pan, 0, 0];
      } else {
        return self._stereo;
      }
    }

    // Change the streo panning of one or all sounds in group.
    var ids = self._getSoundIds(id);
    for (var i=0; i<ids.length; i++) {
      // Get the sound.
      var sound = self._soundById(ids[i]);

      if (sound) {
        if (typeof pan === 'number') {
          sound._stereo = pan;
          sound._pos = [pan, 0, 0];

          if (sound._node) {
            // If we are falling back, make sure the panningModel is equalpower.
            sound._pannerAttr.panningModel = 'equalpower';

            // Check if there is a panner setup and create a new one if not.
            if (!sound._panner || !sound._panner.pan) {
              setupPanner(sound, pannerType);
            }

            if (pannerType === 'spatial') {
              if (typeof sound._panner.positionX !== 'undefined') {
                sound._panner.positionX.setValueAtTime(pan, Howler.ctx.currentTime);
                sound._panner.positionY.setValueAtTime(0, Howler.ctx.currentTime);
                sound._panner.positionZ.setValueAtTime(0, Howler.ctx.currentTime);
              } else {
                sound._panner.setPosition(pan, 0, 0);
              }
            } else {
              sound._panner.pan.setValueAtTime(pan, Howler.ctx.currentTime);
            }
          }

          self._emit('stereo', sound._id);
        } else {
          return sound._stereo;
        }
      }
    }

    return self;
  };

  /**
   * Get/set the 3D spatial position of the audio source for this sound or group relative to the global listener.
   * @param  {Number} x  The x-position of the audio source.
   * @param  {Number} y  The y-position of the audio source.
   * @param  {Number} z  The z-position of the audio source.
   * @param  {Number} id (optional) The sound ID. If none is passed, all in group will be updated.
   * @return {Howl/Array}    Returns self or the current 3D spatial position: [x, y, z].
   */
  Howl.prototype.pos = function(x, y, z, id) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self._webAudio) {
      return self;
    }

    // If the sound hasn't loaded, add it to the load queue to change position when capable.
    if (self._state !== 'loaded') {
      self._queue.push({
        event: 'pos',
        action: function() {
          self.pos(x, y, z, id);
        }
      });

      return self;
    }

    // Set the defaults for optional 'y' & 'z'.
    y = (typeof y !== 'number') ? 0 : y;
    z = (typeof z !== 'number') ? -0.5 : z;

    // Setup the group's spatial position if no ID is passed.
    if (typeof id === 'undefined') {
      // Return the group's spatial position if no parameters are passed.
      if (typeof x === 'number') {
        self._pos = [x, y, z];
      } else {
        return self._pos;
      }
    }

    // Change the spatial position of one or all sounds in group.
    var ids = self._getSoundIds(id);
    for (var i=0; i<ids.length; i++) {
      // Get the sound.
      var sound = self._soundById(ids[i]);

      if (sound) {
        if (typeof x === 'number') {
          sound._pos = [x, y, z];

          if (sound._node) {
            // Check if there is a panner setup and create a new one if not.
            if (!sound._panner || sound._panner.pan) {
              setupPanner(sound, 'spatial');
            }

            if (typeof sound._panner.positionX !== 'undefined') {
              sound._panner.positionX.setValueAtTime(x, Howler.ctx.currentTime);
              sound._panner.positionY.setValueAtTime(y, Howler.ctx.currentTime);
              sound._panner.positionZ.setValueAtTime(z, Howler.ctx.currentTime);
            } else {
              sound._panner.setPosition(x, y, z);
            }
          }

          self._emit('pos', sound._id);
        } else {
          return sound._pos;
        }
      }
    }

    return self;
  };

  /**
   * Get/set the direction the audio source is pointing in the 3D cartesian coordinate
   * space. Depending on how direction the sound is, based on the `cone` attributes,
   * a sound pointing away from the listener can be quiet or silent.
   * @param  {Number} x  The x-orientation of the source.
   * @param  {Number} y  The y-orientation of the source.
   * @param  {Number} z  The z-orientation of the source.
   * @param  {Number} id (optional) The sound ID. If none is passed, all in group will be updated.
   * @return {Howl/Array}    Returns self or the current 3D spatial orientation: [x, y, z].
   */
  Howl.prototype.orientation = function(x, y, z, id) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self._webAudio) {
      return self;
    }

    // If the sound hasn't loaded, add it to the load queue to change orientation when capable.
    if (self._state !== 'loaded') {
      self._queue.push({
        event: 'orientation',
        action: function() {
          self.orientation(x, y, z, id);
        }
      });

      return self;
    }

    // Set the defaults for optional 'y' & 'z'.
    y = (typeof y !== 'number') ? self._orientation[1] : y;
    z = (typeof z !== 'number') ? self._orientation[2] : z;

    // Setup the group's spatial orientation if no ID is passed.
    if (typeof id === 'undefined') {
      // Return the group's spatial orientation if no parameters are passed.
      if (typeof x === 'number') {
        self._orientation = [x, y, z];
      } else {
        return self._orientation;
      }
    }

    // Change the spatial orientation of one or all sounds in group.
    var ids = self._getSoundIds(id);
    for (var i=0; i<ids.length; i++) {
      // Get the sound.
      var sound = self._soundById(ids[i]);

      if (sound) {
        if (typeof x === 'number') {
          sound._orientation = [x, y, z];

          if (sound._node) {
            // Check if there is a panner setup and create a new one if not.
            if (!sound._panner) {
              // Make sure we have a position to setup the node with.
              if (!sound._pos) {
                sound._pos = self._pos || [0, 0, -0.5];
              }

              setupPanner(sound, 'spatial');
            }

            if (typeof sound._panner.orientationX !== 'undefined') {
              sound._panner.orientationX.setValueAtTime(x, Howler.ctx.currentTime);
              sound._panner.orientationY.setValueAtTime(y, Howler.ctx.currentTime);
              sound._panner.orientationZ.setValueAtTime(z, Howler.ctx.currentTime);
            } else {
              sound._panner.setOrientation(x, y, z);
            }
          }

          self._emit('orientation', sound._id);
        } else {
          return sound._orientation;
        }
      }
    }

    return self;
  };

  /**
   * Get/set the panner node's attributes for a sound or group of sounds.
   * This method can optionall take 0, 1 or 2 arguments.
   *   pannerAttr() -> Returns the group's values.
   *   pannerAttr(id) -> Returns the sound id's values.
   *   pannerAttr(o) -> Set's the values of all sounds in this Howl group.
   *   pannerAttr(o, id) -> Set's the values of passed sound id.
   *
   *   Attributes:
   *     coneInnerAngle - (360 by default) A parameter for directional audio sources, this is an angle, in degrees,
   *                      inside of which there will be no volume reduction.
   *     coneOuterAngle - (360 by default) A parameter for directional audio sources, this is an angle, in degrees,
   *                      outside of which the volume will be reduced to a constant value of `coneOuterGain`.
   *     coneOuterGain - (0 by default) A parameter for directional audio sources, this is the gain outside of the
   *                     `coneOuterAngle`. It is a linear value in the range `[0, 1]`.
   *     distanceModel - ('inverse' by default) Determines algorithm used to reduce volume as audio moves away from
   *                     listener. Can be `linear`, `inverse` or `exponential.
   *     maxDistance - (10000 by default) The maximum distance between source and listener, after which the volume
   *                   will not be reduced any further.
   *     refDistance - (1 by default) A reference distance for reducing volume as source moves further from the listener.
   *                   This is simply a variable of the distance model and has a different effect depending on which model
   *                   is used and the scale of your coordinates. Generally, volume will be equal to 1 at this distance.
   *     rolloffFactor - (1 by default) How quickly the volume reduces as source moves from listener. This is simply a
   *                     variable of the distance model and can be in the range of `[0, 1]` with `linear` and `[0, ∞]`
   *                     with `inverse` and `exponential`.
   *     panningModel - ('HRTF' by default) Determines which spatialization algorithm is used to position audio.
   *                     Can be `HRTF` or `equalpower`.
   *
   * @return {Howl/Object} Returns self or current panner attributes.
   */
  Howl.prototype.pannerAttr = function() {
    var self = this;
    var args = arguments;
    var o, id, sound;

    // Stop right here if not using Web Audio.
    if (!self._webAudio) {
      return self;
    }

    // Determine the values based on arguments.
    if (args.length === 0) {
      // Return the group's panner attribute values.
      return self._pannerAttr;
    } else if (args.length === 1) {
      if (typeof args[0] === 'object') {
        o = args[0];

        // Set the grou's panner attribute values.
        if (typeof id === 'undefined') {
          if (!o.pannerAttr) {
            o.pannerAttr = {
              coneInnerAngle: o.coneInnerAngle,
              coneOuterAngle: o.coneOuterAngle,
              coneOuterGain: o.coneOuterGain,
              distanceModel: o.distanceModel,
              maxDistance: o.maxDistance,
              refDistance: o.refDistance,
              rolloffFactor: o.rolloffFactor,
              panningModel: o.panningModel
            };
          }

          self._pannerAttr = {
            coneInnerAngle: typeof o.pannerAttr.coneInnerAngle !== 'undefined' ? o.pannerAttr.coneInnerAngle : self._coneInnerAngle,
            coneOuterAngle: typeof o.pannerAttr.coneOuterAngle !== 'undefined' ? o.pannerAttr.coneOuterAngle : self._coneOuterAngle,
            coneOuterGain: typeof o.pannerAttr.coneOuterGain !== 'undefined' ? o.pannerAttr.coneOuterGain : self._coneOuterGain,
            distanceModel: typeof o.pannerAttr.distanceModel !== 'undefined' ? o.pannerAttr.distanceModel : self._distanceModel,
            maxDistance: typeof o.pannerAttr.maxDistance !== 'undefined' ? o.pannerAttr.maxDistance : self._maxDistance,
            refDistance: typeof o.pannerAttr.refDistance !== 'undefined' ? o.pannerAttr.refDistance : self._refDistance,
            rolloffFactor: typeof o.pannerAttr.rolloffFactor !== 'undefined' ? o.pannerAttr.rolloffFactor : self._rolloffFactor,
            panningModel: typeof o.pannerAttr.panningModel !== 'undefined' ? o.pannerAttr.panningModel : self._panningModel
          };
        }
      } else {
        // Return this sound's panner attribute values.
        sound = self._soundById(parseInt(args[0], 10));
        return sound ? sound._pannerAttr : self._pannerAttr;
      }
    } else if (args.length === 2) {
      o = args[0];
      id = parseInt(args[1], 10);
    }

    // Update the values of the specified sounds.
    var ids = self._getSoundIds(id);
    for (var i=0; i<ids.length; i++) {
      sound = self._soundById(ids[i]);

      if (sound) {
        // Merge the new values into the sound.
        var pa = sound._pannerAttr;
        pa = {
          coneInnerAngle: typeof o.coneInnerAngle !== 'undefined' ? o.coneInnerAngle : pa.coneInnerAngle,
          coneOuterAngle: typeof o.coneOuterAngle !== 'undefined' ? o.coneOuterAngle : pa.coneOuterAngle,
          coneOuterGain: typeof o.coneOuterGain !== 'undefined' ? o.coneOuterGain : pa.coneOuterGain,
          distanceModel: typeof o.distanceModel !== 'undefined' ? o.distanceModel : pa.distanceModel,
          maxDistance: typeof o.maxDistance !== 'undefined' ? o.maxDistance : pa.maxDistance,
          refDistance: typeof o.refDistance !== 'undefined' ? o.refDistance : pa.refDistance,
          rolloffFactor: typeof o.rolloffFactor !== 'undefined' ? o.rolloffFactor : pa.rolloffFactor,
          panningModel: typeof o.panningModel !== 'undefined' ? o.panningModel : pa.panningModel
        };

        // Create a new panner node if one doesn't already exist.
        var panner = sound._panner;
        if (!panner) {
          // Make sure we have a position to setup the node with.
          if (!sound._pos) {
            sound._pos = self._pos || [0, 0, -0.5];
          }

          // Create a new panner node.
          setupPanner(sound, 'spatial');
          panner = sound._panner
        }

        // Update the panner values or create a new panner if none exists.
        panner.coneInnerAngle = pa.coneInnerAngle;
        panner.coneOuterAngle = pa.coneOuterAngle;
        panner.coneOuterGain = pa.coneOuterGain;
        panner.distanceModel = pa.distanceModel;
        panner.maxDistance = pa.maxDistance;
        panner.refDistance = pa.refDistance;
        panner.rolloffFactor = pa.rolloffFactor;
        panner.panningModel = pa.panningModel;
      }
    }

    return self;
  };

  /** Single Sound Methods **/
  /***************************************************************************/

  /**
   * Add new properties to the core Sound init.
   * @param  {Function} _super Core Sound init method.
   * @return {Sound}
   */
  Sound.prototype.init = (function(_super) {
    return function() {
      var self = this;
      var parent = self._parent;

      // Setup user-defined default properties.
      self._orientation = parent._orientation;
      self._stereo = parent._stereo;
      self._pos = parent._pos;
      self._pannerAttr = parent._pannerAttr;

      // Complete initilization with howler.js core Sound's init function.
      _super.call(this);

      // If a stereo or position was specified, set it up.
      if (self._stereo) {
        parent.stereo(self._stereo);
      } else if (self._pos) {
        parent.pos(self._pos[0], self._pos[1], self._pos[2], self._id);
      }
    };
  })(Sound.prototype.init);

  /**
   * Override the Sound.reset method to clean up properties from the spatial plugin.
   * @param  {Function} _super Sound reset method.
   * @return {Sound}
   */
  Sound.prototype.reset = (function(_super) {
    return function() {
      var self = this;
      var parent = self._parent;

      // Reset all spatial plugin properties on this sound.
      self._orientation = parent._orientation;
      self._stereo = parent._stereo;
      self._pos = parent._pos;
      self._pannerAttr = parent._pannerAttr;

      // If a stereo or position was specified, set it up.
      if (self._stereo) {
        parent.stereo(self._stereo);
      } else if (self._pos) {
        parent.pos(self._pos[0], self._pos[1], self._pos[2], self._id);
      } else if (self._panner) {
        // Disconnect the panner.
        self._panner.disconnect(0);
        self._panner = undefined;
        parent._refreshBuffer(self);
      }

      // Complete resetting of the sound.
      return _super.call(this);
    };
  })(Sound.prototype.reset);

  /** Helper Methods **/
  /***************************************************************************/

  /**
   * Create a new panner node and save it on the sound.
   * @param  {Sound} sound Specific sound to setup panning on.
   * @param {String} type Type of panner to create: 'stereo' or 'spatial'.
   */
  var setupPanner = function(sound, type) {
    type = type || 'spatial';

    // Create the new panner node.
    if (type === 'spatial') {
      sound._panner = Howler.ctx.createPanner();
      sound._panner.coneInnerAngle = sound._pannerAttr.coneInnerAngle;
      sound._panner.coneOuterAngle = sound._pannerAttr.coneOuterAngle;
      sound._panner.coneOuterGain = sound._pannerAttr.coneOuterGain;
      sound._panner.distanceModel = sound._pannerAttr.distanceModel;
      sound._panner.maxDistance = sound._pannerAttr.maxDistance;
      sound._panner.refDistance = sound._pannerAttr.refDistance;
      sound._panner.rolloffFactor = sound._pannerAttr.rolloffFactor;
      sound._panner.panningModel = sound._pannerAttr.panningModel;

      if (typeof sound._panner.positionX !== 'undefined') {
        sound._panner.positionX.setValueAtTime(sound._pos[0], Howler.ctx.currentTime);
        sound._panner.positionY.setValueAtTime(sound._pos[1], Howler.ctx.currentTime);
        sound._panner.positionZ.setValueAtTime(sound._pos[2], Howler.ctx.currentTime);
      } else {
        sound._panner.setPosition(sound._pos[0], sound._pos[1], sound._pos[2]);
      }

      if (typeof sound._panner.orientationX !== 'undefined') {
        sound._panner.orientationX.setValueAtTime(sound._orientation[0], Howler.ctx.currentTime);
        sound._panner.orientationY.setValueAtTime(sound._orientation[1], Howler.ctx.currentTime);
        sound._panner.orientationZ.setValueAtTime(sound._orientation[2], Howler.ctx.currentTime);
      } else {
        sound._panner.setOrientation(sound._orientation[0], sound._orientation[1], sound._orientation[2]);
      }
    } else {
      sound._panner = Howler.ctx.createStereoPanner();
      sound._panner.pan.setValueAtTime(sound._stereo, Howler.ctx.currentTime);
    }

    sound._panner.connect(sound._node);

    // Update the connections.
    if (!sound._paused) {
      sound._parent.pause(sound._id, true).play(sound._id, true);
    }
  };
})();


/***/ }),

/***/ 136:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BackgroundController = exports.TronRoadBackground = exports.SpaceBackground = void 0;
var SpaceBackground = /** @class */ (function () {
    function SpaceBackground(canvas) {
        this.stars = [];
        this.trails = [];
        this.lastTime = performance.now();
        this.running = false;
        this.hueBase = 220;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.populate();
        this.start();
    }
    SpaceBackground.prototype.resize = function (width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.populate(true);
    };
    SpaceBackground.prototype.start = function () {
        var _this = this;
        if (this.running)
            return;
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame(function (ts) { return _this.tick(ts); });
    };
    SpaceBackground.prototype.destroy = function () {
        this.running = false;
    };
    SpaceBackground.prototype.tick = function (timestamp) {
        var _this = this;
        if (!this.running)
            return;
        var delta = Math.min(0.05, (timestamp - this.lastTime) / 1000);
        this.lastTime = timestamp;
        this.hueBase = (this.hueBase + delta * 4) % 360;
        this.paintSky();
        this.paintStars(delta);
        this.paintTrails(delta);
        requestAnimationFrame(function (ts) { return _this.tick(ts); });
    };
    SpaceBackground.prototype.paintSky = function () {
        var topHue = (this.hueBase + 200) % 360;
        var bottomHue = (this.hueBase + 250) % 360;
        var g = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        g.addColorStop(0, "hsl(".concat(topHue, ", 35%, 10%)"));
        g.addColorStop(0.45, "hsl(".concat((topHue + 20) % 360, ", 40%, 8%)"));
        g.addColorStop(1, "hsl(".concat(bottomHue, ", 45%, 6%)"));
        this.ctx.fillStyle = g;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    };
    SpaceBackground.prototype.paintStars = function (delta) {
        for (var i = 0; i < this.stars.length; i++) {
            var s = this.stars[i];
            s.y += s.speed * delta;
            s.alpha += Math.sin(this.lastTime * 0.002 + s.twinkle) * 0.02;
            if (s.y > this.canvas.height) {
                this.stars[i] = this.spawnStar(false);
                continue;
            }
            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0.1, Math.min(0.9, s.alpha));
            this.ctx.fillStyle = "white";
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    };
    SpaceBackground.prototype.paintTrails = function (delta) {
        for (var i = 0; i < this.trails.length; i++) {
            var t = this.trails[i];
            t.y += t.speed * delta;
            if (t.y - t.length > this.canvas.height) {
                this.trails[i] = this.spawnTrail(false);
                continue;
            }
            var grad = this.ctx.createLinearGradient(t.x, t.y - t.length, t.x, t.y);
            grad.addColorStop(0, "hsla(".concat(t.hue, ", 70%, 70%, 0)"));
            grad.addColorStop(0.45, "hsla(".concat(t.hue, ", 80%, 70%, ").concat(t.alpha * 0.5, ")"));
            grad.addColorStop(1, "hsla(".concat(t.hue, ", 90%, 72%, ").concat(t.alpha, ")"));
            this.ctx.save();
            this.ctx.globalCompositeOperation = "screen";
            this.ctx.strokeStyle = grad;
            this.ctx.lineWidth = t.width;
            this.ctx.lineCap = "round";
            this.ctx.beginPath();
            this.ctx.moveTo(t.x, t.y - t.length);
            this.ctx.lineTo(t.x, t.y);
            this.ctx.stroke();
            this.ctx.restore();
        }
    };
    SpaceBackground.prototype.populate = function (reset) {
        if (reset === void 0) { reset = false; }
        if (reset) {
            this.stars = [];
            this.trails = [];
        }
        var starCount = Math.max(60, Math.round((this.canvas.width * this.canvas.height) / 9000));
        var trailCount = Math.max(8, Math.round(this.canvas.width / 80));
        while (this.stars.length < starCount)
            this.stars.push(this.spawnStar(true));
        while (this.trails.length < trailCount)
            this.trails.push(this.spawnTrail(true));
    };
    SpaceBackground.prototype.spawnStar = function (initial) {
        var size = this.randomRange(0.5, 2.2);
        return {
            x: Math.random() * this.canvas.width,
            y: initial ? Math.random() * this.canvas.height : -size * 2,
            size: size,
            speed: this.randomRange(this.canvas.height * 0.05, this.canvas.height * 0.14),
            alpha: this.randomRange(0.3, 0.8),
            twinkle: Math.random() * Math.PI * 2,
        };
    };
    SpaceBackground.prototype.spawnTrail = function (initial) {
        var width = this.randomRange(1.2, 3.4);
        var length = this.randomRange(this.canvas.height * 0.08, this.canvas.height * 0.2);
        return {
            x: Math.random() * this.canvas.width,
            y: initial ? Math.random() * this.canvas.height : -length,
            length: length,
            speed: this.randomRange(this.canvas.height * 0.4, this.canvas.height * 0.8),
            width: width,
            hue: this.randomRange(200, 280),
            alpha: this.randomRange(0.35, 0.7),
        };
    };
    SpaceBackground.prototype.randomRange = function (min, max) {
        return Math.random() * (max - min) + min;
    };
    return SpaceBackground;
}());
exports.SpaceBackground = SpaceBackground;
var TronRoadBackground = /** @class */ (function () {
    function TronRoadBackground(canvas) {
        this.running = false;
        this.lastTime = performance.now();
        this.offset = 0;
        this.hueBase = 200;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.start();
    }
    TronRoadBackground.prototype.resize = function (width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    };
    TronRoadBackground.prototype.start = function () {
        var _this = this;
        if (this.running)
            return;
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame(function (ts) { return _this.tick(ts); });
    };
    TronRoadBackground.prototype.destroy = function () {
        this.running = false;
    };
    TronRoadBackground.prototype.tick = function (timestamp) {
        var _this = this;
        if (!this.running)
            return;
        var delta = Math.min(0.05, (timestamp - this.lastTime) / 1000);
        this.lastTime = timestamp;
        this.offset = (this.offset + delta * 140) % 48;
        this.hueBase = (this.hueBase + delta * 6) % 360;
        this.paintSky();
        this.paintGrid();
        requestAnimationFrame(function (ts) { return _this.tick(ts); });
    };
    TronRoadBackground.prototype.paintSky = function () {
        var topHue = (this.hueBase + 40) % 360;
        var midHue = (this.hueBase + 15) % 360;
        var bottomHue = (this.hueBase + 300) % 360;
        var g = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        g.addColorStop(0, "hsl(".concat(topHue, ", 40%, 16%)"));
        g.addColorStop(0.45, "hsl(".concat(midHue, ", 45%, 12%)"));
        g.addColorStop(1, "hsl(".concat(bottomHue, ", 55%, 6%)"));
        this.ctx.fillStyle = g;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Distant glow on horizon.
        var glow = this.ctx.createRadialGradient(this.canvas.width / 2, this.canvas.height * 0.32, 20, this.canvas.width / 2, this.canvas.height * 0.3, this.canvas.height * 0.9);
        glow.addColorStop(0, "hsla(".concat((this.hueBase + 200) % 360, ", 80%, 60%, 0.45)"));
        glow.addColorStop(1, "rgba(0,0,0,0)");
        this.ctx.fillStyle = glow;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    };
    TronRoadBackground.prototype.paintGrid = function () {
        var h = this.canvas.height;
        var w = this.canvas.width;
        var horizon = h * 0.25;
        var centerX = w / 2;
        var topWidth = w * 0.12;
        var bottomWidth = w * 1.3;
        var stripeSpacing = 40;
        var colorHue = (this.hueBase + 180) % 360;
        var lineColor = "hsla(".concat(colorHue, ", 90%, 65%, 0.8)");
        var glowColor = "hsla(".concat(colorHue, ", 90%, 65%, 0.25)");
        // Road body.
        var roadGradient = this.ctx.createLinearGradient(0, horizon, 0, h);
        roadGradient.addColorStop(0, "rgba(10, 5, 20, 0.7)");
        roadGradient.addColorStop(1, "rgba(5, 2, 12, 0.95)");
        var roadPath = new Path2D();
        roadPath.moveTo(centerX - topWidth / 2, horizon);
        roadPath.lineTo(centerX + topWidth / 2, horizon);
        roadPath.lineTo(centerX + bottomWidth / 2, h);
        roadPath.lineTo(centerX - bottomWidth / 2, h);
        roadPath.closePath();
        this.ctx.fillStyle = roadGradient;
        this.ctx.fill(roadPath);
        this.ctx.save();
        this.ctx.globalCompositeOperation = "screen";
        this.ctx.strokeStyle = lineColor;
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = lineColor;
        this.ctx.shadowBlur = 12;
        // Horizontal stripes moving toward the player.
        for (var y = h - this.offset; y > horizon; y -= stripeSpacing) {
            var t = (y - horizon) / (h - horizon);
            var roadW = topWidth + (bottomWidth - topWidth) * t;
            var xL = centerX - roadW / 2;
            var xR = centerX + roadW / 2;
            this.ctx.beginPath();
            this.ctx.moveTo(xL, y);
            this.ctx.lineTo(xR, y);
            this.ctx.stroke();
        }
        // Vertical neon rails.
        var rails = 8;
        for (var i = 0; i < rails; i++) {
            var frac = i / (rails - 1);
            var xTop = centerX - topWidth / 2 + topWidth * frac;
            var xBottom = centerX - bottomWidth / 2 + bottomWidth * frac;
            this.ctx.beginPath();
            this.ctx.moveTo(xTop, horizon);
            this.ctx.lineTo(xBottom, h);
            this.ctx.stroke();
        }
        this.ctx.restore();
        // Soft bloom over the road.
        var bloom = this.ctx.createLinearGradient(0, horizon, 0, h);
        bloom.addColorStop(0, "rgba(255,255,255,0)");
        bloom.addColorStop(1, glowColor);
        this.ctx.fillStyle = bloom;
        this.ctx.fill(roadPath);
    };
    return TronRoadBackground;
}());
exports.TronRoadBackground = TronRoadBackground;
var BackgroundController = /** @class */ (function () {
    function BackgroundController(canvas, initialMode) {
        this.current = null;
        this.canvas = canvas;
        this.mode = initialMode;
        this.setMode(initialMode);
    }
    BackgroundController.prototype.setMode = function (mode) {
        var _a;
        if (mode === this.mode && this.current)
            return;
        (_a = this.current) === null || _a === void 0 ? void 0 : _a.destroy();
        this.mode = mode;
        this.current = mode === "tron"
            ? new TronRoadBackground(this.canvas)
            : new SpaceBackground(this.canvas);
    };
    BackgroundController.prototype.resize = function (width, height) {
        var _a;
        this.canvas.width = width;
        this.canvas.height = height;
        (_a = this.current) === null || _a === void 0 ? void 0 : _a.resize(width, height);
    };
    return BackgroundController;
}());
exports.BackgroundController = BackgroundController;


/***/ }),

/***/ 124:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Colision = void 0;
var Colision = /** @class */ (function () {
    function Colision() {
    }
    //Check if a enemy in array is colision with a fire
    Colision.checkColision = function (x, y, width, height, enemies) {
        var fireBounds = {
            x1: x,
            y1: y,
            x2: x + width,
            y2: y + height,
        };
        var elementsNumber = enemies.length;
        for (var i = 0; i <= elementsNumber; i++) {
            if (enemies[i]) {
                var enemyBounds = {
                    x1: enemies[i].x,
                    y1: enemies[i].y,
                    x2: enemies[i].x + enemies[i].width,
                    y2: enemies[i].y + enemies[i].height,
                };
                if (this.checkVerticalCollision(fireBounds, enemyBounds) &&
                    this.checkHorizontalCollision(fireBounds, enemyBounds)) {
                    console.log("killed ".concat(i));
                    return i;
                }
            }
        }
        return -1;
    };
    Colision.checkVerticalCollision = function (bounds1, bounds2) {
        return bounds2.y2 <= bounds1.y2 && bounds2.y2 >= bounds1.y1 || bounds1.y1 >= bounds2.y1 && bounds1.y1 <= bounds2.y2;
    };
    Colision.checkHorizontalCollision = function (bounds1, bounds2) {
        return bounds1.x1 >= bounds2.x1 && bounds1.x1 <= bounds2.x2 || bounds2.x2 <= bounds1.x2 && bounds2.x2 >= bounds1.x1;
    };
    return Colision;
}());
exports.Colision = Colision;


/***/ }),

/***/ 874:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CollisionSystem = void 0;
var config_1 = __webpack_require__(913);
var tools_1 = __webpack_require__(594);
var CollisionSystem = /** @class */ (function () {
    function CollisionSystem(game, services) {
        if (services === void 0) { services = tools_1.services; }
        this.game = game;
        this.services = services;
    }
    CollisionSystem.prototype.tick = function () {
        this.handleProjectiles();
        this.handleAttackers();
    };
    CollisionSystem.prototype.handleProjectiles = function () {
        var _this = this;
        this.services.forEachProjectile(function (p) {
            if (p.owner === "player") {
                var enemies = _this.game.enemies.items;
                var hit = enemies.findIndex(function (e) {
                    return p.x < e.x + e.width &&
                        p.x + p.width > e.x &&
                        p.y < e.y + e.height &&
                        p.y + p.height > e.y;
                });
                if (_this.game.shields.hit(p.x, p.y, p.width, p.height)) {
                    return false;
                }
                if (hit !== -1) {
                    var enemy = enemies[hit];
                    _this.services.explode(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, undefined, enemy.getColor());
                    _this.game.enemies.remove(hit, true);
                    _this.game.enemies.paint();
                    return false;
                }
            }
            else {
                if (_this.game.shields.hit(p.x, p.y, p.width, p.height)) {
                    return false;
                }
                var nave = _this.game.nave;
                if (nave.isInvulnerable()) {
                    return true;
                }
                var hit = p.x < nave.x + config_1.Config.naveWidth &&
                    p.x + p.width > nave.x &&
                    p.y < nave.y + config_1.Config.naveHeight &&
                    p.y + p.height > nave.y;
                if (hit) {
                    nave.life--;
                    _this.game.life = nave.life;
                    nave.flashHit();
                    if (nave.life <= 0) {
                        _this.services.explode(nave.x + config_1.Config.naveWidth / 2, nave.y + config_1.Config.naveHeight / 2, config_1.Config.naveWidth * 1.5);
                        _this.services.playPlayerDestroyed();
                        _this.services.startGameOverTheme();
                        _this.game.showMessage("You are dead");
                        _this.game.reload();
                    }
                    return false;
                }
            }
            return true;
        });
    };
    CollisionSystem.prototype.handleAttackers = function () {
        var enemies = this.game.enemies.items;
        var nave = this.game.nave;
        for (var _i = 0, enemies_1 = enemies; _i < enemies_1.length; _i++) {
            var enemy = enemies_1[_i];
            if (!enemy.isInAttack())
                continue;
            var hit = enemy.x < nave.x + config_1.Config.naveWidth &&
                enemy.x + enemy.width > nave.x &&
                enemy.y < nave.y + config_1.Config.naveHeight &&
                enemy.y + enemy.height > nave.y;
            if (hit && !nave.isInvulnerable()) {
                this.services.explode(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, undefined, enemy.getColor());
                this.game.enemies.removeByEnemy(enemy);
                enemy.resetPosition(0, 0);
                nave.life--;
                this.game.life = nave.life;
                nave.flashHit();
                if (nave.life <= 0) {
                    this.services.explode(nave.x + config_1.Config.naveWidth / 2, nave.y + config_1.Config.naveHeight / 2, config_1.Config.naveWidth);
                    this.services.playPlayerDestroyed();
                    this.services.startGameOverTheme();
                    this.game.showMessage("You are dead");
                    this.game.reload();
                    return;
                }
            }
        }
    };
    return CollisionSystem;
}());
exports.CollisionSystem = CollisionSystem;


/***/ }),

/***/ 913:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Config = void 0;
var Config = /** @class */ (function () {
    function Config() {
    }
    Config.init = function () {
        this.canvas = document.getElementById("playfield");
        this.context = this.canvas.getContext("2d");
        this.projectileCanvas = document.getElementById("projectiles");
        this.projectileContext = this.projectileCanvas.getContext("2d");
        var scale = Math.min(this.canvas.width / this.baseWidth, this.canvas.height / this.baseHeight);
        this.enemyWidth = Math.max(12, Math.round(this.baseEnemySize * scale));
        this.enemyHeight = this.enemyWidth;
        this.naveWidth = Math.max(24, Math.round(this.baseNaveSize.width * scale));
        this.naveHeight = Math.max(10, Math.round(this.baseNaveSize.height * scale));
        this.fireHeight = Math.max(8, Math.round(this.baseFireHeight * scale));
        // Speed values inversely scale so timing stays similar across sizes.
        var speedScale = Math.max(0.5, Math.min(2, 1 / scale));
        this.firstSpeedLevel = Math.round(this.baseFirstSpeedLevel * speedScale);
        this.enemyFireSpeed = Math.round(this.baseEnemyFireSpeed * speedScale);
    };
    Config.game = document.getElementById('game');
    // Base values used to scale sprites relative to canvas size.
    Config.baseWidth = 560;
    Config.baseHeight = 720;
    Config.baseEnemySize = 24;
    Config.baseNaveSize = { width: 40, height: 16 };
    Config.baseFireHeight = 16;
    Config.baseFirstSpeedLevel = 8000;
    Config.baseEnemyFireSpeed = 1000;
    Config.naveLife = 3;
    Config.naveShots = 0;
    Config.naveMaxshots = 3;
    return Config;
}());
exports.Config = Config;


/***/ }),

/***/ 749:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Enemies = void 0;
var config_1 = __webpack_require__(913);
var enemy_1 = __webpack_require__(624);
var tools_1 = __webpack_require__(594);
var Enemies = /** @class */ (function () {
    function Enemies(game, services) {
        if (services === void 0) { services = tools_1.services; }
        this.horizontalDirection = 1;
        this.horizontalSpeed = config_1.Config.enemyWidth * 1.6; // px/s, scales with enemy size
        this.descentStep = config_1.Config.enemyHeight * 0.45;
        this.totalTime = 0;
        this.formationOffsetX = 0;
        this.formationOffsetY = 0;
        this.attackAccumulator = 0;
        this.nextAttackIn = 1.5;
        this.game = game;
        this.services = services;
        this.x = 0;
        this.y = 0;
        this.reset();
        this.initEnemies();
    }
    Enemies.prototype.reset = function () {
        this.formationOffsetX = 0;
        this.formationOffsetY = 0;
        this.attackAccumulator = 0;
        this.items = [];
    };
    //Remove a enemy bi index in enemies array
    Enemies.prototype.remove = function (index, allowDrop) {
        var _a, _b, _c;
        if (allowDrop === void 0) { allowDrop = false; }
        var enemy = (_a = this.items) === null || _a === void 0 ? void 0 : _a[index];
        if (!enemy)
            return;
        (_b = this.items) === null || _b === void 0 ? void 0 : _b.splice(index, 1);
        if (allowDrop) {
            this.game.powerUps.maybeSpawn(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
        }
        this.game.score++;
        this.services.playEnemyDestroyed();
        if (((_c = this.items) === null || _c === void 0 ? void 0 : _c.length) === 0) {
            this.game.showMessage("You win");
            this.services.removeEnemies();
            this.game.level++;
            //Init next wave
            this.reset();
            this.services.clearAll();
            this.initEnemies();
        }
    };
    Enemies.prototype.removeByEnemy = function (enemy, allowDrop) {
        if (allowDrop === void 0) { allowDrop = false; }
        var index = this.items.indexOf(enemy);
        if (index === -1)
            return false;
        this.remove(index, allowDrop);
        return true;
    };
    Enemies.prototype.initEnemies = function () {
        // Arcade-like formation: 11 columns x 5 rows, centered.
        var columns = 11;
        var rows = 5;
        var gapX = config_1.Config.enemyWidth * 2.3;
        var gapY = config_1.Config.enemyHeight * 2.1;
        var formationWidth = config_1.Config.enemyWidth + gapX * (columns - 1);
        var startX = Math.max(0, (config_1.Config.canvas.width - formationWidth) / 2);
        var startY = this.services.hudHeight + config_1.Config.enemyHeight * 1.5;
        var index = 0;
        for (var col = 0; col < columns; col++) {
            for (var row = 0; row < rows; row++) {
                var enemyType = Math.min(Math.max(0, row), 2);
                var x = startX + col * gapX;
                var y = startY + row * gapY;
                var enemyElement = new enemy_1.Enemy(x, y, index, enemyType, this, this.services);
                this.items.push(enemyElement);
                index++;
            }
        }
        this.enemyFire(config_1.Config.enemyFireSpeed);
        // Initial paint so the formation is visible before the first update tick.
        this.paint();
    };
    Enemies.prototype.frontLineEnemies = function () {
        var buckets = new Map();
        var bucketSize = config_1.Config.enemyWidth * 1.5;
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var enemy = _a[_i];
            if (enemy.isInAttack())
                continue;
            var bucket = Math.round(enemy.x / bucketSize);
            var current = buckets.get(bucket);
            if (!current || enemy.y > current.y) {
                buckets.set(bucket, enemy);
            }
        }
        return Array.from(buckets.values());
    };
    //paint all enemies
    Enemies.prototype.paint = function () {
        this.services.removeEnemies();
        this.game.shields.draw();
        for (var i = 0; i <= this.items.length - 1; i++)
            this.items[i].paint();
        return true;
    };
    //Run fire to a enemy
    Enemies.prototype.enemyFire = function (speed) {
        var _this = this;
        //First enemy in last row
        setTimeout(function () {
            if (_this.items.length > 0) {
                // Choose a random enemy from the bottom-most row per column.
                var frontLine = _this.frontLineEnemies();
                var shooter = frontLine[Math.floor(Math.random() * frontLine.length)];
                shooter === null || shooter === void 0 ? void 0 : shooter.fire();
            }
            _this.enemyFire(speed);
        }, speed);
    };
    Enemies.prototype.update = function (deltaSeconds) {
        if (this.game.paused)
            return;
        var toRemove = [];
        var moveX = this.horizontalDirection * this.horizontalSpeed * deltaSeconds;
        var minYBeforeDescent = this.services.hudHeight + config_1.Config.enemyHeight * 0.5;
        this.totalTime += deltaSeconds;
        // Check formation bounds based on base positions (ignore attackers' current x).
        var minX = Infinity;
        var maxX = -Infinity;
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var enemy = _a[_i];
            minX = Math.min(minX, enemy.baseX + this.formationOffsetX);
            maxX = Math.max(maxX, enemy.baseX + this.formationOffsetX + enemy.width);
        }
        var wouldHitLeft = minX + moveX < 0;
        var wouldHitRight = maxX + moveX > config_1.Config.canvas.width;
        if (wouldHitLeft || wouldHitRight) {
            this.horizontalDirection = this.horizontalDirection === 1 ? -1 : 1;
            this.formationOffsetY += this.descentStep;
        }
        else {
            this.formationOffsetX += moveX;
        }
        this.attackAccumulator += deltaSeconds;
        if (this.attackAccumulator >= this.nextAttackIn) {
            this.launchAttacker();
            this.attackAccumulator = 0;
            this.nextAttackIn = 1 + Math.random() * 2;
        }
        this.services.removeEnemies();
        this.game.shields.draw();
        for (var i = 0; i < this.items.length; i++) {
            var enemy = this.items[i];
            if (enemy.isInAttack()) {
                // Clear previous position trail for attackers.
                config_1.Config.context.clearRect(enemy.x, enemy.y, enemy.width, enemy.height);
                var attackState = enemy.updateAttack(deltaSeconds, this.formationOffsetX, this.formationOffsetY, this.game.shields);
                if (attackState === "finished") {
                    // Skip painting this frame; will be drawn in formation next frame.
                    continue;
                }
                var nave = this.game.nave;
                var collidesWithNave = enemy.x < nave.x + config_1.Config.naveWidth &&
                    enemy.x + enemy.width > nave.x &&
                    enemy.y < nave.y + config_1.Config.naveHeight &&
                    enemy.y + enemy.height > nave.y;
                if (collidesWithNave && !nave.isInvulnerable()) {
                    config_1.Config.context.clearRect(enemy.x, enemy.y, enemy.width, enemy.height);
                    this.services.explode(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, undefined, enemy.getColor());
                    toRemove.push(i);
                    nave.life--;
                    this.game.life = nave.life;
                    nave.flashHit();
                    if (nave.life <= 0) {
                        this.services.explode(nave.x + config_1.Config.naveWidth / 2, nave.y + config_1.Config.naveHeight / 2, config_1.Config.naveWidth);
                        this.services.playPlayerDestroyed();
                        this.services.startGameOverTheme();
                        this.game.showMessage("You are dead");
                        this.game.reload();
                        return;
                    }
                    continue;
                }
            }
            else {
                var wobble = Math.sin(this.totalTime * 2 + enemy.bobPhase) * (config_1.Config.enemyHeight * 0.12);
                enemy.x = enemy.baseX + this.formationOffsetX;
                enemy.y = Math.max(minYBeforeDescent, enemy.baseY + this.formationOffsetY + wobble);
                enemy.animate(deltaSeconds);
            }
            enemy.paint();
            if (!enemy.isInAttack() && enemy.y >= config_1.Config.canvas.height - 3 * config_1.Config.naveHeight) {
                this.game.showMessage("You are dead");
                this.services.playPlayerDestroyed();
                this.services.startGameOverTheme();
                window.location.reload();
                return;
            }
            if (enemy.y < minYBeforeDescent) {
                enemy.y = minYBeforeDescent;
            }
        }
        if (toRemove.length > 0) {
            var uniqueIndices = Array.from(new Set(toRemove)).sort(function (a, b) { return b - a; });
            for (var _b = 0, uniqueIndices_1 = uniqueIndices; _b < uniqueIndices_1.length; _b++) {
                var index = uniqueIndices_1[_b];
                this.remove(index, false);
            }
        }
    };
    Enemies.prototype.launchAttacker = function () {
        var frontLine = this.frontLineEnemies().filter(function (e) { return !e.isInAttack(); });
        if (frontLine.length === 0)
            return;
        var shooter = frontLine[Math.floor(Math.random() * frontLine.length)];
        var gaps = this.game.shields.getGaps();
        var predictedX = this.game.nave.x + config_1.Config.naveWidth / 2 + this.game.nave.velocityX * 0.5;
        var clampedTarget = Math.max(0, Math.min(config_1.Config.canvas.width, predictedX));
        var targetX = clampedTarget;
        if (gaps.length > 0) {
            targetX = gaps.reduce(function (prev, curr) {
                return Math.abs(curr - clampedTarget) < Math.abs(prev - clampedTarget) ? curr : prev;
            });
        }
        var targetY = this.game.nave.y;
        shooter.startAttack(targetX, targetY);
    };
    return Enemies;
}());
exports.Enemies = Enemies;
;


/***/ }),

/***/ 624:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Enemy = void 0;
var config_1 = __webpack_require__(913);
var tools_1 = __webpack_require__(594);
var Enemy = /** @class */ (function () {
    function Enemy(x, y, index, type, enemies, services) {
        if (services === void 0) { services = tools_1.services; }
        var _a;
        this.framePhase = 0;
        this.animationFrame = 0;
        this.isAttacking = false;
        this.attackTime = 0;
        this.vxAttack = 0;
        this.vyAttack = 0;
        this.attackAmplitude = 0;
        this.attackFrequency = 0;
        this.blinkUntil = 0;
        this.width = config_1.Config.enemyWidth;
        this.height = config_1.Config.enemyHeight;
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.index = index;
        this.type = Math.min(Math.max(0, type), Enemy.frames.length - 1);
        this.color = (_a = Enemy.colors[this.type]) !== null && _a !== void 0 ? _a : "#ffffff";
        this.enemies = enemies;
        this.animationSpeed = 1.5 + Math.random() * 1.5; // frames per second
        this.bobPhase = Math.random() * Math.PI * 2;
        this.services = services;
        this.paint();
    }
    Enemy.prototype.startAttack = function (targetX, targetY) {
        var dx = targetX - (this.x + this.width / 2);
        var dy = targetY - (this.y + this.height / 2);
        var angle = Math.atan2(dy, dx);
        var speed = 180 + Math.random() * 60;
        this.vxAttack = Math.cos(angle) * speed;
        this.vyAttack = Math.sin(angle) * speed;
        this.attackAmplitude = this.width * (1 + Math.random());
        this.attackFrequency = 2 + Math.random() * 2;
        this.attackTime = 0;
        this.isAttacking = true;
    };
    Enemy.prototype.updateAttack = function (deltaSeconds, formationOffsetX, formationOffsetY, shields) {
        var _this = this;
        if (!this.isAttacking)
            return "finished";
        this.attackTime += deltaSeconds;
        var wobble = Math.sin(this.attackTime * this.attackFrequency) * this.attackAmplitude * deltaSeconds;
        var shieldTop = shields.getTop();
        var shieldBottom = shields.getBottom();
        var gapCenters = shields.getGapCenters();
        if (this.y + this.height >= shieldTop - this.height && this.y <= shieldBottom + this.height) {
            // Nudge horizontally toward the nearest gap to avoid crashing into shields.
            var centerX_1 = this.x + this.width / 2;
            if (gapCenters.length > 0) {
                var nearestGap = gapCenters.reduce(function (prev, curr) {
                    return Math.abs(curr - centerX_1) < Math.abs(prev - centerX_1) ? curr : prev;
                });
                var steer = Math.sign(nearestGap - centerX_1);
                var steerAccel = 140; // px/s^2 horizontal steering
                this.vxAttack += steer * steerAccel * deltaSeconds;
            }
        }
        var nextX = this.x + this.vxAttack * deltaSeconds + wobble;
        var nextY = this.y + this.vyAttack * deltaSeconds + wobble * 0.2;
        var collisionSamples = [
            { x: nextX, y: nextY },
            { x: this.x, y: this.y },
            { x: (this.x + nextX) / 2, y: (this.y + nextY) / 2 },
        ];
        var hitSample = collisionSamples.find(function (sample) {
            return shields.collidesBody(sample.x, sample.y, _this.width, _this.height);
        });
        if (hitSample) {
            // Damage shield and explode.
            shields.damage(hitSample.x, hitSample.y, this.width, this.height, 3);
            config_1.Config.context.clearRect(this.x, this.y, this.width, this.height);
            this.services.explode(hitSample.x + this.width / 2, hitSample.y + this.height / 2, this.width, this.getColor());
            this.resetPosition(formationOffsetX, formationOffsetY);
            return "finished";
        }
        this.x = nextX;
        this.y = nextY;
        this.animate(deltaSeconds);
        var outOfBounds = this.y > config_1.Config.canvas.height + this.height || this.x < -this.width || this.x > config_1.Config.canvas.width + this.width;
        if (outOfBounds) {
            // Clear the final attack position to avoid trails.
            config_1.Config.context.clearRect(this.x, this.y, this.width, this.height);
            this.isAttacking = false;
            // Rejoin the formation at its current offset.
            this.x = this.baseX + formationOffsetX;
            this.y = this.baseY + formationOffsetY;
            return "finished";
        }
        return "attacking";
    };
    Enemy.prototype.isInAttack = function () {
        return this.isAttacking;
    };
    Enemy.prototype.stopAttack = function () { this.isAttacking = false; };
    Enemy.prototype.resetPosition = function (formationOffsetX, formationOffsetY) {
        this.isAttacking = false;
        this.x = this.baseX + formationOffsetX;
        this.y = this.baseY + formationOffsetY;
        this.attackTime = 0;
        this.framePhase = 0;
        this.blinkUntil = performance.now() + 600;
    };
    Enemy.prototype.getColor = function () {
        return this.color;
    };
    Enemy.prototype.animate = function (deltaSeconds) {
        var _a, _b;
        var frames = (_a = Enemy.frames[this.type]) !== null && _a !== void 0 ? _a : Enemy.frames[0];
        var frameCount = (_b = frames === null || frames === void 0 ? void 0 : frames.length) !== null && _b !== void 0 ? _b : 0;
        if (frameCount === 0)
            return;
        this.framePhase += this.animationSpeed * deltaSeconds;
        this.animationFrame = Math.floor(this.framePhase) % frameCount;
    };
    Enemy.prototype.paint = function () {
        var _a;
        var frames = (_a = Enemy.frames[this.type]) !== null && _a !== void 0 ? _a : Enemy.frames[0];
        if (!frames || frames.length === 0)
            return;
        var frameIndex = this.animationFrame % frames.length || 0;
        var frame = frames[frameIndex];
        if (!frame || frame.length === 0 || !frame[0])
            return;
        var pixelWidth = this.width / frame[0].length;
        var pixelHeight = this.height / frame.length;
        var ctx = config_1.Config.context;
        if (this.blinkUntil > performance.now()) {
            // Blink effect on teleport/rejoin.
            var blinkOn = Math.floor(performance.now() / 100) % 2 === 0;
            if (!blinkOn)
                return;
        }
        ctx.fillStyle = this.color;
        ctx.clearRect(this.x, this.y, this.width, this.height);
        for (var row = 0; row < frame.length; row++) {
            var line = frame[row];
            for (var col = 0; col < line.length; col++) {
                if (line[col] !== " ") {
                    ctx.fillRect(this.x + col * pixelWidth, this.y + row * pixelHeight, pixelWidth, pixelHeight);
                }
            }
        }
    };
    Enemy.prototype.Obstruction = function () {
        var elementNumber = this.enemies.items.length - 1;
        for (var i = 0; i <= elementNumber; i++) {
            if ((this.enemies.items[i].x == this.x) &&
                (this.enemies.items[i].index > this.index))
                return true;
        }
        return false;
    };
    ;
    //Enemy fire
    Enemy.prototype.fire = function () {
        var _this = this;
        if (!this.enemies.game.paused) {
            var width_1 = 3;
            var height_1 = 12;
            var startX = this.x + this.width / 2 - width_1 / 2;
            var startY = this.y + this.height + 5;
            var speed = 250; // px/s downward
            var game_1 = this.enemies.game;
            var nave_1 = game_1.nave;
            this.services.playShoot("enemy");
            this.services.addProjectile({
                x: startX,
                y: startY,
                vx: 0,
                vy: speed,
                width: width_1,
                height: height_1,
                color: this.color,
                owner: "enemy",
                onStep: function (p) {
                    var hitHorizontally = p.x + width_1 >= nave_1.x && p.x <= nave_1.x + config_1.Config.naveWidth;
                    var hitVertically = p.y + height_1 >= nave_1.y && p.y <= nave_1.y + config_1.Config.naveHeight;
                    if (hitHorizontally && hitVertically && !nave_1.isInvulnerable()) {
                        nave_1.life--;
                        game_1.life = nave_1.life;
                        nave_1.flashHit();
                        if (nave_1.life <= 0) {
                            _this.services.explode(nave_1.x + config_1.Config.naveWidth / 2, nave_1.y + config_1.Config.naveHeight / 2, config_1.Config.naveWidth * 1.5);
                            _this.services.playPlayerDestroyed();
                            _this.services.startGameOverTheme();
                            game_1.showMessage("You are dead");
                            game_1.reload();
                        }
                        return false;
                    }
                    return p.y <= config_1.Config.canvas.height;
                }
            });
        }
    };
    ;
    Enemy.frames = [
        // Classic invader shape: two-frame animation.
        [
            [
                "   ###   ",
                "  #####  ",
                " ####### ",
                "## ### ##",
                "#########",
                "#  # #  #",
                " #     # ",
                "##     ##",
            ],
            [
                "   ###   ",
                "  #####  ",
                " ####### ",
                "## ### ##",
                "#########",
                " #  #  # ",
                "##  #  ##",
                " #     # ",
            ],
        ],
        // Variant with wider stance.
        [
            [
                "  #####  ",
                " ####### ",
                "#########",
                "### ### #",
                "#########",
                "#  ###  #",
                "   # #   ",
                "  ## ##  ",
            ],
            [
                "  #####  ",
                " ####### ",
                "#########",
                "### ### #",
                "#########",
                " # ### # ",
                "  #   #  ",
                " ##   ## ",
            ],
        ],
        // Small invader.
        [
            [
                "  ###  ",
                " ##### ",
                "#######",
                "## # ##",
                "#######",
                "  # #  ",
                " #   # ",
                "##   ##",
            ],
            [
                "  ###  ",
                " ##### ",
                "#######",
                "## # ##",
                "#######",
                " # # # ",
                "  # #  ",
                " ## ## ",
            ],
        ],
    ];
    Enemy.colors = [
        "#8fffcf",
        "#ffd166",
        "#ff6b6b", // high
    ];
    return Enemy;
}());
exports.Enemy = Enemy;


/***/ }),

/***/ 769:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Game = void 0;
var tools_1 = __webpack_require__(594);
var shields_1 = __webpack_require__(799);
var powerUps_1 = __webpack_require__(306);
var Game = /** @class */ (function () {
    function Game(services) {
        if (services === void 0) { services = tools_1.services; }
        this.services = services;
        this.shields = new shields_1.ShieldManager();
        this.powerUps = new powerUps_1.PowerUpManager();
        this.level = 1;
        this.score = 0;
        this.life = 3;
    }
    Game.prototype.showMessage = function (messageContent) {
        var _this = this;
        this._paused = true;
        this.services.printMessage(messageContent);
        if (messageContent != "Pause") {
            setTimeout(function () {
                _this._paused = false;
                _this.redraw();
            }, 3000);
        }
    };
    Game.prototype.reload = function () {
        setTimeout(function () {
            window.location.reload();
        }, 3000);
    };
    Game.prototype.pause = function (pause) {
        if (pause) {
            this.services.playPauseSound();
            this.showMessage("Pause");
        }
        this._paused = pause;
        if (!pause) {
            this.redraw();
        }
    };
    Object.defineProperty(Game.prototype, "paused", {
        get: function () {
            return this._paused;
        },
        set: function (paused) {
            this._paused = paused;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "enemies", {
        get: function () {
            return this._enemies;
        },
        set: function (enemies) {
            this._enemies = enemies;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "nave", {
        get: function () {
            return this._nave;
        },
        set: function (nave) {
            this._nave = nave;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "level", {
        get: function () {
            return this._level;
        },
        set: function (level) {
            this._level = level;
            this.setLabel('level', String(level));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "life", {
        get: function () {
            return this._life;
        },
        set: function (life) {
            this._life = life;
            this.setLabel('life', String(life));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "score", {
        get: function () {
            return this._score;
        },
        set: function (score) {
            this._score = score;
            this.setLabel('score', String(score));
        },
        enumerable: false,
        configurable: true
    });
    Game.prototype.setLabel = function (_id, _textContent) {
        this.services.drawHud(this._level, this._score, this._life);
    };
    Game.prototype.update = function (deltaSeconds) {
        if (this._paused)
            return;
        if (this._enemies) {
            this._enemies.update(deltaSeconds);
        }
        if (this._nave) {
            this._nave.tick(deltaSeconds);
        }
        this.powerUps.update(deltaSeconds, this._nave);
    };
    Object.defineProperty(Game.prototype, "mouseX", {
        get: function () {
            return this._mouseX;
        },
        set: function (value) {
            this._mouseX = value;
        },
        enumerable: false,
        configurable: true
    });
    Game.prototype.redraw = function () {
        this.services.clearAll();
        this.services.drawHud(this._level, this._score, this._life);
        this.powerUps.clear();
        this.shields.draw();
        if (this._enemies) {
            this._enemies.paint();
        }
        if (this._nave) {
            this._nave.paint();
        }
    };
    return Game;
}());
exports.Game = Game;
;


/***/ }),

/***/ 137:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GameLoop = void 0;
var GameLoop = /** @class */ (function () {
    function GameLoop() {
        this.callback = null;
    }
    GameLoop.prototype.start = function (callback) {
        this.callback = callback;
        this.lastTime = undefined;
        this.tick(performance.now());
    };
    GameLoop.prototype.stop = function () {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = undefined;
        }
        this.callback = null;
        this.lastTime = undefined;
    };
    GameLoop.prototype.tick = function (time) {
        var _this = this;
        if (!this.callback)
            return;
        if (this.lastTime === undefined) {
            this.lastTime = time;
        }
        var dt = (time - this.lastTime) / 1000;
        this.lastTime = time;
        this.callback(dt);
        this.rafId = requestAnimationFrame(function (t) { return _this.tick(t); });
    };
    return GameLoop;
}());
exports.GameLoop = GameLoop;


/***/ }),

/***/ 639:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CanvasCleaner = void 0;
var config_1 = __webpack_require__(913);
var CanvasCleaner = /** @class */ (function () {
    function CanvasCleaner(hudHeight) {
        this.hudHeight = hudHeight;
    }
    CanvasCleaner.prototype.clearAll = function () {
        config_1.Config.context.clearRect(0, 0, config_1.Config.canvas.width, config_1.Config.canvas.height);
        config_1.Config.projectileContext.clearRect(0, 0, config_1.Config.projectileCanvas.width, config_1.Config.projectileCanvas.height);
    };
    CanvasCleaner.prototype.clearEnemiesArea = function () {
        config_1.Config.context.clearRect(0, this.hudHeight, config_1.Config.canvas.width, config_1.Config.canvas.height - this.hudHeight - (config_1.Config.naveHeight + 9));
    };
    return CanvasCleaner;
}());
exports.CanvasCleaner = CanvasCleaner;


/***/ }),

/***/ 814:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ExplosionRenderer = void 0;
var config_1 = __webpack_require__(913);
var ExplosionRenderer = /** @class */ (function () {
    function ExplosionRenderer() {
        this.time = 0;
        this.duration = 0.5;
        this.origin = null;
        this.palette = ["#ffffff", "#ffb300", "#ff4000"];
    }
    ExplosionRenderer.prototype.trigger = function (x, y, radius, color) {
        var _this = this;
        if (radius === void 0) { radius = 30; }
        this.origin = { x: x, y: y };
        this.time = 0;
        this.palette = color ? this.makePalette(color) : this.palette;
        if (!this.frame) {
            this.frame = requestAnimationFrame(function (ts) { return _this.update(ts, radius); });
        }
    };
    ExplosionRenderer.prototype.clear = function () {
        this.frame = undefined;
        this.origin = null;
    };
    ExplosionRenderer.prototype.update = function (_timestamp, radius) {
        var _this = this;
        var ctx = config_1.Config.context;
        var step = 16; // approx 60fps
        var delta = step / 1000;
        this.time += delta;
        if (this.origin) {
            var progress = Math.min(this.time / this.duration, 1);
            var alpha_1 = 1 - progress;
            var r = radius * (0.5 + 0.8 * progress);
            var colors = this.palette.map(function (c) { return _this.applyAlpha(c, alpha_1); });
            var pixel = Math.max(2, radius * 0.08);
            ctx.save();
            ctx.globalCompositeOperation = "source-over";
            for (var i = 0; i < 30; i++) {
                var angle = Math.random() * Math.PI * 2;
                var dist = Math.random() * r;
                var px = this.origin.x + Math.cos(angle) * dist;
                var py = this.origin.y + Math.sin(angle) * dist;
                ctx.fillStyle = colors[i % colors.length];
                ctx.fillRect(px, py, pixel, pixel);
            }
            ctx.restore();
        }
        if (this.time < this.duration) {
            this.frame = requestAnimationFrame(function (ts) { return _this.update(ts, radius); });
        }
        else {
            this.frame = undefined;
            this.origin = null;
        }
    };
    ExplosionRenderer.prototype.makePalette = function (color) {
        return [color, this.tint(color, 1.2), this.tint(color, 0.8)];
    };
    ExplosionRenderer.prototype.tint = function (hex, factor) {
        var m = hex.match(/^#?([0-9a-fA-F]{6})$/);
        if (!m)
            return hex;
        var num = parseInt(m[1], 16);
        var r = Math.min(255, Math.max(0, Math.round(((num >> 16) & 0xff) * factor)));
        var g = Math.min(255, Math.max(0, Math.round(((num >> 8) & 0xff) * factor)));
        var b = Math.min(255, Math.max(0, Math.round((num & 0xff) * factor)));
        return "#".concat(((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1));
    };
    ExplosionRenderer.prototype.applyAlpha = function (hex, alpha) {
        var m = hex.match(/^#?([0-9a-fA-F]{6})$/);
        if (!m)
            return hex;
        var num = parseInt(m[1], 16);
        var r = (num >> 16) & 0xff;
        var g = (num >> 8) & 0xff;
        var b = num & 0xff;
        return "rgba(".concat(r, ",").concat(g, ",").concat(b, ",").concat(alpha, ")");
    };
    return ExplosionRenderer;
}());
exports.ExplosionRenderer = ExplosionRenderer;


/***/ }),

/***/ 688:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HudRenderer = void 0;
var config_1 = __webpack_require__(913);
var HudRenderer = /** @class */ (function () {
    function HudRenderer() {
        this.height = 28;
    }
    HudRenderer.prototype.draw = function (level, score, lives) {
        var ctx = config_1.Config.context;
        var h = this.height;
        ctx.clearRect(0, 0, config_1.Config.canvas.width, h);
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, config_1.Config.canvas.width, h);
        var fontSize = Math.max(10, Math.round(config_1.Config.canvas.width / 38));
        ctx.font = "".concat(fontSize, "px Courier New");
        ctx.fillStyle = "#9fe29f";
        ctx.textBaseline = "middle";
        ctx.fillText("LVL", 10, h / 2);
        ctx.fillStyle = "#fff";
        ctx.fillText(String(level), 40, h / 2);
        ctx.fillStyle = "#9fe29f";
        ctx.fillText("SCORE", 80, h / 2);
        ctx.fillStyle = "#fff";
        ctx.fillText(String(score), 140, h / 2);
        ctx.fillStyle = "#9fe29f";
        ctx.fillText("LIVES", 200, h / 2);
        for (var i = 0; i < lives; i++) {
            ctx.fillStyle = "#ff4d4d";
            var size = 8;
            var x = 250 + i * (size + 6);
            ctx.fillRect(x, h / 2 - size / 2, size, size);
        }
        ctx.fillStyle = "#cfcfcf";
        var pauseText = "Press P to pause";
        var textWidth = ctx.measureText(pauseText).width;
        ctx.fillText(pauseText, config_1.Config.canvas.width - textWidth - 10, h / 2);
    };
    return HudRenderer;
}());
exports.HudRenderer = HudRenderer;


/***/ }),

/***/ 75:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProjectileManager = void 0;
var config_1 = __webpack_require__(913);
var ProjectileManager = /** @class */ (function () {
    function ProjectileManager() {
        this.projectiles = [];
    }
    ProjectileManager.prototype.add = function (projectile) {
        var _this = this;
        this.projectiles.push(projectile);
        if (!this.frame) {
            this.lastTimestamp = undefined;
            this.frame = requestAnimationFrame(function (ts) { return _this.update(ts); });
        }
    };
    ProjectileManager.prototype.count = function (owner) {
        return this.projectiles.filter(function (p) { return p.owner === owner; }).length;
    };
    ProjectileManager.prototype.forEach = function (fn) {
        this.projectiles = this.projectiles.filter(function (p) {
            var keep = fn(p);
            return keep !== false;
        });
    };
    ProjectileManager.prototype.clear = function () {
        this.projectiles = [];
        if (this.frame) {
            cancelAnimationFrame(this.frame);
            this.frame = undefined;
        }
        config_1.Config.projectileContext.clearRect(0, 0, config_1.Config.projectileCanvas.width, config_1.Config.projectileCanvas.height);
    };
    ProjectileManager.prototype.update = function (timestamp) {
        var _this = this;
        if (this.lastTimestamp === undefined) {
            this.lastTimestamp = timestamp;
            this.frame = requestAnimationFrame(function (ts) { return _this.update(ts); });
            return;
        }
        var deltaSeconds = (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;
        var ctx = config_1.Config.projectileContext;
        ctx.clearRect(0, 0, config_1.Config.canvas.width, config_1.Config.canvas.height);
        var alive = [];
        for (var _i = 0, _a = this.projectiles; _i < _a.length; _i++) {
            var p = _a[_i];
            p.x += p.vx * deltaSeconds;
            p.y += p.vy * deltaSeconds;
            var keep = p.y + p.height >= 0 && p.y <= config_1.Config.canvas.height;
            if (keep && p.onStep) {
                keep = p.onStep(p) !== false;
            }
            if (keep) {
                alive.push(p);
                ctx.save();
                ctx.shadowBlur = 8;
                ctx.shadowColor = p.color;
                ctx.fillStyle = p.color;
                var grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
                grad.addColorStop(0, p.color);
                grad.addColorStop(1, "white");
                ctx.fillStyle = grad;
                ctx.fillRect(p.x, p.y, p.width, p.height);
                ctx.restore();
            }
        }
        this.projectiles = alive;
        if (this.projectiles.length > 0) {
            this.frame = requestAnimationFrame(function (ts) { return _this.update(ts); });
        }
        else {
            this.frame = undefined;
        }
    };
    return ProjectileManager;
}());
exports.ProjectileManager = ProjectileManager;


/***/ }),

/***/ 544:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SoundManager = void 0;
var howler_1 = __webpack_require__(766);
var SoundManager = /** @class */ (function () {
    function SoundManager() {
        this.currentTheme = null;
        this.unlocked = false;
        this.suspendedFallbackSet = false;
        this.pendingIntro = false;
    }
    SoundManager.prototype.ensureContext = function () {
        if (!this.unlocked)
            return;
        var ctx = howler_1.Howler.ctx;
        if (!ctx)
            return;
        if (!this.master) {
            this.master = ctx.createGain();
            this.master.gain.value = 0.35;
            this.master.connect(ctx.destination);
        }
    };
    SoundManager.prototype.resumeIfNeeded = function () {
        var ctx = howler_1.Howler.ctx;
        if (ctx && ctx.state === "suspended") {
            ctx.resume();
        }
    };
    SoundManager.prototype.unlock = function () {
        var _this = this;
        this.unlocked = true;
        this.ensureContext();
        var ctx = howler_1.Howler.ctx;
        if (ctx) {
            ctx.resume().catch(function () {
                // Some browsers need a user gesture; rely on the fallback listeners.
                if (!_this.suspendedFallbackSet) {
                    _this.suspendedFallbackSet = true;
                    var resume_1 = function () {
                        var _a;
                        (_a = howler_1.Howler.ctx) === null || _a === void 0 ? void 0 : _a.resume();
                        window.removeEventListener("pointerdown", resume_1);
                        window.removeEventListener("touchstart", resume_1);
                        window.removeEventListener("keydown", resume_1);
                    };
                    window.addEventListener("pointerdown", resume_1, { once: true, passive: true });
                    window.addEventListener("touchstart", resume_1, { once: true, passive: true });
                    window.addEventListener("keydown", resume_1, { once: true });
                }
            });
        }
        if (this.pendingIntro) {
            this.pendingIntro = false;
            this.startIntroTheme();
        }
    };
    SoundManager.prototype.playShoot = function (owner) {
        this.ensureContext();
        this.resumeIfNeeded();
        var freq = owner === "player" ? 720 : 500;
        var duration = 0.05;
        this.boop(freq, duration, "square", owner === "player" ? 0.2 : 0.16, 0.0015);
        this.boop(freq * 0.55, duration * 0.8, "triangle", 0.09, 0.004);
    };
    SoundManager.prototype.playExplosion = function () {
        this.ensureContext();
        this.resumeIfNeeded();
        this.boop(140, 0.28, "sawtooth", 0.4, 0.006);
    };
    SoundManager.prototype.playEnemyDestroyed = function () {
        this.ensureContext();
        this.resumeIfNeeded();
        this.boop(520, 0.1, "triangle", 0.18, 0.002);
        this.boop(392, 0.12, "square", 0.14, 0.002);
    };
    SoundManager.prototype.playPlayerDestroyed = function () {
        this.ensureContext();
        this.resumeIfNeeded();
        this.boop(160, 0.4, "sawtooth", 0.45, 0.01);
        this.boop(90, 0.45, "triangle", 0.25, 0);
    };
    SoundManager.prototype.playPause = function () {
        this.ensureContext();
        this.resumeIfNeeded();
        this.boop(440, 0.08, "sine", 0.15, 0);
    };
    SoundManager.prototype.startIntroTheme = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.ensureContext();
                this.resumeIfNeeded();
                if (!this.unlocked) {
                    this.pendingIntro = true;
                    return [2 /*return*/];
                }
                if (this.currentTheme === "intro")
                    return [2 /*return*/];
                this.stopMusic();
                this.currentTheme = "intro";
                try {
                    if (!this.introHowl) {
                        this.introHowl = new howler_1.Howl({
                            src: ["/assets/music.mp3"],
                            loop: true,
                            volume: 0.35,
                            html5: false,
                            onloaderror: function (_id, err) {
                                console.warn("Falling back to synth theme:", err);
                                _this.playSynthIntro();
                            },
                        });
                    }
                    this.introHowl.stop();
                    this.introHowl.play();
                    return [2 /*return*/];
                }
                catch (e) {
                    console.warn("Falling back to synth theme:", e);
                }
                this.playSynthIntro();
                return [2 /*return*/];
            });
        });
    };
    SoundManager.prototype.playSynthIntro = function () {
        var _this = this;
        this.stopMusic();
        var bpm = 92;
        var beatMs = 60000 / bpm;
        // Original multi-voice piece inspired by Baroque counterpoint (no external melody used).
        var soprano = [
            { f: 392.0, beats: 1 }, { f: 440.0, beats: 1 }, { f: 494.0, beats: 1 }, { f: 523.3, beats: 1 },
            { f: 587.3, beats: 1 }, { f: 659.3, beats: 1 }, { f: 587.3, beats: 1 }, { f: 523.3, beats: 1 },
            { f: 494.0, beats: 2 },
            { f: 523.3, beats: 1 }, { f: 587.3, beats: 1 }, { f: 659.3, beats: 1 }, { f: 698.5, beats: 1 },
            { f: 740.0, beats: 1 }, { f: 659.3, beats: 1 }, { f: 587.3, beats: 1 }, { f: 523.3, beats: 1 },
            { f: 494.0, beats: 2 },
            { f: 440.0, beats: 1 }, { f: 494.0, beats: 1 }, { f: 523.3, beats: 1 }, { f: 587.3, beats: 1 },
            { f: 659.3, beats: 1 }, { f: 698.5, beats: 1 }, { f: 659.3, beats: 1 }, { f: 587.3, beats: 1 },
            { f: 523.3, beats: 2 },
            { f: 494.0, beats: 1 }, { f: 523.3, beats: 1 }, { f: 587.3, beats: 1 }, { f: 659.3, beats: 1 },
            { f: 587.3, beats: 1 }, { f: 523.3, beats: 1 }, { f: 494.0, beats: 1 }, { f: 440.0, beats: 1 },
            { f: 392.0, beats: 2 },
        ];
        var alto = [
            { f: 261.6, beats: 2 }, { f: 293.7, beats: 2 }, { f: 329.6, beats: 2 }, { f: 349.2, beats: 2 },
            { f: 392.0, beats: 2 }, { f: 440.0, beats: 2 }, { f: 392.0, beats: 2 }, { f: 349.2, beats: 2 },
            { f: 329.6, beats: 2 }, { f: 293.7, beats: 2 }, { f: 261.6, beats: 2 }, { f: 246.9, beats: 2 },
            { f: 261.6, beats: 2 }, { f: 293.7, beats: 2 }, { f: 329.6, beats: 2 }, { f: 349.2, beats: 2 },
            { f: 392.0, beats: 2 }, { f: 349.2, beats: 2 }, { f: 329.6, beats: 2 }, { f: 293.7, beats: 2 },
        ];
        var bass = [
            { f: 130.8, beats: 2 }, { f: 146.8, beats: 2 }, { f: 164.8, beats: 2 }, { f: 174.6, beats: 2 },
            { f: 196.0, beats: 2 }, { f: 174.6, beats: 2 }, { f: 164.8, beats: 2 }, { f: 146.8, beats: 2 },
            { f: 130.8, beats: 2 }, { f: 123.5, beats: 2 }, { f: 110.0, beats: 2 }, { f: 98.0, beats: 2 },
            { f: 110.0, beats: 2 }, { f: 123.5, beats: 2 }, { f: 130.8, beats: 2 }, { f: 146.8, beats: 2 },
            { f: 164.8, beats: 2 }, { f: 146.8, beats: 2 }, { f: 130.8, beats: 2 }, { f: 110.0, beats: 2 },
        ];
        var progression = [
            [
                [392.0, 494.0, 587.3],
                [293.7, 369.9, 440.0],
                [329.6, 392.0, 493.9],
                [261.6, 329.6, 392.0], // C
            ],
            [
                [293.7, 349.2, 440.0],
                [329.6, 415.3, 493.9],
                [220.0, 261.6, 329.6],
                [293.7, 369.9, 440.0], // D
            ],
            [
                [261.6, 329.6, 415.3],
                [246.9, 311.1, 392.0],
                [293.7, 349.2, 440.0],
                [329.6, 392.0, 493.9], // Em
            ],
        ];
        var sopIdx = 0;
        var altoIdx = 0;
        var bassIdx = 0;
        var chordIdx = 0;
        var blockIdx = 0;
        var playVoice = function (note, vol, type, detune) {
            if (detune === void 0) { detune = 0; }
            var ctx = howler_1.Howler.ctx;
            if (!ctx || !_this.master)
                return;
            var osc = ctx.createOscillator();
            osc.type = type;
            osc.frequency.value = note.f;
            osc.detune.value = detune;
            var gain = ctx.createGain();
            var now = ctx.currentTime;
            var durSec = (note.beats * beatMs) / 1000;
            gain.gain.setValueAtTime(vol, now);
            gain.gain.linearRampToValueAtTime(vol * 0.65, now + durSec * 0.6);
            gain.gain.linearRampToValueAtTime(0.0001, now + durSec);
            osc.connect(gain);
            gain.connect(_this.master);
            osc.start();
            osc.stop(now + durSec + 0.05);
        };
        this.musicTimer = window.setInterval(function () {
            playVoice(soprano[sopIdx % soprano.length], 0.18, "triangle");
            playVoice(soprano[sopIdx % soprano.length], 0.06, "sawtooth", 6); // light shimmer
            if (sopIdx % 2 === 0) {
                playVoice(alto[altoIdx % alto.length], 0.12, "sine");
                playVoice(bass[bassIdx % bass.length], 0.1, "sawtooth");
                altoIdx++;
                bassIdx++;
            }
            if (sopIdx % 4 === 0) {
                var block = progression[blockIdx % progression.length];
                var chord = block[chordIdx % block.length];
                chord.forEach(function (f, i) {
                    return playVoice({ f: f, beats: 2 }, 0.07 - i * 0.01, "triangle", i === 0 ? -4 : i === 2 ? 4 : 0);
                });
                chordIdx++;
                if (chordIdx % block.length === 0) {
                    blockIdx++;
                }
            }
            sopIdx++;
        }, beatMs);
    };
    SoundManager.prototype.startGameOverTheme = function () {
        var _this = this;
        this.ensureContext();
        this.resumeIfNeeded();
        if (!this.unlocked)
            return;
        if (this.currentTheme === "gameover")
            return;
        this.stopMusic();
        this.currentTheme = "gameover";
        var bpm = 72;
        var beatMs = 60000 / bpm;
        var motif = [
            { f: 262, beats: 1 }, { f: 247, beats: 1 }, { f: 233, beats: 1 }, { f: 220, beats: 2 },
            { f: 196, beats: 1 }, { f: 174, beats: 1 }, { f: 165, beats: 1 }, { f: 147, beats: 2 },
        ];
        var idx = 0;
        var playNote = function (note, vol, type) {
            var ctx = howler_1.Howler.ctx;
            if (!ctx || !_this.master)
                return;
            var osc = ctx.createOscillator();
            osc.type = type;
            osc.frequency.value = note.f;
            var gain = ctx.createGain();
            gain.gain.value = vol;
            var now = ctx.currentTime;
            gain.gain.setValueAtTime(vol, now);
            gain.gain.linearRampToValueAtTime(0.0001, now + (note.beats * beatMs) / 1000);
            osc.connect(gain);
            gain.connect(_this.master);
            osc.start();
            osc.stop(now + (note.beats * beatMs) / 1000);
        };
        this.musicTimer = window.setInterval(function () {
            playNote(motif[idx % motif.length], 0.12, "sine");
            idx++;
        }, beatMs);
    };
    SoundManager.prototype.stopMusic = function () {
        if (this.musicTimer !== undefined) {
            clearInterval(this.musicTimer);
            this.musicTimer = undefined;
        }
        if (this.introHowl) {
            this.introHowl.stop();
        }
        this.currentTheme = null;
        // Passive one-shots auto-stop; nothing persistent to clear beyond timer.
    };
    SoundManager.prototype.boop = function (freq, duration, type, volume, glide) {
        if (glide === void 0) { glide = 0; }
        var ctx = howler_1.Howler.ctx;
        if (!ctx || !this.master)
            return;
        var osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = freq;
        if (glide > 0) {
            osc.frequency.linearRampToValueAtTime(freq * 0.92, ctx.currentTime + glide);
        }
        var gain = ctx.createGain();
        gain.gain.value = volume;
        var decay = 0.12;
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration + decay);
        osc.connect(gain);
        gain.connect(this.master);
        osc.start();
        osc.stop(ctx.currentTime + duration + decay);
    };
    return SoundManager;
}());
exports.SoundManager = SoundManager;


/***/ }),

/***/ 861:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Nave = void 0;
var colision_1 = __webpack_require__(124);
var config_1 = __webpack_require__(913);
var tools_1 = __webpack_require__(594);
var Nave = /** @class */ (function () {
    function Nave(game, services) {
        if (services === void 0) { services = tools_1.services; }
        var _this = this;
        this.flashesRemaining = 0;
        this.invulnerableUntil = 0;
        this.fireIntervalMs = 180;
        this.maxShots = config_1.Config.naveMaxshots;
        this.boostTime = 0;
        this.services = services;
        this.shots = config_1.Config.naveShots;
        this.x = 0;
        this.prevX = this.x;
        this.lastDrawX = this.x;
        this.lastDrawY = config_1.Config.canvas.height - config_1.Config.naveHeight;
        this.life = config_1.Config.naveLife;
        this.y = this.lastDrawY;
        this.game = game;
        this.paint();
        window.onkeydown = function (event) { _this.move(event); };
        window.onmousedown = function () { _this.startAutoFire(); };
        window.onmouseup = function () { _this.stopAutoFire(); };
        window.onmouseleave = function () { _this.stopAutoFire(); };
        window.onmouseout = function () { _this.stopAutoFire(); };
        window.onmousemove = function (event) { _this.move(event); };
        window.addEventListener("touchstart", function (event) {
            var _a;
            event.preventDefault();
            var x = (_a = event.touches[0]) === null || _a === void 0 ? void 0 : _a.clientX;
            if (x !== undefined) {
                _this.handleTouchMovement(x);
            }
            _this.startAutoFire();
        }, { passive: false });
        window.addEventListener("touchmove", function (event) {
            var _a;
            event.preventDefault();
            var x = (_a = event.touches[0]) === null || _a === void 0 ? void 0 : _a.clientX;
            if (x !== undefined) {
                _this.handleTouchMovement(x);
            }
        }, { passive: false });
        window.addEventListener("touchend", function () { _this.stopAutoFire(); }, { passive: true });
        window.addEventListener("touchcancel", function () { _this.stopAutoFire(); }, { passive: true });
    }
    Nave.prototype.startAutoFire = function () {
        var _this = this;
        this.fire();
        if (this.fireIntervalId !== undefined)
            return;
        this.fireIntervalId = window.setInterval(function () { return _this.fire(); }, this.fireIntervalMs);
    };
    Nave.prototype.stopAutoFire = function () {
        if (this.fireIntervalId !== undefined) {
            clearInterval(this.fireIntervalId);
            this.fireIntervalId = undefined;
        }
    };
    Nave.prototype.fire = function () {
        this.updateBoost(0);
        if (!this.game.paused) {
            this.shots = this.services.countProjectiles('player');
            if (this.shots < this.maxShots) {
                this.shots++;
                var width = 3;
                var height = 12;
                var startX = this.x + (config_1.Config.naveWidth - width) / 2;
                var startY = this.y - height;
                this.services.playShoot("player");
                this.directionFire(startX, startY, width, height);
            }
        }
    };
    Nave.prototype.directionFire = function (x, y, width, height) {
        var _this = this;
        var speed = -500; // px/s upward
        this.services.addProjectile({
            x: x,
            y: y,
            vx: 0,
            vy: speed,
            width: width,
            height: height,
            color: "#7fff00",
            owner: "player",
            onStep: function (p) {
                var enemyIndex = colision_1.Colision.checkColision(p.x, p.y, width, height, _this.game.enemies.items);
                if (enemyIndex !== -1) {
                    var enemy = _this.game.enemies.items[enemyIndex];
                    if (enemy) {
                        _this.services.explode(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, undefined, enemy.getColor());
                    }
                    _this.game.enemies.remove(enemyIndex, true);
                    _this.game.enemies.paint();
                    _this.shots = Math.max(0, _this.shots - 1);
                    return false;
                }
                if (p.y + height < 0) {
                    _this.shots = Math.max(0, _this.shots - 1);
                    return false;
                }
                return true;
            }
        });
    };
    Nave.prototype.paint = function () {
        var ctx = config_1.Config.context;
        var bandMargin = 8;
        // Wipe a horizontal band where the nave moves to guarantee no trails.
        ctx.clearRect(0, this.y - bandMargin, config_1.Config.canvas.width, config_1.Config.naveHeight + bandMargin * 2 + 4);
        // Also clear the same band on the projectile layer in case a stale pixel landed there.
        config_1.Config.projectileContext.clearRect(0, this.y - bandMargin, config_1.Config.canvas.width, config_1.Config.naveHeight + bandMargin * 2 + 4);
        this.lastDrawX = this.x;
        this.lastDrawY = this.y;
        var alpha = this.isInvulnerable() ? 0.4 : 1;
        config_1.Config.context.save();
        config_1.Config.context.globalAlpha = alpha;
        this.services.paintNave(this.x, this.y);
        config_1.Config.context.restore();
    };
    Nave.prototype.moveLeft = function (step) {
        this.prevX = this.x;
        this.x -= config_1.Config.naveWidth / step;
        if (this.x <= 0)
            this.x = 0;
        this.paint();
    };
    Nave.prototype.moveRight = function (step) {
        this.prevX = this.x;
        this.x += config_1.Config.naveWidth / step;
        if (this.x + config_1.Config.naveWidth >= config_1.Config.canvas.width)
            this.x = config_1.Config.canvas.width - config_1.Config.naveWidth;
        this.paint();
    };
    Nave.prototype.move = function (event) {
        if (this.isPauseEvent(event)) {
            this.game.pause(!this.game.paused);
        }
        else if (!this.game.paused) {
            this.updateBoost(0);
            if (event instanceof MouseEvent) {
                this.handleMouseMovement(event);
            }
            else if (event instanceof KeyboardEvent) {
                this.handleKeyboardMovement(event);
            }
        }
    };
    Nave.prototype.flashHit = function () {
        var _this = this;
        this.invulnerableUntil = performance.now() + 2000;
        this.flashesRemaining = 6;
        var blink = function () {
            if (_this.flashesRemaining <= 0) {
                _this.flashTimeout = undefined;
                _this.paint();
                return;
            }
            var hitFrame = _this.flashesRemaining % 2 === 0;
            _this.services.paintNave(_this.x, _this.y, hitFrame ? "#ff4d4d" : "#7fff00");
            _this.flashesRemaining--;
            _this.flashTimeout = window.setTimeout(blink, 80);
        };
        if (this.flashTimeout) {
            clearTimeout(this.flashTimeout);
        }
        blink();
    };
    Nave.prototype.isPauseEvent = function (event) {
        return event instanceof KeyboardEvent && event.code == 'KeyP';
    };
    Nave.prototype.handleMouseMovement = function (event) {
        var mouseXaux = event.clientX;
        this.prevX = this.x;
        if (this.game.mouseX > mouseXaux) {
            this.moveLeft(5);
        }
        else if (this.game.mouseX < mouseXaux) {
            this.moveRight(5);
        }
        this.game.mouseX = mouseXaux;
    };
    Nave.prototype.handleTouchMovement = function (clientX) {
        var rect = config_1.Config.canvas.getBoundingClientRect();
        var relativeX = ((clientX - rect.left) / rect.width) * config_1.Config.canvas.width - config_1.Config.naveWidth / 2;
        this.prevX = this.x;
        this.x = Math.max(0, Math.min(config_1.Config.canvas.width - config_1.Config.naveWidth, relativeX));
        this.game.mouseX = clientX;
        this.paint();
    };
    Nave.prototype.handleKeyboardMovement = function (event) {
        if (event.code === 'ArrowLeft') {
            this.moveLeft(2);
        }
        else if (event.code === 'ArrowRight') {
            this.moveRight(2);
        }
        else if (event.code === 'ControlLeft' || event.code === 'Space') {
            this.fire();
        }
    };
    Object.defineProperty(Nave.prototype, "velocityX", {
        get: function () {
            return this.x - this.prevX;
        },
        enumerable: false,
        configurable: true
    });
    Nave.prototype.isInvulnerable = function () {
        return performance.now() < this.invulnerableUntil;
    };
    Nave.prototype.applyFireBoost = function (durationSeconds) {
        var _this = this;
        if (durationSeconds === void 0) { durationSeconds = 8; }
        this.boostTime = Math.max(this.boostTime, durationSeconds);
        this.fireIntervalMs = 120;
        this.maxShots = config_1.Config.naveMaxshots + 2;
        if (this.fireIntervalId !== undefined) {
            clearInterval(this.fireIntervalId);
            this.fireIntervalId = window.setInterval(function () { return _this.fire(); }, this.fireIntervalMs);
        }
    };
    Nave.prototype.tick = function (deltaSeconds) {
        this.updateBoost(deltaSeconds);
    };
    Nave.prototype.updateBoost = function (deltaSeconds) {
        var _this = this;
        if (this.boostTime <= 0)
            return;
        this.boostTime -= deltaSeconds;
        if (this.boostTime <= 0) {
            this.fireIntervalMs = 180;
            this.maxShots = config_1.Config.naveMaxshots;
            this.boostTime = 0;
            if (this.fireIntervalId !== undefined) {
                clearInterval(this.fireIntervalId);
                this.fireIntervalId = window.setInterval(function () { return _this.fire(); }, this.fireIntervalMs);
            }
        }
    };
    return Nave;
}());
exports.Nave = Nave;
;


/***/ }),

/***/ 306:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PowerUpManager = void 0;
var config_1 = __webpack_require__(913);
var PowerUpManager = /** @class */ (function () {
    function PowerUpManager() {
        this.drop = null;
        this.chance = 0.2;
    }
    PowerUpManager.prototype.maybeSpawn = function (x, y) {
        if (this.drop)
            return;
        if (Math.random() > this.chance)
            return;
        var size = Math.max(12, Math.round(config_1.Config.naveHeight * 0.9));
        this.drop = {
            x: x - size / 2,
            y: y - size / 2,
            vy: config_1.Config.canvas.height * 0.3,
            size: size,
            alpha: 0.9,
            hue: 45 + Math.random() * 60,
            lastX: x,
            lastY: y,
        };
    };
    PowerUpManager.prototype.update = function (deltaSeconds, nave) {
        if (!this.drop)
            return;
        var d = this.drop;
        var ctx = config_1.Config.projectileContext;
        var pad = 4;
        ctx.clearRect(d.lastX - pad, d.lastY - pad, d.size + pad * 2, d.size + pad * 2);
        d.y += d.vy * deltaSeconds;
        d.lastX = d.x;
        d.lastY = d.y;
        if (this.intersectsNave(d, nave)) {
            nave.applyFireBoost();
            this.drop = null;
            return;
        }
        if (d.y > config_1.Config.canvas.height + d.size) {
            this.drop = null;
            return;
        }
        var grad = ctx.createRadialGradient(d.x + d.size / 2, d.y + d.size / 2, d.size * 0.2, d.x + d.size / 2, d.y + d.size / 2, d.size * 0.6);
        grad.addColorStop(0, "hsla(".concat(d.hue, ", 90%, 70%, ").concat(d.alpha, ")"));
        grad.addColorStop(1, "hsla(".concat(d.hue + 40, ", 90%, 55%, ").concat(d.alpha * 0.6, ")"));
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = grad;
        ctx.strokeStyle = "hsla(".concat(d.hue, ", 90%, 70%, ").concat(d.alpha, ")");
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(d.x, d.y, d.size, d.size, d.size * 0.2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    };
    PowerUpManager.prototype.clear = function () {
        if (!this.drop)
            return;
        var pad = 4;
        config_1.Config.projectileContext.clearRect(this.drop.x - pad, this.drop.y - pad, this.drop.size + pad * 2, this.drop.size + pad * 2);
        this.drop = null;
    };
    PowerUpManager.prototype.intersectsNave = function (drop, nave) {
        return (drop.x < nave.x + config_1.Config.naveWidth &&
            drop.x + drop.size > nave.x &&
            drop.y < nave.y + config_1.Config.naveHeight &&
            drop.y + drop.size > nave.y);
    };
    return PowerUpManager;
}());
exports.PowerUpManager = PowerUpManager;


/***/ }),

/***/ 799:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShieldManager = void 0;
var config_1 = __webpack_require__(913);
var Shield = /** @class */ (function () {
    function Shield(x, y) {
        this.x = x;
        this.y = y;
        this.cells = [];
        var pattern = [
            "   #########   ",
            "  ###########  ",
            " ############# ",
            " ############# ",
            " ###       ### ",
            " ###       ### ",
            " ###       ### ",
            " ###       ### ",
        ];
        var cols = pattern[0].length;
        var rows = pattern.length;
        this.patternWidth = cols;
        this.patternHeight = rows;
        // Keep shields compact: total width ~ 3x nave width.
        // Make shield pixels comparable to enemy/nave pixels.
        var pixel = Math.max(3, Math.round(config_1.Config.enemyWidth / 6));
        this.cellWidth = pixel;
        this.cellHeight = pixel;
        for (var row = 0; row < rows; row++) {
            for (var col = 0; col < cols; col++) {
                if (pattern[row][col] !== " ") {
                    this.cells.push({
                        x: this.x + col * this.cellWidth,
                        y: this.y + row * this.cellHeight,
                        alive: true,
                    });
                }
            }
        }
    }
    Shield.prototype.draw = function (ctx) {
        ctx.fillStyle = "#7fff00";
        for (var _i = 0, _a = this.cells; _i < _a.length; _i++) {
            var cell = _a[_i];
            if (cell.alive) {
                ctx.fillRect(cell.x, cell.y, this.cellWidth, this.cellHeight);
            }
        }
    };
    Shield.prototype.intersects = function (px, py, pw, ph) {
        for (var _i = 0, _a = this.cells; _i < _a.length; _i++) {
            var cell = _a[_i];
            if (!cell.alive)
                continue;
            var intersects = px < cell.x + this.cellWidth &&
                px + pw > cell.x &&
                py < cell.y + this.cellHeight &&
                py + ph > cell.y;
            if (intersects) {
                return cell.x + this.cellWidth / 2;
            }
        }
        return null;
    };
    Shield.prototype.hit = function (px, py, pw, ph) {
        var aliveCells = this.cells.filter(function (c) { return c.alive; });
        for (var _i = 0, aliveCells_1 = aliveCells; _i < aliveCells_1.length; _i++) {
            var cell = aliveCells_1[_i];
            if (!cell.alive)
                continue;
            var intersects = px < cell.x + this.cellWidth &&
                px + pw > cell.x &&
                py < cell.y + this.cellHeight &&
                py + ph > cell.y;
            if (intersects) {
                this.destroyCluster(cell, aliveCells);
                return true;
            }
        }
        return false;
    };
    Shield.prototype.damage = function (px, py, pw, ph, count) {
        var aliveCells = this.cells.filter(function (c) { return c.alive; });
        var victims = [];
        for (var _i = 0, aliveCells_2 = aliveCells; _i < aliveCells_2.length; _i++) {
            var cell = aliveCells_2[_i];
            if (victims.length >= count)
                break;
            var intersects = px < cell.x + this.cellWidth &&
                px + pw > cell.x &&
                py < cell.y + this.cellHeight &&
                py + ph > cell.y;
            if (intersects) {
                victims.push(cell);
            }
        }
        if (victims.length === 0)
            return false;
        for (var _a = 0, victims_1 = victims; _a < victims_1.length; _a++) {
            var victim = victims_1[_a];
            victim.alive = false;
            config_1.Config.context.clearRect(victim.x, victim.y, this.cellWidth, this.cellHeight);
        }
        return true;
    };
    Shield.prototype.destroyCluster = function (center, aliveCells) {
        var _this = this;
        // Remove the hit cell plus the 3 closest neighbors to mimic chunk damage.
        var impactX = center.x + this.cellWidth / 2;
        var impactY = center.y + this.cellHeight / 2;
        var victims = aliveCells
            .filter(function (c) { return c.alive; })
            .sort(function (a, b) {
            var da = Math.hypot(impactX - (a.x + _this.cellWidth / 2), impactY - (a.y + _this.cellHeight / 2));
            var db = Math.hypot(impactX - (b.x + _this.cellWidth / 2), impactY - (b.y + _this.cellHeight / 2));
            return da - db;
        })
            .slice(0, 4);
        for (var _i = 0, victims_2 = victims; _i < victims_2.length; _i++) {
            var victim = victims_2[_i];
            victim.alive = false;
            config_1.Config.context.clearRect(victim.x, victim.y, this.cellWidth, this.cellHeight);
        }
    };
    Object.defineProperty(Shield.prototype, "cellSize", {
        get: function () {
            return { width: this.cellWidth, height: this.cellHeight };
        },
        enumerable: false,
        configurable: true
    });
    return Shield;
}());
var ShieldManager = /** @class */ (function () {
    function ShieldManager() {
        this.shields = [];
        var count = 4;
        var spacing = config_1.Config.canvas.width / (count + 1);
        var y = config_1.Config.canvas.height - config_1.Config.naveHeight * 8;
        // Use a temporary shield to compute shared height for bounds metadata.
        var tempShield = new Shield(0, y);
        this.shieldTop = y;
        this.shieldBottom = y + tempShield.patternHeight * tempShield.cellSize.height;
        this.shields = Array.from({ length: count }, function (_v, i) {
            var x = spacing * (i + 1) - config_1.Config.naveWidth * 1.5;
            return new Shield(x, y);
        });
    }
    ShieldManager.prototype.draw = function () {
        for (var _i = 0, _a = this.shields; _i < _a.length; _i++) {
            var shield = _a[_i];
            shield.draw(config_1.Config.context);
        }
    };
    ShieldManager.prototype.hit = function (px, py, pw, ph) {
        for (var _i = 0, _a = this.shields; _i < _a.length; _i++) {
            var shield = _a[_i];
            if (shield.hit(px, py, pw, ph)) {
                return true;
            }
        }
        return false;
    };
    ShieldManager.prototype.collidesBody = function (px, py, pw, ph) {
        for (var _i = 0, _a = this.shields; _i < _a.length; _i++) {
            var shield = _a[_i];
            var hit = shield.intersects(px, py, pw, ph);
            if (hit !== null)
                return true;
        }
        return false;
    };
    ShieldManager.prototype.getGaps = function () {
        return this.shields.map(function (s) { return s.x + (config_1.Config.enemyWidth * 2); }).sort(function (a, b) { return a - b; });
    };
    ShieldManager.prototype.getTop = function () {
        return this.shieldTop;
    };
    ShieldManager.prototype.getBottom = function () {
        return this.shieldBottom;
    };
    ShieldManager.prototype.getGapCenters = function () {
        return this.shields.map(function (s) { return s.x + (s.patternWidth * s.cellSize.width) / 2; });
    };
    ShieldManager.prototype.damage = function (px, py, pw, ph, count) {
        var damaged = false;
        for (var _i = 0, _a = this.shields; _i < _a.length; _i++) {
            var shield = _a[_i];
            if (shield.damage(px, py, pw, ph, count)) {
                damaged = true;
                break;
            }
        }
        return damaged;
    };
    return ShieldManager;
}());
exports.ShieldManager = ShieldManager;


/***/ }),

/***/ 594:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.services = exports.Tool = void 0;
var config_1 = __webpack_require__(913);
var canvasCleaner_1 = __webpack_require__(639);
var explosionRenderer_1 = __webpack_require__(814);
var hudRenderer_1 = __webpack_require__(688);
var projectileManager_1 = __webpack_require__(75);
var soundManager_1 = __webpack_require__(544);
var Tool = /** @class */ (function () {
    function Tool() {
        this.hudHeight = 28;
        this.projectiles = new projectileManager_1.ProjectileManager();
        this.explosions = new explosionRenderer_1.ExplosionRenderer();
        this.hud = new hudRenderer_1.HudRenderer();
        this.cleaner = new canvasCleaner_1.CanvasCleaner(this.hudHeight);
        this.sound = new soundManager_1.SoundManager();
    }
    Tool.prototype.randomRange = function (min, max) {
        return Math.round((Math.random() * (max - min) + min) / 5) * 5;
    };
    Tool.prototype.paintNave = function (x, y, color) {
        if (color === void 0) { color = "#7fff00"; }
        var ctx = config_1.Config.context;
        var pattern = [
            "     ##     ",
            "    ####    ",
            "    ####    ",
            " ########## ",
            "############",
            "############",
            "############",
            "############",
        ];
        var cols = pattern[0].length;
        var rows = pattern.length;
        // Keep sprite fully inside nave bounding box to avoid overdraw artifacts.
        var pixel = Math.max(2, Math.floor(Math.min(config_1.Config.naveWidth / cols, config_1.Config.naveHeight / rows)));
        var drawWidth = pixel * cols;
        var drawHeight = pixel * rows;
        var offsetX = Math.floor(x + (config_1.Config.naveWidth - drawWidth) / 2);
        var offsetY = Math.floor(y + (config_1.Config.naveHeight - drawHeight) / 2);
        // Clear the bounding box of the nave to avoid trails.
        ctx.clearRect(x - 2, y - 2, config_1.Config.naveWidth + 4, config_1.Config.naveHeight + 4);
        ctx.fillStyle = color;
        for (var row = 0; row < rows; row++) {
            for (var col = 0; col < cols; col++) {
                if (pattern[row][col] !== " ") {
                    ctx.fillRect(offsetX + col * pixel, offsetY + row * pixel, pixel, pixel);
                }
            }
        }
    };
    Tool.prototype.printMessage = function (messageContent) {
        var ctx = config_1.Config.context;
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.65)";
        ctx.fillRect(0, 0, config_1.Config.canvas.width, config_1.Config.canvas.height);
        var x = config_1.Config.canvas.width / 2;
        var y = config_1.Config.canvas.height / 2;
        ctx.font = "30px Courier New";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(messageContent, x, y);
        ctx.restore();
    };
    Tool.prototype.addProjectile = function (projectile) {
        this.projectiles.add(projectile);
    };
    Tool.prototype.forEachProjectile = function (fn) {
        this.projectiles.forEach(fn);
    };
    Tool.prototype.countProjectiles = function (owner) {
        return this.projectiles.count(owner);
    };
    Tool.prototype.removeEnemies = function () {
        this.cleaner.clearEnemiesArea();
    };
    Tool.prototype.drawHud = function (level, score, lives) {
        this.hud.draw(level, score, lives);
    };
    Tool.prototype.clearAll = function () {
        this.cleaner.clearAll();
        this.projectiles.clear();
        this.explosions.clear();
    };
    Tool.prototype.explode = function (x, y, radius, color) {
        if (radius === void 0) { radius = 30; }
        this.explosions.trigger(x, y, radius, color);
        this.sound.playExplosion();
    };
    Tool.prototype.playShoot = function (owner) {
        this.sound.playShoot(owner);
    };
    Tool.prototype.playExplosion = function () {
        this.sound.playExplosion();
    };
    Tool.prototype.playEnemyDestroyed = function () {
        this.sound.playEnemyDestroyed();
    };
    Tool.prototype.playPlayerDestroyed = function () {
        this.sound.playPlayerDestroyed();
    };
    Tool.prototype.playPauseSound = function () {
        this.sound.playPause();
    };
    Tool.prototype.startIntroTheme = function () {
        this.sound.startIntroTheme();
    };
    Tool.prototype.startGameOverTheme = function () {
        this.sound.startGameOverTheme();
    };
    Tool.prototype.stopMusic = function () {
        this.sound.stopMusic();
    };
    Tool.prototype.unlockAudio = function () {
        this.sound.unlock();
    };
    return Tool;
}());
exports.Tool = Tool;
exports.services = new Tool();


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
var exports = __webpack_exports__;
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
var config_1 = __webpack_require__(913);
var enemies_1 = __webpack_require__(749);
var game_1 = __webpack_require__(769);
var nave_1 = __webpack_require__(861);
var tools_1 = __webpack_require__(594);
var gameLoop_1 = __webpack_require__(137);
var collision_1 = __webpack_require__(874);
var background_1 = __webpack_require__(136);
function sizeCanvases() {
    var playfield = document.getElementById("playfield");
    var projectiles = document.getElementById("projectiles");
    var background = document.getElementById("background");
    if (!playfield || !projectiles)
        return;
    var maxWidth = Math.min(480, Math.max(320, window.innerWidth - 20));
    var aspect = 500 / 480; // original canvas aspect after recent change
    var maxHeight = Math.min(640, window.innerHeight - 40);
    var height = Math.min(maxHeight, Math.max(400, Math.round(maxWidth * aspect)));
    playfield.width = maxWidth;
    playfield.height = height;
    projectiles.width = maxWidth;
    projectiles.height = height;
    if (background) {
        background.width = maxWidth;
        background.height = height;
    }
    var gameContainer = document.getElementById("game");
    if (gameContainer) {
        gameContainer.style.width = "".concat(maxWidth, "px");
        gameContainer.style.height = "".concat(height, "px");
    }
}
function attachAudioUnlock() {
    var unlock = function () {
        tools_1.services.unlockAudio();
        tools_1.services.startIntroTheme();
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("touchstart", unlock);
        window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true, passive: true });
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
    window.addEventListener("keydown", unlock, { once: true });
}
window.onload = function () {
    sizeCanvases();
    var backgroundCanvas = document.getElementById("background");
    var background = null;
    if (backgroundCanvas) {
        background = new background_1.BackgroundController(backgroundCanvas, "space");
    }
    config_1.Config.init();
    // Attempt to start audio immediately; fallback unlock remains for browsers that still require gesture.
    tools_1.services.unlockAudio();
    tools_1.services.startIntroTheme();
    attachAudioUnlock();
    var game = new game_1.Game(tools_1.services);
    game.enemies = new enemies_1.Enemies(game, tools_1.services);
    game.nave = new nave_1.Nave(game, tools_1.services);
    var collisions = new collision_1.CollisionSystem(game, tools_1.services);
    var loop = new gameLoop_1.GameLoop();
    loop.start(function (dt) {
        if (background) {
            background.setMode(game.level >= 2 ? "tron" : "space");
        }
        game.update(dt);
        collisions.tick();
    });
    window.addEventListener("resize", function () {
        sizeCanvases();
        if (backgroundCanvas && background) {
            background.resize(backgroundCanvas.width, backgroundCanvas.height);
        }
    });
};

})();

/******/ })()
;