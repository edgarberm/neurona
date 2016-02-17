
'use strict'


/**
* @class
* NeuronaJS is an HTML5 router that focusing on transitions between pages.
* @author: Edgar Bermejo @BuiltByEdgar
* @contributor: Rafa Torres @TorresMalpartida
*
* @license: MIT License
**/

class Neurona {

  /**
   * Constructor
   * @param  {string} root          = Base URL
   * @param  {string} baseTitle     = Base Title
   * @param  {DOMElement} view      = View to load templates
   * @param  {DOMElement} menu      = Main menú
   * @param  {DOMElement} preloader = Preloader
   */
  constructor (root = '/', baseTitle = '', view = '[data-view]', menu = '[data-navigation]', preloader = '[data-preloader]' ) {
    this.root = root
    this.baseTitle = baseTitle
    this.view = document.querySelector( view )
    this.menu = document.querySelector( menu )
    this.preloader = document.querySelector( preloader )

    // Router vars
    this.routes = {}
    this.title = ''
    this.path = ''
    this.params = null

    // Navigation vars
    this.navStack = []
    this.pathStack = []
    this.imgs = []
    this.counter = 0

    // Check config errors
    if (!this.view) throw new Error('Ey! You need a view to load templates.')
    if (!this.preloader) throw new Error('Ey! You need a preloader.')
    if (!this.menu) throw new Error('Ey! You need a navigation menu.')


    // Navigation click events
    this.addClickHandler(this.menu);

    // Window events
    window.addEventListener('load', this._router.bind(this), false)
    window.addEventListener('popstate', this._router.bind(this), false)
  }


  /**
   * Public method to config routes, templates and controllers
   * @param  {string}   pth     URL path
   * @param  {string}   tmpl    HTML template to load
   * @param  {function} ctrl    Method to handle the template
   */
  when (pth, tmpl, ctrl) {
    this.routes[pth] = {template: tmpl, controller: ctrl }
  }


  /**
   * Public method to config routes, templates and controllers
   * @param  {DOMElement}   el  DOM element to add click event
   */
  addClickHandler (el) {
    el.addEventListener('click', this._clickHandler.bind(this), false)
  }


  /**
   * Private method to handle click event
   * @param  {event} event
   */
  _clickHandler (event) {
    let el = event.target
    if (el.nodeName === 'A')
      history.pushState(null, this.title, el.href)

    if (el.nodeName === 'BUTTON')
      history.pushState(null, this.title, el.getAttribute('data-href'))

    this._router()

    return event.preventDefault()
  }


  /**
   * Tracks changes in URL to load the specified template.
   * @param  {event} event
   */
  _router (event) {
    let url = window.location.pathname.replace(this.root, '');
    // override with the new path
    this.path = this.routes[url]

    if (!this.path) {
      this.params = url.match( /\/([^/]*)$/ )[ 1 ]
      let np = url.replace(this.params, ':params')
      this.path = this.routes[np]

      if (!this.path) {
        // TODO: load 404 template
        console.error('404');
      }
    }

    if (this.path.template) {
      // Set page title
      ( url.match( /\/([^/]*)$/ )[ 1 ] === '' )
			? this.title = ''
			: this.title = url.match( /\/([^/]*)$/ )[ 1 ].charAt( 0 ).toUpperCase() + url.match( /\/([^/]*)$/ )[ 1 ].slice( 1 ) + ' | '

      document.title = this.title + this.baseTitle.replace( /\\/g, '' )

      this.preloader.style.display = 'block';

      this._loadTemplate(this.path.template, (xhr) => {
        this._addTemplate(xhr.responseText)
      })
    }
  }


  /**
   * Controlls HTML template load
   * @param  {string}   url
   * @param  {Function} cb
   * @return {Function} callback
   */
  _loadTemplate (url, cb) {
    let xhr
		if (typeof XMLHttpRequest !== 'undefined') {
			xhr = new XMLHttpRequest()
		} else {
			let xmlHttp = ['MSXML2.XmlHttp.5.0',
                     'MSXML2.XmlHttp.4.0',
                     'MSXML2.XmlHttp.3.0',
                     'MSXML2.XmlHttp.2.0',
                     'Microsoft.XmlHttp']

      for (let i = 0, len = xmlHttp.length; i < len; i++) {
      	try {
      		xhr = new ActiveXObject(xmlHttp[i])
      		break
      	} catch (event) {
          // TODO
        }
      }
		}

		xhr.onreadystatechange = ensure

		function ensure () {
			if (xhr.readyState < 4) return
			if (xhr.status !== 200) return
			if (xhr.readyState === 4) cb(xhr)
		}

		xhr.open('GET', url, true)
		xhr.send('')
  }


  /**
   * Adding template
   * @param {string???} template Template to insert into HTML container
   */
  _addTemplate (template) {
    let section = document.createElement('section')
    section.className = 'section'
    section.style.visibility = 'hidden'
    section.innerHTML = template
    this.view.appendChild(section)
    this.navStack.unshift(section)

    if (this.path.controller) {
      // NOTE: hace falta el operador new?
      let ctrl = new this.path.controller(this.params)
      this.pathStack.unshift(ctrl)
    }

    this._preloadImages(section)
  }


  /**
   * Private method to preload imges
   */
  _preloadImages (section) {
    // Preload template background images
    let bg = section.querySelectorAll('[data-image]')
    if (bg.length > 0) {
      for (let i = 0; i < bg.length; i++) {
        let image = new Image()
        image.src = bg[i].getAttribute('data-image')
        this.imgs.push(image)
      }
    }

    // Preload template img images
    let im = section.getElementsByTagName('img')
    if (im.length > 0) {
      for (let i = 0; i < im.length; i++) {
        this.imgs.push(im[i])
      }
    }

    if (this.imgs.length > 0) {
      for (let i = 0; i < this.imgs.length; i++) {
        this.imgs[i].addEventListener('load', this._imageLoaded, false)
      }
    } else {
      this._initTransition()
    }

    return
  }



  /**
   * Private method to handle imges load
   */
  _imageLoaded (event) {
    this.counter ++
    if (this.counter === this.imgs.length)
      this._initTransition()
  }



  /**
   * Private method to initialize transition
   */
  _initTransition () {
    this.preloader.style.display = 'none'
    this.counter = 0
    this.imgs = []

    if (this.navStack.length > 1) this.pathStack[1].transitionOut()

    this.navStack[0].style.visibility = 'visible'
    this.pathStack[0].transitionIn()
  }


  /**
   * Public method to handle transition completed
   * @param  {DOMElement} el Elemento del DOM que se ha animado
   * @return {[type]}    [description]
   */
  transitionComplete () {
    this._removeTemplate()
  }


  /**
   * Private method to remove template
   */
  _removeTemplate () {
    if (this.view.children.length > 1) {
      this.view.removeChild(this.navStack[1])
      this.navStack.pop()
      this.pathStack.pop()
    }
  }
}


export default Neurona
