
'use strict';

/**
* @class
* NeuronaJS is an HTML5 router that focusing on transitions between pages.
* @author: Edgar Bermejo @BuiltByEdgar
* @contributor: Rafa Torres @TorresMalpartida
*
* @license: MIT License
**/

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Neurona = function () {

  /**
   * Constructor
   * @param  {string} root          = Base URL
   * @param  {string} baseTitle     = Base Title
   * @param  {DOMElement} view      = View to load templates
   * @param  {DOMElement} menu      = Main menú
   * @param  {DOMElement} preloader = Preloader
   */

  function Neurona() {
    var root = arguments.length <= 0 || arguments[0] === undefined ? '/' : arguments[0];
    var baseTitle = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
    var view = arguments.length <= 2 || arguments[2] === undefined ? '[data-view]' : arguments[2];
    var menu = arguments.length <= 3 || arguments[3] === undefined ? '[data-navigation]' : arguments[3];
    var preloader = arguments.length <= 4 || arguments[4] === undefined ? '[data-preloader]' : arguments[4];

    _classCallCheck(this, Neurona);

    this.root = root;
    this.baseTitle = baseTitle;
    this.view = document.querySelector(view);
    this.menu = document.querySelector(menu);
    this.preloader = document.querySelector(preloader);

    // Router vars
    this.routes = {};
    this.title = '';
    this.path = '';
    this.params = null;

    // Navigation vars
    this.navStack = [];
    this.pathStack = [];
    this.imgs = [];
    this.counter = 0;

    // Check config errors
    if (!this.view) throw new Error('Ey! You need a view to load templates.');
    if (!this.preloader) throw new Error('Ey! You need a preloader.');
    if (!this.menu) throw new Error('Ey! You need a navigation menu.');

    // Navigation click events
    this.addClickHandler(this.menu);

    // Window events
    window.addEventListener('load', this.router.bind(this), false);
    window.addEventListener('popstate', this.router.bind(this), false);
  }

  /**
   * Public method to config routes, templates and controllers
   * @param  {string}   pth     URL path
   * @param  {string}   tmpl    HTML template to load
   * @param  {function} ctrl    Method to handle the template
   */


  _createClass(Neurona, [{
    key: 'when',
    value: function when(pth, tmpl, ctrl) {
      this.routes[pth] = { template: tmpl, controller: ctrl };
    }

    /**
     * Public method to config routes, templates and controllers
     * @param  {DOMElement}   el  DOM element to add click event
     */

  }, {
    key: 'addClickHandler',
    value: function addClickHandler(el) {
      el.addEventListener('click', this.clickHandler.bind(this), false);
    }

    /**
     * Private method to handle click event
     * @param  {event} event
     */

  }, {
    key: 'clickHandler',
    value: function clickHandler(event) {
      var el = event.target;
      if (el.nodeName === 'A') history.pushState(null, this.title, el.href);

      if (el.nodeName === 'BUTTON') history.pushState(null, this.title, el.getAttribute('data-href'));

      this.router();

      return event.preventDefault();
    }

    /**
     * Tracks changes in URL to load the specified template.
     * @param  {event} event
     */

  }, {
    key: 'router',
    value: function router(event) {
      var _this = this;

      var url = window.location.pathname.replace(this.root, '');
      // override with the new path
      this.path = this.routes[url];

      if (!this.path) {
        this.params = url.match(/\/([^/]*)$/)[1];
        var np = url.replace(this.params, ':params');
        this.path = this.routes[np];

        if (!this.path) {
          // TODO: load 404 template
          console.error('404');
        }
      }

      if (this.path.template) {
        // Set page title
        url.match(/\/([^/]*)$/)[1] === '' ? this.title = '' : this.title = url.match(/\/([^/]*)$/)[1].charAt(0).toUpperCase() + url.match(/\/([^/]*)$/)[1].slice(1) + ' | ';

        document.title = this.title + this.baseTitle.replace(/\\/g, '');

        this.preloader.style.display = 'block';

        this.loadTemplate(this.path.template, function (xhr) {
          _this.addTemplate(xhr.responseText);
        });
      }
    }

    /**
     * Controlls HTML template load
     * @param  {string}   url
     * @param  {Function} cb
     * @return {Function} callback
     */

  }, {
    key: 'loadTemplate',
    value: function loadTemplate(url, cb) {
      var xhr = void 0;
      if (typeof XMLHttpRequest !== 'undefined') {
        xhr = new XMLHttpRequest();
      } else {
        var xmlHttp = ['MSXML2.XmlHttp.5.0', 'MSXML2.XmlHttp.4.0', 'MSXML2.XmlHttp.3.0', 'MSXML2.XmlHttp.2.0', 'Microsoft.XmlHttp'];

        for (var i = 0, len = xmlHttp.length; i < len; i++) {
          try {
            xhr = new ActiveXObject(xmlHttp[i]);
            break;
          } catch (event) {
            // TODO
          }
        }
      }

      xhr.onreadystatechange = ensure;

      function ensure() {
        if (xhr.readyState < 4) return;
        if (xhr.status !== 200) return;
        if (xhr.readyState === 4) cb(xhr);
      }

      xhr.open('GET', url, true);
      xhr.send('');
    }

    /**
     * Adding template
     * @param {string???} template Template to insert into HTML container
     */

  }, {
    key: 'addTemplate',
    value: function addTemplate(template) {
      var section = document.createElement('section');
      section.className = 'section';
      section.style.visibility = 'hidden';
      section.innerHTML = template;
      this.view.appendChild(section);
      this.navStack.unshift(section);

      if (this.path.controller) {
        // NOTE: hace falta el operador new?
        var ctrl = new this.path.controller(this.params);
        this.pathStack.unshift(ctrl);
      }

      this.preloadImages(section);
    }

    /**
     * Private method to preload imges
     */

  }, {
    key: 'preloadImages',
    value: function preloadImages(section) {
      // Preload template background images
      var bg = section.querySelectorAll('[data-image]');
      if (bg.length > 0) {
        for (var i = 0; i < bg.length; i++) {
          var image = new Image();
          image.src = bg[i].getAttribute('data-image');
          this.imgs.push(image);
        }
      }

      // Preload template img images
      var im = section.getElementsByTagName('img');
      if (im.length > 0) {
        for (var _i = 0; _i < im.length; _i++) {
          this.imgs.push(im[_i]);
        }
      }

      if (this.imgs.length > 0) {
        for (var _i2 = 0; _i2 < this.imgs.length; _i2++) {
          this.imgs[_i2].addEventListener('load', this.imageLoaded, false);
        }
      } else {
        this.initTransition();
      }

      return;
    }

    /**
     * Private method to handle imges load
     */

  }, {
    key: 'imageLoaded',
    value: function imageLoaded(event) {
      this.counter++;
      if (this.counter === this.imgs.length) this.initTransition();
    }

    /**
     * Private method to initialize transition
     */

  }, {
    key: 'initTransition',
    value: function initTransition() {
      this.preloader.style.display = 'none';
      this.counter = 0;
      this.imgs = [];

      if (this.navStack.length > 1) this.pathStack[1].transitionOut();

      this.navStack[0].style.visibility = 'visible';
      this.pathStack[0].transitionIn();
    }

    /**
     * Public method to handle transition completed
     * @param  {DOMElement} el Elemento del DOM que se ha animado
     * @return {[type]}    [description]
     */

  }, {
    key: 'transitionComplete',
    value: function transitionComplete() {
      this.removeTemplate();
    }

    /**
     * Private method to remove template
     */

  }, {
    key: 'removeTemplate',
    value: function removeTemplate() {
      if (this.view.children.length > 1) {
        this.view.removeChild(this.navStack[1]);
        this.navStack.pop();
        this.pathStack.pop();
      }
    }
  }]);

  return Neurona;
}();

exports.default = Neurona;
