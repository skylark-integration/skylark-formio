import AllComponents from './components/index';
import Components from './components/Components';
import Formio from './Formio';

Components.setComponents(AllComponents);
Formio.Components = Components;

//export Form from './Form';
//export Utils from './utils';

export { Components, Formio };

