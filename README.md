# neurona

NeuronaJS is an HTML5 router that focusing on transitions between pages.


### Docu
https://github.com/umdjs/umd/blob/master/templates


### Import
You can use Neurona in different ways:

```javascript
// ES6 import
import neurona from 'neurona'

// require
var neurona = require('neurona')

```

```html
<!-- Script src -->
<script src="../bin/neurona.js"></script>

```



### Use

```javascript

// Initialize
// To custom options see the constructor method
const neurona = new Neurona('Neurona Test')


// Declare controllers
neurona.when('/', 'views/home.html', () => {
  // Some code here

  /**
   * Transition handler
   */
  return {
    transitionIn = (args) => {

    },
    transitionOut = (args) => {
      // NOTE: you need comunicate to Neurona when transition is complete
      // neurona.transitionComplete()
    }
  }
})


// Controller with parameters
neurona.when('/portfolio/:params', 'views/project-detail.html', (params) => {
  // Some code here
  console.log(params);

  // You can add click event listeres to elements into templates
  neurona.addClickHandler(neurona.view.querySelector('#back'))

  // Transition handler
})


// Controller without controller. yeah!
neurona.when('/portfolio/:params', 'views/project-detail.html')


// Add click events to isolated items
let logo = document.getElementById('logo');
neurona.addClickHandler(logo);


```


### HTML side
```html


```


#### Example

You can see in action [here](http://).
