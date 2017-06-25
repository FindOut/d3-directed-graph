import * as d3 from './d3';
import GraphRenderer from './graph-renderer';

var gr = new GraphRenderer('#graph');
d3.json('model.json', function(error, data) {
  gr.render(data)
});
