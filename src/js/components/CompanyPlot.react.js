var React = require('react');

var CompanyPlot =
  React.createClass({
    arrayToPolyLine: function(arr) {
      var step = 50;
      var len = arr.length;
      str = "";
      for (var i = 0; i<len; i++){
        str += " " + arr[i] + "," + i*step;
      }
      str += " " + this.props.width + "," + step * (len - 1);
      str += " " + this.props.width + ",0"
      return str;
    },
    convertData: function(data) {
      var normalized = {}
      for(var i in data){
        var obj = data[i].metrics;
        for(var name in obj){
          normalized[name] = normalized[name] || [];
          normalized[name].push(obj[name]);
        }
      }
      // console.log('flipped', normalized);
      return normalized;
    },
    normalizeData: function(data) {
      var width = this.props.width;
      var normalized = {};
      for(var i in data){
        var arr = data[i];
        var sum = _.reduce(arr, function(sum, num) {
          return sum + num;
        });
        normalized[i] = _.map(arr, function(elem) {
          return Math.ceil(elem*width/sum);
        });
      }
      // console.log('pre norm', normalized);
      for(var i in normalized){
        var arr = normalized[i];
        var temp = []
        _.reduce(arr, function(sum, num) {
          // console.log('in reduce', sum, num)
          temp.push(sum);
          return sum+num;
        });
        normalized[i] = temp//_.initial();
      }
      console.log('normalized', normalized);
      return normalized;

    },
    sumsFromData: function(data) {
      var sums = {};
      for(var i in data){
        var arr = data[i];
        var sum = _.reduce(arr, function(sum, num) {
          return sum + num;
        });
        sums[i] = sum;
      }
      console.log('sums', sums)
      return sums;
    },
    unflip: function(data, metrics) {
      if(!metrics) return [];
      var temp = _.zip(_.map(metrics, function(metric) {return data[metric]}));
      // if(!data.test) return [];
      // var temp = _.zip(data.test, data.test1);
      console.log('unflip', temp);
      return temp;
    },
    nextColor: function(i) {
      return ['#4a9f2b','#60AE44','#acdf9a','#d7dfd5'][i%4];
      
    },
    getMetrics: function(data) {
      var keys = _.keys(data);
      if(keys.length && data[keys[0]]){
        return _.keys(data[keys[0]].metrics);
      }

      return false;
    },
    render:function(){
      var step = 50;
      var width = this.props.width;

      var metrics = this.getMetrics(this.props.selected);


      console.log('metrics', metrics);
      if(!metrics){
        return (<span>Выберете хотябы одну компанию</span>)
      }
      var height = step * (metrics.length - 1);


      var flip = this.convertData(this.props.selected);
      var norm = this.normalizeData(flip);
      var sum_obj = this.sumsFromData(flip);
      var arrays = this.unflip(norm, metrics);
      var polygons = arrays.map(function(array, i) {
        // console.log('this.nextColor(i)',this.nextColor(i));
        return (<polygon points={this.arrayToPolyLine(array)} style= {{fill: this.nextColor(i), stroke:'white', strokeWidth: 1}} />);
      }.bind(this));
      var separators = [];
      var sums = [];
      if(arrays[0]){
        for(var i=0; i < arrays[0].length; i++){
          separators.push(<line x1={0} x2={this.props.width} y1={(i * step)-0.5} y2={(i * step)-0.5} style={{stroke: 'rgba(255,255,255,0.5)', strokeWidth: 1}} />)
          
        }
      }
      for(var i =0; i< metrics.length; i++){
        sums.push(<text x={this.props.width + 5} y={(i * step)+12} style={{fill: 'black'}}>{sum_obj[metrics[i]] + " " + metrics[i]}</text>)
      }

      var selected = [];
      for (var key in this.props.selected){
        selected.push(
          <li>{this.props.selected[key].title} + 1</li>
        )
      }
      var last_arr = _.map(arrays, function(item) {return _.last(item)});
      var legend = [];
      console.log('last_arr', last_arr);
      _.reduce(last_arr.concat(width), function(last, num) {
        console.log(last, num);
        legend.push(last + (num-last)/2);
        return num;
      },0);
      console.log(legend, 'legend');
      var i = -1;
      var leg = _.map(this.props.selected, function(data, key) {
        i+=1;
        return (<text x={legend[i] + 5} y={height + 20} style={{fill: 'black'}} textAnchor="end" transform={"rotate(-90 " + (legend[i] + 5) + "," + (height + 20) + ")"}>{data.title}</text>);
      });

      return (
        <svg width={width + 150} height={height + 150 + 150} 
             viewPort={"0 0 " + width + 150 + " " + height + 150} version="1.1"
             xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(10,10)">
            <polygon points={"0,0 0," + height + ", " + width + "," + height + "," + width + ",0"} style={{fill:'#258500'}}/>
            {polygons}
            {separators}
            {sums}
            {leg}
          </g>
        </svg>
      )
    }
  });
module.exports = CompanyPlot;

