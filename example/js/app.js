
/**
 *
 *
 *
 */


// HOME

// Configuramos el directorio raiz
var neurona = new Neurona('lab/neuronajs/example/', 'Neurona JS')


// HOME
neurona.when('/', 'home.html', function () {

	console.log('Home Ctrl');

	return {
		transitionIn : function ( argument ) {
			sectionTransitionIn( neurona.navStack[ 0 ] );
		},
		transitionOut : function ( argument ) {
			sectionTransitionOut( neurona.navStack[ 1 ] );
		}
	}

});



// PORTFOLIO
neurona.when('/portfolio', 'portfolio.html', function () {

	console.log('Portfolio Ctrl');


	// Podemosañadir links desde los controladores
	var l = neurona.view.querySelectorAll('a');
	for (var i = 0; i < l.length; i++) {
		neurona.addClickHandler(l[i]);
	}

	return {
		transitionIn : function ( argument ) {
			sectionTransitionIn( neurona.navStack[ 0 ] );
		},
		transitionOut : function ( argument ) {
			sectionTransitionOut( neurona.navStack[ 1 ] );
		}
	}

});



// BIO
// No es necesario controlador
neurona.when('/bio', 'bio.html', function () {

	console.log('Bio Ctrl');

	return {
		transitionIn : function ( argument ) {
			sectionTransitionIn( neurona.navStack[ 0 ] );
		},
		transitionOut : function ( argument ) {
			sectionTransitionOut( neurona.navStack[ 1 ] );
		}
	}
});



// PROJECT
// Podemos sacar el controlador
neurona.when('/portfolio/:params', 'portfolio/project.html', proyectsCtrl);

function proyectsCtrl (id) {

	console.log('Project Ctrl ID: ' + id);

	// Recuperamos el id
	neurona.view.querySelector('#title').innerText = id.toString();
	// Añadimos links
	neurona.addClickHandler(neurona.view.querySelector('#back'));

	return {
		transitionIn : function ( argument ) {
			sectionTransitionIn( neurona.navStack[ 0 ] );
		},
		transitionOut : function ( argument ) {
			sectionTransitionOut( neurona.navStack[ 1 ] );
		}
	}

}


// TRANSITIONS
function sectionTransitionIn (el) {
	console.log(el);
	TweenMax.to(window, .3, { scrollTo: { y:0 }, ease:Power2.easeInOut })
	TweenMax.from(el , .6, { opacity: 0, ease:Linear.easeNone })
}

function sectionTransitionOut (el) {
	TweenMax.to(el , .6, { opacity: 0, ease:Linear.easeNone, onComplete: neurona.transitionComplete.bind(neurona) })
}
